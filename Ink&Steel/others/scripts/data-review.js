/**
 * Data Review Tool
 * Generates comprehensive data quality reports and suggests improvements
 */

const { readJSON, writeJSON } = require('./utils');
const path = require('path');

/**
 * Check if a field exists and has content
 */
function hasContent(field) {
  if (field === null || field === undefined) return false;
  if (typeof field === 'string') return field.trim().length > 0;
  if (Array.isArray) return field.length > 0;
  if (typeof field === 'object') return Object.keys(field).length > 0;
  return true;
}

/**
 * Review a single pen
 */
function reviewPen(pen, index) {
  const issues = [];
  const missing = [];
  const suggestions = [];

  // Required fields
  if (!pen.id) missing.push('id');
  if (!pen.name) missing.push('name');
  if (!pen.brand) missing.push('brand');
  if (!pen.type) missing.push('type');

  // Description check
  if (!pen.description || pen.description.length < 50) {
    issues.push('Description too short (minimum 50 characters)');
    suggestions.push('Add a more detailed description (at least 50 characters)');
  }

  // Details check
  if (!pen.details || pen.details.length < 100) {
    issues.push('Details too short (minimum 100 characters)');
    suggestions.push('Add more detailed information (at least 100 characters)');
  }

  // Images check
  if (!pen.images || !pen.images.main) {
    issues.push('Missing main image');
    suggestions.push('Add a main product image');
  } else {
    const mainImage = pen.images.main;
    if (mainImage.includes('placeholder') || mainImage.includes('dummyimage')) {
      issues.push('Using placeholder image');
      suggestions.push('Replace placeholder with real product image');
    }
  }

  // Purchase links check
  if (!pen.purchaseLinks || pen.purchaseLinks.length === 0) {
    issues.push('No purchase links');
    suggestions.push('Add at least one purchase link');
  } else {
    const validLinks = pen.purchaseLinks.filter(link => {
      const url = link.url || '';
      return url && 
             !url.includes('example.com') && 
             !url.includes('placeholder') &&
             url.startsWith('http');
    });
    
    if (validLinks.length === 0) {
      issues.push('No valid purchase links');
      suggestions.push('Add valid purchase links (remove example.com links)');
    }
  }

  // Specifications check
  if (!pen.specifications || Object.keys(pen.specifications).length === 0) {
    issues.push('Missing specifications');
    suggestions.push('Add product specifications (dimensions, weight, material, etc.)');
  }

  // Tags check
  if (!pen.tags || pen.tags.length === 0) {
    issues.push('No tags');
    suggestions.push('Add tags for better categorization and searchability');
  }

  // Price check (preferred but not required)
  const hasPrice = pen.purchaseLinks?.some(link => link.price != null);
  if (!hasPrice) {
    suggestions.push('Consider adding price information to purchase links');
  }

  // Calculate completeness score (0-100)
  let score = 100;
  const requiredFields = ['id', 'name', 'brand', 'type', 'description', 'details'];
  const optionalFields = ['images.main', 'purchaseLinks', 'specifications', 'tags'];
  
  requiredFields.forEach(field => {
    if (!hasContent(pen[field])) {
      score -= 15; // Heavy penalty for missing required fields
    }
  });

  optionalFields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!hasContent(pen[parent]?.[child])) {
        score -= 5;
      }
    } else {
      if (!hasContent(pen[field])) {
        score -= 5;
      }
    }
  });

  // Bonus for having price
  if (hasPrice) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    id: pen.id,
    name: pen.name,
    brand: pen.brand,
    index: index,
    completeness: score,
    issues: issues,
    missing: missing,
    suggestions: suggestions,
    hasDescription: hasContent(pen.description) && pen.description.length >= 50,
    hasDetails: hasContent(pen.details) && pen.details.length >= 100,
    hasImages: hasContent(pen.images?.main),
    hasPurchaseLinks: hasContent(pen.purchaseLinks) && pen.purchaseLinks.length > 0,
    hasSpecifications: hasContent(pen.specifications) && Object.keys(pen.specifications).length > 0,
    hasTags: hasContent(pen.tags) && pen.tags.length > 0,
    hasPrice: hasPrice
  };
}

/**
 * Generate comprehensive review report
 */
