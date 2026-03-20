# 记忆分级与自动清理指南

**版本:** v2.1  
**日期:** 2026-03-10  
**状态:** ✅ 已激活

---

## 🎯 核心理念

**问题:** 所有记忆都一样重要吗？  
**答案:** ❌ 不是！

**解决方案:** 记忆分级 + 自动清理

---

## 📊 记忆分级体系

### 3 级记忆管理

```
┌─────────────────────────────────────────┐
│  长期记忆 (Long Term)                   │
│  📁 MEMORY.md                           │
│  ⏰ 永久保存                            │
│  💎 重要决策、核心身份、项目里程碑      │
└─────────────────────────────────────────┘
              ⬆️ 每周提炼
┌─────────────────────────────────────────┐
│  中期记忆 (Medium Term)                 │
│  📁 memory/YYYY-MM-DD.md                │
│  ⏰ 保留 30 天                           │
│  📝 日常事项、普通任务、会议纪要        │
└─────────────────────────────────────────┐
              ⬆️ 自动清理
┌─────────────────────────────────────────┐
│  短期记忆 (Short Term)                  │
│  📁 memory/daily/                       │
│  ⏰ 保留 7 天                            │
│  🗑️  草稿、临时笔记、未分类内容         │
└─────────────────────────────────────────┘
```

---

## 🗑️ 自动清理策略

### 清理规则

| 记忆级别 | 保留期限 | 清理动作 | 执行时间 |
|----------|----------|----------|----------|
| **短期记忆** | 7 天 | 删除 | 每周日 22:00 |
| **中期记忆** | 30 天 | 提炼到长期记忆 + 归档 | 每周日 22:00 |
| **中期记忆** | 60 天 | 直接归档 | 每月 1 号 10:00 |
| **长期记忆** | 永久 | 不清理 | - |

---

### 清理流程

**每周日自动执行:**

```
1. 扫描短期记忆（>7 天）
   ↓
2. 删除过期短期记忆
   ↓
3. 扫描中期记忆（>30 天）
   ↓
4. 提炼重要内容到 MEMORY.md
   ↓
5. 归档旧文件到 memory_archive/
   ↓
6. 生成清理报告
```

---

## 🎯 记忆分类标准

### 长期记忆（永久保存）

**内容:**
- ✅ 重要决定
- ✅ 项目里程碑
- ✅ 系统架构决策
- ✅ 用户偏好配置
- ✅ 核心身份信息
- ✅ 经验教训
- ✅ 战略方向

**示例:**
```markdown
## 重要决定

2026-03-10: 决定采用 DeepInsight Core 作为战略分析系统
- 原因：需要深度推理能力
- 预期效果：提升决策质量
- 负责人：主任
```

---

### 中期记忆（30 天）

**内容:**
- 📝 日常任务
- 📝 会议纪要
- 📝 临时想法
- 📝 待验证假设
- 📝 短期目标

**示例:**
```markdown
# 2026-03-10 - 记忆日志

## 🎯 今日重点
- 完成 DeepInsight Core 开发

## 📋 待办事项
- [ ] 配置 Bvare API Key
```

---

### 短期记忆（7 天）

**内容:**
- 🗑️ 草稿笔记
- 🗑️ 临时记录
- 🗑️ 未分类内容
- 🗑️ 测试数据

**示例:**
```markdown
# 临时笔记 - 2026-03-10

待整理：
- 某个想法
- 某段代码
- 某个链接
```

---

## 🚀 使用命令

### 1. 预览清理结果

```bash
cd projects/memory-system-v2
python main.py cleanup-preview
```

**输出:**
```
🔍 清理预览（不会实际删除）
============================================================

🗑️  短期记忆（删除）:
  - 2026-03-01.md (9 天) → delete
  - 2026-02-28.md (12 天) → delete

📝 中期记忆（提炼/归档）:
  - 2026-02-10.md (30 天) → summarize
  - 2026-01-15.md (55 天) → archive

总计：4 个文件将被处理
```

---

### 2. 执行自动清理

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
  🗑️  已删除：2026-03-01.md
  🗑️  已删除：2026-02-28.md

🧹 清理中期记忆（>30 天）...
  📝 提炼并归档：2026-02-10.md (30 天)
  📦 归档：2026-01-15.md (55 天)

============================================================
📊 清理总结
============================================================
删除：2 个文件
提炼：1 个文件
归档：1 个文件
```

---

### 3. 手动提炼（不删除）

```bash
# 提炼最近 7 天
python main.py auto-summarize 7

