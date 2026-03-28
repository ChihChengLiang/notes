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

// Citation tooltip handler
document.addEventListener('DOMContentLoaded', () => {
  // Find all citation elements
  const citations = document.querySelectorAll('[data-citation-author]');

  citations.forEach(citation => {
    const author = citation.dataset.citationAuthor;
    const year = citation.dataset.citationYear;
    const title = citation.dataset.citationTitle;
    const doi = citation.dataset.citationDoi;

    // Skip if no data
    if (!author && !year && !title) return;

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'citation-tooltip';

    // Build tooltip content
    let content = '';
    if (author) content += author;
    if (year) content += ` ${year}`;
    if (title) content += `: ${title}`;

    const contentSpan = document.createElement('span');
    contentSpan.className = 'citation-tooltip-content';
    contentSpan.textContent = content;
    tooltip.appendChild(contentSpan);

    // Add DOI link if available
    if (doi) {
      const doiLink = document.createElement('a');
      doiLink.className = 'citation-tooltip-doi';
      doiLink.href = `https://doi.org/${doi}`;
      doiLink.target = '_blank';
      doiLink.rel = 'noopener noreferrer';
      doiLink.textContent = ' DOI →';
      tooltip.appendChild(doiLink);
    }

    // Append tooltip to citation
    citation.appendChild(tooltip);
  });
});
