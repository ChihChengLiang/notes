# Can we formally verify privacy properties?

Yes, but are we talking about [private messaging like] applications or [zeroknowledge proof like] applications?


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

Some relevant work includes [@costaDynamicEpistemicVerification].




[bibliography]
