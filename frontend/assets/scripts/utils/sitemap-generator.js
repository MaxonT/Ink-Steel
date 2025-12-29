/**
 * Sitemap Generator
 * Generates a sitemap.xml dynamically based on pen data
 */

async function generateSitemap() {
  const baseUrl = window.location.origin;
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/brands.html', changefreq: 'monthly', priority: '0.8' },
    { url: '/inks.html', changefreq: 'monthly', priority: '0.8' },
    { url: '/compare.html', changefreq: 'monthly', priority: '0.7' },
    { url: '/about.html', changefreq: 'monthly', priority: '0.6' },
    { url: '/blog.html', changefreq: 'weekly', priority: '0.7' },
    { url: '/contact.html', changefreq: 'monthly', priority: '0.5' },
    { url: '/care.html', changefreq: 'monthly', priority: '0.6' }
  ];

  try {
    // Load pens data
    const pensResult = await loadJSONData('data/pens.json');
    const pens = pensResult.success ? (pensResult.data.pens || []) : [];
    
    // Generate sitemap XML
    const urls = [
      ...staticPages.map(page => ({
        ...page,
        url: baseUrl + page.url
      })),
      ...pens.map(pen => ({
        url: `${baseUrl}/pen-detail.html?id=${pen.id}`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: pen.lastUpdated || pen.addedDate
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `  <url>
    <loc>${escapeXml(item.url)}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return null;
  }
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// For server-side generation, you would create a sitemap.xml file
// For client-side, this can be used to generate and download the sitemap

