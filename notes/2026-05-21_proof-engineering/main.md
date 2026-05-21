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