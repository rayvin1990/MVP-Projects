# 奥特任务：修复 ACP 电话机问题

**创建时间：** 2026-03-19 15:35  
**负责人：** 奥特（Codex）  
**优先级：** P0  
**状态：** 待开始

---

## 📋 问题描述

**ACP 不可用原因：**
- openclaw 期望 acpx 版本：`0.1.16`
- 实际安装的 acpx 版本：`0.3.0`
- 结果：`acpx runtime setup failed: version mismatch`

**影响：**
- ❌ 无法用 `sessions_spawn` 调用子 agent
- ✅ 飞书长连接正常
- ✅ 共享记忆区正常

---

## 🎯 任务目标

**研究并解决 acpx 版本不匹配问题**

---

## 🔍 分析方向

### 1. 版本来源调查
- [ ] openclaw 在哪里硬编码了 `0.1.16`？
- [ ] 为什么实际安装的是 `0.3.0`？
- [ ] `0.1.16` 版本是否存在？

### 2. 可能的解决方案
- [ ] 能否降级 acpx 到 0.1.16？
- [ ] 能否修改 openclaw 期望版本到 0.3.0？
- [ ] 能否绕过版本检查？
- [ ] 是否有其他配置项？

### 3. 代码位置
- openclaw 源码：`C:\Users\57684\AppData\Roaming\npm\node_modules\openclaw\`
- acpx 扩展：`extensions\acpx\`
- 配置文件：`~/.openclaw/openclaw.json`, `~/.acpx/config.json`

---

## 💡 建议方案

**方案 A：修改 openclaw 期望版本**
- 找到硬编码 `0.1.16` 的位置
- 改为 `0.3.0` 或 `"any"`

**方案 B：安装正确版本的 acpx**
- 如果 `0.1.16` 存在，下载安装
- 替换扩展目录的 acpx

**方案 C：绕过版本检查**
- 找到版本检查代码
- 临时禁用或修改逻辑

**方案 D：等官方修复**
- 提交 issue 给 openclaw 官方
- 等待更新

---

## 📝 汇报格式

```
ACP 问题分析报告：
- 根因：[问题根源]
- 方案：[建议方案 A/B/C/D]
- 步骤：[具体执行步骤]
- 风险：[可能的风险]
- 建议：[推荐方案]
```

---

## 📂 工作位置

- 任务读取：`/memory/roles/operating/tasks/`
- openclaw 源码：`~/.openclaw/` / `~\AppData\Roaming\npm\node_modules\openclaw\`
- 分析报告：`/memory/reports/acp-analysis.md`

---

**备注：** 主任指示"奥特模型强大，国外的嘛"，充分利用技术能力解决这个问题。
