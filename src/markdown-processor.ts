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

function postProcess(html: string): string {
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>")
    .replace(/<hr>/g, '<div class="divider-orn" aria-hidden="true">✦</div>');
}

export async function renderMyst(
  content: string,
  bibPath: string | null
): Promise<{ html: string; date: string | null; title: string | null }> {
  const tree = mystParse(content, {
    extensions: { frontmatter: true, math: true, citations: bibPath !== null },
  }) as any;

  // Extract frontmatter from first node if it's a yaml code block
  let date: string | null = null;
  let title: string | null = null;
  const firstChild = tree.children[0];
  if (firstChild?.type === "code" && firstChild?.lang === "yaml") {
    tree.children.shift();
    const fm = (yaml.load(firstChild.value) as Record<string, any>) ?? {};
    date = fm.date ? String(fm.date) : null;
    title = fm.title ? String(fm.title) : null;
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

  const html = mystToHtml(tree, {
    hast: {
      allowDangerousHtml: true,
      handlers: {
        ...mathHandlers,
        ...codeHandler,
        ...makeCitationHandlers(bibCache),
      },
    },
    stringifyHtml: { allowDangerousHtml: true },
  });

  return { html: postProcess(html), date, title };
}

export function injectToc(html: string): string {
  type Heading = { level: number; id: string; inner: string };
  const headings: Heading[] = [];
  const re = /<(h[2-6])[^>]*\sid="([^"]+)"[^>]*>(.*?)<\/h[2-6]>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    headings.push({ level: parseInt(m[1][1]), id: m[2], inner: m[3] });
  }
  if (headings.length < 2) return html;

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

  if (html.includes('class="note-meta"')) {
    return html.replace(/(<div class="note-meta">[\s\S]*?<\/div>)/, `$1\n${toc}`);
  }
  return html.replace("</h1>", `</h1>\n${toc}`);
}
