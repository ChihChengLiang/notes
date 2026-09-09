---
date: 2026-08-26
---

# The Nature of Cryptography Products

## Introduction

Do cryptography products create a genuinely new experience for users?

I think I got this inspiration from a panel at Devcon Thailand 2024, and some private conversations since. Let me lay out two camps.

A **substitution view** says cryptography is just a "simulated trusted third party": everything you can do with cryptography, you could also do with a trusted third party.

A **generation view** says cryptography is true and real. It creates genuine constraints and restrictions on the parties in a protocol -- it enforces a new physics on data, such that data behaves in a new way. There are cases where trust is fundamentally hard to establish, and only cryptography lets you build experiences we've never had before.

We can argue both camps are just perspectives. Take cryptocurrency, for example: we could argue that it's just a new form of payment, something we're already doing with bank services -- a mature form of cryptocurrency should feel no different from using a bank app, just with more security and privacy. On the other hand, we could argue that no amount of bank coordination could build you a global ledger of balances that you can trust for any amount sent by a stranger.

I haven't really done that debate justice here. But I think it's worth unpacking the weird nature of cryptographic products -- it'll help us understand why, what, and how we're building, and who we're building for.

Cryptography products are unlike the rest of the software we use. They don't stream you a thoughtful reply or draw cute pictures like LLMs do -- they're unimpressive. Sending a crypto transaction takes a Herculean effort: you have to reason about gas fees, networks, tokens, and addresses, and the result still leaves you wondering how it's any different from a web2 payment app. You deposit and withdraw from privacy pools through a gymnastics of confirmations and approvals. What are you getting for it? The unlinkability of your transactions -- can you see it, or touch it? Only if you know the theory and can read the dashboards.

When building cryptography product demos, we've asked countless times: "do we actually need to build the real thing?" An FHE multiplayer game takes tremendous CPU and network bandwidth to run -- but how does that feel different from a centralized one? From the user's perspective, the only perceivable difference is more friction. When we hit a network problem at a demo venue once, we considered just disabling the cryptography features to make the demo work. Would users have felt any difference? Probably just less friction.

In fact, most of the successful cryptography projects I can think of stay silent and demand minimum understanding from users. I know HTTP is insecure and HTTPS is secure. What does that extra "s" actually give you? You'd have to dig three levels deep into the browser UI to find out. How many of Signal's cryptography features can you name? Probably none -- you use it because of its reputation. My MacBook has a network privacy feature. How did I even find out about it? Because it made my Steam app slow, and that's how I learned it existed, before disabling it.

I think understanding this strange nature of crypto products helps us think about the relationship between the products and their users, who should build these products, and how.

We've named a few products here already -- some built by non-profits, some for-profits, some government standards. We'll come back to these.

## The Tale of Johnny

> The design priorities required to achieve usable security ... are significantly different from those of general consumer software. [@whittenWhyJohnnyCant1999]

In the 1999 paper "Why Johnny Can't Encrypt," the author lists five distinct properties that characterize security products. These properties push us to think differently than we would about general consumer software.

The paper analyzed PGP software's UI, but we can see these exact same properties in crypto wallets today.

Later user research suggests users are quite rational to be unmotivated (this connects to the privacy paradox), and there's ongoing debate over whether security UI should be as explicit or as implicit as possible.

Let's examine these properties carefully.

### The unmotivated user property

> Security is usually a secondary goal.  People do not generally sit down at their computers wanting to manage their security; rather, they want to send email, browse web pages, or download software, and they want security in place to protect them while they do those things.  It is easy for people to put off learning about security, or to optimistically assume that their security is working, while they focus on their primary goals.  Designers of user interfaces for security should not assume that users will be motivated to read manuals or to go looking for security controls that are designed to be unobtrusive.  Furthermore, if security is too difficult or annoying, users may give up on it altogether. [@whittenWhyJohnnyCant1999]

Security only becomes an issue once a user realizes its importance and has the capacity to act on it. Two examples come to mind.

