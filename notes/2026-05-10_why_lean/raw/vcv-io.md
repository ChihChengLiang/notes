# VCV-io: Machine-Checked Cryptographic Software Engineering

## Background

- **Repo**: [`VCV-io`](https://github.com/) — Lean 4 framework for formally verified cryptographic proofs, built on Mathlib
- **Organization**: Academic / open collaboration; primary authors Devon Tuma and Quang Dao, with contributions from Alexander Hicks, Pietro Monticone, Gabe Robison, Bolton Bailey, and others
- **Language**: Lean 4, with Mathlib as the mathematical foundation; C FFI for differential testing against native ML-DSA/ML-KEM/Falcon backends
- **Timeline**: March 2024 – present (~26 months); development accelerated sharply in early 2026 (113 commits in April 2026 alone)
- **Goal**: Machine-checked security proofs for cryptographic schemes — IND-CPA, EUF-CMA, perfect secrecy, UC emulation, forking lemmas, Fiat-Shamir transforms — quantified over *all* adversaries, not just sampled inputs
- **Scale**: 491 Lean files, ~155,000 lines of Lean; 308 commits; 10+ contributors
- **License**: Apache 2.0

---

## Highlight

### The core question: what can't testing and fuzzing do?

Testing runs code on specific inputs. Fuzzing runs code on many random inputs. Both check behavior at concrete points. The fundamental gap they leave is *universal quantification*: no amount of testing can say "no adversary, ever, can break this scheme with advantage better than ε."

VCV-io directly fills that gap. Its proofs are machine-checked statements of the form: *for every probabilistic polynomial-time adversary, the advantage in the IND-CPA game is bounded by the DDH advantage.* The bound is a theorem, not an empirical observation.

---

### The architecture: computations as free monads over oracle signatures

The framework's central type is:

```lean
def OracleComp {ι : Type u} (spec : OracleSpec.{u, v} ι) : Type w → Type (max u v w) :=
  PFunctor.FreeM spec.toPFunctor
```

`OracleSpec ι` is simply a function `ι → Type` — the index type `ι` is the oracle name, and `spec t` is the response type for oracle `t`. `OracleComp spec α` is the free monad over the polynomial functor this induces: a computation that can call oracles in `spec` and eventually returns an `α`.

This is the right abstraction because:
- the *scheme*, the *adversary*, and the *security game* are all written as the same kind of object
- `simulateQ impl : OracleComp spec α → r α` is the unique monad morphism that replaces oracle calls with an implementation — you can turn a random oracle into a hash function, into a logging oracle, into a rewinding oracle, all without rewriting the program
- `evalDist : OracleComp unifSpec α → PMF α` gives denotational semantics as a probability distribution, *definitionally equal* to `simulateQ` into `PMF` with queries interpreted as uniform sampling

What testing calls "run the program" is, in VCV-io, `evalDist`. The difference is that `evalDist` is not a single run — it is the full probability measure over all outcomes, which you can reason about axiomatically.

---

### Perfect secrecy of the one-time pad: the simplest example of the gap

Testing can check that `Dec(k, Enc(k, m)) = m` for particular `k, m`. Fuzzing can check it for thousands of `(k, m)` pairs. Neither can say anything about the *distribution of ciphertexts*.

The VCV-io proof of OTP perfect secrecy directly proves:

```lean
lemma perfectSecrecyAt (sp : ℕ) : (oneTimePad sp).perfectSecrecyAt := by
  intro mgen msg σ
  have hpair :
      Pr[= (msg, σ) | (oneTimePad sp).PerfectSecrecyExp mgen] =
        Pr[= msg | mgen] *
          (Fintype.card (BitVec sp) : ℝ≥0∞)⁻¹ := by
    simpa [SymmEncAlg.PerfectSecrecyExp, oneTimePad, monad_norm] using
      probOutput_pair_xor_uniform sp (mx := mgen) msg σ
  rw [hpair, ← probOutput_cipher_uniform]
```

The statement `perfectSecrecyAt` means: for *every* message generator `mgen`, every message `msg`, and every ciphertext `σ`, the joint probability of `(msg, σ)` factors as `Pr[msg | mgen] · 1/|BitVec sp|`. This is the information-theoretic definition of perfect secrecy, proved for all security parameters at once.

The file also gives a second proof — via the relational/game-hopping approach — that any two messages yield identical ciphertext distributions:

```lean
lemma cipherGivenMsg_equiv (sp : ℕ) (msg₀ msg₁ : BitVec sp) :
    GameEquiv
      ((oneTimePad sp).PerfectSecrecyCipherGivenMsgExp msg₀)
      ((oneTimePad sp).PerfectSecrecyCipherGivenMsgExp msg₁) := by
  ...
  by_equiv
  rvcstep using (fun k : BitVec sp => k ^^^ c)
  ...
  · exact hxor
```

[`Examples/OneTimePad/Basic.lean`](Examples/OneTimePad/Basic.lean)

`by_equiv` enters a *relational proof mode* (pRHL-style): you are now proving that two programs are coupled by a bijection. `rvcstep using f` supplies the coupling witness `k ↦ k ⊕ c`. Testing cannot express or check this kind of coupling at all.

---

### Game-hopping proofs: replacing pen-and-paper sequences with machine-checked chains

Classical cryptography proofs work by defining a sequence of games `G₀, G₁, …, Gₙ` and bounding the distinguishing advantage between adjacent games. Each step is argued informally. VCV-io makes every step a checkable obligation.

The program logic provides:

| Tactic | What it does |
|--------|-------------|
| `by_equiv` | Enter relational mode for proving `G₁ ≡ₚ G₂` |
| `game_trans G₂` | Split `G₁ ≡ₚ G₃` into two subgoals |
| `rvcstep` | Apply one obvious relational step (bind, pure, sample, query) |
| `by_dist` / `by_upto bad` | Enter TV-distance reasoning; apply "identical until bad" |
| `vcstep` | Unary probability reasoning: decompose `Pr[= x | oa]` |

The "identical until bad" principle — a cornerstone of computational cryptography — is proved once as:

```lean
theorem tvDist_simulateQ_le_probEvent_bad : ...
-- If two oracle implementations agree whenever "bad" is unset,
-- the TV distance between their simulations is ≤ Pr[bad is set].
```

[`VCVio/ProgramLogic/Relational/SimulateQ.lean`](VCVio/ProgramLogic/Relational/SimulateQ.lean)

Any scheme-level proof that uses this principle inherits its correctness from a single checked theorem, not a fresh informal argument per paper.

---

### The forking lemma: the hardest argument to test

The Pointcheval-Stern forking lemma underlies the security of Schnorr signatures (and every Fiat-Shamir scheme). It says: if an adversary breaks the signature with non-negligible probability, there exists a *rewinding reduction* that can extract a discrete log witness. The argument involves rewinding the adversary at a random oracle query index and hoping the two runs produce different challenge responses at that fork point.

VCV-io machine-checks this in full, including the exact probability arithmetic:

```
ε' · ( ε' / (qH + 1)  -  1 / |F| )   ≤   Pr[ B succeeds in dlogExp g ]
```

where `ε'` is the source adversary's EUF-CMA advantage minus signing overhead, `qH` is the number of random-oracle queries, and `|F|` is the challenge space.

The replay-based forking infrastructure records a `QueryLog` from the first run, replays it exactly up to a selected fork point, and changes one oracle response:

```lean
structure Trace where
  forgery : M × (Commit × Resp)
  roCache : (M × Commit →ₒ Chal).QueryCache
  queryLog : List (M × Commit)
  verified : Bool
```

[`VCVio/CryptoFoundations/ReplayFork.lean`](VCVio/CryptoFoundations/ReplayFork.lean)
[`VCVio/CryptoFoundations/FiatShamir/Sigma/Fork.lean`](VCVio/CryptoFoundations/FiatShamir/Sigma/Fork.lean)

Testing can check that a specific adversary fails to forge. It cannot reason about what a rewound adversary would produce, because rewinding is a meta-level operation over the adversary's entire execution trace.

---

### End-to-end EUF-CMA for Schnorr signatures

The Schnorr EUF-CMA proof composes:

1. Sigma-protocol properties (completeness, special soundness, HVZK) — proved in [`Examples/Schnorr/SigmaProtocol.lean`](Examples/Schnorr/SigmaProtocol.lean)
2. The generic Fiat-Shamir security reduction
3. The replay forking lemma
4. The DLog hardness assumption

into a single bound:

```lean
-- From Examples/Schnorr/Signature.lean:
-- ε' · ( ε' / (qH + 1)  -  1 / |F| )   ≤   Pr[ B succeeds in dlogExp g ]
```

The DLog adversary `B` is a concrete Lean function — not a proof sketch. Its type is `DLogAdversary F G`, defined as `G → G → ProbComp F`, and the bound is proved for *any* concrete EUF-CMA adversary, not just the ones a fuzzer happened to try.

---

### ML-DSA and ML-KEM: formal specs that are also executable

The lattice cryptography layer ([`LatticeCrypto/`](LatticeCrypto/)) occupies an unusual position: it contains both a formal proof-level specification *and* a concrete executable implementation of NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA). The same Lean code that participates in proofs can be compiled and run.

