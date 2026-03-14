# CodingAgent Task: 创建上下文暂存工具项目

## Agent Name
CodingAgent

## Role
实现代码模块

## Goal
创建 Next.js 项目基础结构，实现上下文暂存与恢复的 MVP

## Inputs
- 技术栈: Next.js (App Router) + TypeScript + Tailwind
- 项目目录: `agent-workspace/projects/context-pause-mvp/`

## Outputs
- 可运行的 Next.js 项目
- 上下文数据模型
- 基础 UI（上下文列表、创建、恢复）

## Tools
- L1 (Read-only)
- L2 (Low-risk write)

## Execution Steps

### Step 1: 创建项目
```powershell
cd agent-workspace/projects
npx create-next-app@latest context-pause-mvp --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
```

### Step 2: 创建目录结构
```
app/
├── api/
│   └── contexts/
│       └── route.ts       # 上下文 CRUD API
├── page.tsx                # 主页面（上下文列表）
└── layout.tsx              # 布局
components/
├── ContextForm.tsx         # 创建上下文表单
├── ContextList.tsx         # 上下文列表
└── ContextCard.tsx         # 上下文卡片
lib/
├── types.ts                # TypeScript 类型
└── storage.ts             # 本地存储工具
```

### Step 3: 创建类型定义
```typescript
export interface Context {
  id: string;
  name: string;
  description: string;
  files: string[];
  commands: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}
```

### Step 4: 创建基础 UI
- 主页面：上下文列表
- 上下文卡片：展示上下文信息
- 创建表单：输入上下文名称、描述、文件、命令、备注

### Step 5: 实现本地存储
- 使用 localStorage
- CRUD 操作

### Step 6: 实现后端 API
- GET /api/contexts - 获取所有上下文
- POST /api/contexts - 创建上下文
- PUT /api/contexts/[id] - 更新上下文
- DELETE /api/contexts/[id] - 删除上下文

## Success Criteria
- [ ] Next.js 项目创建成功
- [ ] `npm run dev` 能启动
- [ ] 能创建上下文
- [ ] 能查看上下文列表
- [ ] 能删除上下文
- [ ] 本地存储工作

## Notes
- MVP 阶段只做手动暂存
- 先不集成 VSCode/浏览器扩展
- 专注于核心价值验证
