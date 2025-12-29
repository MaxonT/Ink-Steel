# 网站完整修复清单 - Master Checklist

## 阶段1: 基础路径和链接修复

### 1.1 Manifest链接修复
- [ ] 修复所有HTML文件的manifest.json链接（13个文件）
  - [ ] 404.html
  - [ ] about.html
  - [ ] blog.html
  - [ ] brands.html
  - [ ] care.html
  - [ ] compare.html
  - [ ] contact.html
  - [ ] favorites.html
  - [ ] history.html
  - [ ] ink-detail.html
  - [ ] inks.html
  - [ ] pen-detail.html
  - [ ] stats.html
  - 所有文件都应该添加: `<link rel="manifest" href="public/manifest.json">`

### 1.2 Service Worker注册
- [ ] 检查service worker注册代码位置
- [ ] 在所有主要HTML页面添加service worker注册代码
- [ ] 确保注册路径正确（public/service-worker.js）

### 1.3 Service Worker内部路径
- [ ] 修复service-worker.js中的manifest.json路径
- [ ] 确保所有静态资源路径正确
- [ ] 检查BASE_PATH逻辑是否正确

### 1.4 数据文件路径
- [ ] 修复sitemap-generator.js中的数据路径（/data/ -> data/）
- [ ] 检查所有JS文件中的数据文件路径引用
- [ ] 确保所有路径使用相对路径

## 阶段2: 资源路径一致性

### 2.1 CSS文件路径
- [ ] 验证所有HTML文件的CSS路径一致
- [ ] 确保所有页面使用相同的CSS文件（tokens.css, states.css, main.css）
- [ ] 检查路径是否正确（assets/styles/）

### 2.2 JS文件路径
- [ ] 验证所有HTML文件的JS路径一致
- [ ] 确保组件加载路径正确（assets/scripts/components/）
- [ ] 确保工具函数路径正确（assets/scripts/utils/）

### 2.3 图片和媒体资源
- [ ] 检查manifest.json中的图标路径（已修复为空数组）
- [ ] 验证所有图片路径正确
- [ ] 检查占位图片URL是否有效

## 阶段3: 内部链接和导航

### 3.1 HTML页面间链接
- [ ] 检查所有内部链接（<a href>）
- [ ] 修复断链（blog文章链接）
- [ ] 确保导航栏链接正确
- [ ] 验证所有页面可以相互访问

### 3.2 页面路由
- [ ] 检查pen-detail.html的URL参数处理
- [ ] 检查ink-detail.html的URL参数处理
- [ ] 验证404页面正确显示
- [ ] 验证离线页面功能

## 阶段4: 逻辑错误修复

### 4.1 数据加载逻辑
- [ ] 检查index.html的数据加载函数
- [ ] 验证loadPens()函数存在且正确
- [ ] 检查数据加载错误处理
- [ ] 验证loading状态显示

### 4.2 搜索和过滤功能
- [ ] 检查搜索功能是否正常工作
- [ ] 验证过滤器功能
- [ ] 检查排序功能
- [ ] 验证分页逻辑（如果存在）

### 4.3 详情页面功能
- [ ] 检查pen-detail页面的数据加载
- [ ] 检查ink-detail页面的数据加载
- [ ] 验证图片展示功能
- [ ] 检查购买链接显示

### 4.4 收藏和历史功能
- [ ] 检查收藏功能（localStorage）
- [ ] 检查浏览历史功能
- [ ] 验证数据持久化

### 4.5 比较功能
- [ ] 检查钢笔比较功能
- [ ] 验证比较页面显示
- [ ] 检查比较项添加/删除

## 阶段5: 用户体验优化

### 5.1 加载状态
- [ ] 检查所有页面的loading状态
- [ ] 验证skeleton screen显示
- [ ] 检查错误状态显示
- [ ] 验证空状态显示

### 5.2 响应式设计
- [ ] 测试移动端显示（390px）
- [ ] 测试平板显示（768px）
- [ ] 测试桌面显示（1280px）
- [ ] 检查所有断点的布局

### 5.3 可访问性
- [ ] 检查键盘导航
- [ ] 验证focus状态
- [ ] 检查ARIA标签
- [ ] 验证颜色对比度

### 5.4 性能优化
- [ ] 检查资源加载顺序
- [ ] 验证懒加载（如果存在）
- [ ] 检查缓存策略
- [ ] 验证Service Worker缓存

## 阶段6: SEO和元数据

### 6.1 Meta标签
- [ ] 检查所有页面的title标签
- [ ] 验证description meta标签
- [ ] 检查Open Graph标签
- [ ] 验证Twitter Card标签

### 6.2 结构化数据
- [ ] 检查JSON-LD结构化数据
- [ ] 验证sitemap.xml
- [ ] 检查robots.txt
- [ ] 验证canonical链接

## 阶段7: 错误处理

### 7.1 JavaScript错误
- [ ] 检查错误处理函数
- [ ] 验证错误消息显示
- [ ] 检查控制台错误
- [ ] 验证错误恢复机制

### 7.2 网络错误
- [ ] 检查网络请求错误处理
- [ ] 验证超时处理
- [ ] 检查离线状态处理
- [ ] 验证重试机制

### 7.3 数据验证
- [ ] 检查数据格式验证
- [ ] 验证缺失字段处理
- [ ] 检查数据类型验证
- [ ] 验证边界情况

## 阶段8: 最终验证

### 8.1 功能测试
- [ ] 测试所有主要功能
- [ ] 验证所有页面可访问
- [ ] 检查所有交互功能
- [ ] 验证数据流

### 8.2 浏览器兼容性
- [ ] 测试Chrome
- [ ] 测试Firefox
- [ ] 测试Safari
- [ ] 测试Edge

### 8.3 部署准备
- [ ] 验证所有路径在部署环境下正确
- [ ] 检查Service Worker在HTTPS下工作
- [ ] 验证manifest.json正确
- [ ] 检查所有外部资源加载

## 修复优先级

**高优先级（必须立即修复）:**
1. Manifest链接（影响PWA功能）
2. Service Worker注册（影响离线功能）
3. 数据加载逻辑（核心功能）
4. 路径错误（导致资源加载失败）

**中优先级（重要功能）:**
5. 内部链接
6. 详情页面功能
7. 搜索和过滤

**低优先级（优化）:**
8. SEO优化
9. 性能优化
10. 浏览器兼容性

## 验证标准

每个修复完成后，必须验证：
1. ✅ 功能正常工作
2. ✅ 没有控制台错误
3. ✅ 路径正确
4. ✅ 代码符合项目规范
5. ✅ 不影响其他功能