ML-DSA keygen in the spec layer looks exactly like its FIPS 204 counterpart:

```lean
def keygen (ring : NTTRingOps) (encoding : Encoding params)
    (prims : Primitives params encoding) :
    ProbComp (EncapsulationKey params encoding × DecapsulationKey params encoding) := do
  let d ← $ᵗ Seed32
  let z ← $ᵗ Seed32
  return keygenInternal ring encoding prims d z
```

[`LatticeCrypto/MLKEM/KEM.lean`](LatticeCrypto/MLKEM/KEM.lean)

The `$ᵗ Seed32` notation samples uniformly from the seed space — this is a concrete oracle call. When you run this code, it samples real randomness. When you prove about it, `evalDist` gives you the full probability distribution over all outputs.

---

### Differential testing closes the loop from proof to implementation

In addition to formal proofs, [`LatticeCryptoTest/`](LatticeCryptoTest/) runs the Lean spec against:

- The **NIST ACVP server** known-answer test vectors for ML-DSA-44, -65, and -87
- A **C FFI bridge** to the native `mldsa-native` v1.0.0-beta library, with byte-exact comparison

```lean
-- From LatticeCryptoTest/MLDSA/Main.lean:
check st "pk: Lean spec = mldsa-native" (pkB == pkRef)
  s!"Lean={toHex pkB} ref={toHex pkRef}"
```

