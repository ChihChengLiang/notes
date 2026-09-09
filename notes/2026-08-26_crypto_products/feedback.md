# Feedback / gaps tracker — "The Nature of Cryptography Products"

Not for publication (not in SUMMARY.md, won't render). Working notes on structure and argument gaps, for the author to resolve — no content written here.

## Open threads (promised, not paid off)

- [ ] **Substitution vs. generation view drops out.** The intro sets up this as the central dichotomy, but nothing after the Introduction section explicitly revisits it. The rest of the piece (Johnny's properties, credence goods, implicit/explicit) reads as an argument mostly *about* substitution-view products (invisible, credence-good, indistinguishable-from-a-trusted-third-party). Where do generation-view products (things crypto makes newly possible) fit this framework? Do they escape the credence-good trap because their novelty is visible, or are they just as opaque?
- [ ] **"We'll come back to these" (non-profit / for-profit / government products) never happens.** Line ~29 promises a return to who builds these products, but the essay never sorts or revisits the named products along that axis. Either pay it off or cut the promise.
- [ ] **Opening question never gets a direct answer.** "Do cryptography products create a genuinely new experience for users?" is the essay's frame, but the ending's three takeaways are about product-design tactics, not a verdict on the opening question. Worth a closing paragraph that answers it directly (even if the answer is "it depends, here's the axis").
- [ ] **"Why, what, how, and who" (end of Introduction) is under-delivered.** The intro promises the piece will illuminate why/what/how we build and who we build for. The conclusion only really addresses "what" (which components) and a bit of "how" (absorb vs. educate). "Who builds this" is untouched.

## Frameworks that need bridging

The essay builds three separate frameworks in sequence but doesn't state how they relate to each other. Right now it reads as three mini-essays stapled together:

1. Johnny's five properties (+ your added "adversarial driven")
2. Credence good / experience good / search good
3. Implicit vs. explicit + the human-in-the-loop ladder

- [ ] Is credence-good-ness a *cause* of some of Johnny's properties (e.g. lack of feedback, abstraction), or an independent lens on the same phenomenon? Right now they're presented as parallel without a stated relationship.
- [ ] Where does a credence good sit on the implicit/explicit ladder? Can a credence good ever reach "invisible," or is it structurally stuck at "requires attention" because verification is impossible by definition? This feels like the most natural synthesis point in the piece and it's currently missing.
- [ ] The conclusion's three takeaways only use the credence-good framework. Johnny's properties and the ladder don't cash out into the ending at all — either fold them in or make clear why they were scene-setting rather than load-bearing.

## Uneven treatment

- [ ] **The abstraction property section has no prose** — just the block quote, no worked example or commentary, unlike every other property (unmotivated user, feedback, barn door, weakest link, adversarial driven) which gets 1–2 paragraphs. Reads as an accidental gap rather than a deliberate short entry.
- [ ] **"Sometimes this is also an acceptable place to stop"** (adopted-but-requires-attention tier) — under what conditions is stopping at "explicit" acceptable vs. a failure to reach "invisible"? Currently asserted, not argued.
- [ ] **HTTPS is reused as the go-to invisibility example three times** (intro anecdote, engineered-invisibility bullet, ladder's "Invisible" tier). Consider whether a second example would carry more weight than repetition.

## Definitional gaps

- [ ] **What counts as a "cryptography product" is never pinned down.** Most of the worked examples in the credence-good section (antivirus, VPN, dark-web monitoring, PC cleaner, ad blockers) aren't cryptography products at all — they're security/privacy software more broadly, several with no cryptography involved. If the claim is "cryptography products are a subset of credence/security goods," that subset relationship should be stated; otherwise the essay's scope silently drifts from "cryptography" to "security software in general."
- [ ] **"Crypto" drifts between two meanings** — cryptography-the-field (FHE games, zkID, wallets) and crypto-the-asset-class (cryptocurrency, USD-to-crypto swap). The intro's cryptocurrency example is doing double duty as both. Might be worth flagging explicitly where the argument is about cryptography-as-technique vs. cryptocurrency-as-asset, since they don't always face the same UX problem.

## Smaller notes

- [ ] MACI bullet and the zkID deniable-proof bullet are both fairly dense/jargon-heavy compared to the rest of "Weird product features" — but you've already flagged that whole section as back-burner, so may not be worth touching yet.
- [ ] No counterargument or limits-of-the-analogy section for the credence-good framing itself (e.g., where the doctor/mechanic analogy breaks down for software). Not required, but its absence means the framework is asserted rather than stress-tested.