# 提炼指定日期
python main.py summarize 2026-03-10
```

---

## ⚙️ 配置说明

### config.json

```json
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
    "dayOfWeek": "Sunday",
    "actions": [
      {
        "name": "清理短期记忆",
        "olderThan": 7,
        "action": "delete"
      },
      {
        "name": "提炼中期记忆",
        "olderThan": 30,
        "action": "summarize_to_longterm_then_archive"
      },
      {
        "name": "归档过期记忆",
        "olderThan": 60,
        "action": "move_to_archive"
      }
    ]
  }
}
```

---

### 自定义清理策略

**修改保留期限:**

```json
"autoCleanup": {
  "actions": [
    {
      "name": "清理短期记忆",
      "olderThan": 14,  // 改为 14 天
      "action": "delete"
    },
    {
      "name": "提炼中期记忆",
      "olderThan": 60,  // 改为 60 天
      "action": "summarize"
    }
  ]
}
```

**修改清理时间:**

```json
"cleanupSchedule": {
  "weekly": {
    "day": "Saturday",  // 改为周六
    "time": "10:00"     // 改为上午 10 点
  }
}
```

---

## 📁 文件结构

```
workspace/
├── MEMORY.md                              # ⭐ 长期记忆（永久）
├── memory/
│   ├── 2026-03-10.md                     # 📝 中期记忆（30 天）
│   ├── 2026-03-09.md
│   ├── ...
│   ├── daily/                            # 🗑️ 短期记忆（7 天）
│   │   ├── draft-2026-03-10.md
│   │   └── temp-notes.md
│   └── tasks.json
└── memory_archive/                       # 📦 归档目录（60 天+）
    ├── archived_2026-01-15_20260310_220000.md
    └── ...
```

---

## 💡 最佳实践

### 1. 每周清理习惯

**时间:** 每周日 22:00  
**命令:**
```bash
python main.py cleanup-preview  # 先预览
python main.py cleanup          # 再执行
```

---

### 2. 重要内容及时提炼

**不要等自动清理！**

发现重要内容时，立即手动添加到 `MEMORY.md`:

```bash
# 编辑 MEMORY.md
# 添加重要决策、项目进展等
```

---

### 3. 归档文件管理

**归档目录:** `memory_archive/`

**用途:**
- 保存 60 天以上的记忆
- 需要时可查阅
- 不占用日常空间

**查阅归档:**
```bash
# 搜索归档文件
Get-ChildItem memory_archive -Filter "*.md" | Select-String "关键词"
```

---

### 4. 清理报告

**位置:** `memory/cleanup-report.json`

**内容:**
```json
{
  "timestamp": "2026-03-10T22:00:00",
  "deleted": 5,
  "summarized": 3,
  "archived": 2,
  "details": [...]
}
```

---

## ⚠️ 注意事项

### 1. 清理前备份

**建议:** 清理前先备份

```bash
# 导出最近 30 天记忆
python main.py export 30
```

---

### 2. 重要内容手动标记

**方法:** 在记忆文件中标记

```markdown
<!-- IMPORTANTE: 长期保存 -->
# 重要决策

此内容需要提炼到 MEMORY.md
```

---

### 3. 清理失败处理

**检查:**
```bash
python main.py check
```

**修复:**
```bash
# 手动清理
python main.py cleanup --force
```

---

## 📊 清理效果

### 之前（无清理）

```
memory/
├── 2026-03-10.md
├── 2026-03-09.md
├── ...
├── 2025-01-01.md  ← 1 年前的文件
├── 2025-01-02.md
└── ...

问题：
- 文件越来越多
- 查找困难
- 重要信息被淹没
```

---

### 现在（自动清理）

```
memory/
├── 2026-03-10.md  ← 最近 30 天
├── 2026-03-09.md
└── ...

MEMORY.md  ← 重要内容提炼

memory_archive/
└── archived_*.md  ← 60 天+ 归档

优势：
- 保持整洁
- 重要信息突出
- 查找快速
```

---

## 🎯 与 OpenClaw 集成

### 心跳集成

**HEARTBEAT.md:**
```markdown
# 每周检查
- [ ] 周日 22:00 运行 `python main.py cleanup`
- [ ] 检查清理报告
- [ ] 确认 MEMORY.md 已更新
```

---

### 自动化脚本

**PowerShell 定时任务:**

```powershell
# 每周日 22:00 执行
$action = New-ScheduledTaskAction -Execute "python" `
  -Argument "C:\Users\Administrator\.openclaw\workspace\projects\memory-system-v2\main.py cleanup --force"

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 10pm

Register-ScheduledTask -TaskName "MemoryCleanup" `
  -Action $action -Trigger $trigger
```

---

## 📈 统计信息

运行 `python main.py stats 30` 查看：

```
📊 记忆统计 (最近 30 天)
记忆天数：25
文件数量：25
总字数：15000
任务数量：10

清理统计:
- 已删除：5 个文件
- 已提炼：3 个文件
- 已归档：2 个文件
- 长期记忆更新：2 次
```

---

_DeepInsight Core + Memory System v2.1 = 智能记忆管理_
