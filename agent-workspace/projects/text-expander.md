# Text Expander - 文本扩展工具

## Project Goal
开发一个简单的文本扩展工具，帮助用户快速插入常用文本片段

## Current Status
🎯 开发中

## Architecture
```
Frontend: Next.js (App Router)
- 文本片段管理（CRUD）
- 快捷键测试
- 实时预览
- 搜索和过滤

Storage: localStorage
- 文本片段数据
- 快捷键配置

UI Components:
- SnippetList (片段列表)
- SnippetForm (创建/编辑）
- SnippetCard (片段卡片）
- SearchBar (搜索）
```

## Tasks
- [ ] (P1) 项目结构创建
- [ ] (P1) 数据模型定义
- [ ] (P1) 片段列表组件
- [ ] (P1) 创建/编辑表单
- [ ] (P1) 搜索功能
- [ ] (P1) 快捷键插入功能
- [ ] (P2) 分类/标签系统
- [ ] (P2) 导入/导出

## Milestones
- M1: MVP 基础功能（CRUD + 搜索）
- M2: 快捷键集成
- M3: 实时预览

## Definition of Done (MVP)
- [ ] 用户能创建文本片段
- [ ] 用户能编辑文本片段
- [ ] 用户能删除文本片段
- [ ] 能搜索片段
- [ ] 能一键复制到剪贴板
- [ ] 本地存储工作

## Key Hypotheses
1. 用户愿意手动管理文本片段（不需要自动捕获）
2. 快捷键功能会显著提升使用体验
3. 简洁的 UI 比复杂功能更重要

## Next Steps
1. 创建 Next.js 项目
2. 实现数据模型
3. 实现片段管理 UI
4. 实现搜索和复制功能
5. 测试核心流程
