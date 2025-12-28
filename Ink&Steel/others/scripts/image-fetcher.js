/**
 * Image Fetcher
 * Fetches images for pens using various methods (API, placeholder services)
 */

const axios = require('axios');
const { readJSON, writeJSON, sleep } = require('./utils');
const path = require('path');

/**
 * Generate professional placeholder image URL
 * Using placeholder.pics service for better quality placeholders
 */
function generatePlaceholderImage(brand, model, width = 800, height = 600) {
  const text = encodeURIComponent(`${brand} ${model}`);
  // Using placeholder.pics service which supports text
  return `https://placeholder.pics/svg/${width}x${height}/F9F5F0/1A365D/${text}`;
}

/**
 * Generate Unsplash image search URL
 * Note: Requires Unsplash API key for production use
 */
function getUnsplashImageUrl(query, width = 800, height = 600) {
  // For now, use Unsplash Source API (no key required, but limited)
  const searchQuery = encodeURIComponent(query);
  return `https://source.unsplash.com/${width}x${height}/?${searchQuery}`;
}

/**
 * Generate better placeholder using dummyimage.com
 */
function generateDummyImage(brand, model, width = 800, height = 600) {
  const text = encodeURIComponent(`${brand} ${model || ''}`.trim());
  const bgColor = 'F9F5F0';
  const textColor = '1A365D';
  return `https://dummyimage.com/${width}x${height}/${bgColor}/${textColor}.png&text=${text}`;
}

/**
 * Get image for a pen using best available method
 */
async function getImageForPen(pen, options = {}) {
  const {
    preferRealImages = true,
    useUnsplash = false,
    unsplashApiKey = null
  } = options;

  const brand = pen.brand || '';
  const model = pen.model || '';
  const name = pen.name || '';
  
  // Try to find image using search query
  const searchQueries = [
    `${brand} ${model} fountain pen`,
    `${brand} ${name}`,
    `${brand} pen`,
    `${model} pen`
  ].filter(q => q.trim().length > 0);

  // For now, use professional placeholder
  // In production, you could:
  // 1. Use Unsplash API with API key
  // 2. Use Pexels API
  // 3. Use Bing Image Search API
  // 4. Manual image collection

  // Using dummyimage.com for better placeholders with text
  const mainImage = generateDummyImage(brand, model);
  
  // Generate gallery images (different angles/views)
  const galleryImages = [
    generateDummyImage(brand, `${model} side`),
    generateDummyImage(brand, `${model} nib`),
    generateDummyImage(brand, `${model} detail`)
  ];

  return {
    main: mainImage,
    gallery: galleryImages
  };
}

/**
 * Batch update images for all pens
 */
async function batchUpdateImages(inputFile, outputFile, options = {}) {
  console.log(`Updating images from ${inputFile}...`);

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
    skipped: 0
  };

  console.log(`Processing ${pens.length} pens...`);

  for (let i = 0; i < pens.length; i++) {
    const pen = pens[i];
    
    // Skip if already has good image (not placeholder)
    const currentMainImage = pen.images?.main || '';
    if (currentMainImage && !currentMainImage.includes('placeholder.com') && !currentMainImage.includes('dummyimage')) {
      console.log(`  [${i + 1}/${pens.length}] Skipping ${pen.name} (already has image)`);
      updatedPens.push(pen);
      stats.skipped++;
      continue;
    }

    console.log(`  [${i + 1}/${pens.length}] Updating image for ${pen.name || pen.id}...`);
    
    try {
      const images = await getImageForPen(pen, options);
      
      updatedPens.push({
        ...pen,
        images: {
          ...pen.images,
          main: images.main,
          gallery: images.gallery
        }
      });
      
      stats.updated++;
      
      // Rate limiting
      await sleep(100);
    } catch (error) {
      console.error(`    Error updating image for ${pen.name}:`, error.message);
      updatedPens.push(pen); // Keep original if error
    }
  }

  // Save updated data
  const outputData = {
    ...data,
    pens: updatedPens
  };

  await writeJSON(outputFile, outputData);

  console.log(`\nImage update completed:`);
  console.log(`  Total: ${stats.total}`);
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Saved to: ${outputFile}`);

  return outputData;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || path.join(__dirname, '../data/temp/pens-with-images.json');
  
  // Create temp directory if it doesn't exist
  const fs = require('fs');
  const tempDir = path.dirname(outputFile);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  await batchUpdateImages(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getImageForPen,
  batchUpdateImages,
  generatePlaceholderImage,
  generateDummyImage,
  getUnsplashImageUrl
};

