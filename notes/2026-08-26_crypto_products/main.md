---
date: 2026-08-26
---

# The Nature of Cryptography Products

## Introduction

Does cryptography product create genuine new experience for users?

I think I got this inspiration from a panel at Devcon Thailand 2024 and some other private conversations. Let me create two camps.

A **substitution view** says cryptography is just a "simulated trusted third party." Everything you can do with cryptography, you can do it with a trusted third party.

A **novelty view** says cryptography is true and real. It creates a true constraints and restrictions to parties in the protocol. In enforces new physiscs in data such that they behave in a new way. There are essentially cases where trust is hard to establish and only cryptography helps you build experiences we've never had before.

We can argue both camps are just perspectives. Take cryptocurrency for example, we could argue that it's just a new form of payment, which we're already doing with bank services. A final form of cryptocurrency should make you feel no different from using a bank app, but offer more security and privacy. On the other hand, we could also argue that no level of bank coordination could build you this global book of balances that you can trust for any amount sent from a stranger.

I haven't really unpacked and described that debate in justice. But I think it would be very enlightening to unpack and spell out the weird nature of cryptographic products. That'll help us understand why, what, and how we are building, and who we build for.

Cryptography products are unlike the rest of the software products we use. They don't stream you a thoughtful reply or draw cute pictures like LLMs do. They are unimpressive. Sending a crypto transaction takes a herculean effort -- you reason with gas fees, networks, tokens, addresses, and yet the result makes you wonder, what's that different from my web2 payment apps? You deposit and withdraw on privacy pools, lots of gymnastics of confirms and approvals. What are we getting? The unlinkability of your transactions -- can you see it or touch it? You might, if you know the theory and can read dashboards.

When building cryptography product demos, countless times we asked "do we need to build the real stuff?" An FHE multiplayer game takes tremendous CPU and network bandwidth to run. How does that feel different from a centralized one? Only more friction is perceivable from the user's perspective. When we encountered a network problem at the demo venue, we considered disabling cryptography features to make the demo work. Would users feel any difference from that? Probably just less friction they experienced.

In fact, most of the successful cryptography projects I can remember remain silent and require minimum understanding from the users. I know http is not secure, and https is. What does that extra "s" give you? You have to dig three levels deep in the UI to find out the detail. How many cryptography features on the Signal chat app can you name? You probably can't, and you use it because of its reputation. MacBook has a network privacy feature. How did I become aware of it? Because it made my Steam app slow and I learned of its existence and disabled it.

I think understanding the strange nature of crypto products is helpful for us to think about the relationships between the products and their users, who to produce those products, and how to produce.

We named some products here, some build by non-profits, some for-profits, some governament standards. We'll come back to these.

## The Tale of Johnny

In the 1990 paper "Why Johnny Can't Encrypt," the author listed five distinct properties of security products. [@whittenWhyJohnnyCant1999]

The paper was an analysis of PGP software's UI. But we've seen those exact properties in wallets.

The user research that followed suggests users are very rational to be unmotivated (connects to the privacy paradox), and there are debates on whether the UI should be as explicit or implicit to users as possible.

Let's actually exam these properties carefully.

### The unmotivated user property

> Security is usually a secondary goal.  People do not generally sit down at their computers wanting to manage their security; rather, they want to send email, browse web pages, or download software, and they want security in place to protect them while they do those things.  It is easy for people to put off learning about security, or to optimistically assume that their security is working, while they focus on their primary goals.  Designers of user interfaces for security should not assume that users will be motivated to read manuals or to go looking for security controls that are designed to be unobtrusive.  Furthermore, if security is too difficult or annoying, users may give up on it altogether. [@whittenWhyJohnnyCant1999]

Security is only an issue when the user realized its importance and has capacity to reason with it. Two instances I can recall here.

1. Ukraine had the lowest installation count of the Signal app before the war, and then it rose to the top after the war began, showing that security is only important when it's scarce. [source](https://www.statista.com/chart/27161/pre-post-invasion-downloads-signal-telegram-ukraine-russia/).
2. I remember in RightsCon there was security advisor who eventually gave up buying Youbikeys for activists, due to a tight funding. This showing the capacity matters too, even though the security demand exists.


### The abstraction property

