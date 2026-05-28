---
title: My Lean 4 Experience and the Future of Software
---

+++ {"class": "title-slide"}


# My Lean 4 Experience and the Future of Software

**Formal proofs in the age of AI coding**

CC · 2026-05-20

+++ {"class": "title-slide"}
<div class="columns">

<div>

![](asset/I_robot.jpg)

</div>
<div>

> The Brain designed and built a hyperspace ship from scratch. Two engineers were sent to inspect it. By the time they realized the ship had already launched, it was too late — the door was locked behind them. There were no manual controls. No pilot seat. The only food on board was beans and milk.
— Isaac Asimov, "Escape!", I, Robot (1950)

</div>
</div>

:::notes
What is Taiwan doing in 1950? We are living in this world today now.
Promise: Understand math + CS
:::

+++

## How we got here

Something is changing about how software gets written — and how it gets broken.

This talk is three things:

1. A personal story about picking up Lean 4
2. Real projects doing formal verification today
3. What it might mean for Ethereum and software in general

+++ {"class": "chapter"}

# Part 1: Why The Hype?

+++

## Why Formal Verification Today?

* **The Threat**: AI like Mythos can find bugs quickly.
* **The Opportunity**: Formal methods used to be costly to write -- AI now makes them cheap
* The **Need**: We'd like to automate coding beyond human reasoning. 

:::notes
- Formal Verifications have been here since forever 
- Think about next year.
- Anyone runs 20 agents for coding here?
:::

+++ {"class": "chapter"}

# Part 2: What is Lean 4?

+++

## Lean 4 is not the Lean Ethereum project

Lean 4 is a **proof assistant and programming language**.

* You can write math proofs with it
* Coding like usual programming languages is okay too!
* If it compiles, the theorem is true — by construction.

+++

## The chess board feeling

Lean is like playing chess against math.

- You have a **goal** — the statement you're trying to prove
- You have a **toolbox** — lemmas from Mathlib
- Each **tactic** moves the goal closer to being closed

The board shows you exactly what's left to prove.

Try it: [Lean Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/NNG4)

+++

## A tactic in action

* Say we know: $y = x + 37$
* We would like to show $2 * y = 2 * (x + 37)$
* How would you prove this by hand?

+++

In Lean 4, a **hypothesis** is something we assume to be *true*

```
h : y = x + 37
```

And our **goal** is:

```
2 * y = 2 * (x + 37)
```

+++
## A tactic in action

One line closes it:

```lean
rw [h]
```

`rw` means *rewrite*. It finds every `y` in the goal and replaces it with `x + 37`, because `h` says they're equal.

Both sides become identical. Goal closed.

+++

## Let's prove something real

```lean
theorem my_add_sq:
    ∀ (a b : ℕ ), (a + b)^2 = a^2 + 2 * a * b + b^2 := by
  sorry
```

$$
(a + b)^2 = a^2 + 2ab + b^2
$$

https://live.lean-lang.org

+++ {"class": "chapter"}

# Part 3: My Experience

+++

## The Natural Number Game

<div style="width: 70%; margin: auto">

![](asset/nn_game_blank.png)

</div>

:::notes
Mario style stages
This server is hosted at Heinrich Heine University Düsseldorf.
:::

+++

## The Natural Number Game

<div style="width: 70%; margin: auto">

![](asset/nn_game_inside.png)

</div>

+++

## The Natural Number Game

<div style="width: 70%; margin: auto">

![](asset/nn_game_after.png)

</div>

+++


## Arrow's Impossibility Theorem

I wanted to verify a real math paper.

