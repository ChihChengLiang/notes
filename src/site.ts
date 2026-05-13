import { readdirSync } from "fs";
import { Marp } from "@marp-team/marp-core";
import leanHljs from "./lean.ts";
import { createMarkdownProcessor, loadBibliography, setupCitationRenderer, parseFrontmatter, injectToc } from "./markdown-processor";

export const STATIC_FILES = ["theme.css", "styles.css", "client.js", "mermaid-init.js"] as const;

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

export async function renderSlides(markdown: string, mermaidScriptSrc: string): Promise<string> {
  const themeCSS = await Bun.file("./src/templates/marp-theme.css").text();
  const marp = new Marp({ html: true });
  marp.highlightjs.registerLanguage("lean", leanHljs);
  marp.themeSet.add(themeCSS);

  // Render mermaid fences as <pre class="mermaid"> for client-side mermaid v10+
  // (markdown-it-mermaid calls mermaid.parse() which requires browser APIs and fails in Bun)
  const md = marp.markdown;
  const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, slf: any) => {
    const token = tokens[idx];
    if (token.info.trim() === "mermaid") {
      return `<pre class="mermaid">${token.content}</pre>`;
    }
    return defaultFence(tokens, idx, options, env, slf);
  };

  const { html, css } = marp.render(markdown);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">
  <style>${css}</style>
  <script type="module" src="${mermaidScriptSrc}"></script>
</head>
<body>
<svg width="0" height="0" style="position:absolute;overflow:hidden">
  <defs>
    <filter id="hand-drawn" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="turbulence" baseFrequency="0.025" numOctaves="3" seed="8" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>
${html}
</body>
</html>`;
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

export async function renderTopicHtml(
  topicDir: string,
  template: string,
  options?: { alwaysReloadFiles?: boolean }
): Promise<string | null> {
  const mainFile = Bun.file(`${topicDir}/main.md`);
  if (!(await mainFile.exists())) return null;

  const bibPath = `${topicDir}/citation.biblatex`;
  const hasBib = await Bun.file(bibPath).exists();

  const md = createMarkdownProcessor(hasBib ? bibPath : null, options);
  let bibCache: any = null;
  if (hasBib) {
    setupCitationRenderer(md, () => bibCache);
    bibCache = await loadBibliography(bibPath);
  }

  const { markdown, date } = parseFrontmatter(await mainFile.text());
  let html = md.render(markdown);
  if (date) {
    html = html.replace(
      /(<\/h1>)/,
      `$1<div class="note-meta"><time datetime="${date}">${date}</time></div>` +
      `<div class="nb-article-orn" aria-hidden="true">❦ &nbsp; ❦ &nbsp; ❦</div>`
    );
  }
  html = `<a class="nb-back-link" href="/">← notebook</a>\n` + html;
  html = injectToc(html);
  html = `<div class="article-content">${html}</div>`;

  return applyPageMeta(
    template.replace("{{content}}", () => html),
    extractTitle(markdown),
    extractDescription(markdown)
  );
}

export function applyAssetPaths(template: string, prefix: string): string {
  return template
    .replace(/href="\/theme\.css"/g, `href="${prefix}/theme.css"`)
    .replace(/href="\/styles\.css"/g, `href="${prefix}/styles.css"`)
    .replace(/src="\/client\.js"/g, `src="${prefix}/client.js"`)
    .replace(/src="\/mermaid-init\.js"/g, `src="${prefix}/mermaid-init.js"`);
}
