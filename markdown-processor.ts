import MarkdownIt from "markdown-it";
// @ts-ignore
import markdownItBiblatex from "@arothuis/markdown-it-biblatex";
// @ts-ignore
import markdownItMermaid from "markdown-it-mermaid";
// @ts-ignore
import { BibLatexParser } from "biblatex-csl-converter";
import hljs from "highlight.js";

// Simple HTML escape function
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function createMarkdownProcessor(options?: { alwaysReloadFiles?: boolean }) {
  const md = new MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' +
                 hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                 '</code></pre>';
        } catch (__) {}
      }

      return '<pre class="hljs"><code>' + escapeHtml(str) + '</code></pre>';
    }
  });

  // Configure the biblatex plugin
  md.use(markdownItBiblatex, {
    bibPath: "./src/citation.biblatex",
    alwaysReloadFiles: options?.alwaysReloadFiles ?? false,
  });

  // Configure the mermaid plugin for diagram rendering
  md.use(markdownItMermaid);

  return md;
}

export async function loadBibliography() {
  const bibContent = await Bun.file("./src/citation.biblatex").text();
  const parser = new BibLatexParser(bibContent, { processUnexpected: true, processUnknown: true });
  return parser.parse().entries;
}

export function setupCitationRenderer(md: MarkdownIt, getBibCache: () => any) {
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

    const bibCache = getBibCache();
    if (!citation || !bibCache) {
      return originalHtml;
    }

    const items = citation.citationItems || [];

    if (items.length > 0) {
      const item = items[0];
      const label = item.label; // The original citation key

      // Find the bib entry by the label
      const bibEntry = Object.values(bibCache).find((entry: any) =>
        entry.entry_key === label
      ) as any;

      if (bibEntry?.fields) {
        // Extract first author's family name
        const firstAuthor = bibEntry.fields.author?.[0];
        const authorName = firstAuthor?.family?.[0]?.text || firstAuthor?.literal?.[0]?.text || "Unknown";

        // Add "et al." if there are multiple authors
        const hasMultipleAuthors = bibEntry.fields.author?.length > 1;
        const authorText = hasMultipleAuthors ? `${authorName} et al.` : authorName;

        // Extract year
        const year = bibEntry.fields.date || bibEntry.fields.year || "";

        // Extract title - concatenate all text parts and truncate if too long
        const fullTitle = bibEntry.fields.title
          ?.map((part: any) => part.text || "")
          .join(" ") || "";
        const maxTitleLength = 60;
        const title = fullTitle.length > maxTitleLength
          ? fullTitle.substring(0, maxTitleLength) + "..."
          : fullTitle;

        // Extract DOI
        const doi = bibEntry.fields.doi || "";

        // Build data attributes for the custom tooltip
        const tooltipData = {
          author: authorText,
          year: year,
          title: title,
          doi: doi
        };

        // Add data attributes to the existing HTML
        return originalHtml.replace(
          /<span([^>]*)>/,
          `<span$1 data-citation-author="${escapeHtml(tooltipData.author)}" data-citation-year="${escapeHtml(tooltipData.year)}" data-citation-title="${escapeHtml(tooltipData.title)}" data-citation-doi="${escapeHtml(tooltipData.doi)}">`
        );
      }
    }

    return originalHtml;
  };
}
