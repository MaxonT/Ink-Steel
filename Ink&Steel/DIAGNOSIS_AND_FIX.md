# 网站问题诊断和修复指南

## 常见问题清单

基于静态网站部署的常见问题，以下是需要检查和修复的问题：

### 1. Manifest.json 路径问题
- **问题**: HTML中的manifest链接可能是 `/manifest.json` 但实际文件在 `/public/manifest.json`
- **修复**: 检查所有HTML文件，确保 `rel="manifest"` 指向正确路径
- **正确路径**: `href="/public/manifest.json"` 或 `href="public/manifest.json"`（相对路径）

### 2. Service Worker 路径问题  
- **问题**: Service Worker注册路径可能错误
- **修复**: 确保注册路径为 `/public/service-worker.js` 或 `public/service-worker.js`
- **问题**: Service Worker内部的静态资源路径可能使用 `/public/` 前缀但应该是相对路径

### 3. 资源路径问题
- **CSS文件**: 确保路径为 `assets/styles/tokens.css`, `assets/styles/states.css`, `assets/styles/main.css`
- **JS文件**: 确保路径为 `assets/scripts/main.js` 和 `assets/scripts/components/*.js`
- **数据文件**: 确保路径为 `data/pens.json`, `data/inks.json`

### 4. 内部链接问题
- HTML页面之间的链接应该使用相对路径
- 确保所有 `<a href>` 链接正确

### 5. Public文件夹文件路径
- robots.txt: 应该可以访问 `/robots.txt` 或 `/public/robots.txt`
- sitemap.xml: 应该可以访问 `/sitemap.xml` 或 `/public/sitemap.xml`
- manifest.json: 需要正确的图标路径

### 6. Service Worker 缓存路径
- Service Worker中的 STATIC_ASSETS 数组应该使用正确的路径
- 不应该有 `/public/` 前缀在资源路径中（如果public是部署根目录）

## 修复步骤

请按照以下步骤检查和修复：

1. **检查所有HTML文件的manifest链接**
2. **检查Service Worker注册代码**
3. **检查Service Worker内部的路径配置**
4. **检查所有资源引用路径**
5. **检查内部链接**
6. **验证部署结构**

