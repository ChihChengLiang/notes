---
date: 2026-08-26
---

# The Nature of Cryptography Products

## Introduction

Does cryptography product create genuine new experience for users?

I think I got this debate from a panel at Devcon Thailand 2024. Let me create straw person proponents of the camp.

Vitalik argued for no. Cryptography is just a "simulated trusted third party." Everything you can do with cryptography, you can do it with a trusted third party.

Barry argued for yes. Cryptography is true and real. There are essentially cases where trust is hard to establish and only cryptography helps you build experiences we've never had before.

We can argue both camps are just perspectives on viewing things. Take cryptocurrency for example, we could argue that it's just a new form of payment, which we're already doing with bank services. A final form of cryptocurrency should make you feel no different from using a bank app, but offer more security and privacy. On the other hand, we could also argue that no level of bank coordination could build you this global book of balances that you can trust for any amount sent from a stranger.

I haven't really unpacked and described that debate in justice. But I think it would be very enlightening to unpack and spell out the weird nature of cryptographic products. That'll help us understand why, what, and how we are building, and who we build for.

Cryptography products are unlike the rest of the software products we use. You get impressed the first time an LLM prompts you with a thoughtful reply or draws you a realistic image. Cryptography products, on the other hand, feel unimpressive. Sending a crypto transaction takes a herculean effort -- you reason with gas fees, networks, tokens, addresses, and yet the result makes you wonder, what's that different from my web2 payment apps? You deposit and withdraw on privacy pools, lots of gymnastics of confirms and approvals. What are we getting? The unlinkability of your transactions -- can you see it or touch it? You might, if you know the theory and can read dashboards.

When we built cryptography product demos, we countless times asked "do we need to build the real stuff?" An FHE multiplayer game takes tremendous CPU and network bandwidth to run. How does that feel different from a centralized one? Only more friction is perceivable from the user's perspective. When we encountered a network problem at the demo venue, we considered disabling cryptography features to make the demo work. Would users feel any difference from that? Probably just less friction they experienced.

In fact, most of the successful cryptography projects I can remember remain silent and require minimum understanding from the users. I know http is not secure, and https is. What does that extra "s" give you? You have to dig three levels deep in the UI to find out the detail. How many cryptography features on the Signal chat app can you name? You probably can't, and you use it because of its reputation. MacBook has a network privacy feature. How did I become aware of it? Because it made my Steam app slow and I learned of its existence and disabled it.

We named some products here, some build by non-profits, some for-profits, some governament standards. We'll come back to these.

## The Tale of Johnny

In the 1990 paper "Why Johnny Can't Encrypt," the author listed five distinct properties of security products.

- Unmotivated users. Security is usually the second concern for users. They want their message sent, and privacy is assumed rather than something they should actively keep in mind. (TODO: is the drill-and-hole-in-the-wall discussion relevant?). One thing I remember is that Ukraine had the lowest installation count of the Signal app before the war, and then it rose to the top after the war began, showing that security is only important when it's scarce.
- Abstraction. The value provided by security products is abstract.
- Lack of feedback. It's hard for users to know if they are doing the right thing. If you write your password on a sticky note, you won't know what's wrong until it's all too late.
- Barn door property. Once you let the horse leave through the barn door, there's no way to save it by closing the door. Lost or stolen passwords and cryptocurrencies behave exactly this way.
- Weakest link. Things break at the weakest part of the system. This means a user can't have just a partial understanding of the system.

The paper was an analysis of PGP software's UI. But we've seen those exact properties in wallets.

The user research that followed suggests users are very rational to be unmotivated (connects to the privacy paradox), and there are debates on whether the UI should be as explicit or implicit to users as possible.

For me, I'd like to translate those properties of cryptography products into the language of economics, because that would help us identify the information or human/organizational frictions and yield implications for how we produce the product. The name is "credence good."

## Credence good: Doctors and mechanics

Products could have good or bad qualities. Some you can tell before you buy them, like fresh fruits. Some after you buy them, like a can of juice. Some, however, you can't tell even after you've experienced them yourself. That's a credence good.

Do you know whether the treatment your doctor gives your body, or your mechanic gives your car, is necessary? You would never know. Services by experts are invisible, just like cryptography. Classic results show the problems of credence goods are overtreatment, undertreatment, and overcharging. Solutions to these problems are characterized by whether users are committed to the treatment after diagnosis from the expert, whether the expert is legally liable for undertreating, and whether users have the ability to verify the treatment ex post.

The closest analogue for goods is food labels. Customers typically can't tell if bad ingredients were added to the food even after consumption.

## Weird product features

This is another thread of discussion. I encountered bunch of weird cryptography feature ideas in the past. I list them here. Will expand in the future.

- Deterrence features (fraud proofs, slashing, rage-quit, nuclear MAD, burglar alarms, security cameras): the bad event they respond to is endogenous.
- Insurance features (recovery phrases, 2FA backup codes, fire extinguishers, deposit insurance payouts): the triggering event is exogenous
- Camouflage (deniable proofs, decoy volumes, mixnets): value comes from other people's constant, contentless usage.