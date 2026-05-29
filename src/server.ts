import { watch } from "fs";
import { renderIndexHtml, renderSlides, renderTopicHtml, STATIC_FILES } from "./site";

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
watch("./src/templates", { recursive: false }, (_event, filename) => {
  if (filename?.endsWith(".css") || filename?.endsWith(".js") || filename?.endsWith(".html")) {
    console.log(`Template file changed: ${filename}, notifying clients...`);
    notifyClients();
  }
});

const staticFileMap: Record<string, string> = {
  ...Object.fromEntries(STATIC_FILES.map((f) => [`/${f}`, `./src/templates/${f}`])),
  "/assets/bedge-grunge.png": "./src/assets/bedge-grunge.png",
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
      const template = await Bun.file("./src/templates/article.html").text();
      const html = await renderIndexHtml(template, "server");
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    const parts = url.pathname.replace(/^\//, "").split("/");
    const topic = parts[0];
    const sub = parts[1];

    // Slides route: /:topic/slides
    if (sub === "slides") {
      const slidesPath = `./notes/${topic}/slides.md`;
      if (!(await Bun.file(slidesPath).exists())) {
        return new Response("Not found", { status: 404 });
      }
      return new Response(await renderSlides(slidesPath), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Static assets inside note directories (images, etc.) — handles subdirs like asset/foo.png
    const subPath = parts.slice(1).join("/");
    if (subPath && /\.(png|jpe?g|gif|svg|webp)$/i.test(subPath)) {
      const assetPath = `./notes/${topic}/${subPath}`;
      const file = Bun.file(assetPath);
      if (!(await file.exists())) {
        return new Response("Not found", { status: 404 });
      }
      const ext = subPath.split(".").pop()!.toLowerCase();
      const mimeTypes: Record<string, string> = {
        png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
        gif: "image/gif", svg: "image/svg+xml", webp: "image/webp",
      };
      return new Response(file, { headers: { "Content-Type": mimeTypes[ext] ?? "application/octet-stream" } });
    }

    // Topic draft route: /:topic or /:topic/
    if (sub === undefined) {
      return Response.redirect(`${url.origin}/${topic}/`, 301);
    }
    if (sub === "") {
      const template = await Bun.file("./src/templates/article.html").text();
      // alwaysReloadFiles: re-read bib on every request so edits are picked up without restart
      const html = await renderTopicHtml(`./notes/${topic}`, template, { alwaysReloadFiles: true });
      if (!html) return new Response("Not found", { status: 404 });
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port} (auto-reload enabled)`);
