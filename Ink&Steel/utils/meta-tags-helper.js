/**
 * Helper function to update meta tags for any page
 */
function updateMetaTags(metaData) {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    keywords
  } = metaData;
  
  // Update title
  if (title) {
    document.title = title;
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('name', 'twitter:title', title);
  }
  
  // Update description
  if (description) {
    updateMetaTag('name', 'description', description);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('name', 'twitter:description', description);
  }
  
  // Update image
  if (image) {
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('name', 'twitter:image', image);
  }
  
  // Update URL
  if (url) {
    updateMetaTag('property', 'og:url', url);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = url;
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }
  }
  
  // Update type
  if (type) {
    updateMetaTag('property', 'og:type', type);
  }
  
  // Update keywords
  if (keywords) {
    updateMetaTag('name', 'keywords', keywords);
  }
}

function updateMetaTag(attr, value, content) {
  let meta = document.querySelector(`meta[${attr}="${value}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    if (attr === 'property') {
      meta.setAttribute('property', value);
    } else {
      meta.setAttribute('name', value);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

