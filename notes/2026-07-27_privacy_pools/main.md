---
date: 2026-07-27
---

# Tornado Cash & Privacy Pools: Two Timelines

## 1. Technical Timeline: Zerocoin → Tornado Cash → Privacy Pools

:::{timeline}

May 2013 — Zerocoin proposed
: Miers, Garman, Green & Rubin (Johns Hopkins) publish the original Zerocoin paper at IEEE S&P.[@zerocoin] Lets users convert Bitcoin into anonymous "zerocoins" and back using zero-knowledge accumulators — hides coin *origin*, but not amounts or full transaction graphs, and is computationally heavy.

2014 — Zerocash paper
: Ben-Sasson, Chiesa, Garman, Green, Miers, Tromer & Virza publish Zerocash on the IACR Cryptology ePrint Archive.[@zerocash] Introduces **zk-SNARKs** as a practical primitive and designs a standalone currency hiding sender, receiver, *and* amount.

Oct 28, 2016 — Zcash mainnet launches
: First production deployment of zk-SNARKs, after a multi-party "trusted setup" ceremony, as documented in Zcash's own protocol documentation.[@zcash-docs]

2016 — Groth16 published
: Jens Groth publishes "On the Size of Pairing-based Non-interactive Arguments" at EUROCRYPT / IACR ePrint.[@groth16] Becomes the dominant zk-SNARK construction used by Zcash, Tornado Cash, and most later systems due to its small proof size (3 group elements) and fast verification.

Jan–Feb 2017 — EIP-196 & EIP-197 proposed
: Ethereum's precompiled contracts for elliptic-curve pairing on the alt_bn128 curve, co-authored by Vitalik Buterin and Christian Reitwiessner.[@eip196][@eip197] The primitive needed to verify zk-SNARKs cheaply inside the EVM — activated in the Byzantium hard fork later that year, making an on-chain SNARK mixer computationally feasible.

2019 — Tornado Cash launches
: Roman Storm, Roman Semenov & Alexey Pertsev publish the whitepaper and source code on the project's own GitHub.[@tornado-github] Reuses the Zerocash-lineage toolkit — Merkle-tree commitments, nullifiers, Groth16 zk-SNARKs — but as a generic, permissionless mixer bolted onto Ethereum, rather than a shielded pool inside a purpose-built currency.

Sept 6, 2023 — Privacy Pools paper
: Buterin, Illum, Nadler, Schär & Soleimani publish "Blockchain Privacy and Regulatory Compliance: Towards a Practical Equilibrium" on SSRN.[@privacy-pools-paper] Proposes **Privacy Pools**: same cryptographic core, plus a zk-proof layer letting depositors prove membership in an "association set" that excludes known-illicit funds.

2025 — Privacy Pools mainnet
: 0xbow launches Privacy Pools on Ethereum mainnet — contract layer, zk-proof layer, and Association Set Provider (ASP) layer.[@privacy-pools-mainnet]

:::

---

## 2. Social/Legal Timeline: Tornado Cash

:::{timeline}

2019 — Tornado Cash launches
: Becomes the dominant Ethereum mixer over the following years.

Aug 8, 2022 — OFAC sanctions Tornado Cash
: Added to the SDN list under Executive Order 13694 — official Treasury press release alleges over \$7B laundered since 2019, including \$455M by North Korea's Lazarus Group.[@treasury-2022] First time autonomous, immutable software (not a person or company) is sanctioned.

Aug 2022 — Pertsev arrested
: Dutch authorities (FIOD) arrest developer Alexey Pertsev in Amsterdam on related money-laundering allegations.

Nov 8, 2022 — OFAC redesignation
: OFAC redesignates Tornado Cash under additional DPRK-related authorities (E.O. 13722), superseding the original designation.[@treasury-redesignation]

Aug 23, 2023 — Storm & Semenov indicted
: DOJ/SDNY indicts Roman Storm and Roman Semenov on conspiracy charges (money laundering, sanctions violations, unlicensed money transmission).[@doj-indictment] Same day, Treasury separately sanctions Semenov individually.[@treasury-semenov]

May 2024 — Pertsev sentenced
: A Dutch court sentences Pertsev to **64 months** for money laundering.

Nov 26, 2024 — Fifth Circuit ruling
: The Fifth Circuit Court of Appeals rules in *Van Loon v. Department of the Treasury* that OFAC "overstepped its congressionally defined authority".[@fifth-circuit-opinion] Holds immutable smart contracts aren't "property" under IEEPA since no one can control, alter, or exclusively own them.

Mar 21, 2025 — OFAC delisting
: OFAC formally delists Tornado Cash's website and smart contracts from the SDN list.[@treasury-delisting] Semenov personally remains sanctioned.

Jul 2025 — Storm's trial begins
: Storm's trial begins in SDNY before Judge Katherine Polk Failla.

Aug 6, 2025 — Storm convicted, jury deadlocks
: Jury convicts Storm on conspiracy to operate an unlicensed money-transmitting business, but deadlocks on money-laundering and sanctions-conspiracy counts.[@doj-verdict]

Jan 9, 2026 — Buterin backs Storm
: Buterin publishes a public letter (via X) backing Storm, arguing privacy tools shouldn't be criminalized.[@buterin-letter]

Mar 9–10, 2026 — DOJ files for retrial
: DOJ files for a **retrial** on the deadlocked counts, targeting an October 2026 start.

Apr 7–9, 2026 — Motion to dismiss opposed
: DOJ opposes Storm's motion to dismiss/acquit; a federal judge hears oral arguments.

Oct 2026 (scheduled) — Retrial expected
: Storm's retrial on money-laundering and sanctions counts is expected to begin — up to 40 additional years of exposure if convicted.

:::


:::{bibliography}
:::