import { dirname } from "path";
import yaml from "js-yaml";
import { renderMyst, renderSlidesSections, injectToc } from "./markdown-processor";

export const STATIC_FILES = ["theme.css", "styles.css", "client.js", "mermaid-init.js", "reveal-theme.css", "reveal-base.css", "reveal-print.css"] as const;

export interface SummaryPage {
  slug: string;
  path: string;
  title: string;
}

export interface SummaryTopic {
  slug: string;
  path: string;
  title: string;
  pages: SummaryPage[];
}

// notes/SUMMARY.md is the single source of truth for which topics and
// sub-pages exist and in what order — nothing here scans the filesystem.
// Top-level `- [title](path)` entries are topics; a nested entry is one of
// that topic's extra pages (reports, research dumps, etc).
export async function parseSummary(): Promise<SummaryTopic[]> {
  const content = await Bun.file("./notes/SUMMARY.md").text();
  const topics: SummaryTopic[] = [];
  const lineRe = /^(\s*)-\s+\[([^\]]+)\]\(([^)]+)\)/;

  for (const line of content.split("\n")) {
    const m = line.match(lineRe);
    if (!m) continue;
    const [, indent, title, path] = m;

    if (indent.length === 0) {
      topics.push({ slug: path.split("/")[0], path, title, pages: [] });
    } else {
      const current = topics[topics.length - 1];
      if (!current) continue;
      const filename = path.split("/").pop()!;
      current.pages.push({ slug: filename.replace(/\.md$/, ""), path, title });
    }
  }

  return topics;
}

export async function readFrontmatterFlags(path: string): Promise<{ date: string | null; generated: boolean }> {
  let content: string;
  try {
    content = await Bun.file(path).text();
  } catch {
    return { date: null, generated: false };
  }
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { date: null, generated: false };
  const fm = (yaml.load(match[1]) as Record<string, any>) ?? {};
  const date = fm.date instanceof Date ? fm.date.toISOString().slice(0, 10) : fm.date ? String(fm.date) : null;
  return { date, generated: fm.generated === true };
}

export async function renderSlides(slidesPath: string, root: string = "/"): Promise<string> {
  const bibPath = await findBibPath(dirname(slidesPath));
  const content = await Bun.file(slidesPath).text();
  const { sections, title } = await renderSlidesSections(content, bibPath);
  const template = await Bun.file("./src/templates/reveal.html").text();
  return template
    .replace("{{title}}", escapeAttr(title ?? "Slides"))
    .replaceAll("{{root}}", root)
    .replace("{{slides}}", () => sections.join("\n"));
}

export async function renderIndexHtml(
  template: string,
  linkStyle: "server" | "static"
): Promise<string> {
  const topics = await parseSummary();
  const items = await Promise.all(
    topics.map(async (t) => {
      const { date } = await readFrontmatterFlags(`./notes/${t.path}`);
      const hasSlides = await Bun.file(`./notes/${t.slug}/slides.md`).exists();
      const topicHref = linkStyle === "static" ? `./${t.slug}/` : `/${t.slug}`;
      const slidesHref = linkStyle === "static" ? `./${t.slug}/slides.html` : `/${t.slug}/slides`;
      return { date, title: t.title, hasSlides, topicHref, slidesHref };
    })
  );

  const count = items.length;
  const years = items.map((i) => i.date?.slice(0, 4)).filter((y): y is string => !!y);
  const sinceYear = years.length > 0 ? years.reduce((a, b) => (b < a ? b : a)) : "2024";

  const listHtml = items.map((item, i) => {
    const slidesLink = item.hasSlides
      ? `<div class="nb-links"><a href="${item.slidesHref}" class="nb-slides-link">◧ slides</a></div>`
      : "";

    const titleContent = escapeHtml(item.title);

    const itemHtml = `<li class="nb-item">
      <time class="nb-date" datetime="${item.date ?? ""}">${item.date ?? ""}</time>
      <div class="nb-body">
        <a class="nb-title" href="${item.topicHref}">${titleContent}</a>
        ${slidesLink}
      </div>
    </li>`;

    if (i < items.length - 1) {
      return itemHtml + `\n    <li class="nb-divider" aria-hidden="true" role="presentation">❦</li>`;
    }
    return itemHtml;
  });

  const body = `<div class="index-nb">
  <div class="nb-masthead">
    <div>
      <div class="nb-folio">research notebook · ${sinceYear}–</div>
      <h1>CC's Research Notebook</h1>
    </div>
    <div class="nb-count">
      <div>${count} entries</div>
    </div>
  </div>
  <ul class="nb-list">
    ${listHtml.join("\n    ")}
  </ul>
</div>`;

  const html = template.replace("{{content}}", () => body);
  return applyPageMeta(html, "CC's Research Note", "Research notes and essays by CC.");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "";
}

export function extractDescription(markdown: string): string {
  const withoutFrontmatter = markdown.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  const paragraphs = withoutFrontmatter.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed || /^#/.test(trimmed) || /^```/.test(trimmed) || /^<!--/.test(trimmed)) continue;
    const plain = trimmed
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (plain.length > 10) return plain.length > 160 ? plain.slice(0, 157) + "..." : plain;
  }
  return "";
}

export function applyPageMeta(template: string, title: string, description: string): string {
  const siteName = "CC's Research Note";
  const pageTitle = title && title !== siteName ? `${title} — ${siteName}` : siteName;
  return template
    .replace("{{page_title}}", escapeAttr(pageTitle))
    .replaceAll("{{og_title}}", escapeAttr(title || siteName))
    .replaceAll("{{og_description}}", escapeAttr(description));
}

