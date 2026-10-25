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

**Notes** (`notes/<topic>/main.md`) are rendered through `src/markdown-processor.ts` (MyST: `myst-parser` → `myst-to-html` with custom hast handlers) into an HTML shell defined in `src/templates/article.html`.

**Slides** (`notes/<topic>/slides.md`) are rendered by `src/site.ts:renderSlides()` into `src/templates/reveal.html`, a reveal.js 5 presentation loaded from CDN.

### Content discovery

`notes/SUMMARY.md` is the single source of truth for which topics exist, their order, and each topic's extra pages — nothing is discovered by scanning the filesystem. `src/site.ts:parseSummary()` parses it: top-level `- [title](topic/main.md)` entries are topics; a nested entry (`- [title](topic/report.md)`) is one of that topic's extra pages (e.g. an AI-assisted research report). A topic or page not listed there doesn't render, even if the `.md` file exists on disk. Link text is the canonical title everywhere (index, nav, page `<title>`). `slides.md` is the one exception — it's still auto-detected by file existence per topic, since there's no ordering/curation question for a single well-known filename.

A report page can set `generated: true` in its own frontmatter to render a "Machine-generated" banner and a distinct nav-pill style, signaling it isn't the author's own writing.

### Key source files

- `src/site.ts` — shared rendering logic used by both server and build (index HTML, per-topic HTML, slides rendering)
- `src/markdown-processor.ts` — MyST pipeline; extensions are set in the two `mystParse` calls (notes and slides). A bare `:::` fence with no `{directive}` renders as a code block, not a container
- `src/server.ts` — Bun HTTP server with SSE live-reload; watches only `notes/` and `src/templates/`, so changes to `src/*.ts` need a server restart

### Template assets (`src/templates/`)

The `article.html` and `reveal.html` shells are never copied to `dist/`; they are inlined server-side. Other files are copied verbatim only if listed in `STATIC_FILES` in `src/build.ts`; add new template files there.

### Slides theme

- `reveal-theme.css` — warm paper palette (`--custom-1` … `--custom-12` oklch scale) and all reveal.js token overrides (`--r-*`). Edit here to change fonts, colors, and slide variants (`title-slide`, `chapter`, `centered`).
- `reveal-base.css` — unmodified reveal.js base stylesheet; do not edit.
- `reveal-print.css` — PDF export layout; loaded only when `?print-pdf` is in the URL.

### Citation support

All notes share one bibliography, `notes/citations.bib`. `bun run cite <query>` appends an entry from Zotero (via Better BibTeX); hand-written `@online` entries are fine too. Cite inline with `[@key]`, and end the note with a `:::{bibliography}` directive to list the cited sources.

### Math

Rendered at build time with KaTeX. Only `$…$` and `$$…$$` work; `\(…\)` and `\[…\]` are not parsed.

### Mermaid

Mermaid fences are rendered to SVG at build time by `src/diagram.ts` using [Pele](https://pele.run) — no diagram JS ships to the browser. Colors come from `--pele-*` CSS variables mapped onto the `--custom-*` palette in `styles.css` and `reveal-theme.css`, so dark mode switches without re-rendering. `$$…$$` in labels is typeset with KaTeX (width estimated, since there's no DOM). Label widths use a Noto Serif JP width table in `diagram.ts`; re-measure it if the font changes. Pele parses but doesn't draw `e1@{ animate: true }` or `animation:` in a classDef, so `diagram.ts` re-applies both with a style block scoped to the diagram. `src/rough-svg.ts` then gives the SVG a hand-drawn look with rough.js (seeded from the diagram source, so builds are deterministic): edges, lifelines and frame dividers get their path data roughened in place; node, subgraph and frame shapes keep a crisp fill (stroke hidden) under a rough `.pele-rough` outline (edges and node outlines are drawn `THICKEN` px heavier) that carries the stroke styling — target `.pele-rough`, not the shape, when styling or animating a node's border. Tune the look via the `LINE`/`SHAPE` options there. In slides, a `%% fragment` comment opts a diagram into per-node (flowchart) or per-message (sequence) click-to-reveal, wired in `reveal.html` via Pele's `data-id` attributes.
