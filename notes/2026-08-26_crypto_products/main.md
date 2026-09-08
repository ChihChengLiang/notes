---
date: 2026-08-26
---

# The Nature of Cryptography Products

## Introduction

Does cryptography product create genuine new experience for users?

I think I got this inspiration from a panel at Devcon Thailand 2024 and some other private conversations. Let me create two camps.

A **substitution view** says cryptography is just a "simulated trusted third party." Everything you can do with cryptography, you can do it with a trusted third party.

A **generation view** says cryptography is true and real. It creates a true constraints and restrictions to parties in the protocol. In enforces new physiscs in data such that they behave in a new way. There are essentially cases where trust is hard to establish and only cryptography helps you build experiences we've never had before.

We can argue both camps are just perspectives. Take cryptocurrency for example, we could argue that it's just a new form of payment, which we're already doing with bank services. A final form of cryptocurrency should make you feel no different from using a bank app, but offer more security and privacy. On the other hand, we could also argue that no level of bank coordination could build you this global book of balances that you can trust for any amount sent from a stranger.

I haven't really unpacked and described that debate in justice. But I think it would be very enlightening to unpack and spell out the weird nature of cryptographic products. That'll help us understand why, what, and how we are building, and who we build for.

Cryptography products are unlike the rest of the software products we use. They don't stream you a thoughtful reply or draw cute pictures like LLMs do. They are unimpressive. Sending a crypto transaction takes a herculean effort -- you reason with gas fees, networks, tokens, addresses, and yet the result makes you wonder, what's that different from my web2 payment apps? You deposit and withdraw on privacy pools, lots of gymnastics of confirms and approvals. What are we getting? The unlinkability of your transactions -- can you see it or touch it? You might, if you know the theory and can read dashboards.

When building cryptography product demos, countless times we asked "do we need to build the real stuff?" An FHE multiplayer game takes tremendous CPU and network bandwidth to run. How does that feel different from a centralized one? Only more friction is perceivable from the user's perspective. When we encountered a network problem at the demo venue, we considered disabling cryptography features to make the demo work. Would users feel any difference from that? Probably just less friction they experienced.

In fact, most of the successful cryptography projects I can remember remain silent and require minimum understanding from the users. I know http is not secure, and https is. What does that extra "s" give you? You have to dig three levels deep in the UI to find out the detail. How many cryptography features on the Signal chat app can you name? You probably can't, and you use it because of its reputation. MacBook has a network privacy feature. How did I become aware of it? Because it made my Steam app slow and I learned of its existence and disabled it.

I think understanding the strange nature of crypto products is helpful for us to think about the relationships between the products and their users, who to produce those products, and how to produce.

We named some products here, some build by non-profits, some for-profits, some governament standards. We'll come back to these.

## The Tale of Johnny

> The design priorities required to achieve usable security ... are significantly different from those of general consumer software. [@whittenWhyJohnnyCant1999]

In the 1990 paper "Why Johnny Can't Encrypt," the author lists five distinct properties to characterize security products. Those properties motivate us to think differently than general consumer software.

The paper was an analysis of PGP software's UI. But we've seen those exact properties in wallets.

The user research that followed suggests users are very rational to be unmotivated (connects to the privacy paradox), and there are debates on whether the UI should be as explicit or implicit to users as possible.

Let's actually exam these properties carefully.

### The unmotivated user property

> Security is usually a secondary goal.  People do not generally sit down at their computers wanting to manage their security; rather, they want to send email, browse web pages, or download software, and they want security in place to protect them while they do those things.  It is easy for people to put off learning about security, or to optimistically assume that their security is working, while they focus on their primary goals.  Designers of user interfaces for security should not assume that users will be motivated to read manuals or to go looking for security controls that are designed to be unobtrusive.  Furthermore, if security is too difficult or annoying, users may give up on it altogether. [@whittenWhyJohnnyCant1999]

Security is only an issue when the user realized its importance and has capacity to reason with it. Two instances I can recall here.

