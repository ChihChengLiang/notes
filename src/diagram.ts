import { render, PeleError } from "pele";
import katex from "katex";

// Mermaid fences are rendered to SVG at build time with Pele (https://pele.run),
// so pages ship no diagram JS. Colors come from `--pele-*` CSS variables mapped
// onto the `--custom-*` palette in styles.css / reveal-theme.css.

const FONT_FAMILY = `"Noto Serif JP", Georgia, "Times New Roman", serif`;

// Pele sizes boxes from text widths, and without a DOM it falls back to a
// generic table that runs narrow for Noto Serif JP. These are Noto Serif JP
// advance widths for ASCII 32–126 in hundredths of an em, measured with canvas
// in Firefox. Italic is synthesized, so it shares the regular widths.
const ASCII_REGULAR = "26,31,38,57,55,92,78,20,36,36,48,58,33,35,33,35,55,55,55,55,55,55,55,55,55,55,33,33,58,58,58,43,91,72,67,69,77,65,63,74,85,41,40,73,63,98,80,77,64,77,72,57,66,80,71,105,70,69,61,34,35,34,58,56,44,56,64,54,63,55,39,57,66,33,31,61,33,97,66,60,64,61,46,47,37,65,55,84,56,55,50,37,32,37,58".split(",").map(Number);
const ASCII_BOLD = "25,36,45,62,59,97,80,24,40,40,49,60,34,37,34,40,59,59,59,59,59,59,59,59,59,59,34,34,60,60,60,47,97,75,71,70,79,67,65,76,86,43,43,77,64,100,82,79,67,79,75,60,70,82,73,109,73,70,63,37,40,37,60,59,45,59,67,57,66,57,40,60,69,35,34,65,36,101,69,62,67,64,50,50,39,68,58,87,60,58,52,38,34,38,60".split(",").map(Number);
const BOLD = 1;
const MONO = 4;

const notoSerifMeasurer = {
  width(text: string, size: number, style: number): number {
    if (style & MONO) return [...text].length * size * 0.6;
    const table = style & BOLD ? ASCII_BOLD : ASCII_REGULAR;
    let em = 0;
    for (const ch of text) {
      const code = ch.codePointAt(0)!;
      if (code >= 32 && code < 127) em += table[code - 32] / 100;
      else if (code >= 0x2e80) em += 1; // CJK, fullwidth punctuation, emoji
      else em += 0.6; // Greek, math symbols, arrows, …
    }
    return em * size;
  },
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Pele hands `$$…$$` label contents to this resolver and places the returned
// HTML in a foreignObject of the size we report. There's no DOM at build time
// to measure KaTeX output, so estimate the width from its visible glyphs:
// ~0.55em each, 0.7× inside sub/superscripts (`mtight`), plus KaTeX's spacing
// around relations and binary operators, all at KaTeX's 1.21× font scale.
// Calibrated against measured widths in notes/fv_privacy. The content is
// centered with overflow visible, so a small misestimate only shifts spacing,
// never clips.
function estimateMathWidth(html: string, size: number): number {
  const tight: boolean[] = [];
  let em = 0;
  for (const m of html.matchAll(/<(\/?)span([^>]*)>|([^<]+)/g)) {
    if (m[3] !== undefined) {
      const glyphs = [...m[3].replace(/&[a-z#0-9]+;/gi, "x").replace(/​/g, "")].length;
      em += glyphs * 0.55 * (tight.includes(true) ? 0.7 : 1);
    } else if (m[1]) {
      tight.pop();
    } else {
      const cls = m[2].match(/class="([^"]*)"/)?.[1] ?? "";
      tight.push(/\bmtight\b/.test(cls));
      if (/\bmrel\b/.test(cls)) em += 0.56;
      if (/\bmbin\b/.test(cls)) em += 0.44;
    }
  }
  return em * 1.21 * size;
}

function renderMath(tex: string, size: number) {
  const html = katex.renderToString(tex, { output: "html", throwOnError: false });
  const width = Math.ceil(Math.max(size, estimateMathWidth(html, size)));
  const height = Math.ceil(size * 1.6);
  return {
    html: `<div class="diagram-math" style="font-size:${size}px">${html}</div>`,
    width,
    height,
  };
}

// Mermaid styles that Pele parses but doesn't draw: `e1@{ animate: true }` edges
// and `animation:` inside a classDef. Re-apply them with a style block scoped to
// this one diagram.
function extraStyles(source: string, scope: string): string {
  const rules: string[] = [];
  for (const m of source.matchAll(/^\s*(\w+)@\{[^}]*\banimate:\s*true\b[^}]*\}/gm)) {
    rules.push(`#${scope} .pele-edge[data-id="${m[1]}"] > path:first-child { stroke-dasharray: 9 5; animation: diagram-dash 0.6s linear infinite; }`);
  }
  for (const m of source.matchAll(/^\s*classDef\s+(\w+)\s+.*?\banimation:([^,\n]+)/gm)) {
    rules.push(`#${scope} .pele-node.${m[1]} > :first-child { animation: ${m[2].trim()}; }`);
  }
  return rules.length ? `<style>${rules.join("\n")}</style>` : "";
}

// Flowchart node names in source declaration order — used by the slides'
// `%% fragment` reveal so nodes appear in the order they're written, not the
// order Pele happens to emit them.
function declarationOrder(source: string): string[] {
  const order: string[] = [];
  for (const m of source.matchAll(/^\s*(\w+)\s*(?:\(\(|\[|\(|\{)/gm)) {
    if (!order.includes(m[1])) order.push(m[1]);
  }
  return order;
}

export function renderDiagram(source: string): string {
  const scope = `diagram-${Bun.hash(source).toString(36)}`;
  try {
    const { svg } = render(source, {
      idPrefix: `${scope}-`,
      fontFamily: FONT_FAMILY,
      measurer: notoSerifMeasurer,
      math: renderMath,
    });
    const fragment = /%%\s*fragment\b/.test(source);
    const attrs = fragment
      ? ` class="diagram js-fragment-reveal" data-fragment-order="${escapeHtml(declarationOrder(source).join(","))}"`
      : ` class="diagram"`;
    return `<div id="${scope}"${attrs}>${extraStyles(source, scope)}${svg}</div>`;
  } catch (error) {
    if (!(error instanceof PeleError)) throw error;
    const where = error.line ? ` (line ${error.line})` : "";
    const snippet = error.snippet ? `\n\n${error.snippet}` : "";
    console.warn(`Diagram error${where}: ${error.message}`);
    return `<pre class="diagram-error">${escapeHtml(`Diagram error${where}: ${error.message}${snippet}`)}</pre>`;
  }
}
