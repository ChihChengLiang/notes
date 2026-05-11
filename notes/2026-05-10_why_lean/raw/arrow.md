# Timeline Analysis: Arrow's Impossibility Theorem in Lean 4

This [repo](https://github.com/ChihChengLiang/arrow/blob/main/Arrow/Arrow.lean) is a formal proof of **Arrow's Impossibility Theorem** in Lean 4, spanning Feb 22 – Apr 23, 2026 across **330 commits**. The commit messages tell a very honest story of where the math met the type system.

---

## Phase 1 — Type System Whiplash (Feb 22–23, ~15 commits)

The project started fast but immediately hit a wall with Lean's order hierarchy. Within 24 hours of the first commit:

- `"antisymm is a total failure"` — Feb 23
- `"stuck at linear order"` — Feb 23
- `"sweep types under the carpet"` — Feb 23
- `"debugging preferAoverB"`, `"fix AIIA"`, `"fix a b direction"` — all Feb 23

The author knew the math but fought Lean's `Preorder` / `LinearOrder` / antisymmetry infrastructure hard from day one. The "sweep types under the carpet" message is telling — a pragmatic retreat that would come back to haunt them (see Phase 4).

---

## Phase 2 — Proof Skeleton, Slow Progress (Feb 24–Mar 2, ~37 commits)

This phase is more methodical but peppered with `WIP` commits (10 of them in this window) and one particularly expressive message:

- `"WIP stucked"` — Feb 27
- `"seemingly falsy thing"` — Feb 27 (committed code they weren't sure was correct)
- `"paper notes"` — Feb 25 (had to go back to the source paper to re-read)
- `"new swapping_k seems working"` — Mar 2 (the word "seems" is key)

The author was building the pivotal voter machinery — the hardest conceptual part of the proof — and clearly wasn't sure the approach was even right.

---

## Phase 3 — The PivotalVoter Grind (Mar 3–6, ~56 commits)

**Mar 4–5 alone: 37 commits.** This is the emotional core of the repo. The commit density is extraordinary — 17 on Mar 4, 20 on Mar 5:

- `"recursion version WIP"` — tried a recursive approach that didn't pan out
- `"WIP n_ab ≤ n_bc"`, `"WIP"` × 5 — stuck on the same inequality chain
- `"what it takes to complete the proof?"` — Mar 5 (a question committed to git history)
- `"attempt to define swapping"`, `"rm swapping_k2"`, `"rm swappingProfileAB"` — multiple swapping designs tried and discarded

Then Claude AI was brought in: `"add claude"`, `"claude code conquered flip_exists"`, `"claude code completes n_bc ≤ n_cb"`, `"claudecode final touch"` — all Mar 4–5.

The payoff came Mar 6:

> **`"GOT pivotalVoter FINAAAALLLY"`** — all caps, the only celebration commit in the repo

---

## Phase 4 — The Total Order Crisis (Mar 7–15, ~130 commits)

The biggest crisis, spawning a long-lived branch `get-total-order-right`. **Mar 7 had 38 commits** — the busiest single day — mostly renaming, cleanup, and a massive conceptual restructuring. The problem: the order representation from Phase 1 wasn't right.

Key signals of sustained struggle:
- Branch `get-total-order-right` ran from ~Mar 7 to Mar 15, requiring **5 merges** from main
- `"attempt to intro weakprefer"` — Mar 8 (trying a new design)
- `"Claude design new prefer with Tie"`, `"claude attempt of order with ties"` — Mar 14 (Claude was brought in again to redesign the preference type)
- `"fixed all the AIIA proofs"` — Mar 14 (the order redesign broke all the AIIA lemmas; had to redo them)
- `"fixed some existing broken proofs"` — Mar 15
- `"we don't need Linear order actually"` — Mar 16 (after all that fighting with LinearOrder, it turned out not to be needed)

The resolution: `"Get total order right (#6)"` merged Mar 15, followed by `"rename preorder to total order"` Mar 16 — a belated conceptual rename after the implementation was finally correct.

---

## Phase 5 — Proof Cleanup & Simplification (Mar 16–19, ~60 commits)

After the crisis resolved, the author went on a long cleanup run: `@[simp]` annotations, removing helper lemmas, extracting shared lemmas. Multiple commits per day with names like `"ocd"`, `"ocd rm bracket"`, `"nitpick"` × many. This is the author being satisfied and polishing, not struggling.

One unmerged experiment: `"WIP: Extract preferLE to eliminate prefer_le duplication"` on Mar 18–19 (branch `claude-extraction`) — left as WIP, never merged.

---

## Phase 6 — Documentation Struggles (Mar 27 – Apr 23, ~20 commits)

Getting docs to build proved surprisingly painful:

- First attempt (`docbuild/`) — abandoned
- `"Doc take 2 (#10)"` — Mar 27, had to redo the doc setup
- `"try verso"` — Apr 22 (tried the Verso documentation tool)
- Then 11 rapid commits Apr 23: move Arrow into sub-package, rm Main.lean, rm doc build, update CI, `"rm working dir"`, `"use lake-package-directory"` — classic yak-shaving
- Final result: `"Verso take2 (#11)"` — the "take2" in the title says it all

---

## Summary

| Period | What happened | Struggle level |
|---|---|---|
| Feb 22–23 | Type system fights, LinearOrder | High |
| Feb 24–Mar 2 | Proof skeleton, repeated WIPs | Medium-High |
| Mar 3–6 | PivotalVoter — 37 commits in 2 days | **Peak** |
| Mar 7–15 | Total order redesign, broke everything | **Peak** |
| Mar 16–19 | Cleanup/polish, @[simp] pass | Low |
| Mar 27–Apr 23 | Documentation tooling hell | Medium |

The two hardest parts of the proof — the pivotal voter construction and getting the order type right — correspond exactly to the two hardest parts of Arrow's theorem mathematically. The commit history is an honest, unfiltered record of that difficulty.
