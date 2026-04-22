---
date: 2026-04-22
---

# Taming Real Numbers in Lean

Real numbers are widely used in applied mathematics. But in Lean, they are a different beast.

Real numbers in Lean are constructed as Cauchy sequences or Dedekind cuts — they cannot be
directly computed. `#eval` on an `ℝ` value produces something like:

```lean
#eval (2:ℝ)
-- Real.ofCauchy (sorry /- 2, 2, 2, 2, 2, 2, ... -/)
```

Here are the practical strategies.

---

## 1. Use a Simpler Type If You Can

### Rationals `ℚ` — fully computable

```lean
def C : Matrix (Fin 2) (Fin 2) ℚ :=
  !![1, 1; 1, 1]

#eval C * C
-- !![2, 2; 2, 2]
```

Works great. Breaks down when you need irrationals like `√2`.

### Float — do not use for matrices

We don't use *real* real numbers in practice right? We use something like floating numbers in our code. Can we just prove properties with `Float` instead of real numbers? The answer is no.

`Float` lacks `AddCommMonoid` because floating-point addition is not associative:

```lean
#eval ((0.1 + 0.2 : Float) + 0.3).toBits -- 4603579539098121012
#eval (0.1 + (0.2 + 0.3 : Float)).toBits -- 4603579539098121011
#eval ((0.1 + 0.2 : Float) + 0.3) == (0.1 + (0.2 + 0.3 : Float)) -- false
```

Matrix multiplication requires `AddCommMonoid`, so this fails at typecheck:

```lean
def C : Matrix (Fin 2) (Fin 2) Float :=
  !![1, 1; 1, 1]

#eval C * C
-- failed to synthesize instance HMul (Matrix ...) (Matrix ...) ?m
```

```lean
#check @Matrix.instHMulOfFintypeOfMulOfAddCommMonoid
/-
@Matrix.instHMulOfFintypeOfMulOfAddCommMonoid : {l : Type u_4} →
  {m : Type u_5} →
    {n : Type u_6} →
      {α : Type u_3} → [Fintype m] → [Mul α] → [AddCommMonoid α] → HMul (Matrix l m α) (Matrix m n α) (Matrix l n α)
-/
```

---

## 2. Algebra — No Computation Needed

For symbolic expressions, use `ring` or `norm_num` instead of computing.

### `ring` — pure symbolic cancellation

```lean
example : Real.sqrt 2 - Real.sqrt 2 = 0 := by ring         -- works
example : Real.sqrt 2 + Real.sqrt 2 = 2 * Real.sqrt 2 := by ring  -- works
```

### `norm_num` — heuristic mix of algebra and computation

```lean
-- this works because norm_num used algebra here
example : Real.sqrt 2 - Real.sqrt 2 = 0 := by norm_num     -- works

-- this fails because norm_num's algebra is not good enough
example : Real.sqrt 2 + Real.sqrt 2 = 2 * Real.sqrt 2 := by norm_num  -- fails
```

`norm_num` handles some cases `ring` does not, and vice versa. Try both.

To inspect what `norm_num` actually did:

```lean
set_option trace.Tactic.norm_num true in
example : C * C = !![2, 2; 2, 2] := by
  unfold C
  norm_num
```

`norm_num` will often succeed on `ℝ` matrices containing natural number literals by coercing
them to `ℕ` internally.

---

## 3. ComputableReal

[Timeroot's `ComputableReal` library](https://github.com/Timeroot/ComputableReal) wraps Cauchy
sequences with explicit upper and lower bounds, making arithmetic decidable:

```lean
example : |√3 - 2 * exp 1 / π| < 0.002 := by
  native_decide  -- actually computes
```

**Hard limitation: sign is undecidable.**

`√2 - √2` is tracked as a sequence with upper bound `1/2ⁿ` and lower bound `-1/2ⁿ`. In finite
iterations you cannot determine whether it converges to a positive or negative number, so this
hangs:

```lean
example : Real.sqrt 2 = Real.sqrt 2 := by native_decide      -- hangs
example : Real.sqrt 2 - Real.sqrt 2 = 0 := by native_decide  -- hangs
```

Use `ring` instead for these cases:

```lean
example : Real.sqrt 2 - Real.sqrt 2 = 0 := by ring -- works
```

Update 2026-04-22 : The project is not compatible with the new Lean version yet. Here's my attempt to [upgrade](https://github.com/Timeroot/ComputableReal/pull/3) the version.
