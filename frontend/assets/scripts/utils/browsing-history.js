/**
 * Browsing History Utility
 * Manages user's browsing history for pens
 */

const MAX_HISTORY_ITEMS = 50;

function addToBrowsingHistory(penId, penData) {
  if (!penId || !penData) return;
  
  try {
    let history = getBrowsingHistory();
    if (!Array.isArray(history)) history = [];
    
    // Remove if already exists
    history = history.filter(item => item.id !== penId);
    
    // Add to beginning
    history.unshift({
      id: String(penId),
      name: String(penData.name || 'Unknown'),
      brand: String(penData.brand || ''),
      image: String(penData.images?.main || ''),
      viewedAt: new Date().toISOString()
    });
    
    // Limit size
    history = history.slice(0, MAX_HISTORY_ITEMS);
    
    safeLocalStorageSet('pen-browsing-history', history);
  } catch (e) {
    handleError(e, 'addToBrowsingHistory', false);
  }
}

function getBrowsingHistory() {
  return safeLocalStorageGet('pen-browsing-history', []);
}

function clearBrowsingHistory() {
  try {
    localStorage.removeItem('pen-browsing-history');
  } catch (e) {
    handleError(e, 'clearBrowsingHistory', false);
  }
}

function getRecentPens(count = 5) {
  const history = getBrowsingHistory();
  return history.slice(0, count);
}

