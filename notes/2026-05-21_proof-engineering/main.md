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
