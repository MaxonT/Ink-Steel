# 数据抓取和导入工具

这个目录包含了从网络获取和导入钢笔、墨水数据的完整工具链。

## 安装依赖

```bash
cd others/scripts
npm install
```

## 工具说明

### 1. 数据生成器 (generate-sample-data.js)

生成示例数据用于测试。

```bash
node generate-sample-data.js [pens_count] [inks_count]
```

示例：
```bash
node generate-sample-data.js 100 50
```

### 2. 数据映射 (data-mapper.js)

将原始数据映射为统一格式。

```bash
node data-mapper.js [input_file] [output_file]
```

### 3. 数据清洗 (data-cleaner.js)

清洗和规范化数据。

```bash
node data-cleaner.js [input_file] [output_file]
```

### 4. 数据验证 (data-validator.js)

验证数据结构和格式。

```bash
node data-validator.js [input_file] [output_file]
```

### 5. 图片处理 (image-processor.js)

处理图片URL和验证可访问性。

```bash
node image-processor.js [input_file] [output_file] [--validate]
```

### 6. 批量导入 (batch-import.js)

将数据导入到 pens.json 和 inks.json。

```bash
node batch-import.js [input_file] [--execute] [--no-backup] [--no-merge]
```

默认是dry-run模式，使用 `--execute` 实际执行导入。

### 7. 质量检查 (quality-check.js)

检查数据质量并生成报告。

```bash
node quality-check.js [data_file] [report_file]
```

### 8. 增量更新 (incremental-update.js)

仅更新新增或修改的数据。

```bash
node incremental-update.js [source_file] [--execute]
```

### 9. 完整流程 (run-full-pipeline.js)

执行完整的数据处理流程。

```bash
node run-full-pipeline.js [pens_count] [inks_count]
```

示例：
```bash
node run-full-pipeline.js 500 200
```

## 数据流程

```
原始数据 (raw/)
  ↓
数据映射 (mapper)
  ↓
数据清洗 (cleaner)
  ↓
数据验证 (validator)
  ↓
图片处理 (image-processor) [可选]
  ↓
批量导入 (batch-import)
  ↓
frontend/data/pens.json & inks.json
```

## 配置

数据源配置在 `others/config/data-sources.json` 中。

## 注意事项

1. 实际网页爬取需要遵守robots.txt和使用条款
2. 建议先使用示例数据测试流程
3. 导入前会自动创建备份
4. 默认使用dry-run模式，需要显式使用 `--execute` 才会实际修改文件

