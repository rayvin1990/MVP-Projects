# MEMORY.md - 长期记忆

## 用户偏好
- 主任偏好：简洁 > 繁琐，快速交付 > 完美功能
- 工作时区：GMT+8 (Asia/Shanghai)
- 项目风格：先 MVP 验证，再迭代优化

## 已完成项目
### 图片转提示词系统
- 路径：`agent-workspace/projects/image-to-prompt-mvp/`
- 技术栈：Next.js + Qwen3-VL-Plus API
- 状态：✅ MVP 完成
- 核心功能：图片上传 → 调用 Qwen API → 生成提示词

### 上下文暂存工具
- 路径：`agent-workspace/projects/context-pause-mvp/`
- 技术栈：Next.js + localStorage
- 状态：✅ MVP 完成（手动输入版本）
- 核心功能：创建/编辑/删除/查看上下文

### 文本扩展工具
- 路径：`agent-workspace/projects/text-expander/`
- 技术栈：Next.js + localStorage
- 状态：✅ MVP 完成
- 核心功能：文本片段管理（CRUD）+ 搜索 + 复制

## 技术栈偏好
- 前端：Next.js (App Router) + TypeScript + Tailwind CSS
- 后端：Next.js API Routes
- 存储：localStorage（MVP 阶段）
- 风格：简洁 UI，高对比度（黑色文字）

## 开发模式
- 先 MVP 验证核心价值
- 快速交付（1-2 小时）
- 获取用户反馈
- 迭代优化

## 待优化方向
- 文本扩展工具：快捷键集成、导入/导出
- 上下文工具：自动捕获集成（VSCode Extension）
