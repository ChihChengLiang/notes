---
title: ZK Email timeline
date: 2026-09-06
generated: true
---

[ZK Email](https://zk.email) lets you prove facts about an email — that it
came from a given domain, that it says a specific thing — without revealing
the email itself, by turning its DKIM signature into a zero-knowledge proof.
Below is how the project got here, and what it's actually being used for.

:::{timeline}
:reverse: false

2022 — First prototype
: Aayush Gupta and Sampriti Panda build the first zk-email proof of concept, showing that a DKIM-signed email can double as a zero-knowledge-provable credential. Sora Suegami and a wider team join soon after, taking it toward production. The project is picked up under the Ethereum Foundation's Privacy & Scaling Explorations (PSE) group, with early support from 0xPARC. [@zkemail-origin-blog] [@pse-zkemail]

2023 — First audit
: Y Academy completes the first security audit, covering the circom dependencies and helper templates underlying the zk-email-verify circuits.[@zkemail-audits]

2023 — Early adopters go live
: ZKP2P (peer-to-peer fiat on/off-ramping, e.g. Venmo-to-USDC) and Email Wallet (sending crypto by email) both build on the SDK, becoming the project's first production use cases.[@zkemail-origin-blog]

May 2024 — Circuit audit
: zksecurity audits the full ZK circuit set and the rewritten zk-regex engine, finding the core EmailVerifier circuit safe while flagging extra care needed for custom circuits built on its sub-components.[@zkemail-audits]

July 2024 — Account recovery audited
: Ackee audits the smart contracts for email-based account recovery.[@zkemail-audits]

Q3 2024 — Account recovery goes live
: The audited recovery module launches on mainnet, built in close partnership with Rhinestone for ERC-7579 compatibility — letting a lost smart-contract wallet (Safe, Clave, and other 4337/7579 modular accounts) be recovered via trusted "guardian" email addresses instead of a seed phrase.[@zkemail-recovery-casestudy]

September–October 2024 — Two more audits
: Zellic audits the Email Transaction Builder library (formerly "Ether Email Auth"). Separately, Matter Labs audits the rewritten zk-regex engine and the ZKsync Solidity contracts, including the email-recovery and Clave recovery modules — standard hardening for code that's now moving real funds.[@zkemail-audits]

Q4 2024 — Multi-backend rewrite
: The circuits are rewritten to also run in Noir and in Rust via SP1, alongside a more scalable backend for the public proof registry.[@zkemail-github]

Q1 2025 — Registry and SDK improvements
: The proof registry lets developers define new email-based proof types through a UI and get an SDK plus on-chain verifier generated automatically, without hand-writing circuits.[@zkemail-github]

March–July 2025 — Email-as-ENS
: ZK Email applies to the ENS DAO's Service Provider Program to map email addresses onto ENS names, then ships Email-as-ENS, letting e.g. alice@gmail.com resolve to an Ethereum wallet as `alice$gmail.com.zkemail.eth`. [@ens-spp2-zkemail] [@zkemail-email-as-ens-github]

2025 — Beyond crypto: provenance for AI content
: Steward Aayush Gupta begins pitching "Proteus," an application of the same signature-based provenance idea to a non-crypto problem: proving where a piece of digital content actually came from, as a check against AI-generated deepfakes and misinformation.[@zkemail-proteus-video]

:::

## How people are using it today

The common thread across every live use case is the same: DKIM signatures
already exist on nearly every email sent, and ZK Email turns that existing,
unglamorous signature into a portable, privacy-preserving proof. A few
concrete uses:

- **Wallet recovery.** This is the most-requested and most mature use case. Smart-contract wallets (Safe, Clave, and other ERC-4337/7579 modular accounts) let a small set of trusted contacts "vouch" for account recovery just by replying to an email, removing seed phrases from the recovery flow entirely.
- **Fiat on/off-ramps.** [ZKP2P](https://zkp2p.co) uses email receipts (e.g. from Venmo) as proof that a fiat payment happened, to trustlessly release the crypto side of a peer-to-peer trade — no centralized exchange or custodian required.
- **Sending crypto by email.** [Email Wallet](https://emailwallet.org) lets someone send funds to any email address, with the recipient claiming them later.
- **Domain-gated identity, without doxxing.** Projects like Nozee let people prove they hold an email at a given domain (a company, a university) to unlock pseudonymous access, without revealing which specific address they used.
- **Email-as-identity for web3.** The Email-as-ENS integration maps an email address directly to an ENS name and wallet.
- **A general-purpose "proof registry."** At registry.zk.email, anyone can define a new kind of email-based proof (e.g. "prove this email confirms a shipped order") through a UI, and get an SDK plus on-chain verifier generated automatically — this is what most of the smaller, long-tail integrations run on.
- **Emerging: content provenance.** The newest direction, under the "Proteus" banner, repurposes the same cryptographic approach for a non-financial problem — proving a piece of media or communication is authentic in an era of AI-generated fakes.

:::{bibliography}
:::