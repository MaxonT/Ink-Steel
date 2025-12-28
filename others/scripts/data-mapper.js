/**
 * Data Mapper
 * Converts scraped data from various sources to unified format
 */

const { readJSON, writeJSON, generateId, cleanText, extractPrice } = require('./utils');
const path = require('path');

/**
 * Map scraped data to unified pen format
 */
function mapToPenFormat(rawData, sourceId) {
  const pen = {
    id: null,
    slug: null,
    brand: null,
    model: null,
    name: null,
    type: "Fountain Pen",
    description: null,
    specifications: {},
    images: {
      main: null,
      gallery: []
    },
    purchaseLinks: [],
    tags: [],
    addedDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    sources: [sourceId],
    verified: false
  };

  // Map basic fields
  if (rawData.brand) {
    pen.brand = cleanText(rawData.brand);
  }
  if (rawData.model) {
    pen.model = cleanText(rawData.model);
  }
  if (rawData.name) {
    pen.name = cleanText(rawData.name);
  } else if (rawData.title) {
    pen.name = cleanText(rawData.title);
  }
  if (rawData.description) {
    pen.description = cleanText(rawData.description);
  }

  // Generate ID and slug
  const idParts = [pen.brand, pen.model, pen.name].filter(Boolean);
  if (idParts.length > 0) {
    pen.id = generateId(pen.brand || '', pen.model || '', pen.name || '');
    pen.slug = pen.id;
  } else {
    // Fallback ID generation
    pen.id = `pen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    pen.slug = pen.id;
  }

  // Map price to purchase links
  if (rawData.price || rawData.url) {
    pen.purchaseLinks.push({
      name: sourceId,
      url: rawData.url || '',
      price: rawData.price || null,
      currency: "USD",
      region: "US",
      availability: "Unknown",
      lastChecked: new Date().toISOString().split('T')[0]
    });
  }

  // Map images
  if (rawData.images && Array.isArray(rawData.images) && rawData.images.length > 0) {
    pen.images.main = rawData.images[0];
    pen.images.gallery = rawData.images.slice(1);
  } else if (rawData.image) {
    pen.images.main = rawData.image;
  }

  // Map specifications if available
  if (rawData.specifications) {
    const specs = rawData.specifications;
    if (specs.length) pen.specifications.length = parseFloat(specs.length);
    if (specs.weight) pen.specifications.weight = parseFloat(specs.weight);
    if (specs.material) pen.specifications.material = Array.isArray(specs.material) ? specs.material : [specs.material];
    if (specs.fillingSystem) pen.specifications.fillingSystem = specs.fillingSystem;
    if (specs.nib) pen.specifications.nib = specs.nib;
  }

  // Add tags based on data
  if (pen.brand) {
    pen.tags.push(pen.brand.toLowerCase());
  }
  if (rawData.price) {
    if (rawData.price < 50) pen.tags.push('entry-level');
    else if (rawData.price < 200) pen.tags.push('mid-range');
    else pen.tags.push('luxury');
  }

  return pen;
}

/**
 * Map scraped data to unified ink format
 */
function mapToInkFormat(rawData, sourceId) {
  const ink = {
    id: null,
    slug: null,
    brand: null,
    name: null,
    description: null,
    color: null,
    type: "Dye-based",
    volume: null,
    properties: {
      sheen: false,
      shimmer: false,
      shading: "low",
      flow: "medium",
      waterResistance: "low"
    },
    purchaseLinks: [],
    tags: [],
    addedDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    sources: [sourceId],
    verified: false
  };

  // Map basic fields
  if (rawData.brand) {
    ink.brand = cleanText(rawData.brand);
  }
  if (rawData.name) {
    ink.name = cleanText(rawData.name);
  } else if (rawData.title) {
    ink.name = cleanText(rawData.title);
  }
  if (rawData.description) {
    ink.description = cleanText(rawData.description);
  }

  // Generate ID and slug
  const idParts = [ink.brand, ink.name].filter(Boolean);
  if (idParts.length > 0) {
    ink.id = generateId(ink.brand || '', '', ink.name || '');
    ink.slug = ink.id;
  } else {
    ink.id = `ink-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    ink.slug = ink.id;
  }

  // Map price to purchase links
  if (rawData.price || rawData.url) {
    ink.purchaseLinks.push({
      name: sourceId,
      url: rawData.url || '',
      price: rawData.price || null,
      currency: "USD",
      region: "US",
      availability: "Unknown",
      lastChecked: new Date().toISOString().split('T')[0]
    });
  }

  // Map color if available
  if (rawData.color) {
    ink.color = rawData.color;
  }

  // Add tags
  if (ink.brand) {
    ink.tags.push(ink.brand.toLowerCase());
  }
  if (ink.color) {
    // Extract color category from hex or name
    ink.tags.push('colored');
  }

  return ink;
}

/**
 * Map raw scraped data to unified format
 */
async function mapRawData(inputFile, outputFile) {
  console.log(`Mapping data from ${inputFile}...`);

  const rawData = await readJSON(inputFile);
  if (!rawData) {
    console.error('Failed to read input file');
    return;
  }

  const mapped = {
    pens: [],
    inks: [],
    timestamp: new Date().toISOString(),
    sourceFile: inputFile
  };

  // Map pens
  if (rawData.pens && Array.isArray(rawData.pens)) {
    mapped.pens = rawData.pens
      .filter(item => item && (item.name || item.title))
      .map(item => mapToPenFormat(item, item.source || 'unknown'));
  }

  // Map inks
  if (rawData.inks && Array.isArray(rawData.inks)) {
    mapped.inks = rawData.inks
      .filter(item => item && (item.name || item.title))
      .map(item => mapToInkFormat(item, item.source || 'unknown'));
  }

  // Save mapped data
  await writeJSON(outputFile, mapped);

  console.log(`Mapped ${mapped.pens.length} pens and ${mapped.inks.length} inks`);
  console.log(`Saved to: ${outputFile}`);

  return mapped;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../data/raw/scraped-data-latest.json');
  const outputFile = args[1] || path.join(__dirname, '../data/cleaned/mapped-data.json');

  await mapRawData(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { mapToPenFormat, mapToInkFormat, mapRawData };

