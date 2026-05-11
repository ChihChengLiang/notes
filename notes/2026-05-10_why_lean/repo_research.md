

I'd like to study this repo. Reminds me if I forgot to prompt you what I'm interested to investigate. 
Take a good look of the repo and write a report.md.

The report should contain a "Background" and "Highlight" sections.

## Backgound

Example Background section:

- **Repo**: [`Verified-zkEVM/clean`](https://github.com/Verified-zkEVM/clean) — Lean 4 library for writing and formally verifying ZK circuits
- **Organization**: [zkSecurity](https://zksecurity.xyz/), under the Verified-zkEVM grant program
- **Language**: Lean 4, with a Rust backend (Plonky3)
- **Timeline**: July 2024 – present (~22 months of active development, steep ramp-up in 2025)
- **Goal**: Machine-checked proofs for ZK circuit correctness — soundness, completeness, and field wrap-around safety — over *all* possible field elements and adversarial witnesses, not just tested inputs
- **Scale**: 26,404 lines of Lean across 153 files; ~800 commits/month peak in mid-2025, settled at ~200/month
- **License**: Apache 2.0 (Circomlib port: LGPL)

Scale might require a cloc analysis.

## Highlight

The highlight depends on the prompted question for investigation. Try find the Good/Bad/Ugly of the repo, they don't need to be propotionally equal. Usually when we are motivated to find the goods about a repo, the bad and ugly are just for caveats to keep in mind.

Do bullet points. 

Example highlight:

- **Familiar syntax, proof obligation attached.** You write circuits with `do`-notation — the same structure a Circom developer would recognise. The original Circom source is embedded as a comment alongside the Lean translation, making the correspondence explicit. The difference: you must also supply a machine-checked proof that the constraints do what the comment says.

### Don't be shy from adding Code exerpts.

Code exerpt: 
- Can do light edit for readability.
- Add permalink for reader to verify the source.