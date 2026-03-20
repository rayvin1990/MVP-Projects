# 记忆系统 2.0 - 使用指南

**版本:** v2.0 (增强版)  
**日期:** 2026-03-10  
**状态:** ✅ 已激活

---

## 🎯 解决的核心问题

**问题:** OpenClaw 总是忘记重要事项！

**症状:**
- ❌ 昨天说的事情今天就忘了
- ❌ 任务过期了没人提醒
- ❌ 重要决定没有记录
- ❌ 记忆文件分散，找不到

**解决方案:**
- ✅ 每日记录 `memory/YYYY-MM-DD.md`
- ✅ 每周提炼到 `MEMORY.md`（长期记忆）
- ✅ 心跳时自动检查记忆状态
- ✅ 过期任务自动提醒

---

## 🚀 快速开始

### 1. 查看当前状态

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

### 2. 查看待办任务

```bash
python main.py tasks
```

**输出示例:**
```
📋 待办任务
🔴 task_001: 配置 Bvare API Key ⚠️ 已过期
   📅 截止：2026-03-15
   📝 说明：用于 DeepInsight Core 数据狩猎

🟡 task_002: 测试真实项目
   📅 截止：2026-03-20
```

---

### 3. 添加新任务

```bash
# 简单添加
python main.py add-task "测试 DeepInsight Core"

# 完整参数
python main.py add-task "配置 Bvare API" --due 2026-03-15 --priority high
```

---

### 4. 完成任务

```bash
python main.py complete-task task_001
```

---

### 5. 搜索记忆

```bash
# 搜索关键词（默认 90 天）
python main.py search "DeepInsight"

# 指定天数
python main.py search "API" 30
```

**输出示例:**
```
🔍 搜索关键词：'DeepInsight' (最近 90 天)
找到 3 条结果:

1. 📅 2026-03-10
   DeepInsight Core v4.0 完成，5 步深度推理循环...

2. 📅 2026-03-10
   测试 DeepInsight Core，决策包生成正常...
```

---

### 6. 自动提炼（每周运行）

```bash
# 提炼最近 7 天到长期记忆
python main.py auto-summarize 7
```

**输出示例:**
```
🔄 自动提炼最近 7 天到长期记忆...
✅ 成功提炼 7 天
📁 长期记忆文件：MEMORY.md
```

---

### 7. 心跳检查（集成到 OpenClaw）

```bash
python main.py heartbeat
```

**输出示例:**
```
💓 记忆系统心跳检查...
✅ 今日记忆文件已创建：2026-03-10
🔴 高优先级任务：2 个
⚠️ 过期任务：2 个
✅ 长期记忆最近已更新 (0 天前)
💓 心跳状态：OK
📁 报告已保存：heartbeat-memory-report.json
```

---

## 📋 日常使用流程

### 每天

**早上（心跳时自动）:**
```bash
python main.py heartbeat
```
- 检查今日记忆
- 查看高优先级任务
- 检查过期任务

**晚上（手动记录）:**
编辑 `memory/YYYY-MM-DD.md`，记录：
- 今日重点
- 重要决定
- 待办事项
- 经验教训

---

### 每周（建议周日）

**运行自动提炼:**
```bash
python main.py auto-summarize 7
```

**检查统计:**
```bash
python main.py stats 30
```

**查看待办:**
```bash
python main.py tasks
```

---

## 🎯 与 OpenClaw 集成

### 心跳集成

在 OpenClaw 心跳检查时，自动运行记忆系统心跳：

**HEARTBEAT.md 中添加:**
```markdown
# 每日检查
- [ ] 运行 `python main.py heartbeat`
- [ ] 检查过期任务
- [ ] 更新今日记忆
```

---

### 自动提醒

心跳报告会保存到：
```
memory/heartbeat-memory-report.json
```

**内容:**
```json
{
  "timestamp": "2026-03-10T14:00:00",
  "status": "OK",
  "today_memory": true,
  "pending_tasks": 2,
  "high_priority_tasks": 2,
  "overdue_tasks": 2,
  "longterm_memory_updated": true
}
```

---

## 📊 文件结构

