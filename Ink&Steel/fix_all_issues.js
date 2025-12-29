#!/usr/bin/env node
/**
 * 全面修复网站路径和链接问题
 * 运行: node fix_all_issues.js
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend');

// 需要检查的文件列表
const HTML_FILES = [
  'index.html',
  'about.html',
  'blog.html',
  'brands.html',
  'care.html',
  'compare.html',
  'contact.html',
  'favorites.html',
  'history.html',
  'inks.html',
  'pen-detail.html',
  'ink-detail.html',
  'stats.html',
  '404.html',
  'offline.html'
];

// 修复函数
function fixManifestPath(content) {
  // 修复 manifest.json 路径
  // /manifest.json -> public/manifest.json
  // manifest.json -> public/manifest.json (如果没有public/)
  let fixed = content.replace(
    /<link\s+rel=["']manifest["']\s+href=["']\/?manifest\.json["']/gi,
    '<link rel="manifest" href="public/manifest.json"'
  );
  
  // 如果已经有 public/manifest.json，确保格式正确
  fixed = fixed.replace(
    /<link\s+rel=["']manifest["']\s+href=["']\/public\/manifest\.json["']/gi,
    '<link rel="manifest" href="public/manifest.json"'
  );
  
  return fixed;
}

function fixServiceWorkerRegistration(content) {
  // 修复 service worker 注册路径
  // /service-worker.js -> public/service-worker.js
  // service-worker.js -> public/service-worker.js
  let fixed = content.replace(
    /serviceWorker\.register\(["']\/?service-worker\.js["']/gi,
    "serviceWorker.register('public/service-worker.js'"
  );
  
  fixed = fixed.replace(
    /serviceWorker\.register\(["']\/public\/service-worker\.js["']/gi,
    "serviceWorker.register('public/service-worker.js'"
  );
  
  // 修复 navigator.serviceWorker.register
  fixed = fixed.replace(
    /navigator\.serviceWorker\.register\(["']\/?service-worker\.js["']/gi,
    "navigator.serviceWorker.register('public/service-worker.js'"
  );
  
  return fixed;
}

function fixAssetPaths(content) {
  // 确保 CSS 和 JS 路径正确
  // 修复可能错误的路径
  let fixed = content;
  
  // 修复 CSS 路径（如果它们使用了错误的路径）
  fixed = fixed.replace(/href=["']\/?assets\/styles\//g, 'href="assets/styles/');
  fixed = fixed.replace(/href=["']\.\.\/assets\/styles\//g, 'href="assets/styles/');
  
  // 修复 JS 路径
  fixed = fixed.replace(/src=["']\/?assets\/scripts\//g, 'src="assets/scripts/');
  fixed = fixed.replace(/src=["']\.\.\/assets\/scripts\//g, 'src="assets/scripts/');
  
  return fixed;
}

function fixDataPaths(content) {
  // 修复数据文件路径（在JS代码中）
  // data/pens.json 或 /data/pens.json -> data/pens.json
  let fixed = content.replace(/["']\/data\//g, '"data/');
  fixed = fixed.replace(/["']\.\.\/data\//g, '"data/');
  
  return fixed;
}

function fixPublicPaths(content) {
  // 修复 public/ 文件夹中的文件引用
  // 确保使用相对路径而不是绝对路径
  let fixed = content.replace(/["']\/public\//g, '"public/');
  
  return fixed;
}

function processHTMLFile(filePath) {
  console.log(`处理文件: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 应用所有修复
    content = fixManifestPath(content);
    content = fixServiceWorkerRegistration(content);
    content = fixAssetPaths(content);
    content = fixDataPaths(content);
    content = fixPublicPaths(content);
    
    // 如果内容有变化，写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ 已修复`);
    } else {
      console.log(`  - 无需修复`);
    }
  } catch (error) {
    console.error(`  ✗ 错误: ${error.message}`);
  }
}

function fixServiceWorkerFile() {
  const swPath = path.join(FRONTEND_DIR, 'public', 'service-worker.js');
  
  if (!fs.existsSync(swPath)) {
    console.log(`Service Worker 文件不存在: ${swPath}`);
    return;
  }
  
  console.log(`处理 Service Worker: ${swPath}`);
  
  try {
    let content = fs.readFileSync(swPath, 'utf8');
    const originalContent = content;
    
    // 修复 STATIC_ASSETS 中的路径
    // 移除不必要的 /public/ 前缀
    content = content.replace(/\/public\//g, '/');
    
    // 确保路径以 / 开头（除了 BASE_PATH）
    // 这需要根据实际代码结构调整
    
    if (content !== originalContent) {
      fs.writeFileSync(swPath, content, 'utf8');
      console.log(`  ✓ Service Worker 已修复`);
    } else {
      console.log(`  - Service Worker 无需修复`);
    }
  } catch (error) {
    console.error(`  ✗ Service Worker 错误: ${error.message}`);
  }
}

function fixJSFiles() {
  const scriptsDir = path.join(FRONTEND_DIR, 'assets', 'scripts');
  
  if (!fs.existsSync(scriptsDir)) {
    console.log(`Scripts 目录不存在: ${scriptsDir}`);
    return;
  }
  
  function processJSFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // 修复数据文件路径
      content = fixDataPaths(content);
      content = fixPublicPaths(content);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ ${path.relative(FRONTEND_DIR, filePath)}`);
      }
    } catch (error) {
      console.error(`  ✗ ${filePath}: ${error.message}`);
    }
  }
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.js')) {
        processJSFile(filePath);
      }
    });
  }
  
  console.log(`处理 JS 文件...`);
  walkDir(scriptsDir);
}

// 主函数
function main() {
  console.log('=== 开始修复网站路径问题 ===\n');
  
  if (!fs.existsSync(FRONTEND_DIR)) {
    console.error(`错误: frontend 目录不存在: ${FRONTEND_DIR}`);
    process.exit(1);
  }
  
  // 处理所有 HTML 文件
  console.log('1. 处理 HTML 文件...\n');
  HTML_FILES.forEach(file => {
    const filePath = path.join(FRONTEND_DIR, file);
    if (fs.existsSync(filePath)) {
      processHTMLFile(filePath);
    } else {
      console.log(`跳过不存在的文件: ${file}`);
    }
  });
  
  console.log('\n2. 处理 Service Worker...\n');
  fixServiceWorkerFile();
  
  console.log('\n3. 处理 JS 文件...\n');
  fixJSFiles();
  
  console.log('\n=== 修复完成 ===');
}

if (require.main === module) {
  main();
}

module.exports = { fixManifestPath, fixServiceWorkerRegistration, fixAssetPaths };

