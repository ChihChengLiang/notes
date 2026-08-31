import { mystParse } from "myst-parser";
import { mystToHtml } from "myst-to-html";
import katex from "katex";
import hljs from "highlight.js";
import yaml from "js-yaml";
import leanHljs from "./lean.ts";
// @ts-ignore
import { BibLatexParser } from "biblatex-csl-converter";

hljs.registerLanguage("lean", leanHljs);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightCode(value: string, lang: string | undefined): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><span>${lang}</span><code>${hljs.highlight(value, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
    } catch (_) {}
  }
  return `<pre class="hljs">${lang ? `<span>${lang}</span>` : ""}<code>${escapeHtml(value)}</code></pre>`;
}

export async function loadBibliography(bibPath: string) {
  const bibContent = await Bun.file(bibPath).text();
  const parser = new BibLatexParser(bibContent, { processUnexpected: true, processUnknown: true });
  return parser.parse().entries;
}

function makeCitationHandlers(bibCache: any) {
  function renderCiteNode(node: any): string {
    const label: string = node.label ?? node.identifier ?? "";
    if (!bibCache) return `<cite>[${label}]</cite>`;

    const bibEntry = Object.values(bibCache).find((e: any) => e.entry_key === label) as any;
    if (!bibEntry?.fields) return `<cite>[${label}]</cite>`;

    const firstAuthor = bibEntry.fields.author?.[0];
    const authorName =
      firstAuthor?.family?.[0]?.text ?? firstAuthor?.literal?.[0]?.text ?? "Unknown";
    const hasMultiple = (bibEntry.fields.author?.length ?? 0) > 1;
    const authorText = hasMultiple ? `${authorName} et al.` : authorName;
    const year = bibEntry.fields.date ?? bibEntry.fields.year ?? "";
    const fullTitle = (bibEntry.fields.title ?? []).map((p: any) => p.text ?? "").join(" ");
    const title = fullTitle.length > 60 ? fullTitle.slice(0, 57) + "..." : fullTitle;
    const doi = bibEntry.fields.doi ?? "";

    return `<span class="citation" data-citation-author="${escapeHtml(authorText)}" data-citation-year="${escapeHtml(year)}" data-citation-title="${escapeHtml(title)}" data-citation-doi="${escapeHtml(doi)}">[${escapeHtml(authorText)}, ${escapeHtml(year)}]</span>`;
  }

  return {
    cite(_h: any, node: any) {
      return { type: "raw", value: renderCiteNode(node) };
    },
    citeGroup(_h: any, node: any) {
      const parts = (node.children ?? [])
        .filter((c: any) => c.type === "cite")
        .map((c: any) => renderCiteNode(c))
        .join("");
      return { type: "raw", value: parts };
    },
  };
}

const mathHandlers = {
  math(_h: any, node: any) {
    const html = katex.renderToString(node.value ?? "", { displayMode: true, throwOnError: false });
    return { type: "raw", value: `<div class="math-display">${html}</div>\n` };
  },
  inlineMath(_h: any, node: any) {
    const html = katex.renderToString(node.value ?? "", { displayMode: false, throwOnError: false });
    return { type: "raw", value: `<span class="math-inline">${html}</span>` };
  },
};

