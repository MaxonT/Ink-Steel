#!/usr/bin/env node

/**
 * enrich-images.js
 * 批量补真实图片：Unsplash API → 下载 → 本地存储 → JSON 回写
 * 
 * 使用方法：
 *   node enrich-images.js pens    # 只补钢笔
 *   node enrich-images.js inks    # 只补墨水
 *   node enrich-images.js all     # 全部
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { Logger } = require('../lib/logger');
const { readJSON, writeJSON, sleep } = require('./utils');

const logger = new Logger('ImageEnricher');

// Unsplash API 基础设置（免费层无需认证，但有速率限制）
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

/**
 * 从 Unsplash 搜索并获取最佳图片
 */
async function searchImageUnsplash(query, options = {}) {
  const { limit = 3 } = options;
  
  try {
    const response = await axios.get(`${UNSPLASH_API_BASE}/search/photos`, {
      params: {
        query,
        per_page: limit,
        order_by: 'relevant'
      },
      timeout: 5000
    });
    
    if (!response.data.results || response.data.results.length === 0) {
      return null;
    }
    
    // 选择第一张（最相关）
    const image = response.data.results[0];
    return {
      url: image.urls.regular,  // 1600px 宽度
      source: image.links.html,
      attribution: image.user.name,
      license: 'Unsplash License'
    };
    
  } catch (error) {
    logger.warning(`Search failed for "${query}": ${error.message}`);
    return null;
  }
}

/**
 * 下载图片并保存到本地
 */
async function downloadImage(imageUrl, localPath) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    // 确保目录存在
    const dir = path.dirname(localPath);
    await fs.mkdir(dir, { recursive: true });
    
    // 写入文件
    await fs.writeFile(localPath, response.data);
    return true;
    
  } catch (error) {
    logger.warning(`Download failed: ${error.message}`);
    return false;
  }
}

/**
 * 补充钢笔图片
 */
async function enrichPensImages(dataFilePath) {
  logger.section('🖼️  Enriching Pen Images');
  
  const data = await readJSON(dataFilePath);
  if (!data || !data.pens) {
    logger.error('Failed to read pens data');
    return;
  }
  
  const pens = data.pens;
  const results = {
    total: pens.length,
    enriched: 0,
    downloaded: 0,
    failed: [],
    skipped: 0
  };
  
  for (let i = 0; i < pens.length; i++) {
    const pen = pens[i];
    logger.progress(i + 1, pens.length, `${pen.brand} ${pen.model || ''}`);
    
    const penId = pen.id || pen.slug;
    
    // 检查是否已有真实图片（跳过占位符）
    if (pen.images?.main && !pen.images.main.includes('dummyimage.com') && !pen.images.main.includes('placeholder')) {
      results.skipped++;
      continue;
    }
    
    // 搜索图片
    const query = `${pen.brand} ${pen.model || pen.name} fountain pen product`;
    const imageData = await searchImageUnsplash(query);
    
    if (!imageData) {
      results.failed.push({
        id: penId,
        name: pen.name,
        reason: 'No search results'
      });
      continue;
    }
    
    // 下载到本地
    const localPath = path.join(
      __dirname,
      '../../frontend/assets/images/pens',
      `${penId}.jpg`
    );
    
    const downloaded = await downloadImage(imageData.url, localPath);
    
    if (downloaded) {
      // 更新 JSON
      if (!pen.images) pen.images = {};
      pen.images.main = `/assets/images/pens/${penId}.jpg`;
      
      if (!pen.imageMetadata) pen.imageMetadata = {};
      pen.imageMetadata.source = imageData.source;
      pen.imageMetadata.attribution = imageData.attribution;
      pen.imageMetadata.license = imageData.license;
      pen.imageMetadata.lastEnriched = new Date().toISOString();
      
      results.enriched++;
      results.downloaded++;
    } else {
      results.failed.push({
        id: penId,
        name: pen.name,
        reason: 'Download failed',
        sourceUrl: imageData.url
      });
    }
    
    // 避免 API 速率限制
    await sleep(200);
  }
  
  // 保存更新
  await writeJSON(dataFilePath, data);
  
  logger.stats({
    'Total': results.total,
    'Enriched': results.enriched,
    'Downloaded': results.downloaded,
    'Skipped': results.skipped,
    'Failed': results.failed.length
  });
  
  if (results.failed.length > 0) {
    logger.warning('Failed to enrich (top 5):');
    results.failed.slice(0, 5).forEach(item => {
      console.log(`   • ${item.name}: ${item.reason}`);
    });
    if (results.failed.length > 5) {
      console.log(`   ... and ${results.failed.length - 5} more`);
    }
  }
  
  return results;
}

