# Formal Verification of ZK Circuits with `clean`

> **Note**: This is a case study. Readers are assumed familiar with Lean 4 basics (monads, type classes, `simp` tactics, the `structure`/`theorem` distinction).

## Background

### Repo and Authors

| | |
|---|---|
| **Repo** | [github.com/Verified-zkEVM/clean](https://github.com/Verified-zkEVM/clean) |
| **Organization** | [zkSecurity](https://zksecurity.xyz/), under the Verified-zkEVM grant program |
| **License** | Apache 2.0 (Circomlib port: LGPL) |
| **Language** | Lean 4, with a Rust backend (Plonky3) |
| **Blog post** | [blog.zksecurity.xyz/posts/clean](https://blog.zksecurity.xyz/posts/clean) |

The project is open to external contributors; the GitHub issue tracker carries several "good first issue" tickets for gadget additions and proof automation improvements.

### Rough Timeline

The commit history spans July 2024 to the present (~22 months of active development), with a steep ramp-up in 2025.

| Period | What happened |
|---|---|
| **Jul–Sep 2024** | Project bootstrapped. Prime field arithmetic, basic `Circuit` monad, first field-element theorems. |
| **Oct–Nov 2024** | First AIR table experiments; `FormalCircuit` concept sketched; equality and lookup gadgets added. |
| **Dec 2024** | Subcircuit mechanism landed. `FormalCircuit` definition stabilised with bundled soundness/completeness proofs. First formal proofs for 8-bit adder. |
| **Jan–Feb 2025** | Significant proof automation work; `ProvableType`/`ProvableStruct` deriving mechanism. |
| **Mar–Apr 2025** | Keccak permutation circuits started. `ElaboratedCircuit` typeclass introduced to decouple circuit shape from proof. |
| **May–Jun 2025** | Keccak proofs completed. Blake3 circuits started. **Plonky3 backend added** (Jun 2025). Circomlib port scaffolded. |
| **Jul–Aug 2025** | Blake3 compression + chunk processing formally verified. Circomlib ports accelerating (Mux, BinSum, BinSub, comparators, Sign). `GeneralFormalCircuit` introduced for asymmetric soundness/completeness assumptions. |
| **Sep–Dec 2025** | FemtoCairo (a minimal Cairo-like VM) circuits and completeness proofs. More Circomlib components. Poseidon work begins. |
| **Jan–Feb 2026** | **Channel mechanism** introduced for inter-circuit communication (logup-style multiset arguments). Plonky3 integration tests wired to CI. |
| **Mar–May 2026** | Ordered channels, channel soundness infrastructure. Poseidon formally verified. Ongoing refactor to make channels first-class in `GeneralFormalCircuit`. |

Commit volume peaked in mid-2025 (800+ commits in July 2025 alone) and has settled into a steady ~200/month cadence.

### Code Volume

```
Clean/ (Lean source only)
───────────────────────────────────────────────────────
 Files      153
 Blank     4,997
 Comments  5,307
 Code     26,404
───────────────────────────────────────────────────────

Breakdown by subdirectory (lines of code):
 Clean/Circuit      5,541   core DSL, monad, FormalCircuit definitions
 Clean/Utils        4,839   tactics, ProvableStruct deriving, vector lemmas
 Clean/Gadgets      4,266   hash gadgets (BLAKE3, Keccak), arithmetic, bitwise
 Clean/Circomlib    3,791   formal ports of the circomlib component library
 Clean/Air          2,230   AIR table layer (ensemble, VM-style circuits)
 Clean/Specs        2,093   pure Lean specs (BLAKE3, Keccak, Poseidon)
 Clean/Examples     1,483   worked examples and trace generation
 Clean/Table          862   table abstraction and witness generation
 Clean/Tables         764   concrete tables (Fibonacci, Keccak, BLAKE3)
 Clean/Types          522   U32, U64, Byte domain types

backends/plonky3/ (Rust)
───────────────────────────────────────────────────────
 Files       12
 Code      1,791
───────────────────────────────────────────────────────
```

One striking ratio: comments (5,307) nearly equal blank lines (4,997), and code is 26,404 lines. A substantial fraction of the "comment" lines are embedded Circom source originals kept alongside their Lean translations — a deliberate traceability choice rather than ordinary documentation.

### The Problem Being Solved

ZK circuits are systems of polynomial equations over a large finite field `F_p`. Correctness is subtle in ways that defeat ordinary testing:

- **Field size**: BN254's prime is ~254 bits — `2^254` possible inputs. No test suite covers that space.
- **Under-constrained circuits**: A circuit that passes all test inputs but allows a cheating prover to fabricate a valid proof for a false statement. The classic case is a missing constraint in `IsZero`.
- **Over-constrained circuits**: A circuit that rejects valid witnesses — correct inputs fail to produce a proof, invisible in testing unless you specifically probe edge cases.
- **Field wrap-around bugs**: Arithmetic that looks correct for small values but misbehaves near `p`, where `x + y` silently wraps back to a small number.
- **Composition gaps**: Two components that individually verify correctly but whose interaction introduces a constraint gap.

`clean` requires machine-checked proofs alongside every circuit definition. Lean's kernel — a small, independently audited core — checks those proofs against every possible field element and every possible adversarial witness assignment, not just the ones you tested.

---

## The Good

### Circuits as a Verified Monad

The circuit representation is a writer/state monad that accumulates `Operation F` objects while tracking the next variable index:

```lean
def Circuit (F : Type) [Field F] (α : Type) := ℕ → α × List (Operation F)
```

> [Basic.lean#L28](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circuit/Basic.lean#L28)

You write circuits with `do`-notation — the same surface syntax a Circom developer would recognise, but with a proof obligation attached:

```lean
-- Circom original (embedded as a comment):
-- inv <-- in!=0 ? 1/in : 0;
-- out <== -in*inv +1;
-- in*out === 0;

def main (input : Expression (F p)) := do
  let inv ← witness fun env =>
    let x := input.eval env
    if x ≠ 0 then x⁻¹ else 0
  let out <== -input * inv + 1
  input * out === 0
  return out
```

> [Comparators.lean#L28–L35](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circomlib/Comparators.lean#L28-L35)

### `FormalCircuit` — Proof Is Part of the Type

A `FormalCircuit` bundles the circuit with machine-checked soundness and completeness proofs:

```lean
structure FormalCircuit (F : Type) [Field F] (Input Output : TypeMap) where
  main        : Var Input F → Circuit F (Var Output F)
  Assumptions : Input F → Prop
  Spec        : Input F → Output F → Prop
  soundness   : Soundness F ...
  completeness : Completeness F ...
```

> [Basic.lean#L298–L303](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circuit/Basic.lean#L298-L303)

**Soundness** (the anti-cheat guarantee) is universally quantified over *all* environments, including adversarial ones:

```lean
def Soundness (F : Type) [Field F] (circuit : ElaboratedCircuit F Input Output)
    (Assumptions : Input F → Prop) (Spec : Input F → Output F → Prop) :=
  ∀ offset : ℕ, ∀ env : Environment F,
  ∀ input_var : Var Input F, ∀ input : Input F, eval env input_var = input →
  Assumptions input →
  ConstraintsHold.Soundness env (circuit.main input_var |>.operations offset) →
  let output := eval env (circuit.output input_var offset)
  Spec input output ∧ Operations.Requirements env (circuit.main input_var |>.operations offset)
```

> [Basic.lean#L259–L271](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circuit/Basic.lean#L259-L271)

The `∀ env : Environment F` quantifier is everything. It means: no matter what witnesses the prover supplies, if the constraints hold, the spec holds. This is a statement about **all possible adversaries**, not just the honest prover you tested with.

### The Simplest Gadget: `assertBool`

The boolean constraint `x * (x - 1) = 0` is proven equivalent to `x = 0 ∨ x = 1` via a Mathlib lemma:

```lean
theorem iff_mul_sub_one {α : Type*} [Ring α] [NoZeroDivisors α] {x : α} :
    IsBool x ↔ x * (x - 1) = 0

def assertBool : FormalAssertion (F p) field where
  main (x : Expression (F p)) := assertZero (x * (x - 1))
  Spec (x : F p) := IsBool x
  soundness   := by circuit_proof_all [IsBool.iff_mul_sub_one, sub_eq_add_neg]
  completeness := by circuit_proof_all [IsBool.iff_mul_sub_one, sub_eq_add_neg]
```

> [Boolean.lean#L29](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Gadgets/Boolean.lean#L29), [Boolean.lean#L201–L208](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Gadgets/Boolean.lean#L201-L208)

The `NoZeroDivisors` constraint is load-bearing: it's what makes the field guarantee `x = 0 ∨ x - 1 = 0` from a zero product, rather than some combination of non-zero factors that could multiply to zero over a composite ring. Lean's type system enforces that this assumption is in scope.

### Field Wrap-Around Proofs

The `ByteDecomposition` gadget explicitly handles field overflow — a class of bug that testing almost never catches:

```lean
have : (2^n * x).val = 2^n * x.val := by
  rw [ZMod.val_mul_of_lt (by linarith), h_mul_x]
```

> [ByteDecomposition.lean#L77](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Gadgets/ByteDecomposition/ByteDecomposition.lean#L77)

The circuit requires `p_large_enough : Fact (p > 2^16 + 2^8)` in scope — enforced at the type level. Without that assumption, `ZMod.val_mul_of_lt` doesn't apply and the proof term literally fails to compile. You cannot accidentally use `ByteDecomposition` with a too-small prime.

### Modular Composition with Proof Inheritance

Subcircuits compose with proof reuse. `IsEqual` calls `IsZero` as a subcircuit — the parent proof just invokes the child's proven spec as a black box:

```lean
-- IsEqual implementation:
def main (input : Expression (F p) × Expression (F p)) := do
  let diff := input.1 - input.2
  let out ← IsZero.circuit diff    -- IsZero.circuit : FormalCircuit, used like a function
  return out

-- Soundness proof only needs to invoke IsZero's spec, not re-examine its internals:
soundness := by
  circuit_proof_start [IsZero.circuit]
  rw [← h_input]
  ...
```

> [Comparators.lean#L83–L109](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circomlib/Comparators.lean#L83-L109)

Once a component is formally verified, it is treated as a trusted black box everywhere it is used. Re-auditing is not needed.

### The `GeneralFormalCircuit` Solves a Subtle Asymmetry

`toBits n` simultaneously range-checks its input *and* computes the bit decomposition. The range assumption is needed for completeness (honest prover must supply a valid input) but not for soundness (the circuit adds that constraint itself). Coupling these into a single `FormalCircuit` would force the range assumption into soundness, making `toBits` unusable as a standalone range check.

`GeneralFormalCircuit` decouples them:

```lean
structure GeneralFormalCircuit ... where
  Assumptions     : Input F → ProverData F → Prop          -- for soundness
  Spec            : Input F → Output F → ProverData F → Prop
  ProverAssumptions : Input F → ProverData F → ProverHint F → Prop  -- for completeness
  ProverSpec      : Input F → Output F → ProverHint F → Prop
  soundness   : GeneralFormalCircuit.Soundness F elaborated Assumptions Spec
  completeness : GeneralFormalCircuit.Completeness F elaborated ProverAssumptions ProverSpec
```

> [Basic.lean#L415–L428](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circuit/Basic.lean#L415-L428)

### `Foundations.lean` — Self-Checking the Proof Framework

A dedicated file proves that the modified `ConstraintsHold` used for proof ergonomics is not accidentally weaker than the original definition. If you delete a constraint, the framework doesn't silently paper over it:

```lean
theorem FormalCircuit.original_soundness (circuit : FormalCircuit F β α) :
    ∀ offset env b_var b, eval env b_var = b → circuit.Assumptions b →
    Operations.ConstraintsHold env (circuit.main b_var |>.operations offset) →
    Operations.FullGuarantees env (circuit.main b_var |>.operations offset) →
    let a := eval env (circuit.output b_var offset)
    circuit.Spec b a ∧ Operations.FullRequirements env ...
```

> [Foundations.lean#L72–L88](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circuit/Foundations.lean#L72-L88)

---

## The Bad

### The Trusted Gap at the Backend Boundary

The formal proofs cover the abstract `Operations F` list inside Lean. Getting those constraints into an actual proving backend requires two unverified steps:

**1. JSON serialization** strips the witness generators (the `compute` lambda is dropped) and flattens subcircuit structure into a flat list:

```lean
instance : ToJson (FlatOperation F) where
  toJson
    | .witness m _ => Json.mkObj [("witness", toJson m)]   -- compute is DROPPED
    | .assert e    => Json.mkObj [("assert", toJson e)]
    | .lookup l    => Json.mkObj [("lookup", toJson l)]
```

> [Json.lean#L49–L54](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circuit/Json.lean#L49-L54)

No theorem in the codebase states that `toJson` faithfully serializes an `Operation F`. It's an ordinary function with no proof attached.

**2. Rust backend re-interpretation** reads the JSON and calls `builder.assert_zero(...)` on Plonky3's `AirBuilder`. The expression lowering is unverified Rust:

```rust
pub fn lower_expr<AB: AirBuilder>(expr: &ExprNode, ...) -> AB::Expr {
    match expr {
        ExprNode::Add { lhs, rhs } =>
            Self::lower_expr(lhs, ..) + Self::lower_expr(rhs, ..),
        ExprNode::Mul { lhs, rhs } =>
            Self::lower_expr(lhs, ..) * Self::lower_expr(rhs, ..),
        ...
    }
}
```

> [clean_ast.rs#L139–L160](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/backends/plonky3/src/clean_ast.rs#L139-L160)

No proof that `lower_expr` is semantically equivalent to Lean's `Expression.eval`. The `AssertOp` handler panics on unsupported operation types at runtime rather than failing at compile/verify time.

**The trusted computing base (TCB) summary:**

| Layer | Verified? |
|---|---|
| Lean kernel (type checker) | Yes — small, independently audited |
| `ConstraintsHold` semantics | Yes — machine-checked |
| `FormalCircuit.soundness / completeness` | Yes — machine-checked |
| `Foundations.lean` re-derivation | Yes — extra self-check |
| `toJson` serialization | **No** |
| Rust backend AST interpretation | **No** |
| Plonky3 proof system soundness | **No** |

The proofs guarantee that the abstract polynomial system correctly implements the spec. They do not guarantee that the bitstring submitted to the verifier is the same constraint system.

### Proof Automation is Still Incomplete

The `circuit_proof_start` tactic greatly simplifies proof setup, but complex gadgets (like `LessThan`) still require substantial manual case analysis:

```lean
by_cases hlt : ZMod.val input.1 < ZMod.val input.2
-- CASE input.1 < input.2
...
have hdiff_lt : ZMod.val (input.1 + 2^n - input.2) < 2^n := by
  rw [ZMod.val_sub]
  · rw [ZMod.val_add_of_lt]
    ...
-- CASE input.1 >= input.2
...
```

> [Comparators.lean#L248–L347](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circomlib/Comparators.lean#L248-L347)

The proofs are correct, but writing them requires significant Lean/Mathlib expertise. The roadmap lists proof automation improvements as ongoing work.

---

## The Ugly

### `circuit_proof_start` Exposes Internals That Shouldn't Need Exposing

The tactic unfolds the circuit monad's bind/pure definitions and leaves the goal in terms of raw environment lookups (`env.get (i₀ + 1)`, etc.). Proofs routinely need to navigate variable offset arithmetic — things like `i₀ + n + 1` for the output of a subcircuit — which is mechanical but error-prone:

```lean
set out := env.get (i₀ + n + 1) with hout
rw [add_assoc] at hout
rw [← hout] at h3
```

> [Comparators.lean#L236–L238](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/Clean/Circomlib/Comparators.lean#L236-L238)

Offset arithmetic leaking into application-level proofs is a sign that the abstraction boundary is not yet fully sealed.

### Witness Generators Are Erased at the Boundary

The `Operation.witness` variant carries both a count and a `compute` function:

```lean
| .witness m _ => Json.mkObj [("witness", toJson m)]
```

The underscore discards `compute` entirely on serialization. The backend must re-implement witness generation logic independently (or leave it to the user), with no proof tying the backend's witness generation to the one encoded in the Lean circuit. This means completeness proofs — which do reason about `compute` — have no backend counterpart.

### The AIR Backend Is Still Early-Stage

The `AssertOp` handler in the Rust backend panics on unknown operation types rather than returning a typed error:

```rust
_ => panic!("Unsupported operation type: {}", assert_op.op_type),
```

> [clean_ast.rs#L178](https://github.com/Verified-zkEVM/clean/blob/07d546bb929144d2da3bb88e53a20144238ec4ba/backends/plonky3/src/clean_ast.rs#L178)

The `BoundaryRow` deserializer similarly panics on unexpected values. For a project whose core claim is eliminating runtime surprises through compile-time proof, runtime panics in the trusted path are incongruous.

---

## Summary

`clean` makes a meaningful advance: the mathematical content of a ZK circuit — the polynomial constraint system and its equivalence to a high-level spec — can be machine-checked in full generality, over all field elements and all adversarial witnesses. For the circomlib ports alone, this catches entire classes of bugs (missing constraints, field overflow, range-check gaps) that auditors routinely miss.

The fundamental limitation is the extraction gap. The proofs live in Lean's universe; the proof backend lives in Rust and receives a JSON blob. There is no verified bridge. Until the serialization and backend interpretation are either formally verified or replaced by a compilation step that preserves the Lean semantics, the TCB includes a substantial amount of unverified code between the proof and the actual constraint evaluation.

This is a known open problem in verified cryptography broadly, not unique to `clean`. The roadmap acknowledges it. For now, `clean`-verified circuits should be understood as: *the constraint system, as a mathematical object, is correct* — a much stronger statement than testing can provide, but not yet a statement about the bits on the wire.
