# CodingAgent Task: 创建 VSCode Extension

## Agent Name
CodingAgent

## Role
实现代码模块

## Goal
创建 VSCode Extension 基础项目结构

## Inputs
- 技术栈: TypeScript + VS Code API
- 项目目录: `agent-workspace/projects/context-snapshot-extension/`

## Outputs
- 可运行的 VSCode Extension 项目
- 基础配置（package.json, tsconfig.json）

## Tools
- L1 (Read-only)
- L2 (Low-risk write)

## Execution Steps

### Step 1: 安装脚手架
```bash
npm install -g yo generator-code
npm install -g generator-code-vscode
```

### Step 2: 创建项目
```bash
yo code-vscode
```
或者手动创建结构：
```
context-snapshot-extension/
├── src/
│   ├── extension.ts          # 主入口
│   ├── commands/             # 命令定义
│   │   ├── captureContext.ts
│   │   ├── restoreContext.ts
│   │   └── listContexts.ts
│   └── types.ts             # 类型定义
├── package.json               # Extension 配置
├── tsconfig.json             # TypeScript 配置
├── vsc-extension-quickstart.mdapi/
│   ├── package.json           # VS Code 配置
│   └── schema.json           # JSON Schema
└── README.md
```

### Step 3: 配置 package.json
- Extension 名称: Context Snapshot
- ID: context-snapshot
- 命令:
  - `context.capture` - 捕获当前上下文
  - `context.restore` - 恢复上下文
  - `context.list` - 查看所有上下文

### Step 4: 实现基础命令
- 捕获命令：获取当前打开的文件
- 恢复命令：打开指定文件
- 列表命令：显示所有快照

## Success Criteria
- [ ] VSCode Extension 项目创建成功
- [ ] `npm install` 能执行
- [ ] `vsce package` 能打包
- [ ] 基础命令定义完成

## Notes
- MVP 阶段先实现捕获和恢复
- Web Dashboard 通信后续实现