async function findBibPath(topicDir: string): Promise<string | null> {
  for (const ext of ["citation.bib", "citation.biblatex"]) {
    const path = `${topicDir}/${ext}`;
    if (await Bun.file(path).exists()) return path;
  }
  return null;
}

// Pill-link row (`◧ slides`, `⚙ Report Title`) linking to a topic's other
// pages. `current` is the slug of whichever page is being rendered (or null
// for the main article), so that page's own pill is skipped.
function buildTopicNav(opts: {
  linkStyle: "server" | "static";
  hasSlides: boolean;
  pages: SummaryPage[];
  current: string | null;
}): string {
  const { linkStyle, hasSlides, pages, current } = opts;
  const pills: string[] = [];

  if (current !== null) {
    pills.push(`<a class="nb-slides-link" href="./">✎ article</a>`);
  }
  if (hasSlides) {
    const href = linkStyle === "static" ? "slides.html" : "slides";
    pills.push(`<a class="nb-slides-link" href="${href}">◧ slides</a>`);
  }
  for (const page of pages) {
    if (page.slug === current) continue;
    const href = linkStyle === "static" ? `${page.slug}.html` : page.slug;
    pills.push(`<a class="nb-slides-link generated" href="${href}">⚙ ${escapeHtml(page.title)}</a>`);
  }

  if (pills.length === 0) return "";
  return `<div class="topic-nav">${pills.join("\n")}</div>\n`;
}

function assembleArticleHtml(opts: {
  bodyHtml: string;
  date: string | null;
  navHtml: string;
  backLinkHtml: string;
  bannerHtml?: string;
}): string {
  // Order: title, date, nav pills, TOC (spliced in at the anchor by
  // injectToc), ornamental divider, body.
  const metaHtml = opts.date ? `<div class="note-meta"><time datetime="${opts.date}">${opts.date}</time></div>` : "";
  const ornHtml = opts.date ? `<div class="nb-article-orn" aria-hidden="true">❦ &nbsp; ❦ &nbsp; ❦</div>` : "";
  const front = `${metaHtml}${opts.navHtml}<!--toc-anchor-->${ornHtml}`;

  // Pages without their own H1 (some reports are just prose) still need the
  // front matter — fall back to prepending it rather than dropping it.
  let html = opts.bodyHtml.includes("</h1>")
    ? opts.bodyHtml.replace(/(<\/h1>)/, `$1${front}`)
    : `${front}${opts.bodyHtml}`;
  html = `${opts.backLinkHtml}\n${html}`;
  if (opts.bannerHtml) html = `${opts.bannerHtml}\n${html}`;
  html = injectToc(html);
  return `<div class="article-content">${html}</div>`;
}

export async function renderTopicHtml(
  topic: string,
  template: string,
  options: { linkStyle: "server" | "static" }
): Promise<string | null> {
  const topics = await parseSummary();
  const entry = topics.find((t) => t.slug === topic);
  if (!entry) return null;

  const topicDir = `./notes/${topic}`;
  const mainFile = Bun.file(`${topicDir}/main.md`);
  if (!(await mainFile.exists())) return null;

  const bibPath = await findBibPath(topicDir);
  const content = await mainFile.text();
  const { html: bodyHtml, date, title } = await renderMyst(content, bibPath);

  const hasSlides = await Bun.file(`${topicDir}/slides.md`).exists();
  const navHtml = buildTopicNav({ linkStyle: options.linkStyle, hasSlides, pages: entry.pages, current: null });

  const html = assembleArticleHtml({
    bodyHtml,
    date,
    navHtml,
    backLinkHtml: `<a class="nb-back-link" href="../">← notebook</a>`,
  });

  return applyPageMeta(
    template.replace("{{content}}", () => html),
    entry.title || title || extractTitle(content),
    extractDescription(content)
  );
}

export async function renderReportHtml(
  topic: string,
  slug: string,
  template: string,
  options: { linkStyle: "server" | "static" }
): Promise<string | null> {
  const topics = await parseSummary();
  const entry = topics.find((t) => t.slug === topic);
  const page = entry?.pages.find((p) => p.slug === slug);
  if (!entry || !page) return null;

  const topicDir = `./notes/${topic}`;
  const file = Bun.file(`${topicDir}/${slug}.md`);
  if (!(await file.exists())) return null;

  const bibPath = await findBibPath(topicDir);
  const content = await file.text();
  const { html: bodyHtml, date, title, generated } = await renderMyst(content, bibPath);

  const hasSlides = await Bun.file(`${topicDir}/slides.md`).exists();
  const navHtml = buildTopicNav({ linkStyle: options.linkStyle, hasSlides, pages: entry.pages, current: slug });

  const html = assembleArticleHtml({
    bodyHtml,
    date,
    navHtml,
    backLinkHtml: `<a class="nb-back-link" href="./">← ${escapeHtml(entry.title)}</a>`,
    bannerHtml: generated
      ? `<div class="generated-banner">⚙ Machine-generated — not written or edited by CC.</div>`
      : undefined,
  });

  return applyPageMeta(
    template.replace("{{content}}", () => html),
    page.title || title || extractTitle(content),
    extractDescription(content)
  );
}

export function applyAssetPaths(template: string, prefix: string): string {
  return template
    .replace(/href="\/theme\.css"/g, `href="${prefix}/theme.css"`)
    .replace(/href="\/styles\.css"/g, `href="${prefix}/styles.css"`)
    .replace(/src="\/client\.js"/g, `src="${prefix}/client.js"`)
    .replace(/from '\/mermaid-init\.js'/g, `from '${prefix}/mermaid-init.js'`);
}
