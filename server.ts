import { watch } from "fs";
import { createMarkdownProcessor, loadBibliography, setupCitationRenderer, parseFrontmatter } from "./markdown-processor";
import { getTopics, getTopicTitle, getTopicDate, renderSlides, STATIC_FILES } from "./site";

// Track connected clients for SSE
const clients = new Set<ReadableStreamDefaultController>();

function notifyClients() {
  for (const client of clients) {
    try {
      client.enqueue(`data: reload\n\n`);
    } catch (e) {
      clients.delete(client);
    }
  }
}

// Watch for file changes in notes directory
watch("./notes", { recursive: true }, (_event, filename) => {
  if (filename?.endsWith(".md") || filename?.endsWith(".biblatex")) {
    console.log(`File changed: ${filename}, notifying clients...`);
    notifyClients();
  }
});

// Watch for template changes (includes theme.css)
watch("./templates", { recursive: false }, (_event, filename) => {
  if (filename?.endsWith(".css") || filename?.endsWith(".js") || filename?.endsWith(".html")) {
    console.log(`Template file changed: ${filename}, notifying clients...`);
    notifyClients();
  }
});

const staticFileMap: Record<string, string> = {
  ...Object.fromEntries(STATIC_FILES.map((f) => [`/${f}`, `./templates/${f}`])),
  "/assets/bedge-grunge.png": "./assets/bedge-grunge.png",
};

// Start the server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Static files
    if (staticFileMap[url.pathname]) {
      const filePath = staticFileMap[url.pathname];
      if (url.pathname.endsWith(".png")) {
        const file = Bun.file(filePath);
        return new Response(file, { headers: { "Content-Type": "image/png" } });
      }
      const file = await Bun.file(filePath).text();
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
          const [title, date] = await Promise.all([getTopicTitle(topic), getTopicDate(topic)]);
          const hasSlides = await Bun.file(`./notes/${topic}/slides.md`).exists();
          const slidesLink = hasSlides
            ? ` — <a href="/${topic}/slides">slides</a>`
            : "";
          const dateHtml = date ? ` <time class="note-date" datetime="${date}">${date}</time>` : "";
          return `<li><a href="/${topic}">${title}</a>${slidesLink}${dateHtml}</li>`;
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
      return new Response(await renderSlides(markdown, "/mermaid-init.js"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Topic draft route: /:topic or /:topic/
    if (sub === undefined || sub === "") {
      const mainPath = `./notes/${topic}/main.md`;
      const bibPath = `./notes/${topic}/citation.biblatex`;
      const mainFile = Bun.file(mainPath);
      if (!(await mainFile.exists())) {
        return new Response("Not found", { status: 404 });
      }

      const hasBib = await Bun.file(bibPath).exists();

      // Create a fresh processor per request (watch mode — always reload)
      const md = createMarkdownProcessor(hasBib ? bibPath : null, { alwaysReloadFiles: true });
      let bibCache: any = null;

      if (hasBib) {
        setupCitationRenderer(md, () => bibCache);
        bibCache = await loadBibliography(bibPath);
      }

      const raw = await mainFile.text();
      const { markdown: markdownContent, date } = parseFrontmatter(raw);
      let htmlContent = md.render(markdownContent);
      if (date) {
        htmlContent = htmlContent.replace(
          /(<\/h1>)/,
          `$1<div class="note-meta"><time datetime="${date}">${date}</time></div>`
        );
      }
      const template = await Bun.file("./templates/article.html").text();
      const fullHtml = template.replace("{{content}}", () => htmlContent);
      return new Response(fullHtml, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port} (auto-reload enabled)`);
