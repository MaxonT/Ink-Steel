/**
 * Incremental Update
 * Checks for updates and only imports new/updated data
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');
const fs = require('fs');

/**
 * Compare and find new/updated items
 */
function findUpdates(existing, newData, key = 'id') {
  const existingMap = new Map();
  
  if (Array.isArray(existing)) {
    existing.forEach(item => {
      if (item[key]) {
        existingMap.set(item[key], item);
      }
    });
  }

  const newItems = [];
  const updatedItems = [];

  if (Array.isArray(newData)) {
    newData.forEach(newItem => {
      if (!newItem[key]) return;

      const existingItem = existingMap.get(newItem[key]);
      if (!existingItem) {
        newItems.push(newItem);
      } else {
        // Check if item was updated (compare lastUpdated or hash)
        const existingUpdated = existingItem.lastUpdated || existingItem.addedDate;
        const newUpdated = newItem.lastUpdated || newItem.addedDate;
        
        if (newUpdated > existingUpdated) {
          updatedItems.push(newItem);
        }
      }
    });
  }

  return { newItems, updatedItems };
}

/**
 * Incremental update
 */
async function incrementalUpdate(sourceFile, options = {}) {
  const { dryRun = false } = options;

  console.log(`Performing incremental update from ${sourceFile}...`);

  if (dryRun) {
    console.log('DRY RUN MODE - No changes will be made');
  }

  // Read source data
  const sourceData = await readJSON(sourceFile);
  if (!sourceData) {
    console.error('Failed to read source file');
    return;
  }

  // Read existing data
  const pensFile = path.join(__dirname, '../../frontend/data/pens.json');
  const inksFile = path.join(__dirname, '../../frontend/data/inks.json');

  const existingPens = await readJSON(pensFile);
  const existingInks = await readJSON(inksFile);

  const existingPensArray = existingPens?.pens || [];
  const existingInksArray = existingInks?.inks || [];

  // Find updates
  const pensUpdate = findUpdates(existingPensArray, sourceData.pens || []);
  const inksUpdate = findUpdates(existingInksArray, sourceData.inks || []);

  console.log(`\nUpdate Summary:`);
  console.log(`Pens: ${pensUpdate.newItems.length} new, ${pensUpdate.updatedItems.length} updated`);
  console.log(`Inks: ${inksUpdate.newItems.length} new, ${inksUpdate.updatedItems.length} updated`);

  if (dryRun) {
    console.log('\nThis was a dry run. Use --execute to actually update.');
    return;
  }

  // Merge updates
  const { mergeData } = require('./batch-import');
  const pensResult = mergeData(existingPensArray, [
    ...pensUpdate.newItems,
    ...pensUpdate.updatedItems
  ]);
  const inksResult = mergeData(existingInksArray, [
    ...inksUpdate.newItems,
    ...inksUpdate.updatedItems
  ]);

  // Save updated data
  await writeJSON(pensFile, { pens: pensResult.merged });
  await writeJSON(inksFile, { inks: inksResult.merged });

  console.log('\nIncremental update completed successfully!');
  
  return {
    pens: pensResult,
    inks: inksResult
  };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const sourceFile = args[0] || path.join(__dirname, '../data/cleaned/processed-data.json');
  const dryRun = !args.includes('--execute');

  await incrementalUpdate(sourceFile, { dryRun });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { incrementalUpdate, findUpdates };

