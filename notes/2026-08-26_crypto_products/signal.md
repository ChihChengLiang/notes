---
title: A history of Signal
date: 2026-09-06
generated: true
---

# A history of Signal

Signal's lineage runs from two separate 2010 apps, through a scrappy open-source
collective, to a billion-user encryption standard and a $50M-funded nonprofit.
Below is the timeline, oldest first.

:::{timeline}
:reverse: false

May 2010 — TextSecure and RedPhone launch
: Security researcher Moxie Marlinspike and roboticist Stuart Anderson co-found
  Whisper Systems and release two Android apps: TextSecure for encrypted SMS
  and RedPhone for encrypted calls.[@whispersystems-wiki][@textsecure-wiki]

Late 2011 — Twitter acquires Whisper Systems
: Twitter buys the startup; Marlinspike becomes head of Twitter's security team.
  Twitter later open-sources TextSecure and RedPhone under GPLv3.[@marlinspike-fr]

January 2013 — Open Whisper Systems founded
: Marlinspike leaves Twitter and starts Open Whisper Systems (OWS) as a
  volunteer-driven open-source project to continue developing TextSecure and
  RedPhone.[@ows-wiki]

February 2014 — The Signal Protocol debuts
: OWS, with cryptographer Trevor Perrin, ships the first version of what
  becomes the Signal Protocol (originally "Axolotl") inside TextSecure,
  introducing the Double Ratchet for forward secrecy.[@marlinspike-fr]

November 2015 — TextSecure and RedPhone merge into Signal
: OWS combines the messaging and calling apps into a single product renamed
  Signal.[@whisper-systems-wiki]

November 2014 – April 2016 — WhatsApp adopts the Signal Protocol
: OWS announces a partnership with WhatsApp in November 2014; by April 2016
  the Signal Protocol is fully integrated across all WhatsApp clients,
  bringing end-to-end encryption by default to over a billion users
  overnight.[@signal-whatsapp-blog][@eff-whatsapp]

February 2018 — Signal Foundation launches
: WhatsApp co-founder Brian Acton, who had left Facebook the previous year
  over data-privacy disagreements, puts $50 million into a new nonprofit,
  the Signal Foundation, alongside Marlinspike — turning Signal into a
  full 501(c)(3) operation.[@signal-foundation-wiki][@techcrunch-foundation]

October 2018 — Sealed sender ships
: Signal introduces "sealed sender," stripping the sender's identity from
  the outside of the message envelope so its own servers can deliver a
  message without routinely learning who sent it.[@signal-sealed-sender-blog]

January 2021 — WhatsApp policy backlash sends users to Signal
: A controversial WhatsApp privacy-policy update, amplified by a two-word
  Elon Musk tweet ("Use Signal"), triggers a mass migration — Signal's
  Android install base jumps from roughly 10 million to over 40 million in
  days, briefly knocking the service offline.[@cnbc-surge][@register-down]

January 2022 — Marlinspike steps down as CEO
: After roughly a decade running Signal, Marlinspike hands the CEO role to
  Brian Acton on an interim basis and stays on the board; Meredith Whittaker
  is named the Foundation's first president that September.[@engadget-stepdown][@gizmodo-whittaker]

May–September 2023 — PQXDH adds post-quantum resistance
: Signal publishes the PQXDH key-agreement protocol, layering a
  NIST-standardized post-quantum key-encapsulation mechanism (Kyber/ML-KEM)
  on top of the existing X3DH handshake to resist future "harvest now,
  decrypt later" quantum attacks.[@signal-pqxdh-blog][@pqxdh-wiki]

:::

:::{bibliography}
:::