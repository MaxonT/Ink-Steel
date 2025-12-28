/**
 * Utility functions for data scraping
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Read JSON file
 */
async function readJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Write JSON file
 */
async function writeJSON(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing JSON file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate ID from brand and model
 */
function generateId(brand, model, name) {
  const parts = [brand, model || '', name || '']
    .filter(p => p)
    .map(p => p.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    );
  return parts.join('-');
}

/**
 * Clean text - remove HTML tags and extra whitespace
 */
function cleanText(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract price from text
 */
function extractPrice(text) {
  if (!text) return null;
  const match = String(text).match(/[\d,]+\.?\d*/);
  if (match) {
    return parseFloat(match[0].replace(/,/g, ''));
  }
  return null;
}

/**
 * Validate URL
 */
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get absolute URL from relative URL
 */
function getAbsoluteURL(baseURL, relativeURL) {
  try {
    return new URL(relativeURL, baseURL).href;
  } catch {
    return relativeURL;
  }
}

module.exports = {
  readJSON,
  writeJSON,
  sleep,
  generateId,
  cleanText,
  extractPrice,
  isValidURL,
  getAbsoluteURL
};

