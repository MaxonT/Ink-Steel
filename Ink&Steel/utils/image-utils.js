/**
 * Image Utilities
 * Helper functions for image optimization and responsive images
 */

// Check if browser supports WebP
function supportsWebP() {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Generate responsive image srcset
function generateSrcSet(imageUrl, sizes = [400, 800, 1200]) {
  if (!imageUrl) return '';
  
  // For placeholder images, just return the original
  if (imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder')) {
    return imageUrl;
  }
  
  // If the URL is already a full URL with dimensions, use it
  // Otherwise, generate srcset entries (this is a simplified version)
  // In a real implementation, you'd use an image CDN service
  return sizes.map(size => `${imageUrl}?w=${size} ${size}w`).join(', ');
}

// Get appropriate image size based on viewport
function getImageSize() {
  const width = window.innerWidth;
  if (width < 640) return 400;
  if (width < 1024) return 800;
  return 1200;
}

// Lazy load image with intersection observer
function lazyLoadImage(img) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          if (image.dataset.src) {
            image.src = image.dataset.src;
            image.classList.remove('lazy');
            observer.unobserve(image);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = img.dataset.src || img.src;
  }
}

// Create responsive image element
function createResponsiveImage(src, alt, className = '') {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  if (className) img.className = className;
  img.loading = 'lazy';
  
  // Add srcset if not a placeholder
  if (!src.includes('placeholder') && !src.includes('via.placeholder')) {
    const srcset = generateSrcSet(src);
    if (srcset) {
      img.srcset = srcset;
      img.sizes = '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px';
    }
  }
  
  return img;
}

// Convert image URL to WebP if supported
async function getOptimizedImageUrl(url) {
  if (!url || url.includes('placeholder')) return url;
  
  const webpSupported = await supportsWebP();
  if (webpSupported && !url.includes('.webp')) {
    // In a real implementation, you'd convert the URL to point to a WebP version
    // This is a placeholder - actual implementation depends on your image hosting
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return url;
}

