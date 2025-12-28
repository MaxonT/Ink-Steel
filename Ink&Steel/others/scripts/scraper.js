/**
 * Web Scraper
 * Scrapes product data from retailer and manufacturer websites
 */

const axios = require('axios');
const cheerio = require('cheerio');
const robotsParser = require('robots-parser');
const { readJSON, writeJSON, sleep, cleanText, extractPrice, getAbsoluteURL, generateId } = require('./utils');
const pLimit = require('p-limit');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/data-sources.json');
const RAW_DATA_PATH = path.join(__dirname, '../data/raw');
const CONFIG = require(CONFIG_PATH);

const globalSettings = CONFIG.globalSettings || {};
const limit = pLimit(globalSettings.maxConcurrentRequests || 2);

/**
 * Check robots.txt
 */
async function checkRobotsTxt(url, robotsTxtUrl) {
  if (!robotsTxtUrl || !globalSettings.respectRobotsTxt) {
    return true;
  }

  try {
    const response = await axios.get(robotsTxtUrl);
    const robots = robotsParser(robotsTxtUrl, response.data);
    return robots.isAllowed(url, globalSettings.userAgent);
  } catch (error) {
    console.warn(`Could not fetch robots.txt from ${robotsTxtUrl}:`, error.message);
    return true; // Allow by default if robots.txt is unavailable
  }
}

/**
 * Fetch and parse a single page
 */
async function scrapePage(url, source) {
  return limit(async () => {
    try {
      // Check robots.txt
      if (source.scraping?.robotsTxt) {
        const allowed = await checkRobotsTxt(url, source.scraping.robotsTxt);
        if (!allowed) {
          console.log(`Skipping ${url} (disallowed by robots.txt)`);
          return null;
        }
      }

      // Fetch page
      const response = await axios.get(url, {
        headers: {
          'User-Agent': source.scraping?.userAgent || globalSettings.userAgent
        },
        timeout: globalSettings.timeout || 30000
      });

      const $ = cheerio.load(response.data);
      const data = {
        url: url,
        source: source.id,
        scrapedAt: new Date().toISOString()
      };

      // Extract basic info (this is a simplified example - actual extraction depends on website structure)
      if (source.dataMapping) {
        const mapping = source.dataMapping;
        
        if (mapping.name) {
          data.name = cleanText($(mapping.name).first().text());
        }
        if (mapping.brand) {
          data.brand = cleanText($(mapping.brand).first().text());
        }
        if (mapping.price) {
          const priceText = $(mapping.price).first().text();
          data.price = extractPrice(priceText);
        }
        if (mapping.description) {
          data.description = cleanText($(mapping.description).first().text());
        }
        if (mapping.images) {
          const images = [];
          $(mapping.images).each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src) {
              images.push(getAbsoluteURL(source.scraping.baseUrl, src));
            }
          });
          data.images = images;
        }
      } else {
        // Generic extraction (fallback)
        data.title = cleanText($('title').text());
        data.description = cleanText($('meta[name="description"]').attr('content'));
      }

      // Rate limiting
      await sleep(source.scraping?.rateLimit || globalSettings.defaultRateLimit || 2000);

      return data;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return null;
    }
  });
}

/**
 * Extract product links from category page
 */
async function extractProductLinks(categoryUrl, source) {
  try {
    const response = await axios.get(categoryUrl, {
      headers: {
        'User-Agent': source.scraping?.userAgent || globalSettings.userAgent
      },
      timeout: globalSettings.timeout || 30000
    });

    const $ = cheerio.load(response.data);
    const links = new Set();

    // Common selectors for product links
    const selectors = [
      'a[href*="/product"]',
      'a[href*="/p/"]',
      '.product-item a',
      '.product-link',
      'a.product-title'
    ];

    selectors.forEach(selector => {
      $(selector).each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          const absoluteUrl = getAbsoluteURL(source.scraping.baseUrl, href);
          links.add(absoluteUrl);
        }
      });
    });

    return Array.from(links);
  } catch (error) {
    console.error(`Error extracting links from ${categoryUrl}:`, error.message);
    return [];
  }
}

/**
 * Scrape products from a source
 */
async function scrapeSource(source) {
  if (!source.scraping?.enabled) {
    console.log(`Skipping ${source.name} (scraping disabled)`);
    return [];
  }

  console.log(`\nScraping ${source.name}...`);

  const products = [];
  const categoryPages = source.scraping.categoryPages || [];

  for (const categoryUrl of categoryPages) {
    console.log(`  Extracting product links from ${categoryUrl}...`);
    const productLinks = await extractProductLinks(categoryUrl, source);
    console.log(`  Found ${productLinks.length} product links`);

    for (let i = 0; i < productLinks.length; i++) {
      const link = productLinks[i];
      console.log(`  Scraping [${i + 1}/${productLinks.length}] ${link}`);
      const productData = await scrapePage(link, source);
      if (productData) {
        products.push(productData);
      }
    }
  }

  return products;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting web scraping...');

  const config = await readJSON(CONFIG_PATH);
  if (!config) {
    console.error('Failed to load config');
    process.exit(1);
  }

  const scrapingSources = config.sources.filter(s => s.scraping?.enabled);
  
  if (scrapingSources.length === 0) {
    console.log('No scraping sources enabled');
    return;
  }

  const allData = {
    pens: [],
    inks: [],
    timestamp: new Date().toISOString()
  };

  // Scrape each source
  for (const source of scrapingSources) {
    try {
      const products = await scrapeSource(source);
      
      // Classify as pen or ink (simplified - would need better logic)
      products.forEach(product => {
        const url = product.url || '';
        const name = (product.name || '').toLowerCase();
        
        if (url.includes('/ink') || name.includes('ink')) {
          allData.inks.push(product);
        } else {
          allData.pens.push(product);
        }
      });

      console.log(`Completed ${source.name}: ${products.length} products`);
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error.message);
    }
  }

  // Save raw data
  const outputPath = path.join(RAW_DATA_PATH, `scraped-data-${Date.now()}.json`);
  await writeJSON(outputPath, allData);

  console.log(`\nScraping completed.`);
  console.log(`  Pens: ${allData.pens.length}`);
  console.log(`  Inks: ${allData.inks.length}`);
  console.log(`  Data saved to: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapePage, scrapeSource, extractProductLinks };

