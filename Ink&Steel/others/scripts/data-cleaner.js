/**
 * Data Cleaner
 * Cleans and normalizes mapped data
 */

const { readJSON, writeJSON, generateId, cleanText } = require('./utils');
const path = require('path');

/**
 * Remove duplicates from array based on ID
 */
function removeDuplicates(items, idKey = 'id') {
  const seen = new Set();
  return items.filter(item => {
    const id = item[idKey];
    if (!id || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
}

/**
 * Fill missing fields with defaults or inferred values
 */
function fillMissingFields(pen) {
  // Ensure ID and slug
  if (!pen.id) {
    pen.id = generateId(pen.brand || '', pen.model || '', pen.name || '');
  }
  if (!pen.slug) {
    pen.slug = pen.id;
  }

  // Ensure basic structure
  if (!pen.specifications) pen.specifications = {};
  if (!pen.images) pen.images = { main: null, gallery: [] };
  if (!pen.purchaseLinks) pen.purchaseLinks = [];
  if (!pen.tags) pen.tags = [];
  if (!pen.sources) pen.sources = [];

  // Set defaults
  if (!pen.type) pen.type = "Fountain Pen";
  if (!pen.availability) pen.availability = "Unknown";
  if (!pen.addedDate) pen.addedDate = new Date().toISOString().split('T')[0];
  if (!pen.lastUpdated) pen.lastUpdated = new Date().toISOString().split('T')[0];
  if (pen.verified === undefined) pen.verified = false;

  // Clean text fields
  if (pen.name) pen.name = cleanText(pen.name);
  if (pen.brand) pen.brand = cleanText(pen.brand);
  if (pen.model) pen.model = cleanText(pen.model);
  if (pen.description) pen.description = cleanText(pen.description);

  // Normalize arrays
  if (pen.tags && typeof pen.tags === 'string') {
    pen.tags = pen.tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  if (pen.specifications.material && typeof pen.specifications.material === 'string') {
    pen.specifications.material = [pen.specifications.material];
  }

  return pen;
}

/**
 * Clean ink data
 */
function fillMissingInkFields(ink) {
  // Ensure ID and slug
  if (!ink.id) {
    ink.id = generateId(ink.brand || '', '', ink.name || '');
  }
  if (!ink.slug) {
    ink.slug = ink.id;
  }

  // Ensure basic structure
  if (!ink.properties) ink.properties = {
    sheen: false,
    shimmer: false,
    shading: "low",
    flow: "medium",
    waterResistance: "low"
  };
  if (!ink.purchaseLinks) ink.purchaseLinks = [];
  if (!ink.tags) ink.tags = [];
  if (!ink.sources) ink.sources = [];

  // Set defaults
  if (!ink.type) ink.type = "Dye-based";
  if (!ink.addedDate) ink.addedDate = new Date().toISOString().split('T')[0];
  if (!ink.lastUpdated) ink.lastUpdated = new Date().toISOString().split('T')[0];
  if (ink.verified === undefined) ink.verified = false;

  // Clean text fields
  if (ink.name) ink.name = cleanText(ink.name);
  if (ink.brand) ink.brand = cleanText(ink.brand);
  if (ink.description) ink.description = cleanText(ink.description);

  return ink;
}

/**
 * Validate URL format
 */
function validateURLs(pen) {
  // Validate purchase links
  if (pen.purchaseLinks) {
    pen.purchaseLinks = pen.purchaseLinks.filter(link => {
      if (!link.url) return false;
      try {
        new URL(link.url);
        return true;
      } catch {
        return false;
      }
    });
  }

  // Validate image URLs
  if (pen.images) {
    if (pen.images.main) {
      try {
        new URL(pen.images.main);
      } catch {
        pen.images.main = null;
      }
    }
    if (pen.images.gallery) {
      pen.images.gallery = pen.images.gallery.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
    }
  }

  return pen;
}

/**
 * Clean data file
 */
async function cleanData(inputFile, outputFile) {
  console.log(`Cleaning data from ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const cleaned = {
    pens: [],
    inks: [],
    timestamp: new Date().toISOString(),
    sourceFile: inputFile
  };

  // Clean pens
  if (data.pens && Array.isArray(data.pens)) {
    cleaned.pens = data.pens
      .map(fillMissingFields)
      .map(validateURLs)
      .filter(pen => pen.name && pen.brand); // Must have name and brand
    
    // Remove duplicates
    cleaned.pens = removeDuplicates(cleaned.pens, 'id');
  }

  // Clean inks
  if (data.inks && Array.isArray(data.inks)) {
    cleaned.inks = data.inks
      .map(fillMissingInkFields)
      .filter(ink => ink.name && ink.brand); // Must have name and brand
    
    // Remove duplicates
    cleaned.inks = removeDuplicates(cleaned.inks, 'id');
  }

  // Save cleaned data
  await writeJSON(outputFile, cleaned);

  console.log(`Cleaned ${cleaned.pens.length} pens and ${cleaned.inks.length} inks`);
  console.log(`Saved to: ${outputFile}`);

  return cleaned;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../data/cleaned/mapped-data.json');
  const outputFile = args[1] || path.join(__dirname, '../data/cleaned/cleaned-data.json');

  await cleanData(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanData, fillMissingFields, fillMissingInkFields, removeDuplicates };

