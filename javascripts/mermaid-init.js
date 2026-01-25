// Mermaid initialization for MkDocs Material
// This script properly initializes Mermaid diagrams

window.addEventListener('load', function () {
  // Initialize mermaid with configuration
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Roboto, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10
      }
    });

    // Find all mermaid code blocks and render them
    document.querySelectorAll('pre > code.language-mermaid').forEach(function (codeBlock) {
      var pre = codeBlock.parentElement;
      var container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = codeBlock.textContent;
      pre.parentElement.replaceChild(container, pre);
    });

    // Also handle already marked mermaid divs
    mermaid.init(undefined, '.mermaid');
  }
});

// Re-render on theme change
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.attributeName === 'data-md-color-scheme') {
      var scheme = document.body.getAttribute('data-md-color-scheme');
      var theme = scheme === 'slate' ? 'dark' : 'default';
      
      mermaid.initialize({ theme: theme });
      
      document.querySelectorAll('.mermaid').forEach(function (el) {
        el.removeAttribute('data-processed');
        el.innerHTML = el.getAttribute('data-original') || el.textContent;
      });
      
      mermaid.init(undefined, '.mermaid');
    }
  });
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ['data-md-color-scheme']
});