const codeHandler = {
  code(_h: any, node: any) {
    const lang: string | undefined = node.lang;
    if (lang === "mermaid") {
      return { type: "raw", value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>` };
    }
    return { type: "raw", value: highlightCode(node.value, lang) };
  },
};

// `:::{timeline}` directive: body is a definition list (`Date — Title\n: details`),
// one term/description pair per event. Split each term on the first " — " into a
// date and a title so they can render as separate columns.
function splitTermDateTitle(children: any[]): { date: string; title: any[] } {
  const first = children[0];
  if (!first || first.type !== "text") return { date: "", title: children };
  const idx = first.value.indexOf(" — ");
  if (idx === -1) return { date: "", title: children };
  const date = first.value.slice(0, idx);
  const restText = first.value.slice(idx + 3);
  const title = restText ? [{ type: "text", value: restText }, ...children.slice(1)] : children.slice(1);
  return { date, title };
}

function extractTimelineEvents(body: any[]): any[] {
  const events: any[] = [];
  for (const node of body) {
    if (node.type !== "definitionList") continue;
    const children = node.children ?? [];
    for (let i = 0; i < children.length; i += 2) {
      const term = children[i];
      const desc = children[i + 1];
      if (term?.type !== "definitionTerm") continue;
      const { date, title } = splitTermDateTitle(term.children ?? []);
      events.push({
        type: "timelineEvent",
        date,
        title,
        children: desc?.type === "definitionDescription" ? desc.children ?? [] : [],
      });
    }
  }
  return events;
}

const timelineDirective = {
  name: "timeline",
  options: {
    reverse: { type: Boolean, doc: "Render newest-first (default true)." },
  },
  body: { type: "myst" },
  run(data: any) {
    return [
      {
        type: "timeline",
        reverse: data.options?.reverse !== false,
        children: extractTimelineEvents(data.body ?? []),
      },
    ];
  },
};

const timelineHandlers = {
  timeline(h: any, node: any) {
    const children = node.reverse ? [...(node.children ?? [])].reverse() : node.children ?? [];
    return h(node, "div", { class: "timeline" }, h.all({ type: "wrap", children }));
  },
  timelineEvent(h: any, node: any) {
    const dateEl = {
      type: "element",
      tagName: "div",
      properties: { class: "timeline-date" },
      children: node.date ? [{ type: "text", value: node.date }] : [],
    };
    const titleEl = h(node, "div", { class: "timeline-title" }, h.all({ type: "wrap", children: node.title ?? [] }));
    const detailsEl = h(node, "div", { class: "timeline-details" }, h.all({ type: "wrap", children: node.children ?? [] }));
    const bodyEl = h(node, "div", { class: "timeline-body" }, [titleEl, detailsEl]);
    return h(node, "div", { class: "timeline-event" }, [dateEl, bodyEl]);
  },
};

// `:::{youtube} <url-or-id>` directive: renders a responsive, privacy-friendly
// (youtube-nocookie.com) embed instead of a raw hand-pasted iframe.
function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : trimmed;
}

const youtubeDirective = {
  name: "youtube",
  arg: { type: String, required: true, doc: "YouTube video ID or URL" },
  options: {
    title: { type: String, doc: "Accessible title for the embed" },
  },
  run(data: any) {
    return [
      {
        type: "youtube",
        videoId: extractYoutubeId(String(data.arg ?? "")),
        title: data.options?.title ? String(data.options.title) : "YouTube video",
      },
    ];
  },
};

const youtubeHandlers = {
  youtube(_h: any, node: any) {
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(node.videoId)}`;
    return {
      type: "raw",
      value: `<div class="video-embed"><iframe src="${src}" title="${escapeHtml(node.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`,
    };
  },
};

function makeHtmlOptions(bibCache: any) {
  return {
    hast: {
      allowDangerousHtml: true,
      handlers: {
        ...mathHandlers,
        ...codeHandler,
        ...timelineHandlers,
        ...youtubeHandlers,
        ...makeCitationHandlers(bibCache),
      } as any,
    },
    stringifyHtml: { allowDangerousHtml: true },
  };
}

function slugify(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function addHeadingIds(html: string): string {
  const used = new Map<string, number>();
  return html.replace(/<(h[2-6])>([\s\S]*?)<\/h[2-6]>/g, (_match, tag, content) => {
    const slug = slugify(content);
    const count = used.get(slug) ?? 0;
    used.set(slug, count + 1);
    const id = count === 0 ? slug : `${slug}-${count}`;
    return `<${tag} id="${id}">${content}</${tag}>`;
  });
}

function postProcess(html: string): string {
  return addHeadingIds(
    html
      .replace(/<table>/g, '<div class="table-wrap"><table>')
      .replace(/<\/table>/g, "</table></div>")
      .replace(/<hr>/g, '<div class="divider-orn" aria-hidden="true">✦</div>')
  );
}

export async function renderMyst(
  content: string,
  bibPath: string | null
): Promise<{ html: string; date: string | null; title: string | null; generated: boolean }> {
  const tree = mystParse(content, {
    extensions: { frontmatter: true, math: true, citations: bibPath !== null },
    directives: [timelineDirective as any, youtubeDirective as any],
  }) as any;

  // Extract frontmatter from first node if it's a yaml code block
  let date: string | null = null;
  let title: string | null = null;
  let generated = false;
  const firstChild = tree.children[0];
  if (firstChild?.type === "code" && firstChild?.lang === "yaml") {
    tree.children.shift();
    const fm = (yaml.load(firstChild.value) as Record<string, any>) ?? {};
    date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : fm.date ? String(fm.date) : null;
    title = fm.title ? String(fm.title) : null;
    generated = fm.generated === true;
  }

  // Extract title from first heading if not in frontmatter
  if (!title) {
    const firstHeading = tree.children.find((n: any) => n.type === "heading" && n.depth === 1);
    if (firstHeading) {
      title = firstHeading.children?.map((c: any) => c.value ?? "").join("") ?? null;
    }
  }

  let bibCache: any = null;
  if (bibPath !== null) {
    bibCache = await loadBibliography(bibPath);
  }

  const html = mystToHtml(tree, makeHtmlOptions(bibCache));
  return { html: postProcess(html), date, title, generated };
}

export async function renderSlidesSections(
  content: string,
  bibPath: string | null
): Promise<{ sections: string[]; title: string | null }> {
  const tree = mystParse(content, {
    extensions: { frontmatter: true, math: true, blocks: true, citations: bibPath !== null },
    directives: [timelineDirective as any, youtubeDirective as any],
  }) as any;

  let title: string | null = null;
  const firstChild = tree.children[0];
  if (firstChild?.type === "code" && firstChild?.lang === "yaml") {
    tree.children.shift();
    const fm = (yaml.load(firstChild.value) as Record<string, any>) ?? {};
    title = fm.title ? String(fm.title) : null;
  }

  let bibCache: any = null;
  if (bibPath !== null) bibCache = await loadBibliography(bibPath);

  const opts = makeHtmlOptions(bibCache);
  const sections: string[] = [];

  const renderPage = (children: any[]): string => {
    const noteNodes = children.filter((c: any) => c.type === "code" && c.lang === "notes");
    const contentNodes = children.filter((c: any) => !(c.type === "code" && c.lang === "notes"));

    const contentHtml = postProcess(mystToHtml({ type: "root", children: contentNodes }, opts));
    const notesHtml = noteNodes.length > 0
      ? `<aside class="notes">${noteNodes.map((n: any) => escapeHtml(n.value)).join("\n")}</aside>`
      : "";

    return `${contentHtml}\n${notesHtml}`;
  };

  for (const node of tree.children) {
    if (node.type !== "block") continue;

    let slideClass = "";
    if (node.meta) {
      try { slideClass = JSON.parse(node.meta).class ?? ""; } catch (_) {}
    }

    // A bare `---` (thematicBreak) inside a `+++` block splits that chapter
    // into vertical pages, navigated up/down instead of left/right.
    const pages: any[][] = [[]];
    for (const child of node.children ?? []) {
      if (child.type === "thematicBreak") pages.push([]);
      else pages[pages.length - 1].push(child);
    }

    const classAttr = slideClass ? ` class="${slideClass}"` : "";

    if (pages.length === 1) {
      sections.push(`<section${classAttr}>\n${renderPage(pages[0])}</section>`);
    } else {
      // The class from `+++ {"class": ...}` describes the page right after
      // it (the first page of the stack), not the stack wrapper — reveal.js
      // backgrounds aren't inherited from parent to vertical child slides,
      // so a class on the wrapper alone would never actually render.
      const inner = pages
        .map((page, i) => `<section${i === 0 ? classAttr : ""}>\n${renderPage(page)}</section>`)
        .join("\n");
      sections.push(`<section>\n${inner}\n</section>`);
    }
  }

  return { sections, title };
}

// Caller marks the insertion point with a `<!--toc-anchor-->` comment
// (right after the title's date/nav row, before the ornamental divider) —
// explicit, so this doesn't have to guess placement by regex-matching
// whatever front-matter markup happens to precede the article body.
export function injectToc(html: string): string {
  type Heading = { level: number; id: string; inner: string };
  const headings: Heading[] = [];
  const re = /<(h[2-6])[^>]*\sid="([^"]+)"[^>]*>(.*?)<\/h[2-6]>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    headings.push({ level: parseInt(m[1][1]), id: m[2], inner: m[3] });
  }
  if (headings.length < 2) return html.replace("<!--toc-anchor-->", "");

  function buildList(items: Heading[], from: number, minLevel: number): [string, number] {
    let out = "<ol>\n";
    let i = from;
    while (i < items.length) {
      const h = items[i];
      if (h.level < minLevel) break;
      if (h.level === minLevel) {
        out += `<li><a href="#${h.id}">${h.inner}</a>`;
        i++;
        if (i < items.length && items[i].level > minLevel) {
          const [sub, next] = buildList(items, i, items[i].level);
          out += "\n" + sub;
          i = next;
        }
        out += "</li>\n";
      } else {
        i++;
      }
    }
    return [out + "</ol>\n", i];
  }

  const minLevel = Math.min(...headings.map((h) => h.level));
  const [list] = buildList(headings, 0, minLevel);
  const toc = `<nav class="toc">\n${list}</nav>\n`;

  return html.replace("<!--toc-anchor-->", toc);
}