1. Ukraine had the lowest installation count of the Signal app before the war, and then it rose to the top after the war began, showing that security is only important when it's scarce. [source](https://www.statista.com/chart/27161/pre-post-invasion-downloads-signal-telegram-ukraine-russia/).
2. I remember in RightsCon there was security advisor who eventually gave up buying Youbikeys for activists, due to a tight funding. This showing the capacity matters too, even though the security demand exists.

Security is an insurance to bad events, so for users to take actions, the bad events are bad and likely enough, and the insurance is affordable.

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

### Anything else I'd like to add?

#### Adversarial driven

Security products are designed on the threat model assumption. So that includes the assumption to your attackers capabilities. You have to change how to use a multisig safe, when the north korean can hack the UI. You need to migrate to post quantum cryptography when you assume the attacker getting closer to break classic computing cryptography. 


## Credence good: Doctors and mechanics

For me, I'd like to translate those properties of cryptography products into the language of economics, because that would help us identify the information or human/organizational frictions and yield implications for how we produce the product. The name is "credence good."

Products could have good or bad qualities. Some you can tell before you buy them, like fresh fruits. Some after you buy them, like a can of juice. Some, however, you can't tell even after you've experienced them yourself. That's a credence good.

Do you know whether the treatment your doctor gives your body, or your mechanic gives your car, is necessary? You would never know. Services by experts are invisible, just like cryptography. Classic results show the problems of credence goods are overtreatment, undertreatment, and overcharging. Solutions to these problems are characterized by whether users are committed to the treatment after diagnosis from the expert, whether the expert is legally liable for undertreating, and whether users have the ability to verify the treatment ex post.

The closest analogue for goods is food labels. Customers typically can't tell if bad ingredients were added to the food even after consumption.

