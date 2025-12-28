/**
 * Data Validator
 * Validates cleaned data using existing validation rules
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');
const fs = require('fs');

// Import validators from frontend (simplified version for Node.js)
function validatePenData(pen) {
  const errors = [];

  if (!pen || typeof pen !== 'object') {
    return { valid: false, errors: ['Pen data must be an object'] };
  }

  if (!pen.id || typeof pen.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!pen.name || typeof pen.name !== 'string') {
    errors.push('Missing or invalid name');
  }

  if (!pen.brand || typeof pen.brand !== 'string') {
    errors.push('Missing or invalid brand');
  }

  if (pen.specifications && typeof pen.specifications !== 'object') {
    errors.push('Specifications must be an object');
  }

  if (pen.images && typeof pen.images !== 'object') {
    errors.push('Images must be an object');
  }

  if (pen.purchaseLinks) {
    if (!Array.isArray(pen.purchaseLinks)) {
      errors.push('PurchaseLinks must be an array');
    } else {
      pen.purchaseLinks.forEach((link, index) => {
        if (!link || typeof link !== 'object') {
          errors.push(`PurchaseLink[${index}] must be an object`);
        }
        if (link.url && typeof link.url !== 'string') {
          errors.push(`PurchaseLink[${index}].url must be a string`);
        }
      });
    }
  }

  if (pen.tags && !Array.isArray(pen.tags)) {
    errors.push('Tags must be an array');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function validateInkData(ink) {
  const errors = [];

  if (!ink || typeof ink !== 'object') {
    return { valid: false, errors: ['Ink data must be an object'] };
  }

  if (!ink.id || typeof ink.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!ink.name || typeof ink.name !== 'string') {
    errors.push('Missing or invalid name');
  }

  if (!ink.brand || typeof ink.brand !== 'string') {
    errors.push('Missing or invalid brand');
  }

  if (ink.properties && typeof ink.properties !== 'object') {
    errors.push('Properties must be an object');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate and enhance data
 */
async function validateData(inputFile, outputFile) {
  console.log(`Validating data from ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const validated = {
    pens: [],
    inks: [],
    validationReport: {
      pens: { total: 0, valid: 0, invalid: 0, errors: [] },
      inks: { total: 0, valid: 0, invalid: 0, errors: [] }
    },
    timestamp: new Date().toISOString()
  };

  // Validate pens
  if (data.pens && Array.isArray(data.pens)) {
    validated.validationReport.pens.total = data.pens.length;

    data.pens.forEach(pen => {
      const validation = validatePenData(pen);
      if (validation.valid) {
        validated.pens.push(pen);
        validated.validationReport.pens.valid++;
      } else {
        validated.validationReport.pens.invalid++;
        validated.validationReport.pens.errors.push({
          id: pen.id || 'unknown',
          name: pen.name || 'unknown',
          errors: validation.errors
        });
      }
    });
  }

  // Validate inks
  if (data.inks && Array.isArray(data.inks)) {
    validated.validationReport.inks.total = data.inks.length;

    data.inks.forEach(ink => {
      const validation = validateInkData(ink);
      if (validation.valid) {
        validated.inks.push(ink);
        validated.validationReport.inks.valid++;
      } else {
        validated.validationReport.inks.invalid++;
        validated.validationReport.inks.errors.push({
          id: ink.id || 'unknown',
          name: ink.name || 'unknown',
          errors: validation.errors
        });
      }
    });
  }

  // Save validated data
  await writeJSON(outputFile, validated);

  // Print report
  console.log('\nValidation Report:');
  console.log(`Pens: ${validated.validationReport.pens.valid}/${validated.validationReport.pens.total} valid`);
  console.log(`Inks: ${validated.validationReport.inks.valid}/${validated.validationReport.inks.total} valid`);
  
  if (validated.validationReport.pens.errors.length > 0) {
    console.log(`\nPen errors: ${validated.validationReport.pens.errors.length}`);
  }
  if (validated.validationReport.inks.errors.length > 0) {
    console.log(`\nInk errors: ${validated.validationReport.inks.errors.length}`);
  }

  console.log(`\nSaved to: ${outputFile}`);

  return validated;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../data/cleaned/cleaned-data.json');
  const outputFile = args[1] || path.join(__dirname, '../data/cleaned/validated-data.json');

  await validateData(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { validateData, validatePenData, validateInkData };

