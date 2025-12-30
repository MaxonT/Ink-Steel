# 项目导航

快速了解项目结构和如何使用。

## 🗂️ 目录结构

```
Ink&Steel/
├── frontend/              # ✅ 前端代码（主要工作目录）
│   ├── assets/
│   │   ├── scripts/
│   │   │   ├── components/  # Web Components
│   │   │   └── utils/       # 工具函数
│   │   └── styles/          # CSS 样式
│   ├── data/                # 数据文件
│   │   ├── pens.json       # 钢笔数据
│   │   └── inks.json       # 墨水数据
│   ├── public/             # 静态资源
│   └── *.html              # 页面文件
│
├── others/                # 🔧 数据处理和工具
│   ├── lib/               # 共享库
│   ├── pipelines/         # 数据管道（主要入口）
│   ├── scripts/           # 独立脚本
│   ├── config/            # 配置文件
│   ├── data/              # 临时数据
│   └── docs/              # 脚本文档
│
└── *.md                   # 📚 项目文档
```

## 🚀 快速开始

### 本地运行前端
```bash
cd frontend
python -m http.server 8000
# 访问 http://localhost:8000
```

### 运行数据管道
```bash
cd others/pipelines
node image-acquisition.js all
```

### 测试修复效果
访问：http://localhost:8000/test-fixes.html

## 📚 核心文档

| 文档 | 说明 |
|------|------|
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | 完整实施计划和修复说明 |
| [others/docs/PIPELINE.md](others/docs/PIPELINE.md) | 数据管道运行指南 |
| [others/docs/SCRIPT_REFERENCE.md](others/docs/SCRIPT_REFERENCE.md) | 脚本速查表 |
| [LAUNCH_READY.md](LAUNCH_READY.md) | 上线准备清单 |
| [README.md](README.md) | 项目说明 |

## 🎯 常见任务

### 添加新钢笔
1. 编辑 `frontend/data/pens.json`
2. 运行：`node others/pipelines/image-acquisition.js pens`
3. 验证页面显示

### 添加新墨水
1. 编辑 `frontend/data/inks.json`
2. 运行：`node others/pipelines/image-acquisition.js inks`
3. 检查颜色显示

### 更新图片
```bash
cd others/pipelines
node image-acquisition.js all
```

## 🔍 故障排查

遇到问题？查看：
- [others/docs/PIPELINE.md](others/docs/PIPELINE.md) - 管道故障排查
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - 已知问题和解决方案

## 📊 项目状态

### ✅ 已完成
- Pen/Ink Details 无限 loading 修复
- Ink 颜色去歧义显示
- 图片资产管道建设
- 代码结构整理

### 🔜 待完成
- 收集真实图片
- 图片健康检查
- 性能优化

详见：[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

---

*最后更新：2025年12月30日*
