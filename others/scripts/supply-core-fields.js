/**
 * Supply Core Fields
 * Ensures all pens have complete core fields (description, details, etc.)
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');

/**
 * Generate description if missing
 */
function generateDescription(pen) {
  if (pen.description && pen.description.length >= 50) {
    return pen.description;
  }

  const brand = pen.brand || '';
  const model = pen.model || '';
  const type = pen.type || 'Fountain Pen';
  
  return `${brand} ${model} ${type}`.trim() + '. A quality writing instrument known for its craftsmanship and performance.';
}

/**
 * Generate details if missing
 */
function generateDetails(pen) {
  if (pen.details && pen.details.length >= 100) {
    return pen.details;
  }

  const brand = pen.brand || '';
  const model = pen.model || '';
  const series = pen.series || '';
  const country = pen.country || '';
  const specs = pen.specifications || {};
  const nib = specs.nib || {};
  
  let details = '';
  
  if (series) {
    details += `Part of the ${series} series, `;
  }
  
  details += `the ${brand} ${model} `;
  
  if (country) {
    details += `represents ${country} penmaking tradition. `;
  }
  
  if (nib.type) {
    details += `It features a ${nib.type} nib `;
    if (nib.sizes && nib.sizes.length > 0) {
      details += `available in ${nib.sizes.join(', ')} sizes. `;
    }
  }
  
  if (specs.fillingSystem) {
    details += `The pen uses a ${specs.fillingSystem.toLowerCase()} filling system`;
    if (specs.capacity) {
      details += ` with a capacity of ${specs.capacity}ml`;
    }
    details += '. ';
  }
  
  if (details.length < 100) {
    details += 'This pen combines traditional craftsmanship with modern engineering, offering a reliable and enjoyable writing experience.';
  }
  
  return details.trim();
}

/**
 * Ensure core fields are present and meet minimum requirements
 */
function ensureCoreFields(pen) {
  const updated = { ...pen };

  // Ensure description (minimum 50 characters)
  if (!updated.description || updated.description.length < 50) {
    updated.description = generateDescription(pen);
  }

  // Ensure details (minimum 100 characters)
  if (!updated.details || updated.details.length < 100) {
    updated.details = generateDetails(pen);
  }

  // Ensure name
  if (!updated.name) {
    updated.name = `${pen.brand || ''} ${pen.model || ''}`.trim() || pen.id;
  }

  // Ensure brand
  if (!updated.brand) {
    // Try to extract from name
    const nameParts = (updated.name || '').split(' ');
    updated.brand = nameParts[0] || 'Unknown';
  }

  // Ensure type
  if (!updated.type) {
    updated.type = 'Fountain Pen';
  }

  // Ensure specifications object exists
  if (!updated.specifications) {
    updated.specifications = {};
  }

  // Ensure images object exists
  if (!updated.images) {
    updated.images = {
      main: null,
      gallery: []
    };
  }

  // Ensure purchaseLinks array exists
  if (!updated.purchaseLinks) {
    updated.purchaseLinks = [];
  }

  // Ensure tags array exists
  if (!updated.tags) {
    updated.tags = [];
  }

  // Add basic tags if missing
  if (updated.tags.length === 0) {
    if (updated.brand) {
      updated.tags.push(updated.brand.toLowerCase());
    }
    if (updated.type) {
      updated.tags.push(updated.type.toLowerCase().replace(/\s+/g, '-'));
    }
  }

  // Ensure dates
  if (!updated.addedDate) {
    updated.addedDate = new Date().toISOString().split('T')[0];
  }
  updated.lastUpdated = new Date().toISOString().split('T')[0];

  return updated;
}

/**
 * Batch supply core fields
 */
async function batchSupplyCoreFields(inputFile, outputFile, options = {}) {
  const { priorityOnly = true } = options;

  console.log(`Supplying core fields in ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const { pens = [] } = data;
  const updatedPens = [];
  const stats = {
    total: pens.length,
    updated: 0,
    hadCompleteFields: 0,
    fieldsAdded: {
      description: 0,
      details: 0,
      other: 0
    }
  };

  // If priority only, process first 30 pens completely, others basic
  const priorityCount = priorityOnly ? 30 : pens.length;

  for (let i = 0; i < pens.length; i++) {
    const pen = pens[i];
    const isPriority = i < priorityCount;
    
    // Check if pen already has complete fields
    const hasDescription = pen.description && pen.description.length >= 50;
    const hasDetails = pen.details && pen.details.length >= 100;
    const hasCompleteFields = hasDescription && hasDetails && pen.brand && pen.name;
    
    if (hasCompleteFields && isPriority) {
      updatedPens.push(pen);
      stats.hadCompleteFields++;
      continue;
    }

    // Update pen with core fields
    const updatedPen = ensureCoreFields(pen);
    
    // Track what was added
    if (!hasDescription && updatedPen.description) {
      stats.fieldsAdded.description++;
    }
    if (!hasDetails && updatedPen.details) {
      stats.fieldsAdded.details++;
    }
    if (!hasCompleteFields) {
      stats.fieldsAdded.other++;
    }
    
    updatedPens.push(updatedPen);
    stats.updated++;
  }

  // Save updated data
  await writeJSON(outputFile, { pens: updatedPens });

  console.log(`\nCore fields supply completed:`);
  console.log(`  Total pens: ${stats.total}`);
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Had complete fields: ${stats.hadCompleteFields}`);
  console.log(`  Fields added:`);
  console.log(`    Descriptions: ${stats.fieldsAdded.description}`);
  console.log(`    Details: ${stats.fieldsAdded.details}`);
  console.log(`    Other fields: ${stats.fieldsAdded.other}`);
  console.log(`  Saved to: ${outputFile}`);

  return { pens: updatedPens, stats };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || inputFile;
  const priorityOnly = !args.includes('--all');

  await batchSupplyCoreFields(inputFile, outputFile, { priorityOnly });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ensureCoreFields, generateDescription, generateDetails, batchSupplyCoreFields };

