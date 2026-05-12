# Hoare Logic in Practice: evm-asm

This repo is an unusually hands-on implementation of *separation logic Hoare triples* for real machine code. Here's a guided tour of what you can learn from it, following the layers from the ground up.

---

## 1. What an assertion *is*: partial ownership

Textbook separation logic usually describes assertions as "heap predicates." This repo makes the ownership model concrete. An `Assertion` is a predicate on a `PartialState`:

```lean
-- SepLogic.lean:354
def Assertion := PartialState → Prop
```

A `PartialState` is a partial map over *all machine resources* — registers, memory, code, and the PC. `some v` at a key means "we own this resource and its value is `v`". `none` means "we don't claim it."

```lean
-- SepLogic.lean:27–34
structure PartialState where
  regs : Reg → Option Word
  mem  : Word → Option Word
  code : Word → Option Instr := fun _ => none
  pc   : Option Word
  ...
```

The atomic assertions are just the singleton constructors:

| Notation | Meaning |
|---|---|
| `r ↦ᵣ v` | register `r` owns value `v` |
| `a ↦ₘ v` | memory cell `a` owns value `v` (and `a` is validly aligned) |
| `pcIs v` | PC owns value `v` |
| `regOwn r` | register `r` is owned, value unknown: `∃ v, r ↦ᵣ v` |
| `⌜fact⌝` | pure proposition embedded in the assertion world |

Ownership is *exclusive*: two partial states are `Disjoint` if every resource is owned by at most one of them. The separating conjunction `**` splits the state:

```lean
-- SepLogic.lean:408–409
def sepConj (P Q : Assertion) : Assertion :=
  fun h => ∃ h1 h2, h1.Disjoint h2 ∧ h1.union h2 = h ∧ P h1 ∧ Q h2
```

The bridge back to a full `MachineState` is `holdsFor`: a partial state just needs to be *compatible with* the full state (agree on whatever it claims to own).

```lean
-- SepLogic.lean:426–427
def Assertion.holdsFor (P : Assertion) (s : MachineState) : Prop :=
  ∃ h : PartialState, h.CompatibleWith s ∧ P h
```

**The lesson**: "owning a register" is not magical — it is a concrete, decidable property of a partial map. The existential in `holdsFor` is how "there exist some resources in this machine state that satisfy P" becomes a Lean `Prop`.

---

## 2. The Hoare triple: `cpsTripleWithin`

The project uses *CPS-style* (continuation-passing style) Hoare triples, following Jensen/Benton/Kennedy (PPDP 2013). The type signature encodes four non-obvious decisions at once:

```lean
-- CPSSpec.lean:44–47
def cpsTripleWithin (nSteps : Nat) (entry exit_ : Word) (cr : CodeReq)
    (P Q : Assertion) : Prop :=
  ∀ (R : Assertion), R.pcFree →
  ∀ s, cr.SatisfiedBy s → (P ** R).holdsFor s → s.pc = entry →
    ∃ k, k ≤ nSteps ∧ ∃ s', stepN k s = some s' ∧
      s'.pc = exit_ ∧ (Q ** R).holdsFor s'
```

Reading this aloud: *"for any pcFree frame `R`, for any machine state `s` where the code requirement `cr` is satisfied, `(P ** R)` holds, and the PC is at `entry` — there exists a number of steps `k ≤ nSteps` after which the machine reaches `exit_` with `(Q ** R)` holding."*

**Decision 1 — The frame rule is baked in.** The universal quantification `∀ R, R.pcFree →` means `P` and `Q` describe *only the resources the code touches*. Everything else lives in `R` and is preserved for free. You never write a frame application in a proof — it is structurally impossible to write a spec that forgets the frame.

**Decision 2 — `pcFree` is a guard on `R`.** A frame assertion must not claim the PC, because `entry` and `exit_` are what the triple tracks. `pcFree` is simple:

```lean
-- SepLogic.lean:434
def Assertion.pcFree (P : Assertion) : Prop := ∀ h, P h → h.pc = none
```

