# Ink & Steel - 钢笔图鉴网站

一个美观优雅的钢笔大合集网站，包含详细的钢笔信息（型号、类型、品牌、尺寸、图片等）和购买链接。

## 项目结构

```
Ink&Steel/
├── frontend/           # 前端代码
│   ├── assets/        # 资源文件（样式、脚本）
│   ├── data/          # 数据文件
│   ├── public/        # 公共文件（manifest、robots.txt等）
│   └── *.html         # HTML页面
├── backend/           # 后端代码（预留）
└── others/            # 其他文件
    └── docs/          # 文档
```

## 项目特点

- 📝 超级详细的钢笔信息（尺寸、规格、材料等）
- 🖼️ 多角度图片展示
- 🔗 购买链接管理
- 🔍 高级搜索和过滤功能
- 🎨 优雅美观的用户界面
- 📊 品牌浏览和统计

## 开发

这是一个静态网站项目，使用：
- HTML5
- Vanilla JavaScript (ES6+)
- Web Components
- Tailwind CSS
- JSON 数据存储

## 设计系统

项目遵循严格的UI宪法，使用设计令牌系统：
- 8px间距系统
- 统一的字体层级
- 一致的圆角和阴影
- 完整的交互状态（hover, focus, disabled等）

所有样式值来自 `frontend/assets/styles/tokens.css`，禁止硬编码。

## 许可证

MIT License
