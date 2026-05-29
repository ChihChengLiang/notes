import { mkdir, rm, readdir, copyFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { getTopics, renderIndexHtml, renderSlides, renderTopicHtml, applyAssetPaths, STATIC_FILES } from "./site";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".avif"]);

async function copyImages(srcDir: string, destDir: string): Promise<void> {
  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const src = join(srcDir, entry.name);
    const dest = join(destDir, entry.name);
    if (entry.isDirectory()) {
      await mkdir(dest, { recursive: true });
      await copyImages(src, dest);
    } else if (IMAGE_EXTS.has(entry.name.slice(entry.name.lastIndexOf(".")))) {
      await copyFile(src, dest);
    }
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
  const indexHtml = await renderIndexHtml(indexTemplate, "static");
  await Bun.write(`${distDir}/index.html`, indexHtml);
  console.log("✓ Generated index.html");

  // Build each topic
  for (const topic of topics) {
    const topicDir = `${distDir}/${topic}`;
    await mkdir(topicDir);

    const slidesPath = `./notes/${topic}/slides.md`;

    // Render draft
    const fullHtml = await renderTopicHtml(`./notes/${topic}`, topicTemplate);
    if (fullHtml) {
      await Bun.write(`${topicDir}/index.html`, fullHtml);
      console.log(`✓ Generated ${topic}/index.html`);
    }

    // Render slides
    if (existsSync(slidesPath)) {
      const slidesHtml = await renderSlides(slidesPath, "../");
      await Bun.write(`${topicDir}/slides.html`, slidesHtml);
      await copyImages(`./notes/${topic}`, topicDir);
      console.log(`✓ Generated ${topic}/slides.html`);
    }
  }

  console.log("\nBuild complete! Output in ./dist");
}

build().catch(console.error);
