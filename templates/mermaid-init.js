// Import and initialize Mermaid with KaTeX support and custom theme
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// Get computed custom colors
const rootStyles = getComputedStyle(document.documentElement);
const custom1 = rootStyles.getPropertyValue('--custom-a1').trim();
const custom2 = rootStyles.getPropertyValue('--custom-a2').trim();
const custom3 = rootStyles.getPropertyValue('--custom-a3').trim();
const custom6 = rootStyles.getPropertyValue('--custom-a6').trim();
const custom9 = rootStyles.getPropertyValue('--custom-a9').trim();
const custom10 = rootStyles.getPropertyValue('--custom-a10').trim();
const custom11 = rootStyles.getPropertyValue('--custom-a11').trim();
const custom12 = rootStyles.getPropertyValue('--custom-a12').trim();

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
