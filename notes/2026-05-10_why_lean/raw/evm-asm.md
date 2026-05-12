# Investigation Report: evm-asm

## Background

- **Repo**: [`Verified-zkEVM/evm-asm`](https://github.com/Verified-zkEVM/evm-asm) — Lean 4 verified macro assembler implementing the Ethereum EVM as RISC-V assembly
- **Organization**: [zkSecurity](https://zksecurity.xyz/), under the Verified-zkEVM grant program. Principal author: Yoichi Hirai (~96% of commits)
- **Language**: Lean 4; target runtime is RV64IM RISC-V (the SP1 zkVM substrate)
- **Timeline**: February 2026 – present (~3 months of active development; ~4,550 commits in May 2026 alone, consistent with the blog's "200–600 commits per day" claim)
- **Goal**: Machine-checked proofs that a RISC-V assembly program correctly implements the Ethereum state transition function (STF), for use as a formally verified zkEVM guest
- **Scale**: 9,904 Lean files, ~1.8M lines; 10 files still carry `sorry`, 27 use `native_decide` (concentrated in RLP round-trip tests and conformance vectors)
- **Inspiration**: Kennedy et al., "Coq: The world's best macro assembler?" PPDP 2013
- **License**: MIT
- **Version investigated**: `b8db01c08fae9bff881e706abc3ef6022f4c3fc1`

---

## Highlight

### The "Final Form" argument — why assembly, why now

The [blog post](https://blog.zksecurity.xyz/posts/end-coding/) argues that RISC-V assembly is the irreducible foundation of all software: every language, compiler, and optimizer eventually produces machine instructions. Verifying at that level sidesteps the entire class of problems that plague higher-level approaches:

- **C/C++**: undefined behavior (overflow, aliasing) dominates the verification burden
- **Rust**: no stable specification; the compiler IS the spec, so you are back to verifying assembly anyway
- **Formally verified compilers** (CompCert): 10–20% overhead, unacceptable for zkVM where proof generation is on the critical path
- **RISC-V**: a clean, minimal ISA with no undefined behavior; every instruction has a precise semantics formalized in the SAIL spec

The upshot: "all of these can be translated into the assembly + Lean paradigm." Because the machine is the canonical reference, a proof about assembly is a proof about *what actually runs*.

In a zkVM context this argument bites even harder. If a zkVM guest program has a bug, the resulting SNARK proof is still valid — it just proves the wrong thing. The cryptographic machinery cannot distinguish a correct proof from a proof of a buggy computation. Formal verification of the guest is the only defense.

---

### The three-level proof pyramid for every opcode

Each EVM opcode is verified bottom-up through three layers. The 256-bit ADD opcode
illustrates the structure:

**Level 1 — per-limb register/memory specs.** Five or eight instructions are grouped into a `cpsTripleWithin` that names every register and memory cell explicitly.

```lean
theorem add_limb0_spec_within (offA offB : BitVec 12)
    (sp aLimb bLimb v7 v6 v5 : Word) (base : Word) :
    let sum   := aLimb + bLimb
    let carry := if BitVec.ult sum bLimb then (1 : Word) else 0
    let cr    := CodeReq.union (CodeReq.singleton base (.LD .x7 .x12 offA)) (...)
    cpsTripleWithin 5 base (base + 20) cr
      ((.x12 ↦ᵣ sp) ** (.x7 ↦ᵣ v7) ** ... ** (memA ↦ₘ aLimb) ** (memB ↦ₘ bLimb))
      ((.x12 ↦ᵣ sp) ** (.x7 ↦ᵣ sum) ** ... ** (memA ↦ₘ aLimb) ** (memB ↦ₘ sum)) := by
  ...
  runBlock L0 L1 A C S
```

> [Add/LimbSpec.lean#L18–L41](EvmAsm/Evm64/Add/LimbSpec.lean#L18-L41)

**Level 2 — full 30-instruction EVM ADD spec.** The four per-limb theorems are composed via `runBlock`, yielding a spec about the complete carry chain on 4 × 64-bit limbs.

**Level 3 — stack-level spec using `evmWordIs`.** The raw limb postcondition is rewritten into `evmWordIs (sp + 32) (a + b)` via a carry-chain correctness lemma, exposing the abstract EVM semantics.

```lean
theorem evm_add_stack_spec_within (sp base : Word) (a b : EvmWord) ... :
    cpsTripleWithin 30 base (base + 120) (evm_add_code base)
      ((.x12 ↦ᵣ sp) ** ... ** evmWordIs sp a ** evmWordIs (sp + 32) b)
      ((.x12 ↦ᵣ (sp + 32)) ** ... ** evmWordIs sp a ** evmWordIs (sp + 32) (a + b))
```

> [Add/Spec.lean#L74–L128](EvmAsm/Evm64/Add/Spec.lean#L74-L128)

This pyramid is replicated for all 52+ opcodes currently implemented (ADD, SUB, MUL, AND/OR/XOR/NOT, SHL/SHR/SAR, LT/GT/SLT/SGT/EQ/ISZERO, BYTE, SIGNEXTEND, DUP1-16, SWAP1-16, POP, PUSH0, …).

---

### The frame rule is free — baked into the triple definition

In textbook separation logic, the frame rule is a separate inference step applied on demand. Here it is built into `cpsTripleWithin` itself:

```lean
def cpsTripleWithin (nSteps : Nat) (entry exit_ : Word) (cr : CodeReq)
    (P Q : Assertion) : Prop :=
  ∀ (R : Assertion), R.pcFree → ∀ s, cr.SatisfiedBy s →
    (P ** R).holdsFor s → s.pc = entry →
    ∃ k, k ≤ nSteps ∧ ∃ s', stepN k s = some s' ∧
      s'.pc = exit_ ∧ (Q ** R).holdsFor s'
```

> [Rv64/CPSSpec.lean#L45–L48](EvmAsm/Rv64/CPSSpec.lean#L45-L48)

`P` and `Q` describe only the resources the code touches. Any unchanged heap, register bank, or code segment — captured in `R` — is automatically preserved. Every instruction spec is stated and proved once; callers never re-prove frame conditions.

The `CodeReq` type plays a dual role: it records which instructions must be present at which addresses, but it is not consumed (it is a persistent side condition, not an affine resource). This makes code-region facts composable without owning code memory.

---

### `runBlock` — the tactic that makes the project viable

Composing 30 instruction-level Hoare triples by hand would generate goals with dozens of heap conjuncts in arbitrary order. The `runBlock` tactic handles this mechanically:

1. It chains the individual `cpsTripleWithin` lemmas sequentially.
2. After each step it uses `xperm` to permute the separation conjunction into the expected order for the next lemma.
3. It extends `CodeReq` unions monotonically so that subsumption goals are discharged automatically.

Without `runBlock`, a proof that would be one line takes 60+ manual steps. The DivMod opcode (316 instructions, 69 sub-lemmas, multiple loop iterations) is only tractable because the tactic handles the combinatorial bookkeeping. The PLAN.md dedicates several paragraphs to managing `maxHeartbeats` when `runBlock` is slow — and the fix is always to restructure the proof, not raise limits.

---

### Knuth's Algorithm D, in a proof assistant

The 256-bit unsigned division (DIV/MOD) is the deepest proof in the repo. The algorithm is Knuth TAOCP Vol. 2 §4.3.1 "Algorithm D" — a 316-instruction RISC-V subroutine. The proof decomposes into:

- **9 semantic foundation files**: `MultiLimb`, `Div128Lemmas`, `MulSubChain`, `Normalization`, `DivBridge`, `DivN4Lemmas`, `CLZLemmas`, `DivAddbackLimb`, `DivRemainderBound` — each formalizing one piece of the mathematical argument
- **Per-n full-path compositions**: 4 values of `n` (number of significant divisor limbs) × shift0 / shift≠0 variants × Bool-parameterized addback paths. Each combination is a separate theorem composing ~1000 instructions.
- **Knuth's Theorem B** (still in progress): the formal proof that the trial quotient overestimates by at most 1 when the divisor is normalized. This is the final blocker before the stack-level `evm_div_stack_spec` can be stated.

The Bool-unification technique collapses exponential path combinations into a single parameterized theorem:

```lean
theorem divK_loop_n3_unified_spec (bltu_1 bltu_0 : Bool) ...
```

instead of four separate `skip/addback × max/call` theorems.

---

### A simulation relation across three models of RISC-V

The project cross-checks its machine semantics at two levels:

1. **Sail bridge** ([`Rv64/SailEquiv/`](EvmAsm/Rv64/SailEquiv/)): a state relation between the project's simplified `MachineState` and the SAIL-generated RV64 formal model (`LeanRV64D`), with instruction-by-instruction equivalence lemmas for the entire RV64IM subset used. Instruction mapping covers ~30 real instruction families; pseudo-instructions (`.MV`, `.LI`, `.NOP`) are intentionally excluded and desugared before bridging.

2. **Interpreter simulation** ([`Evm64/InterpreterSimulation.lean`](EvmAsm/Evm64/InterpreterSimulation.lean)): a `HandlerMatchesSpec` relation between the implementation handler (backed by assembly proofs) and a pure executable-spec handler. `loopFuel_matchesSpec` then lifts per-opcode agreement to full loop equivalence by induction on fuel.

```lean
def HandlerMatchesSpec (impl spec : Handler) : Prop :=
  ∀ (opcode : EvmOpcode) (state : EvmState),
    InterpreterLoop.decodeCurrentOpcode? state = some opcode →
      impl opcode state = spec opcode state
```

> [Evm64/InterpreterSimulation.lean#L19–L22](EvmAsm/Evm64/InterpreterSimulation.lean#L19-L22)

This means "the real loop equals the spec loop for all opcodes and all states" is a single theorem, not a per-case obligation.

---

### The full execution stack is already scaffolded

The PLAN.md describes Phases 7–11 (interpreter, storage, gas, transactions, STF) as future work. The code tells a different story. As of today the repo contains:

- **Interpreter loop**: `InterpreterLoop`, `InterpreterLoopSimulation`, `InterpreterSimulation` — fetch/decode/dispatch with fuel-bounded semantics and a simulation theorem
- **Dispatch**: a jump-table-backed opcode router with entry specs ([`Evm64/Dispatch/`](EvmAsm/Evm64/Dispatch/))
- **Gas metering**: static gas table for Shanghai opcodes, dynamic gas (`MemoryGas`, `LogArgsGas`, `StorageGas`, `ExpGas`) ([`Evm64/Gas.lean`](EvmAsm/Evm64/Gas.lean))
- **EVM state model**: `EvmState` (pc, gas, stack, memory, code, env, status) with `evmStateIs` separation-logic assertion
- **Memory and code region**: byte-addressable EVM memory (`Memory.lean`), EVM bytecode region (`CodeRegion.lean`)
- **Full EL spec layer** ([`EvmAsm/EL/`](EvmAsm/EL/)): pure Lean specs for RLP, transactions, world state, message call, CALL/CREATE/LOG/KECCAK/precompiles — all of the EIP-3155 / execution-specs data structures are modeled
- **Conformance vectors**: 66 checked vectors across calldata, CREATE, EXP gas, KECCAK, LOG, RLP, return data, signed arithmetic, storage, and termination — all passing, enforced as theorems ([`EL/Conformance/All.lean`](EvmAsm/EL/Conformance/All.lean))
- **Precompile bridges**: input/output bridge specs for all 14 EIP-3155 precompiles (ECRECOVER, SHA256, RIPEMD160, BN254-ADD/MUL/PAIR, BLS12 family, BLAKE2f, KZG, secp256r1)

---

### 200–600 AI-generated commits per day — proof acts as a compiler

The development velocity is the direct consequence of the methodology. AI agents (here: Claude) write both the assembly subroutine and its Lean proof in the same session. If the proof fails to type-check, the agent knows the code or the spec is wrong — before any test is run, before any deployment. The proof failure is the bug report.

The blog post describes this as the "co-routine property": the agent writes code, the type checker rejects it, the agent fixes the code. No separate test infrastructure, no CI flakiness, no "it passed locally."

The commit history backs this up: 4,570 commits in the first 11 days of May 2026 alone, almost entirely from one author running AI agents around the clock.

---

### How this differs from current Ethereum client practice

| Dimension | geth / reth / besu | evm-asm |
|---|---|---|
| **Correctness evidence** | Passes ethereum/tests vectors | Machine-checked proof for all inputs |
| **Spec** | EIPs + Yellow Paper (informal) | Lean types + `cpsTripleWithin` + EL pure spec |
| **Bug surface** | Language UB, compiler bugs, missed edge cases | Only: wrong spec, wrong assembly semantics |
| **Coverage** | Test-driven (finite set of vectors) | Universal (∀ register values, ∀ memory layouts) |
| **Undefined behavior** | Possible in unsafe Rust | None — RISC-V semantics are total |
| **Trust base** | Rust compiler + std | Lean kernel (type theory) + Sail RISC-V model |
| **Dev velocity** | PR review + test suite | Proof type-checks or doesn't |

Traditional clients test that "these 10,000 cases produce the right output." This project proves "every possible input produces the right output." For a zkVM the distinction is security-critical: a zk proof that wraps a buggy program proves the bug happened correctly.

---

### Caveats to keep in mind

- **Semantic gap still open for DIV/MOD**: Knuth's Theorem B — the formal proof that the trial quotient overestimates by ≤ 1 — is in progress (`DivN4Overestimate.lean`). The CPS path specs are complete and sorry-free; the final semantic bridge is not.

- **`native_decide` in 27 files**: The `AGENTS.md` policy says "no `native_decide`" for soundness. The 27 files using it are mostly RLP round-trip tests and conformance vector checks — cases where `native_decide` is used for decidable propositions over finite concrete values, not for open-ended mathematical theorems. Still, each use is a minor soundness note.

- **PLAN.md is significantly behind the code**: The plan lists phases 7–11 as future work, but the `Evm64/` and `EL/` directories already contain interpreters, dispatch, handlers, gas, world state, and transaction models. Readers should treat the code as the source of truth.
