# Can we formally verify privacy properties?

Yes, but are we talking about [private messaging like] applications or [zeroknowledge proof like] applications?

## Motivations

We're interested in finding some stupid bugs in Tornado Cash like applications, Semaphore, Privacy Pools. What if a developer accidentally asks a user to input their deposit index into the Solidity withdrawal function? This is likely if people are vibe coding things. Can we automatically detect this without relying a manual check?

The automation might pay more dividends if we are to design a complicated privacy applications, say the old Unirep.

## Recent advances in formal verification

We can kind of handle completeness and soundness this way. Because it is about reasoning the program inputs and outputs.

github.com/zksecurity/evm-asm/blob/main/EvmAsm/Evm64/Add/Program.lean

https://blog.zksecurity.xyz/posts/clean/

For privacy, we need to reason how information spread between parties. That's where epistemic logic comes in.

## Epistemic approach

Snarks are usually defined in complexity/computational model. "Given poly attacker, the probability of breaking soundness is negaligible"

Epistemic approach models things in more binary approach. "If I learn private key, I can't break ciphertext."

- Cryptography is assumed perfect. 

## private messaging like protocols

[@rajaonaEpistemicModelChecking2024] targets private auth protocols, where messages are sent to designated targets.

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    participant C as Charlie

    A->>B: $$\{ pubk(A), N_A \}_{pubk(B)}$$
    A->>C: $$\{ pubk(A), N_A \}_{pubk(B)}$$

    alt β holds (C = B and $$pubk(A) ∈ S_C$$)
        B->>A: $$\{ N_A, N_C, pubk(B) \}_{pubk(A)}$$
    else ¬β
        C->>A: $$\{N\}_K$$
    end
```

### What failure mode looks like?

### Notes

Note that unlinkability is defined differently. In epistemic model, unlinkability means there's no way to tell which world you are in. 
In Tornado Cash, unlinkability is defined probabilistically. It's unlikely to link people in the anon set, if they do things right.

## Formally defining Zeroknowledge

[@costaDynamicEpistemicVerification].

Broken Key Protocol. V has two keys and one of them is compromised. P has the compromised key and proves it to V without revealing which key is compromised.

```mermaid
sequenceDiagram
    participant P as Prover (P)
    participant V as Verifier (V)

    P->>V: ∗
    V->>V: Generate fresh m
    V->>P: enc(k₁, m), enc(k₂, m), h(m)
    P->>P: check(enc(k₁,m), enc(k₂,m))
    P->>V: m
```

### What failure mode looks like?

### Pipeine

```
Write S_P and S_V in SPEC
        ↓
Apply interpretation ⟨⟨·⟩⟩ to get action models
        ↓
Apply model update to ℐ_BKP
        ↓  ℳ ⊗ 𝔄
Obtain ℱ_BKP^P  and  ℱ_BKP^V
        ↓
Evaluate φ_ZK, φ_PoK, φ_NR (The security goals)
        ↓
All hold → BKP is verified
```

## Tornado Cash like situation

What are required?

- DY attacker to see all messages
- Modelling ZK in Epistemic logic
- Dynamism
- Actual tooling to use

### Unaddressed challenges

- Complexity explosion. Epistemic method requires tracking knowledges. Few interactions can blow the states to track.
- Public chain nature. In Tornado Cash like applications, messages are boradcasted public. Most of the Epistemic models target private interactions.


## What real Tornado Cash like system hacks look like?

2026 Feb: Foom and Veil Cash. Skipped trusted setup. [Foom](https://smartcontractshacking.com/hacks/foom-cash-hack-2026), [Veil](https://github.com/DK27ss/VeilCash-5K-PoC)


[bibliography]
