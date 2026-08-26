---
date: 2026-08-26
---

# The Nature of Cryptography Products

## Introduction

Does cryptography product create genuine new experience for users? 

I think I get this debate from a penal of Devcon Thailand 2024. Let me create straw person proponents of the camp.

Vitalik argued for no. Cryptography is just a "simulated trusted third party." Everything you can do with cryptography, you can do it with trusted third party.

Barry argued for yes. Cryptography is true and real. There are essentially cases where trust is hard to estabilish and only cryptography helps you to build experiences we've never had before.

We can argue the both camps are just perspective of viewing things. Take cryptocurrency for example, we could argue that is just a new form of payment, which we've already doing it with bank services. A final form of cryptocurrency should make you feel no difference with using a bank app, but offers more security and privacy. On the other hand, we could also argue that no level of bank coordination could build you this global book of balances that you can trust any amount sent from a stranger.


I think I haven't really unapcked and described that debate in justice. But I think it would be very enlightening to unpack and spell out the weired nature of cryptographic products. That'll help us understand why, what, and how we are building, and who we build for.

Cryptography products are unlike the rest of the software products we used. You'll get impressed when the first time LLM prompts you a thoughtful reply or draw you a realistic image. Cryptography products, on the other hands, feels unimpressive. Sending a crypto transaction takes a heculian effort -- you reason with gas fees, networks, tokens, addresses, and yet, the result makes you wondering, what's that different from my web2 payment apps? You deposit and withdraw on privacy pools, lots gymnetics of confirms and approvals. What are we getting? The unlinkability of your transactions, can you see it or touch it? You might, if you know the thoery and can read dashboards.

When we built cryptography product demos, countless time we asked "do we need to build the real stuff"? A FHE multi player game takes tremendus CPU and network bandwidth to run. How does that feel different from a centralized one? Only more friction is perceivable from the users perspective. When we encountered the network problem in the demo venue, we considered to disable cryptography features to make the demo work. Would users feel any difference from that? Probably just less friction they experienced.

In fact, most of the successful cryptography projects I can remembered, they remain silent and require minimum understanding from the users. I know http is not secure, and https is. What does that extra "s" give you? You have to dig three level deep in the UI to find out the detail. How many cryptography features on Signal chat app you can name? You probably don't, and you use it because of its reputation. Macbook has a network privacy feature. How did I became aware of it? because it makes my Steamstore app slow and I learned its existence and disable it.

We named some products here, some build by non-profits, some for-profits, some governament standards. We'll come back to these.

## The Tale of Johnny

In the 1990 paper "Why Johnny can't encrypt," the author listed five distinct properites of security products.

- Unmotivated users. Security is usally the second concern for the users. They wanted their message sent, and privacy is assumed rather than something they should actively keep in mind. (TODO: is drill and hole in the wall discussion relavent?). One thing I remember is that Ukrane has lowest installation count of Signal app before the war, and then rose to the top after the war began, showing that security is only important when they are scarce. 
- Abstraction. The value provided by security products are abstract.
- Lack of Feedback. It's hard for users to know if they are doing the right action. If you write your password on a sticker note, you won't know what's wrong until it's all too late.
- Barn door property. Once you let the horse leave the barn door, there's no way you can save it by closing the door. Lost or theft password and cryptocurrencies behave exactly this way.
- Weakest link. Things break at the weakest part of the system. This means a user can't have just partial understandin of the system.

The paper was an analysis on UI of PGP software. But we've seen those exact properites on wallets.

The user research followed that suggests users are very rational to be unmotivated (connects to privacy paradox). and there are debats on whether the UI should be explicit or implcit to users as much as possible.

For me, I'd like to translate those properties of cryptography products into the language of economics. Because that would help us identify the information or huamn organization frictions and yield implication on how do we produce the product. The name is "credence good."

## Credence good: Doctors and mechanics

Products could have good or bad qualities. Some you can tell it before you buy it, like fresh fruits. Some after you buy it, like a can of juice. Some, however, you can't tell even if you have expericed it yourself. That's credence good.

Do you know the treatment to your body by your doctor or to your car by your mechaics are necessary? You would never know. Services by the experts are invisible, just like cryptography. Classic results shows the problem of credence good is overtreatment, undertreatment, and overcharging. Solutions to the problems are characterized by if users are commited to the treatment after diagnosis from the expert? if the expert is legallly liable to not undertreat? and if the users have abilities to verify the treatment expost.

For goods, the closed products are food labels. Customer typically can't tell if bad ingredients were added in the food even after the consumption.

## Weird product features

This is another thread of discussion. I encountered bunch of weird cryptography feature ideas in the past. I list them here. Will expand in the future.

- Deterrence features (fraud proofs, slashing, rage-quit, nuclear MAD, burglar alarms, security cameras): the bad event they respond to is endogenous.
- Insurance features (recovery phrases, 2FA backup codes, fire extinguishers, deposit insurance payouts): the triggering event is exogenous
- Camouflage (deniable proofs, decoy volumes, mixnets): value comes from other people's constant, contentless usage.