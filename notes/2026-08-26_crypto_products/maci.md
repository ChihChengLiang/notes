---
title: MACI timeline
date: 2026-09-09
generated: true
---

MACI ("Minimal Anti-Collusion Infrastructure") is a set of smart contracts
and zk-SNARK circuits for running a vote — or a quadratic-funding round —
that resists bribery and vote-buying. A coordinator decrypts every
incoming vote and publishes the tally along with a zero-knowledge proof
that the tally was computed correctly from whatever it actually received
— the coordinator genuinely sees each plaintext vote; the SNARK only
stops it from lying about the result. What no *voter* can do is prove to
an outside briber how they voted: any voter can silently switch to a new
key at any time, on-chain messages are indistinguishable from each other,
and a vote-buyer can never be sure the vote they paid for wasn't secretly
overridden with a later key change, so buying votes is worthless even
with the voter's cooperation. The tradeoff baked into the name is that
correctness and censorship-resistance stay fully guaranteed by the
blockchain and the SNARK, while collusion-resistance depends on trusting a
single coordinator not to leak how people voted.

:::{timeline}
:reverse: false

July 2018 — "On-Chain Vote Buying and the Rise of Dark DAOs"
: Philip Daian, Tyler Kell, Ian Miers, and Ari Juels demonstrate a working, trustless vote-buying attack against the live CarbonVote on-chain poll, and argue that trusted hardware lets a briber demand an unforgeable cryptographic receipt of how someone voted — defeating secret-ballot protocols outright. The paper is the direct provocation for MACI: Vitalik's proposal a year later explicitly carries over its warning that TEE-based bribery remains unsolved.[@daian-dark-daos-2018]

May 2019 — Vitalik proposes MACI
: Vitalik Buterin posts "Minimal Anti-Collusion Infrastructure" to ethresear.ch, laying out the trusted-coordinator-plus-zk-SNARK design and the key-switching trick that makes vote-selling unverifiable.[@ethresearch-maci-2019]

July 2019 — First implementation begins
: Barry Whitehat starts building the first MACI implementation on GitHub, kicking off years of community development alongside contributors including Kendrick Tan, Kobi Gurkan, and Koh Wei Jie.[@barrywhitehat-maci-github]

2020 — clr.fund launches the first production deployment
: Auryn Macmillan founds clr.fund,[@iqwiki-auryn-macmillan] which runs Round 0, the first real-world use of MACI: ten recipient projects split a roughly $1,000 Ethereum Foundation matching pool, funded quadratically from seventeen contributors, with the quadratic-funding tally computed inside a MACI zk-SNARK.[@clrfund-round0-review]

October 2021 — MACI 1.0 released
: The Ethereum Foundation's Privacy & Scaling Explorations (PSE) team ships MACI 1.0, a major rewrite audited by Hashcloak, with better developer experience and lower gas costs.[@maci-1-0-release-2021]

January 2023 — MACI v1.1.1 released
: A security- and feature-focused release, alongside a documentation refresh, aimed at making MACI easier for outside teams to integrate.[@maci-v1-1-1-release-2023]

January 2024 — Push toward real-world adoption
: PSE's 2024 roadmap prioritizes developer experience and "real-world adoption through practical implementations," naming active conversations with Gitcoin Grants Stack and Optimism RetroPGF, plus an in-progress upgrade for clr.fund — MACI's original production integrator since 2020.[@maci-2024-roadmap]

February 2024 — CRISP proposed as MACI's successor design
: Gnosis Guild's Auryn Macmillan posts "Collusion-Resistant Impartial Selection Protocol (CRISP)" to ethresear.ch, framed explicitly as fixing MACI's single-coordinator weakness: a Coordinator Committee holds a threshold key, anyone can tally homomorphically over the published vote ciphertexts, and only a threshold of the committee decrypts the final result — the design that ships two years later as Interfold.[@crisp-ethresearch-2024]

August 2024 — MACI v2.0 released
: A major version bump modernizing the circuits and contracts underpinning every later release.[@maci-v2-0-release-2024]

June 2025 — MACI v3.0.0 released
: The last major version released before the project's steward team was wound down a year later.[@maci-github-releases]

August 2025 — MACI Aragon Plugin
: The team pivots part of its focus from quadratic funding toward DAO governance, shipping a voting plugin for the Aragon OSx stack on the thesis that private ballots increase honest participation by removing social pressure and fear of retaliation.[@maci-aragon-plugin-2025]