> Computer security management often involves security policies, which are systems of abstract rules for deciding whether to grant accesses to resources. The creation and management of such rules is an activity that programmers take for granted, but which may be alien and unintuitive to many members of the wider user population. User interface design for security will need to take this into account. [@whittenWhyJohnnyCant1999]

### The lack of feedback property

> The need to prevent dangerous errors makes it imperative to provide good feedback to the user, but providing good feedback for security management is a difficult problem.  The state of a security configuration is usually complex, and attempts to summarize it are not adequate.  Furthermore, the correct security configuration is the one which does what the user *really wants*, and since only the user knows what that is, it is hard for security software to perform much useful error checking. [@whittenWhyJohnnyCant1999]

It's hard for users to know if they are doing the right thing. If you write your password on a sticky note, you won't know what's wrong until it's all too late.

### The barn door property

> The proverb about the futility of locking the barn door after the horse is gone is descriptive of an important property of computer security:  once a secret has been left accidentally unprotected, even for a short time, there is no way to be sure that it has not already been read by an attacker. Because of this, user interface design for security needs to place a very high priority on making sure users understand their security well enough to keep from making potentially high-cost mistakes. [@whittenWhyJohnnyCant1999]

Lost or stolen passwords and cryptocurrencies behave exactly this way.

### The weakest link property

> It is well known that the security of a networked computer is only as strong as its weakest component. If a cracker can exploit a single error, the game is up. This means that users need to be guided to attend to all aspects of their security, not left to proceed through random exploration as they might with a word processor or a spreadsheet. [@whittenWhyJohnnyCant1999]

This means a user can't have just a partial understanding of the system.

It also means that a measure or product that improves a specific domain of security might feel like not valuable. Since it doesn't address the weakest link. A digital wallet with selective disclosure feature minimize a user's exposure of private data to a convenient store when getting their packages. But it might feel pointless if the user already exposed their private data through the store's membership program. That doesn't mean the wallet is a unneeded infrastructure. It just not being appreciated yet.

## Credence good: Doctors and mechanics

For me, I'd like to translate those properties of cryptography products into the language of economics, because that would help us identify the information or human/organizational frictions and yield implications for how we produce the product. The name is "credence good."

Products could have good or bad qualities. Some you can tell before you buy them, like fresh fruits. Some after you buy them, like a can of juice. Some, however, you can't tell even after you've experienced them yourself. That's a credence good.

Do you know whether the treatment your doctor gives your body, or your mechanic gives your car, is necessary? You would never know. Services by experts are invisible, just like cryptography. Classic results show the problems of credence goods are overtreatment, undertreatment, and overcharging. Solutions to these problems are characterized by whether users are committed to the treatment after diagnosis from the expert, whether the expert is legally liable for undertreating, and whether users have the ability to verify the treatment ex post.

The closest analogue for goods is food labels. Customers typically can't tell if bad ingredients were added to the food even after consumption.

## Two paths for innovation

### Substitution Path

In this path, we assume users are ultimately agnostic to cryptography or not. Having 1 ETH on chain and 1 ETH in centralized exchange make no difference to them.

Cryptography is invisible to them. Security decisions are made for them, unless they need to do something to violate it.

Good examples

- Signal Apps. Look, we have US minister at Deparement of War who launched invasion with Signal App. I don't think he is technically enough to reason deep cryptography. Yet, he is confident enough to trust an important decisions with it.
    - Security decisions are made by the app designer. Users feel no difference than using Telegram. You can't send a file from Laptop to mobile though. There were some inconvenience but mostly bearable.
- HTTPS. Browsers block access to non-https websites. But if a user intends to visit a HTTP website, maybe for web developing reason, the browser will mark the connection "insecure". It asked the user to go back, or the user can find a small text to insist visiting.


### Novelty Path

In what conditions we can find opportunities for novelty?

Zkemail
ZKp2p
Data derivatives

## Weird product features

This is another thread of discussion. I encountered bunch of weird cryptography feature ideas in the past. I list them here. Will expand in the future.

- Deterrence features (fraud proofs, slashing, rage-quit, nuclear MAD, burglar alarms, security cameras): the bad event they respond to is endogenous.
- Insurance features (recovery phrases, 2FA backup codes, fire extinguishers, deposit insurance payouts): the triggering event is exogenous
- Camouflage (deniable proofs, decoy volumes, mixnets): value comes from other people's constant, contentless usage.