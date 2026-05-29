---
date: 2026-05-21
---

# Proof Engineering


## Beginner examples

Play them on https://live.lean-lang.org/

```lean
import Mathlib
theorem my_add_sq:
  ∀ (a b : ℕ ), (a + b)^2 = a^2 + 2 *a* b + b^2 := by
  intro a b
  rw[sq]
  rw[mul_add]
  rw[add_mul, add_mul]
  rw[← sq, ← sq]
  rw[mul_comm b a]
  rw[← add_assoc]
  nth_rewrite 2 [add_assoc]
  rw[← two_mul]
  rw[← mul_assoc]
```

```lean
import Mathlib

theorem irrational_pow_irrational_rational :
    ∃ (a b : ℝ), Irrational a ∧ Irrational b ∧ ¬ Irrational (a ^ b) := by
  by_cases h : Irrational (√2 ^ √2)
  · -- Case: √2 ^ √2 is irrational → use it as base
    refine ⟨√2 ^ √2, √2, h, irrational_sqrt_two, ?_⟩
    show ¬Irrational ((√2 ^ √2) ^ √2)
    rw[
      ← Real.rpow_mul (Real.sqrt_nonneg 2),
      Real.mul_self_sqrt (Nat.ofNat_nonneg 2),
      Real.rpow_ofNat,
      Real.sq_sqrt (Nat.ofNat_nonneg 2)
    ]
    exact not_irrational_ofNat 2
  · -- Case: √2 ^ √2 is rational → we're already done
    exact ⟨√2, √2, irrational_sqrt_two, irrational_sqrt_two, h⟩
```


## Engineering Tips

Simp Lemma


Computation result on RHS. Reduce simp etc.

## Natural numbers

Use zify then show lots of inqualities to make sure positiveness


## Theorem patterns

It is common people start their theorem like `foo_spec_before` below. The let binding would create a match hypothesis that's difficult to work with.

It wraps your brain a little bit. But if you see `let` patterns, it is a sign to rephrase the theorem in the form like `foo_spec_after`

```lean
import Mathlib

def foo (n : Nat) : Nat × Nat := (n + 1, n + 2)

theorem foo_spec_before (n : Nat) :
    let (a, b) := foo n
    a + b = 2 * n + 3 := by
  simp [foo]
  ring

example (n : Nat) : (foo n).1 + (foo n).2 = 2 * n + 3 := by
  have h := foo_spec_before n
  #check h
  -- h : match foo n with | (a, b) => a + b = 2 * n + 3
  simp only [foo] at h
  exact h

theorem foo_spec_after (n : Nat) {a b : Nat}
    (h : foo n = (a, b)) :
    a + b = 2 * n + 3 := by
  simp [foo] at h
  obtain ⟨ha, hb⟩ := h
  subst ha; subst hb
  ring

example (n : Nat) : (foo n).1 + (foo n).2 = 2 * n + 3 := by
  -- use rcases to keep hdecomp hypothesis and also the decomposed ha, hb
  rcases hdecomp : foo n with ⟨ha, hb⟩
  have h := foo_spec_after n hdecomp
  #check h
  -- h : ha + hb = 2 * n + 3
  -- hdecomp : foo n = (ha, hb)
  exact h

```


## Suffices

## Using `suffices` to surface proof insight

Sometimes the key insight of a proof is choosing the right witness in each branch of a case split. Without `suffices`, that insight gets buried under the same closing boilerplate repeated in every branch.

We want to show `(a - b)^2 + 3 > 3` for any integers `a ≠ b`. The key insight is that `(a - b)^2` is a square of a nonzero integer,
hence positive. The witness differs per branch — `a - b` or `b - a` — but the closing argument is identical.

```lean
import Mathlib

theorem sq_add_three_gt_three (a b : ℤ) (h : a ≠ b) :
    (a - b) ^ 2 + 3 > 3 := by
  by_cases hab : a > b
  · have hv : a - b > 0 := by omega
    have hsq : (a - b) ^ 2 = (a - b) * (a - b) := sq (a - b)
    have hpos : (a - b) * (a - b) > 0 := mul_pos hv hv
    linarith [hsq ▸ hpos]
  · have hv : b - a > 0 := by omega
    have hsq : (a - b) ^ 2 = (b - a) * (b - a) := by ring
    have hpos : (b - a) * (b - a) > 0 := mul_pos hv hv
    linarith [hsq ▸ hpos]
```
Every branch must independently close the goal after substituting the witness — the same shape of argument repeated twice.

### With `suffices`

```lean
theorem sq_add_three_gt_three_clean (a b : ℤ) (h : a ≠ b) :
    (a - b) ^ 2 + 3 > 3 := by
  suffices h : ∃ v : ℤ, v > 0 ∧ (a - b) ^ 2 = v * v by
    obtain ⟨v, hpos, hsq⟩ := h
    rw [hsq]
    linarith [mul_pos hpos hpos]
  by_cases hab : a > b
  · exact ⟨a - b, by omega, by ring⟩
  · exact ⟨b - a, by omega, by ring⟩
```

The `suffices` body handles the closing argument once: rewrite with `hsq`, then `linarith` from `v * v > 0`. Each branch just names its witness and discharges the two properties with `omega` and `ring`.

Most importantly, if a proof insight is about a witness, `suffices` highlights it.

> **The pattern:** `suffices` states what a good witness *looks like*.
> The body closes the original goal given any such witness.
> The branches just find the witness.

Real world [example](https://github.com/Verified-zkEVM/VCV-io/pull/409)

