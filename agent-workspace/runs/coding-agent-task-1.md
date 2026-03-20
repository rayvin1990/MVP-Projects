# CodingAgent Task: 创建 Next.js 项目结构

## Agent Name
CodingAgent

## Role
实现代码模块

## Goal
创建 Next.js 项目基础结构，使用 App Router

## Inputs
- 技术栈: Next.js
- 目录: `agent-workspace/projects/image-to-prompt-mvp/`

## Outputs
- 可运行的 Next.js 项目
- 基础目录结构

## Tools
- L1 (Read-only)
- L2 (Low-risk write)

## Execution Steps

### Step 1: 创建项目目录
```powershell
New-Item -ItemType Directory -Path "agent-workspace/projects/image-to-prompt-mvp" -Force
```

### Step 2: 初始化 Next.js 项目
```powershell
cd agent-workspace/projects/image-to-prompt-mvp
npm create next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

### Step 3: 创建目录结构
```
app/
├── api/
│   └── generate/
│       └── route.ts       # 图片转提示词 API
├── page.tsx                # 主页面
├── layout.tsx              # 布局
└── globals.css
components/
├── ImageUploader.tsx       # 图片上传组件
└── PromptDisplay.tsx       # 提示词显示组件
lib/
└── types.ts                # TypeScript 类型定义
```

### Step 4: 创建基础文件
- `components/ImageUploader.tsx`
- `components/PromptDisplay.tsx`
- `lib/types.ts`
- `app/api/generate/route.ts`

## Success Criteria
- [ ] Next.js 项目创建成功
- [ ] `npm run dev` 能启动
- [ ] 基础目录结构完整
- [ ] 无编译错误

## Notes
- 使用 App Router（不是 Pages Router）
- 启用 TypeScript
- 使用 Tailwind CSS
- 先创建空文件，后续填充内容
