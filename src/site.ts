import { readdirSync } from "fs";
import { Marp } from "@marp-team/marp-core";

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
      const slidesLink = hasSlides ? ` — <a href="${slidesHref}">slides</a>` : "";
      const dateHtml = date ? ` <time class="note-date" datetime="${date}">${date}</time>` : "";
      return `<li><a href="${topicHref}">${title}</a>${slidesLink}${dateHtml}</li>`;
    })
  );
  const body = `<h1>Research Topics</h1><ul>${items.toReversed().join("\n")}</ul>`;
  return template.replace("{{content}}", () => body);
}

export function applyAssetPaths(template: string, prefix: string): string {
  return template
    .replace(/href="\/theme\.css"/g, `href="${prefix}/theme.css"`)
    .replace(/href="\/styles\.css"/g, `href="${prefix}/styles.css"`)
    .replace(/src="\/client\.js"/g, `src="${prefix}/client.js"`)
    .replace(/src="\/mermaid-init\.js"/g, `src="${prefix}/mermaid-init.js"`);
}
