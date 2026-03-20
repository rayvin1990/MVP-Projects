# OpenClaw 智能系统 - 完整使用指南

**版本:** v4.0  
**日期:** 2026-03-10  
**系统:** DeepInsight Core + Memory System 2.0

---

## 📖 目录

1. [系统概览](#系统概览)
2. [DeepInsight Core - 战略分析系统](#deepinsight-core---战略分析系统)
3. [Memory System 2.0 - 记忆管理系统](#memory-system-20---记忆管理系统)
4. [快速开始](#快速开始)
5. [常见问题](#常见问题)

---

## 系统概览

### 两大核心系统

```
┌─────────────────────────────────────────────────────────┐
│           OpenClaw 智能系统 v4.0                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🧠 DeepInsight Core v4.0                              │
│     定位：战略决策系统                                  │
│     用途：分析战略问题、生成决策包                      │
│     特点：问题驱动、深度推理、沙盘推演                  │
│                                                         │
│  💾 Memory System 2.0                                  │
│     定位：记忆管理系统                                  │
│     用途：记录记忆、防止遗忘、自动清理                  │
│     特点：分级管理、自动提炼、心跳集成                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 使用场景对比

| 场景 | 使用系统 | 示例 |
|------|----------|------|
| **战略决策** | DeepInsight Core | "是否应该进入 AI 写作市场？" |
| **产品开发** | DeepInsight + Commander-X | 先分析再开发 |
| **日常记录** | Memory System | 记录每日工作 |
| **防止遗忘** | Memory System | 任务提醒、记忆搜索 |
| **项目复盘** | Memory System | 搜索历史记录 |

---

## DeepInsight Core - 战略分析系统

### 🎯 系统定位

**问题驱动** 的战略决策系统，提供深度分析和决策支持。

---

### 📁 文件位置

```
projects/multi-agent-system/
├── deep_insight_core.py      # 统一入口
├── dr_insight.py             # 首席战略研究员
├── sandbox.py                # 战略推演沙盘
├── bvare_search.py           # Bvare AI Search
├── heartbeat.py              # 心跳监控
├── README_DEEP_INSIGHT.md    # 使用文档
└── TEST_REPORT.md            # 测试报告
```

---

### 🚀 快速开始

**运行测试:**
```bash
cd projects/multi-agent-system
python deep_insight_core.py
```

**输出示例:**
```
🚀 DeepInsight Core 系统启动
🎯 接收战略问题：在书签管理工具市场如何定位产品？
📋 步骤 1: 构建分析框架 → 波特五力模型
📋 步骤 2: 确认分析框架
📋 步骤 3: 数据狩猎
📋 步骤 4: 战略推演沙盘
📋 步骤 5: 生成决策包

📦 决策包
策略：推出免费 + 付费增值模式
建议：不推荐，建议重新设计策略
置信度：低
平均成功概率：21.0%
```

---

### 🔄 5 步深度推理循环

```
1️⃣ 接收战略问题
   "是否应该进入 AI 写作助手市场？"
   ↓
2️⃣ 构建分析框架
   "建议使用波特五力模型 + 技术成熟度曲线"
   ↓
3️⃣ 数据狩猎
   - 调用 Bvare AI Search
   - 验证假设（支持 + 反面证据）
   ↓
4️⃣ 沙盘推演
   - 乐观场景：成功 65%
   - 中性场景：成功 45%
   - 悲观场景：成功 20%
   ↓
5️⃣ 交付决策包
   - 建议 + 置信度 + 风险 + 备用方案
```

---

### 📊 内置分析模型

| 模型 | 用途 | 触发关键词 |
|------|------|------------|
| **波特五力** | 行业竞争分析 | 竞争、市场、行业 |
| **SWOT** | 优势劣势分析 | 优势、劣势、SWOT |
| **PESTEL** | 宏观环境分析 | 宏观、政策、环境 |
| **麦肯锡七步** | 系统化问题 | 战略、方向 |

---

### 📦 决策包结构

```json
{
  "strategy": "策略名称",
  "recommendation": "推荐/谨慎/不推荐",
  "confidence_level": "高/中/低",
  "average_success_probability": "XX%",
  
  "scenarios": [
    {
      "name": "乐观场景",
      "success_probability": "XX%",
      "expected_outcome": {"roi": "XX%", "timeline": "X 个月"}
    }
  ],
  
  "counterfactual_analysis": {
    "assumption": "关键假设",
    "backup_plan": "备用方案",
    "early_warning_signals": [...]
  },
  
  "final_advice": "最终建议"
}
```

---

### 💡 使用示例

**示例 1: 市场进入决策**

```bash
# 编辑 deep_insight_core.py
# 修改问题为：
question = "在 AI 工具爆发的背景下，我们是否应该进入 AI 写作助手市场？"

# 运行
python deep_insight_core.py
```

**输出:**
```
📦 决策包
建议：谨慎进入
置信度：中
平均成功概率：43%
最终建议：建议小步快跑，先验证核心假设
```

---

**示例 2: 技术路线选择**

```python
# 在 Python 中使用
from deep_insight_core import DeepInsightCore

core = DeepInsightCore()
decision = core.ask("应该选择纯前端方案还是前后端分离架构？")

print(f"建议：{decision['recommendation']}")
print(f"置信度：{decision['confidence_level']}")
```

---

### ⚙️ 配置说明

**环境变量（可选）:**
```powershell
# 配置 Bvare API Key（使用真实全球数据）
$env:BVARE_API_KEY="你的-bvare-api-key"

# 不配置则使用降级模式（模拟数据）
```

**配置文件:**
```json
// config_v3.json
{
  "heartbeat": {
    "enabled": true,
    "pulse": {"frequency": 5, "timeout": 10}
  },
  "bvare": {
    "enabled": true,
    "api_key_env": "BVARE_API_KEY"
  }
}
```

---

### 📋 常用命令

| 命令 | 作用 |
|------|------|
| `python deep_insight_core.py` | 运行快速测试 |
| `python test_custom.py` | 自定义问题测试 |
| `python -c "from deep_insight_core import DeepInsightCore; c = DeepInsightCore(); c.ask('问题')"` | 一行命令测试 |

---

### 🎯 最佳实践

**1. 与 Commander-X 配合**

```
步骤 1: DeepInsight Core 分析战略
  "是否应该进入书签管理市场？"
  → 决策包：建议进入，差异化定位

步骤 2: Commander-X 执行开发
  "开发差异化书签管理工具"
  → 产品：45KB 单页应用
```

**2. 记录决策到记忆系统**

```bash
# 分析完成后
# 编辑 memory/YYYY-MM-DD.md
# 记录决策包内容
```

---

## Memory System 2.0 - 记忆管理系统

### 🎯 系统定位

**防止遗忘** 的记忆管理系统，分级管理 + 自动清理。

---

### 📁 文件位置

```
workspace/
├── MEMORY.md                              # ⭐ 长期记忆
├── memory/
│   ├── YYYY-MM-DD.md                     # 📝 中期记忆
│   ├── daily/                            # 🗑️ 短期记忆
│   └── tasks.json                        # 任务列表
└── projects/memory-system-v2/
    ├── main.py                           # 主入口
    ├── cleanup.py                        # 清理模块
    ├── GUIDE.md                          # 使用指南
    └── CLEANUP_GUIDE.md                  # 清理指南
```

---

### 🚀 快速开始

**检查状态:**
```bash
cd projects/memory-system-v2
python main.py check
```

**输出示例:**
```
🔍 检查遗忘风险...
✅ 长期记忆文件存在
✅ 今日记忆文件已创建
🔴 高优先级任务：2 个
⚠️ 过期任务：2 个
💓 心跳状态：OK
```

---

### 📊 记忆分级体系

```
┌─────────────────────────────────────┐
│ 💎 长期记忆 (MEMORY.md)            │
│ ⏰ 永久保存                         │
│ 重要决策、核心身份、项目里程碑      │
└─────────────────────────────────────┘
              ⬆️ 每周提炼
┌─────────────────────────────────────┐
│ 📝 中期记忆 (memory/YYYY-MM-DD.md) │
│ ⏰ 保留 30 天                        │
│ 日常事项、普通任务、会议纪要        │
└─────────────────────────────────────┘
              ⬆️ 自动清理
┌─────────────────────────────────────┐
│ 🗑️  短期记忆 (memory/daily/)        │
│ ⏰ 保留 7 天                         │
│ 草稿、临时笔记、未分类内容          │
└─────────────────────────────────────┘
```

---

### 🗑️ 自动清理规则

| 记忆级别 | 保留期限 | 清理动作 | 执行时间 |
|----------|----------|----------|----------|
| **短期** | 7 天 | 删除 | 每周日 22:00 |
| **中期** | 30 天 | 提炼 + 归档 | 每周日 22:00 |
| **中期** | 60 天 | 直接归档 | 每月 1 号 |
| **长期** | 永久 | 不清理 | - |

---

### 📋 常用命令

| 命令 | 作用 |
|------|------|
| `python main.py check` | 检查遗忘风险 |
| `python main.py heartbeat` | 心跳检查 |
| `python main.py tasks` | 查看待办任务 |
| `python main.py add-task "任务"` | 添加任务 |
| `python main.py complete-task task_001` | 完成任务 |
| `python main.py search "关键词"` | 搜索记忆 |
| `python main.py auto-summarize 7` | 提炼最近 7 天 |
| `python main.py cleanup-preview` | 预览清理 |
| `python main.py cleanup` | 执行清理 |
| `python main.py stats 30` | 查看统计 |

---

### 💡 使用示例

**示例 1: 添加任务**

```bash
# 简单添加
python main.py add-task "配置 Bvare API"

# 完整参数
python main.py add-task "测试 DeepInsight" --due 2026-03-15 --priority high
```

**输出:**
```
✅ 任务已添加：测试 DeepInsight
   📅 截止：2026-03-15
   🎯 优先级：high
```

---

**示例 2: 搜索记忆**

```bash
# 搜索关键词（默认 90 天）
python main.py search "DeepInsight"

# 指定天数
python main.py search "API" 30
```

**输出:**
```
🔍 搜索关键词：'DeepInsight' (最近 90 天)
✅ 找到 3 条结果:

1. 📅 2026-03-10
   DeepInsight Core v4.0 完成...

2. 📅 2026-03-10
   测试 DeepInsight Core...
```

---

**示例 3: 心跳检查**

```bash
python main.py heartbeat
```

**输出:**
```
💓 记忆系统心跳检查...
✅ 今日记忆文件已创建：2026-03-10
🔴 高优先级任务：2 个
⚠️ 过期任务：2 个
✅ 长期记忆最近已更新 (0 天前)
💓 心跳状态：OK
```

---

**示例 4: 清理预览**

```bash
python main.py cleanup-preview
```

**输出:**
```
🔍 清理预览（不会实际删除）
============================================================

🗑️  短期记忆（删除）:
  - draft-2026-03-01.md (9 天) → delete

📝 中期记忆（提炼/归档）:
  - 2026-02-10.md (30 天) → summarize

总计：2 个文件将被处理
```

---

**示例 5: 执行清理**

```bash
# 交互式（需要确认）
python main.py cleanup

# 强制模式（无需确认）
python main.py cleanup --force
```

**输出:**
```
🤖 自动记忆清理
============================================================
🧹 清理短期记忆（>7 天）...
  🗑️  已删除：draft-2026-03-01.md

🧹 清理中期记忆（>30 天）...
  📝 提炼并归档：2026-02-10.md

============================================================
📊 清理总结
============================================================
删除：1 个文件
提炼：1 个文件
```

---

### 📝 每日记忆模板

```markdown
# YYYY-MM-DD - 记忆日志

## 🎯 今日重点


## 📝 重要决定


## 📋 待办事项
- [ ] 任务 1
- [ ] 任务 2

## 💡 经验教训

```

---

### ⚙️ 配置说明

**配置文件:**
```json
// config.json
{
  "memoryLevels": {
    "longTerm": {
      "name": "长期记忆",
      "retention": "permanent"
    },
    "mediumTerm": {
      "name": "中期记忆",
      "retention": "30 days"
    },
    "shortTerm": {
      "name": "短期记忆",
      "retention": "7 days"
    }
  },
  
  "autoCleanup": {
    "enabled": true,
    "schedule": "weekly",
    "actions": [
      {"olderThan": 7, "action": "delete"},
      {"olderThan": 30, "action": "summarize"},
      {"olderThan": 60, "action": "archive"}
    ]
  }
}
```

---

### 🎯 最佳实践

**1. 每日记录习惯**

```
时间：每天晚上
内容：编辑 memory/YYYY-MM-DD.md
模板：见上方
```

**2. 每周提炼习惯**

```
时间：每周日 22:00
命令：python main.py auto-summarize 7
作用：提炼到 MEMORY.md
```

**3. 心跳检查**

```
集成到 OpenClaw 心跳
自动运行：python main.py heartbeat
检查：记忆状态 + 任务提醒
```

---

## 快速开始

### 5 分钟上手

**1. 测试 DeepInsight Core (2 分钟)**

```bash
cd projects/multi-agent-system
python deep_insight_core.py
```

**2. 检查记忆系统 (1 分钟)**

```bash
cd projects/memory-system-v2
python main.py check
```

**3. 添加第一个任务 (1 分钟)**

```bash
python main.py add-task "测试 DeepInsight Core" --due 2026-03-15
```

**4. 记录今日记忆 (1 分钟)**

```bash
# 编辑 memory/2026-03-10.md
# 记录今天的工作
```

---

### 日常使用流程

**每天:**

```
早上（心跳时）:
  python main.py heartbeat
  ↓
  检查今日记忆
  查看高优先级任务
  检查过期任务

晚上:
  编辑 memory/YYYY-MM-DD.md
  ↓
  记录今日重点
  记录重要决定
  更新待办事项
```

**每周（周日）:**

```
22:00:
  python main.py cleanup-preview  # 预览清理
  python main.py cleanup          # 执行清理
  python main.py auto-summarize 7 # 提炼到长期记忆
```

---

## 常见问题

### Q1: DeepInsight Core 适合什么场景？

**A:** 战略决策场景，例如：
- "是否应该进入 XX 市场？"
- "如何与竞品差异化？"
- "技术路线应该如何选择？"

**不适合:** 简单任务执行（用 Commander-X）

---

### Q2: Memory System 如何防止遗忘？

**A:** 三个机制：
1. **每日记录** - memory/YYYY-MM-DD.md
2. **每周提炼** - 提炼到 MEMORY.md
3. **心跳检查** - 自动提醒任务

---

### Q3: 两个系统如何配合？

**A:** 
```
1. DeepInsight Core 分析战略问题
   ↓
2. 生成决策包
   ↓
3. 记录到 Memory System
   ↓
4. Memory System 跟踪执行
```

---

### Q4: Bvare API 必须配置吗？

**A:** 不必须！

**不配置:** 使用降级模式（模拟数据）
**配置后:** 使用真实全球数据（Reddit/Twitter）

---

### Q5: 自动清理会误删重要内容吗？

**A:** 不会！

**保护机制:**
1. 先预览再执行（cleanup-preview）
2. 重要内容手动提炼到 MEMORY.md（永久保存）
3. 归档文件不直接删除

---

### Q6: 如何搜索历史记录？

**A:** 
```bash
python main.py search "关键词" 90
```

---

### Q7: 任务过期了怎么办？

**A:** 
1. 心跳时会自动提醒
2. 运行 `python main.py tasks` 查看
3. 调整截止日期或标记完成

---

## 📊 系统统计

**DeepInsight Core:**
- 代码行数：~2000 行
- 核心模块：5 个
- 分析模型：4 个
- 测试通过率：100%

**Memory System:**
- 代码行数：~1000 行
- 核心模块：4 个
- 记忆分级：3 级
- 自动清理：已激活

---

## 📁 完整文件清单

```
workspace/
├── MEMORY.md                              # 长期记忆
├── memory/
│   ├── YYYY-MM-DD.md                     # 每日记忆
│   ├── tasks.json                        # 任务列表
│   └── heartbeat-*.json                  # 心跳报告
└── projects/
    ├── multi-agent-system/               # DeepInsight Core
    │   ├── deep_insight_core.py
    │   ├── dr_insight.py
    │   ├── sandbox.py
    │   ├── bvare_search.py
    │   ├── heartbeat.py
    │   ├── README_DEEP_INSIGHT.md
    │   ├── TEST_REPORT.md
    │   ├── COMPARISON_REPORT.md
    │   └── config_v3.json
    └── memory-system-v2/                 # Memory System
        ├── main.py
        ├── cleanup.py
        ├── memory_core.py
        ├── search.py
        ├── summarizer.py
        ├── GUIDE.md
        ├── CLEANUP_GUIDE.md
        └── config.json
```

---

## 🎯 总结

### DeepInsight Core

- **定位:** 战略决策系统
- **核心:** 5 步深度推理循环
- **交付:** 决策包（含场景推演 + 备用方案）
- **使用:** `python deep_insight_core.py`

### Memory System 2.0

- **定位:** 记忆管理系统
- **核心:** 3 级记忆 + 自动清理
- **交付:** 永不遗忘
- **使用:** `python main.py <command>`

### 两者配合

```
DeepInsight 分析 → Memory 记录 → 永不遗忘
```

---

_OpenClaw 智能系统 v4.0 - 完整使用指南_

**最后更新:** 2026-03-10  
**维护:** nia 助手
