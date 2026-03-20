# Context Pause & Resume - 上下文暂存与恢复工具

## Project Goal
开发一个帮助开发者减少上下文切换损失的工具，核心功能：上下文暂存 + 恢复

## Current Status
🎯 规划中，准备开始 MVP 开发

## Architecture
```
Frontend: Next.js (App Router)
- 上下文列表
- 暂存/恢复按钮
- 上下文详情页

Backend: Next.js API Routes
- 上下文 CRUD
- 浏览器 Extension 集成
- VSCode Extension 集成

Storage: 本地优先 (localStorage/IndexedDB)
- 可选：云端同步
```

## Tasks
- [ ] (P1) 项目结构创建
- [ ] (P1) 上下文暂存功能（手动）
- [ ] (P1) 上下文恢复功能
- [ ] (P1) 上下文列表展示
- [ ] (P2) 自动捕获集成（浏览器扩展）
- [ ] (P2) 自动捕获集成（VSCode 扩展）
- [ ] (P2) 智能建议（上下文切换统计）
- [ ] (P2) 云端同步

## Milestones
- M1: MVP 基础功能（手动暂存 + 恢复）
- M2: 浏览器扩展集成
- M3: VSCode 扩展集成

## Definition of Done (MVP)
- [ ] 用户能手动创建上下文
- [ ] 用户能手动恢复上下文
- [ ] 上下文列表展示
- [ ] 上下文编辑/删除
- [ ] 本地存储工作

## Risks
- 用户是否真的需要"上下文暂存"？
- 自动捕获技术复杂度
- VSCode/浏览器扩展开发门槛

## Key Hypotheses
1. 开发者愿意手动记录上下文（而不是依赖自动捕获）
2. 上下文恢复能显著减少重新进入心流的时间
3. 简单的文本备注比复杂的自动捕获更有效

## Next Steps
1. 创建项目结构
2. 实现上下文数据模型
3. 实现手动暂存/恢复 UI
4. 测试核心流程
5. 获取用户反馈
