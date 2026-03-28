import { watch } from "fs";
import { createMarkdownProcessor, loadBibliography, setupCitationRenderer } from "./markdown-processor";

// Create markdown processor with auto-reload for watch mode
const md = createMarkdownProcessor({ alwaysReloadFiles: true });

let bibCache: any = null;

// Setup citation renderer with tooltips (pass function to get current bibCache)
setupCitationRenderer(md, () => bibCache);

// Track connected clients for SSE
const clients = new Set<ReadableStreamDefaultController>();

// Watch for file changes in src directory
watch("./src", { recursive: true }, (_event, filename) => {
  if (filename?.endsWith(".md") || filename?.endsWith(".biblatex")) {
    console.log(`File changed: ${filename}, notifying clients...`);
    // Notify all connected clients
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
    // Notify all connected clients
    for (const client of clients) {
      try {
        client.enqueue(`data: reload\n\n`);
      } catch (e) {
        clients.delete(client);
      }
    }
  }
});

// Start the server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files from templates directory
    const staticFiles: Record<string, string> = {
      "/theme.css": "./templates/theme.css",
      "/styles.css": "./templates/styles.css",
      "/client.js": "./templates/client.js",
      "/mermaid-init.js": "./templates/mermaid-init.js",
    };

    if (staticFiles[url.pathname]) {
      const file = await Bun.file(staticFiles[url.pathname]).text();
      const contentType = url.pathname.endsWith(".css")
        ? "text/css"
        : url.pathname.endsWith(".js")
        ? "application/javascript"
        : "text/plain";

      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
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

    // Read the markdown file on each request (watch mode)
    const markdownContent = await Bun.file("./src/main.md").text();

    // Load bibliography for tooltips
    bibCache = await loadBibliography();

    // Parse markdown to HTML
    const htmlContent = md.render(markdownContent);

    // Load HTML template and inject content
    const template = await Bun.file("./templates/index.html").text();
    // Use a function to avoid $$ being interpreted as special replacement pattern
    const fullHtml = template.replace("{{content}}", () => htmlContent);

    return new Response(fullHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Server running at http://localhost:${server.port} (auto-reload enabled)`);