async function generateReviewReport(inputFile, outputFile) {
  console.log(`Generating data review report for ${inputFile}...`);

  const data = await readJSON(inputFile);
  if (!data) {
    console.error('Failed to read input file');
    return;
  }

  const { pens = [] } = data;
  const reviews = pens.map((pen, index) => reviewPen(pen, index));

  // Calculate overall statistics
  const stats = {
    total: pens.length,
    averageCompleteness: 0,
    completenessDistribution: {
      excellent: 0, // 90-100
      good: 0,      // 70-89
      fair: 0,      // 50-69
      poor: 0       // 0-49
    },
    fieldCompleteness: {
      description: 0,
      details: 0,
      images: 0,
      purchaseLinks: 0,
      specifications: 0,
      tags: 0,
      price: 0
    },
    totalIssues: 0,
    commonIssues: {}
  };

  let totalScore = 0;
  reviews.forEach(review => {
    totalScore += review.completeness;
    
    // Distribution
    if (review.completeness >= 90) stats.completenessDistribution.excellent++;
    else if (review.completeness >= 70) stats.completenessDistribution.good++;
    else if (review.completeness >= 50) stats.completenessDistribution.fair++;
    else stats.completenessDistribution.poor++;

    // Field completeness
    if (review.hasDescription) stats.fieldCompleteness.description++;
    if (review.hasDetails) stats.fieldCompleteness.details++;
    if (review.hasImages) stats.fieldCompleteness.images++;
    if (review.hasPurchaseLinks) stats.fieldCompleteness.purchaseLinks++;
    if (review.hasSpecifications) stats.fieldCompleteness.specifications++;
    if (review.hasTags) stats.fieldCompleteness.tags++;
    if (review.hasPrice) stats.fieldCompleteness.price++;

    // Count issues
    stats.totalIssues += review.issues.length;
    
    // Common issues
    review.issues.forEach(issue => {
      stats.commonIssues[issue] = (stats.commonIssues[issue] || 0) + 1;
    });
  });

  stats.averageCompleteness = totalScore / pens.length;

  // Sort by completeness (lowest first for priority fixing)
  const sortedReviews = [...reviews].sort((a, b) => a.completeness - b.completeness);

  // Generate priority list (top 30 lowest completeness)
  const priorityList = sortedReviews.slice(0, 30).map(review => ({
    id: review.id,
    name: review.name,
    brand: review.brand,
    completeness: review.completeness,
    issues: review.issues,
    suggestions: review.suggestions
  }));

  const report = {
    timestamp: new Date().toISOString(),
    summary: stats,
    reviews: reviews,
    priorityList: priorityList,
    recommendations: {
      immediate: [
        'Fix pens in priority list (lowest completeness scores)',
        'Ensure all pens have valid purchase links',
        'Replace placeholder images with real product images',
        'Add detailed descriptions (minimum 50 characters)',
        'Add detailed product information (minimum 100 characters)'
      ],
      shortTerm: [
        'Add specifications to all pens',
        'Add price information to purchase links',
        'Improve image quality (replace placeholders)',
        'Add more tags for better categorization'
      ],
      longTerm: [
        'Collect real product images for all pens',
        'Verify all purchase links are valid and up-to-date',
        'Add more detailed specifications',
        'Add product history and background information'
      ]
    }
  };

  // Save report
  await writeJSON(outputFile, report);

  // Print summary
  console.log(`\nData Review Report:`);
  console.log(`  Total pens: ${stats.total}`);
  console.log(`  Average completeness: ${stats.averageCompleteness.toFixed(1)}%`);
  console.log(`\n  Completeness distribution:`);
  console.log(`    Excellent (90-100%): ${stats.completenessDistribution.excellent}`);
  console.log(`    Good (70-89%): ${stats.completenessDistribution.good}`);
  console.log(`    Fair (50-69%): ${stats.completenessDistribution.fair}`);
  console.log(`    Poor (0-49%): ${stats.completenessDistribution.poor}`);
  console.log(`\n  Field completeness:`);
  Object.entries(stats.fieldCompleteness).forEach(([field, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    console.log(`    ${field}: ${count}/${stats.total} (${percentage}%)`);
  });
  console.log(`\n  Total issues: ${stats.totalIssues}`);
  console.log(`  Common issues:`);
  Object.entries(stats.commonIssues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([issue, count]) => {
      console.log(`    ${issue}: ${count}`);
    });
  console.log(`\n  Priority list: ${priorityList.length} pens need immediate attention`);
  console.log(`  Report saved to: ${outputFile}`);

  return report;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0] || path.join(__dirname, '../../frontend/data/pens.json');
  const outputFile = args[1] || path.join(__dirname, '../data/data-review-report.json');

  await generateReviewReport(inputFile, outputFile);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { reviewPen, generateReviewReport };

