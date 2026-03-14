# AI 代码可视化工具

**状态：** 🟢 已立项  
**优先级：** P0  
**市场评分：** 8.5/10  
**立项时间：** 2026-03-14

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

---

## 🎯 项目目标

解决 Vibe Coding 后遗症状：
- AI 生成代码后失去代码库心理模型
- 无法可视化文件/函数连接关系
- 重构时害怕破坏"魔法"

---

## 📋 MVP 功能范围（Phase 1）

**状态：** ✅ 主任已确认  
**预计工时：** 2-3 天

### 核心功能

1. **代码依赖图可视化**
   - [x] 文件间调用关系
   - [x] 函数依赖链
   - [x] 交互式图形界面

2. **数据流追踪**
   - [x] 变量传递路径
   - [x] 组件间数据流动

3. **快速导航**
   - [x] 点击节点跳转到代码
   - [x] 搜索功能

---

## 🏗️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | React + Vite | 19.x / 7.x |
| **可视化库** | React Flow | 12.x |
| **样式** | TailwindCSS | 4.x |
| **语言** | TypeScript | 5.9.x |
| **部署** | Vercel | - |
| **语言分析** | Tree-sitter (WASM) | TBD |

---

## 👥 团队分工

| 角色 | 负责人 | 任务 |
|------|--------|------|
| **项目经理** | Nia | 任务拆解/进度跟踪 |
| **架构设计** | Codex | 技术方案设计 |
| **前端实现** | Claude Code | UI + 可视化核心 |
| **测试** | Codex | 测试用例 + 安全扫描 |
| **部署** | Claude Code | Vercel 部署 |

---

## 📅 里程碑

| 阶段 | 目标 | 预计完成 |
|------|------|----------|
| **架构设计** | 技术方案确定 | Day 1 |
| **MVP 开发** | Phase 1 功能完成 | Day 3 |
| **测试部署** | 测试通过 + 上线 | Day 4 |

---

## 🗂️ 项目结构

```
ai-code-viz/
├── src/
│   ├── components/      # React 组件
│   │   ├── CodeFlow.tsx    # 代码流程图组件
│   │   └── index.ts
│   ├── hooks/           # 自定义 Hooks
│   ├── types/           # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   └── mockData.ts  # 示例数据
│   ├── App.tsx          # 主应用组件
│   ├── App.css
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── docs/                # 项目文档
│   └── task-001-architecture.md
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 📊 当前进度

| 任务 | 状态 | 完成时间 |
|------|------|----------|
| Task 001: 架构设计 | 🟡 待开始 | - |
| Task 002: 项目初始化 | ✅ 已完成 | 2026-03-14 |
| Task 003: 核心组件开发 | ⚪ 未开始 | - |
| Task 004: 代码解析器 | ⚪ 未开始 | - |
| Task 005: 测试与部署 | ⚪ 未开始 | - |

---

## 📝 Git 规范

### Commit 频率
- 每个任务完成后立即 commit
- Commit 后立即 push

### Commit 格式
```bash
git commit -m "<type>: <description>"
git push
```

---

**最后更新：** 2026-03-14  
**创建人：** Nia（项目经理）
