/**
 * Image Processor
 * Processes image URLs, validates accessibility
 */

const axios = require('axios');
const { readJSON, writeJSON } = require('./utils');
const path = require('path');
const { isValidURL } = require('./utils');

/**
 * Validate image URL accessibility
 */
async function validateImageURL(url, timeout = 10000) {
  if (!isValidURL(url)) {
    return false;
  }

  try {
    const response = await axios.head(url, {
      timeout: timeout,
      validateStatus: (status) => status < 500 // Accept 4xx as valid response (image exists but may be forbidden)
    });
    
    const contentType = response.headers['content-type'] || '';
    return contentType.startsWith('image/') || response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Process images for a pen
 */
async function processPenImages(pen) {
  if (!pen.images) {
    pen.images = { main: null, gallery: [] };
    return pen;
  }

  // Validate main image
  if (pen.images.main) {
    const isValid = await validateImageURL(pen.images.main);
    if (!isValid) {
      console.log(`  Invalid main image for ${pen.name}: ${pen.images.main}`);
      pen.images.main = null;
    }
  }

  // Validate gallery images
  if (pen.images.gallery && Array.isArray(pen.images.gallery)) {
    const validGallery = [];
    for (const url of pen.images.gallery) {
      if (url) {
        const isValid = await validateImageURL(url);
        if (isValid) {
          validGallery.push(url);
        } else {
          console.log(`  Invalid gallery image for ${pen.name}: ${url}`);
        }
      }
    }
    pen.images.gallery = validGallery;
  }

  // Use first gallery image as main if main is missing
  if (!pen.images.main && pen.images.gallery && pen.images.gallery.length > 0) {
    pen.images.main = pen.images.gallery[0];
    pen.images.gallery = pen.images.gallery.slice(1);
  }

  return pen;
}

/**
 * Process images for an ink
 */
async function processInkImages(ink) {
  // Inks typically don't have images, but if they do, process them
  if (ink.images) {
    if (ink.images.main) {
      const isValid = await validateImageURL(ink.images.main);
      if (!isValid) {
        ink.images.main = null;
      }
    }
  }

  return ink;
}

/**
 * Process all images in data file
 */
async function processImages(inputFile, outputFile, options = {}) {
  const { validate = false, batchSize = 10 } = options;

  console.log(`Processing images from ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const processed = {
    pens: [],
    inks: [],
    timestamp: new Date().toISOString()
  };

  // Process pen images
  if (data.pens && Array.isArray(data.pens)) {
    console.log(`Processing ${data.pens.length} pen images...`);
    
    for (let i = 0; i < data.pens.length; i++) {
      const pen = data.pens[i];
      if (i % 10 === 0) {
        console.log(`  Processing pen ${i + 1}/${data.pens.length}...`);
      }

      if (validate) {
        processed.pens.push(await processPenImages(pen));
      } else {
        // Just ensure structure is correct
        if (!pen.images) pen.images = { main: null, gallery: [] };
        processed.pens.push(pen);
      }
    }
  }

  // Process ink images
  if (data.inks && Array.isArray(data.inks)) {
    console.log(`Processing ${data.inks.length} ink images...`);
    
    for (let i = 0; i < data.inks.length; i++) {
      const ink = data.inks[i];
      if (validate) {
        processed.inks.push(await processInkImages(ink));
      } else {
        processed.inks.push(ink);
      }
    }
  }

  // Save processed data
  await writeJSON(outputFile, processed);

  console.log(`Processed ${processed.pens.length} pens and ${processed.inks.length} inks`);
  console.log(`Saved to: ${outputFile}`);

  return processed;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../data/cleaned/validated-data.json');
  const outputFile = args[1] || path.join(__dirname, '../data/cleaned/processed-data.json');
  const validate = args.includes('--validate');

  await processImages(inputFile, outputFile, { validate });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processImages, validateImageURL, processPenImages, processInkImages };

