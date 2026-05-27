// Import and initialize Mermaid with KaTeX support and custom theme
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// Convert any CSS color (including oklch) to an rgb() string mermaid/khroma can parse.
// Uses a 1×1 canvas pixel read so the browser does the color-space conversion.
function toRgb(cssColor) {
  if (!cssColor) return cssColor;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r},${g},${b})`;
}

// Get computed custom colors — Marp scopes :root vars to section, so fall back to section element
const rootStyles = getComputedStyle(document.documentElement);
const styleSource = rootStyles.getPropertyValue('--custom-1').trim()
  ? document.documentElement
  : (document.querySelector('section') ?? document.documentElement);
const styles = getComputedStyle(styleSource);
const custom1 = toRgb(styles.getPropertyValue('--custom-1').trim());
const custom2 = toRgb(styles.getPropertyValue('--custom-2').trim());
const custom3 = toRgb(styles.getPropertyValue('--custom-3').trim());
const custom6 = toRgb(styles.getPropertyValue('--custom-6').trim());
const custom9 = toRgb(styles.getPropertyValue('--custom-9').trim());
const custom10 = toRgb(styles.getPropertyValue('--custom-10').trim());
const custom11 = toRgb(styles.getPropertyValue('--custom-11').trim());
const custom12 = toRgb(styles.getPropertyValue('--custom-12').trim());

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: custom2,
    primaryTextColor: custom12,
    primaryBorderColor: custom9,
    lineColor: custom9,
    secondaryColor: custom3,
    tertiaryColor: custom1,
    background: custom1,
    mainBkg: custom2,
    secondBkg: custom3,
    labelBackground: custom2,
    labelColor: custom12,
    edgeLabelBackground: custom2,
    clusterBkg: custom2,
    clusterBorder: custom6,
    defaultLinkColor: custom9,
    titleColor: custom12,
    actorBorder: custom9,
    actorBkg: custom2,
    actorTextColor: custom12,
    actorLineColor: custom9,
    signalColor: custom12,
    signalTextColor: custom12,
    labelBoxBkgColor: custom2,
    labelBoxBorderColor: custom6,
    labelTextColor: custom12,
    loopTextColor: custom12,
    noteBorderColor: custom6,
    noteBkgColor: custom2,
    noteTextColor: custom11,
    activationBorderColor: custom9,
    activationBkgColor: custom3,
    sequenceNumberColor: custom1,
  }
});
