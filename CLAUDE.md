# CLAUDE.md

## Commands

```bash
bun install          # install dependencies
bun run dev          # dev server at http://localhost:3000 (live-reload via SSE)
bun run build        # build static site to dist/
bun run present      # interactively pick a slides.md and open in Marp presenter view
bun run new-note     # scaffold a new note directory
```

## Architecture

This is a **Bun + TypeScript** static site generator for research notes and slides.

### Two output pipelines

**Notes** (`notes/<topic>/main.md`) are rendered through `src/markdown-processor.ts` (markdown-it with plugins) into an HTML shell defined in `src/templates/article.html`.

**Slides** (`notes/<topic>/slides.md`) are rendered via Marp CLI, using the custom engine `marp-engine.js` and theme `src/templates/marp-theme.css`, configured by `.marprc.yml`.

### Content discovery

`src/site.ts:getTopics()` scans `notes/` for subdirectories. Each subdirectory with a `main.md` becomes a note; if `slides.md` also exists, a slides page is generated.

### Key source files

- `src/site.ts` — shared rendering logic used by both server and build (index HTML, per-topic HTML, slides delegation to Marp)
- `src/markdown-processor.ts` — markdown-it pipeline: syntax highlighting (highlight.js + custom Lean language), anchor headings, biblatex citations, mermaid fences, TOC injection, custom table/hr renderers
- `src/server.ts` — Bun HTTP server with SSE live-reload; watches `notes/` and `src/templates/`
- `src/build.ts` — static build; outputs to `dist/`

### Template assets (`src/templates/`)

Static files copied verbatim to `dist/`: `theme.css`, `styles.css`, `client.js`, `mermaid-init.js`. The `article.html` shell is never copied; it is inlined server-side.

### Citation support

Notes with a `citation.biblatex` file in their directory get biblatex citations rendered with author-year tooltips. The markdown-it-biblatex plugin handles inline `[@key]` syntax.

### Math

KaTeX is loaded from CDN in `article.html` and runs client-side via `auto-render.min.js`. Delimiters: `$…$` (inline), `$$…$$` (display), `\(…\)`, `\[…\]`.

### Mermaid

Mermaid fences are rendered as `<pre class="mermaid">` by the markdown processor; `src/templates/mermaid-init.js` initializes Mermaid client-side. The same pattern is used inside Marp slides via `marp-engine.js`.
