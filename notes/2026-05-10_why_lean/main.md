---
date: 2026-05-10
---


# Why Lean?

## The Threat: AI find exploit fast

- AIs like Mythos can find bugs really fast.

TODO: Attack /Defence asymmetry tilting.

## The Opportunity: Formal method used to be costly

AI now makes it cheap

## The Need

- People might want to work with 20 agents, but still want some guarantees.
- Interactive theorem proving helps.

- If we can trust Lean's type checking and Mathlib,  95%~99% of the proofs need no human review. Naively this converts to 20x~100x review efficiency. source: https://arxiv.org/abs/2604.16347 




https://blog.icme.io/vericoding-the-end-of-trust-me-bro-the-ai-wrote-it/


## UX issues

Rocq /Isbelle

### Design choices of Lean4 


Law of exclusion of middle

```lean
import Mathlib

theorem irrational_pow_irrational_rational :
    ∃ (a b : ℝ), Irrational a ∧ Irrational b ∧ ¬ Irrational (a ^ b) := by
  by_cases h : Irrational (√2 ^ √2)
  · -- Case: sqrt(2)^sqrt(2) is irrational → use it as base
    refine ⟨√2 ^ √2, √2, h, irrational_sqrt_two, ?_⟩
    show ¬Irrational ((√2 ^ √2) ^ √2)
    rw[
      ← Real.rpow_mul (Real.sqrt_nonneg 2),
      Real.mul_self_sqrt (Nat.ofNat_nonneg 2),
      Real.rpow_ofNat,
      Real.sq_sqrt (Nat.ofNat_nonneg 2)
    ]
    exact not_irrational_ofNat 2
  · -- Case: sqrt(2)^sqrt(2) is rational → we're already done
    exact ⟨√2, √2, irrational_sqrt_two, irrational_sqrt_two, h⟩
```

## Cryptography

https://github.com/Verified-zkEVM/VCV-io

## What software workflow should be covered?

## Case studies

### Lean-zip: Formal Verification of a Compression Library in Lean 4

#### Background

- **Repo**: [`kim-em/lean-zip`](https://github.com/kim-em/lean-zip) — a Lean 4 library for zlib, gzip, DEFLATE, and ZIP archive formats
- **Author**: Kim Morrison, core developer at the Lean Focused Research Organization (FRO)
- **AI co-contributor**: Claude Code is listed as a GitHub contributor; ~660 AI-assisted sessions produced ~653 merged PRs
- **Timeline**: February 19 – April 22, 2026 (roughly two months)
- **Goal**: Not just a working library — a fully *proved-correct* one, with zero unfinished proof obligations ("sorries") at completion
- **Toolchain**: Lean 4 (v4.29.1), with specs in `Zip/Spec/` (42 files, 20,606 lines) and native code in `Zip/Native/`

#### Highlights

- **Proving costs 6–20× more than writing.** Writing the DEFLATE decompressor took 4 sessions; proving it correct took 25. The compressor and full roundtrip proofs consumed ~80 sessions. The implementation is the easy part.

- **The capstone theorem is a universal guarantee.** [`inflate_deflateRaw`](https://github.com/kim-em/lean-zip/blob/e64e4cf32b603158bc914f6e73aa38ae695ae72d/Zip/Spec/DeflateRoundtrip.lean#L28-L38) states that for *every* input under 1 GiB, compress-then-decompress returns the original data exactly — a claim no test suite can make. The 1 GiB bound is an explicit zip-bomb guard, not a proof limitation; formal verification forces implicit assumptions to become named preconditions.

```lean
/-- Unified DEFLATE roundtrip: inflate ∘ deflateRaw = identity.
    This is the Phase B4 capstone theorem from PLAN.md. Generalized to any
    `maxOutputSize` large enough to hold the input. -/
theorem inflate_deflateRaw (data : ByteArray) (level : UInt8)
    (maxOutputSize : Nat) (hsize : data.size < maxOutputSize) :
    Zip.Native.Inflate.inflate (deflateRaw data level) maxOutputSize = .ok data := by
  unfold deflateRaw
  split
  · exact inflate_deflateStoredPure data _ (by omega)
  · split
    · exact inflate_deflateFixedIter data _ (by omega)
    · split
      · exact inflate_deflateLazyIter data _ hsize
      · exact inflate_deflateDynamic data _ (by omega)
```


- **Proof quality is first-class engineering.** A campaign to eliminate fragile bare `simp` tactics (which silently break as Lean's library evolves) required 30 pull requests to reduce ~129 occurrences to zero. Large proof files were split into focused modules. Reusable lemmas were extracted. The same discipline applied to code applies to proofs.

- **Security fell out as a byproduct.** Specifying what a "valid" ZIP entry *is* automatically enumerates everything it isn't. The project closed dozens of security dimensions — NUL-byte injection, ZIP64 field smuggling, malformed EOCD consistency — and the malformed-fixture test suite grew from 12 to 47 entries as proof work surfaced new edge cases. These are exactly the bugs testing rarely finds.

- **AI handles implementation; humans handle architecture.** The ~1:1 session-to-PR ratio shows a tight loop where each session yielded a mergeable contribution. Claude Code was effective at writing tactics, decomposing theorems, and mapping concepts into Lean's type system. The human expert determined *what* to prove and diagnosed deep failures — a division of labor that may define AI-assisted formal verification going forward.

Claude Code investigation shows:

- **Structural invariants that are untestable.** The Kraft inequality proof (nextCodes_plus_count_le) verifies that the canonical Huffman code assignment never overflows its code space at any bit length — a property about the internal state of a loop over arbitrary frequency distributions. No finite test set can cover all valid distributions.

- **Prefix-freedom for all code tables.** canonical_prefix_free proves that no Huffman codeword is a prefix of another, for every valid length assignment. This property is combinatorially intractable to test exhaustively (all pairs of symbols, across all valid tables).

- **Bridging the imperative/spec gap.** BitstreamCorrect.lean formally proves that the C-style BitReader (byte array + position/offset cursor) tracks the spec-level List Bool bit-by-bit at every step. Tests verify output correctness; the proof verifies that the cursor arithmetic is correct at every intermediate position — the source of the hardest-to-find off-by-one bugs in bit-packing code.

- **Algebraic checksum compositionality.** Both CRC32 and Adler-32 specs prove checksum(xs ++ ys) = f(checksum(xs), ys) for all inputs. Beyond being untestable exhaustively, this identity is what enables larger proofs to compose — the gzip roundtrip theorem reuses it directly rather than re-reasoning about the full byte stream.

- **Proofs compose; tests don't.** The capstone gzip theorem (gzip_decompressSingle_compress) assembles from ~15 sub-theorems across bitstream, Huffman, LZ77, block-framing, and checksum layers. Each layer is independently verified and then reused. In a test suite, the same logic would be re-implemented in the test harness — which is itself unverified.

- **Scale**: 20,606 lines of spec across 42 files, zero sorrys, ~653 merged PRs — the project demonstrates that this level of verification is achievable incrementally over ~660 sessions, not just in academic one-off proofs.