import { watch, readdirSync } from "fs";
import Marp from "@marp-team/marp-core";
import { createMarkdownProcessor, loadBibliography, setupCitationRenderer } from "./markdown-processor";

// Track connected clients for SSE
const clients = new Set<ReadableStreamDefaultController>();

// Watch for file changes in notes directory
watch("./notes", { recursive: true }, (_event, filename) => {
  if (filename?.endsWith(".md") || filename?.endsWith(".biblatex")) {
    console.log(`File changed: ${filename}, notifying clients...`);
    for (const client of clients) {
      try {
        client.enqueue(`data: reload\n\n`);
      } catch (e) {
        clients.delete(client);
      }
    }
  }
});

// Watch for template changes (includes theme.css)
watch("./templates", { recursive: false }, (_event, filename) => {
  if (filename?.endsWith(".css") || filename?.endsWith(".js") || filename?.endsWith(".html")) {
    console.log(`Template file changed: ${filename}, notifying clients...`);
    for (const client of clients) {
      try {
        client.enqueue(`data: reload\n\n`);
      } catch (e) {
        clients.delete(client);
      }
    }
  }
});

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

async function renderSlides(markdown: string): Promise<string> {
  const themeCSS = await Bun.file("./templates/marp-theme.css").text();
  const marp = new Marp({ html: true });
  marp.themeSet.add(themeCSS);
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

const staticFiles: Record<string, string> = {
  "/theme.css": "./templates/theme.css",
  "/styles.css": "./templates/styles.css",
  "/client.js": "./templates/client.js",
  "/mermaid-init.js": "./templates/mermaid-init.js",
};

// Start the server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Static files
    if (staticFiles[url.pathname]) {
      const file = await Bun.file(staticFiles[url.pathname]).text();
      const contentType = url.pathname.endsWith(".css")
        ? "text/css"
        : "application/javascript";
      return new Response(file, { headers: { "Content-Type": contentType } });
    }

    // SSE endpoint for live reload
    if (url.pathname === "/events") {
      const stream = new ReadableStream({
        start(controller) {
          clients.add(controller);
          controller.enqueue(`data: connected\n\n`);
        },
        cancel(controller) {
          clients.delete(controller);
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Index: list all topics
    if (url.pathname === "/" || url.pathname === "") {
      const topics = getTopics();
      const items = await Promise.all(
        topics.map(async (topic) => {
          const title = await getTopicTitle(topic);
          const hasSlides = await Bun.file(`./notes/${topic}/slides.md`).exists();
          const slidesLink = hasSlides
            ? ` — <a href="/${topic}/slides">slides</a>`
            : "";
          return `<li><a href="/${topic}">${title}</a>${slidesLink}</li>`;
        })
      );
      const template = await Bun.file("./templates/article.html").text();
      const body = `<h1>Research Topics</h1><ul>${items.join("\n")}</ul>`;
      const html = template.replace("{{content}}", () => body);
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    const parts = url.pathname.replace(/^\//, "").split("/");
    const topic = parts[0];
    const sub = parts[1];

    // Slides route: /:topic/slides
    if (sub === "slides") {
      const slidesPath = `./notes/${topic}/slides.md`;
      const file = Bun.file(slidesPath);
      if (!(await file.exists())) {
        return new Response("Not found", { status: 404 });
      }
      const markdown = await file.text();
      return new Response(await renderSlides(markdown), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Topic draft route: /:topic
    if (sub === undefined) {
      const mainPath = `./notes/${topic}/main.md`;
      const bibPath = `./notes/${topic}/citation.biblatex`;
      const mainFile = Bun.file(mainPath);
      if (!(await mainFile.exists())) {
        return new Response("Not found", { status: 404 });
      }

      // Create a fresh processor per request (watch mode — always reload)
      const md = createMarkdownProcessor(bibPath, { alwaysReloadFiles: true });
      let bibCache: any = null;

      const hasBib = await Bun.file(bibPath).exists();
      if (hasBib) {
        setupCitationRenderer(md, () => bibCache);
        bibCache = await loadBibliography(bibPath);
      }

      const markdownContent = await mainFile.text();
      const htmlContent = md.render(markdownContent);
      const template = await Bun.file("./templates/article.html").text();
      const fullHtml = template.replace("{{content}}", () => htmlContent);
      return new Response(fullHtml, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port} (auto-reload enabled)`);
