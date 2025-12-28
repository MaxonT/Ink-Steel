/**
 * Batch Import
 * Imports cleaned and validated data into pens.json and inks.json
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');
const fs = require('fs');

const PENS_FILE = path.join(__dirname, '../../frontend/data/pens.json');
const INKS_FILE = path.join(__dirname, '../../frontend/data/inks.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

/**
 * Merge new data with existing data
 */
function mergeData(existing, newData, key = 'id') {
  const existingMap = new Map();
  
  // Create map of existing items
  if (Array.isArray(existing)) {
    existing.forEach(item => {
      if (item[key]) {
        existingMap.set(item[key], item);
      }
    });
  }

  // Merge new data
  const merged = [...existing];
  let added = 0;
  let updated = 0;

  if (Array.isArray(newData)) {
    newData.forEach(newItem => {
      if (!newItem[key]) return;

      const existingItem = existingMap.get(newItem[key]);
      if (existingItem) {
        // Update existing item (merge sources, update lastUpdated)
        const index = merged.findIndex(item => item[key] === newItem[key]);
        if (index >= 0) {
          // Merge sources
          const existingSources = new Set(existingItem.sources || []);
          const newSources = newItem.sources || [];
          newSources.forEach(s => existingSources.add(s));
          
          merged[index] = {
            ...existingItem,
            ...newItem,
            sources: Array.from(existingSources),
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          updated++;
        }
      } else {
        // Add new item
        merged.push(newItem);
        added++;
      }
    });
  }

  return { merged, added, updated };
}

/**
 * Create backup of existing data
 */
async function createBackup() {
  try {
    await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    // Backup pens
    if (fs.existsSync(PENS_FILE)) {
      const pensBackup = path.join(BACKUP_DIR, `pens-${timestamp}.json`);
      await fs.promises.copyFile(PENS_FILE, pensBackup);
      console.log(`Backed up pens.json to ${pensBackup}`);
    }

    // Backup inks
    if (fs.existsSync(INKS_FILE)) {
      const inksBackup = path.join(BACKUP_DIR, `inks-${timestamp}.json`);
      await fs.promises.copyFile(INKS_FILE, inksBackup);
      console.log(`Backed up inks.json to ${inksBackup}`);
    }
  } catch (error) {
    console.error('Error creating backup:', error.message);
  }
}

/**
 * Import data
 */
async function importData(inputFile, options = {}) {
  const { 
    merge = true, 
    backup = true,
    dryRun = false 
  } = options;

  console.log(`Importing data from ${inputFile}...`);

  if (dryRun) {
    console.log('DRY RUN MODE - No changes will be made');
  }

  // Read source data
  const sourceData = await readJSON(inputFile);
  if (!sourceData) {
    console.error('Failed to read input file');
    return;
  }

  // Create backup
  if (backup && !dryRun) {
    await createBackup();
  }

  // Read existing data
  const existingPens = await readJSON(PENS_FILE);
  const existingInks = await readJSON(INKS_FILE);

  const existingPensArray = existingPens?.pens || [];
  const existingInksArray = existingInks?.inks || [];

  // Merge or replace
  let pensResult, inksResult;

  if (merge) {
    pensResult = mergeData(existingPensArray, sourceData.pens || []);
    inksResult = mergeData(existingInksArray, sourceData.inks || []);
  } else {
    pensResult = {
      merged: sourceData.pens || [],
      added: sourceData.pens?.length || 0,
      updated: 0
    };
    inksResult = {
      merged: sourceData.inks || [],
      added: sourceData.inks?.length || 0,
      updated: 0
    };
  }

  // Save merged data
  if (!dryRun) {
    await writeJSON(PENS_FILE, { pens: pensResult.merged });
    await writeJSON(INKS_FILE, { inks: inksResult.merged });
  }

  // Print report
  console.log('\nImport Report:');
  console.log(`Pens: ${pensResult.added} added, ${pensResult.updated} updated, ${pensResult.merged.length} total`);
  console.log(`Inks: ${inksResult.added} added, ${inksResult.updated} updated, ${inksResult.merged.length} total`);

  if (dryRun) {
    console.log('\nThis was a dry run. Use --execute to actually import.');
  } else {
    console.log('\nImport completed successfully!');
  }

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
  const inputFile = args[0] || path.join(__dirname, '../data/cleaned/processed-data.json');
  const dryRun = !args.includes('--execute');
  const noBackup = args.includes('--no-backup');
  const noMerge = args.includes('--no-merge');

  await importData(inputFile, {
    merge: !noMerge,
    backup: !noBackup,
    dryRun: dryRun
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importData, mergeData, createBackup };

