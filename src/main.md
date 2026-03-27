# Can we formally verify privacy properties?

Yes, but are we talking about [private messaging like] applications or [zeroknowledge proof like] applications?

## Recent advances in formal verification

github.com/zksecurity/evm-asm/blob/main/EvmAsm/Evm64/Add/Program.lean

https://blog.zksecurity.xyz/posts/clean/


## private messaging like protocols

[@rajaonaEpistemicModelChecking2024] targets private auth protocols, where messages are sent to designated targets.

```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    participant C as Charlie

    A->>B: $$\{ pubk(A), N_A \}pubk(B)$$
    A->>C: $$\{ pubk(A), N_A \}pubk(B)$$

    alt β holds (C = B and $$pubk(A) ∈ S_C$$)
        B->>A: $$\{ N_A, N_C, pubk(B) \}pubk(A)$$
    else ¬β
        C->>A: {N}K
    end
```

### What failure mode looks like?

## Tornado Cash like situation

[@costaDynamicEpistemicVerification].


## What real Tornado Cash like system hacks look like?



[bibliography]
