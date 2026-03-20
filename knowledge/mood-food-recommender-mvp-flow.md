# Mood Food Recommender - MVP 项目全流程记录

**日期：** 2026-03-08  
**项目类型：** SEO 内容工具站  
**技术栈：** React 18 + Vite + Tailwind CSS v4  
**部署平台：** Vercel  
**域名：** https://whattoteatnow.vercel.app/

---

## 📋 项目概述

**核心功能：** 根据用户情绪推荐食物

**内容规模：**
- 6 种情绪选择（Happy, Sad, Stressed, Tired, Calm, Sick）
- 每种情绪 3 个食物推荐
- 24 个结构化 SEO 指南页面
- 6 个分类页面
- 6 篇 Markdown 文章
- **总计 37 个可索引页面**

---

## 🏗️ 项目架构

### 三层内容结构

**第一层：结构**
- `src/data/seoPages.json` - 24 个 SEO 页面数据
- `src/data/seoCategories.json` - 6 个分类数据
- `src/data/articles.json` - 6 个文章数据
- `src/utils/seoPageLoader.js` - 数据加载工具

**第二层：模板**
- `src/pages/SeoPage.jsx` - 通用 SEO 页面模板
- `src/pages/CategoryPage.jsx` - 通用分类页面模板

**第三层：路由**
- `/` - 首页工具
- `/guides/:slug` - SEO 指南页面
- `/category/:slug` - 分类页面
- `/articles/:slug` - Markdown 文章

### 核心设计原则

1. **数据驱动** - 新增页面只需改 JSON，不动代码
2. **可扩展** - 结构支持扩展到 100+ 页面
3. **SEO 优先** - 自动生成 sitemap，meta 标签完善
4. **MVP 思维** - 先验证核心价值，再扩展内容

---

## 🚀 Vercel 部署流程

### 步骤 1：GitHub 仓库准备

```bash
# 项目结构
MVP-Projects/
└── mood-food-recommender/
    ├── src/
    ├── public/
    ├── package.json
    └── README.md
```

**关键点：**
- 所有 MVP 项目放在一个仓库的子目录
- 每个项目独立子文件夹
- 便于管理和对比

### 步骤 2：Vercel 部署

1. 访问 https://vercel.com/new
2. Import Git Repository → 选择 `MVP-Projects`
3. **关键配置：**
   - Framework Preset: Vite
   - Root Directory: `mood-food-recommender`（必填！）
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 Deploy

### 步骤 3：设置自定义子域名

1. Vercel Dashboard → 选择项目
2. 左侧菜单 → **Domains**
3. 点击 **Add Existing**
4. 选择已有的 Vercel 子域名（如 `whattoteatnow.vercel.app`）
5. 点击 Add

---

## 🔄 域名变更流程

### 代码更新

**1. 更新 sitemap 生成脚本**
```js
// scripts/generate-sitemap.js
const BASE_URL = 'https://whattoteatnow.vercel.app';
```

**2. 更新 HTML meta 标签**
```html
<!-- index.html -->
<meta property="og:url" content="https://whattoteatnow.vercel.app/" />
```

**3. Commit + Push**
```bash
git add .
git commit -m "Update domain to whattoteatnow.vercel.app"
git push
```

**4. Vercel 自动重新部署**

---

## 🔍 Google Search Console 配置流程

### 步骤 1：添加资源

1. 访问 https://search.google.com/search-console
2. 点击 **"添加资源"**
3. 选择 **"网址前缀"**
4. 输入：`https://whattoteatnow.vercel.app/`

### 步骤 2：验证所有权

1. 选择 **"HTML 标签"** 验证方式
2. 复制 Google 提供的验证代码：
   ```html
   <meta name="google-site-verification" content="xxxxx" />
   ```
3. 添加到项目 `index.html` 的 `<head>` 中
4. Commit + Push
5. 回到 GSC 点击 **"验证"**

### 步骤 3：提交 Sitemap

1. GSC 左侧菜单 → **Sitemap**
2. 输入：`sitemap.xml`
3. 完整 URL：`https://whattoteatnow.vercel.app/sitemap.xml`
4. 点击 **提交**

### 步骤 4：等待收录

- Google 会在几天内开始爬取
- 可在 GSC 查看收录状态
- 新页面会自动加入（sitemap 自动生成）

---

## 🗺️ 自动生成 Sitemap 系统

### 脚本位置
`scripts/generate-sitemap.js`

### 功能
- 自动读取 `articles.json`, `seoPages.json`, `seoCategories.json`
- 生成符合 sitemaps.org 标准的 XML
- 包含所有页面（首页 + 文章 + 分类 + 指南）
- 错误处理健壮（文件缺失不崩溃）

### 使用方式

**手动生成：**
```bash
npm run generate:sitemap
```