1. Signal had one of the lowest install counts in Ukraine before the war, then rose to the top after the war began -- showing that security only feels important once safety becomes scarce. [source](https://www.statista.com/chart/27161/pre-post-invasion-downloads-signal-telegram-ukraine-russia/).
2. At RightsCon, I remember a security advisor who eventually gave up on buying YubiKeys for activists because of tight funding -- showing that capacity matters too, even when the demand for security is real.

Security is insurance against bad events. For users to act, the bad event has to be bad and likely enough, and the insurance has to be affordable.

### The abstraction property

> Computer security management often involves security policies, which are systems of abstract rules for deciding whether to grant accesses to resources. The creation and management of such rules is an activity that programmers take for granted, but which may be alien and unintuitive to many members of the wider user population. User interface design for security will need to take this into account. [@whittenWhyJohnnyCant1999]

The original paper talked about policies. But let's recognize the fact that cryptography itself is abstract. 

For example, what is a digital signature? We are attaching a docuemnt some very specific bytes, which is verifible with an algorithsm, that only people holds a specific knowledge, the secret key, could pass the algorithm check.

We have to rely on lots of analogies, like signing on a paper, keys to a door, to transfer users knowledge about physical world to reason the new physics of data. And sometimes the analogy failed in a spectacle way, like what does it mean to "sign" a message with a "key"? Typically, people sign on a paper with a pen.

### The lack of feedback property

> The need to prevent dangerous errors makes it imperative to provide good feedback to the user, but providing good feedback for security management is a difficult problem.  The state of a security configuration is usually complex, and attempts to summarize it are not adequate.  Furthermore, the correct security configuration is the one which does what the user *really wants*, and since only the user knows what that is, it is hard for security software to perform much useful error checking. [@whittenWhyJohnnyCant1999]

It's hard for users to know whether they're doing the right thing. If you write your password on a sticky note, you won't find out what's wrong until it's too late.

### The barn door property

> The proverb about the futility of locking the barn door after the horse is gone is descriptive of an important property of computer security:  once a secret has been left accidentally unprotected, even for a short time, there is no way to be sure that it has not already been read by an attacker. Because of this, user interface design for security needs to place a very high priority on making sure users understand their security well enough to keep from making potentially high-cost mistakes. [@whittenWhyJohnnyCant1999]

Lost or stolen passwords, and crypto private keys, behave exactly this way.

### The weakest link property

> It is well known that the security of a networked computer is only as strong as its weakest component. If a cracker can exploit a single error, the game is up. This means that users need to be guided to attend to all aspects of their security, not left to proceed through random exploration as they might with a word processor or a spreadsheet. [@whittenWhyJohnnyCant1999]

This means a user can't get away with only a partial understanding of the system.

It also means a product that improves one specific domain of security can feel worthless, since it doesn't address the weakest link. A digital wallet with a selective-disclosure feature might minimize a user's exposure of private data at a convenience store when picking up a package. But that feels pointless if the user already leaked the same data through the store's membership program. That doesn't mean the wallet is unneeded infrastructure -- it just isn't appreciated yet.

### Anything else I'd like to add?

#### Adversarial driven

Security products are designed around a threat model assumption -- including assumptions about your attacker's capabilities. You have to change how you use a multisig safe once North Korean hackers can compromise the UI. You need to migrate to post-quantum cryptography once you assume attackers are getting closer to breaking classical cryptography.


## Credence good: Doctors and mechanics

I'd like to translate these properties of cryptography products into the language of economics, because that helps identify the information and organizational frictions at play, and yields implications for how we produce these products. The concept is called a "credence good."

Products can have good or bad qualities. Some you can tell before you buy, like fresh fruit. Some only after you buy, like a can of juice. And some you can't tell even after you've used them yourself -- that's a credence good.

Do you know whether the treatment your doctor gives your body, or the fix your mechanic gives your car, was actually necessary? You never really do. Expert services are invisible, just like cryptography. Classic results in the literature show the core problems of credence goods are overtreatment, undertreatment, and overcharging. Solutions are characterized by whether the customer is committed to treatment before diagnosis, whether the expert is legally liable for undertreatment, and whether the customer can verify the treatment after the fact.

The closest analogue among physical goods is food labeling: customers typically can't tell if bad ingredients were used, even after they've eaten the food.

- **Search goods:** quality can be checked *before* buying (an apple's freshness)
- **Experience goods:** quality can be checked *after* using it (a restaurant meal, a movie)
- **Credence goods:** can't judge quality even after using it, because you lack the expertise to evaluate it (a doctor's treatment, a mechanic's fix)

Most consumer software, I think, is a search good or an experience good. For YouTube or Netflix, you can browse the content before subscribing. For an AI product or an operating system, you probably need to use it a while to know if it suits you.

Are there credence-good softwares? Yes.

- Antivirus: are they really doing a good job? You don't actually know.
- VPNs: if you use one to get around geo-fencing, it's an experience good. But are they really "no-logs"? You don't actually know.
- Identity-theft / dark-web monitoring services: I first heard of these recently and have never used one. The service alerts subscribers if something bad happens -- you'd likely never know whether it's actually doing a good job.
- PC cleaner/optimizer: it claims to fix some system performance problem. Most users have no way to verify that.
- Ad blockers / privacy browsers that claim to block trackers: a user could open a second browser to verify this if they wanted to, but otherwise it just sits in the background, showing you a running count of ads and trackers blocked. It's interesting how hard these products work for your attention, when the best job they could do is stay invisible.

As we can see, credence goods are terrible products -- they're ad hoc patches for problems that shouldn't have existed in the first place. [TODO: expand on this]

So we can decompose a product into an experience-good component and a credence-good component. When we build the experience-good part with cryptography, that's the novelty: we're delivering something with clear causality, observable even to inexperienced users -- message sent, balance sent. It might still have the barn-door property, but at least it has feedback.

Take ZKp2p, for example. One use case is zkTLS proving a transaction on Venmo, which you can then use to build a swap from USD to crypto. The user doesn't care how it's implemented in cryptography -- they just want to know whether their USD was successfully converted.

## Implicit view vs Explicit view

If we want users to know less about the cryptography at work, we can hide the details -- call this the implicit, or invisibility, view.

If we want users to be aware of what they're doing with the cryptography, we want them educated about the details -- call this the explicit view.

Note that "invisibility" implies a verification has happened behind the scenes -- the risk has actually been addressed.

- **Engineered invisibility:** the complexity was resolved and then hidden. HTTPS is an example -- verification happens behind the scenes and the user can stay out of the loop.
- **Obscurity:** the complexity was never resolved and the risk was never addressed. Blind-signing a transaction is "obscure," not engineered invisibility.

### Human in the Security Loop

We can build layers and tiers between implicit and explicit. I think the recent human-in-the-loop concept from AI engineering is helpful here.

- **Vulnerable:** the baseline. Users either do nothing, or their actions are at the attacker's mercy. Example: HTTP under a man-in-the-middle attack. Blind transaction signing too.
- **Niche infra:** an infrastructure emerges but, for some reason, never gets widely deployed enough to reach the next stage. Could be because:
    - the threat doesn't justify it
    - it's too costly to deploy
    - other frictions
- **Adopted, but requires attention:** infra gets adopted but still requires the user's active attention. This is the explicit stage, and sometimes an acceptable place to stop.
    - **Limitation of automation:** sending a transaction requires a human to check the receiver and balance -- that's part of the intent a machine can't decide on a human's behalf. (Gas-fee decisions are mostly delegated away today, mainly because dynamic fee mechanisms reduced the need for human involvement.)
    - **Risk of conflict of interest:** tools are built by different parties, and the verification process needs to stay free of the target's conflict of interest. Binance's Proof of Reserve page gives an elaborate explanation of Merkle trees and a video on how to verify it -- why not just show a green checkmark on their website? Because a green checkmark issued by the party you're verifying wouldn't be convincing.
    - **Stakes too high, errors too irreversible to delegate.**
    - All of the above assumes we're at the Pareto frontier already. If we're not, we should ask where the inefficiency comes from:
        - **Expertise sits with the user** -- they can be educated into self-sovereign users.
        - **Expertise can be borrowed** -- automate the decision away from the user entirely. One example is slash protection: in the early days of Ethereum's Merge, operators had to carefully migrate their validators so that no two instances signed the same message at once, or risk a heavy slashing penalty. Clients today implement slash protection natively, letting a new machine observe the network and wait automatically to avoid a doppelganger. Who do you borrow the expertise from?
            - the feature provider -- browsers decide to mark all HTTP unsafe, setting a smart default for you
            - an international standards body
            - the government -- Taiwan's digital wallet is built as a mobile wallet on your behalf
- **Invisible:** the infra is mature enough to work behind the scenes with no human in the loop. HTTPS is like this -- users can still opt in to visit an "unsafe" site, but only by crossing some intentional friction.


## Weird product features

What does the framework we've developed shed light on here?

I've encountered a bunch of weird cryptography feature ideas over the years. They're weird in an interesting way, but I'll put them on the back burner for now -- no expansion yet.

- **Deterrence features** (fraud proofs, slashing, rage-quit, nuclear MAD, burglar alarms, security cameras): the bad event they respond to is endogenous.
- **Insurance features** (recovery phrases, 2FA backup codes, fire extinguishers, deposit insurance payouts): the triggering event is exogenous.
    - Users' attention is required during the emergency. Fire extinguishers require some ordinary-day training, and I'd guess the same goes for recovery phrases and 2FA backup codes.
- **Camouflage** (deniable proofs, decoy volumes, mixnets): the value comes from other people's constant, contentless usage.
    - In MACI, the anti-bribing feature requires the user to be able to send a swap-key action and pocket the bribe anyway.
    - With deniable proofs for zkID usage, expired proofs might still be valuable for marketing analysis, unless enough fake, outdated proofs are in circulation to make the data noisy enough.

## What can we think better about crypto products?

I originally started looking into this topic to find a kind of crypto exceptionalism that might shed light on funding and sustainability. That turned out to be a longer-term goal. For this post, it's already valuable to land on a few views about product design. Here's my takeaway:

### Diagnose the components

Which parts of the product are the "experience good" component? Which parts are "credence good"?

### Avoid marketing the credence-good part as a feature

It's great to provide transparency into the mechanism. But we shouldn't ask users to perform an unpaid product audit by making them learn the cryptography. Instead, market how the credence-good component makes the experience-good component different.

### Prefer absorbing judgment over educating the user

Ask: should the user have to solve this problem themselves? Does this problem even belong to your product? Maybe antivirus is really the OS's problem. Should the browser just default to blocking HTTP?

I think this exercise helps position the product. Are we just a band-aid on the problem? Or are we fixing the root cause?

