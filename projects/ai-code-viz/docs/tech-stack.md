# AI Code Viz - 技术选型对比

## 1. 解析器选型

### 1.1 Tree-sitter ⭐ 推荐

**简介：** 增量解析器生成器，支持 50+ 语言

**优势：**
- ✅ 增量解析：仅重新解析变更部分，性能极佳
- ✅ 多语言支持：TypeScript、Python、Rust、Go 等
- ✅ 容错性强：代码有语法错误仍能解析
- ✅ WASM 支持：可在浏览器中运行
- ✅ 活跃社区：GitHub 维护，持续更新

**劣势：**
- ❌ 学习曲线：需要理解语法树结构
- ❌ 包体积：每个语言约 200-500KB

**适用场景：** 大型代码库、需要增量更新、多语言支持

**示例：**
```typescript
import Parser from 'web-tree-sitter';

const parser = new Parser();
const TypeScript = await Parser.Language.load('tree-sitter-typescript.wasm');
parser.setLanguage(TypeScript);

const tree = parser.parse(sourceCode);
```

---

### 1.2 Babel Parser

**简介：** JavaScript/TypeScript 专用解析器

**优势：**
- ✅ TS/JS 支持最完善
- ✅ 生态成熟（ESLint、Prettier 都在用）
- ✅ 文档丰富

**劣势：**
- ❌ 仅支持 JS/TS
- ❌ 不支持增量解析
- ❌ 无法在浏览器直接运行（需 Node.js）

**适用场景：** 纯 JS/TS 项目

---

### 1.3 Acorn

**简介：** 轻量级 JS 解析器

**优势：**
- ✅ 体积极小（~30KB）
- ✅ 解析速度快
- ✅ 插件生态

**劣势：**
- ❌ 仅支持 JS
- ❌ 功能较基础

**适用场景：** 简单 JS 项目

---

### 1.4 解析器对比总结

| 特性 | Tree-sitter | Babel | Acorn |
|------|-------------|-------|-------|
| 语言支持 | 50+ | JS/TS | JS |
| 增量解析 | ✅ | ❌ | ❌ |
| 浏览器支持 | ✅ (WASM) | ❌ | ✅ |
| 容错性 | 高 | 中 | 低 |
| 包体积 | 中 | 大 | 小 |
| 学习曲线 | 中 | 低 | 低 |

**结论：** 选择 **Tree-sitter**，支持多语言和增量解析是核心需求

---

## 2. 可视化库选型

### 2.1 React Flow ⭐ 推荐

**简介：** 基于 React 的节点图编辑器

**优势：**
- ✅ React 友好：组件化开发
- ✅ 开箱即用：内置拖拽、缩放、选择
- ✅ 自定义节点：完全可控的渲染
- ✅ 迷你地图、控制面板等内置功能
- ✅ 活跃维护：每周更新

**劣势：**
- ❌ 大规模性能：1000+ 节点需优化
- ❌ 布局需自行实现（配合 dagre/elk）

**适用场景：** 中小型代码库、React 项目

**示例：**
```tsx
import ReactFlow, { Background, Controls } from 'reactflow';

const nodes = [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'File A' } }];
const edges = [{ id: 'e1-2', source: '1', target: '2' }];

function CodeViz() {
  return (
    <ReactFlow nodes={nodes} edges={edges}>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
```

---

### 2.2 Cytoscape.js

**简介：** 专业的图论可视化库

**优势：**
- ✅ 性能优秀：支持 10000+ 节点
- ✅ 布局算法丰富：力导向、层级、圆形等
- ✅ 图论分析：路径查找、聚类等
- ✅ 不依赖框架

**劣势：**
- ❌ API 较底层：需要更多代码
- ❌ 样式配置复杂
- ❌ React 集成需额外封装

**适用场景：** 大型代码库、需要复杂布局

---

### 2.3 D3.js

**简介：** 数据驱动文档的可视化库

**优势：**
- ✅ 灵活性最高：完全可控
- ✅ 生态丰富：大量示例和插件
- ✅ 社区强大

**劣势：**
- ❌ 学习曲线陡峭
- ❌ 需要从头实现交互
- ❌ 代码量大

**适用场景：** 高度定制化需求

