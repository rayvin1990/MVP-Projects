# Image to Prompt System

## Project Goal
构建一个 Next.js MVP 系统，用户上传图片，系统生成提示词。

## Current Status
✅ MVP 已完成，核心功能可用

## Architecture
```
Frontend: Next.js (App Router)
- 图片上传界面
- 提示词显示区域
- API Key 配置（可选）

Backend: Next.js API Routes
- 图片接收与处理
- 调用 Qwen3-VL-Plus API
- 返回提示词

API Provider: Qwen3-VL-Plus (Dashscope)
- API Key: sk-4f0f0d5dde074822b70d40ac48244d9d
- Model: qwen-vl-plus
- Status: ✅ 已测试通过
```

## Tasks
- [x] (P1) 创建 Next.js 项目结构
- [x] (P1) 实现前端上传界面
- [x] (P1) 实现后端 API（图片处理 + 提示词生成）
- [x] (P1) 前后端集成
- [x] (P2) MVP 验证

## Milestones
- [x] M1: 项目结构完成 + 上传界面可用
- [x] M2: API 完成 + 能生成提示词
- [x] M3: 前后端集成 + 系统可运行

## Definition of Done
- [x] 用户能上传图片
- [x] 系统能调用 API 生成提示词
- [x] 提示词能正确显示
- [x] 系统可运行（无报错）

## Key Decisions
- 使用 Qwen3-VL-Plus 作为视觉模型
- 图片转换为 Base64 传输
- 简洁的单页应用设计
- 暂不考虑持久化存储

## Next Steps (可选优化)
- [ ] 添加加载动画
- [ ] 支持多张图片批量上传
- [ ] 提示词编辑功能
- [ ] 历史记录保存
- [ ] 提示词复制到剪贴板
- [ ] 支持更多视觉模型选择
- [ ] 添加图片预览缩放
- [ ] 错误处理优化

## Risks
- API 调用频率限制（Qwen 有调用次数限制）
- 图片大小限制（当前限制 10MB）
- 网络超时处理

## Resources
- 项目路径: `C:\Users\57684\.openclaw\workspace\agent-workspace\projects\image-to-prompt-mvp`
- Qwen API 文档: https://dashscope.aliyuncs.com/
