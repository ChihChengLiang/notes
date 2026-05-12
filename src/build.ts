import { mkdir, rm } from "fs/promises";
import { existsSync } from "fs";
import { createMarkdownProcessor, loadBibliography, setupCitationRenderer, parseFrontmatter, injectToc } from "./markdown-processor";
import { getTopics, renderIndexHtml, renderSlides, applyAssetPaths, STATIC_FILES, extractTitle, extractDescription, applyPageMeta } from "./site";

async function build() {
  console.log("Building static site...");

  const distDir = "./dist";
  if (existsSync(distDir)) {
    await rm(distDir, { recursive: true });
  }
  await mkdir(distDir);

  // Copy static assets
  for (const file of STATIC_FILES) {
    const content = await Bun.file(`./src/templates/${file}`).text();
    await Bun.write(`${distDir}/${file}`, content);
    console.log(`✓ Copied ${file}`);
  }

  // Copy binary assets
  await mkdir(`${distDir}/assets`);
  await Bun.write(`${distDir}/assets/bedge-grunge.png`, Bun.file("./src/assets/bedge-grunge.png"));
  console.log("✓ Copied assets/bedge-grunge.png");

  // Load article template and create per-depth variants
  const articleTemplate = await Bun.file("./src/templates/article.html").text();
  const topicTemplate = applyAssetPaths(articleTemplate, "..");
  const indexTemplate = applyAssetPaths(articleTemplate, ".");

  const topics = getTopics();

  // Build index page
  const indexHtml = applyPageMeta(
    await renderIndexHtml(indexTemplate, "static"),
    "CC's Research Note",
    "Research notes and essays by CC."
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
      const bibExists = existsSync(bibPath);
      const md = createMarkdownProcessor(bibExists ? bibPath : null);
      let bibCache: any = null;

      if (bibExists) {
        setupCitationRenderer(md, () => bibCache);
        bibCache = await loadBibliography(bibPath);
      }

      const raw = await Bun.file(mainPath).text();
      const { markdown: markdownContent, date } = parseFrontmatter(raw);
      let htmlContent = md.render(markdownContent);
      if (date) {
        htmlContent = htmlContent.replace(
          /(<\/h1>)/,
          `$1<div class="note-meta"><time datetime="${date}">${date}</time></div>`
        );
      }
      htmlContent = injectToc(htmlContent);
      const title = extractTitle(markdownContent);
      const description = extractDescription(markdownContent);
      const fullHtml = applyPageMeta(topicTemplate.replace("{{content}}", () => htmlContent), title, description);
      await Bun.write(`${topicDir}/index.html`, fullHtml);
      console.log(`✓ Generated ${topic}/index.html`);
    }

    // Render slides
    if (existsSync(slidesPath)) {
      const markdown = await Bun.file(slidesPath).text();
      const slidesHtml = await renderSlides(markdown, "../mermaid-init.js");
      await Bun.write(`${topicDir}/slides.html`, slidesHtml);
      console.log(`✓ Generated ${topic}/slides.html`);
    }
  }

  console.log("\nBuild complete! Output in ./dist");
}

build().catch(console.error);
