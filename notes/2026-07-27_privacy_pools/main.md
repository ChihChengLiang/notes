---
date: 2026-07-27
---

# Tornado Cash & Privacy Pools: Two Timelines

## 1. Technical Timeline: Zerocoin → Tornado Cash → Privacy Pools

| Date | Event |
|---|---|
| **May 2013** | **Zerocoin** proposed by Matthew Green and researchers at Johns Hopkins (Ian Miers, Christina Garman, et al.).[^zerocoin] Lets users convert Bitcoin into anonymous "zerocoins" and back using zero-knowledge accumulators — hides coin *origin*, but not amounts or full transaction graphs, and is computationally heavy. |
| **2014** | The **Zerocash** paper (Ben-Sasson, Chiesa, Garman, Green, Miers, Tromer, Virza) is published.[^zerocash] Introduces **zk-SNARKs** as a practical primitive and designs a standalone currency hiding sender, receiver, *and* amount. |
| **2015** | Zooko Wilcox-O'Hearn founds the Zerocoin Electric Coin Company to commercialize the Zerocash protocol.[^zcash-founding] |
| **Oct 28, 2016** | **Zcash** mainnet launches — first production deployment of zk-SNARKs — after a multi-party "trusted setup" ceremony.[^zcash-launch] |
| **2016–2018** | Zcash's "Sprout" era; Groth16 proof system (2016) makes SNARKs far smaller and cheaper, paving the way for SNARKs inside smart contracts rather than only dedicated L1s. |
| **2017** | Ethereum's Byzantium upgrade adds elliptic-curve pairing precompiles — the primitive needed to verify zk-SNARKs cheaply inside the EVM, making an on-chain SNARK mixer feasible. |
| **2019** | **Tornado Cash** launches (Roman Storm, Roman Semenov, Alexey Pertsev).[^tornado-launch] Reuses the Zerocash-lineage toolkit — Merkle-tree commitments, nullifiers, Groth16 zk-SNARKs — but as a generic, permissionless mixer bolted onto Ethereum, rather than a shielded pool inside a purpose-built currency. |
| **Sept 6, 2023** | **"Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium"** (Buterin, Illum, Nadler, Schär, Soleimani) proposes **Privacy Pools**: same cryptographic core, plus a zk-proof layer letting depositors prove membership in an "association set" that excludes known-illicit funds.[^privacy-pools-paper] |
| **2025** | **0xbow launches Privacy Pools on Ethereum mainnet** — contract layer, zk-proof layer, and Association Set Provider (ASP) layer; Vitalik Buterin and other Ethereum devs deposit ETH to signal support.[^privacy-pools-mainnet] |

---

## 2. Social/Legal Timeline: Tornado Cash

| Date | Event |
|---|---|
| **2019** | Tornado Cash launches; becomes the dominant Ethereum mixer over the following years. |
| **Aug 8, 2022** | **OFAC sanctions Tornado Cash** under Executive Order 13694, adding it to the SDN list — alleging over $7.6B laundered since 2019, including $455M by North Korea's Lazarus Group.[^ofac-sanctions] First time autonomous, immutable software (not a person or company) is sanctioned. |
| **Aug 2022** | Dutch authorities (FIOD) arrest developer **Alexey Pertsev** in Amsterdam.[^pertsev-case] |
| **Aug 2023** | DOJ indicts **Roman Storm and Roman Semenov** on conspiracy charges (unlicensed money transmission, money laundering, sanctions violations).[^storm-indictment] |
| **Nov 2023** | Sinbad.io, a mixer Lazarus pivoted to post-sanctions, is seized by US authorities.[^ofac-sanctions] |
| **May 2024** | A Dutch court sentences Pertsev to **64 months** for laundering over $2 billion.[^pertsev-case] |
| **Nov 2024** | The **Fifth Circuit Court of Appeals** rules OFAC "overstepped its congressionally defined authority," holding immutable smart contracts aren't "property" under IEEPA since no one can control or exclusively own them.[^fifth-circuit] |
| **Jan 23, 2025** | Trump signs **Executive Order 14178** on digital-asset policy. |
| **Feb 6–7, 2025** | A Dutch court suspends Pertsev's pretrial detention; he's released under electronic monitoring pending appeal.[^pertsev-release] |
| **Mar 21, 2025** | **OFAC formally delists** Tornado Cash's website and smart contracts from the SDN list (Semenov personally remains sanctioned).[^ofac-delisting] |
| **Jul 2025** | Storm's trial begins in SDNY before Judge Katherine Polk Failla. |
| **Aug 6, 2025** | Jury **convicts Storm** on conspiracy to operate an unlicensed money-transmitting business, but **deadlocks** on money-laundering and sanctions-conspiracy counts.[^storm-verdict] |
| **Jan 2026** | Buterin publishes an open letter calling for leniency, arguing the case shouldn't criminalize open-source development.[^storm-legal-analysis] |
| **Mar 9–10, 2026** | DOJ files for a **retrial** on the deadlocked counts, targeting an October 2026 start.[^storm-retrial] |
| **Apr 7–9, 2026** | DOJ opposes Storm's motion to dismiss/acquit; a federal judge hears oral arguments on the acquittal motion.[^storm-dismissal] |
| **Oct 2026 (scheduled)** | Storm's retrial on money-laundering and sanctions counts is expected to begin — up to 40 additional years of exposure if convicted. |

