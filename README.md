# Research Note

Renders markdown notes and slides as webpages.

## Setup

```bash
bun install
```

## Commands

| Command | Description |
|---|---|
| `bun run dev` | Start local dev server for browsing notes |
| `bun run build` | Build static site to `dist/` (notes + slides HTML for GitHub Pages) |
| `bun run present` | Interactively pick a `slides.md` and open it in Marp presenter view |
| `bun run new-note` | Scaffold a new note directory |

## Things have to render

- Notes
    - markdown
    - latex formula (problem: latex dash clash with markdown italik)
    - Code
    - Table
    - Image
    - Mermaid diagram
    - Bibtex citations
- Slides
    - presentation mode. I need the bespoke one for presentation notes, and online readability
    - Printable mode. It should have a slide pdf for people to get the original
    - Latex, code, Mermaid, Bibtex should all work in presentation too.
- Same theme should apply to all notes and slides
- Agent friendlyness: I should provide markdowns for people to access the source.
- Decision: What's the trade-offs between client side rendering and server side rendering of latex or mermaid