Register and memory assertions are always `pcFree`. This is proved once (`pcFree_regIs`, `pcFree_memIs`) and then discharged automatically by the `pcFree` tactic.

**Decision 3 — `CodeReq` is a persistent side condition.** Code memory is not a heap resource that gets consumed. A `CodeReq` maps addresses to required instructions; `cr.SatisfiedBy s` means those instructions are present in `s.code`. It is not part of `P ** R` (not owned), it just needs to be satisfied throughout execution.

**Decision 4 — Step bound `nSteps`.** This gives *total correctness* (the program terminates in at most `nSteps` steps) rather than just partial correctness. Bounds compose additively under sequential composition.

---

## 3. Branch specs: pure facts as postcondition atoms

A conditional branch instruction has *two* exit points. The type `cpsBranchWithin` handles this:

```lean
-- CPSSpec.lean:52–57
def cpsBranchWithin (nSteps : Nat) (entry : Word) (cr : CodeReq) (P : Assertion)
    (exit_t : Word) (Q_t : Assertion)
    (exit_f : Word) (Q_f : Assertion) : Prop :=
  ∀ (R : Assertion), R.pcFree → ∀ s, cr.SatisfiedBy s → (P ** R).holdsFor s → s.pc = entry →
    ∃ k, k ≤ nSteps ∧ ∃ s', stepN k s = some s' ∧
      ((s'.pc = exit_t ∧ (Q_t ** R).holdsFor s') ∨
       (s'.pc = exit_f ∧ (Q_f ** R).holdsFor s'))
```

The key pattern: branch specs *embed the branch condition as a pure fact* `⌜...⌝` in each arm's postcondition. For BEQ:

```lean
-- InstructionSpecs.lean:228–232
theorem beq_spec_within (rs1 rs2 : Reg) (offset : BitVec 13) (v1 v2 : Word) (base : Word) :
    cpsBranchWithin 1 base (CodeReq.singleton base (.BEQ rs1 rs2 offset))
      ((rs1 ↦ᵣ v1) ** (rs2 ↦ᵣ v2))
      (base + signExtend13 offset) ((rs1 ↦ᵣ v1) ** (rs2 ↦ᵣ v2) ** ⌜v1 = v2⌝)
      (base + 4)                   ((rs1 ↦ᵣ v1) ** (rs2 ↦ᵣ v2) ** ⌜v1 ≠ v2⌝)
```

The taken branch's postcondition carries `⌜v1 = v2⌝`; the fall-through carries `⌜v1 ≠ v2⌝`. Downstream proofs extract these pure facts via `sepConj_pure_right` and use them as hypotheses in arithmetic reasoning — no case split on the program counter needed.

---

## 4. The structural rules: where the logic lives

The five most-used rules are in [CPSSpec.lean](EvmAsm/Rv64/CPSSpec.lean):

### Sequential composition

```lean
-- CPSSpec.lean:100–112
theorem cpsTripleWithin_seq
    {nSteps1 nSteps2 : Nat} {l1 l2 l3 : Word} {cr1 cr2 : CodeReq}
    (hd : cr1.Disjoint cr2)
    {P Q R : Assertion}
    (h1 : cpsTripleWithin nSteps1 l1 l2 cr1 P Q)
    (h2 : cpsTripleWithin nSteps2 l2 l3 cr2 Q R) :
    cpsTripleWithin (nSteps1 + nSteps2) l1 l3 (cr1.union cr2) P R
```

`cr1.Disjoint cr2` is the freshness condition: the two code segments must not overlap. The bound adds. The proof wires `h1`'s postcondition as `h2`'s precondition and chains `stepN_add_eq`.

A common variant avoids the disjointness condition when both pieces sit in the same code region:

```lean
-- CPSSpec.lean:134–143
theorem cpsTripleWithin_seq_same_cr
    (h1 : cpsTripleWithin nSteps1 l1 l2 cr P Q)
    (h2 : cpsTripleWithin nSteps2 l2 l3 cr Q R) :
    cpsTripleWithin (nSteps1 + nSteps2) l1 l3 cr P R
```

