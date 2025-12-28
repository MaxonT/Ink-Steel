/**
 * Update Images in Data
 * Updates pens.json with new images, preserving existing good images
 */

const { readJSON, writeJSON } = require('./utils');
const { generateImageSet } = require('./image-placeholder');
const path = require('path');

/**
 * Check if image is a placeholder
 */
function isPlaceholder(url) {
  if (!url) return true;
  return url.includes('placeholder.com') || 
         url.includes('dummyimage.com') ||
         url.includes('via.placeholder');
}

/**
 * Check if image URL is valid and not placeholder
 */
function hasGoodImage(pen) {
  const mainImage = pen.images?.main;
  return mainImage && !isPlaceholder(mainImage);
}

/**
 * Update images in pens data
 */
async function updateImagesInData(inputFile, outputFile) {
  console.log(`Updating images in ${inputFile}...`);

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
    kept: 0
  };

  for (let i = 0; i < pens.length; i++) {
    const pen = pens[i];
    
    // If pen already has a good image (not placeholder), keep it
    if (hasGoodImage(pen)) {
      updatedPens.push(pen);
      stats.kept++;
      continue;
    }

    // Generate new placeholder images
    const images = generateImageSet(pen);
    updatedPens.push({
      ...pen,
      images: {
        ...(pen.images || {}),
        main: images.main,
        gallery: images.gallery
      }
    });
    stats.updated++;
  }

  // Save updated data
  await writeJSON(outputFile, { pens: updatedPens });

  console.log(`\nUpdate completed:`);
  console.log(`  Total: ${stats.total}`);
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Kept existing: ${stats.kept}`);
  console.log(`  Saved to: ${outputFile}`);

  return { pens: updatedPens };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || inputFile; // Default to overwriting input

  await updateImagesInData(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateImagesInData, isPlaceholder, hasGoodImage };

