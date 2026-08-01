---
date: 2026-07-27
---

# Tornado Cash & Privacy Pools: Two Timelines

## 1. Technical Timeline: Zerocoin → Tornado Cash → Privacy Pools

| Date | Event |
|---|---|
| **May 2013** | **Zerocoin** proposed by Miers, Garman, Green & Rubin (Johns Hopkins) — original paper published at IEEE Symposium on Security and Privacy.[^zerocoin] Lets users convert Bitcoin into anonymous "zerocoins" and back using zero-knowledge accumulators — hides coin *origin*, but not amounts or full transaction graphs, and is computationally heavy. |
| **2014** | The **Zerocash** paper (Ben-Sasson, Chiesa, Garman, Green, Miers, Tromer, Virza) is published on the IACR Cryptology ePrint Archive.[^zerocash] Introduces **zk-SNARKs** as a practical primitive and designs a standalone currency hiding sender, receiver, *and* amount. |
| **Oct 28, 2016** | **Zcash** mainnet launches — first production deployment of zk-SNARKs — after a multi-party "trusted setup" ceremony, as documented in Zcash's own protocol documentation.[^zcash-docs] |
| **2016** | Jens Groth publishes **"On the Size of Pairing-based Non-interactive Arguments"** (Groth16) at EUROCRYPT / IACR ePrint.[^groth16] Becomes the dominant zk-SNARK construction used by Zcash, Tornado Cash, and most later systems due to its small proof size (3 group elements) and fast verification. |
| **Jan–Feb 2017** | Ethereum's **EIP-196** and **EIP-197** (co-authored by Vitalik Buterin and Christian Reitwiessner) propose precompiled contracts for elliptic-curve pairing on the alt_bn128 curve — the primitive needed to verify zk-SNARKs cheaply inside the EVM.[^eip196][^eip197] Activated in the Byzantium hard fork later that year, making an on-chain SNARK mixer computationally feasible. |
| **2019** | **Tornado Cash** launches (Roman Storm, Roman Semenov, Alexey Pertsev). Official whitepaper and source code published on the project's own GitHub.[^tornado-github] Reuses the Zerocash-lineage toolkit — Merkle-tree commitments, nullifiers, Groth16 zk-SNARKs — but as a generic, permissionless mixer bolted onto Ethereum, rather than a shielded pool inside a purpose-built currency. |
| **Sept 6, 2023** | **"Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium"** (Buterin, Illum, Nadler, Schär, Soleimani) published on SSRN.[^privacy-pools-paper] Proposes **Privacy Pools**: same cryptographic core, plus a zk-proof layer letting depositors prove membership in an "association set" that excludes known-illicit funds. |
| **2025** | **0xbow launches Privacy Pools on Ethereum mainnet** — contract layer, zk-proof layer, and Association Set Provider (ASP) layer.[^privacy-pools-mainnet] |

---

## 2. Social/Legal Timeline: Tornado Cash

| Date | Event |
|---|---|
| **2019** | Tornado Cash launches; becomes the dominant Ethereum mixer over the following years. |
| **Aug 8, 2022** | **OFAC sanctions Tornado Cash** under Executive Order 13694, adding it to the SDN list — official Treasury press release alleges over $7B laundered since 2019, including $455M by North Korea's Lazarus Group.[^treasury-2022] First time autonomous, immutable software (not a person or company) is sanctioned. |
| **Aug 2022** | Dutch authorities (FIOD) arrest developer **Alexey Pertsev** in Amsterdam on related money-laundering allegations. |
| **Nov 8, 2022** | OFAC **redesignates** Tornado Cash under additional DPRK-related authorities (E.O. 13722), superseding the original designation — per Treasury's own press release.[^treasury-redesignation] |
| **Aug 23, 2023** | DOJ/SDNY **indicts Roman Storm and Roman Semenov** on conspiracy charges (money laundering, sanctions violations, unlicensed money transmission) — official DOJ press release.[^doj-indictment] Same day, Treasury separately sanctions Semenov individually.[^treasury-semenov] |
| **May 2024** | A Dutch court sentences Pertsev to **64 months** for money laundering. |
| **Nov 26, 2024** | The **Fifth Circuit Court of Appeals** rules in *Van Loon v. Department of the Treasury* that OFAC "overstepped its congressionally defined authority" — full court opinion available via Justia.[^fifth-circuit-opinion] Holds immutable smart contracts aren't "property" under IEEPA since no one can control, alter, or exclusively own them. |
| **Mar 21, 2025** | **OFAC formally delists** Tornado Cash's website and smart contracts from the SDN list — official Treasury press release.[^treasury-delisting] Semenov personally remains sanctioned. |
| **Jul 2025** | Storm's trial begins in SDNY before Judge Katherine Polk Failla. |
| **Aug 6, 2025** | Jury **convicts Storm** on conspiracy to operate an unlicensed money-transmitting business, but **deadlocks** on money-laundering and sanctions-conspiracy counts — official DOJ/SDNY announcement.[^doj-verdict] |
| **Jan 9, 2026** | Buterin publishes a public letter (via X) backing Storm, arguing privacy tools shouldn't be criminalized — reported with direct quotes by The Block.[^buterin-letter] |
| **Mar 9–10, 2026** | DOJ files for a **retrial** on the deadlocked counts, targeting an October 2026 start. |
| **Apr 7–9, 2026** | DOJ opposes Storm's motion to dismiss/acquit; a federal judge hears oral arguments. |
| **Oct 2026 (scheduled)** | Storm's retrial on money-laundering and sanctions counts is expected to begin — up to 40 additional years of exposure if convicted. |

