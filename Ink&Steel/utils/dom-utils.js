/**
 * DOM Utilities
 * Optimized DOM manipulation helpers
 */

/**
 * Batch DOM updates using DocumentFragment for better performance
 * @param {HTMLElement} container - Container element to append to
 * @param {Function} renderFunction - Function that returns HTML string or element
 * @param {Array} items - Array of items to render
 * @returns {DocumentFragment} Created fragment
 */
function renderBatch(container, renderFunction, items) {
  if (!container || !renderFunction || !Array.isArray(items)) {
    return null;
  }
  
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  
  items.forEach(item => {
    const html = renderFunction(item);
    if (html) {
      tempDiv.innerHTML = html;
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
    }
  });
  
  // Clear container efficiently
  container.innerHTML = '';
  container.appendChild(fragment);
  
  return fragment;
}

/**
 * Update element text content safely
 * @param {HTMLElement} element - Element to update
 * @param {string} text - Text content
 */
function setTextContent(element, text) {
  if (!element) return;
  element.textContent = text != null ? String(text) : '';
}

/**
 * Update element innerHTML with sanitization
 * @param {HTMLElement} element - Element to update
 * @param {string} html - HTML content (will be sanitized if needed)
 * @param {boolean} sanitize - Whether to escape HTML (default: false for performance, ensure html is already safe)
 */
function setInnerHTML(element, html, sanitize = false) {
  if (!element) return;
  if (sanitize) {
    element.innerHTML = escapeHtml(String(html || ''));
  } else {
    element.innerHTML = html || '';
  }
}

/**
 * Create element with attributes efficiently
 * @param {string} tagName - HTML tag name
 * @param {Object} attributes - Attributes object
 * @param {string|HTMLElement} content - Text content or child element
 * @returns {HTMLElement} Created element
 */
function createElement(tagName, attributes = {}, content = null) {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key === 'class') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.assign(element.dataset, value);
    } else if (value != null) {
      element.setAttribute(key, String(value));
    }
  });
  
  // Set content
  if (content != null) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (child instanceof HTMLElement) {
          element.appendChild(child);
        }
      });
    }
  }
  
  return element;
}

/**
 * Update multiple elements in batch
 * @param {Object} updates - Object mapping selectors/elements to update functions
 */
function batchUpdate(updates) {
  const updatesList = [];
  
  Object.entries(updates).forEach(([selectorOrElement, updateFn]) => {
    let element;
    if (typeof selectorOrElement === 'string') {
      element = document.querySelector(selectorOrElement);
    } else if (selectorOrElement instanceof HTMLElement) {
      element = selectorOrElement;
    }
    
    if (element && typeof updateFn === 'function') {
      updatesList.push(() => updateFn(element));
    }
  });
  
  // Use requestAnimationFrame for batch updates
  requestAnimationFrame(() => {
    updatesList.forEach(update => update());
  });
}

/**
 * Efficiently remove all children from element
 * @param {HTMLElement} element - Element to clear
 */
function clearChildren(element) {
  if (!element) return;
  
  // Fastest method: set textContent to empty string
  element.textContent = '';
}

/**
 * Replace element content with new content using DocumentFragment
 * @param {HTMLElement} element - Element to update
 * @param {string} html - HTML string to insert
 */
function replaceContent(element, html) {
  if (!element) return;
  
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  // Clear and append in one operation
  element.textContent = '';
  element.appendChild(fragment);
}

/**
 * Debounced DOM update function
 * @param {Function} updateFunction - Function that performs DOM updates
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounceDOMUpdate(updateFunction, delay = 100) {
  let timeoutId = null;
  let pendingUpdate = null;
  
  return function(...args) {
    pendingUpdate = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (pendingUpdate) {
        updateFunction.apply(this, pendingUpdate);
        pendingUpdate = null;
      }
      timeoutId = null;
    }, delay);
  };
}

/**
 * Optimized class manipulation
 * @param {HTMLElement} element - Element to modify
 * @param {string|Array} classes - Class names to add/remove
 * @param {boolean} add - Whether to add (true) or remove (false) classes
 */
function toggleClasses(element, classes, add = true) {
  if (!element) return;
  
  const classList = Array.isArray(classes) ? classes : [classes];
  
  if (add) {
    element.classList.add(...classList);
  } else {
    element.classList.remove(...classList);
  }
}

/**
 * Create DocumentFragment from HTML string
 * @param {string} html - HTML string
 * @returns {DocumentFragment} Document fragment
 */
function htmlToFragment(html) {
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  return fragment;
}