```
workspace/
├── MEMORY.md                        # 长期记忆 ⭐
├── memory/
│   ├── 2026-03-10.md               # 每日记忆
│   ├── 2026-03-09.md
│   ├── tasks.json                  # 任务列表
│   ├── heartbeat-state.json        # 心跳状态
│   └── heartbeat-memory-report.json # 心跳报告 ⭐
└── projects/memory-system-v2/
    ├── main.py                     # 主入口
    ├── memory_core.py              # 核心逻辑
    ├── search.py                   # 搜索功能
    ├── summarizer.py               # 提炼功能
    └── config.json                 # 配置
```

---

## 💡 最佳实践

### 1. 每日记录习惯

**时间:** 每天晚上  
**内容:**
- 今日完成事项
- 重要决定
- 遇到的问题
- 明天计划

**模板:**
```markdown
# YYYY-MM-DD - 记忆日志

## 🎯 今日重点


## 📝 重要决定


## 📋 待办事项


## 💡 经验教训

```

---

### 2. 每周提炼习惯

**时间:** 每周日晚上  
**命令:**
```bash
python main.py auto-summarize 7
```

**作用:**
- 提取每日记忆中的重要内容
- 追加到 `MEMORY.md`
- 保持长期记忆更新

---

### 3. 任务管理

**添加任务时:**
- 明确截止日期
- 设置优先级（high/medium/low）
- 添加详细说明

**检查任务:**
- 每天心跳时查看
- 优先完成高优先级
- 及时标记完成

---

### 4. 搜索记忆

**场景:**
- 忘记之前讨论过什么
- 查找某个项目的历史记录
- 回顾某个决定

**命令:**
```bash
python main.py search "关键词" 30
```

---

## ⚠️ 常见问题

### Q1: 忘记记录每日记忆怎么办？

**A:** 补记！记忆系统支持补记之前的日期：
```bash
# 编辑 memory/2026-03-09.md
# 然后运行
python main.py auto-summarize 7
```

---

### Q2: 任务总是过期怎么办？

**A:** 
1. 设置合理的截止日期
2. 每天心跳时检查
3. 高优先级任务优先完成
4. 实在完成不了就调整截止日期

---

### Q3: 长期记忆文件太大怎么办？

**A:** 
- 定期归档旧内容
- 只保留核心决策
- 按季度整理

---

### Q4: 如何防止 OpenClaw 遗忘？

**A:** 
1. ✅ 每日记录 `memory/YYYY-MM-DD.md`
2. ✅ 每周提炼到 `MEMORY.md`
3. ✅ 心跳时自动检查
4. ✅ 重要事项写下来，不要依赖" mental notes"

---

## 🎯 成功案例

### 案例 1: 防止任务过期

**场景:** 主任说"明天记得提醒我 XX"

**之前:** 第二天就忘了 ❌

**现在:**
```bash
python main.py add-task "提醒主任 XX" --due 2026-03-11 --priority high
```
第二天心跳时自动提醒 ✅

---

### 案例 2: 查找历史记录

**场景:** "我们之前讨论过 DeepInsight 的架构吗？"

**之前:** 不记得了，要翻聊天记录 ❌

**现在:**
```bash
python main.py search "DeepInsight 架构"
```
立即找到记录 ✅

---

### 案例 3: 项目交接

**场景:** 一段时间后重新接手项目

**之前:** 完全不记得进度 ❌

**现在:**
```bash
python main.py search "项目名称"
cat MEMORY.md
```
快速回顾 ✅

---

## 📈 统计信息

运行 `python main.py stats 30` 查看：

```
📊 记忆统计 (最近 30 天)
记忆天数：25
文件数量：25
总字数：15000
任务数量：10
最早记录：2026-02-10
最新记录：2026-03-10
```

---

## 🚀 下一步优化

### Phase 1 - 基础功能 ✅ (已完成)
- [x] 记忆记录
- [x] 搜索功能
- [x] 任务管理
- [x] 心跳集成

### Phase 2 - 自动化 (计划中)
- [ ] 自动创建每日记忆模板
- [ ] 定时提醒运行 auto-summarize
- [ ] 过期任务自动推送提醒

### Phase 3 - 智能化 (未来)
- [ ] AI 辅助提炼
- [ ] 记忆关联推荐
- [ ] 可视化时间线

---

_DeepInsight Core + Memory System = 不忘事的智能助手_
