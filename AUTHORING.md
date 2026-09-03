# Authoring reference

Not a published note — paste this into a Claude.ai chat as context so it writes
content in this site's format. Kept terse and example-driven on purpose; update
it when the custom syntax in `src/markdown-processor.ts` changes.

## Frontmatter

```
---
date: 2026-09-04
generated: true   # optional — marks "machine-generated" banner + nav pill style
---
```

`title` is optional frontmatter too; falls back to the first `# H1`.

## Timeline directive

```
:::{timeline}
:reverse: false

May 2013 — Event title
: Description of the event, can include **markdown** and [@citations].

2014 — Next event
: ...

:::
```

Each entry is `Date — Title` on the term line, `: description` on the next.
`:reverse: false` renders oldest-first; omit it for newest-first (default).

## YouTube embed

```
:::{youtube} yCOCZhkDmnc
:title: Accessible title for the embed
:::
```

Accepts a bare video ID or a full YouTube URL.

## Citations

Cite a source inline with `[@bibkey]` (stack multiple as `[@key1][@key2]`).
Renders as a clickable pill linking straight to the source (DOI if the entry
has one, else its URL); hovering shows author/year/title.

Every citation key must exist in the single global `notes/citations.bib`
(biblatex format) — there's no per-note bibliography file. Add new sources
there, keyed however you like (existing convention: short kebab-case for
press/news, CSL-style camelCase for academic papers).

```
:::{bibliography}
:::
```

Drop this wherever a "References" section should go. It auto-lists every
`[@key]` actually cited earlier in *that* document (not the whole global
file), pulling full author/year/title/link straight from `citations.bib` —
nothing is hand-typed.

## Footnotes (asides, not citations)

```
Some claim that needs a side comment.[^aside]

[^aside]: The actual comment, can include [links](https://example.com).
```

Renders as a small superscript marker; hovering/clicking shows the note in a
popover near the marker instead of jumping to the bottom of the page. Use
footnotes for genuine tangential commentary — use `[@key]` citations (above)
for anything that's actually a source.
