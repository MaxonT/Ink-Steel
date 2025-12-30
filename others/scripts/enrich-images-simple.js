#!/usr/bin/env node

/**
 * enrich-images-simple.js
 * 为笔和墨水生成智能占位符图像
 * 避免需要 API 认证，使用开放图像服务
 */

const fs = require('fs').promises;
const path = require('path');
const { Logger } = require('../lib/logger');
const { readJSON, writeJSON } = require('./utils');

const logger = new Logger('ImageEnricher');

// ============ 开放图像 URL 生成器 ============

/**
 * 生成高质量占位符 URL（使用 placeholder.com）
 */
function generatePlaceholderUrl(width = 800, height = 600, bgColor = 'F9F5F0', textColor = '333333', text = '') {
  const encodedText = encodeURIComponent(text.substring(0, 30));
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
}

/**
 * 尝试从多个免费服务获取相关图像
 * 1. Pixabay (无需密钥)
 * 2. 本地生成高质量占位符
 */
async function generateImageUrl(itemName, itemType = 'pen') {
  try {
    // 策略 1: 尝试 Pixabay 免费图像（不需要密钥或低速率限制）
    // 如果需要真实图片，用户可以购买 API 密钥
    
    // 暂时使用高质量占位符服务
    // 实际场景：管理员可以后期手动替换为真实图片 URL
    
    const colors = {
      pen: 'E8DCC8',  // 温暖的奶油色
      ink: 'B8E0D2'   // 柔和的蓝绿色
    };
    
    const bgColor = colors[itemType] || colors.pen;
    const text = itemName.substring(0, 25).toUpperCase();
    
    // 使用 placeholder.com 的高质量占位符
    return {
      url: generatePlaceholderUrl(800, 600, bgColor, '333333', text),
      source: 'Generated Placeholder',
      attribution: 'placeholder.com',
      license: 'Public Domain',
      isPlaceholder: true
    };
    
  } catch (error) {
    logger.warning(`Failed to generate image for "${itemName}": ${error.message}`);
    return null;
  }
}

/**
 * 补充钢笔图像
 */
async function enrichPensImages(dataPath) {
  try {
    const data = await readJSON(dataPath);
    const pens = Array.isArray(data) ? data : data.pens;
    
    if (!Array.isArray(pens) || pens.length === 0) {
      logger.warning('No pens found in data');
      return { success: 0, failed: 0, data };
    }
    
    logger.section('🖼️  Enriching Pen Images');
    
    let success = 0;
    let failed = 0;
    const updatedPens = [];
    
    for (let i = 0; i < pens.length; i++) {
      const pen = pens[i];
      const progress = ((i + 1) / pens.length * 100).toFixed(0);
      
      // 跳过已有真实图片的
      if (pen.images?.main && !pen.images.main.includes('dummyimage')) {
        logger.progress(`[${i + 1}/${pens.length}] ${progress}% ${pen.name}`, i, pens.length);
        updatedPens.push(pen);
        success++;
        continue;
      }
      
      try {
        const imageData = await generateImageUrl(`${pen.brand} ${pen.name}`, 'pen');
        
        if (!imageData) {
          failed++;
          updatedPens.push(pen);
          logger.progress(`[${i + 1}/${pens.length}] ${progress}% ${pen.name}`, i, pens.length);
          continue;
        }
        
        // 更新笔数据
        if (!pen.images) pen.images = {};
        pen.images.main = imageData.url;
        pen.imageMetadata = {
          source: imageData.source,
          attribution: imageData.attribution,
          license: imageData.license,
          isPlaceholder: imageData.isPlaceholder,
          lastEnriched: new Date().toISOString()
        };
        
        updatedPens.push(pen);
        success++;
        logger.progress(`[${i + 1}/${pens.length}] ${progress}% ${pen.name}`, i, pens.length);
        
      } catch (error) {
        failed++;
        updatedPens.push(pen);
        logger.warning(`  ⚠️  Failed for ${pen.name}: ${error.message}`);
      }
    }
    
    // 写回 JSON
    const outputData = Array.isArray(data) ? updatedPens : { ...data, pens: updatedPens };
    await writeJSON(dataPath, outputData);
    
    logger.success(`\n✅ Pens enriched: ${success} success, ${failed} failed`);
    return { success, failed, data: outputData };
    
  } catch (error) {
    logger.error(`Failed to enrich pens: ${error.message}`);
    throw error;
  }
}

