// Page transition animation
function initPageTransition() {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 1.5s ease';
    document.body.style.opacity = '1';
  }, 100);
  
  window.addEventListener('beforeunload', () => {
    document.body.style.transition = 'none';
  });
}

// Load JSON data with error handling and timeout
async function loadJSONData(url, timeout = 10000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    handleError(error, `loadJSONData(${url})`, false);
    return { success: false, error: error.message };
  }
}

// Search function for pens
function searchPens(pens, query) {
  if (!Array.isArray(pens)) return [];
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return pens;
  }
  
  const searchTerm = query.toLowerCase().trim();
  return pens.filter(pen => {
    if (!pen) return false;
    
    const searchableText = [
      pen.name || '',
      pen.brand || '',
      pen.model || '',
      pen.series || '',
      pen.description || '',
      pen.details || '',
      ...(Array.isArray(pen.tags) ? pen.tags : [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
}

// Filter pens by multiple criteria
function filterPens(pens, filters) {
  if (!Array.isArray(pens)) return [];
  if (!filters || typeof filters !== 'object') return pens;
  
  let filtered = pens.filter(p => p != null); // Remove null/undefined entries
  
  if (filters.brand && filters.brand.length > 0) {
    filtered = filtered.filter(pen => filters.brand.includes(pen.brand));
  }
  
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(pen => filters.type.includes(pen.type));
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(pen => 
      pen.tags && pen.tags.some(tag => filters.tags.includes(tag))
    );
  }
  
  if (filters.priceMin !== undefined && filters.priceMin !== null) {
    filtered = filtered.filter(pen => {
      const prices = (pen.purchaseLinks || []).map(link => link.price).filter(p => p);
      if (prices.length === 0) return true; // Include pens without prices
      return Math.min(...prices) >= filters.priceMin;
    });
  }
  
  if (filters.priceMax !== undefined && filters.priceMax !== null) {
    filtered = filtered.filter(pen => {
      const prices = (pen.purchaseLinks || []).map(link => link.price).filter(p => p);
      if (prices.length === 0) return true; // Include pens without prices
      return Math.min(...prices) <= filters.priceMax;
    });
  }
  
  if (filters.lengthMin !== undefined && filters.lengthMin !== null) {
    filtered = filtered.filter(pen => {
      const length = pen.specifications?.length || pen.specifications?.lengthCapped;
      return length && length >= filters.lengthMin;
    });
  }
  
  if (filters.lengthMax !== undefined && filters.lengthMax !== null) {
    filtered = filtered.filter(pen => {
      const length = pen.specifications?.length || pen.specifications?.lengthCapped;
      return length && length <= filters.lengthMax;
    });
  }
  
  if (filters.weightMin !== undefined && filters.weightMin !== null) {
    filtered = filtered.filter(pen => {
      const weight = pen.specifications?.weight;
      return weight && weight >= filters.weightMin;
    });
  }
  
  if (filters.weightMax !== undefined && filters.weightMax !== null) {
    filtered = filtered.filter(pen => {
      const weight = pen.specifications?.weight;
      return weight && weight <= filters.weightMax;
    });
  }
  
  if (filters.fillingSystem && filters.fillingSystem.length > 0) {
    filtered = filtered.filter(pen => {
      const fs = pen.specifications?.fillingSystem;
      return fs && filters.fillingSystem.includes(fs);
    });
  }
  
  if (filters.nibType && filters.nibType.length > 0) {
    filtered = filtered.filter(pen => {
      const nibType = pen.specifications?.nib?.type;
      return nibType && filters.nibType.includes(nibType);
    });
  }
  
  if (filters.availability && filters.availability.length > 0) {
    filtered = filtered.filter(pen => 
      pen.availability && filters.availability.includes(pen.availability)
    );
  }
  
  return filtered;
}

// Get unique values from array
function getUniqueValues(array, key) {
  const values = array.map(item => item[key]).filter(Boolean);
  return [...new Set(values)].sort();
}

// Get all unique tags from pens
function getAllTags(pens) {
  if (!Array.isArray(pens)) return [];
  const allTags = pens
    .filter(pen => pen != null)
    .flatMap(pen => Array.isArray(pen.tags) ? pen.tags : [])
    .filter(tag => tag != null && tag !== '');
  return [...new Set(allTags)].sort();
}

// Sort pens
function sortPens(pens, sortBy) {
  const sorted = [...pens];
  
  switch(sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'brand':
      return sorted.sort((a, b) => {
        const brandCompare = (a.brand || '').localeCompare(b.brand || '');
        if (brandCompare !== 0) return brandCompare;
        return (a.model || '').localeCompare(b.model || '');
      });
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = Math.min(...(a.purchaseLinks || []).map(l => l.price || Infinity).filter(p => p !== Infinity));
        const priceB = Math.min(...(b.purchaseLinks || []).map(l => l.price || Infinity).filter(p => p !== Infinity));
        return (priceA === Infinity ? 0 : priceA) - (priceB === Infinity ? 0 : priceB);
      });
    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = Math.min(...(a.purchaseLinks || []).map(l => l.price || Infinity).filter(p => p !== Infinity));
        const priceB = Math.min(...(b.purchaseLinks || []).map(l => l.price || Infinity).filter(p => p !== Infinity));
        return (priceB === Infinity ? 0 : priceB) - (priceA === Infinity ? 0 : priceA);
      });
    case 'date-added':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.addedDate || 0);
        const dateB = new Date(b.addedDate || 0);
        return dateB - dateA;
      });
    default:
      return sorted;
  }
}

// Image lazy loading helper
function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
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

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Cache data helper
const dataCache = new Map();

async function loadJSONDataWithCache(url) {
  if (dataCache.has(url)) {
    return dataCache.get(url);
  }
  
  const result = await loadJSONData(url);
  if (result.success) {
    dataCache.set(url, result);
  }
  return result;
}

