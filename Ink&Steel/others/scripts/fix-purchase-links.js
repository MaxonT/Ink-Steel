/**
 * Fix Purchase Links
 * Fixes and adds purchase links for pens, especially for popular brands/models
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');

/**
 * Known retailers and their search URL patterns
 */
const RETAILERS = {
  goulet: {
    name: 'Goulet Pens',
    baseUrl: 'https://www.gouletpens.com',
    searchUrl: 'https://www.gouletpens.com/search?q=',
    region: 'US'
  },
  jetpens: {
    name: 'JetPens',
    baseUrl: 'https://www.jetpens.com',
    searchUrl: 'https://www.jetpens.com/search?q=',
    region: 'US'
  },
  amazon: {
    name: 'Amazon',
    baseUrl: 'https://www.amazon.com',
    searchUrl: 'https://www.amazon.com/s?k=',
    region: 'US'
  },
  amazonJP: {
    name: 'Amazon Japan',
    baseUrl: 'https://www.amazon.co.jp',
    searchUrl: 'https://www.amazon.co.jp/s?k=',
    region: 'JP'
  }
};

/**
 * Generate search URL for a pen
 */
function generateSearchUrl(pen, retailer) {
  const brand = pen.brand || '';
  const model = pen.model || '';
  const name = pen.name || '';
  
  // Create search query
  const query = encodeURIComponent(`${brand} ${model}`.trim() || name);
  return retailer.searchUrl + query;
}

/**
 * Known pen purchase links (curated list for popular models)
 */