---

## Footnotes

[^zerocoin]: [Zerocoin: Anonymous Distributed E-Cash from Bitcoin — original paper (Johns Hopkins CS)](https://sites.cs.ucsb.edu/~rich/class/cs293b-cloud/papers/zerocoin.pdf) — also indexed at [IEEE Xplore](https://ieeexplore.ieee.org/document/6547123/)
[^zerocash]: [Zerocash: Decentralized Anonymous Payments from Bitcoin — IACR ePrint 2014/349 (original paper)](https://eprint.iacr.org/2014/349)
[^zcash-docs]: [Zcash Basics — official Zcash Documentation](https://zcash.readthedocs.io/en/latest/rtd_pages/basics.html)
[^groth16]: [On the Size of Pairing-based Non-interactive Arguments — Jens Groth, IACR ePrint 2016/260 (original paper)](https://eprint.iacr.org/2016/260)
[^eip196]: [EIP-196 — Precompiled contracts for addition and scalar multiplication on alt_bn128 (official Ethereum EIP)](https://eips.ethereum.org/EIPS/eip-196)
[^eip197]: [EIP-197 — Precompiled contracts for optimal ate pairing check on alt_bn128 (official Ethereum EIP)](https://eips.ethereum.org/EIPS/eip-197)
[^tornado-github]: [tornadocash/tornado-core — official Tornado Cash GitHub repository and whitepaper](https://github.com/tornadocash/tornado-core)
[^privacy-pools-paper]: [Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium — SSRN (original paper)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4563364)
[^privacy-pools-mainnet]: [Vitalik's investment in Privacy Pools — Gate News](https://www.gate.com/news/detail/10044898)
[^treasury-2022]: [U.S. Treasury Sanctions Notorious Virtual Currency Mixer Tornado Cash — official U.S. Department of the Treasury press release, Aug 8, 2022](https://home.treasury.gov/news/press-releases/jy0916)
[^treasury-redesignation]: [Treasury Designates DPRK Weapons Representatives (incl. Tornado Cash redesignation) — official Treasury press release, Nov 8, 2022](https://home.treasury.gov/news/press-releases/jy1087)
[^doj-indictment]: [Tornado Cash Founders Charged With Money Laundering And Sanctions Violations — official DOJ/U.S. Attorney's Office SDNY press release](https://www.justice.gov/usao-sdny/pr/tornado-cash-founders-charged-money-laundering-and-sanctions-violations)
[^treasury-semenov]: [Treasury Designates Roman Semenov, Co-Founder of Sanctioned Virtual Currency Mixer Tornado Cash — official Treasury press release](https://home.treasury.gov/news/press-releases/jy1702)
[^fifth-circuit-opinion]: [Van Loon v. Department of the Treasury, No. 23-50669 (5th Cir. 2024) — full court opinion via Justia](https://law.justia.com/cases/federal/appellate-courts/ca5/23-50669/23-50669-2024-11-26.html)
[^treasury-delisting]: [Tornado Cash Delisting — official U.S. Department of the Treasury press release, Mar 21, 2025](https://home.treasury.gov/news/press-releases/sb0057)
[^doj-verdict]: [Founder of Tornado Cash crypto mixing service convicted of knowingly transmitting criminal proceeds — official DOJ/IRS-CI announcement, Aug 6, 2025](https://www.irs.gov/node/150161)
[^buterin-letter]: [Vitalik Buterin condemns criminalization of code in appeal for Tornado Cash developer — The Block (quotes and links Buterin's original X post)](https://www.theblock.co/post/384886/vitalik-buterin-tornado-cash-developer-appeal)