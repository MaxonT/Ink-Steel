/**
 * Fix Security Links
 * Adds rel="noopener noreferrer" to all external links
 * Note: This script checks HTML files for links that need security attributes
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Check if a file contains target="_blank" without rel="noopener"
 */
async function checkFileSecurity(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const hasTargetBlank = content.includes('target="_blank"');
    const hasNoopener = content.includes('rel="noopener"') || content.includes('rel="noopener noreferrer"');
    
    if (hasTargetBlank && !hasNoopener) {
      return { needsFix: true, file: filePath };
    }
    return { needsFix: false, file: filePath };
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error.message);
    return { needsFix: false, file: filePath, error: error.message };
  }
}

/**
 * Fix security attributes in HTML file
 */
async function fixFileSecurity(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // Find target="_blank" without proper rel attribute
    const targetBlankRegex = /target=["']_blank["'](?![^>]*rel=["'][^"']*noopener)/g;
    
    content = content.replace(targetBlankRegex, (match) => {
      modified = true;
      // Check if rel attribute already exists
      if (match.includes('rel=')) {
        // Add noopener to existing rel
        return match.replace(/rel=["']([^"']+)["']/, 'rel="$1 noopener noreferrer"');
      } else {
        // Add rel attribute
        return match + ' rel="noopener noreferrer"';
      }
    });

    // Also handle target="_blank" followed by rel (different pattern)
    content = content.replace(/target=["']_blank["']\s+rel=["'](?!.*noopener)([^"']+)["']/g, 
      'target="_blank" rel="$1 noopener noreferrer"');

    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      return { fixed: true, file: filePath };
    }
    
    return { fixed: false, file: filePath };
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return { fixed: false, file: filePath, error: error.message };
  }
}

/**
 * Check all HTML files
 */
async function checkAllFiles(directory) {
  const htmlFiles = [];
  
  async function findHtmlFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        await findHtmlFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }
  
  await findHtmlFiles(directory);
  return htmlFiles;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const directory = args[0] || path.join(__dirname, '../../frontend');
  const fix = args.includes('--fix');

  console.log(`Checking HTML files in ${directory}...`);

  const htmlFiles = await checkAllFiles(directory);
  console.log(`Found ${htmlFiles.length} HTML files`);

  const results = [];
  
  for (const file of htmlFiles) {
    if (fix) {
      const result = await fixFileSecurity(file);
      results.push(result);
      if (result.fixed) {
        console.log(`  Fixed: ${path.relative(directory, file)}`);
      }
    } else {
      const result = await checkFileSecurity(file);
      results.push(result);
      if (result.needsFix) {
        console.log(`  Needs fix: ${path.relative(directory, file)}`);
      }
    }
  }

  const needsFix = results.filter(r => r.needsFix).length;
  const fixed = results.filter(r => r.fixed).length;

  if (!fix) {
    console.log(`\nSummary: ${needsFix} files need security fixes`);
    console.log(`Run with --fix to apply fixes`);
  } else {
    console.log(`\nSummary: Fixed ${fixed} files`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkFileSecurity, fixFileSecurity, checkAllFiles };

