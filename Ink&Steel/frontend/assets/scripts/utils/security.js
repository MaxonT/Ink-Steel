/**
 * Security Utilities
 * Functions for XSS prevention and secure data handling
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for innerHTML
 */
function escapeHtml(text) {
  if (text == null) return '';
  
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Safely parse JSON string with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJsonParse(jsonString, defaultValue = null) {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('JSON parse error:', e, 'String:', jsonString.substring(0, 100));
    return defaultValue;
  }
}

/**
 * Safely get item from localStorage with JSON parsing
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or default value
 */
function safeLocalStorageGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return safeJsonParse(item, defaultValue);
  } catch (e) {
    console.error(`Error reading localStorage key "${key}":`, e);
    return defaultValue;
  }
}

/**
 * Safely set item to localStorage with JSON stringify
 * @param {string} key - localStorage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
function safeLocalStorageSet(key, value) {
  try {
    const jsonString = JSON.stringify(value);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (e) {
    console.error(`Error writing localStorage key "${key}":`, e);
    return false;
  }
}

/**
 * Sanitize URL to prevent XSS and ensure valid URL
 * @param {string} url - URL to sanitize
 * @returns {string|null} Sanitized URL or null if invalid
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const parsedUrl = new URL(url, window.location.origin);
    // Only allow http and https protocols
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return parsedUrl.href;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Sanitize ID parameter (alphanumeric, dash, underscore only)
 * @param {string} id - ID to sanitize
 * @returns {string|null} Sanitized ID or null if invalid
 */
function sanitizeId(id) {
  if (!id || typeof id !== 'string') return null;
  
  // Only allow alphanumeric, dash, underscore
  const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Sanitize search query (remove potentially dangerous characters)
 * @param {string} query - Search query to sanitize
 * @param {number} maxLength - Maximum length (default: 200)
 * @returns {string} Sanitized query
 */
function sanitizeSearchQuery(query, maxLength = 200) {
  if (!query || typeof query !== 'string') return '';
  
  // Remove HTML tags and trim
  let sanitized = query.replace(/<[^>]*>/g, '').trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Create a safe HTML string from template with escaped data
 * @param {Array<string>} strings - Template string parts
 * @param {...*} values - Values to escape and insert
 * @returns {string} Safe HTML string
 */
function html(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = i < values.length ? escapeHtml(values[i]) : '';
    return result + str + value;
  }, '');
}

