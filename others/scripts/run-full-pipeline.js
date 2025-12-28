/**
 * Run Full Pipeline
 * Executes the complete data pipeline: generate -> map -> clean -> validate -> import
 */

const { generateSamplePens, generateSampleInks } = require('./generate-sample-data');
const { mapRawData } = require('./data-mapper');
const { cleanData } = require('./data-cleaner');
const { validateData } = require('./data-validator');
const { importData } = require('./batch-import');
const { writeJSON } = require('./utils');
const path = require('path');

/**
 * Run full pipeline
 */
async function runPipeline(pensCount = 500, inksCount = 200) {
  console.log('=== Starting Full Data Pipeline ===\n');

  // Step 1: Generate sample data
  console.log(`Step 1: Generating ${pensCount} pens and ${inksCount} inks...`);
  const rawData = {
    pens: generateSamplePens(pensCount),
    inks: generateSampleInks(inksCount),
    timestamp: new Date().toISOString(),
    source: 'sample-generator'
  };
  const rawFile = path.join(__dirname, '../data/raw/batch-data.json');
  await writeJSON(rawFile, rawData);
  console.log(`✓ Generated and saved to ${rawFile}\n`);

  // Step 2: Map data
  console.log('Step 2: Mapping data to unified format...');
  const mappedFile = path.join(__dirname, '../data/cleaned/mapped-batch.json');
  await mapRawData(rawFile, mappedFile);
  console.log(`✓ Mapped data saved to ${mappedFile}\n`);

  // Step 3: Clean data
  console.log('Step 3: Cleaning data...');
  const cleanedFile = path.join(__dirname, '../data/cleaned/cleaned-batch.json');
  await cleanData(mappedFile, cleanedFile);
  console.log(`✓ Cleaned data saved to ${cleanedFile}\n`);

  // Step 4: Validate data
  console.log('Step 4: Validating data...');
  const validatedFile = path.join(__dirname, '../data/cleaned/validated-batch.json');
  await validateData(cleanedFile, validatedFile);
  console.log(`✓ Validated data saved to ${validatedFile}\n`);

  // Step 5: Import data
  console.log('Step 5: Importing data...');
  await importData(validatedFile, {
    merge: true,
    backup: true,
    dryRun: false
  });
  console.log(`✓ Data imported successfully\n`);

  console.log('=== Pipeline Completed Successfully ===');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const pensCount = parseInt(args[0]) || 500;
  const inksCount = parseInt(args[1]) || 200;

  await runPipeline(pensCount, inksCount);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runPipeline };