### Rule of consequence (weaken)

```lean
-- CPSSpec.lean:59–72
theorem cpsTripleWithin_weaken
    (hpre  : ∀ h, P' h → P h)
    (hpost : ∀ h, Q h → Q' h)
    (h : cpsTripleWithin nSteps entry exit_ cr P Q) :
    cpsTripleWithin nSteps entry exit_ cr P' Q'
```

Strengthen the precondition, weaken the postcondition. This is how the pyramid closes: the raw limb postcondition is weakened into the abstract `evmWordIs` form via a permutation lemma.

### Branch elimination (merge)

```lean
-- CPSSpec.lean:309–329
theorem cpsBranchWithin_merge
    (hbr : cpsBranchWithin nSteps1 entry cr1 P l_t Q_t l_f Q_f)
    (h_t : cpsTripleWithin nSteps2 l_t exit_ cr_t Q_t R)
    (h_f : cpsTripleWithin nSteps2 l_f exit_ cr_f Q_f R) :
    cpsTripleWithin (nSteps1 + nSteps2) entry exit_ (cr1.union (cr_t.union cr_f)) P R
```

If both arms of a branch reach the same exit `exit_` with the same postcondition `R`, the branch collapses into a single triple. This is the formal analogue of "if-then-else where both branches produce the same abstract result."

A same-`CodeReq` variant is also provided and used more commonly in practice:

```lean
-- CPSSpec.lean:333–347
theorem cpsBranchWithin_merge_same_cr
    (hbr : cpsBranchWithin nSteps1 entry cr P l_t Q_t l_f Q_f)
    (h_t : cpsTripleWithin nSteps2 l_t exit_ cr Q_t R)
    (h_f : cpsTripleWithin nSteps2 l_f exit_ cr Q_f R) :
    cpsTripleWithin (nSteps1 + nSteps2) entry exit_ cr P R
```

### Skip / reflexivity

```lean
-- CPSSpec.lean:182–188
theorem cpsTripleWithin_refl {addr : Word} {P Q : Assertion}
    (h : ∀ hp, P hp → Q hp) :
    cpsTripleWithin 0 addr addr CodeReq.empty P Q
```

Zero steps, same entry and exit, no code needed. Used at the end of weakening chains where the proof has already massaged the postcondition into the target form.

### Monotonicity in the step bound

```lean
-- CPSSpec.lean:191–198
theorem cpsTripleWithin_mono_nSteps
    (hle : nSteps ≤ nSteps')
    (h : cpsTripleWithin nSteps entry exit_ cr P Q) :
    cpsTripleWithin nSteps' entry exit_ cr P Q
```

If a block runs in `nSteps`, it also runs in any larger bound. This is needed when composing blocks of different sizes — you pad the smaller bound up to match before applying `_seq_same_cr`.

---

## 5. Instruction specs: the leaves of every proof

Each single instruction is a leaf `cpsTripleWithin` (or `cpsBranchWithin`) with step count 1. The pattern for ALU instructions:

```lean
-- InstructionSpecs.lean:28–35
theorem add_spec_within (rd rs1 rs2 : Reg) (v1 v2 vOld : Word) (base : Word)
    (hrd_ne_x0 : rd ≠ .x0) :
    cpsTripleWithin 1 base (base + 4) (CodeReq.singleton base (.ADD rd rs1 rs2))
      ((rs1 ↦ᵣ v1) ** (rs2 ↦ᵣ v2) ** (rd ↦ᵣ vOld))
      ((rs1 ↦ᵣ v1) ** (rs2 ↦ᵣ v2) ** (rd ↦ᵣ (v1 + v2)))
```

Three registers, all distinct, all owned. `rd` starts as `vOld` (the old value is irrelevant to the spec — it just needs to be owned so we know no one else is using it). The postcondition names the precise arithmetic result.

