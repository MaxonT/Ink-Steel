/**
 * SEO Utility Functions
 * Helper functions for generating meta tags and structured data
 */

// Generate meta tags HTML
function generateMetaTags(data) {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    siteName = 'Ink & Steel',
    locale = 'en_US'
  } = data;

  const metaTags = [];
  
  // Basic meta tags
  if (title) {
    metaTags.push(`<title>${escapeHtml(title)}</title>`);
    metaTags.push(`<meta name="title" content="${escapeHtml(title)}">`);
  }
  
  if (description) {
    metaTags.push(`<meta name="description" content="${escapeHtml(description)}">`);
  }
  
  // Open Graph tags
  if (title) {
    metaTags.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
  }
  if (description) {
    metaTags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
  }
  if (type) {
    metaTags.push(`<meta property="og:type" content="${type}">`);
  }
  if (url) {
    metaTags.push(`<meta property="og:url" content="${escapeHtml(url)}">`);
  }
  if (image) {
    metaTags.push(`<meta property="og:image" content="${escapeHtml(image)}">`);
  }
  if (siteName) {
    metaTags.push(`<meta property="og:site_name" content="${escapeHtml(siteName)}">`);
  }
  if (locale) {
    metaTags.push(`<meta property="og:locale" content="${locale}">`);
  }
  
  // Twitter Card tags
  metaTags.push(`<meta name="twitter:card" content="summary_large_image">`);
  if (title) {
    metaTags.push(`<meta name="twitter:title" content="${escapeHtml(title)}">`);
  }
  if (description) {
    metaTags.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`);
  }
  if (image) {
    metaTags.push(`<meta name="twitter:image" content="${escapeHtml(image)}">`);
  }
  
  // Canonical URL
  if (url) {
    metaTags.push(`<link rel="canonical" href="${escapeHtml(url)}">`);
  }
  
  return metaTags.join('\n    ');
}

// Generate Product schema (JSON-LD)
function generateProductSchema(pen) {
  const specs = pen.specifications || {};
  const image = pen.images?.main || '';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pen.name,
    "description": pen.description || pen.details,
    "brand": {
      "@type": "Brand",
      "name": pen.brand
    },
    "manufacturer": {
      "@type": "Organization",
      "name": pen.manufacturer || pen.brand
    }
  };
  
  if (image) {
    schema.image = image;
  }
  
  if (pen.purchaseLinks && pen.purchaseLinks.length > 0) {
    const offers = pen.purchaseLinks
      .filter(link => link.price)
      .map(link => ({
        "@type": "Offer",
        "url": link.url,
        "price": link.price,
        "priceCurrency": link.currency || "USD",
        "availability": link.availability === "In Stock" 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": link.name
        }
      }));
    
    if (offers.length > 0) {
      schema.offers = offers.length === 1 ? offers[0] : {
        "@type": "AggregateOffer",
        "offerCount": offers.length,
        "lowPrice": Math.min(...offers.map(o => o.price)),
        "highPrice": Math.max(...offers.map(o => o.price)),
        "priceCurrency": offers[0].priceCurrency
      };
    }
  }
  
  // Additional properties
  if (specs.weight) {
    schema.weight = `${specs.weight} g`;
  }
  
  if (specs.length) {
    schema.dimensions = `${specs.length} mm`;
  }
  
  return schema;
}

// Generate Organization schema
function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ink & Steel",
    "description": "A gallery of writing's most elegant companions",
    "url": window.location.origin
  };
}

// Generate BreadcrumbList schema
function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Generate CollectionPage schema
function generateCollectionPageSchema(data) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": data.name,
    "description": data.description,
    "url": data.url
  };
}

// Insert structured data into page
function insertStructuredData(schema) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get page URL
function getPageUrl() {
  return window.location.href;
}

// Get site URL
function getSiteUrl() {
  return `${window.location.protocol}//${window.location.host}`;
}