* Arrow's Impossibility Theorem: no voting system can satisfy all three fairness criteria simultaneously
* One-page proof — how hard could it be?
* [My attempt](https://github.com/ChihChengLiang/arrow/blob/main/Arrow/Arrow.lean): 2–3 painful weeks

+++

<div class="columns">

<div>

![](asset/arrow_p1.png)

</div>

<div>

![](asset/arrow_p2.png)

</div>

</div>

+++

<div style="width: 70%; margin: auto">

![](./report_diagram.png)

</div>

+++

## What made it hard

`Fin N` and `Fin (N+1)` are **different types** in Lean.

Mathematically: trivially the same.
In Lean: requires explicit coercions everywhere.

:::notes
Type checking on steroid
:::

+++

## What it felt like

The struggle was real. A one-page math proof took weeks because:

- Every "obvious" step needs to be spelled out
- The type system finds corners of the argument you didn't think about
- You can't hand-wave

An actual line in the paper:
> ..., which can be easily extended to all other $n_{ts}$'s, ...

This converts to 30 lines of code and 16 branches of sub-goals.

+++ {"class": "chapter"}

# Part 3.5: Proving Program Correctness

:::notes
We'll unpack what does it mean to verify a program
:::

+++

## Imagine We Implement an Addition Function

```python
# python
def add(a, b):
    return a + b
```

+++

## We protect it with some tests

```python
# python
def add(a, b):
    return a + b

assert add(1, 2) == 3   # ✓
assert add(5, 10) == 15 # ✓
```
+++

## Surprise!

```python
# python
def add(a, b):
    return a + b

add("hello", " world")  # "hello world" 
add("1", "2")           # "12"  not 3
```

+++

```python
# add type checking to fix the issue
def add(a: int, b: int):
    return a + b

add("1", "2") # error: Argument 1 to "add" has incompatible type "str"; expected "int" 
```

- TypeScript (2012) — Microsoft essentially admitted JavaScript at scale was untenable
- Python type hints (PEP 484, 2014) — the duck typing world started bolting types on
- Rust (2015) — types as a memory safety guarantee

+++

# Same function in Lean

```lean
-- lean
def add (a b : Nat):= a + b

#eval add 1 2   --  3
#eval add 5 10  -- 15
```

+++

## Type check is strictly enforced by default

```lean
-- lean
def add (a b : Nat):= a + b

#eval add "hello" "world"
-- Application type mismatch: The argument
--   "hello"
-- has type
--   String
-- but is expected to have type
--   Nat
-- in the application
--   add "hello"Lean 4
```

+++

## Proving correctness

```lean
-- lean
def add (a b : Nat):= a + b

theorem add_correct (a b : Nat) : add a b = a + b := by
  unfold add  -- unfold the definition of add
  rfl         -- left-hand side equals to right-hand side
```
This means the function is correct **for all natural numbers**! How many test cases could cover that?


+++ {"class": "chapter"}

# Part 4: Case Studies

:::notes
We're going to see some cool projects here. They all demonstrate ideas on how we do things differently
:::

+++ {"class": "chapter"}

## Case Study 1: lean-zip

*How do you craft secure compression library?*

+++

## lean-zip: Background

- **Repo**: [`kim-em/lean-zip`](https://github.com/kim-em/lean-zip) — zlib, gzip, DEFLATE, ZIP in Lean 4
- **Author**: Kim Morrison, Lean FRO core developer
- **AI contributor**: Claude Code — ~660 sessions, ~653 merged PRs
- **Timeline**: Feb 19 – Apr 22, 2026 (~2 months)
- **Goal**: Secure compression library

:::notes
This library is where if you want to check if Lean is practical or not for software development

A **zip bomb**, also known as a decompression bomb or "zip of death," is a malicious archive file designed to overwhelm a system's resources when decompressed, potentially causing crashes or system failures.
:::

+++

## The capstone theorem

```lean
theorem inflate_deflateRaw (data : ByteArray) (level : UInt8)
    (maxOutputSize : Nat) (hsize : data.size < maxOutputSize) :
  inflate (deflateRaw data level) maxOutputSize = .ok data
```

For **every** input under 1 GiB: compress-then-decompress returns the original data exactly.

No test suite can make this claim.

+++

## Bugs could still be found:

A [105 million fuzzing executions](https://kirancodes.me/posts/log-who-watches-the-watchers.html) found:

- No memory vulnerabilities.
- A bug in Lean 4's runtime.
- A denial-of-service in a unverified archive parser.

:::notes
This hints where future security hotspot might be.
Vitalik has a point on being cautious to the words: "proven" and "correct". Treat them as marketing words.
:::

+++ {"class": "chapter"}

## Case Study 2: clean

*How do you craft secure ZK circuits?*

+++

## clean: Background

- **Repo**: [`Verified-zkEVM/clean`](https://github.com/Verified-zkEVM/clean) — Lean 4 for writing and proving ZK circuits
- **Org**: [zkSecurity](https://zksecurity.xyz/), Verified-zkEVM grant
- **Backend**: Rust / Plonky3
- **Goal**: Machine-checked soundness and completeness for *all* field elements and adversarial witnesses

+++

## Example: IsZero circuit

if input = 0 then 1 else 0

```lean
-- Circom original:
-- inv      <--  in != 0 ? 1/in : 0;
-- out      <== -in * inv + 1;
-- in * out === 0;

def main (input : Expression (F p)) := do
  let inv ← witness fun env =>
    if x ≠ 0 then x⁻¹ else 0
  let out <== -input * inv + 1
  input * out === 0
  return out
```

:::notes
Inputs and outputs are finite field elements. Integer mod p
:::

+++

## In Clean, You have to write proof for your circuit

```lean
def circuit : FormalCircuit (F p) field field where
  main

  Spec input output :=
    output = (if input = 0 then 1 else 0)

  soundness := ...

  completeness := ...
```

+++

```lean
  soundness := by
    circuit_proof_start
    simp only [id_eq, h_holds]
    split_ifs with h_ifs
    . simp only [h_ifs, zero_mul, neg_zero, zero_add]
    . rw [neg_add_eq_zero]
      have h1 := h_holds.left
      have h2 := h_holds.right
      rw [h1] at h2
      simp only [id_eq, mul_eq_zero] at h2
      cases h2
      case neg.inl hl => contradiction
      case neg.inr hr =>
        rw [neg_add_eq_zero] at hr
        exact hr
```

+++

```lean
  completeness := by
    circuit_proof_start
    cases h_env with
    | intro left right =>
      simp only [left, id_eq, ite_not, mul_ite, mul_zero] at right
      simp only [id_eq, right, left, ite_not, mul_ite, mul_zero, mul_eq_zero, true_and]
      split_ifs <;> aesop
```

+++

## Field wrap-around bugs caught at compile time

`ByteDecomposition` requires this as a **type-level assumption**:

```lean
p_large_enough : Fact (p > 2^16 + 2^8)
```

Without it, the proof won't compile. You cannot deploy with a too-small prime by accident.

This is the class of bug that looks correct for small test values but wraps silently near `p`.

+++ {"class": "chapter"}

## Case Study 3: evm-asm

*How do you craft secure and fast EVM?*

+++

## EVM Opcodes on

[evm.codes](https://www.evm.codes/)

![](asset/evm_code.png)

+++

## Quick recap: what is the EVM?

Every Ethereum transaction runs on the EVM — the Ethereum Virtual Machine.

- You write Solidity → it compiles to EVM bytecode
- When Alice sends USDC to Bob, EVM bytecode executes
- Every Ethereum client (geth, reth, besu) implements the EVM

**If the EVM has a bug, everything built on it inherits that bug.**

+++

## How EVM is implemented today?

In Go, compiled down to your CPU.

```go
// go-ethereum/core/vm/instructions.go
func opAdd(pc *uint64, evm *EVM, scope *ScopeContext) ([]byte, error) {
	x, y := scope.Stack.pop(), scope.Stack.peek()
	y.Add(&x, y)
	return nil, nil
}
```

Correct by convention. Tested against finite vectors.
No proof that this is right for *all* inputs.

+++

## How EVM might be implemented tomorrow?

For scalability, we want to verify EVM execution with ZK proofs.

The architecture shifts:

- EVM execution → compiled to RISC-V traces
- ZK developers implement a RISC-V VM circuit
- A proof is generated; clients verify the proof instead of re-executing

**Now there's only one implementation that matters — the zkVM guest.**

The multi-client defense disappears.

+++

## evm-asm: Background

- **Repo**: [`Verified-zkEVM/evm-asm`](https://github.com/Verified-zkEVM/evm-asm) — EVM implemented directly in RV64IM RISC-V, with Lean 4 proofs
- **Org**: zkSecurity, Verified-zkEVM grant
- **Scale**: 9,904 Lean files, ~1.8M lines; 52+ EVM opcodes proved
- **Velocity**: 200–600 commits per day, AI-agent driven

+++

## EVM-ASM: EVM implemented in RiscV Opcode directly

- Fastest possible way on machine
- Protected by math proofs

```lean
def evm_add : Program :=
  -- Limb 0 (5 instructions)
  LD .x7 .x12 0 ;; LD .x6 .x12 32 ;;
  ADD .x7 .x7 .x6 ;; SLTU .x5 .x7 .x6 ;; SD .x12 .x7 32 ;;
  -- Limb 1 (8 instructions)
  LD .x7 .x12 8 ;; LD .x6 .x12 40 ;;
  ADD .x7 .x7 .x6 ;; SLTU .x11 .x7 .x6 ;;
  ADD .x7 .x7 .x5 ;; SLTU .x6 .x7 .x5 ;;
  OR' .x5 .x11 .x6 ;; SD .x12 .x7 40 ;;
  -- Limb 2 (8 instructions)
  LD .x7 .x12 16 ;; LD .x6 .x12 48 ;;
  ADD .x7 .x7 .x6 ;; SLTU .x11 .x7 .x6 ;;
  ADD .x7 .x7 .x5 ;; SLTU .x6 .x7 .x5 ;;
  OR' .x5 .x11 .x6 ;; SD .x12 .x7 48 ;;
  -- Limb 3 (8 instructions)
  LD .x7 .x12 24 ;; LD .x6 .x12 56 ;;
  ADD .x7 .x7 .x6 ;; SLTU .x11 .x7 .x6 ;;
  ADD .x7 .x7 .x5 ;; SLTU .x6 .x7 .x5 ;;
  OR' .x5 .x11 .x6 ;; SD .x12 .x7 56 ;;
  -- sp adjustment
  ADDI .x12 .x12 32
```

+++

## What is it doing here?

- High-level language: Golang, Rust, Python. The language for humans, for devs and their colleagues
- Low-level language: Assembly, Opcodes. The language for machines
- Compiler: The translator between human and machine language
* Speak languages closer to the machine, you get more speed optimization for run time, with the sacrifice of human developer time.
* you also get bugs easily if not careful

+++ {"class": "chapter"}

# Part 5: What Comes Next?

+++

## The numbers

The [Lean Atlas paper](https://arxiv.org/abs/2604.16347) argues:

- 95–99% of proofs need no human review — Lean's kernel handles it
- That converts naively to **20–100× review efficiency**

+++

## The new division of labor

| Task | Who |
|---|---|
| Write code | AI |
| Write proofs | AI |
| Specify *what* to prove | Human |
| Smell out a bad spec | Human |
| Verify proof validity | Lean's type checker |

+++

## Vulnerabilities relocate

Each layer you verify pushes the attack surface to the boundary above or below.

- **Spec-to-intent gap** — the type checker proves code matches spec, not spec matches intent
- **Trusted computing base** — lean-zip fuzzing found no bugs in the verified library, but found one in Lean 4's own runtime
- **Composition boundaries** — verifying ADD doesn't verify a flash loan attack
- **Supply chain** — if AI writes both spec and proof, who audits the AI?

+++

## Honest caveat

The direction looks right.

But people say it's easier than it is.

The `Fin N` / `Fin (N+1)` hell is real.
The error messages will confuse you.
It is indeed more painful than Rust

But what about a year from now?

+++

## Vitalik's Take

[A shallow dive into formal verification](https://vitalik.eth.limo/general/2026/05/18/fv.html).

> Formal verification, aided by AI, should be viewed not as totally new paradigm, but as a powerful accelerant of a trend and a paradigm that was already marching forward.

:::notes
Add formal verification in your toolbox that helps you check your intents.
Closing: Before Asimov, robot writers portrayed them like Frankenstein.
But Asimov pictured robots following rules. When humans invent tools, we add protections to prevent us from getting hurt.
Math proving is kind of that proof you need to craft software at scale with agents.
:::

+++

## Links

- [Lean Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/NNG4) — best place to start
- [My Arrow's proof](https://github.com/ChihChengLiang/arrow/blob/main/Arrow/Arrow.lean)
- [lean-zip](https://github.com/kim-em/lean-zip)
- [clean](https://github.com/Verified-zkEVM/clean)
- [evm-asm](https://github.com/Verified-zkEVM/evm-asm)
- [VCV-io](https://github.com/Verified-zkEVM/VCV-io)
- [Lean Atlas paper](https://arxiv.org/abs/2604.16347)
- [Try Lean online](https://live.lean-lang.org/)