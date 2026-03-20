# 记忆系统 2.0 - 使用指南

## 🚀 快速开始

### 1. 基本命令

```bash
# 进入项目目录
cd projects/memory-system-v2

# 查看帮助
python main.py help
```

### 2. 常用操作

#### 🔍 搜索记忆
```bash
# 搜索关键词 "项目"（最近 90 天）
python main.py search 项目

# 搜索关键词 "决定"（最近 30 天）
python main.py search 决定 30
```

#### 📝 提炼记忆
```bash
# 提炼昨天的记忆
python main.py summarize

# 提炼指定日期
python main.py summarize 2026-03-05

# 自动提炼最近 7 天到长期记忆
python main.py auto-summarize 7
```

#### 📊 查看统计
```bash
# 查看最近 30 天统计
python main.py stats

# 查看最近 90 天统计
python main.py stats 90
```

#### 📋 任务管理
```bash
# 查看所有待办任务
python main.py tasks

# 添加新任务
python main.py add-task "完成项目报告"

# 添加带截止日期的任务
python main.py add-task "开会" --due 2026-03-15

# 添加高优先级任务
python main.py add-task "紧急修复" --due 2026-03-11 --priority high

# 完成任务
python main.py complete-task task_001
```

#### 📥 导出记忆
```bash
# 导出最近 30 天
python main.py export

# 导出最近 90 天
python main.py export 90
```

---

## 📁 文件结构

```
memory-system-v2/
├── main.py              # 主入口脚本
├── memory_core.py       # 核心模块（读写记忆）
├── search.py            # 搜索模块
├── summarizer.py        # 提炼模块
├── config.json          # 配置文件
├── README.md            # 项目说明
└── USAGE.md             # 使用指南（本文件）
```

---

## 🔧 配置说明

编辑 `config.json` 自定义设置：

```json
{
  "workspace": "C:\\Users\\Administrator\\.openclaw\\workspace",
  "memoryDir": "memory",
  "longTermMemory": "MEMORY.md",
  "tasksFile": "memory/tasks.json",
  "silentPeriod": {
    "start": "23:00",
    "end": "08:00"
  }
}
```

---

## 💡 使用场景

### 场景 1: 查找之前的决定
```bash
python main.py search 决定 90
```

### 场景 2: 回顾上周完成的工作
```bash
python main.py search 完成 7
```

### 场景 3: 每天自动提炼
建议每天运行一次：
```bash
python main.py auto-summarize 1
```

### 场景 4: 月度总结
```bash
# 导出本月记忆
python main.py export 30

# 查看统计
python main.py stats 30
```

---

## ⚠️ 注意事项

1. **编码问题**: Windows 系统已自动处理 UTF-8 编码
2. **日期格式**: 所有日期使用 `YYYY-MM-DD` 格式
3. **任务 ID**: 完成任务时需要正确的任务 ID（用 `tasks` 命令查看）
4. **长期记忆**: `auto-summarize` 会自动避免重复提炼

---

## 🐛 常见问题

**Q: 搜索不到结果？**
A: 尝试扩大搜索范围（增加天数）或换关键词

**Q: 提炼内容为空？**
A: 当日记忆可能没有重要内容，或者日期不对

**Q: 任务过期了怎么办？**
A: 可以用 `complete-task` 标记完成，或者手动编辑 `memory/tasks.json`

---

## 📞 需要帮助？

查看项目 README 或联系开发者（就是你，主任！）
