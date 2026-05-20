---
marp: true
theme: notes
paginate: true
---

<!-- _class: title-slide -->

# My Lean 4 Experience and the Future of Software

**Formal proofs in the age of AI coding**

CC · 2026-05-10

---

<!-- _class: title-slide -->
<div class="columns">

<div>

![](asset/I_robot.jpg)

</div>
<div>

> The Brain designed and built a hyperspace ship from scratch. Two engineers were sent to inspect it. By the time they realized the ship had already launched, it was too late — the door was locked behind them. There were no manual controls. No pilot seat. The only food on board was beans and milk.
— Isaac Asimov, "Escape!", I, Robot (1950)

</div>
</div>

---

## How we got here

Something is changing about how software gets written — and how it gets broken.

This talk is three things:

1. A personal story about picking up Lean 4
2. Real projects doing formal verification today
3. What it might mean for Ethereum and software in general

---

<!-- _class: chapter -->

# Part 1: Why The Hype?

---

## Why Formal Verification Today?

* **The Threat**: AI like Mythos can find bugs quick.
* **The Opportunity**: Formal method used to be costly to write -- AI now makes it cheap
* The **Need**: We'd like to automate coding beyond human reasoning. 

<!-- 
- Formal Verifications have been here since forever 
- Think about next year.
- Anyone runs 20 agents for coding here?
-->

---

<!-- _class: chapter -->

# Part 2: What is Lean 4?

---

## Lean 4 is not the Lean Ethereum project

Lean 4 is a **proof assistant and programming language**.

* You can write math proofs with it
* Coding like usual programing languages is okay too!
* If it compiles, the theorem is true — by construction.

---

## The chess board feeling

Lean is like playing chess against math.

- You have a **goal** — the statement you're trying to prove
- You have a **toolbox** — lemmas from Mathlib
- Each **tactic** moves the goal closer to being closed

The board shows you exactly what's left to prove.

Try it: [Lean Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/NNG4)

---

## A tactic in action

* Say we know: $y = x + 37$
* We would like to show $2 * y = 2 * (x + 37)$
* How would you prove this by hand?

---

In Lean 4, a **hypothesis** is something we assume to be *true*

```
h : y = x + 37
```

And our **goal** is:

```
2 * y = 2 * (x + 37)
```

---
## A tactic in action

One line closes it:

```lean
rw [h]
```

`rw` means *rewrite*. It finds every `y` in the goal and replaces it with `x + 37`, because `h` says they're equal.

Both sides become identical. Goal closed.

---

## Let's prove something real

```lean
theorem my_add_sq:
  ∀ (a b : ℕ ), (a + b)^2 = a^2 + 2 * a * b + b^2 := by
```

$$
(a + b)^2 = a^2 + 2ab + b^2
$$

https://live.lean-lang.org

---

<!-- _class: chapter -->

# Part 3: My Experience

---

## The Natural Number Game

<div style="width: 70%; margin: auto">

![](asset/nn_game_blank.png)

</div>

<!--
Mario style stages
This server is hosted at Heinrich Heine University Düsseldorf.
-->

---

## The Natural Number Game

<div style="width: 70%; margin: auto">

![](asset/nn_game_inside.png)

</div>

---

## The Natural Number Game

<div style="width: 70%; margin: auto">

![](asset/nn_game_after.png)

</div>

---


## Arrow's Impossibility Theorem

I wanted to verify a real math paper.

