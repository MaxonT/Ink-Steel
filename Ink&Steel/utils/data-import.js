/**
 * Data Import Utility
 * Supports importing pen data from JSON, CSV, and API sources
 */

class DataImporter {
  constructor() {
    this.validationRules = this.initValidationRules();
  }

  initValidationRules() {
    return {
      required: ['id', 'brand', 'name', 'type'],
      optional: ['model', 'series', 'country', 'description', 'details'],
      specifications: {
        optional: ['length', 'lengthCapped', 'lengthUncapped', 'weight', 'diameter', 'material', 'fillingSystem', 'nib']
      },
      purchaseLinks: {
        required: ['name', 'url'],
        optional: ['price', 'currency', 'region', 'availability']
      }
    };
  }

  /**
   * Import from JSON file
   */
  async importFromJSON(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const pens = data.pens || data;
      
      const results = {
        total: pens.length,
        success: 0,
        failed: 0,
        errors: []
      };

      for (const pen of pens) {
        const validation = this.validatePen(pen);
        if (validation.valid) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            id: pen.id || 'unknown',
            errors: validation.errors
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`JSON import failed: ${error.message}`);
    }
  }

  /**
   * Import from CSV
   */
  async importFromCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const pens = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const pen = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        this.setNestedProperty(pen, header, value);
      });

      pens.push(pen);
    }

    return this.importFromJSON({ pens });
  }

  /**
   * Parse CSV line handling quoted values
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    return values;
  }

  /**
   * Set nested property from dot notation key
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    
    // Handle arrays and special types
    if (lastKey.includes('[]')) {
      const arrayKey = lastKey.replace('[]', '');
      if (!current[arrayKey]) {
        current[arrayKey] = [];
      }
      if (value) {
        current[arrayKey].push(value);
      }
    } else if (value === 'true' || value === 'false') {
      current[lastKey] = value === 'true';
    } else if (!isNaN(value) && value !== '') {
      current[lastKey] = Number(value);
    } else if (value === 'null' || value === '') {
      current[lastKey] = null;
    } else {
      current[lastKey] = value;
    }
  }

  /**
   * Import from API
   */
  async importFromAPI(apiUrl, options = {}) {
    try {
      const response = await fetch(apiUrl, options);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      return this.importFromJSON(data);
    } catch (error) {
      throw new Error(`API import failed: ${error.message}`);
    }
  }

  /**
   * Validate pen data
   */
  validatePen(pen) {
    const errors = [];
    const rules = this.validationRules;

    // Check required fields
    for (const field of rules.required) {
      if (!pen[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate specifications if present
    if (pen.specifications) {
      // Validate nested objects
      if (pen.specifications.nib && typeof pen.specifications.nib !== 'object') {
        errors.push('specifications.nib must be an object');
      }
    }

    // Validate purchaseLinks
    if (pen.purchaseLinks) {
      if (!Array.isArray(pen.purchaseLinks)) {
        errors.push('purchaseLinks must be an array');
      } else {
        pen.purchaseLinks.forEach((link, index) => {
          if (!link.name || !link.url) {
            errors.push(`purchaseLinks[${index}] missing required fields (name, url)`);
          }
          if (link.url && !this.isValidURL(link.url)) {
            errors.push(`purchaseLinks[${index}] has invalid URL`);
          }
        });
      }
    }

    // Validate images
    if (pen.images) {
      if (pen.images.main && !this.isValidURL(pen.images.main)) {
        errors.push('images.main must be a valid URL');
      }
      if (pen.images.gallery && !Array.isArray(pen.images.gallery)) {
        errors.push('images.gallery must be an array');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if string is valid URL
   */
  isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Clean and normalize pen data
   */
  cleanPenData(pen) {
    const cleaned = { ...pen };

    // Generate slug if missing
    if (!cleaned.slug && cleaned.name) {
      cleaned.slug = cleaned.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Ensure dates are in ISO format
    if (cleaned.addedDate && typeof cleaned.addedDate === 'string') {
      cleaned.addedDate = new Date(cleaned.addedDate).toISOString().split('T')[0];
    }
    if (cleaned.lastUpdated) {
      cleaned.lastUpdated = new Date().toISOString().split('T')[0];
    } else {
      cleaned.lastUpdated = new Date().toISOString().split('T')[0];
    }

    // Normalize arrays
    if (cleaned.tags && typeof cleaned.tags === 'string') {
      cleaned.tags = cleaned.tags.split(',').map(t => t.trim());
    }
    if (cleaned.material && typeof cleaned.material === 'string') {
      cleaned.material = cleaned.material.split(',').map(m => m.trim());
    }

    // Ensure specifications object exists
    if (!cleaned.specifications) {
      cleaned.specifications = {};
    }

    // Ensure images object exists
    if (!cleaned.images) {
      cleaned.images = {
        main: '',
        gallery: []
      };
    }

    // Ensure purchaseLinks is array
    if (!cleaned.purchaseLinks) {
      cleaned.purchaseLinks = [];
    }

    return cleaned;
  }

  /**
   * Merge pens (detect duplicates and merge)
   */
  mergePens(existingPens, newPens) {
    const merged = [...existingPens];
    const duplicates = [];

    newPens.forEach(newPen => {
      const existingIndex = merged.findIndex(p => p.id === newPen.id);
      
      if (existingIndex >= 0) {
        // Merge existing pen with new data
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...newPen,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        duplicates.push(newPen.id);
      } else {
        // Add new pen
        merged.push(this.cleanPenData(newPen));
      }
    });

    return {
      pens: merged,
      duplicates,
      added: newPens.length - duplicates.length
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataImporter;
}

