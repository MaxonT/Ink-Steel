# 脚本速查表

## 📋 快速索引

| 分类 | 脚本 | 命令 |
|------|------|------|
| **管道** | 图片获取 | `node pipelines/image-acquisition.js all` |
| **数据** | 清理数据 | `node scripts/data-cleaner.js` |
| **数据** | 验证数据 | `node scripts/data-validator.js` |
| **数据** | 质量检查 | `node scripts/quality-check.js` |
| **批量** | 批量导入 | `node scripts/batch-import.js` |
| **工具** | 链接验证 | `node scripts/link-validator.js` |
| **工具** | 生成样本 | `node scripts/generate-sample-data.js` |

---

## 🔄 管道脚本

### image-acquisition.js
**路径：** `pipelines/image-acquisition.js`

**功能：** 图片获取和元数据管理

**用法：**
```bash
node pipelines/image-acquisition.js all    # 全部
node pipelines/image-acquisition.js pens   # 仅钢笔
node pipelines/image-acquisition.js inks   # 仅墨水
```

**输出：**
- 更新 `frontend/data/pens.json`
- 更新 `frontend/data/inks.json`
- 添加 `imageMetadata` 字段

**运行时间：** 约 2-3 分钟（111 钢笔 + 65 墨水）

---

## 📊 数据处理脚本

### data-cleaner.js
**功能：** 清理和标准化数据

**用法：**
```bash
node scripts/data-cleaner.js input.json output.json
```

**处理内容：**
- 移除重复条目
- 标准化字段名
- 清理无效数据
- 统一格式

---

### data-validator.js
**功能：** 验证数据完整性

**用法：**
```bash
node scripts/data-validator.js pens
node scripts/data-validator.js inks
```

**检查项：**
- 必填字段存在性
- 数据类型正确性
- 引用完整性
- 格式规范性

---

### data-mapper.js
**功能：** 字段映射和转换

**用法：**
```bash
node scripts/data-mapper.js source.json target.json
```

**应用场景：**
- 从外部 API 导入
- 格式迁移
- 字段重命名

---

### quality-check.js
**功能：** 全面质量检查

**用法：**
```bash
node scripts/quality-check.js
```

**输出：**
- `others/data/quality-report.json`

**检查内容：**
- 缺失字段统计
- 数据完整度
- 图片链接有效性
- 购买链接状态

---

## 🔧 工具脚本

### batch-import.js
**功能：** 批量导入数据

**用法：**
```bash
node scripts/batch-import.js source.json
```

**支持格式：**
- JSON
- CSV（通过转换）

---

### link-validator.js
**功能：** 验证购买链接

**用法：**
```bash
node scripts/link-validator.js
```

**检查内容：**
- HTTP 状态码
- 响应时间
- 重定向处理
- 标记失效链接

---

### generate-sample-data.js
**功能：** 生成测试数据

**用法：**
```bash
node scripts/generate-sample-data.js 50
```

**参数：**
- 数量（默认 10）

**输出：**
- `others/data/raw/sample-data.json`

---

## 🖼️ 图片处理脚本

### image-pipeline-enhanced.js
**功能：** 图片处理核心逻辑

**直接调用：**
```bash
node scripts/image-pipeline-enhanced.js all
```

**推荐方式：** 通过管道调用
```bash
node pipelines/image-acquisition.js all
```

**功能模块：**
- `fetchPenImages()` - 获取钢笔图片
- `fetchInkImages()` - 获取墨水图片
- `validateImageUrl()` - 验证图片 URL

---

### image-fetcher.js
**功能：** 基础图片获取（旧版）

**状态：** 已被 `image-pipeline-enhanced.js` 替代

**保留原因：** 向后兼容

---

### image-processor.js
**功能：** 图片验证和处理

**用法：**
```bash
node scripts/image-processor.js
```

**功能：**
- 验证图片 URL
- 检查图片尺寸
- 格式转换（计划中）

---

## 🔍 诊断和修复脚本

### fix-purchase-links.js
**功能：** 修复购买链接格式

**用法：**
```bash
node scripts/fix-purchase-links.js
```

**修复内容：**
- URL 编码
- 协议统一（HTTPS）
- 移除无效参数

---

### fix-security-links.js
**功能：** 安全链接处理

**用法：**
```bash
node scripts/fix-security-links.js
```

**处理内容：**
- 移除 HTTP 链接
- 添加 rel="noopener"
- XSS 防护

---

## 📦 批处理脚本

### run-full-pipeline.js
**功能：** 运行完整数据管道

**用法：**
```bash
node scripts/run-full-pipeline.js
```

**执行顺序：**
1. 数据清理
2. 数据验证
3. 图片获取
4. 质量检查
5. 生成报告

**运行时间：** 约 5-10 分钟

---

## 🆕 增量更新

### incremental-update.js
**功能：** 增量更新数据

**用法：**
```bash
node scripts/incremental-update.js new-data.json
```

**智能合并：**
- 不覆盖现有数据
- 仅添加新条目
- 更新变化字段

---

## 📚 工具函数库

### utils.js
**路径：** `scripts/utils.js`

**主要函数：**
```javascript
readJSON(file)         // 读取 JSON
writeJSON(file, data)  // 写入 JSON
sleep(ms)              // 延迟
generateId(text)       // 生成 ID
cleanText(text)        // 清理文本
extractPrice(text)     // 提取价格
```

**导入方式：**
```javascript
const { readJSON, writeJSON } = require('./utils');
```

---

## 🎯 常用组合命令

### 完整数据更新流程
```bash
# 1. 清理数据
node scripts/data-cleaner.js frontend/data/pens.json frontend/data/pens-clean.json

# 2. 验证数据
node scripts/data-validator.js pens

# 3. 更新图片
node pipelines/image-acquisition.js all

# 4. 质量检查
node scripts/quality-check.js

# 5. 验证链接
node scripts/link-validator.js
```

### 添加新产品
```bash
# 1. 编辑 JSON 文件
# 2. 运行图片管道
node pipelines/image-acquisition.js pens

# 3. 验证
node scripts/data-validator.js pens
```

### 定期维护
```bash
# 每月运行
node scripts/quality-check.js
node scripts/link-validator.js
node pipelines/image-acquisition.js all
```

---

## 🐛 调试技巧

### 详细日志
```bash
DEBUG=* node pipelines/image-acquisition.js all
```

### 测试单个文件
```bash
node -e "console.log(require('./frontend/data/pens.json').pens.length)"
```

### 检查依赖
```bash
cd others/scripts
npm list
```

---

## 📖 相关文档

- [管道指南](PIPELINE.md)
- [实施计划](../../IMPLEMENTATION_PLAN.md)
- [项目 README](../../README.md)
