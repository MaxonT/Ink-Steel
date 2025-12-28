/**
 * Standardize Link Format
 * Standardizes purchase link formats and adds missing fields
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');

/**
 * Standardize a single purchase link
 */
function standardizeLink(link, pen) {
  const standardized = {
    name: link.name || 'Unknown Retailer',
    url: link.url || '',
    currency: link.currency || 'USD',
    region: link.region || 'US',
    availability: link.availability || 'Unknown',
    lastChecked: link.lastChecked || new Date().toISOString().split('T')[0]
  };

  // Add price if available
  if (link.price !== undefined && link.price !== null) {
    standardized.price = typeof link.price === 'number' ? link.price : parseFloat(link.price);
  }

  // Determine link type based on URL or name
  const url = standardized.url.toLowerCase();
  const name = standardized.name.toLowerCase();
  
  if (name.includes('goulet') || url.includes('gouletpens.com')) {
    standardized.type = 'retailer';
  } else if (name.includes('jetpens') || url.includes('jetpens.com')) {
    standardized.type = 'retailer';
  } else if (name.includes('amazon') || url.includes('amazon.')) {
    standardized.type = 'marketplace';
  } else if (name.includes('official') || name.includes('boutique') || url.includes(pen.brand?.toLowerCase() || '')) {
    standardized.type = 'official';
  } else {
    standardized.type = 'other';
  }

  return standardized;
}

/**
 * Standardize purchase links for a pen
 */
function standardizePenLinks(pen) {
  const purchaseLinks = pen.purchaseLinks || [];
  
  if (purchaseLinks.length === 0) {
    return pen;
  }

  const standardizedLinks = purchaseLinks
    .filter(link => link.url && typeof link.url === 'string' && link.url.startsWith('http'))
    .map(link => standardizeLink(link, pen));

  return {
    ...pen,
    purchaseLinks: standardizedLinks
  };
}

/**
 * Batch standardize links
 */
async function batchStandardizeLinks(inputFile, outputFile) {
  console.log(`Standardizing purchase links in ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const { pens = [] } = data;
  const standardizedPens = pens.map(pen => standardizePenLinks(pen));

  // Save standardized data
  await writeJSON(outputFile, { pens: standardizedPens });

  console.log(`\nStandardization completed:`);
  console.log(`  Total pens: ${standardizedPens.length}`);
  console.log(`  Saved to: ${outputFile}`);

  // Generate statistics
  const stats = {
    totalPens: standardizedPens.length,
    pensWithLinks: 0,
    totalLinks: 0,
    linkTypes: {
      retailer: 0,
      marketplace: 0,
      official: 0,
      other: 0
    }
  };

  standardizedPens.forEach(pen => {
    const links = pen.purchaseLinks || [];
    if (links.length > 0) {
      stats.pensWithLinks++;
      stats.totalLinks += links.length;
      
      links.forEach(link => {
        const type = link.type || 'other';
        if (stats.linkTypes[type] !== undefined) {
          stats.linkTypes[type]++;
        }
      });
    }
  });

  console.log(`\nStatistics:`);
  console.log(`  Pens with links: ${stats.pensWithLinks}`);
  console.log(`  Total links: ${stats.totalLinks}`);
  console.log(`  Link types:`);
  console.log(`    Retailer: ${stats.linkTypes.retailer}`);
  console.log(`    Marketplace: ${stats.linkTypes.marketplace}`);
  console.log(`    Official: ${stats.linkTypes.official}`);
  console.log(`    Other: ${stats.linkTypes.other}`);

  return { pens: standardizedPens, stats };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || inputFile;

  await batchStandardizeLinks(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { standardizeLink, standardizePenLinks, batchStandardizeLinks };

