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

// Copy button for code blocks
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre.hljs').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'copy';
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.textContent : pre.textContent).then(() => {
        btn.textContent = 'copied!';
        setTimeout(() => { btn.textContent = 'copy'; }, 1500);
      });
    });
    pre.appendChild(btn);
  });
});

// Citation tooltip handler
document.addEventListener('DOMContentLoaded', () => {
  // Find all citation elements
  const citations = document.querySelectorAll('[data-citation-author]');

  citations.forEach(citation => {
    const author = citation.dataset.citationAuthor;
    const year = citation.dataset.citationYear;
    const title = citation.dataset.citationTitle;

    // Skip if no data
    if (!author && !year && !title) return;

    // Create tooltip element (informational only — the pill itself is the link)
    const tooltip = document.createElement('div');
    tooltip.className = 'note-popover citation-tooltip';

    // Build tooltip content
    let content = '';
    if (author) content += author;
    if (year) content += ` ${year}`;
    if (title) content += `: ${title}`;

    const contentSpan = document.createElement('span');
    contentSpan.className = 'citation-tooltip-content';
    contentSpan.textContent = content;
    tooltip.appendChild(contentSpan);

    // Append tooltip to citation
    citation.appendChild(tooltip);
  });
});

// Footnote sidenote popover: show a footnote's content near its marker on
// hover/click instead of forcing a jump to the bottom-of-page list. The
// bottom list stays in the DOM untouched as a fallback (no-JS, print/PDF,
// screen readers).
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[data-footnote-ref]').forEach(ref => {
    const sup = ref.closest('sup');
    if (!sup) return;
    const targetId = ref.getAttribute('href')?.slice(1);
    const item = targetId ? document.getElementById(targetId) : null;
    if (!item) return;

    const wrap = document.createElement('span');
    wrap.className = 'footnote-wrap';
    sup.parentNode.insertBefore(wrap, sup);
    wrap.appendChild(sup);

    const popover = document.createElement('div');
    popover.className = 'note-popover footnote-popover';
    popover.innerHTML = item.innerHTML;
    popover.querySelectorAll('[data-footnote-backref]').forEach(el => el.remove());
    wrap.appendChild(popover);
  });
});
