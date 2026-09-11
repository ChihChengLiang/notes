---
title: TOTP timeline
date: 2026-09-11
generated: true
---

TOTP ("Time-based One-Time Password") is the algorithm behind Google
Authenticator and nearly every other six-digit-code authenticator app. A
server and an app agree on a shared secret once, at enrollment; after
that, both sides independently compute a short numeric code from that
secret and the current time, with no network round-trip needed to
generate one. The codes roll over every 30 seconds, so a code intercepted
later is useless. TOTP is a time-based variant of an earlier
event-counter-based algorithm called HOTP, and both came out of OATH, an
industry group formed to keep one-time-password authentication an open,
license-free standard rather than a single vendor's proprietary hardware.

:::{timeline}
:reverse: false

1984 — Security Dynamics founded
: Kenneth Weiss founds Security Dynamics and invents the SecurID card, a hardware token that generates a new time-synchronized code every minute — proprietary and hardware-bound, but the direct conceptual ancestor of TOTP.[@kenneth-weiss-wiki]

2004 — OATH forms
: The Initiative for Open Authentication is established as an industry collaboration to build open, royalty-free one-time-password standards, instead of leaving strong authentication to proprietary hardware vendors like RSA.[@oath-wiki]

December 2005 — RFC 4226 (HOTP) published
: David M'Raihi, Mihir Bellare, and colleagues from VeriSign, UC San Diego, VASCO, Gemplus, and Aladdin publish the HMAC-based One-Time Password algorithm — event-counter-based, incrementing each time a code is requested.[@rfc4226]

September 2010 — Google Authenticator launches
: Google ships Authenticator implementing the time-based variant of HOTP while it's still an IETF draft — the app predates the algorithm's own RFC by eight months.[@google-authenticator-wiki]

May 2011 — RFC 6238 (TOTP) published
: The draft Google had already shipped against is formally standardized, swapping HOTP's counter for the current Unix time divided into 30-second steps.[@rfc6238]

2011–2012 — Authy founded
: Daniel Palacio and Gleb Chuvpilo found Authy, going through Y Combinator, offering cloud-backed TOTP as a developer API rather than requiring every company to build its own authenticator-app support.[@authy-wiki]

February 2015 — Twilio acquires Authy
: Twilio buys Authy to bundle strong authentication alongside its SMS and voice APIs, for undisclosed terms.[@techcrunch-twilio-authy-2015]

June 2017 — NIST restricts SMS one-time passwords
: NIST's Digital Identity Guidelines (SP 800-63-3) designate SMS-delivered codes a "restricted" authenticator — not banned, but discouraged relative to app-based TOTP and hardware keys — formalizing years of security-community pressure to move off SMS.[@nist-sp-800-63-3-2017]

October 2021 — Google auto-enrolls 150 million accounts
: Google turns on two-step verification by default for 150 million users and requires it for 2 million YouTube creators, without waiting for anyone to opt in — the largest single forced-adoption event in 2FA's history.[@theregister-google-2sv-2021]

May 2022 — Apple, Google, and Microsoft commit to passkeys
: The three platform vendors commit to a shared FIDO/WebAuthn "passkey" standard — credentials that sync across a user's devices and require no shared secret or typed code at all, positioned as what eventually replaces both passwords and OTP codes.[@fidoalliance-passkeys-2022]

July 2022 — Microsoft exposes TOTP's phishing blind spot
: Microsoft discloses a large-scale adversary-in-the-middle phishing campaign that had targeted over 10,000 organizations since 2021: a reverse proxy relays the victim's password and TOTP code to the real site in real time, then steals the resulting session cookie — MFA succeeds, and the attacker is in anyway.[@microsoft-aitm-2022]

March 9, 2023 — GitHub mandates 2FA
: GitHub begins a phased rollout requiring every code-contributing account — an estimated 83 million developers — to enable 2FA by the end of 2023, accepting TOTP apps and security keys but not SMS.[@github-blog-2fa-2023]

March 20, 2023 — Twitter ends free SMS 2FA
: Twitter disables SMS-based two-factor authentication for all non-Twitter-Blue accounts, explicitly pushing its entire free user base toward authenticator apps or hardware security keys.[@twitter-blog-2fa-2023]

:::

## Where TOTP stands now

TOTP remains the default "second option" on almost every site's security
settings page — it requires no new hardware, no platform partnership, and
no changes to how the site's login form works, just a QR code and a
shared secret. That's exactly why it spread faster than anything before
or since it. But the two pressures visible in this timeline's last two
entries haven't gone away: TOTP has no way to bind a code to the specific
site a user thinks they're logging into, so a real-time phishing proxy
defeats it as easily as it defeats a password; and passkeys, which close
that gap by construction, are still climbing — roughly 48% of the top 100
websites offer them as of 2026, up from under a quarter in 2022, but still
far short of TOTP's near-universal support.[@descope-passkey-trends-2026]

:::{bibliography}
:::
