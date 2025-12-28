/**
 * API Data Fetcher
 * Fetches data from APIs (Wikipedia/Wikidata, etc.)
 */

const axios = require('axios');
const { readJSON, writeJSON, sleep } = require('./utils');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/data-sources.json');
const RAW_DATA_PATH = path.join(__dirname, '../data/raw');

/**
 * Fetch data from Wikidata API
 */
async function fetchFromWikidata(query, type = 'fountain pen') {
  try {
    const response = await axios.get('https://www.wikidata.org/w/api.php', {
      params: {
        action: 'wbsearchentities',
        search: query,
        language: 'en',
        format: 'json',
        limit: 10
      },
      timeout: 30000
    });

    if (response.data && response.data.search) {
      return response.data.search.map(item => ({
        id: item.id,
        label: item.label,
        description: item.description,
        url: `https://www.wikidata.org/wiki/${item.id}`,
        type: type
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching from Wikidata for query "${query}":`, error.message);
    return [];
  }
}

/**
 * Search for fountain pens in Wikidata
 */
async function searchWikidataForPens() {
  const brands = ['Pilot', 'Pelikan', 'Lamy', 'Sailor', 'Platinum', 'Montblanc', 'Waterman', 'Parker'];
  const results = [];

  for (const brand of brands) {
    console.log(`Searching Wikidata for ${brand} fountain pens...`);
    const items = await fetchFromWikidata(`${brand} fountain pen`, 'fountain pen');
    results.push(...items);
    await sleep(1000); // Rate limiting
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting API data fetch...');

  const config = await readJSON(CONFIG_PATH);
  if (!config) {
    console.error('Failed to load config');
    process.exit(1);
  }

  const apiSources = config.sources.filter(s => s.hasApi && s.api);
  
  if (apiSources.length === 0) {
    console.log('No API sources configured');
    return;
  }

  const allData = {
    pens: [],
    inks: [],
    timestamp: new Date().toISOString()
  };

  // Fetch from Wikidata
  const wikidataSource = apiSources.find(s => s.id === 'wikipedia');
  if (wikidataSource) {
    console.log('Fetching from Wikidata...');
    const wikidataResults = await searchWikidataForPens();
    allData.pens.push(...wikidataResults.map(item => ({
      source: 'wikidata',
      wikidataId: item.id,
      name: item.label,
      description: item.description,
      url: item.url
    })));
  }

  // Save raw data
  const outputPath = path.join(RAW_DATA_PATH, `api-data-${Date.now()}.json`);
  await writeJSON(outputPath, allData);

  console.log(`API fetch completed. Found ${allData.pens.length} pens.`);
  console.log(`Data saved to: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchFromWikidata, searchWikidataForPens };

