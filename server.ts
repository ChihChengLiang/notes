import MarkdownIt from "markdown-it";
// @ts-ignore
import markdownItBiblatex from "@arothuis/markdown-it-biblatex";
// @ts-ignore
import markdownItMermaid from "markdown-it-mermaid";
import { watch } from "fs";
// @ts-ignore
import { BibLatexParser } from "biblatex-csl-converter";

const md = new MarkdownIt();

// Configure the biblatex plugin with alwaysReloadFiles for watch mode
md.use(markdownItBiblatex, {
  bibPath: "./src/citation.biblatex",
  alwaysReloadFiles: true, // Reload bib file on every render
});

// Configure the mermaid plugin for diagram rendering
md.use(markdownItMermaid);

// Parse the biblatex file to create a lookup for tooltips
async function loadBibliography() {
  const bibContent = await Bun.file("./src/citation.biblatex").text();
  const parser = new BibLatexParser(bibContent, { processUnexpected: true, processUnknown: true });
  return parser.parse().entries;
}

let bibCache: any = null;

// Store the original renderer
const originalCitationRenderer = md.renderer.rules.biblatex_reference;

// Custom renderer for citations to add tooltips
md.renderer.rules.biblatex_reference = function (tokens, idx, options, env, slf) {
  // Get the original rendered HTML
  const originalHtml = originalCitationRenderer
    ? originalCitationRenderer(tokens, idx, options, env, slf)
    : slf.renderToken(tokens, idx, options);

  // Extract citation info for tooltip
  const token = tokens[idx];
  const citation = token.meta?.citation;

  if (!citation || !bibCache) {
    return originalHtml;
  }

  const items = citation.citationItems || [];
  let tooltip = "";

  if (items.length > 0) {
    const item = items[0];
    const label = item.label; // The original citation key

    // Find the bib entry by the label
    const bibEntry = Object.values(bibCache).find((entry: any) =>
      entry.entry_key === label
    ) as any;

    if (bibEntry?.fields) {
      // Extract title - concatenate all text parts
      const title = bibEntry.fields.title
        ?.map((part: any) => part.text || "")
        .join(" ") || "";

      // Extract abstract - concatenate all text parts
      const abstract = bibEntry.fields.abstract
        ?.map((part: any) => part.text || "")
        .join(" ") || "";

      const year = bibEntry.fields.date || bibEntry.fields.year || "";

      const authors = bibEntry.fields.author?.map((a: any) => {
        const parts = [];
        if (a.given?.[0]?.text) parts.push(a.given[0].text);
        if (a.family?.[0]?.text) parts.push(a.family[0].text);
        return parts.join(" ");
      }).join(", ") || "";

      const parts = [];
      if (authors) parts.push(authors);
      if (year) parts.push(`(${year})`);
      if (title) parts.push(`\n${title}`);
      if (abstract) parts.push(`\n\n${abstract}`);

      tooltip = parts.join(" ");
    }
  }

  // Add title attribute to the existing HTML
  if (tooltip) {
    return originalHtml.replace(
      /<span([^>]*)>/,
      `<span$1 title="${tooltip.replace(/"/g, "&quot;")}">`
    );
  }

  return originalHtml;
};

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
