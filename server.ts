import MarkdownIt from "markdown-it";
// @ts-ignore
import markdownItBiblatex from "@arothuis/markdown-it-biblatex";
import { watch } from "fs";

const md = new MarkdownIt();

// Configure the biblatex plugin with alwaysReloadFiles for watch mode
md.use(markdownItBiblatex, {
  bibPath: "./src/citation.biblatex",
  alwaysReloadFiles: true, // Reload bib file on every render
});

// Track connected clients for SSE
const clients = new Set<ReadableStreamDefaultController>();

// Watch for file changes
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

// Start the server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

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

    // Parse markdown to HTML
    const htmlContent = md.render(markdownContent);

    // Create the full HTML page
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Formal Verification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 {
      border-bottom: 2px solid #eee;
      padding-bottom: 0.5rem;
    }
    .citation {
      background: #f5f5f5;
      padding: 1rem;
      margin: 1rem 0;
      border-left: 3px solid #007bff;
    }
    .bibliography {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #eee;
    }
    .bibliography h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  </style>
  <script>
    // Auto-reload on file changes
    const eventSource = new EventSource('/events');
    eventSource.onmessage = (event) => {
      if (event.data === 'reload') {
        location.reload();
      }
    };
    eventSource.onerror = () => {
      console.log('SSE connection lost, attempting to reconnect...');
    };
  </script>
</head>
<body>
  ${htmlContent}
</body>
</html>
`;

    return new Response(fullHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Server running at http://localhost:${server.port} (auto-reload enabled)`);
