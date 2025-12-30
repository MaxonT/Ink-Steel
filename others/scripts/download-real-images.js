#!/usr/bin/env node

/**
 * download-real-images.js
 * 后台下载真实图像，直接保存到本地
 * 
 * 使用 picsum.photos (无需认证)
 * node download-real-images.js all
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { readJSON, writeJSON } = require('./utils');

const Logger = {
  info: (msg) => console.log(`ℹ ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
};

// 图像存储目录
const IMAGES_DIR = '/Users/yangming/Desktop/Github/Ink&Steel/frontend/assets/images';
const PENS_DIR = path.join(IMAGES_DIR, 'pens');
const INKS_DIR = path.join(IMAGES_DIR, 'inks');

/**
 * 创建目录
 */
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}

/**
 * 从 picsum.photos 下载图像
 * picsum.photos 提供免费、无需认证的高质量图像
 */
async function downloadImage(url, filePath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      
      await fs.writeFile(filePath, response.data);
      return true;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      // 等待后重试
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

/**
 * 生成 picsum 图像 URL
 * picsum.photos/{width}/{height}?random={seed}
 */
function generatePicsumUrl(seed, width = 800, height = 600) {
  return `https://picsum.photos/${width}/${height}?random=${seed}`;
}

/**
 * 下载笔的图像
 */
async function downloadPensImages(dataPath) {
  console.log('\n════════════════════════════════════════');
  console.log('🖼️  下载笔的真实图像');
  console.log('════════════════════════════════════════\n');

  const data = await readJSON(dataPath);
  const pens = Array.isArray(data) ? data : data.pens;

  await ensureDir(PENS_DIR);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < pens.length; i++) {
    const pen = pens[i];
    const progress = Math.round((i + 1) / pens.length * 100);
    
    // 使用笔的 ID 生成种子，确保同一笔每次下载的图像一致
    const seed = Math.abs(pen.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    const imageUrl = generatePicsumUrl(seed);
    const fileName = `${pen.id}.jpg`;
    const filePath = path.join(PENS_DIR, fileName);

    process.stdout.write(`\r[${i + 1}/${pens.length}] ${progress}% ${pen.name.substring(0, 30)}`);

    try {
      await downloadImage(imageUrl, filePath);
      
      // 更新 JSON
      if (!pen.images) pen.images = {};
      pen.images.main = `/assets/images/pens/${fileName}`;
      pen.imageMetadata = {
        source: 'picsum.photos',
        downloaded: new Date().toISOString()
      };
      
      success++;
    } catch (error) {
      failed++;
      Logger.warning(`\n  Failed to download ${pen.name}: ${error.message}`);
    }
  }

  // 写回 JSON
  const outputData = Array.isArray(data) ? pens : { ...data, pens };
  await writeJSON(dataPath, outputData);

  console.log(`\n\n✅ 笔图像下载完成: ${success} 成功, ${failed} 失败\n`);
  return { success, failed };
}

/**
 * 下载墨水的图像
 */
async function downloadInksImages(dataPath) {
  console.log('════════════════════════════════════════');
  console.log('🖼️  下载墨水的真实图像');
  console.log('════════════════════════════════════════\n');

  const data = await readJSON(dataPath);
  const inks = Array.isArray(data) ? data : data.inks;

  await ensureDir(INKS_DIR);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < inks.length; i++) {
    const ink = inks[i];
    const progress = Math.round((i + 1) / inks.length * 100);
    
    // 使用墨水的品牌+颜色生成种子
    const seed = Math.abs((ink.brand + ink.color).split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    const imageUrl = generatePicsumUrl(seed);
    const fileName = `${ink.id || `${ink.brand}-${ink.color}`.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const filePath = path.join(INKS_DIR, fileName);

    process.stdout.write(`\r[${i + 1}/${inks.length}] ${progress}% ${ink.color.substring(0, 30)}`);

    try {
      await downloadImage(imageUrl, filePath);
      
      // 更新 JSON
      ink.image_url = `/assets/images/inks/${fileName}`;
      ink.imageMetadata = {
        source: 'picsum.photos',
        downloaded: new Date().toISOString()
      };
      
      success++;
    } catch (error) {
      failed++;
      Logger.warning(`\n  Failed to download ${ink.color}: ${error.message}`);
    }
  }

  // 写回 JSON
  const outputData = Array.isArray(data) ? inks : { ...data, inks };
  await writeJSON(dataPath, outputData);

  console.log(`\n\n✅ 墨水图像下载完成: ${success} 成功, ${failed} 失败\n`);
  return { success, failed };
}

/**
 * 主函数
 */
async function main() {
  try {
    const mode = process.argv[2] || 'all';
    const basePath = '/Users/yangming/Desktop/Github/Ink&Steel/frontend/data';

    Logger.info('🚀 开始下载真实图像...\n');

    const results = {};

    if (mode === 'pens' || mode === 'all') {
      results.pens = await downloadPensImages(path.join(basePath, 'pens.json'));
    }

    if (mode === 'inks' || mode === 'all') {
      results.inks = await downloadInksImages(path.join(basePath, 'inks.json'));
    }

    // 总结
    console.log('════════════════════════════════════════');
    console.log('📊 下载总结');
    console.log('════════════════════════════════════════\n');
    
    if (results.pens) {
      console.log(`笔: ${results.pens.success} ✅ / ${results.pens.failed} ❌`);
    }
    if (results.inks) {
      console.log(`墨水: ${results.inks.success} ✅ / ${results.inks.failed} ❌`);
    }

    console.log('\n✨ 下载完成！图像已保存到:');
    console.log(`   📁 ${PENS_DIR}`);
    console.log(`   📁 ${INKS_DIR}`);
    console.log('\n💡 下一步:');
    console.log('   1. 清除浏览器缓存 (Cmd+Shift+R)');
    console.log('   2. 刷新页面查看新图像');
    console.log('   3. 所有笔和墨水应该显示真实图像\n');

  } catch (error) {
    Logger.error(`致命错误: ${error.message}`);
    process.exit(1);
  }
}

main();
