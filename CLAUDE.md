# CLAUDE.md

## Commands

```bash
bun install          # install dependencies
bun run dev          # dev server at http://localhost:3000 (live-reload via SSE)
bun run build        # build static site to dist/
bun run new-note     # scaffold a new note directory
```

To present slides, open `http://localhost:3000/<topic>/slides` in the browser. Append `?print-pdf` to the URL and use browser Print → Save as PDF for a paginated PDF export.

## Architecture

This is a **Bun + TypeScript** static site generator for research notes and slides.

### Two output pipelines

**Notes** (`notes/<topic>/main.md`) are rendered through `src/markdown-processor.ts` (markdown-it with plugins) into an HTML shell defined in `src/templates/article.html`.

**Slides** (`notes/<topic>/slides.md`) are rendered by `src/site.ts:renderSlides()` into `src/templates/reveal.html`, a reveal.js 5 presentation loaded from CDN. Styling is split across `reveal-base.css` (reveal.js defaults) and `reveal-theme.css` (warm paper palette + custom overrides).

### Content discovery

`notes/SUMMARY.md` is the single source of truth for which topics exist, their order, and each topic's extra pages — nothing is discovered by scanning the filesystem. `src/site.ts:parseSummary()` parses it: top-level `- [title](topic/main.md)` entries are topics; a nested entry (`- [title](topic/report.md)`) is one of that topic's extra pages (e.g. an AI-assisted research report). A topic or page not listed there doesn't render, even if the `.md` file exists on disk. Link text is the canonical title everywhere (index, nav, page `<title>`). `slides.md` is the one exception — it's still auto-detected by file existence per topic, since there's no ordering/curation question for a single well-known filename.

A report page can set `generated: true` in its own frontmatter to render a "Machine-generated" banner and a distinct nav-pill style, signaling it isn't the author's own writing.

### Key source files

- `src/site.ts` — shared rendering logic used by both server and build (index HTML, per-topic HTML, slides rendering)
- `src/markdown-processor.ts` — markdown-it pipeline: syntax highlighting (highlight.js + custom Lean language), anchor headings, biblatex citations, mermaid fences, TOC injection, custom table/hr renderers
- `src/server.ts` — Bun HTTP server with SSE live-reload; watches `notes/` and `src/templates/`
- `src/build.ts` — static build; outputs to `dist/`

### Template assets (`src/templates/`)

Static files copied verbatim to `dist/`: `theme.css`, `styles.css`, `client.js`, `mermaid-init.js`, `reveal-base.css`, `reveal-theme.css`, `reveal-print.css`. The `article.html` and `reveal.html` shells are never copied; they are inlined server-side.

### Slides theme

- `reveal-theme.css` — warm paper palette (`--custom-1` … `--custom-12` oklch scale) and all reveal.js token overrides (`--r-*`). Edit here to change fonts, colors, and slide variants (`title-slide`, `chapter`, `centered`).
- `reveal-base.css` — unmodified reveal.js base stylesheet; do not edit.
- `reveal-print.css` — PDF export layout; loaded only when `?print-pdf` is in the URL.

### Citation support

Notes with a `citation.biblatex` file in their directory get biblatex citations rendered with author-year tooltips. The markdown-it-biblatex plugin handles inline `[@key]` syntax.

### Math

KaTeX is loaded from CDN in `article.html` and `reveal.html`, running client-side via `auto-render.min.js`. Delimiters: `$…$` (inline), `$$…$$` (display), `\(…\)`, `\[…\]`.

### Mermaid

Mermaid fences are rendered as `<pre class="mermaid">` by the markdown processor. `src/templates/mermaid-init.js` exports `initMermaid({ startOnLoad })` which reads the `--custom-*` CSS palette and passes it as mermaid `themeVariables`. Notes call it with `startOnLoad: true`; slides call it with `startOnLoad: false` and run mermaid manually in `Reveal.on('ready')`.
