---
marp: true
theme: notes
paginate: true
---

<!-- _class: title-slide -->

# Why Lean?

**Formal proofs in the age of AI coding**

2026-05-10 CC

---

## Agenda

1. **The threat** — AI finds bugs fast, AI writes code fast
2. **What is Lean 4?** — correctness proven, not tested
3. **My experience** — Arrow's Impossibility Theorem
4. **Case studies** — lean-zip and clean
5. **What comes next** — vericoding and the new division of labor

---

<!-- _class: centered -->

## The old workflow is breaking

---

## AI finds bugs cheaply

- Tools like Mythos scan codebases in minutes, not weeks
- Attack / defense asymmetry is tilting toward attackers
- A codebase a team spent months writing can be audited for vulnerabilities in hours

> The cost of finding bugs is collapsing. The cost of shipping bugs is not.

---

## AI writes code fast

- Agents produce pull requests faster than humans can review them
- 20 agents running in parallel is not a fantasy anymore
- **But who guarantees what they wrote is correct?**

"Trust me bro, the AI wrote it" is not a security model.

---

## Something has to change

The old answer: write tests, ship, pray.

Tests only check the cases you thought of.

**What if you could prove correctness for every possible input?**

---

## What is Lean 4?

A programming language where correctness is *proven*, not tested.

- Types are propositions
- Programs are proofs
- The compiler checks both at once

If it compiles, it's correct — by construction.

---

## The chess board feeling

Lean is like playing chess against math.

- You have a **goal** (the theorem to prove)
- You have a **toolbox** (lemmas from Mathlib)
- Each tactic moves the goal closer to `trivial`

```lean
theorem add_comm (a b : Nat) : a + b = b + a := by
  induction a with
  | zero => simp
  | succ n ih => simp [Nat.succ_add, ih]
```

Try it: [Lean Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/NNG4)

---

## My experience: Arrow's Impossibility Theorem

I wanted to verify a real math paper.

- One-page proof — how hard could it be?
- [Arrow's Impossibility Theorem](https://github.com/ChihChengLiang/arrow/blob/main/Arrow/Arrow.lean): no voting system satisfies all three fairness criteria simultaneously
- Took **2–3 painful weeks**

---

## What made it hard

`Fin N` and `Fin (N+1)` are **different types** in Lean.

Mathematically: trivially the same. In Lean: requires explicit coercions.

This is **intensional equality** — and it will frustrate you.

The error messages point to symptoms deep in elaboration, not the actual mismatch.

But when it finally compiled?

That feeling is unlike any green test suite.

---

## Case study 1: lean-zip

---

## lean-zip: Formally verified compression

- **Repo**: [`kim-em/lean-zip`](https://github.com/kim-em/lean-zip) — zlib, gzip, DEFLATE, ZIP in Lean 4
- **Author**: Kim Morrison, Lean FRO core developer
- **AI contributor**: Claude Code — ~660 sessions, ~653 merged PRs
- **Timeline**: Feb 19 – Apr 22, 2026 (~2 months)
- **Goal**: Not just working — *proved correct*, zero unfinished obligations

---

## Proving costs 6–20× more than writing

| Phase | Sessions |
|---|---|
| Write DEFLATE decompressor | 4 |
| Prove it correct | 25 |
| Compressor + full roundtrip proofs | ~80 |

Implementation is the easy part.

---

## The capstone theorem

```lean
theorem inflate_deflateRaw (data : ByteArray) (level : UInt8)
    (maxOutputSize : Nat) (hsize : data.size < maxOutputSize) :
    Zip.Native.Inflate.inflate (deflateRaw data level) maxOutputSize = .ok data
```

For **every** input under 1 GiB: compress-then-decompress returns the original data exactly.

No test suite can make this claim.

The 1 GiB bound is a zip-bomb guard — formal proofs force implicit assumptions to become named preconditions.

---

## What proofs catch that tests don't

- **Kraft inequality** — Huffman code space never overflows, for *any* frequency distribution
- **Prefix-freedom** — no codeword is a prefix of another, for *every* valid table
- **Bit cursor correctness** — off-by-one bugs at every intermediate position, not just outputs
- **CRC32/Adler-32 compositionality** — `checksum(xs ++ ys) = f(checksum(xs), ys)` for all inputs

Proofs compose. Tests don't.

---

## Case study 2: clean

---

## clean: Formally verified ZK circuits

- **Repo**: [`Verified-zkEVM/clean`](https://github.com/Verified-zkEVM/clean) — Lean 4 for writing and proving ZK circuits
- **Org**: [zkSecurity](https://zksecurity.xyz/), Verified-zkEVM grant
- **Backend**: Rust / Plonky3
- **Goal**: Machine-checked soundness and completeness for *all* field elements and adversarial witnesses

---

## Familiar syntax, proof obligation attached

```lean
-- Circom original:
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

You write circuits the same way. But now you must *prove* they do what the comment says.

---

## Proof is part of the type

```lean
structure FormalCircuit (F : Type) [Field F] (Input Output : TypeMap) where
  main        : Var Input F → Circuit F (Var Output F)
  Assumptions : Input F → Prop
  Spec        : Input F → Output F → Prop
  soundness   : Soundness F ...
  completeness : Completeness F ...
```

You cannot instantiate a `FormalCircuit` without supplying both proofs.

The type system rejects incomplete definitions at compile time.

---

## The bugs this catches

**Field wrap-around**, compile time:

```lean
have : (2^n * x).val = 2^n * x.val := by
  rw [ZMod.val_mul_of_lt (by linarith), h_mul_x]
```

`ByteDecomposition` requires `p_large_enough : Fact (p > 2^16 + 2^8)` as a type-level assumption. Without it, the proof won't compile. You cannot deploy with a too-small prime by accident.

The **missing constraint bug** (like the Circom `IsZero` issue) fails to compile — not fails a test.

---

## What this means for the future

---

## The numbers

- 95–99% of proofs need no human review — Lean's kernel handles it
- That converts to **20–100× review efficiency** naively

Source: [arxiv 2604.16347](https://arxiv.org/abs/2604.16347)

---

## The new division of labor

| Role | Who does it |
|---|---|
| Write code | AI |
| Write proofs | AI |
| Specify *what* to prove | Human |
| Smell out bad math | Human |
| Verify proof validity | Lean's type checker |

This is **vericoding** — not theoretical anymore.

[vericoding benchmark](https://github.com/Beneficial-AI-Foundation/vericoding-benchmark) · [paper](https://arxiv.org/abs/2509.22908)

---

<!-- _class: centered -->

## Honest caveat

The direction looks right.

But people say it's easier than it is.

The `Fin N` / `Fin (N+1)` hell is real. The error messages will confuse you. The 2–3 week detours are real.

**The question is whether AI changes that calculus — and lean-zip suggests it does.**

---

<!-- _class: centered -->

## Summary

AI writes code faster than humans can audit it.

Lean proves correctness for *every* input, not just the ones you tested.

AI is now good enough to write the proofs too.

**The bottleneck shifts to: what do we want to prove?**