The `hrd_ne_x0` side condition appears because x0 is the zero register — writing to it is a no-op and the spec would be false.

When registers alias (e.g. `ADD rd rd rs2`), a separate lemma handles the overlap:

```lean
-- InstructionSpecs.lean:36–43
theorem add_spec_rd_eq_rs1_within (rd rs2 : Reg) (v1 v2 : Word) (base : Word)
    (hrd_ne_x0 : rd ≠ .x0) :
    cpsTripleWithin 1 base (base + 4) (CodeReq.singleton base (.ADD rd rd rs2))
      ((rd ↦ᵣ v1) ** (rs2 ↦ᵣ v2))
      ((rd ↦ᵣ (v1 + v2)) ** (rs2 ↦ᵣ v2))
```

This is how separation logic handles aliasing: you pick the right lemma shape for the aliasing pattern, rather than carrying an inequality hypothesis everywhere.

---

## 6. Composing specs: `runBlock` does the accounting

In a hand-written proof you would chain `cpsTripleWithin_seq` calls, permuting the separating conjunction at each step to match the next lemma's expected order. The `runBlock` tactic does this automatically. The ADD limb-0 proof:

```lean
-- Add/LimbSpec.lean:34–41
  have L0 := ld_spec_gen_within  .x7 .x12 sp v7 aLimb offA base ...
  have L1 := ld_spec_gen_within  .x6 .x12 sp v6 bLimb offB (base + 4) ...
  have A  := add_spec_gen_rd_eq_rs1_within .x7 .x6 aLimb bLimb (base + 8) ...
  have C  := sltu_spec_gen_within .x5 .x7 .x6 v5 sum bLimb (base + 12) ...
  have S  := sd_spec_gen_within  .x12 .x7 sp sum bLimb offB (base + 16)
  runBlock L0 L1 A C S
```

`runBlock` applies `cpsTripleWithin_seq_perm_same_cr` for each pair, calling `xperm` to permute the heap conjuncts into the shape the next lemma expects. Without it, each composition step would need an explicit `xperm_hyp` and a manual `_seq` application.

---

## 7. The ownership vs. value tension: `regOwn` vs `r ↦ᵣ v`

Some specs don't care about the old register value. The ownership form expresses this:

```lean
-- CPSSpec.lean:250–258
theorem cpsTripleWithin_of_forall_regIs_to_regOwn
    (h : ∀ vOld, cpsTripleWithin nSteps entry exit_ cr (P ** (r ↦ᵣ vOld)) Q) :
    cpsTripleWithin nSteps entry exit_ cr (P ** regOwn r) Q
```

If a spec holds for *every* concrete old value of `r`, it holds when you only know you own `r`. This lets a caller say "I have `r`, I don't know its value" without quantifying over it at the call site.

---

## 8. What this repo adds beyond the textbook

| Textbook SL | This repo |
|---|---|
| Frame rule is a rule of inference | Frame rule is structural in the type (`∀ R`) |
| Code is in the heap | Code is a persistent side condition (`CodeReq`) |
| Partial correctness (`{P} c {Q}`) | Total correctness with step bound (`cpsTripleWithin nSteps`) |
| One exit per triple | Two exits via `cpsBranchWithin`; merge via `cpsBranch_merge` |
| Heap only | Resources = registers + memory + PC + IO streams |
| Assertions are `Prop`-valued on heaps | Assertions are `Prop`-valued on `PartialState`, bridged to concrete machines via `holdsFor` |

The most practically important difference is the step-bounded, two-exit design. RISC-V programs branch constantly. Without `cpsBranchWithin` and `cpsBranch_merge`, every branch instruction would force a case split at the proof level, and the size of the proof tree would double with each branch. The pure-fact embedding (`⌜v1 = v2⌝` in the taken postcondition) lets you carry branch conditions forward as ordinary hypotheses and reason about them with `omega` or `decide`, without ever reconstructing the control flow from the PC value.