/**
 * 补充墨水图像
 */
async function enrichInksImages(dataPath) {
  try {
    const data = await readJSON(dataPath);
    const inks = Array.isArray(data) ? data : data.inks;
    
    if (!Array.isArray(inks) || inks.length === 0) {
      logger.warning('No inks found in data');
      return { success: 0, failed: 0, data };
    }
    
    logger.section('🖼️  Enriching Ink Images');
    
    let success = 0;
    let failed = 0;
    const updatedInks = [];
    
    for (let i = 0; i < inks.length; i++) {
      const ink = inks[i];
      const progress = ((i + 1) / inks.length * 100).toFixed(0);
      
      // 跳过已有真实图片的
      if (ink.image_url && !ink.image_url.includes('dummyimage') && !ink.image_url.includes('placeholder')) {
        logger.progress(`[${i + 1}/${inks.length}] ${progress}% ${ink.color}`, i, inks.length);
        updatedInks.push(ink);
        success++;
        continue;
      }
      
      try {
        const imageData = await generateImageUrl(`${ink.brand} ${ink.color}`, 'ink');
        
        if (!imageData) {
          failed++;
          updatedInks.push(ink);
          logger.progress(`[${i + 1}/${inks.length}] ${progress}% ${ink.color}`, i, inks.length);
          continue;
        }
        
        // 更新墨水数据
        ink.image_url = imageData.url;
        ink.imageMetadata = {
          source: imageData.source,
          attribution: imageData.attribution,
          license: imageData.license,
          isPlaceholder: imageData.isPlaceholder,
          lastEnriched: new Date().toISOString()
        };
        
        updatedInks.push(ink);
        success++;
        logger.progress(`[${i + 1}/${inks.length}] ${progress}% ${ink.color}`, i, inks.length);
        
      } catch (error) {
        failed++;
        updatedInks.push(ink);
        logger.warning(`  ⚠️  Failed for ${ink.color}: ${error.message}`);
      }
    }
    
    // 写回 JSON
    const outputData = Array.isArray(data) ? updatedInks : { ...data, inks: updatedInks };
    await writeJSON(dataPath, outputData);
    
    logger.success(`\n✅ Inks enriched: ${success} success, ${failed} failed`);
    return { success, failed, data: outputData };
    
  } catch (error) {
    logger.error(`Failed to enrich inks: ${error.message}`);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const mode = process.argv[2] || 'all';
    const basePath = '/Users/yangming/Desktop/Github/Ink&Steel/frontend/data';
    
    const pensPath = path.join(basePath, 'pens.json');
    const inksPath = path.join(basePath, 'inks.json');
    
    logger.info(`Starting image enrichment in "${mode}" mode...`);
    
    const results = {};
    
    if (mode === 'pens' || mode === 'all') {
      results.pens = await enrichPensImages(pensPath);
    }
    
    if (mode === 'inks' || mode === 'all') {
      results.inks = await enrichInksImages(inksPath);
    }
    
    // 总结
    logger.section('📊 Summary');
    if (results.pens) {
      logger.info(`Pens: ${results.pens.success} enriched, ${results.pens.failed} failed`);
    }
    if (results.inks) {
      logger.info(`Inks: ${results.inks.success} enriched, ${results.inks.failed} failed`);
    }
    
    logger.success('\n🎉 Image enrichment completed!');
    logger.info('\nNext steps:');
    logger.info('1. Refresh browser cache (Cmd+Shift+R on Mac)');
    logger.info('2. Visit gallery to see updated images');
    logger.info('3. For real images: Update image URLs in JSON with actual URLs or purchase API keys');
    
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
