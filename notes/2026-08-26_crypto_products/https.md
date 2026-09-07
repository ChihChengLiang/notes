---
title: HTTPS timeline
date: 2026-09-07
generated: true
---

A timeline of how the web went from "HTTPS for credit card pages only" to
"HTTPS everywhere," based on Jeff Kaufman's history of HTTPS
usage.[@jefftk-https-history]

:::{timeline}
:reverse: false

July 1995 — Netscape ships SSL
: Bundled into Netscape's server software as a premium feature (\$1,495 base, \$5,000 with "secure credit card transmissions") — HTTPS starts life as a credit-card-only concern.[@netscape-fortune-2012]

September 1995 — First public SSL flaw
: Berkeley grad students find they can crack Netscape's implementation in under a minute; coverage frames it purely as a threat to credit card numbers.[@cnn-ssl-flaw-1995]

Mid-2000s — Login-only HTTPS becomes standard practice
: Sites encrypt the login form but serve everything else, including the login *page* itself, over plain HTTP — banks like Bank of America and Chase post credentials to HTTPS from unencrypted home pages.[@netcraft-banks-2005]

July 2008 — Gmail adds optional "always use https"
: Off by default; Google cites the performance cost of encrypting all mail traffic as the reason it isn't automatic.[@gmail-https-optin-2008]

January 2010 — Gmail makes HTTPS the default
: First major consumer webmail provider to flip the switch by default rather than opt-in.[@gmail-https-default-2010]

June 2010 — HTTPS Everywhere launches
: EFF and Tor Project browser extension that force-redirects to HTTPS versions of sites that support it but don't serve it by default.[@eff-https-everywhere-2010]

October 2010 — Firesheep released
: Firefox extension that trivializes session hijacking over public WiFi, making login-only HTTPS visibly inadequate overnight.[@firesheep-2010]

January 2011 — Facebook adds opt-in HTTPS
: Direct response to Firesheep; framed as protection for coffee-shop and airport WiFi users.[@facebook-https-optin-2011]

March 2011 — Twitter adds opt-in HTTPS
: Follows Facebook's move three months later.[@twitter-https-optin-2011]

October 2011 — Google defaults signed-in search to HTTPS
: Encrypts search queries and results for logged-in users by default.[@google-signedin-https-2011]

June 2013 — Snowden disclosures
: The Guardian publishes the first leaked documents, revealing NSA bulk collection of phone and internet records; the ensuing scrutiny of mass surveillance shifts the consensus from "encrypt sensitive pages" to "encrypt everything."[@guardian-nsa-verizon-2013]

July 2013 — Facebook HTTPS by default for all users
: Two years after the opt-in version, becomes the default.[@facebook-https-default-2013]

August 2013 — Wikipedia commits to default HTTPS
: Explicitly cites being targeted by NSA's XKeyscore program as the reason to accelerate.[@wikimedia-xkeyscore-2013]

January 2014 — Yahoo Mail HTTPS by default
: Among the last major webmail holdouts to fully encrypt.[@yahoo-mail-https-2014]

November 2014 — Let's Encrypt announced
: Free, automated certificate authority proposed to remove cost and hassle as the last major barrier to universal HTTPS.[@letsencrypt-announce-2014]

April 2016 — Let's Encrypt exits beta
: Fully public after a beta that started December 2015.[@letsencrypt-beta-exit-2016]

September 2016 — Chrome announces plan to mark HTTP as "not secure"
: Phased rollout starting with pages that collect passwords or credit cards.[@chrome-notsecure-plan-2016]

July 2018 — Chrome marks all HTTP sites "not secure"
: Completes the browser-side push that Let's Encrypt made technically painless.[@chromium-secure-web-2018]

:::

## What did it actually cost the web to adopt HTTPS?

There are two separate costs here — certificates, and the computational
overhead of running TLS — and both turned out to be far smaller than people
feared.

### Certificates

Before Let's Encrypt, a certificate ran \$50–150 per domain per year. Let's
Encrypt collapsed that to zero by combining two things: ACME, a protocol
letting a server automatically prove domain control and receive a
certificate without human involvement, and funding the CA through
foundation grants and sponsorships rather than per-certificate fees. As of
January 2025 it was issuing over 340,000 certificates an hour and
providing TLS to more than 550 million websites — up 42% year over
year.[@letsencrypt-scaling-2025]

What does that cost to run? Surprisingly little for something securing
that much of the web. Let's Encrypt's own early budget disclosures put
staffing as by far the dominant line item — their 2017 budget was about
\$2.91M, with salaries as the bulk of it and comparatively small chunks for
hardware/software, hosting/auditing, and legal/administrative
costs.[@letsencrypt-cost-2016] It's grown since: ISRG (Let's Encrypt's
parent nonprofit) said in 2023 it collectively operates three projects for
about \$7 million a year, with a team of around a dozen engineers on Let's
Encrypt itself.[@isrg-10th-anniversary-2023] So the entire non-profit
backbone issuing certificates for over half a billion domains runs on
roughly what a mid-size startup spends on payroll.

### Computation

This turned out to be a non-issue on modern hardware. Back in 2010,
Google's own production frontends reported that SSL/TLS accounts for less
than 1% of CPU load, less than 10 KB of memory per connection, and less
than 2% of network overhead.[@overclocking-ssl-2010] Independent
benchmarking found similarly small numbers — tests between encrypted and
unencrypted connections showed only about a 5ms latency difference and a
peak CPU increase of roughly 2%.[@sap-ssl-benchmark-2013]

### The real bottleneck was coordination, not cost

The honest takeaway: the "cost to the whole web" of universal HTTPS wasn't
really a cost problem to solve, it was a *coordination* problem. Someone
needed to remove the \$50–150/year toll and the manual renewal hassle, and
give browsers the credibility to start shaming holdouts. Once Let's
Encrypt did the former on a ~\$7M/year nonprofit budget and Chrome did the
latter for free, the marginal compute cost was already negligible.

:::{bibliography}
:::