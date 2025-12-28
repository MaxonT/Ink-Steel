/**
 * Generate Sample Data
 * Creates sample data for testing the pipeline without actual web scraping
 */

const { writeJSON, generateId } = require('./utils');
const path = require('path');

/**
 * Generate sample pen data
 */
function generateSamplePens(count = 20) {
  const brands = ['Pilot', 'Pelikan', 'Lamy', 'Sailor', 'Platinum', 'Montblanc', 'Waterman', 'Parker', 'TWSBI', 'Kaweco'];
  const models = ['Custom', 'M800', '2000', '1911', '3776', '149', 'Expert', 'Sonnet', 'Diamond 580', 'Sport'];
  const types = ['Fountain Pen', 'Fountain Pen', 'Fountain Pen'];
  const fillingSystems = ['Converter', 'Piston', 'Cartridge', 'Vacuum'];
  
  const pens = [];
  
  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const name = `${brand} ${model}`;
    const id = generateId(brand, model, name);
    
    pens.push({
      id: id,
      slug: id,
      brand: brand,
      model: model,
      name: name,
      type: types[Math.floor(Math.random() * types.length)],
      country: ['Japan', 'Germany', 'France', 'Taiwan'][Math.floor(Math.random() * 4)],
      description: `A classic ${brand} ${model} fountain pen`,
      details: `The ${name} represents ${brand}'s commitment to quality and craftsmanship.`,
      specifications: {
        length: 130 + Math.floor(Math.random() * 30),
        lengthCapped: 130 + Math.floor(Math.random() * 30),
        lengthUncapped: 115 + Math.floor(Math.random() * 25),
        weight: 15 + Math.floor(Math.random() * 25),
        diameter: 10 + Math.floor(Math.random() * 5),
        material: ['Resin', 'Metal'][Math.floor(Math.random() * 2)],
        fillingSystem: fillingSystems[Math.floor(Math.random() * fillingSystems.length)],
        capacity: (0.5 + Math.random() * 1.5).toFixed(2),
        nib: {
          type: ['Steel', '14K Gold', '18K Gold'][Math.floor(Math.random() * 3)],
          sizes: ['F', 'M', 'B'],
          default: 'M'
        }
      },
      images: {
        main: `https://via.placeholder.com/800x600?text=${encodeURIComponent(name)}`,
        gallery: []
      },
      purchaseLinks: [{
        name: 'Sample Store',
        url: `https://example.com/products/${id}`,
        price: 50 + Math.floor(Math.random() * 450),
        currency: 'USD',
        region: 'US',
        availability: 'In Stock',
        lastChecked: new Date().toISOString().split('T')[0]
      }],
      availability: 'In Production',
      yearIntroduced: 1980 + Math.floor(Math.random() * 40),
      tags: [brand.toLowerCase(), 'sample'],
      addedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      sources: ['sample-generator'],
      verified: false
    });
  }
  
  return pens;
}

/**
 * Generate sample ink data
 */
function generateSampleInks(count = 10) {
  const brands = ['Pilot', 'Pelikan', 'Sailor', 'Diamine', 'Waterman', 'Montblanc', 'Lamy'];
  const colorNames = ['Blue', 'Black', 'Red', 'Green', 'Purple', 'Brown', 'Teal', 'Orange'];
  const series = ['Iroshizuku', '4001', 'Jentle', 'Standard', 'Serenity', 'Standard', 'Standard'];
  
  const inks = [];
  
  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const brandIndex = brands.indexOf(brand);
    const colorName = colorNames[Math.floor(Math.random() * colorNames.length)];
    const name = brand === 'Pilot' ? `${series[brandIndex]} ${colorName}` : colorName;
    const id = generateId(brand, '', name);
    
    inks.push({
      id: id,
      slug: id,
      brand: brand,
      name: name,
      series: brand === 'Pilot' ? series[brandIndex] : 'Standard',
      description: `A ${colorName.toLowerCase()} ink from ${brand}`,
      color: '#000000', // Simplified
      type: 'Dye-based',
      volume: [30, 50, 60, 80][Math.floor(Math.random() * 4)],
      properties: {
        sheen: Math.random() > 0.7,
        shimmer: false,
        shading: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        flow: ['dry', 'medium', 'wet'][Math.floor(Math.random() * 3)],
        waterResistance: 'low'
      },
      purchaseLinks: [{
        name: 'Sample Store',
        url: `https://example.com/inks/${id}`,
        price: 5 + Math.floor(Math.random() * 25),
        currency: 'USD',
        region: 'US',
        availability: 'In Stock',
        lastChecked: new Date().toISOString().split('T')[0]
      }],
      tags: [brand.toLowerCase(), colorName.toLowerCase()],
      addedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      sources: ['sample-generator'],
      verified: false
    });
  }
  
  return inks;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const penCount = parseInt(args[0]) || 20;
  const inkCount = parseInt(args[1]) || 10;
  
  console.log(`Generating ${penCount} pens and ${inkCount} inks...`);
  
  const data = {
    pens: generateSamplePens(penCount),
    inks: generateSampleInks(inkCount),
    timestamp: new Date().toISOString(),
    source: 'sample-generator'
  };
  
  const outputFile = path.join(__dirname, '../data/raw/sample-data.json');
  await writeJSON(outputFile, data);
  
  console.log(`Generated ${data.pens.length} pens and ${data.inks.length} inks`);
  console.log(`Saved to: ${outputFile}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateSamplePens, generateSampleInks };

