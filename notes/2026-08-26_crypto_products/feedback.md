# Feedback / gaps tracker — "The Nature of Cryptography Products"

Not for publication (not in SUMMARY.md, won't render). Working notes on structure and argument gaps, for the author to resolve — no content written here.

Updated after the "Definitions and boundaries" and "Credence-goodness is relative" / "Resolve and refine" additions.

## Resolved since last pass

- [x] **Substitution vs. generation view no longer drops out.** "Resolve and refine on the substitution vs. generation" ties it back explicitly using the zkp2p example and the relativity-of-credence-goodness idea (layperson sees substitution, expert sees generation).
- [x] **Abstraction property now has prose.** The new paragraphs on digital signatures and analogy-failure fill what was previously just a bare block quote.
- [x] **"What counts as a crypto product" is now defined.** The new "Definitions and boundaries" section gives a working definition plus is/isn't lists (Signal, HTTPS, PGP, Dark Forest, wallets, TOTP vs. Rotki, Etherscan, l2beat, antivirus, bank apps, dev tooling).
- [x] **Crypto-the-field vs. crypto-the-asset drift is substantially reduced.** Separating "crypto products" from "products related to cryptocurrencies" (Rotki, Etherscan, l2beat) gives readers a clear axis to hold onto.
- [x] **One framework-bridging link now exists.** "Usually this is the abstraction, lack-of-feedback, and barn-door properties combining to produce the unmotivated-user problem" (under Underuse) explicitly connects Johnny's properties to the credence-good discussion. This was flagged as missing last round — worth doing the same for the other two properties (weakest link, adversarial-driven) if you want the bridge to feel complete.

## Still open from before

- [ ] **Opening question still isn't answered head-on.** "Do cryptography products create a genuinely new experience for users?" now effectively *has* an answer buried in "Resolve and refine" (depends on the user's expertise), but it's never stated as an answer to the opening question, and the conclusion doesn't reference it either.
- [ ] **"Why, what, how, and who"** — "what" is now well covered (Definitions section) and "how" gets partial coverage (underuse/misuse, absorb-vs-educate). "Who should build this" is still untouched anywhere in the piece.
- [ ] **"Sometimes this is also an acceptable place to stop"** (adopted-but-requires-attention tier) — still asserted, not argued.
- [ ] **Conclusion still only harvests the credence-good framework**, and now there's more on the table it could pull from: the underuse/misuse split, the relativity-of-credence-goodness point, and the substitution/generation resolution none currently show up in "What can we think better about crypto products?"

## New since this pass

- [ ] **SMS-2FA sits under the "Here are crypto products" list but is described as having no cryptography at work.** It reads like a deliberate contrast bullet (TOTP vs. SMS), but as currently placed it's a counter-example living inside the "yes" list rather than the "no" list — worth moving down to the "not crypto products" list, or making the contrast structure explicit (e.g. a paired sub-bullet).
- [ ] **The claim "Johnny's properties are the *real* distinguishing feature of crypto products" is asserted but not tested against the examples.** The actual criterion used to sort the is/isn't lists is "does it use cryptography," not "does it exhibit Johnny's five properties." If there's a non-crypto product that also exhibits abstraction / lack-of-feedback / barn-door (e.g. legal contracts, insurance policies), Johnny's properties alone wouldn't distinguish crypto products either — worth either testing this claim against a counterexample or softening it.
- [ ] **The credence-good section's software examples (antivirus, VPN, PC cleaner, ad blockers) are all things the new Definitions section explicitly excludes from "crypto products."** This was a soft tension before; now that crypto products have a strict definition, it's sharper. Probably fine as a deliberate move (establish the general economic concept with familiar examples, then narrow to crypto), but a single bridging sentence would keep a careful reader from wondering if the two sections contradict each other.
- [ ] **The substitution/generation "resolution" quietly changes the question.** It resolves "is this cryptographically new" into "does this *feel* new to a given user" (a function of their expertise). That's a reasonable and interesting move, but it's a reframing of the original dichotomy rather than a resolution of it as originally posed — might be worth one sentence owning that shift explicitly, so it doesn't read as sleight of hand.

## Resolved by the Implicit/Explicit consolidation

- [x] **HTTPS repetition reduced.** The "Engineered invisibility" bullet (which restated the same point as the ladder's "Invisible" tier) is gone — HTTPS now anchors invisibility once instead of twice.
- [~] **Implicit/explicit ladder is now nested under "Credence good" as a subsection**, which visually gestures at the bridge between the two frameworks — but no prose actually states the relationship yet. The section still opens cold right after the zkp2p paragraph; one transition sentence would earn the new nesting instead of just asserting it via heading level. Not fully resolved, but the structural setup is there now.

## New from this edit

- [ ] **The obscurity vs. engineered-invisibility distinction is gone**, along with the definition of what "invisible" actually means (verified behind the scenes, not just hidden) and the blind-signing example. Nothing else in the piece now marks the difference between invisible-and-safe vs. invisible-and-still-risky — worth checking this was deliberately cut rather than lost in the merge, since it was doing real conceptual work.
