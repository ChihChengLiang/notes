import { mkdir, rm } from "fs/promises";
import { existsSync } from "fs";
import { createMarkdownProcessor, loadBibliography, setupCitationRenderer } from "./markdown-processor";

// Create markdown processor for build
const md = createMarkdownProcessor();

let bibCache: any = null;

// Setup citation renderer with tooltips (pass function to get current bibCache)
setupCitationRenderer(md, () => bibCache);

async function build() {
  console.log("Building static site...");

  // Clean and create dist directory
  const distDir = "./dist";
  if (existsSync(distDir)) {
    await rm(distDir, { recursive: true });
  }
  await mkdir(distDir);

  // Read the markdown file
  const markdownContent = await Bun.file("./src/main.md").text();

  // Load bibliography for tooltips
  bibCache = await loadBibliography();

  // Parse markdown to HTML
  const htmlContent = md.render(markdownContent);

  // Load HTML template and inject content (adjusted for GitHub Pages)
  const template = await Bun.file("./templates/index.html").text();

  // Adjust paths for GitHub Pages (relative paths)
  const adjustedTemplate = template
    .replace(/href="\/theme\.css"/g, 'href="./theme.css"')
    .replace(/href="\/styles\.css"/g, 'href="./styles.css"')
    .replace(/src="\/client\.js"/g, 'src="./client.js"')
    .replace(/src="\/mermaid-init\.js"/g, 'src="./mermaid-init.js"');

  const fullHtml = adjustedTemplate.replace("{{content}}", () => htmlContent);

  // Write index.html
  await Bun.write(`${distDir}/index.html`, fullHtml);
  console.log("✓ Generated index.html");

  // Copy static assets
  const staticFiles = [
    "theme.css",
    "styles.css",
    "client.js",
    "mermaid-init.js",
  ];

  for (const file of staticFiles) {
    const content = await Bun.file(`./templates/${file}`).text();
    await Bun.write(`${distDir}/${file}`, content);
    console.log(`✓ Copied ${file}`);
  }

  console.log("\nBuild complete! Output in ./dist");
}

build().catch(console.error);
