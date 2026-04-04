import { mkdir, rm } from "fs/promises";
import { readdirSync, existsSync } from "fs";
import Marp from "@marp-team/marp-core";
import { createMarkdownProcessor, loadBibliography, setupCitationRenderer } from "./markdown-processor";

async function renderSlides(markdown: string): Promise<string> {
  const marp = new Marp({ html: true });
  const { html, css } = marp.render(markdown);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
${html}
</body>
</html>`;
}

function getTopics(): string[] {
  const entries = readdirSync("./notes", { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function getTopicTitle(topic: string): Promise<string> {
  try {
    const content = await Bun.file(`./notes/${topic}/main.md`).text();
    const match = content.match(/^#\s+(.+)$/m);
    return match?.[1] ?? topic;
  } catch {
    return topic;
  }
}

async function build() {
  console.log("Building static site...");

  const distDir = "./dist";
  if (existsSync(distDir)) {
    await rm(distDir, { recursive: true });
  }
  await mkdir(distDir);

  // Copy static assets
  const staticFiles = ["theme.css", "styles.css", "client.js", "mermaid-init.js"];
  for (const file of staticFiles) {
    const content = await Bun.file(`./templates/${file}`).text();
    await Bun.write(`${distDir}/${file}`, content);
    console.log(`✓ Copied ${file}`);
  }

  // Load article template (assets at root level — will be adjusted per-topic)
  const articleTemplate = await Bun.file("./templates/article.html").text();

  // Adjust asset paths for topic pages (one level deeper: dist/<topic>/)
  const topicTemplate = articleTemplate
    .replace(/href="\/theme\.css"/g, 'href="../theme.css"')
    .replace(/href="\/styles\.css"/g, 'href="../styles.css"')
    .replace(/src="\/client\.js"/g, 'src="../client.js"')
    .replace(/src="\/mermaid-init\.js"/g, 'src="../mermaid-init.js"');

  const topics = getTopics();

  // Build index page
  const indexItems = await Promise.all(
    topics.map(async (topic) => {
      const title = await getTopicTitle(topic);
      const hasSlides = existsSync(`./notes/${topic}/slides.md`);
      const slidesLink = hasSlides
        ? ` — <a href="./${topic}/slides.html">slides</a>`
        : "";
      return `<li><a href="./${topic}/">${title}</a>${slidesLink}</li>`;
    })
  );

  const indexTemplate = articleTemplate
    .replace(/href="\/theme\.css"/g, 'href="./theme.css"')
    .replace(/href="\/styles\.css"/g, 'href="./styles.css"')
    .replace(/src="\/client\.js"/g, 'src="./client.js"')
    .replace(/src="\/mermaid-init\.js"/g, 'src="./mermaid-init.js"');

  const indexHtml = indexTemplate.replace(
    "{{content}}",
    () => `<h1>Research Topics</h1><ul>${indexItems.join("\n")}</ul>`
  );
  await Bun.write(`${distDir}/index.html`, indexHtml);
  console.log("✓ Generated index.html");

  // Build each topic
  for (const topic of topics) {
    const topicDir = `${distDir}/${topic}`;
    await mkdir(topicDir);

    const mainPath = `./notes/${topic}/main.md`;
    const bibPath = `./notes/${topic}/citation.biblatex`;
    const slidesPath = `./notes/${topic}/slides.md`;

    // Render draft
    if (existsSync(mainPath)) {
      const md = createMarkdownProcessor(bibPath);
      let bibCache: any = null;

      if (existsSync(bibPath)) {
        setupCitationRenderer(md, () => bibCache);
        bibCache = await loadBibliography(bibPath);
      }

      const markdownContent = await Bun.file(mainPath).text();
      const htmlContent = md.render(markdownContent);
      const fullHtml = topicTemplate.replace("{{content}}", () => htmlContent);
      await Bun.write(`${topicDir}/index.html`, fullHtml);
      console.log(`✓ Generated ${topic}/index.html`);
    }

    // Render slides
    if (existsSync(slidesPath)) {
      const markdown = await Bun.file(slidesPath).text();
      const slidesHtml = await renderSlides(markdown);
      await Bun.write(`${topicDir}/slides.html`, slidesHtml);
      console.log(`✓ Generated ${topic}/slides.html`);
    }
  }

  console.log("\nBuild complete! Output in ./dist");
}

build().catch(console.error);