*Parallel thread: Samourai Wallet's founders pleaded guilty around the same time as Storm's initial verdict, part of a broader wave of U.S. enforcement against non-custodial privacy-tool developers.[^storm-verdict]*



[^zerocoin]: [What is Zcash (ZEC)? The Privacy Coin Using Zero-Knowledge Proofs — Yahoo Finance](https://finance.yahoo.com/news/zcash-zec-privacy-coin-using-172352522.html)
[^zerocash]: [What Is Zcash (ZEC)? — DEXTools News](https://www.dextools.io/tutorials/what-is-zcash-zec-privacy-coin-zk-snarks-guide-2026)
[^zcash-founding]: [Understanding Zcash: A Comprehensive Overview — Messari](https://messari.io/report/understanding-zcash-a-comprehensive-overview)
[^zcash-launch]: [Zcash Basics — Zcash Documentation](https://zcash.readthedocs.io/en/latest/rtd_pages/basics.html)
[^tornado-launch]: [Roman Storm Verdict: What it Means for Crypto Developers — Hodder Law](https://hodder.law/roman-storm-tornado-cash-verdict-crypto-developers/)
[^privacy-pools-paper]: [Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium — SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)
[^privacy-pools-mainnet]: [Vitalik's investment in Privacy Pools — Gate News](https://www.gate.com/news/detail/10044898)
[^ofac-sanctions]: [U.S. Treasury removed sanctions against the crypto mixer service Tornado Cash — Security Affairs](https://securityaffairs.com/175718/security/u-s-treasury-removed-sanctions-tornado-cash.html)
[^pertsev-case]: [Developer Freed: Tornado Cash's Alexey Pertsev Out of Prison — AInvest](https://www.ainvest.com/news/developer-freed-tornado-cash-s-alexey-pertsev-out-of-prison-2502101060ac71806a874f06/)
[^storm-indictment]: [U.S. Treasury Lifts Tornado Cash Sanctions Amid North Korea Money Laundering Probe — The Hacker News](https://thehackernews.com/2025/03/us-treasury-lifts-tornado-cash.html)
[^fifth-circuit]: [A Legal Whirlwind Settles: Treasury Lifts Sanctions on Tornado Cash — Venable LLP](https://www.venable.com/insights/publications/2025/04/a-legal-whirlwind-settles-treasury-lifts-sanctions)
[^pertsev-release]: [Tornado Cash Developer Alexey Pertsev Granted Conditional Release Amid Appeal — Coin360](https://coin360.com/news/tornado-cash-pertsev-release)
[^ofac-delisting]: [US v. Storm: DeFi Legal Precedent — DeFi Education Fund](https://www.defieducationfund.org/us-v-storm-background-timeline/)
[^storm-verdict]: [Roman Storm Verdict: Tornado Cash Co-Founder Guilty on One Charge — Cointribune](https://www.cointribune.com/en/roman-storm-tornado-cash-verdict/)
[^storm-legal-analysis]: [Roman Storm Verdict: What it Means for Crypto Developers — Hodder Law](https://hodder.law/roman-storm-tornado-cash-verdict-crypto-developers/)
[^storm-retrial]: [US prosecutors seek October 2026 retrial for Tornado Cash co-founder Roman Storm — The Block](https://www.theblock.co/post/392937/roman-storm-tornado-cash-retrial)
[^storm-dismissal]: [DoJ Blocks Roman Storm's Dismissal Bid in Tornado Cash Case — CCN.com](https://www.ccn.com/news/crypto/roman-storm-doj-block-tornado-cash-case-whats-next/)