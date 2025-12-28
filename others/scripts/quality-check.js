/**
 * Quality Check
 * Checks data quality and generates reports
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');

/**
 * Check data quality
 */
async function checkQuality(dataFile, reportFile) {
  console.log(`Checking data quality for ${dataFile}...`);

  const data = await readJSON(dataFile);
  if (!data) {
    console.error('Failed to read data file');
    return;
  }

  const report = {
    timestamp: new Date().toISOString(),
    pens: {
      total: 0,
      withBrand: 0,
      withModel: 0,
      withPrice: 0,
      withImages: 0,
      withDescription: 0,
      withSpecs: 0,
      issues: []
    },
    inks: {
      total: 0,
      withBrand: 0,
      withPrice: 0,
      withColor: 0,
      withDescription: 0,
      issues: []
    }
  };

  // Check pens
  if (data.pens && Array.isArray(data.pens)) {
    report.pens.total = data.pens.length;

    data.pens.forEach((pen, index) => {
      if (pen.brand) report.pens.withBrand++;
      if (pen.model) report.pens.withModel++;
      if (pen.purchaseLinks && pen.purchaseLinks.length > 0 && pen.purchaseLinks.some(l => l.price)) {
        report.pens.withPrice++;
      }
      if (pen.images && pen.images.main) report.pens.withImages++;
      if (pen.description) report.pens.withDescription++;
      if (pen.specifications && Object.keys(pen.specifications).length > 0) {
        report.pens.withSpecs++;
      }

      // Record issues
      const issues = [];
      if (!pen.brand) issues.push('Missing brand');
      if (!pen.model) issues.push('Missing model');
      if (!pen.description) issues.push('Missing description');
      if (!pen.images || !pen.images.main) issues.push('Missing main image');
      if (!pen.purchaseLinks || pen.purchaseLinks.length === 0) issues.push('Missing purchase links');

      if (issues.length > 0) {
        report.pens.issues.push({
          id: pen.id,
          name: pen.name,
          issues: issues
        });
      }
    });
  }

  // Check inks
  if (data.inks && Array.isArray(data.inks)) {
    report.inks.total = data.inks.length;

    data.inks.forEach((ink, index) => {
      if (ink.brand) report.inks.withBrand++;
      if (ink.purchaseLinks && ink.purchaseLinks.length > 0 && ink.purchaseLinks.some(l => l.price)) {
        report.inks.withPrice++;
      }
      if (ink.color) report.inks.withColor++;
      if (ink.description) report.inks.withDescription++;

      // Record issues
      const issues = [];
      if (!ink.brand) issues.push('Missing brand');
      if (!ink.description) issues.push('Missing description');
      if (!ink.color) issues.push('Missing color');
      if (!ink.purchaseLinks || ink.purchaseLinks.length === 0) issues.push('Missing purchase links');

      if (issues.length > 0) {
        report.inks.issues.push({
          id: ink.id,
          name: ink.name,
          issues: issues
        });
      }
    });
  }

  // Save report
  await writeJSON(reportFile, report);

  // Print summary
  console.log('\nQuality Report:');
  console.log(`\nPens (${report.pens.total} total):`);
  console.log(`  With brand: ${report.pens.withBrand} (${(report.pens.withBrand/report.pens.total*100).toFixed(1)}%)`);
  console.log(`  With model: ${report.pens.withModel} (${(report.pens.withModel/report.pens.total*100).toFixed(1)}%)`);
  console.log(`  With price: ${report.pens.withPrice} (${(report.pens.withPrice/report.pens.total*100).toFixed(1)}%)`);
  console.log(`  With images: ${report.pens.withImages} (${(report.pens.withImages/report.pens.total*100).toFixed(1)}%)`);
  console.log(`  With description: ${report.pens.withDescription} (${(report.pens.withDescription/report.pens.total*100).toFixed(1)}%)`);
  console.log(`  With specs: ${report.pens.withSpecs} (${(report.pens.withSpecs/report.pens.total*100).toFixed(1)}%)`);
  console.log(`  Issues: ${report.pens.issues.length}`);

  console.log(`\nInks (${report.inks.total} total):`);
  console.log(`  With brand: ${report.inks.withBrand} (${(report.inks.withBrand/report.inks.total*100).toFixed(1)}%)`);
  console.log(`  With price: ${report.inks.withPrice} (${(report.inks.withPrice/report.inks.total*100).toFixed(1)}%)`);
  console.log(`  With color: ${report.inks.withColor} (${(report.inks.withColor/report.inks.total*100).toFixed(1)}%)`);
  console.log(`  With description: ${report.inks.withDescription} (${(report.inks.withDescription/report.inks.total*100).toFixed(1)}%)`);
  console.log(`  Issues: ${report.inks.issues.length}`);

  console.log(`\nFull report saved to: ${reportFile}`);

  return report;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dataFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const reportFile = args[1] || path.join(__dirname, '../data/quality-report.json');

  // Check both pens and inks
  const pensFile = dataFile.includes('pens.json') ? dataFile : path.join(__dirname, '../../frontend/data/pens.json');
  const inksFile = dataFile.includes('inks.json') ? dataFile : path.join(__dirname, '../../frontend/data/inks.json');

  const pensData = await readJSON(pensFile);
  const inksData = await readJSON(inksFile);

  const combinedData = {
    pens: pensData?.pens || [],
    inks: inksData?.inks || []
  };

  const tempFile = path.join(__dirname, '../data/temp-quality-check.json');
  await writeJSON(tempFile, combinedData);

  await checkQuality(tempFile, reportFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkQuality };

