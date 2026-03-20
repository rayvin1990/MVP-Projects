# Context Snapshot - 上下文快照工具

## Project Goal
开发一个能自动捕获和恢复开发者上下文的工具（VSCode Extension + Web Dashboard）

## Current Status
🎯 重新规划中

## Architecture
```
VSCode Extension:
- 自动捕获打开的文件
- 自动捕获运行的终端命令
- 一键生成快照
- 一键恢复上下文

Web Dashboard (Next.js):
- 展示快照列表
- 快照详情查看
- 导出/导入功能
```

## Tasks
- [ ] (P1) VSCode Extension 项目初始化
- [ ] (P1) VSCode Extension: 捕获活动编辑器
- [ ] (P1) VSCode Extension: 捕获终端输出
- [ ] (P1) VSCode Extension: 快照生成功能
- [ ] (P1) VSCode Extension: 快照恢复功能
- [ ] (P1) Web Dashboard: 重新设计（适配快照）
- [ ] (P2) Extension 与 Web 通信（WebSocket）
- [ ] (P2) 导出/导入功能
- [ ] (P2) 打包发布到 VS Code 市场

## Milestones
- M1: VSCode Extension MVP（捕获 + 快照）
- M2: Web Dashboard 适配
- M3: Extension 与 Web 通信
- M4: 打包发布

## Definition of Done (MVP)
- [ ] VSCode Extension 能捕获当前编辑器状态
- [ ] 能生成快照（包含文件、命令）
- [ ] Web Dashboard 能显示快照
- [ ] 能导出快照为 JSON

## Key Hypotheses
1. 开发者愿意安装 Extension（如果真正节省时间）
2. 自动捕获比手动输入更受欢迎
3. Extension 开发门槛可接受（约 1-2 天）

## Next Steps
1. 初始化 VSCode Extension 项目
2. 实现捕获功能
3. 实现快照生成
4. Web Dashboard 适配
