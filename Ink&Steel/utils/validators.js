/**
 * Data Validators
 * Functions for validating data structures and formats
 */

/**
 * Validate pen data structure
 * @param {*} pen - Pen data to validate
 * @returns {{valid: boolean, error?: string}}
 */
function validatePenData(pen) {
  if (!pen || typeof pen !== 'object') {
    return { valid: false, error: 'Pen data must be an object' };
  }
  
  if (!pen.id || typeof pen.id !== 'string') {
    return { valid: false, error: 'Pen must have a valid id' };
  }
  
  if (!pen.name || typeof pen.name !== 'string') {
    return { valid: false, error: 'Pen must have a valid name' };
  }
  
  // Validate specifications if present
  if (pen.specifications && typeof pen.specifications !== 'object') {
    return { valid: false, error: 'Specifications must be an object' };
  }
  
  // Validate images if present
  if (pen.images && typeof pen.images !== 'object') {
    return { valid: false, error: 'Images must be an object' };
  }
  
  // Validate purchaseLinks if present
  if (pen.purchaseLinks) {
    if (!Array.isArray(pen.purchaseLinks)) {
      return { valid: false, error: 'PurchaseLinks must be an array' };
    }
    for (const link of pen.purchaseLinks) {
      if (!link || typeof link !== 'object') {
        return { valid: false, error: 'Each purchase link must be an object' };
      }
      if (link.url && typeof link.url !== 'string') {
        return { valid: false, error: 'Purchase link URL must be a string' };
      }
    }
  }
  
  // Validate tags if present
  if (pen.tags && !Array.isArray(pen.tags)) {
    return { valid: false, error: 'Tags must be an array' };
  }
  
  return { valid: true };
}

/**
 * Validate ink data structure
 * @param {*} ink - Ink data to validate
 * @returns {{valid: boolean, error?: string}}
 */
function validateInkData(ink) {
  if (!ink || typeof ink !== 'object') {
    return { valid: false, error: 'Ink data must be an object' };
  }
  
  if (!ink.id || typeof ink.id !== 'string') {
    return { valid: false, error: 'Ink must have a valid id' };
  }
  
  if (!ink.name || typeof ink.name !== 'string') {
    return { valid: false, error: 'Ink must have a valid name' };
  }
  
  // Validate purchaseLinks if present
  if (ink.purchaseLinks) {
    if (!Array.isArray(ink.purchaseLinks)) {
      return { valid: false, error: 'PurchaseLinks must be an array' };
    }
  }
  
  // Validate swatches if present
  if (ink.swatches && !Array.isArray(ink.swatches)) {
    return { valid: false, error: 'Swatches must be an array' };
  }
  
  return { valid: true };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format (ISO 8601)
 * @param {string} date - Date string to validate
 * @returns {boolean}
 */
function isValidDate(date) {
  if (!date || typeof date !== 'string') return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validate price value
 * @param {*} price - Price to validate
 * @returns {boolean}
 */
function isValidPrice(price) {
  if (price === null || price === undefined) return false;
  const num = Number(price);
  return !isNaN(num) && num >= 0 && isFinite(num);
}

/**
 * Validate and clean pens array
 * @param {Array} pens - Array of pens to validate
 * @returns {Array} Validated and cleaned pens array
 */
function validatePensArray(pens) {
  if (!Array.isArray(pens)) return [];
  
  return pens
    .filter(pen => {
      const validation = validatePenData(pen);
      if (!validation.valid) {
        console.warn('Invalid pen data:', validation.error, pen);
        return false;
      }
      return true;
    });
}

/**
 * Validate and clean inks array
 * @param {Array} inks - Array of inks to validate
 * @returns {Array} Validated and cleaned inks array
 */
function validateInksArray(inks) {
  if (!Array.isArray(inks)) return [];
  
  return inks
    .filter(ink => {
      const validation = validateInkData(ink);
      if (!validation.valid) {
        console.warn('Invalid ink data:', validation.error, ink);
        return false;
      }
      return true;
    });
}

