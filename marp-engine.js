import { Marp } from '@marp-team/marp-core';

const MERMAID_SCRIPT = `<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const rootStyles = getComputedStyle(document.documentElement);
const styleSource = rootStyles.getPropertyValue('--custom-a1').trim()
  ? document.documentElement
  : (document.querySelector('section') ?? document.documentElement);
const styles = getComputedStyle(styleSource);
const c = (v) => styles.getPropertyValue(v).trim();

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: c('--custom-a2'),
    primaryTextColor: c('--custom-a12'),
    primaryBorderColor: c('--custom-a9'),
    lineColor: c('--custom-a9'),
    secondaryColor: c('--custom-a3'),
    tertiaryColor: c('--custom-a1'),
    background: c('--custom-a1'),
    mainBkg: c('--custom-a2'),
    secondBkg: c('--custom-a3'),
    labelBackground: c('--custom-a2'),
    labelColor: c('--custom-a12'),
    edgeLabelBackground: c('--custom-a2'),
    clusterBkg: c('--custom-a2'),
    clusterBorder: c('--custom-a6'),
    defaultLinkColor: c('--custom-a9'),
    titleColor: c('--custom-a12'),
    actorBorder: c('--custom-a9'),
    actorBkg: c('--custom-a2'),
    actorTextColor: c('--custom-a12'),
    actorLineColor: c('--custom-a9'),
    signalColor: c('--custom-a12'),
    signalTextColor: c('--custom-a12'),
    labelBoxBkgColor: c('--custom-a2'),
    labelBoxBorderColor: c('--custom-a6'),
    labelTextColor: c('--custom-a12'),
    loopTextColor: c('--custom-a12'),
    noteBorderColor: c('--custom-a6'),
    noteBkgColor: c('--custom-a2'),
    noteTextColor: c('--custom-a11'),
    activationBorderColor: c('--custom-a9'),
    activationBkgColor: c('--custom-a3'),
    sequenceNumberColor: c('--custom-a1'),
  }
});
mermaid.run({ querySelector: 'pre.mermaid' });
</script>`;

export default class extends Marp {
  constructor(opts) {
    super(opts);
    const md = this.markdown;
    const original = md.renderer.rules.fence?.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
      const token = tokens[idx];
      if (token.info.trim() === 'mermaid') {
        const escaped = token.content.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return `<pre class="mermaid">${escaped}</pre>`;
      }
      return original ? original(tokens, idx, options, env, slf) : slf.renderToken(tokens, idx, options);
    };
  }

  render(markdown, options) {
    const result = super.render(markdown, options);
    result.html += MERMAID_SCRIPT;
    return result;
  }
}