/**
 * 补充墨水图片
 */
async function enrichInksImages(dataFilePath) {
  logger.section('🖼️  Enriching Ink Images');
  
  const data = await readJSON(dataFilePath);
  if (!data || !data.inks) {
    logger.error('Failed to read inks data');
    return;
  }
  
  const inks = data.inks;
  const results = {
    total: inks.length,
    enriched: 0,
    downloaded: 0,
    failed: [],
    skipped: 0
  };
  
  for (let i = 0; i < inks.length; i++) {
    const ink = inks[i];
    logger.progress(i + 1, inks.length, `${ink.brand} ${ink.name}`);
    
    const inkId = ink.id || ink.slug;
    
    // 检查是否已有真实图片
    if (ink.image_url && !ink.image_url.includes('dummyimage.com') && !ink.image_url.includes('placeholder')) {
      results.skipped++;
      continue;
    }
    
    // 搜索图片
    const query = `${ink.brand} ${ink.name} ink bottle`;
    const imageData = await searchImageUnsplash(query);
    
    if (!imageData) {
      results.failed.push({
        id: inkId,
        name: `${ink.brand} ${ink.name}`,
        reason: 'No search results'
      });
      continue;
    }
    
    // 下载到本地
    const localPath = path.join(
      __dirname,
      '../../frontend/assets/images/inks',
      `${inkId}.jpg`
    );
    
    const downloaded = await downloadImage(imageData.url, localPath);
    
    if (downloaded) {
      // 新增 image_url 字段
      ink.image_url = `/assets/images/inks/${inkId}.jpg`;
      
      if (!ink.imageMetadata) ink.imageMetadata = {};
      ink.imageMetadata.bottleImage = ink.image_url;
      ink.imageMetadata.source = imageData.source;
      ink.imageMetadata.attribution = imageData.attribution;
      ink.imageMetadata.license = imageData.license;
      ink.imageMetadata.lastEnriched = new Date().toISOString();
      
      results.enriched++;
      results.downloaded++;
    } else {
      results.failed.push({
        id: inkId,
        name: `${ink.brand} ${ink.name}`,
        reason: 'Download failed',
        sourceUrl: imageData.url
      });
    }
    
    await sleep(200);
  }
  
  await writeJSON(dataFilePath, data);
  
  logger.stats({
    'Total': results.total,
    'Enriched': results.enriched,
    'Downloaded': results.downloaded,
    'Skipped': results.skipped,
    'Failed': results.failed.length
  });
  
  if (results.failed.length > 0) {
    logger.warning('Failed to enrich (top 5):');
    results.failed.slice(0, 5).forEach(item => {
      console.log(`   • ${item.name}: ${item.reason}`);
    });
    if (results.failed.length > 5) {
      console.log(`   ... and ${results.failed.length - 5} more`);
    }
  }
  
  return results;
}

/**
 * 主入口
 */
async function main() {
  const target = process.argv[2] || 'all';
  const pensPath = path.join(__dirname, '../../frontend/data/pens.json');
  const inksPath = path.join(__dirname, '../../frontend/data/inks.json');
  
  try {
    switch (target) {
      case 'pens':
        await enrichPensImages(pensPath);
        break;
      case 'inks':
        await enrichInksImages(inksPath);
        break;
      case 'all':
        await enrichPensImages(pensPath);
        await enrichInksImages(inksPath);
        break;
      default:
        console.log(`
🖼️  Image Enrichment Script

Usage:
  node enrich-images.js pens    # Enrich only pens
  node enrich-images.js inks    # Enrich only inks
  node enrich-images.js all     # Enrich both

How it works:
  1. Searches Unsplash API for product images
  2. Downloads high-quality images
  3. Stores locally in frontend/assets/images/
  4. Updates JSON with image_url + metadata
  5. Reports any failed items

Features:
  • Automatic: No manual intervention needed
  • Unsplash: Free API, no authentication required
  • Local storage: Images served from your own server
  • Metadata: Tracks source and attribution
  • Fallback: Reports items that need manual attention
        `);
    }
    
    logger.success('✓ Image enrichment completed successfully');
    logger.elapsed();
    
  } catch (error) {
    logger.error('Image enrichment failed', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  enrichPensImages,
  enrichInksImages,
  searchImageUnsplash,
  downloadImage
};
