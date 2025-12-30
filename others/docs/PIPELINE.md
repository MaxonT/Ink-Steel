# 数据管道运行指南

## 🚀 快速开始

### 图片获取管道
```bash
cd others/pipelines
node image-acquisition.js all    # 更新所有图片
node image-acquisition.js pens   # 只更新钢笔
node image-acquisition.js inks   # 只更新墨水
```

---

## 📁 目录结构

```
others/
├── lib/              # 共享库
│   ├── logger.js     # 统一日志工具
│   └── constants.js  # 常量和配置
│
├── pipelines/        # 数据管道（主要入口）
│   └── image-acquisition.js  # 图片获取管道
│
├── scripts/          # 独立脚本工具
│   ├── image-pipeline-enhanced.js  # 图片处理核心
│   ├── data-cleaner.js
│   ├── data-validator.js
│   ├── batch-import.js
│   └── utils.js
│
├── config/           # 配置文件
│   └── data-sources.json
│
└── docs/             # 文档
    ├── PIPELINE.md         # 本文档
    └── SCRIPT_REFERENCE.md # 脚本参考
```

---

## 🔧 主要管道

### 1. 图片获取管道
**位置：** `pipelines/image-acquisition.js`

**功能：**
- 从零售商链接识别图片源
- 验证现有图片有效性
- 添加图片元数据（来源、授权信息）
- 生成高质量占位符

**输出：**
- 更新 `frontend/data/pens.json` - 添加 `imageMetadata`
- 更新 `frontend/data/inks.json` - 添加 `imageMetadata`

**运行频率：** 
- 添加新产品后
- 零售商链接更新后
- 定期维护（建议每月）

---

## 📝 脚本参考

### 核心脚本

| 脚本 | 功能 | 使用场景 |
|------|------|----------|
| `image-pipeline-enhanced.js` | 图片获取核心逻辑 | 被管道调用 |
| `data-cleaner.js` | 清理和标准化数据 | 导入原始数据后 |
| `data-validator.js` | 验证数据完整性 | 部署前检查 |
| `batch-import.js` | 批量导入数据 | 从外部源导入 |

### 工具脚本

| 脚本 | 功能 |
|------|------|
| `quality-check.js` | 数据质量检查 |
| `link-validator.js` | 验证购买链接 |
| `generate-sample-data.js` | 生成测试数据 |

---

## 🎯 常见任务

### 添加新钢笔
1. 编辑 `frontend/data/pens.json`
2. 运行图片管道：`node pipelines/image-acquisition.js pens`
3. 验证结果：访问 `frontend/test-fixes.html`

### 添加新墨水
1. 编辑 `frontend/data/inks.json`
2. 运行图片管道：`node pipelines/image-acquisition.js inks`
3. 验证颜色显示正确

### 更新零售商链接
1. 更新 `purchaseLinks` 字段
2. 运行图片管道（自动识别新来源）
3. 检查 `imageMetadata.source` 字段

---

## 🔍 故障排查

### 图片管道失败
```bash
# 检查网络连接
ping gouletpens.com

# 检查数据文件格式
node -e "require('./frontend/data/pens.json')"

# 查看详细日志
DEBUG=* node pipelines/image-acquisition.js all
```

### 数据验证失败
```bash
# 运行数据验证
node scripts/data-validator.js

# 查看具体错误
node scripts/quality-check.js
```

---

## 📊 数据字段说明

### Pens
```json
{
  "images": {
    "main": "主图 URL",
    "gallery": ["图集数组"]
  },
  "imageMetadata": {
    "source": "来源名称（Goulet Pens / JetPens）",
    "sourceUrl": "原始来源 URL",
    "licenseNote": "授权说明",
    "lastUpdated": "最后更新时间"
  }
}
```

### Inks
```json
{
  "color": "主色值",
  "imageMetadata": {
    "colorSwatch": "色样",
    "bottleImage": "瓶子图片 URL（可选）",
    "source": "来源名称",
    "sourceUrl": "原始来源 URL"
  }
}
```

---

## ⚙️ 配置说明

### 图片来源优先级
1. **官方品牌** - 最权威
2. **零售商** - Goulet Pens > JetPens > Anderson > Cult Pens
3. **搜索引擎** - 备选
4. **占位符** - 最终 fallback

### 默认配置
- 图片尺寸：800x600
- 请求超时：10秒
- 最大重试：3次
- 重试延迟：1秒

---

## 🚀 最佳实践

1. **运行管道前备份数据**
   ```bash
   cp frontend/data/pens.json frontend/data/pens.backup.json
   ```

2. **定期验证数据质量**
   ```bash
   node scripts/quality-check.js
   ```

3. **保持零售商链接更新**
   - 定期检查购买链接有效性
   - 及时更新失效链接

4. **记录图片来源**
   - 确保 `imageMetadata` 完整
   - 便于追溯和授权管理

---

更多详情查看：
- [脚本参考](SCRIPT_REFERENCE.md)
- [实施计划](../../IMPLEMENTATION_PLAN.md)
