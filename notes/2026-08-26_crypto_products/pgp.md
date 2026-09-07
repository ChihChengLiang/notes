---
title: PGP timeline
date: 2026-09-07
generated: true
---

PGP ("Pretty Good Privacy") is a program for encrypting and signing data —
originally email — so that only the intended recipient can read it and
anyone can verify who sent it. It combines a fast symmetric cipher (for the
message itself) with public-key cryptography (to exchange the symmetric key
and to sign), and it verifies identities through a decentralized "web of
trust" — users vouching for each other's keys — rather than a central
certificate authority. The open standard that grew out of it is called
OpenPGP; the most widely used free implementation of that standard today is
GnuPG (GPG).

:::{timeline}
:reverse: false

June 1991 — PGP 1.0 released
: Phil Zimmermann releases PGP for free on the Internet, motivated by a US Senate bill that looked likely to mandate backdoors in encryption products. It bundles RSA for key exchange, a symmetric cipher for the message body, and his web-of-trust model for identity.[@philzimmermann-why-i-wrote-pgp] [@theregister-pgp30]

February 1993 — Criminal investigation opens
: The US government opens a criminal investigation into Zimmermann for "munitions export without a license" — cryptographic software above a certain strength was classified as a weapon under US export law, and PGP had spread overseas.[@pgp-wiki]

1994 — RSA patent dispute resolved
: PGP had shipped with RSA's algorithm without a license from RSA Data Security. MIT, which held the RSA patent, arranges free noncommercial use of the RSA module in the US, letting PGP 2.6 and later be used freely for noncommercial purposes; ViaCrypt separately licenses the algorithm to sell a commercial version.[@pgp-wiki]

1995 — Source code published as a book
: Zimmermann publishes PGP's complete source code in a hardback book through MIT Press. Printed text is protected by the First Amendment in a way software exports aren't, so the book — legally exportable — is scanned and OCR'd back into code once it reaches other countries.[@theregister-pgp30]

January 1996 — Case dropped, PGP Inc. founded
: The US government drops the investigation without filing charges. Zimmermann founds PGP Inc. to commercialize and support the software.[@theregister-pgp30] [@openpgp-history]

July 1997 — OpenPGP working group formed
: PGP Inc. proposes an open, vendor-neutral standard to the IETF so other implementations can interoperate with PGP; the IETF accepts and starts the OpenPGP working group.[@openpgp-wiki]

December 1997 — Network Associates acquires PGP Inc.
: Network Associates (formerly McAfee) announces it is buying PGP Inc. for roughly $36 million; the deal closes later that month.[@cryptome-nai-pgp-1997]

November 1998 — RFC 2440 published
: The OpenPGP working group ships the first formal OpenPGP Message Format standard.[@rfc2440]

September 1999 — GnuPG 1.0.0 released
: Werner Koch ships the first production release of GNU Privacy Guard, a free, standalone OpenPGP implementation with no dependency on the patented RSA code PGP still used at the time. The German government later funds porting it to Windows.[@gnupg-10th-birthday]

August 2002 — PGP Corporation founded
: Network Associates exits the PGP business; former PGP team members, including Jon Callas, form PGP Corporation and buy the desktop and wireless assets back from NAI.[@openpgp-history]

November 2007 — RFC 4880 published
: A revised OpenPGP Message Format standard obsoletes RFC 2440, formalizing the packet format still used by modern PGP implementations for the next 17 years.[@rfc4880]

April–June 2010 — Symantec acquires PGP Corporation
: Symantec announces a $300 million deal for PGP Corporation (alongside GuardianEdge) on April 29, folding PGP into its enterprise encryption line; the acquisition closes June 7.[@helpnetsecurity-symantec-pgp-2010] [@securityweek-symantec-completes-2010]

May 2018 — EFAIL vulnerability disclosed
: Researchers publish EFAIL, a set of attacks that abuse HTML rendering in mail clients to exfiltrate the plaintext of PGP- and S/MIME-encrypted email, affecting how — not whether — the underlying cryptography should be used.[@efail-ghacks-2018]

November 2019 — Broadcom acquires Symantec's enterprise security business
: Broadcom completes a $10.7 billion acquisition of Symantec's enterprise security division, which includes the PGP product line; Symantec's remaining consumer brand becomes NortonLifeLock.[@broadcom-symantec-2019]

July 2024 — RFC 9580 published
: A cryptographically modernized OpenPGP standard — adding authenticated encryption and Curve25519/Curve448 support, among other changes — obsoletes RFC 4880 as the current specification.[@rfc9580]

:::

## Where PGP actually ended up

Encrypted email itself never went mainstream — key management stayed too
manual for most people, and messaging apps with automatic end-to-end
encryption (many descended from the Signal Protocol) took over that job for
everyday conversations. But the pattern PGP proved out — sign and encrypt
with public keys, verify without a central authority — is now load-bearing
infrastructure in places most users never see: Git commit and tag signing,
`apt`/`rpm` package signing for Linux distributions, and SecureDrop-style
tools that journalists and sources still rely on for exactly the threat
model Zimmermann originally built PGP for.

:::{bibliography}
:::