- **Search goods:** quality can be checked *before* buying (an apple's freshness)
- **Experience goods:** quality can be checked *after* using it (a restaurant meal, a movie)
- **Credence goods:** can't judge quality even after using it, because you lack the expertise to evaluate it. (Docker's treatment, mechanic's fix)

So I think most of the consumer softwares are search goods or experience goods. For Youtube or Netflix, you can browse what content you can see then subscribe. For an AI or an operating system, you probably need to use it to know if it suits you or not. 

Are there credence goods softwares? Yes. 

- Antivirus: Are they really doing a good job? You don't actually know
- VPNs: If you use it for escaping geo-fensing, then it is an experience good. Are they really "no-logs"? You don't actually know.
- Identity-theft/dark-web monitoring services. I heard this the first time. I never use one before. The service alert subscribers if something bad happens. Very likily you never know if it is doing a good job.
- PC cleaner/optimizer: if claims some system performance problem being fixed. Most of the users have no knowledge to verify that.
- Ad blockers / privacy browsers claiming to block trackers. I think if users wants to, they can open another browser to verify it. Otherwise, it just sits in the background and shows you how many ads and trackers are blocked. It's interesting to see how the product trying to get user's attention of their existence, while the best job they can do is to stay invisible.

As we can see, credence products are terrible products. They are an ad hoc patch to some problems that shouldn't happen in the first place. [TODO: exapnd on this]

So we can kind of decomposite a product into experience good component and credence good component. When we build an experience good with cryptography, that's the novelty part. We're saying something with clear causality, observable to even inexperienced users. Message sent, balance sent. They might have barn properties but they have feedbacks.

Take ZKp2p for example. One usage is to use zkTLS to prove a transations on Venmo. Then you can use this to build a swap from USD to crypto. The users don't care how it is implemented in cryptography. The user can know that if their USD is successfully converted to crypto.

## Two paths for innovation

### Substitution Path

In this path, we assume users are ultimately agnostic to cryptography or not. Having 1 ETH on chain and 1 ETH in centralized exchange make no difference to them.

Cryptography is invisible to them. Security decisions are made for them, unless they need to do something to violate it.

Good examples

- Signal Apps. Look, we have US minister at Deparement of War who launched invasion with Signal App. I don't think he is technically enough to reason deep cryptography. Yet, he is confident enough to trust an important decisions with it.
    - Security decisions are made by the app designer. Users feel no difference than using Telegram. You can't send a file from Laptop to mobile though. There were some inconvenience but mostly bearable.
- HTTPS. Browsers block access to non-https websites. But if a user intends to visit a HTTP website, maybe for web developing reason, the browser will mark the connection "insecure". It asked the user to go back, or the user can find a small text to insist visiting.


### Generation Path

In what conditions we can find opportunities for novelty?

Zkemail
ZKp2p
Data derivatives

## Implicit view vs Explicit view

If we want the users to know less about the cryptography at work. We can hide cryptography details behind. We call this implicit or invisibility view.

If we want the users to be aware of what they are doing with the cryptography, we want them to be educated about the details. We call this explicit view.

Note that by invisibility, we are saying a verification has been done behind the scene. The risk is addressed.

- **Engineered invisibility:** complexity was resolved and then hidden. HTTPS is such example. The verification is behind the scene and the user can be out of the loop.
- **Obscurity:** The complexity was never resolved and the risk not addressed. Blind signing a transaction is "obscure", but not Engineered invisibility.

### Human in the Security Loop

We can build some layers and tiers between the implicit and explict. I think the recent AI loop engineering concept is helpful here.

- Vulnerable: This is the baseline. Users either do nothing or action subject to attacker's mercy. Example: HTTP with person in the middle attack. Blind transaction signing is too.
- Niche infra: This is when an infra emerged but for some reasons it didn't widely deployed to reach the next stage. It could be,
    - Threat not justifying it
    - Too costly to deploy
    - Other frictions
- Infra got adopted, but require user's active attention. This is the explicit statge. Sometimes this is also an acceptable place to stop.
    - Limitation of automation: Sending a transaction requires a human check the receiver and balance. It is a part of the intent that machine can't decide for human. The gas fee decision is mostly delegated out today, this is mostly because of the dynamic fee mechanism reduce the need for human involvement.
    - Risk of Conflict of interest: Tools are all built by different parties. The verification process should be free from the CoI risk of the target. The Binance Proof of Reserve page shows you a elaborate explanation about merkle trees and a video on how to verify the PoR. Why can't they just show a green check on their website? Because if the green check is provided by the target you are verify against, it wouldn't be convincing.
    - Stakes too high and errors too irreversible to delegate.
    - The above assumes we reached the pareto frontier. If we're still inside, we ask where the inefficiency comes from.
        - Expertise from user
            - They can be educated: Self-soverign users
        - Expertise can be borrowed. Automate out the decisions from the user. One example is the slash protection. In the beginning of merge, people need to carefully migrate their servers, so that no two same instances submit messages at the same time -- subject to heavy slashing penalty. Clients nowadays implement slash protection mechanism, which internalize the idea, and let the new machine observe the network and wait automatically to make sure they don't have dopperganger.
            - Who to borrow?
                - from feature provider: Browsers decide to make all HTTP unsafe. Set a smart default for you.
                - From internation standard body.
                - From government. TW Digital wallet build the mobile wallet for you.
- Invisible. The infra is mature enough. It can work behind the scene and without human in the loop. HTTPS is like this. Users can still opt in to visit "unsafe" website if they cross some intentional friction.


## Weird product features

What does the framework we developed shed lights on these?

I encountered bunch of weird cryptography feature ideas in the past.

- Deterrence features (fraud proofs, slashing, rage-quit, nuclear MAD, burglar alarms, security cameras): the bad event they respond to is endogenous.
- Insurance features (recovery phrases, 2FA backup codes, fire extinguishers, deposit insurance payouts): the triggering event is exogenous
    - Users' attentions are required during emergency. fire extinguishers requires some normal day training, so I guess same for recovery phrases and 2FA backup codes.
- Camouflage (deniable proofs, decoy volumes, mixnets): value comes from other people's constant, contentless usage.
    - In MACI, the anti-bribing feature require the user to send a swap-key action and take the bribe. 
    - In deniable proofs of zkID usage, expired proofs might still be valuable for marketing analysis, unless enough fake outdated proof is in circulation to make the data noisy enough.