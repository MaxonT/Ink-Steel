/**
 * Image Acquisition Pipeline
 * 图片获取管道 - 统一入口
 * 
 * 使用方法：
 *   node image-acquisition.js pens
 *   node image-acquisition.js inks
 *   node image-acquisition.js all
 */

const path = require('path');
const { Logger } = require('../lib/logger');
const { 
  fetchPenImages, 
  fetchInkImages, 
  updatePensImages, 
  updateInksImages 
} = require('../scripts/image-pipeline-enhanced');

const logger = new Logger('Image Pipeline');

async function runPipeline(target = 'all') {
  logger.section('🖼️  Image Acquisition Pipeline');
  
  const pensDataPath = path.join(__dirname, '../../frontend/data/pens.json');
  const inksDataPath = path.join(__dirname, '../../frontend/data/inks.json');
  
  try {
    switch (target) {
      case 'pens':
        logger.info('Processing pens...');
        await updatePensImages(pensDataPath, pensDataPath);
        break;
        
      case 'inks':
        logger.info('Processing inks...');
        await updateInksImages(inksDataPath, inksDataPath);
        break;
        
      case 'all':
        logger.info('Processing pens...');
        await updatePensImages(pensDataPath, pensDataPath);
        logger.info('Processing inks...');
        await updateInksImages(inksDataPath, inksDataPath);
        break;
        
      default:
        logger.error(`Unknown target: ${target}`);
        logger.info('Valid targets: pens, inks, all');
        process.exit(1);
    }
    
    logger.success('Pipeline completed successfully!');
    logger.elapsed();
    
  } catch (error) {
    logger.error('Pipeline failed', error);
    process.exit(1);
  }
}

// CLI 入口
if (require.main === module) {
  const target = process.argv[2] || 'all';
  runPipeline(target);
}

module.exports = { runPipeline };