const KNOWN_LINKS = {
  'pelikan-m800': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/pelikan-m800-fountain-pen',
      price: 450,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'pilot-custom-74': [
    {
      name: 'JetPens',
      url: 'https://www.jetpens.com/Pilot-Custom-74-Fountain-Pen',
      price: 160,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    },
    {
      name: 'Amazon Japan',
      url: 'https://www.amazon.co.jp/dp/B00XXXXXX',
      price: 18000,
      currency: 'JPY',
      region: 'JP',
      availability: 'In Stock'
    }
  ],
  'lamy-2000': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/lamy-2000-fountain-pen',
      price: 200,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'pilot-custom-823': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/pilot-custom-823-fountain-pen',
      price: 288,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'sailor-1911-large': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/sailor-1911-large-fountain-pen',
      price: 312,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'platinum-3776-century': [
    {
      name: 'JetPens',
      url: 'https://www.jetpens.com/Platinum-3776-Century-Fountain-Pen',
      price: 176,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'twsbi-diamond-580': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/twsbi-diamond-580-fountain-pen',
      price: 65,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'lamy-safari': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/lamy-safari-fountain-pen',
      price: 29,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'pilot-metropolitan': [
    {
      name: 'JetPens',
      url: 'https://www.jetpens.com/Pilot-Metropolitan-Fountain-Pen',
      price: 20,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'pilot-vanishing-point': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/pilot-vanishing-point-fountain-pen',
      price: 156,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'montblanc-149': [
    {
      name: 'Montblanc Boutique',
      url: 'https://www.montblanc.com/en-us/fountain-pens',
      price: 1050,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'waterman-expert': [
    {
      name: 'Amazon',
      url: 'https://www.amazon.com/s?k=waterman+expert+fountain+pen',
      price: 85,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'kaweco-sport': [
    {
      name: 'Goulet Pens',
      url: 'https://www.gouletpens.com/products/kaweco-sport-fountain-pen',
      price: 28,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ],
  'parker-sonnet': [
    {
      name: 'Amazon',
      url: 'https://www.amazon.com/s?k=parker+sonnet+fountain+pen',
      price: 120,
      currency: 'USD',
      region: 'US',
      availability: 'In Stock'
    }
  ]
};

/**
 * Fix purchase links for a pen
 */
function fixPenLinks(pen) {
  // Check if we have known links for this pen
  const knownLinks = KNOWN_LINKS[pen.id] || KNOWN_LINKS[pen.slug];
  
  if (knownLinks) {
    // Use known links
    return {
      ...pen,
      purchaseLinks: knownLinks.map(link => ({
        ...link,
        lastChecked: new Date().toISOString().split('T')[0]
      }))
    };
  }

  // Check existing links
  const existingLinks = pen.purchaseLinks || [];
  const validLinks = existingLinks.filter(link => {
    const url = link.url || '';
    // Remove placeholder and example links
    return url && 
           !url.includes('example.com') && 
           !url.includes('placeholder') &&
           url.startsWith('http');
  });

  // If no valid links, generate search URLs for major retailers
  if (validLinks.length === 0) {
    const brand = pen.brand || '';
    const isJapaneseBrand = ['Pilot', 'Sailor', 'Platinum'].includes(brand);
    
    const generatedLinks = [];
    
    // Always add Goulet Pens for US brands
    if (brand && !isJapaneseBrand) {
      generatedLinks.push({
        name: RETAILERS.goulet.name,
        url: generateSearchUrl(pen, RETAILERS.goulet),
        currency: 'USD',
        region: 'US',
        availability: 'Unknown',
        lastChecked: new Date().toISOString().split('T')[0]
      });
    }
    
    // Add JetPens for Japanese brands or as alternative
    if (isJapaneseBrand || brand) {
      generatedLinks.push({
        name: RETAILERS.jetpens.name,
        url: generateSearchUrl(pen, RETAILERS.jetpens),
        currency: 'USD',
        region: 'US',
        availability: 'Unknown',
        lastChecked: new Date().toISOString().split('T')[0]
      });
    }

    return {
      ...pen,
      purchaseLinks: generatedLinks
    };
  }

  // Return pen with existing valid links
  return {
    ...pen,
    purchaseLinks: validLinks
  };
}

/**
 * Batch fix purchase links
 */
async function batchFixLinks(inputFile, outputFile, options = {}) {
  const { fixAll = false, priorityOnly = true } = options;

  console.log(`Fixing purchase links in ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const { pens = [] } = data;
  const fixedPens = [];
  const stats = {
    total: pens.length,
    fixed: 0,
    hadLinks: 0,
    generatedLinks: 0
  };

  // If priority only, fix first 30 pens
  const pensToFix = priorityOnly ? pens.slice(0, 30) : pens;

  for (let i = 0; i < pens.length; i++) {
    const pen = pens[i];
    const shouldFix = i < pensToFix.length;

    if (shouldFix) {
      const fixedPen = fixPenLinks(pen);
      
      // Check if links were added/generated
      const hadLinksBefore = (pen.purchaseLinks || []).length > 0;
      const hasLinksAfter = (fixedPen.purchaseLinks || []).length > 0;
      
      if (hadLinksBefore) {
        stats.hadLinks++;
      }
      if (hasLinksAfter && !hadLinksBefore) {
        stats.generatedLinks++;
      }
      if (JSON.stringify(pen.purchaseLinks) !== JSON.stringify(fixedPen.purchaseLinks)) {
        stats.fixed++;
      }

      fixedPens.push(fixedPen);
    } else {
      fixedPens.push(pen);
    }
  }

  // Save fixed data
  await writeJSON(outputFile, { pens: fixedPens });

  console.log(`\nFix completed:`);
  console.log(`  Total pens: ${stats.total}`);
  console.log(`  Fixed: ${stats.fixed}`);
  console.log(`  Generated new links: ${stats.generatedLinks}`);
  console.log(`  Had existing links: ${stats.hadLinks}`);
  console.log(`  Saved to: ${outputFile}`);

  return { pens: fixedPens, stats };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || inputFile;
  const fixAll = args.includes('--all');
  const priorityOnly = !fixAll;

  await batchFixLinks(inputFile, outputFile, { fixAll, priorityOnly });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixPenLinks, batchFixLinks, KNOWN_LINKS, RETAILERS };