* Arrow's Impossibility Theorem: no voting system can satisfy all three fairness criteria simultaneously
* One-page proof — how hard could it be?
* [My attempt](https://github.com/ChihChengLiang/arrow/blob/main/Arrow/Arrow.lean): 2–3 painful weeks

---

<div class="columns">

<div>

![](asset/arrow_p1.png)

</div>

<div>

![](asset/arrow_p2.png)

</div>

</div>

---

<div style="width: 70%; margin: auto">

![](./report_diagram.png)

</div>

---

## What made it hard

`Fin N` and `Fin (N+1)` are **different types** in Lean.

Mathematically: trivially the same.
In Lean: requires explicit coercions everywhere.

<!-- Type checking on steroid -->

---

## What it felt like

The struggle was real. A one-page math proof took weeks because:

- Every "obvious" step needs to be spelled out
- The type system finds corners of the argument you didn't think about
- You can't hand-wave

An actual line in the paper:
> ..., which can be easily extended to all other $n_{ts}$'s, ...

This converts to 30 lines of code and 16 branches of sub-goals.

---

<!-- _class: chapter -->

# Part 4: Case Studies

<!-- We're going to see some cool projects here. They all demenstrate ideas on how we do things differently -->

---

<!-- _class: chapter -->

## Case Study 1: lean-zip

*Formally verified compression library*

---

## lean-zip: Background

- **Repo**: [`kim-em/lean-zip`](https://github.com/kim-em/lean-zip) — zlib, gzip, DEFLATE, ZIP in Lean 4
- **Author**: Kim Morrison, Lean FRO core developer
- **AI contributor**: Claude Code — ~660 sessions, ~653 merged PRs
- **Timeline**: Feb 19 – Apr 22, 2026 (~2 months)
- **Goal**: Secure compression library

<!-- 
This library is where if you want to check if Lean is practical or not

A **zip bomb**, also known as a decompression bomb or "zip of death," is a malicious archive file designed to overwhelm a system's resources when decompressed, potentially causing crashes or system failures.
-->

---

## The capstone theorem

```lean
theorem inflate_deflateRaw (data : ByteArray) (level : UInt8)
    (maxOutputSize : Nat) (hsize : data.size < maxOutputSize) :
  inflate (deflateRaw data level) maxOutputSize = .ok data
```

For **every** input under 1 GiB: compress-then-decompress returns the original data exactly.

No test suite can make this claim.

---

## Bugs could still be found**: 

A [105 million fuzzing executions](https://kirancodes.me/posts/log-who-watches-the-watchers.html) found:

- No memory vulnerabilities.
- A bug in Lean 4's runtime.
- A denial-of-service in a unverified archive parser.

<!-- 
This hints where future security hotspot might be.
Vitalik has a point on being cautious to the words: "proven" and "correct". Treat them as marketing words.
-->

---

<!-- _class: chapter -->

## Case Study 2: clean

*Formally verified ZK circuits*

---

## clean: Background

- **Repo**: [`Verified-zkEVM/clean`](https://github.com/Verified-zkEVM/clean) — Lean 4 for writing and proving ZK circuits
- **Org**: [zkSecurity](https://zksecurity.xyz/), Verified-zkEVM grant
- **Backend**: Rust / Plonky3
- **Goal**: Machine-checked soundness and completeness for *all* field elements and adversarial witnesses

---

## Familiar syntax, proof obligation attached

```lean
-- Circom original:
-- inv <-- in != 0 ? 1/in : 0;
-- out <== -in * inv + 1;
-- in*out === 0;

def main (input : Expression (F p)) := do
  let inv ← witness fun env =>
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
  main         : Var Input F → Circuit F (Var Output F)
  Spec         : Input F → Output F → Prop
  soundness    : Soundness F ...
  completeness : Completeness F ...
```

You cannot instantiate a `FormalCircuit` without supplying both proofs.

The type system rejects incomplete definitions at compile time.

---

## Field wrap-around bugs caught at compile time

`ByteDecomposition` requires this as a **type-level assumption**:

```lean
p_large_enough : Fact (p > 2^16 + 2^8)
```

Without it, the proof won't compile. You cannot deploy with a too-small prime by accident.

This is the class of bug that looks correct for small test values but wraps silently near `p`.

---

## What's still unverified

| Layer | Verified? |
|---|---|
| Lean kernel (type checker) | ✅ |
| `FormalCircuit` soundness / completeness | ✅ |
| `toJson` serialization | ❌ |
| Rust backend AST interpretation | ❌ |
| Plonky3 proof system soundness | ❌ |

Formal verification doesn't eliminate vulnerabilities — it **relocates** them.

---

<!-- _class: chapter -->

## Case Study 3: evm-asm

*Formally verified EVM as RISC-V assembly*

---

## evm-asm: Background

- **Repo**: [`Verified-zkEVM/evm-asm`](https://github.com/Verified-zkEVM/evm-asm) — EVM as RV64IM RISC-V assembly, with Lean 4 proofs
- **Org**: zkSecurity, Verified-zkEVM grant
- **Scale**: 9,904 Lean files, ~1.8M lines; 52+ EVM opcodes proved
- **Velocity**: 200–600 commits per day, AI-agent driven

---

## Why verify at the assembly level?

Every compiler eventually produces machine instructions.

Verifying there sidesteps: C/C++ undefined behavior, Rust's lack of a stable spec, compiler bugs.

RISC-V has **no undefined behavior** — every instruction has total, formal semantics.

In a zkVM: if the guest program has a bug, the SNARK proof is still valid.
**It just proves the wrong thing.**

---

## A three-level proof pyramid per opcode

Each of 52+ opcodes verified bottom-up. For 256-bit ADD:

1. **Level 1** — each 5-instruction limb group manipulates the right register
2. **Level 2** — four limb proofs compose into a full 30-instruction carry-chain spec
3. **Level 3** — rewrites into abstract EVM semantics: `evmWordIs (sp + 32) (a + b)`

For **all** register values and **all** memory layouts.

---

## Proof as a co-routine with AI

AI agents write both the assembly and its Lean proof in the same session.

If the proof fails to type-check, the agent knows the code or spec is wrong — **before any test is run**.

The proof failure is the bug report.

This is what makes 200–600 commits per day plausible.

---

## What this means for Ethereum clients

| | geth / reth / besu | evm-asm |
|---|---|---|
| Correctness evidence | Passes test vectors | Machine-checked proof for all inputs |
| Coverage | Test-driven (finite) | Universal (∀ inputs) |
| Trust base | Rust compiler + std | Lean kernel + RISC-V model |

---

<!-- _class: chapter -->

# Part 5: What Comes Next?

---

## The numbers

The [Lean Atlas paper](https://arxiv.org/abs/2604.16347) argues:

- 95–99% of proofs need no human review — Lean's kernel handles it
- That converts naively to **20–100× review efficiency**

---

## The new division of labor

| Task | Who |
|---|---|
| Write code | AI |
| Write proofs | AI |
| Specify *what* to prove | Human |
| Smell out a bad spec | Human |
| Verify proof validity | Lean's type checker |

This is **vericoding** — not theoretical anymore.

[benchmark](https://github.com/Beneficial-AI-Foundation/vericoding-benchmark) · [paper](https://arxiv.org/abs/2509.22908)

---

## Vulnerabilities don't disappear — they relocate

Each layer you verify pushes the attack surface to the boundary above or below.

- **Spec-to-intent gap** — the type checker proves code matches spec, not spec matches intent
- **Trusted computing base** — lean-zip fuzzing found no bugs in the verified library, but found one in Lean 4's own runtime
- **Composition boundaries** — verifying ADD doesn't verify a flash loan attack
- **Supply chain** — if AI writes both spec and proof, who audits the AI?

---

## Honest caveat

The direction looks right.

But people say it's easier than it is.

The `Fin N` / `Fin (N+1)` hell is real.
The error messages will confuse you.
The 2–3 week detours are real.

**The question is whether AI changes that calculus — and lean-zip suggests it does.**

---

## Summary

AI writes code faster than humans can audit it.

Lean proves correctness for *every* input, not just the ones you tested.

AI is now good enough to write the proofs too.

**The bottleneck shifts to: what do we want to prove?**

---

## Links

- [Lean Natural Number Game](https://adam.math.hhu.de/#/g/leanprover-community/NNG4) — best place to start
- [My Arrow's proof](https://github.com/ChihChengLiang/arrow/blob/main/Arrow/Arrow.lean)
- [lean-zip](https://github.com/kim-em/lean-zip)
- [clean](https://github.com/Verified-zkEVM/clean)
- [evm-asm](https://github.com/Verified-zkEVM/evm-asm)
- [VCV-io](https://github.com/Verified-zkEVM/VCV-io)
- [Lean Atlas paper](https://arxiv.org/abs/2604.16347)
- [Vericoding paper](https://arxiv.org/abs/2509.22908)
- [Try Lean online](https://live.lean-lang.org/)