This is the right division of labor: formal proofs handle the properties that no number of test vectors can establish (security reductions, adversary-quantified bounds); differential testing against NIST vectors and native implementations catches implementation bugs in the concrete layer that proofs about the abstract spec would miss.

Testing and proof are not alternatives — they check different things.

---

### UC security: compositionality that fuzzing cannot reach

For the OTP, VCV-io also proves a *Universal Composability* statement: the real OTP protocol emulates the ideal secure-message-transmission functionality, for all environments and all closed-system contexts.

```lean
-- From Examples/OneTimePad/UC.lean:
-- compEmulates_realSmcSemantics:
-- (realSmcSemantics sp readMsg P).evalDist W = (idealSmcSemantics sp P).evalDist W
-- for every W : T.Closed
```

[`Examples/OneTimePad/UC.lean`](Examples/OneTimePad/UC.lean)

UC security guarantees that the protocol stays secure when composed with arbitrary other protocols in arbitrary contexts. Fuzzing can test specific compositions; it cannot reason about arbitrary ones.

The UC framework in VCV-io is general ([`VCVio/Interaction/UC/`](VCVio/Interaction/UC/)) and covers:
- open theories and processes with typed boundaries
- parallel composition, wired composition, plugging
- `Emulates.par_compose`, `Emulates.wire_compose` as checked lemmas

---

### Quantitative cost tracking: efficiency as a provable property

The framework includes a cost model ([`VCVio/OracleComp/QueryTracking/CostModel.lean`](VCVio/OracleComp/QueryTracking/CostModel.lean)) that tracks query counts as part of the computation:

```lean
def addCostOracle [AddCommMonoid ω] (costFn : spec.Domain → ω) :
    QueryImpl spec (AddWriterT ω (OracleComp spec)) :=
  ((QueryImpl.ofLift spec (OracleComp spec)).withAddCost costFn)
```

Markov's inequality for cost distributions is a proved lemma:
```lean
-- probEvent_cost_gt_le_expectedCost_div
```

When a security bound says "assuming the adversary makes at most `qH` random-oracle queries and `qS` signing queries," VCV-io enforces this as a type-level constraint (`signHashQueryBound`), not as a comment. The bound is then proved under that hypothesis — no hand-waving about "polynomial-time adversaries."

---

### The GameHop panel: interactive proof visualization

VCV-io ships a VSCode widget ([`VCVioWidgets/GameHop/`](VCVioWidgets/GameHop/)) that renders the game-hop chain for any file annotated with `@[game_hop_root]`. The panel draws the sequence of games and their bounding steps interactively as you edit the proof.

This is a signal about what the framework is trying to be: not just a library of theorems, but a *workflow* for cryptographic software engineers — the same way a type checker gives feedback as you write code, the GameHop panel gives feedback as you write game-hopping proofs.

---

### Caveats

- **102 `sorry`s remain**, concentrated in ML-KEM/ML-DSA security proofs, Falcon, and several Mathlib-facing utilities. The concrete implementations are complete; the security reductions are still in progress.
- **No end-to-end LWE reduction proved yet** — `Examples/Regev.lean` is entirely commented out.
- **Computational complexity is not modeled** — "polynomial-time" is enforced only through query-count bounds, not circuit complexity.
- **UC composition tooling is less mature** than the IND-CPA / EUF-CMA layer; the Interaction framework is actively developed but some composition theorems are stubs.
- The asymptotic layer (`SecurityGame`, `negligible`) is the right interface for stating security, but automation for closing negligibility subgoals is limited compared to the concrete-bound layer.
