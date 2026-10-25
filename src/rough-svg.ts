import rough from "roughjs/bin/rough.js";
import type { Options } from "roughjs/bin/core";

// Hand-drawn look for Pele's SVG output, done at build time with rough.js so
// the result is plain, crisp SVG paths (no filters; survives zoom and PDF).
// Seeds are derived from the diagram so every build produces identical output.

const generator = rough.generator();

const LINE: Options = { roughness: 0.9, bowing: 1.2, disableMultiStroke: true, preserveVertices: true };
const SHAPE: Options = { roughness: 0.9, bowing: 1, disableMultiStroke: true };
// Extra stroke width (px) for edges and node outlines; arrowheads grow to match.
const THICKEN = 1;

type Drawable = ReturnType<typeof generator.path>;

function roughD(drawable: Drawable): string {
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

// Rough drawable for a shape element, or null for shapes we don't handle.
function shapeDrawable(el: HTMLRewriterTypes.Element, opts: Options): Drawable | null {
  switch (el.tagName) {
    case "rect": {
      // Pele rounds corners via `rx` or the `rx:var(--_r)` style (--pele-radius, 4px).
      const style = el.getAttribute("style") ?? "";
      const r = el.hasAttribute("rx") ? num(el.getAttribute("rx")) : /\brx:/.test(style) ? 4 : 0;
      const d = roundedRectPath(num(el.getAttribute("x")), num(el.getAttribute("y")),
        num(el.getAttribute("width")), num(el.getAttribute("height")), r);
      return generator.path(d, opts);
    }
    case "circle":
      return generator.circle(num(el.getAttribute("cx")), num(el.getAttribute("cy")), 2 * num(el.getAttribute("r")), opts);
    case "ellipse":
      return generator.ellipse(num(el.getAttribute("cx")), num(el.getAttribute("cy")),
        2 * num(el.getAttribute("rx")), 2 * num(el.getAttribute("ry")), opts);
    case "polygon": {
      const pts = (el.getAttribute("points") ?? "").trim().split(/[\s,]+/).map(Number);
      const points: [number, number][] = [];
      for (let i = 0; i + 1 < pts.length; i += 2) points.push([pts[i], pts[i + 1]]);
      return points.length >= 3 ? generator.polygon(points, opts) : null;
    }
    case "path": {
      const d = el.getAttribute("d");
      return d ? generator.path(d, opts) : null;
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
  // (dashes, animation hooks). Arrowheads (.pele-marker) keep their shape but
  // get a stroke so they grow with the thicker line.
  const line = (thicken: number) => ({
    element(el: HTMLRewriterTypes.Element) {
      if (el.getAttribute("class")?.includes("pele-marker")) {
        if (thicken) {
          el.setAttribute("stroke", el.getAttribute("fill") ?? "var(--_l)");
          el.setAttribute("stroke-width", String(thicken));
          el.setAttribute("stroke-linejoin", "round");
        }
        return;
      }
      const d = el.getAttribute("d");
      if (!d) return;
      el.setAttribute("d", roughD(generator.path(d, { ...LINE, seed: nextSeed() })));
      if (thicken) el.setAttribute("stroke-width", String(num(el.getAttribute("stroke-width"), 1) + thicken));
    },
  });

  // Shapes: keep the original element as a crisp fill with its stroke hidden,
  // and draw a rough outline on top that inherits its stroke styling
  // (classDef colors, dashes and animations, via .pele-rough).
  const shape = (thicken: number) => ({
    element(el: HTMLRewriterTypes.Element) {
      const drawable = shapeDrawable(el, { ...SHAPE, seed: nextSeed() });
      if (!drawable) return;
      const style = el.getAttribute("style") ?? "";
      const attrs = [...el.attributes]
        .filter(([name]) => !GEOMETRY.has(name) && name !== "style" && name !== "stroke-width")
        .map(([name, value]) => ` ${name}="${escapeAttr(value)}"`)
        .join("");
      const strokeWidth = num(el.getAttribute("stroke-width"), 1) + thicken;
      el.setAttribute("style", `${style};stroke:none`);
      el.after(
        `<path class="pele-rough" d="${roughD(drawable)}" fill="none" stroke-width="${strokeWidth}"${attrs}`
          + ` style="${escapeAttr(`${style};fill:none`)}"/>`,
        { html: true },
      );
    },
  });

  return new HTMLRewriter()
    .on(".pele-edge > path", line(THICKEN))
    .on(".pele-lifelines > path", line(0))
    .on(".pele-frame > path", line(0))
    .on(".pele-node > rect, .pele-node > circle, .pele-node > ellipse, .pele-node > polygon, .pele-node > path:first-child", shape(THICKEN))
    .on(".pele-cluster > rect, .pele-frame > rect", shape(0))
    .transform(svg);
}
