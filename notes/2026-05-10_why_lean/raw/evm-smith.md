# EVM-Smith: Formally Verified EVM Bytecode in Lean 4

## Background

- **Repo**: [`evm-smith`](https://github.com/leonardoalt/evm-smith) — Lean 4 framework for writing raw EVM bytecode and proving safety properties directly against the official Ethereum semantics
- **Upstream**: [`leonardoalt/EVMYulLean`](https://github.com/leonardoalt/EVMYulLean) — a mechanical encoding of the Ethereum Yellow Paper in Lean 4; EVM-Smith is a thin layer on top
- **Language**: Lean 4, with Solidity/Vyper comparisons (Foundry test suite)
- **Goal**: Machine-checked proofs of EVM bytecode safety — without a compiler in the trust boundary. Bytecode is written as Lean values, and invariants are proved directly against the `EvmYul.step` semantics
- **Scale**: 13,441 lines of Lean across 38 files; 1,652 lines of Solidity; 4 worked demos (Add3, Register, WETH, ERC-20)
- **Timeline**: April 2026 – present (~6 weeks of active development, rapid ramp from framework skeleton to WETH solvency + ERC-20 refinement)
- **Axioms**: 2 EVM-specific axioms (`precompile_preserves_accountMap`, `lambda_derived_address_ne_C`); 0 `sorry` declarations
- **Investigated Version**: `eac777c`

---

## Highlights

### The bytecode *is* the theorem source

The counter-intuitive inversion at the heart of EVM-Smith: instead of proving "this Solidity source is safe and then trusting the compiler," you write the bytecode directly as a Lean `Program` — a list of `(opcode, optional-immediate)` pairs — and prove properties about it using the official `EvmYul.step` semantics as ground truth.

```lean
-- A Program is just a list of opcode + push-arg pairs.
abbrev Program := List (Operation .EVM × Option (UInt256 × Nat))

def runSeq : Program → EVM.State → Except EVM.ExecutionException EVM.State
  | [], s => .ok s
  | (op, arg) :: rest, s => do
      let s' ← runOp op s arg
      runSeq rest s'
```

> [Framework.lean:87–94](EvmSmith/Framework.lean#L87-L94)

No compiler. No FFI. The bytecode is a first-class Lean value; the proof checker is the auditor.

---

### Per-opcode lemmas as a proof API

Naively proving an 8-opcode program by `unfold EvmYul.step; rfl` times eight deterministically times out — `EvmYul.step` is a 60-branch dependent match, and repeatedly normalising it explodes the kernel's term size. The solution: cache each branch as a named lemma that closes by a single `rfl`.

```lean
lemma runOp_push1
    (s : EVM.State) (v : UInt256) (stk : Stack UInt256) (pc : UInt256) :
    runOp (.Push .PUSH1) { s with stack := stk, pc := pc } (some (v, 1))
      = .ok { s with stack := v :: stk, pc := pc + UInt256.ofNat 2 } := by
  unfold runOp EvmYul.step; rfl

lemma runOp_add
    (s : EVM.State) (a b : UInt256) (rest : Stack UInt256) (pc : UInt256) :
    runOp .ADD { s with stack := a :: b :: rest, pc := pc }
      = .ok { s with stack := (a + b) :: rest, pc := pc + UInt256.ofNat 1 } := by
  unfold runOp EvmYul.step; rfl
```

> [Lemmas.lean:65–78](EvmSmith/Lemmas.lean#L65-L78)

With these in hand, an 8-opcode correctness proof becomes 8 cheap term rewrites (`rw [runOp_push1]`, ...) plus one arithmetic goal. The stack shape is pinned as an explicit cons pattern (`a :: b :: rest`), so every intermediate state is readable.

---

### From 8 opcodes to a theorem: Add3

The Add3 demo is the minimal worked example. The program reads three 32-byte words from calldata at offsets 0, 32, 64 and sums them. The correctness theorem says: for *any* initial state whose `CALLDATALOAD` at those offsets yields `a`, `b`, `c`, the stack top after running the compute prefix is `a + b + c`.

```lean
theorem compute_correct
    (s0 : EVM.State) (a b c : UInt256)
    (h0 : EvmYul.State.calldataload s0.toState (UInt256.ofNat 0)  = a)
    (h1 : EvmYul.State.calldataload s0.toState (UInt256.ofNat 32) = b)
    (h2 : EvmYul.State.calldataload s0.toState (UInt256.ofNat 64) = c) :
    (runSeq Add3.compute s0).map (·.stack.head?)
      = .ok (some (a + b + c)) := by
  -- Eight `have e_i` using runOp_* lemmas, then chain via runSeq_cons_ok.
```

> [Add3/Proofs.lean:44–51](EvmSmith/Demos/Add3/Proofs.lean#L44-L51)

The proof is fully symbolic: `a`, `b`, `c` are universally quantified `UInt256` values, so the theorem holds for all `2^256³` possible input combinations simultaneously. No fuzzing, no testing, no sampling.

**Counter-intuitive detail:** the proof cannot conclude `H_return = (a+b+c).toByteArray` — the FFI round-trip for `MSTORE` → `RETURN` routes through an `opaque` declaration in EVMYulLean, which is irreducible by design. Formal proofs stop at the arithmetic claim on the stack; end-to-end byte-level correctness requires a separate FFI axiom.

---

### Cross-transaction balance monotonicity from 20 bytes of bytecode

The Register demo is a 20-byte contract: store a calldata value in `storage[msg.sender]`, then `CALL msg.sender` with value 0. The headline theorem proves that Register's ETH balance is **monotonically non-decreasing across any Ethereum transaction** — including arbitrary reentrancy through the outbound `CALL`.

```lean
theorem register_balance_mono
    (fuel : ℕ) (σ : AccountMap .EVM) (H_f : ℕ)
    (H H_gen : BlockHeader) (blocks : ProcessedBlocks)
    (tx : Transaction) (S_T C : AccountAddress) (b₀ : ℕ)
    (hWF : StateWF σ)           -- well-formed pre-state
    (hInv : RegInv σ C b₀)      -- C's balance = b₀ and bytecode is installed
    (hS_T : C ≠ S_T)            -- Register is not the tx sender
    (hBen : C ≠ H.beneficiary)  -- Register is not the block miner
    (hValid : TxValid σ S_T tx H H_f)
    (hDeployed : DeployedAtC C)
    (hSDExcl : RegSDExclusion …) (hDeadAtσP : RegDeadAtσP …) :
    match EVM.Υ fuel σ H_f H H_gen blocks tx S_T with
    | .ok (σ', _, _, _) => b₀ ≤ balanceOf σ' C
    | .error _ => True :=
  Υ_balanceOf_ge … (bytecodePreservesBalance C hDeployed) …
```

> [Register/BalanceMono.lean:374–394](EvmSmith/Demos/Register/BalanceMono.lean#L374-L394)

The key proof step is `bytecodePreservesBalance C hDeployed`: given that Register's bytecode is installed at `C`, it follows that no Ξ-frame at `C` decreases the balance — because the bytecode's only CALL has value 0 hardcoded. This per-bytecode fact is then plugged into `Υ_balanceOf_ge`, the Frame library's transaction-level monotonicity theorem, which handles the entire call tree including reentrancy, CREATE, SELFDESTRUCT, and gas accounting.

The counter-intuitive moment: the hardest part of this proof is not the bytecode — it is threading the invariant through Ethereum's full transaction driver (`Υ`), which sweeps through refunds, miner credits, SELFDESTRUCT sets, and dead-account cleanup after the call returns.

---

### WETH solvency: `storageSum ≤ balanceOf` across any transaction

The WETH demo proves the solvency invariant for a Wrapped-ETH contract: the sum of all user token balances in storage is always at most the contract's ETH balance. The invariant statement is clean:

```lean
def WethInv (σ : AccountMap .EVM) (C : AccountAddress) : Prop :=
  storageSum σ C ≤ balanceOf σ C
```

> [Weth/Invariant.lean:46–47](EvmSmith/Demos/Weth/Invariant.lean#L46-L47)

The top-level theorem mirrors Register's pattern:

```lean
theorem weth_solvency_invariant
    …
    (hInv : WethInv σ C) (hAssumptions : WethAssumptions …) :
    match EVM.Υ fuel σ H_f H H_gen blocks tx S_T with
    | .ok (σ', _, _, _) => WethInv σ' C
    | .error _ => True
```

> [Weth/Solvency.lean:338–350](EvmSmith/Demos/Weth/Solvency.lean#L338-L350)

Getting there required 11,332 lines of proof in [BytecodeFrame.lean](EvmSmith/Demos/Weth/BytecodeFrame.lean) and [InvariantClosure.lean](EvmSmith/Demos/Weth/InvariantClosure.lean). The key intermediate artifact is `WethTrace`, a 64-disjunct predicate enumerating every reachable `(pc, stack-shape, storage-facts, invariant-slack)` combination. Each disjunct threads the slack `balanceOf σ C − storageSum σ C` through SSTORE and CALL transitions so neither operation can create insolvency:

- Deposit: SSTORE writes `storage[sender] += msg.value`; ETH balance increases by `msg.value` at the same step. Net change to slack: 0.
- Withdraw: SSTORE writes `storage[sender] -= x` first; CALL sends `x` ETH out second. The slack absorbed at SSTORE is exactly consumed by the CALL. Net change: 0.

The per-PC cascade theorems (`weth_pc40_cascade`, `weth_pc60_cascade`, `weth_pc72_cascade`) were originally opaque hypotheses. They are now fully discharged as in-Lean theorems, with zero sorries.

---

### Type system as optimization validator

The ERC-20 demo investigates a storage-layout optimization: instead of `storage[keccak256(addr ++ slot_id)]` for per-user balances (Solidity's default), use `storage[~addr]` (bitwise NOT of the address). This saves roughly 8 opcodes per balance read/write.

The framework forces proof of two obligations before the optimization is usable:

```lean
structure SlotAbstraction where
  ValidAddr : UInt256 → Prop      -- which inputs are "addresses"
  NamedSlot : UInt256 → Prop      -- which slots hold metadata (name, symbol, totalSupply)
  slotFn    : UInt256 → UInt256
  inj       : ∀ a b, ValidAddr a → ValidAddr b →
              slotFn a = slotFn b → a = b     -- distinct addresses → distinct slots
  disjoint  : ∀ a, ValidAddr a → ¬ NamedSlot (slotFn a)  -- no balance aliases metadata
```

> [ERC20/Spec.lean:84–102](EvmSmith/Demos/ERC20/Spec.lean#L84-L102)

Without `inj`, a `mint(addr)` could silently update a different user's balance. Without `disjoint`, it could overwrite the contract's `_name` or `_totalSupply`. A slot function that fails either obligation **cannot be instantiated as a `SlotAbstraction`** — the proof fields can't be discharged. The type system rejects the bug at definition time.

The `lnot` optimization passes both checks:

```lean
def lnotSlotAbstraction : SlotAbstraction where
  ValidAddr := IsValidAddress          -- 160-bit addresses
  NamedSlot := IsSoladyNamedSlot       -- {0, 1, 2, _TOTAL_SUPPLY_SLOT}
  slotFn    := UInt256.lnot
  inj       := lnot_injective_on_valid -- ✓ lnot is injective (no axioms)
  disjoint  := lnot_disjoint_from_named -- ✓ lnot(addr) ≥ 2^256 - 2^160, above all named slots
```

> [ERC20/Spec.lean:327–332](EvmSmith/Demos/ERC20/Spec.lean#L327-L332)

The naïve `id` optimization (the original bug) is silently rejected: `id 0 = 0`, and `0` is a named slot, so `disjoint` cannot be proved. The structure cannot be instantiated.

```lean
-- Attempted idSlotAbstraction — does NOT type-check:
--   slotFn    := id
--   disjoint  := -- ✗ id 0 = 0 ∈ named; no proof exists
```

> [ERC20/Spec.lean:338–345](EvmSmith/Demos/ERC20/Spec.lean#L338-L345)

---

### Two axioms, zero sorries, one trust boundary

The entire codebase rests on two EVM-specific axioms beyond Lean's standard foundations:

| Axiom | Informal statement | Status |
|---|---|---|
| `precompile_preserves_accountMap` | No precompile modifies the account map arbitrarily | Provable by case inspection across 10 precompiles; deferred |
| `lambda_derived_address_ne_C` | CREATE/CREATE2 never derives a pre-existing address `C` | Equivalent to Keccak-256 collision resistance |

> [AXIOMS.md](AXIOMS.md)

No `sorry` declarations anywhere. The Frame library (`Υ_balanceOf_ge`, `Υ_invariant_preserved`, `ΞPreservesAtC`) is upstream in EVMYulLean and fully checked. Any reader with Lean 4 installed can run `lake build` and watch the kernel verify every proof independently.

---

### Caveats

The ERC-20 proofs are peephole-local: they verify that a 10-opcode keccak prefix and a 2-opcode `[NOT, SLOAD]` produce observationally equivalent results for the same address, under the refinement relation. They do **not** prove that the actual Solidity/Vyper-compiled bytecode matches the hand-rolled sequences — that correspondence is verified by disassembly, not by proof. A full end-to-end proof would require bridging `Function.update`-based abstract storage to `EvmYul.State.sload`/`sstore`, which is scaffolded but not yet complete.

The structural hypotheses in `WethAssumptions` and `RegSDExclusion` — deployment pinning, SELFDESTRUCT exclusion, `σ_P` invariant preservation — are explicit preconditions that a deployer must discharge against the actual chain state. The proofs are conditional, not unconditional. That conditionality is the honest price of staying within a tractable trust boundary.
