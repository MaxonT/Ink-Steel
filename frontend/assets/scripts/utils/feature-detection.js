/**
 * Feature Detection Utilities
 * Progressive enhancement and graceful degradation helpers
 */

/**
 * Check if a feature is supported
 * @param {string} feature - Feature name (e.g., 'serviceWorker', 'localStorage')
 * @returns {boolean}
 */
function isFeatureSupported(feature) {
  const features = {
    serviceWorker: 'serviceWorker' in navigator,
    localStorage: (() => {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        const test = '__storage_test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })(),
    fetch: typeof fetch !== 'undefined',
    promise: typeof Promise !== 'undefined',
    webShare: 'share' in navigator,
    clipboard: 'clipboard' in navigator && navigator.clipboard && 'writeText' in navigator.clipboard,
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    customElements: 'customElements' in window,
    shadowDOM: (() => {
      try {
        return document.createElement('div').attachShadow !== undefined;
      } catch {
        return false;
      }
    })(),
    cssGrid: CSS.supports('display', 'grid'),
    flexbox: CSS.supports('display', 'flex'),
    webp: (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })()
  };
  
  return features[feature] || false;
}

/**
 * Check if localStorage is available and working
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  return isFeatureSupported('localStorage');
}

/**
 * Get localStorage with fallback to memory storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value
 * @returns {*} Stored value or default
 */
function safeLocalStorageGet(key, defaultValue = null) {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.warn('localStorage get error:', e);
    return defaultValue;
  }
}

/**
 * Set localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
function safeLocalStorageSet(key, value) {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('localStorage set error:', e);
    return false;
  }
}

/**
 * Register service worker with feature detection
 * @param {string} swPath - Service worker path
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
async function registerServiceWorker(swPath) {
  if (!isFeatureSupported('serviceWorker')) {
    console.log('Service Workers are not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register(swPath);
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.warn('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Share with Web Share API or fallback
 * @param {Object} shareData - Share data object
 * @param {Function} fallback - Fallback function
 * @returns {Promise<boolean>}
 */
async function shareContent(shareData, fallback) {
  if (isFeatureSupported('webShare')) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share failed:', err);
        if (fallback) {
          fallback();
        }
      }
      return false;
    }
  } else {
    if (fallback) {
      fallback();
    }
    return false;
  }
}

/**
 * Copy to clipboard with fallback
 * @param {string} text - Text to copy
 * @param {Function} fallback - Fallback function
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text, fallback) {
  if (isFeatureSupported('clipboard')) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed:', err);
      if (fallback) {
        fallback();
      }
      return false;
    }
  } else {
    if (fallback) {
      fallback();
    }
    return false;
  }
}

/**
 * Lazy load images with Intersection Observer or fallback
 * @param {NodeList|Array} images - Image elements
 */
function lazyLoadImages(images) {
  if (!images || images.length === 0) return;
  
  if (isFeatureSupported('intersectionObserver')) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });
    
    images.forEach(img => {
      if (img.dataset.src) {
        imageObserver.observe(img);
      }
    });
  } else {
    // Fallback: load all images immediately
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  }
}

/**
 * Apply progressive enhancement based on feature support
 */
function applyProgressiveEnhancement() {
  // Add feature classes to html element for CSS-based enhancements
  const html = document.documentElement;
  
  if (isFeatureSupported('cssGrid')) {
    html.classList.add('css-grid');
  }
  if (isFeatureSupported('flexbox')) {
    html.classList.add('flexbox');
  }
  if (isFeatureSupported('webp')) {
    html.classList.add('webp');
  }
  if (isFeatureSupported('serviceWorker')) {
    html.classList.add('service-worker');
  }
  
  // Add no-js class if JavaScript is disabled (should be in HTML initially)
  html.classList.remove('no-js');
  html.classList.add('js');
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyProgressiveEnhancement);
} else {
  applyProgressiveEnhancement();
}

