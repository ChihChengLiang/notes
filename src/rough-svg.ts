import rough from "roughjs/bin/rough.js";
import type { Options } from "roughjs/bin/core";

// Hand-drawn look for Pele's SVG output, done at build time with rough.js so
// the result is plain, crisp SVG paths (no filters; survives zoom and PDF).
// Seeds are derived from the diagram so every build produces identical output.

const generator = rough.generator();

const LINE: Options = { roughness: 0.9, bowing: 1.2, disableMultiStroke: true, preserveVertices: true };
const SHAPE: Options = { roughness: 0.9, bowing: 1, disableMultiStroke: true };

function roughD(drawable: ReturnType<typeof generator.path>): string {
  return generator.toPaths(drawable).map((p) => p.d).join(" ");
}

function num(value: string | null, fallback = 0): number {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : fallback;
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) return `M${x},${y}H${x + w}V${y + h}H${x}Z`;
  return `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}`
    + `A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}`
    + `V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
}

// Outline of a filled shape element, or null for shapes we don't handle.
function shapeOutline(el: HTMLRewriterTypes.Element, seed: number): string | null {
  const opts = { ...SHAPE, seed };
  switch (el.tagName) {
    case "rect": {
      // Pele rounds corners via `rx` or the `rx:var(--_r)` style (--pele-radius, 4px).
      const style = el.getAttribute("style") ?? "";
      const r = el.hasAttribute("rx") ? num(el.getAttribute("rx")) : /\brx:/.test(style) ? 4 : 0;
      const d = roundedRectPath(num(el.getAttribute("x")), num(el.getAttribute("y")),
        num(el.getAttribute("width")), num(el.getAttribute("height")), r);
      return roughD(generator.path(d, opts));
    }
    case "circle":
      return roughD(generator.circle(num(el.getAttribute("cx")), num(el.getAttribute("cy")), 2 * num(el.getAttribute("r")), opts));
    case "ellipse":
      return roughD(generator.ellipse(num(el.getAttribute("cx")), num(el.getAttribute("cy")),
        2 * num(el.getAttribute("rx")), 2 * num(el.getAttribute("ry")), opts));
    case "polygon": {
      const pts = (el.getAttribute("points") ?? "").trim().split(/[\s,]+/).map(Number);
      const points: [number, number][] = [];
      for (let i = 0; i + 1 < pts.length; i += 2) points.push([pts[i], pts[i + 1]]);
      return points.length >= 3 ? roughD(generator.polygon(points, opts)) : null;
    }
    case "path": {
      const d = el.getAttribute("d");
      return d ? roughD(generator.path(d, opts)) : null;
    }
  }
  return null;
}

const GEOMETRY = new Set(["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "points", "d", "fill", "fill-opacity", "class"]);

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function roughen(svg: string, baseSeed: number): string {
  let n = 0;
  const nextSeed = () => (baseSeed + n++ * 7919) % 2147483647 || 1;

  // Lines: replace the path data in place, keeping every other attribute
  // (dashes, thickness, animation hooks). Arrowheads (.pele-marker) stay crisp.
  const line = {
    element(el: HTMLRewriterTypes.Element) {
      if (el.getAttribute("class")?.includes("pele-marker")) return;
      const d = el.getAttribute("d");
      if (d) el.setAttribute("d", roughD(generator.path(d, { ...LINE, seed: nextSeed() })));
    },
  };

  // Shapes: keep the original element as a crisp fill with its stroke hidden,
  // and draw a rough outline on top that inherits its stroke styling
  // (including classDef colors, dashes and animations, via .pele-rough).
  const shape = {
    element(el: HTMLRewriterTypes.Element) {
      const outline = shapeOutline(el, nextSeed());
      if (!outline) return;
      const style = el.getAttribute("style") ?? "";
      const attrs = [...el.attributes]
        .filter(([name]) => !GEOMETRY.has(name) && name !== "style")
        .map(([name, value]) => ` ${name}="${escapeAttr(value)}"`)
        .join("");
      el.setAttribute("style", `${style};stroke:none`);
      el.after(
        `<path class="pele-rough" d="${outline}" fill="none"${attrs} style="${escapeAttr(`${style};fill:none`)}"/>`,
        { html: true },
      );
    },
  };

  return new HTMLRewriter()
    .on(".pele-edge > path", line)
    .on(".pele-lifelines > path", line)
    .on(".pele-frame > path", line)
    .on(".pele-node > rect, .pele-node > circle, .pele-node > ellipse, .pele-node > polygon, .pele-node > path:first-child", shape)
    .on(".pele-cluster > rect, .pele-frame > rect", shape)
    .transform(svg);
}
