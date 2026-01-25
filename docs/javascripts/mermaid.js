// MkDocs Material - Official Mermaid Integration
// Reference: https://squidfunk.github.io/mkdocs-material/reference/diagrams/

document.addEventListener('DOMContentLoaded', function () {
  // Get the current color scheme
  const scheme = document.body.getAttribute('data-md-color-scheme');
  const theme = scheme === 'slate' ? 'dark' : 'default';
  
  // Initialize Mermaid with proper configuration
  mermaid.initialize({
    startOnLoad: true,
    theme: theme,
    securityLevel: 'loose',
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    logLevel: 'error',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    },
    sequence: {
      useMaxWidth: true,
      diagramMarginX: 50,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 150,
      height: 65,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35
    },
    stateDiagram: {
      useMaxWidth: true
    },
    gantt: {
      useMaxWidth: true
    },
    mindmap: {
      useMaxWidth: true
    }
  });
});

// Handle theme toggle - re-initialize mermaid when theme changes
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === 'data-md-color-scheme') {
      const scheme = document.body.getAttribute('data-md-color-scheme');
      const theme = scheme === 'slate' ? 'dark' : 'default';
      
      // Re-initialize with new theme
      mermaid.initialize({
        startOnLoad: false,
        theme: theme
      });
      
      // Re-render all diagrams
      document.querySelectorAll('.mermaid').forEach(function(el) {
        // Store original content if not already stored
        if (!el.getAttribute('data-original')) {
          el.setAttribute('data-original', el.textContent);
        }
        
        // Get original content
        const content = el.getAttribute('data-original');
        if (content) {
          el.removeAttribute('data-processed');
          el.innerHTML = content;
        }
      });
      
      // Re-run mermaid
      mermaid.init(undefined, '.mermaid');
    }
  });
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ['data-md-color-scheme']
});
