# Code Style Guide

This document outlines the coding standards and conventions used in the Ink & Steel project.

## General Principles

1. **Consistency**: Follow existing patterns and conventions
2. **Clarity**: Code should be self-documenting with clear naming
3. **Robustness**: Always handle edge cases and errors gracefully
4. **Security**: Never trust user input; always sanitize and validate

## Error Handling

### Pattern
Always use try-catch blocks for operations that might fail:
```javascript
try {
  // Operation that might fail
  const result = await someAsyncOperation();
  // Process result
} catch (error) {
  handleError(error, 'Context', showToUser);
  // Provide fallback or default
}
```

### Error Context
Always provide meaningful context when calling `handleError`:
```javascript
handleError(error, 'ComponentName.methodName - Description', true/false);
```

## Data Access

### localStorage Access
Always use safe wrapper functions:
```javascript
// ❌ Wrong
const data = JSON.parse(localStorage.getItem('key') || '[]');

// ✅ Correct
const data = safeLocalStorageGet('key', []);
safeLocalStorageSet('key', value);
```

### Data Validation
Always validate data before use:
```javascript
// ✅ Correct
const pens = Array.isArray(rawData) ? rawData : [];
const pen = pens.find(p => p && p.id === penId);
if (!pen) {
  // Handle not found
}
```

### Optional Chaining
Use optional chaining for safe property access:
```javascript
// ✅ Preferred
const name = pen?.name || 'Unknown';
const length = pen?.specifications?.length || 0;

// ❌ Avoid
const name = pen && pen.name ? pen.name : 'Unknown';
```

## XSS Prevention

### HTML Escaping
Always escape user-generated content before inserting into DOM:
```javascript
// ❌ Wrong
element.innerHTML = `<div>${userInput}</div>`;

// ✅ Correct
element.innerHTML = `<div>${escapeHtml(userInput)}</div>`;
```

### Attribute Values
Always sanitize attribute values:
```javascript
// ✅ Correct
const safeId = sanitizeId(urlParam);
const safeUrl = sanitizeUrl(userUrl) || '#';
```

## Async Operations

### Loading States
Use unified loading state utilities:
```javascript
// ✅ Correct
const result = await loadWithStates(
  () => loadJSONData('./data/pens.json'),
  containerElement,
  {
    skeletonType: 'grid',
    loadingMessage: 'Loading...',
    errorMessage: 'Failed to load.',
    maxRetries: 3
  }
);
```

### Retry Logic
Use `withRetry` or `loadWithStates` for operations that should retry:
```javascript
// ✅ Correct
const result = await withRetry(
  () => loadJSONData('./data/pens.json'),
  3,  // max retries
  1000 // delay between retries
);
```

## Component Patterns

### Web Components
Always implement proper lifecycle:
```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this._boundHandlers = new Map();
  }
  
  connectedCallback() {
    this.render();
  }
  
  disconnectedCallback() {
    // Clean up event listeners
    this._boundHandlers.forEach((handler, element) => {
      if (element && element.removeEventListener) {
        element.removeEventListener('click', handler);
      }
    });
    this._boundHandlers.clear();
  }
  
  render() {
    try {
      // Render logic
    } catch (error) {
      handleError(error, 'MyComponent.render', false);
      // Fallback UI
    }
  }
}
```

## Naming Conventions

### Functions
- Use camelCase: `loadPens`, `renderInks`
- Be descriptive: `getPenById` not `getPen`
- Prefix boolean functions with `is`, `has`, `can`: `isFavorited`, `hasImage`

### Variables
- Use camelCase: `penData`, `allPens`
- Use descriptive names: `minPrice` not `mp`
- Prefix private variables with `_`: `_boundHandlers`, `_cache`

### Constants
- Use UPPER_SNAKE_CASE: `CACHE_NAME`, `MAX_PENS`

## File Organization

### Utils Directory
- `security.js`: XSS prevention, sanitization, safe localStorage
- `error-handler.js`: Error handling and user notifications
- `validators.js`: Data validation functions
- `loading-states.js`: Loading indicators and skeleton screens
- `feature-detection.js`: Browser feature detection
- `page-utils.js`: Page-level utilities (search, filter, sort)
- `seo-utils.js`: SEO-related utilities

### Components Directory
- One component per file
- Component name matches file name (kebab-case)

## Comments

### When to Comment
- Complex logic that isn't self-explanatory
- Non-obvious decisions or workarounds
- Public API documentation (use JSDoc)

### JSDoc Format
```javascript
/**
 * Load pens data with retry and error handling
 * @param {string} url - Data URL
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Object>} Promise resolving to data object
 */
async function loadPensData(url, retries = 3) {
  // Implementation
}
```

## Performance

### Event Listeners
- Always clean up in `disconnectedCallback`
- Use debounce/throttle for frequent events (search, scroll)
- Store bound handlers for cleanup

### DOM Operations
- Batch DOM updates when possible
- Use DocumentFragment for multiple insertions
- Avoid unnecessary re-renders

### Data Loading
- Cache data when appropriate
- Use lazy loading for images
- Implement pagination for large datasets

## Security Checklist

- [ ] All user input sanitized
- [ ] All innerHTML uses `escapeHtml`
- [ ] All localStorage uses safe wrappers
- [ ] All URLs sanitized with `sanitizeUrl`
- [ ] All IDs validated with `sanitizeId`
- [ ] Error messages don't leak sensitive info
- [ ] No eval() or innerHTML with user data

