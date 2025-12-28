/**
 * Image Placeholder Generator
 * Generates professional placeholder images for products
 */

/**
 * Generate placeholder image with brand and model text
 */
function generatePlaceholder(brand, model, name, width = 800, height = 600) {
  // Option 1: Using placeholder.pics (supports SVG with text)
  const text = `${brand} ${model || name || ''}`.trim().replace(/\s+/g, ' ');
  const encodedText = encodeURIComponent(text);
  return `https://placeholder.pics/svg/${width}x${height}/F9F5F0/1A365D/${encodedText}`;
}

/**
 * Generate using dummyimage.com (better for production)
 */
function generateDummyImage(brand, model, name, width = 800, height = 600) {
  const text = `${brand} ${model || name || ''}`.trim().replace(/\s+/g, '+');
  const bgColor = 'F9F5F0'; // Background color matching site theme
  const textColor = '1A365D'; // Text color (primary color)
  return `https://dummyimage.com/${width}x${height}/${bgColor}/${textColor}.png&text=${encodeURIComponent(text)}`;
}

/**
 * Generate using via.placeholder.com with better styling
 */
function generateViaPlaceholder(brand, model, name, width = 800, height = 600) {
  const text = `${brand} ${model || name || ''}`.trim();
  const bgColor = 'F9F5F0';
  const textColor = '1A365D';
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate full image set for a pen
 */
function generateImageSet(pen) {
  const brand = pen.brand || '';
  const model = pen.model || '';
  const name = pen.name || '';
  
  // Use dummyimage.com for better quality
  const mainImage = generateDummyImage(brand, model, name, 800, 600);
  
  // Generate gallery images with different text
  const galleryImages = [
    generateDummyImage(brand, `${model} Side View`, name, 800, 600),
    generateDummyImage(brand, `${model} Nib Detail`, name, 800, 600),
    generateDummyImage(brand, `${model} Close-up`, name, 800, 600)
  ];

  return {
    main: mainImage,
    gallery: galleryImages.filter(img => img) // Remove any null/undefined
  };
}

/**
 * Batch generate placeholders for pens
 */
async function batchGeneratePlaceholders(pens) {
  return pens.map(pen => {
    const images = generateImageSet(pen);
    return {
      ...pen,
      images: {
        ...pen.images,
        main: images.main,
        gallery: images.gallery
      }
    };
  });
}

module.exports = {
  generatePlaceholder,
  generateDummyImage,
  generateViaPlaceholder,
  generateImageSet,
  batchGeneratePlaceholders
};

