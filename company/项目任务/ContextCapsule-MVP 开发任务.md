# ContextCapsule MVP 开发任务

**任务编号：** TASK-CC-001  
**创建日期：** 2026-03-13  
**负责人：** Codex（临时全栈）  
**优先级：** P0  
**预计工期：** 2-3 天

---

## 📋 任务概述

开发 ContextCapsule Chrome 扩展 MVP，实现 AI 对话的本地存储、基础导出和搜索功能。

**产品定位：** 本地优先的 AI 上下文知识管理系统

**目标用户：** 美国/海外知识工作者、研究者、开发者

---

## 🎯 MVP 范围（P0 功能）

### 必须有（Missing = 不发布）

| 功能 | 说明 | 验收标准 |
|------|------|----------|
| 1. 扩展框架 | Chrome 扩展基础结构 | manifest v3，可安装运行 |
| 2. 对话捕获 | ChatGPT + Claude 页面内容提取 | 能提取完整对话内容 + 元数据 |
| 3. 本地存储 | IndexedDB 存储对话数据 | 刷新后数据不丢失 |
| 4. 基础导出 | Markdown 格式导出 | 保留代码块、标题格式 |
| 5. 简单搜索 | 关键词搜索对话 | 能搜到历史对话 |
| 6. 弹窗界面 | 扩展弹窗 UI | 显示对话列表 + 操作按钮 |

---

## 📁 项目结构

```
context-capsule/
├── manifest.json          # 扩展配置
├── src/
│   ├── popup/             # 弹窗界面
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── content/           # 内容脚本
│   │   ├── chatgpt.js     # ChatGPT 页面捕获
│   │   └── claude.js      # Claude 页面捕获
│   ├── background/        # 后台脚本
│   │   └── background.js
│   └── storage/           # 本地存储
│       └── indexeddb.js
├── assets/                # 图标等资源
│   └── icon-*.png
├── package.json
└── README.md
```

---

## 🔧 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 扩展框架 | Chrome Extension Manifest V3 | 最新标准 |
| 前端 | Vanilla JS + CSS | 轻量，无框架依赖 |
| 存储 | IndexedDB | 本地存储，容量大 |
| 构建 | Vite（可选） | 开发便利 |
| 部署 | Chrome Web Store | 最终发布渠道 |

---

## 📐 开发规范

### 代码规范
- 使用 ES6+ 语法
- 函数添加 JSDoc 注释
- 关键逻辑添加行内注释
- 变量命名清晰（英文）

### 安全要求
- 不收集任何用户数据
- 不发送数据到外部服务器
- 权限最小化（manifest 中声明必要权限）
- 代码开源（GitHub 仓库）

### 隐私保护
- 所有数据存储在本地（IndexedDB）
- 导出功能在浏览器内完成
- 不依赖任何后端服务

---

## 📅 开发计划

### Day 1: 框架 + 存储
- [ ] 创建项目结构
- [ ] 编写 manifest.json
- [ ] 实现 IndexedDB 封装
- [ ] 创建基础弹窗界面

### Day 2: 捕获逻辑
- [ ] ChatGPT 页面内容提取
- [ ] Claude 页面内容提取
- [ ] 数据存储到 IndexedDB
- [ ] 弹窗显示对话列表

### Day 3: 导出 + 搜索 + 测试
- [ ] Markdown 导出功能
- [ ] 关键词搜索功能
- [ ] 自测核心流程
- [ ] 编写 README

---

## ✅ 验收标准（DoD）

1. **功能验收：**
   - [ ] 能在 Chrome 中安装并运行
   - [ ] 能捕获 ChatGPT 对话
   - [ ] 能捕获 Claude 对话
   - [ ] 刷新页面后数据不丢失
   - [ ] 能导出 Markdown 文件
   - [ ] 能搜索历史对话

2. **代码验收：**
   - [ ] 无 console 错误
   - [ ] 代码有基本注释
   - [ ] manifest 权限最小化
   - [ ] README 包含安装说明

3. **安全验收：**
   - [ ] 无外部网络请求
   - [ ] 无数据收集代码
   - [ ] 隐私政策声明

---

## 📎 参考文档

- `company/市场调研/ContextCapsule-市场调研 -20260312.md`
- `company/用户反馈/ContextCapsule-用户验证报告 -20260312.md`
- `company/执行标准/Codex.md`

---

## 🚀 交付物

1. **代码仓库：** GitHub 公开仓库
2. **可安装扩展：** .crx 文件或未打包扩展目录
3. **README.md：** 安装和使用说明
4. **测试报告：** 核心功能测试记录

---

## 📞 沟通机制

- **阻塞问题：** 立即上报 Nia
- **进度更新：** 每日 18:00 更新任务文档
- **完成通知：** 通过 Nia 提交主任验收

---

**任务状态：** 🟡 进行中  
**创建人：** Nia  
**批准人：** 主任
