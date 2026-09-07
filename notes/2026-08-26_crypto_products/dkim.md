---
title: DKIM timeline
date: 2026-09-07
generated: true
---

DKIM ("DomainKeys Identified Mail") lets the domain that sends an email
cryptographically sign it, so a receiving mail server can check that the
message really came from that domain and wasn't altered in transit. The
sending domain publishes a public key in DNS; the mail server signs
outgoing messages with the matching private key; anyone receiving the mail
can verify the signature against the DNS record without any prior
relationship with the sender. It's one of the three pillars of modern
anti-spoofing email — alongside SPF (which authorizes sending IPs) and
DMARC (which ties both together and tells receivers what to do when they
fail).

:::{timeline}
:reverse: false

May 2004 — Yahoo publishes DomainKeys
: Yahoo, led by Mark Delany, publishes the DomainKeys specification and offers it royalty-free to the industry as a way to verify a sending domain and reduce email forgery.[@cisco-yahoo-dkim-merge-2005]

June 2004 — Cisco proposes Identified Internet Mail
: Cisco engineers Jim Fenton and Michael Thomas draft a parallel signature-based scheme, Identified Internet Mail, and submit it to the IETF.[@ietf-draft-fenton-identified-mail]

June 2005 — Yahoo and Cisco merge their proposals into DKIM
: The two companies combine DomainKeys and Identified Internet Mail into a single standard, DomainKeys Identified Mail, and commit to licensing it royalty-free. By this point Yahoo alone is signing more than 350 million messages a day with DomainKeys.[@cisco-yahoo-dkim-merge-2005]

July 2005 — DKIM submitted to the IETF
: A coalition — Cisco, Yahoo, PGP Corporation, Sendmail, VeriSign, Microsoft, IBM, AOL, EarthLink, and others — submits the joint DKIM specification to the IETF for standardization, backed by three independent, interoperable implementations.[@cisco-dkim-ietf-submission-2005]

May 2007 — RFC 4871 and RFC 4870 published
: The IETF publishes DKIM Signatures as a standards-track RFC, authored by engineers from Sendmail, PGP Corporation, Yahoo, and Cisco; the original DomainKeys spec is republished alongside it as a Historic document.[@rfc4871] [@rfc4870]

August 2009 — RFC 5672 and RFC 5617 (ADSP) published
: RFC 5672 clarifies which identifier DKIM verification should hand off to spam filters. Alongside it, RFC 5617 defines Author Domain Signing Practices (ADSP), letting a domain declare that all its mail should be signed.[@rfc5672] [@rfc5617]

September 2011 — RFC 6376 published
: A consolidated DKIM Signatures spec, authored by Dave Crocker, Tony Hansen, and Murray Kucherawy, obsoletes both RFC 4871 and RFC 5672.[@rfc6376]

2010–2012 — DMARC takes shape
: A coalition led by PayPal — including Google, Yahoo, and Microsoft — organizes as DMARC.org and publishes the first DMARC draft, giving domains a way to publish a policy for what receivers should do with mail that fails DKIM and SPF, plus a feedback loop for reports.[@dmarcian-history]

June 2013 — DKIM elevated to Internet Standard (STD 76)
: RFC 6376 is approved by the IESG as a full Internet Standard, the only one of the three core email-authentication mechanisms (SPF, DKIM, DMARC) to reach that status.[@rfc6376-std76]

November 2013 — ADSP declared Historic
: The IESG downgrades RFC 5617 (ADSP) to Historic, citing "almost no deployment and use in the 4 years" since it shipped, plus evidence of real-world harm from misconfiguration.[@adsp-historic-2013]

March 2015 — DMARC published as RFC 7489
: DMARC is published through the IETF's Independent Submission stream, formalizing years of industry practice, though — unlike DKIM — it's Informational rather than standards-track.[@rfc7489]

October 2023 – February 2024 — Google and Yahoo mandate DKIM
: Google and Yahoo announce that anyone sending 5,000+ messages a day to Gmail or Yahoo addresses must authenticate with SPF and DKIM and publish a DMARC record, turning a twenty-year-old voluntary standard into a hard requirement for reaching most consumer inboxes.[@google-sender-guidelines-2024]

:::

## Why this became load-bearing rather than optional

For most of its life DKIM was something only sophisticated senders bothered
with. What changed in 2023–2024 wasn't the technology — it's unchanged
since RFC 6376 — it's that the two largest consumer inboxes on the internet
started rejecting unauthenticated bulk mail outright. A spec that spent
nearly two decades as a best practice is now a precondition for a
marketing team, a SaaS product, or a small mail server to reliably land in
anyone's inbox at all.

:::{bibliography}
:::
