/**
 * Validate All Images
 * Validates image URLs in pens.json (simplified version, skip actual HTTP checks for placeholders)
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');

/**
 * Validate image URL format (quick check, doesn't actually fetch)
 */
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate all images in data file
 */
async function validateAllImages(inputFile, outputFile) {
  console.log(`Validating images in ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const { pens = [] } = data;
  const stats = {
    total: pens.length,
    validMainImages: 0,
    invalidMainImages: 0,
    validGalleryImages: 0,
    invalidGalleryImages: 0
  };

  const validatedPens = pens.map(pen => {
    const images = pen.images || {};
    
    // Validate main image
    const mainImage = images.main;
    if (isValidImageUrl(mainImage)) {
      stats.validMainImages++;
    } else {
      stats.invalidMainImages++;
      // Set to null if invalid
      images.main = null;
    }

    // Validate gallery images
    if (images.gallery && Array.isArray(images.gallery)) {
      images.gallery = images.gallery.filter(url => {
        if (isValidImageUrl(url)) {
          stats.validGalleryImages++;
          return true;
        } else {
          stats.invalidGalleryImages++;
          return false;
        }
      });
    }

    return {
      ...pen,
      images: {
        ...images,
        gallery: images.gallery || []
      }
    };
  });

  // Save validated data
  await writeJSON(outputFile, { pens: validatedPens });

  console.log(`\nValidation completed:`);
  console.log(`  Total pens: ${stats.total}`);
  console.log(`  Valid main images: ${stats.validMainImages}`);
  console.log(`  Invalid main images: ${stats.invalidMainImages}`);
  console.log(`  Valid gallery images: ${stats.validGalleryImages}`);
  console.log(`  Invalid gallery images: ${stats.invalidGalleryImages}`);
  console.log(`  Saved to: ${outputFile}`);

  return { pens: validatedPens, stats };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || inputFile;

  await validateAllImages(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { validateAllImages, isValidImageUrl };

