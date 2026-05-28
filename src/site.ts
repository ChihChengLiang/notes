import { readdirSync } from "fs";
import { dirname } from "path";
import { renderMyst, renderSlidesSections, injectToc } from "./markdown-processor";

export const STATIC_FILES = ["theme.css", "styles.css", "client.js", "mermaid-init.js", "reveal-theme.css", "reveal-base.css"] as const;

export function getTopics(): string[] {
  const entries = readdirSync("./notes", { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function getTopicTitle(topic: string): Promise<string> {
  try {
    const content = await Bun.file(`./notes/${topic}/main.md`).text();
    const match = content.match(/^#\s+(.+)$/m);
    return match?.[1] ?? topic;
  } catch {
    return topic;
  }
}

export async function getTopicDate(topic: string): Promise<string | null> {
  try {
    const content = await Bun.file(`./notes/${topic}/main.md`).text();
    const match = content.match(/^---\s*\ndate:\s*(.+?)\s*\n/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
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
  const topics = getTopics();
  const items = await Promise.all(
    topics.map(async (topic) => {
      const [title, date] = await Promise.all([getTopicTitle(topic), getTopicDate(topic)]);
      const hasSlides = await Bun.file(`./notes/${topic}/slides.md`).exists();
      const topicHref = linkStyle === "static" ? `./${topic}/` : `/${topic}`;
      const slidesHref = linkStyle === "static" ? `./${topic}/slides.html` : `/${topic}/slides`;
      return { date, title, hasSlides, topicHref, slidesHref };
    })
  );
  items.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const count = items.length;
  const sinceYear = items.length > 0 ? (items[items.length - 1].date?.slice(0, 4) ?? "2024") : "2024";

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

export async function renderTopicHtml(
  topicDir: string,
  template: string,
  _options?: { alwaysReloadFiles?: boolean }
): Promise<string | null> {
  const mainFile = Bun.file(`${topicDir}/main.md`);
  if (!(await mainFile.exists())) return null;

  const bibPath = await findBibPath(topicDir);
  const content = await mainFile.text();
  const { html: bodyHtml, date, title } = await renderMyst(content, bibPath);

  let html = bodyHtml;
  if (date) {
    html = html.replace(
      /(<\/h1>)/,
      `$1<div class="note-meta"><time datetime="${date}">${date}</time></div>` +
      `<div class="nb-article-orn" aria-hidden="true">❦ &nbsp; ❦ &nbsp; ❦</div>`
    );
  }
  html = `<a class="nb-back-link" href="../">← notebook</a>\n` + html;
  html = injectToc(html);
  html = `<div class="article-content">${html}</div>`;

  return applyPageMeta(
    template.replace("{{content}}", () => html),
    title ?? extractTitle(content),
    extractDescription(content)
  );
}

export function applyAssetPaths(template: string, prefix: string): string {
  return template
    .replace(/href="\/theme\.css"/g, `href="${prefix}/theme.css"`)
    .replace(/href="\/styles\.css"/g, `href="${prefix}/styles.css"`)
    .replace(/src="\/client\.js"/g, `src="${prefix}/client.js"`)
    .replace(/src="\/mermaid-init\.js"/g, `src="${prefix}/mermaid-init.js"`);
}
