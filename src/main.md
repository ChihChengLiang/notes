# Can we formally verify privacy properties?

Yes, but are we talking about [private messaging like] applications or [zeroknowledge proof like] applications?


```mermaid
sequenceDiagram
    participant A as Alice
    participant B as Bob
    participant C as Charlie

    A->>B: {pubk(A), NA}pubk(B)
    A->>C: {pubk(A), NA}pubk(B)

    alt β holds (C = B and pubk(A) ∈ SC)
        B->>A: {NA, NC, pubk(B)}pubk(A)
    else ¬β
        C->>A: {N}K
    end
```

Some relevant work includes [@costaDynamicEpistemicVerification].




[bibliography]
