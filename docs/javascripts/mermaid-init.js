// MkDocs Material - Mermaid Diagram Renderer
// This script converts mermaid code blocks to rendered diagrams

(function() {
  'use strict';

  // Configuration
  var config = {
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
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
      height: 65
    },
    gantt: {
      useMaxWidth: true
    }
  };

  function initMermaid() {
    if (typeof mermaid === 'undefined') {
      console.warn('Mermaid library not loaded');
      return;
    }

    mermaid.initialize(config);

    // Find all code blocks with class 'language-mermaid'
    var codeBlocks = document.querySelectorAll('pre code.language-mermaid');
    
    codeBlocks.forEach(function(codeBlock, index) {
      var pre = codeBlock.parentElement;
      var graphDefinition = codeBlock.textContent.trim();
      
      // Create a container for the diagram
      var container = document.createElement('div');
      container.className = 'mermaid';
      container.id = 'mermaid-diagram-' + index;
      container.setAttribute('data-original', graphDefinition);
      
      // Replace the pre element with our container
      pre.parentElement.insertBefore(container, pre);
      pre.style.display = 'none';
      
      // Render the diagram
      try {
        mermaid.render('mermaid-svg-' + index, graphDefinition).then(function(result) {
          container.innerHTML = result.svg;
        }).catch(function(error) {
          console.error('Mermaid render error:', error);
          container.innerHTML = '<pre style="color: red;">Mermaid Error: ' + error.message + '</pre>';
          container.innerHTML += '<pre>' + graphDefinition + '</pre>';
        });
      } catch (error) {
        console.error('Mermaid error:', error);
        // Fallback: just set the text and let mermaid.init handle it
        container.textContent = graphDefinition;
        mermaid.init(undefined, container);
      }
    });

    // Also process any existing .mermaid divs that haven't been processed
    var existingDivs = document.querySelectorAll('.mermaid:not([data-processed])');
    if (existingDivs.length > 0) {
      mermaid.init(undefined, existingDivs);
    }
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Small delay to ensure mermaid.js is fully loaded
      setTimeout(initMermaid, 100);
    });
  } else {
    setTimeout(initMermaid, 100);
  }

  // Also run on page navigation (for MkDocs Material instant loading)
  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      setTimeout(initMermaid, 100);
    });
  }

  // Re-initialize on theme change
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-md-color-scheme') {
        var scheme = document.body.getAttribute('data-md-color-scheme');
        config.theme = (scheme === 'slate') ? 'dark' : 'default';
        
        // Re-render all diagrams
        document.querySelectorAll('.mermaid').forEach(function(el) {
          var original = el.getAttribute('data-original');
          if (original) {
            el.removeAttribute('data-processed');
            el.innerHTML = '';
            el.textContent = original;
          }
        });
        
        mermaid.initialize(config);
        mermaid.init(undefined, '.mermaid');
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme']
  });

})();