---

### 2.4 GoJS

**简介：** 商业图表库

**优势：**
- ✅ 功能全面：内置大量图表类型
- ✅ 性能优秀
- ✅ 商业支持

**劣势：**
- ❌ 收费：$3500/开发者
- ❌ 闭源

**适用场景：** 企业项目、有预算

---

### 2.5 可视化库对比总结

| 特性 | React Flow | Cytoscape.js | D3.js | GoJS |
|------|------------|--------------|-------|------|
| 上手难度 | 低 | 中 | 高 | 低 |
| 性能 | 中 | 高 | 中 | 高 |
| React 集成 | ✅ | ⚠️ | ⚠️ | ✅ |
| 布局算法 | 需外部 | 内置 | 需实现 | 内置 |
| 自定义程度 | 高 | 中 | 极高 | 中 |
| 成本 | 免费 | 免费 | 免费 | $3500 |
| 大规模支持 | 1000+ | 10000+ | 5000+ | 10000+ |

**结论：** 
- MVP 阶段：**React Flow**（快速迭代、React 友好）
- 大规模优化：可切换 **Cytoscape.js**

---

## 3. 布局算法选型

### 3.1 Dagre

**简介：** 层级图布局库

**优势：**
- ✅ 适合依赖图（有向无环图）
- ✅ 轻量级
- ✅ 与 React Flow 集成成熟

**劣势：**
- ❌ 仅支持层级布局

---

### 3.2 ELK.js

**简介：** Eclipse Layout Kernel 的 JS 版本

**优势：**
- ✅ 布局质量高
- ✅ 支持多种布局策略
- ✅ 可配置性强

**劣势：**
- ❌ WASM 加载较慢
- ❌ 配置复杂

---

### 3.3 布局选型结论

**MVP：** Dagre（简单、快速）
**进阶：** ELK.js（更优布局质量）

---

## 4. 其他技术选型

### 4.1 构建工具

| 工具 | 优势 | 选择 |
|------|------|------|
| Vite | 快速 HMR、配置简单 | ✅ 推荐 |
| Webpack | 生态成熟、插件多 | ⚠️ 备选 |
| esbuild | 极速构建 | ⚠️ 生态较新 |

**结论：** Vite

### 4.2 状态管理

| 工具 | 适用场景 | 选择 |
|------|----------|------|
| Zustand | 轻量、简单 | ✅ 推荐 |
| Redux | 复杂状态 | ❌ 过度 |
| Jotai | 原子状态 | ⚠️ 备选 |

**结论：** Zustand（代码库状态相对简单）

### 4.3 文件监听

| 工具 | 环境 | 选择 |
|------|------|------|
| chokidar | Node.js | ✅ 推荐（后端） |
| File System Access API | 浏览器 | ✅ 推荐（前端） |

---

## 5. 最终技术栈

```yaml
# 核心
parser: tree-sitter (WASM)
visualizer: reactflow
layout: dagre (MVP) → elk (进阶)

# 前端
framework: react 18+
build: vite
state: zustand
styling: tailwindcss

# 后端（可选）
runtime: node.js 20+
file-watch: chokidar
api: express / fastify

# 部署
hosting: vercel / netlify (前端)
docker: 可选（后端服务）
```

---

## 6. 依赖清单 (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "tree-sitter": "^0.20.0",
    "web-tree-sitter": "^0.20.0",
    "dagre": "^0.8.5",
    "zustand": "^4.5.0",
    "chokidar": "^3.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/dagre": "^0.7.52",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 7. 风险评估

| 风险 | 概率 | 影响 | 缓解方案 |
|------|------|------|----------|
| Tree-sitter WASM 加载慢 | 中 | 中 | 懒加载、CDN 预加载 |
| React Flow 性能瓶颈 | 中 | 高 | 虚拟滚动、节点聚合 |
| 多语言解析复杂性 | 高 | 中 | 先支持 TS，逐步扩展 |
| 大型代码库内存占用 | 中 | 高 | 流式解析、分块处理 |

---

## 8. 下一步

1. 初始化项目（Vite + React + TypeScript）
2. 集成 Tree-sitter WASM
3. 实现基础解析器
4. 集成 React Flow 展示
