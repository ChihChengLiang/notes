import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

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

export function initMermaid({ startOnLoad = false } = {}) {
  const rootStyles = getComputedStyle(document.documentElement);
  const styleSource = rootStyles.getPropertyValue('--custom-1').trim()
    ? document.documentElement
    : (document.querySelector('section') ?? document.documentElement);
  const styles = getComputedStyle(styleSource);
  const c = (v) => toRgb(styles.getPropertyValue(v).trim());

  mermaid.initialize({
    startOnLoad,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
      primaryColor:           c('--custom-2'),
      primaryTextColor:       c('--custom-12'),
      primaryBorderColor:     c('--custom-9'),
      lineColor:              c('--custom-9'),
      secondaryColor:         c('--custom-3'),
      tertiaryColor:          c('--custom-1'),
      background:             c('--custom-1'),
      mainBkg:                c('--custom-2'),
      secondBkg:              c('--custom-3'),
      labelBackground:        c('--custom-2'),
      labelColor:             c('--custom-12'),
      edgeLabelBackground:    c('--custom-2'),
      clusterBkg:             c('--custom-2'),
      clusterBorder:          c('--custom-6'),
      defaultLinkColor:       c('--custom-9'),
      titleColor:             c('--custom-12'),
      actorBorder:            c('--custom-9'),
      actorBkg:               c('--custom-2'),
      actorTextColor:         c('--custom-12'),
      actorLineColor:         c('--custom-9'),
      signalColor:            c('--custom-12'),
      signalTextColor:        c('--custom-12'),
      labelBoxBkgColor:       c('--custom-2'),
      labelBoxBorderColor:    c('--custom-6'),
      labelTextColor:         c('--custom-12'),
      loopTextColor:          c('--custom-12'),
      noteBorderColor:        c('--custom-6'),
      noteBkgColor:           c('--custom-2'),
      noteTextColor:          c('--custom-11'),
      activationBorderColor:  c('--custom-9'),
      activationBkgColor:     c('--custom-3'),
      sequenceNumberColor:    c('--custom-1'),
    }
  });
}

export { mermaid };
