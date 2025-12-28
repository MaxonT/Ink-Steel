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

// Load JSON data with error handling
async function loadJSONData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error loading JSON data:', error);
    return { success: false, error: error.message };
  }
}

// Search function for pens
function searchPens(pens, query) {
  if (!query || query.trim() === '') {
    return pens;
  }
  
  const searchTerm = query.toLowerCase().trim();
  return pens.filter(pen => {
    const searchableText = [
      pen.name,
      pen.brand,
      pen.model,
      pen.description,
      pen.details,
      ...(pen.tags || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(searchTerm);
  });
}

// Filter pens by multiple criteria
function filterPens(pens, filters) {
  let filtered = pens;
  
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
  
  return filtered;
}

// Get unique values from array
function getUniqueValues(array, key) {
  const values = array.map(item => item[key]).filter(Boolean);
  return [...new Set(values)].sort();
}

// Get all unique tags from pens
function getAllTags(pens) {
  const allTags = pens.flatMap(pen => pen.tags || []);
  return [...new Set(allTags)].sort();
}

