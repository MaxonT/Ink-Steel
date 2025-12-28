/**
 * Search Utilities
 * Enhanced search functionality with history, suggestions, and URL parameters
 */

// Search history management
const MAX_SEARCH_HISTORY = 10;

function getSearchHistory() {
  return safeLocalStorageGet('search-history', []);
}

function addToSearchHistory(query) {
  if (!query || query.trim() === '') return;
  
  let history = getSearchHistory();
  // Remove if exists
  history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
  // Add to beginning
  history.unshift(query.trim());
  // Limit size
  history = history.slice(0, MAX_SEARCH_HISTORY);
  
  safeLocalStorageSet('search-history', history);
}

function clearSearchHistory() {
  try {
    localStorage.removeItem('search-history');
  } catch (e) {
    handleError(e, 'clearSearchHistory', false);
  }
}

// URL parameter management for search/filters
function getSearchParamsFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('search') || '',
    brand: params.get('brand') || '',
    type: params.get('type') || '',
    fillingSystem: params.get('fillingSystem') || '',
    availability: params.get('availability') || '',
    priceMin: params.get('priceMin') || '',
    priceMax: params.get('priceMax') || '',
    lengthMin: params.get('lengthMin') || '',
    lengthMax: params.get('lengthMax') || '',
    weightMin: params.get('weightMin') || '',
    weightMax: params.get('weightMax') || '',
    sortBy: params.get('sortBy') || ''
  };
}

function updateURLWithSearchParams(params) {
  const url = new URL(window.location);
  
  // Remove all existing search params
  url.search = '';
  
  // Add non-empty params
  Object.keys(params).forEach(key => {
    if (params[key] && params[key] !== '') {
      url.searchParams.set(key, params[key]);
    }
  });
  
  // Update URL without reload
  window.history.pushState({}, '', url);
}

function buildShareableURL(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] && params[key] !== '') {
      url.searchParams.set(key, params[key]);
    }
  });
  return url.toString();
}

// Search suggestions (simple implementation)
function getSearchSuggestions(pens, query) {
  if (!query || typeof query !== 'string' || query.length < 2) return [];
  if (!Array.isArray(pens)) return [];
  
  const sanitizedQuery = sanitizeSearchQuery(query);
  if (!sanitizedQuery) return [];
  
  const queryLower = sanitizedQuery.toLowerCase();
  const suggestions = new Set();
  
  pens.forEach(pen => {
    // Brand suggestions
    if (pen.brand && pen.brand.toLowerCase().startsWith(queryLower)) {
      suggestions.add(pen.brand);
    }
    // Model suggestions
    if (pen.model && pen.model.toLowerCase().startsWith(queryLower)) {
      suggestions.add(pen.model);
    }
    // Name suggestions (first word)
    if (pen.name) {
      const firstWord = pen.name.split(' ')[0];
      if (firstWord.toLowerCase().startsWith(queryLower)) {
        suggestions.add(firstWord);
      }
    }
    // Tag suggestions
    if (pen.tags) {
      pen.tags.forEach(tag => {
        if (tag.toLowerCase().startsWith(queryLower)) {
          suggestions.add(tag);
        }
      });
    }
  });
  
  return Array.from(suggestions).slice(0, 5);
}

// Highlight search terms in text
function highlightSearchTerms(text, query) {
  if (!query || query.trim() === '') return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark style="background: #fff3cd; padding: 0.1em 0.2em;">$1</mark>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

