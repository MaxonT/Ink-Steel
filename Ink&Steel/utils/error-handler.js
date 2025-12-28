/**
 * Error Handler Utilities
 * Unified error handling patterns and user-friendly error messages
 */

/**
 * Handle and log errors with context
 * @param {Error|string} error - Error object or error message
 * @param {string} context - Context where error occurred
 * @param {boolean} showToUser - Whether to show error to user
 */
function handleError(error, context = 'Unknown', showToUser = true) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  
  // Log error (only in development or if needed)
  if (process.env.NODE_ENV !== 'production' || window.DEBUG) {
    console.error(`[Error in ${context}]`, errorMessage);
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }
  }
  
  // Show user-friendly error message if needed
  if (showToUser) {
    showUserError('An error occurred. Please try again later.');
  }
  
  return {
    error: errorMessage,
    context,
    timestamp: new Date().toISOString()
  };
}

/**
 * Show user-friendly error message
 * @param {string} message - Error message to show
 * @param {number} duration - Display duration in milliseconds (0 = permanent until dismissed)
 */
function showUserError(message, duration = 5000) {
  // Remove existing error notifications
  const existing = document.getElementById('error-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create error notification element
  const notification = document.createElement('div');
  notification.id = 'error-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    line-height: 1;
  `;
  closeBtn.addEventListener('click', () => notification.remove());
  notification.appendChild(closeBtn);
  
  // Add animation style if not already added
  if (!document.getElementById('error-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'error-notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto-remove after duration if specified
  if (duration > 0) {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }
}

/**
 * Show success message
 * @param {string} message - Success message to show
 * @param {number} duration - Display duration in milliseconds
 */
function showSuccessMessage(message, duration = 3000) {
  const existing = document.getElementById('success-notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.id = 'success-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, duration);
}

/**
 * Wrap async function with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @param {string} context - Context for error handling
 * @param {*} defaultValue - Default value to return on error
 * @returns {Function} Wrapped function
 */
function withErrorHandling(asyncFn, context, defaultValue = null) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, context);
      return defaultValue;
    }
  };
}

/**
 * Create a retry wrapper for async functions
 * @param {Function} asyncFn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Function} Function with retry logic
 */
function withRetry(asyncFn, maxRetries = 3, delay = 1000) {
  return async (...args) => {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await asyncFn(...args);
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  };
}

