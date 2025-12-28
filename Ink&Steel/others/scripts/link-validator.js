/**
 * Link Validator
 * Validates purchase links for pens
 */

const axios = require('axios');
const { readJSON, writeJSON, sleep } = require('./utils');
const path = require('path');

/**
 * Validate a single URL
 */
async function validateUrl(url, timeout = 10000) {
  if (!url || typeof url !== 'string') {
    return { valid: false, status: 'invalid', error: 'Empty or invalid URL' };
  }

  try {
    // Parse URL
    new URL(url);
  } catch {
    return { valid: false, status: 'invalid', error: 'Invalid URL format' };
  }

  // Skip validation for example.com or placeholder URLs
  if (url.includes('example.com') || url.includes('placeholder')) {
    return { valid: false, status: 'placeholder', error: 'Placeholder URL' };
  }

  try {
    const response = await axios.head(url, {
      timeout: timeout,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept 4xx as valid response
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkValidator/1.0)'
      }
    });

    const status = response.status;
    if (status >= 200 && status < 400) {
      return { valid: true, status: status, error: null };
    } else {
      return { valid: false, status: status, error: `HTTP ${status}` };
    }
  } catch (error) {
    if (error.response) {
      return { valid: false, status: error.response.status, error: error.message };
    } else if (error.request) {
      return { valid: false, status: 'timeout', error: 'Request timeout or network error' };
    } else {
      return { valid: false, status: 'error', error: error.message };
    }
  }
}

/**
 * Validate purchase links for a pen
 */
async function validatePenLinks(pen) {
  const purchaseLinks = pen.purchaseLinks || [];
  const validatedLinks = [];

  for (const link of purchaseLinks) {
    const url = link.url;
    if (!url) {
      continue; // Skip links without URL
    }

    console.log(`    Validating: ${link.name} - ${url.substring(0, 50)}...`);
    const validation = await validateUrl(url);
    
    validatedLinks.push({
      ...link,
      valid: validation.valid,
      status: validation.status,
      lastValidated: new Date().toISOString().split('T')[0],
      error: validation.error
    });

    // Rate limiting
    await sleep(500);
  }

  return validatedLinks;
}

/**
 * Batch validate all purchase links
 */
async function batchValidateLinks(inputFile, outputFile, options = {}) {
  const { validateAll = false, dryRun = false } = options;

  console.log(`Validating purchase links in ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const { pens = [] } = data;
  const validatedPens = [];
  const stats = {
    total: pens.length,
    processed: 0,
    validLinks: 0,
    invalidLinks: 0,
    skipped: 0
  };

  // If not validating all, only validate first 30 pens
  const pensToValidate = validateAll ? pens : pens.slice(0, 30);

  for (let i = 0; i < pens.length; i++) {
    const pen = pens[i];
    const shouldValidate = i < pensToValidate.length;

    if (shouldValidate && !dryRun) {
      console.log(`  [${i + 1}/${pens.length}] Validating links for ${pen.name || pen.id}...`);
      
      try {
        const validatedLinks = await validatePenLinks(pen);
        
        // Count valid/invalid
        validatedLinks.forEach(link => {
          if (link.valid) stats.validLinks++;
          else stats.invalidLinks++;
        });

        validatedPens.push({
          ...pen,
          purchaseLinks: validatedLinks
        });
        
        stats.processed++;
      } catch (error) {
        console.error(`    Error validating links:`, error.message);
        validatedPens.push(pen); // Keep original on error
      }
    } else {
      // Keep original links
      validatedPens.push(pen);
      if (!shouldValidate) stats.skipped++;
    }
  }

  if (!dryRun) {
    // Save validated data
    await writeJSON(outputFile, { pens: validatedPens });

    console.log(`\nValidation completed:`);
    console.log(`  Total pens: ${stats.total}`);
    console.log(`  Processed: ${stats.processed}`);
    console.log(`  Valid links: ${stats.validLinks}`);
    console.log(`  Invalid links: ${stats.invalidLinks}`);
    console.log(`  Skipped: ${stats.skipped}`);
    console.log(`  Saved to: ${outputFile}`);
  } else {
    console.log(`\nDRY RUN - No changes made`);
    console.log(`  Would validate ${pensToValidate.length} pens`);
  }

  return { pens: validatedPens, stats };
}

/**
 * Generate validation report
 */
async function generateReport(inputFile, reportFile) {
  const data = await readJSON(inputFile);
  if (!data) return;

  const { pens = [] } = data;
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPens: pens.length,
      pensWithLinks: 0,
      pensWithoutLinks: 0,
      totalLinks: 0,
      validLinks: 0,
      invalidLinks: 0
    },
    details: []
  };

  pens.forEach(pen => {
    const links = pen.purchaseLinks || [];
    const hasLinks = links.length > 0;
    
    if (hasLinks) {
      report.summary.pensWithLinks++;
    } else {
      report.summary.pensWithoutLinks++;
    }

    report.summary.totalLinks += links.length;
    
    links.forEach(link => {
      if (link.valid === true) {
        report.summary.validLinks++;
      } else if (link.valid === false) {
        report.summary.invalidLinks++;
      }
    });

    report.details.push({
      id: pen.id,
      name: pen.name,
      linkCount: links.length,
      validLinks: links.filter(l => l.valid === true).length,
      invalidLinks: links.filter(l => l.valid === false).length
    });
  });

  await writeJSON(reportFile, report);

  console.log(`\nReport generated:`);
  console.log(`  Total pens: ${report.summary.totalPens}`);
  console.log(`  Pens with links: ${report.summary.pensWithLinks}`);
  console.log(`  Pens without links: ${report.summary.pensWithoutLinks}`);
  console.log(`  Valid links: ${report.summary.validLinks}`);
  console.log(`  Invalid links: ${report.summary.invalidLinks}`);
  console.log(`  Saved to: ${reportFile}`);

  return report;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || path.join(__dirname, '../data/temp/pens-validated-links.json');
  const validateAll = args.includes('--all');
  const dryRun = args.includes('--dry-run');
  const reportOnly = args.includes('--report');

  if (reportOnly) {
    const reportFile = args[1] || path.join(__dirname, '../data/link-validation-report.json');
    await generateReport(inputFile, reportFile);
  } else {
    await batchValidateLinks(inputFile, outputFile, { validateAll, dryRun });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { validateUrl, validatePenLinks, batchValidateLinks, generateReport };