September 2025 — MACI Coordinator Service launched
: PSE ships a hosted coordinator (tallier + prover) service, removing one of the biggest technical barriers — running your own coordinator infrastructure — to standing up a MACI round.[@maci-coordinator-service-2025]

October–November 2025 — Gitcoin's GG24 Privacy Round
: Gitcoin Grants 24 runs a dedicated MACI private-voting round as one of six funding mechanisms in its "Gitcoin 3.0" architecture, funding 93 privacy and ZK projects from 7,427 votes and 35.41 WETH — MACI's largest live deployment to date, though the retrospective flags last-minute contract redeployment issues and recommends the newer "Privote" frontend on MACI v3 for future rounds.[@gitcoin-gg24-retrospective-2025]

June 2026 — Ethereum Foundation winds down PSE
: Amid cutting 54 jobs and roughly 40% of its budget, the Ethereum Foundation winds down Privacy & Scaling Explorations — the team that built, audited, and maintained MACI for its entire production life.[@unchained-ef-cuts-2026]

June 2026 — Interfold arrives, without a trusted coordinator
: Gnosis Guild — co-founded by Auryn Macmillan, the same person who founded clr.fund in 2020[@iqwiki-auryn-macmillan] — launches Interfold, with Aragon backing it as a generalized privacy protocol for voting and sealed-bid auctions that reaches a verifiable shared outcome from encrypted inputs via distributed, threshold execution and no single trusted operator ever seeing the plaintext. Vitalik Buterin calls it "basically what I've been yelling at people to build with the MACI ideas... for almost a decade, and now it exists, in a generalized form."[@theblock-interfold-2026] [@vitalik-interfold-tweet-2026]

August 19, 2026 — Interfold's Network Alpha goes live on mainnet
: The protocol's first production deployment ships with deliberately bounded capacity: early ciphernode committees cap out at 19 operators with a 9-of-19 threshold required for decryption — a controlled rollout rather than the fully open, permissionless network the design ultimately targets.[@interfold-network-alpha-2026]

August 19, 2026 — The MACI repository is archived
: On the same day Interfold's Network Alpha goes live, github.com/privacy-scaling-explorations/maci is marked archived and read-only — the trusted-coordinator original giving way, on the very same day, to its trustless-by-construction successor.[@maci-github-releases]

:::

## How Interfold actually removes the coordinator

MACI's coordinator decrypts every vote in plaintext to compute the tally,
then proves after the fact that the published tally matches what it saw —
a guarantee about the *output*, not about who got to see the *input*.
Collusion-resistance rested entirely on trusting that one party not to
leak, or not to be bribed into leaking.

Auryn Macmillan's CRISP design — proposed on ethresear.ch in February
2024, two years before it shipped as part of Interfold — removes that
trust requirement structurally rather than just asking for it, and is
explicit about the lineage: it's pitched as "an incremental improvement
to MACI."[@crisp-ethresearch-2024] Interfold implements it on top of its
own "Encrypted Execution Environment" primitive, a generalization of
Gnosis Guild's earlier Enclave protocol, shipping in May 2026.[@cryptobriefing-crisp-2026]
Votes are encrypted under a threshold key generated via distributed key
generation by a sortition-selected committee of "ciphernodes"; a compute
provider tallies them homomorphically without ever decrypting anything;
only the final aggregate is decrypted at the end, and that requires a
threshold of the committee — 9 of 19, in Network Alpha — to cooperate.[@interfold-e3-explainer] [@interfold-how-it-works]
No single ciphernode, and by design no colluding subset below threshold,
ever holds a decryptable individual vote, because the key shares are
scoped to releasing that computation's one defined output, not a
general-purpose key for arbitrary ciphertexts.[@interfold-e3-explainer]

The trust hasn't vanished — it's moved and shrunk: from one named
coordinator to a threshold of a rotating committee, and from "promises
not to peek" to "structurally can't produce an individual plaintext vote
even if it wanted to." Network Alpha's 19-node cap is a reminder that this
is still an early, deliberately bounded production system, not yet a
fully proven one.

## The arc, in one line

MACI spent its whole production life trading one piece of trust — a
coordinator who could theoretically see how you voted — for practical
deployability, and it got seven years of real usage (clr.fund, Gitcoin
Grants, DAO tooling) out of that tradeoff before the field caught up to
removing it entirely.

:::{bibliography}
:::
