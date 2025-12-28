/**
 * Loading State Utilities
 * Unified loading indicators and skeleton screens
 */

/**
 * Show loading state in an element
 * @param {HTMLElement} element - Element to show loading state in
 * @param {Object} options - Loading options
 * @param {string} options.message - Custom loading message
 * @param {boolean} options.showSpinner - Whether to show spinner (default: true)
 */
function showLoadingState(element, options = {}) {
  if (!element) return;
  
  const message = options.message || 'Loading...';
  const showSpinner = options.showSpinner !== false;
  
  element.innerHTML = `
    <div class="loading-container" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      min-height: 300px;
    ">
      ${showSpinner ? `
        <div class="loading-spinner" style="
          width: 48px;
          height: 48px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #333;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        "></div>
      ` : ''}
      <p style="
        color: #666;
        font-style: italic;
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.1rem;
        margin: 0;
      ">${escapeHtml(message)}</p>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
}

/**
 * Show error state in an element with retry button
 * @param {HTMLElement} element - Element to show error state in
 * @param {Object} options - Error options
 * @param {string} options.message - Error message
 * @param {Function} options.onRetry - Retry callback function
 * @param {string} options.retryLabel - Retry button label
 */
function showErrorState(element, options = {}) {
  if (!element) return;
  
  const message = options.message || 'An error occurred. Please try again.';
  const onRetry = options.onRetry || null;
  const retryLabel = options.retryLabel || 'Retry';
  
  let retryButton = '';
  if (onRetry && typeof onRetry === 'function') {
    retryButton = `
      <button onclick="(${onRetry.toString()})()" style="
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background: #333;
        color: white;
        border: none;
        cursor: pointer;
        font-family: 'Cormorant Garamond', serif;
        font-size: 1rem;
        transition: background 0.3s ease;
      " onmouseover="this.style.background='#555'" onmouseout="this.style.background='#333'">
        ${escapeHtml(retryLabel)}
      </button>
    `;
  }
  
  element.innerHTML = `
    <div class="error-container" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      min-height: 300px;
      text-align: center;
    ">
      <svg style="
        width: 64px;
        height: 64px;
        margin-bottom: 1rem;
        opacity: 0.5;
      " fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      <p style="
        color: #666;
        font-style: italic;
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.1rem;
        margin: 0 0 1rem;
      ">${escapeHtml(message)}</p>
      ${retryButton}
    </div>
  `;
}

/**
 * Show skeleton screen for content loading
 * @param {HTMLElement} element - Element to show skeleton in
 * @param {string} type - Skeleton type ('grid', 'list', 'detail')
 */
function showSkeletonScreen(element, type = 'grid') {
  if (!element) return;
  
  const skeletons = {
    grid: `
      <div class="skeleton-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        padding: 2rem 0;
      ">
        ${Array(6).fill(0).map(() => `
          <div class="skeleton-card" style="
            background: white;
            padding: 1.5rem;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <div class="skeleton-image" style="
              width: 100%;
              height: 250px;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s ease-in-out infinite;
              border-radius: 4px;
              margin-bottom: 1rem;
            "></div>
            <div class="skeleton-line" style="
              height: 24px;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s ease-in-out infinite;
              border-radius: 4px;
              margin-bottom: 0.5rem;
            "></div>
            <div class="skeleton-line" style="
              height: 16px;
              width: 70%;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s ease-in-out infinite;
              border-radius: 4px;
            "></div>
          </div>
        `).join('')}
      </div>
      <style>
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      </style>
    `,
    list: `
      <div class="skeleton-list" style="padding: 2rem 0;">
        ${Array(5).fill(0).map(() => `
          <div class="skeleton-item" style="
            display: flex;
            gap: 1rem;
            padding: 1rem;
            margin-bottom: 1rem;
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <div class="skeleton-avatar" style="
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s ease-in-out infinite;
              flex-shrink: 0;
            "></div>
            <div style="flex: 1;">
              <div class="skeleton-line" style="
                height: 20px;
                width: 60%;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s ease-in-out infinite;
                border-radius: 4px;
                margin-bottom: 0.5rem;
              "></div>
              <div class="skeleton-line" style="
                height: 16px;
                width: 80%;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s ease-in-out infinite;
                border-radius: 4px;
              "></div>
            </div>
          </div>
        `).join('')}
      </div>
      <style>
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      </style>
    `,
    detail: `
      <div class="skeleton-detail" style="padding: 2rem;">
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        ">
          <div>
            <div class="skeleton-image" style="
              width: 100%;
              height: 500px;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s ease-in-out infinite;
              border-radius: 4px;
            "></div>
          </div>
          <div>
            <div class="skeleton-line" style="
              height: 48px;
              width: 80%;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s ease-in-out infinite;
              border-radius: 4px;
              margin-bottom: 1rem;
            "></div>
            <div class="skeleton-line" style="
              height: 24px;
              width: 60%;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: skeleton-loading 1.5s ease-in-out infinite;
              border-radius: 4px;
              margin-bottom: 2rem;
            "></div>
            ${Array(6).fill(0).map(() => `
              <div style="margin-bottom: 1rem;">
                <div class="skeleton-line" style="
                  height: 20px;
                  width: 100%;
                  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                  background-size: 200% 100%;
                  animation: skeleton-loading 1.5s ease-in-out infinite;
                  border-radius: 4px;
                "></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <style>
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 968px) {
          .skeleton-detail > div {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    `
  };
  
  element.innerHTML = skeletons[type] || skeletons.grid;
}

/**
 * Load data with loading state, error handling, and retry
 * @param {Function} loadFunction - Async function that loads data
 * @param {HTMLElement} container - Container element to show states in
 * @param {Object} options - Options
 * @returns {Promise} Promise that resolves with loaded data
 */
async function loadWithStates(loadFunction, container, options = {}) {
  if (!container || typeof loadFunction !== 'function') {
    return null;
  }
  
  const showSkeleton = options.showSkeleton !== false;
  const skeletonType = options.skeletonType || 'grid';
  const loadingMessage = options.loadingMessage || 'Loading...';
  const errorMessage = options.errorMessage || 'Failed to load data. Please try again.';
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  
  // Show initial loading state
  if (showSkeleton) {
    showSkeletonScreen(container, skeletonType);
  } else {
    showLoadingState(container, { message: loadingMessage });
  }
  
  let lastError = null;
  
  // Retry logic
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await loadFunction();
      
      // If result has success property (like loadJSONData), check it
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          return result;
        } else {
          lastError = new Error(result.error || 'Load failed');
        }
      } else {
        return result;
      }
    } catch (error) {
      lastError = error;
      handleError(error, 'loadWithStates', false);
      
      // Wait before retry (except on last attempt)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // All retries failed, show error state
  showErrorState(container, {
    message: errorMessage,
    onRetry: () => loadWithStates(loadFunction, container, options),
    retryLabel: 'Retry'
  });
  
  return null;
}

