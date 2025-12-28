/**
 * Browsing History Utility
 * Manages user's browsing history for pens
 */

const MAX_HISTORY_ITEMS = 50;

function addToBrowsingHistory(penId, penData) {
  let history = getBrowsingHistory();
  
  // Remove if already exists
  history = history.filter(item => item.id !== penId);
  
  // Add to beginning
  history.unshift({
    id: penId,
    name: penData.name || 'Unknown',
    brand: penData.brand || '',
    image: penData.images?.main || '',
    viewedAt: new Date().toISOString()
  });
  
  // Limit size
  history = history.slice(0, MAX_HISTORY_ITEMS);
  
  localStorage.setItem('pen-browsing-history', JSON.stringify(history));
}

function getBrowsingHistory() {
  return JSON.parse(localStorage.getItem('pen-browsing-history') || '[]');
}

function clearBrowsingHistory() {
  localStorage.removeItem('pen-browsing-history');
}

function getRecentPens(count = 5) {
  const history = getBrowsingHistory();
  return history.slice(0, count);
}