**构建时自动生成：**
```bash
npm run build
# prebuild 钩子会自动先运行 generate:sitemap
```

### package.json 配置
```json
{
  "scripts": {
    "generate:sitemap": "node scripts/generate-sitemap.js",
    "prebuild": "npm run generate:sitemap",
    "build": "vite build"
  }
}
```

### 输出格式
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://whattoteatnow.vercel.app/</loc>
    <lastmod>2026-03-08</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://whattoteatnow.vercel.app/articles/what-to-eat-when-sad</loc>
    <lastmod>2026-03-08</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 📦 并行执行架构（Subagents）

### 使用场景
- 大型项目初始化
- 多文件同时创建
- 需要快速完成的任务

### 执行模式
```javascript
// 示例：5 个 agents 并行执行
sessions_spawn({
  mode: "run",
  runtime: "subagent",
  task: "任务描述",
  label: "agent1-task-name"
})
```

### 本次项目并行任务
| Agent | 任务 | 耗时 |
|-------|------|------|
| Agent 1 | seoPages.json (24 页面) | 57s |
| Agent 2 | seoCategories.json + 工具函数 | 19s |
| Agent 3 | SeoPage.jsx + CategoryPage.jsx | 26s |
| Agent 4 | 路由 + sitemap.xml | 29s |
| Agent 5 | InternalLinks 更新 | 17s |

**总耗时：** ~1 分钟（并行）vs ~5 分钟（串行）

---

## 🎯 MVP 核心原则

### 应该做 ✅
- 快速搭建核心功能
- 验证用户需求
- 收集真实反馈
- 小步快跑，快速迭代

### 不应该做 ❌
- 一次性做 100 个页面
- 添加不必要的功能
- 追求完美再发布
- 过度优化 SEO 细节

### 成功标准
- 用户能否根据情绪找到食物建议？
- 内容是否有帮助？
- 用户是否会分享/回访？

---

## 📁 仓库管理策略

### 孵化仓库模式
**一个仓库存放所有 MVP 项目：**
```
MVP-Projects/
├── mood-food-recommender/
├── next-project/
└── another-idea/
```

**好处：**
- 仓库数量可控
- 方便横向对比项目
- 失败项目不污染独立仓库
- 好管理

**部署方式：**
- Vercel Root Directory 指定子文件夹
- 每个项目独立部署

### 成功项目独立
**验证成功后可迁移到独立仓库：**
```bash
# 新仓库
mood-food-recommender-pro/
```

---

## 🛠️ 技术细节

### Tailwind CSS v4 配置
```css
/* src/index.css */
@import "tailwindcss";
```

**注意：** v4 语法变更，不再使用 `@tailwind base;` 等指令

### 动态导入 Markdown
```js
// src/utils/articleLoader.js
import whatToEatWhenSad from '../content/what-to-eat-when-sad.md?raw';

const articleContents = {
  'what-to-eat-when-sad.md': whatToEatWhenSad,
  // ...
};
```

### SEO 组件
```jsx
// src/components/SEO.jsx
function SEO({ title, description }) {
  useEffect(() => {
    document.title = title;
    // 设置 meta description, og:title, og:description 等
  }, [title, description]);
  return null;
}
```

---

## 📊 项目成果

### 代码统计
- **文件数：** 48 个
- **代码行数：** 2060 行
- **首次 Commit:** `321fa16`

### 内容统计
- **首页:** 1 个
- **文章页面:** 6 个
- **分类页面:** 6 个
- **指南页面:** 24 个
- **总计:** 37 个可索引 URL

### 外链配置
每个食物推荐包含外链：
- UberEats → "Order Online"
- DoorDash → "Order Online"
- Google Maps → "Find Nearby"

---

## 🔗 重要链接

| 类型 | 链接 |
|------|------|
| 生产环境 | https://whattoteatnow.vercel.app/ |
| GitHub 仓库 | https://github.com/rayvin1990/MVP-Projects |
| Vercel Dashboard | https://vercel.com/dashboard |
| Google Search Console | https://search.google.com/search-console |

---

## 📝 经验总结

### 成功之处
1. **并行执行架构** - 大幅缩短开发时间
2. **数据驱动设计** - 扩展内容无需改代码
3. **自动 sitemap** - SEO 友好，减少手动工作
4. **MVP 思维** - 快速上线验证

### 踩过的坑
1. **Tailwind v4 语法** - 旧教程用 v3 语法导致样式不生效
2. **GitHub 网络问题** - 配置代理后稳定
3. **Vercel Root Directory** - 必须指定子文件夹路径
4. **sitemap 域名** - 部署后要及时更新

### 下次改进
1. 项目初始化时就配置好 BASE_URL 环境变量
2. 添加部署后自动通知机制
3. 考虑添加简单的访问统计

---

**记录完成时间：** 2026-03-08 11:47  
**记录人：** Nia
