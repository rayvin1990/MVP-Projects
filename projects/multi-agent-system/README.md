# 多 Agent 自主协作系统

**版本:** v1.0  
**日期:** 2026-03-10  
**状态:** 开发中

---

## 🎯 项目目标

解决多 Agent 协作中的痛点：
- ❌ 分工不明确
- ❌ 任务执行混乱
- ❌ 缺乏自主规划能力
- ❌ Agent 之间协作困难

实现能力：
- ✅ 明确的角色分工
- ✅ 自主任务分解
- ✅ 智能调度执行
- ✅ 结果自动汇总

---

## 🏗️ 系统架构

```
👤 主任 (用户)
    │
    ▼
🧠 主 Agent (Coordinator)
    角色：项目经理 / 协调员
    职责：任务接收、分解、分配、监督、汇总
    │
    ├──► 💻 Agent A (开发专家)
    │     职责：代码编写、功能实现
    │
    ├──► 🔍 Agent B (测试专家)
    │     职责：测试用例、质量验证
    │
    └──► 📝 Agent C (文档专家)
          职责：文档编写、报告生成
```

---

## 🚀 快速开始

### 1. 查看团队状态

```bash
cd projects/multi-agent-system
python coordinator.py
```

### 2. 使用 Python API

```python
from coordinator import AgentCoordinator

# 创建协调器
coordinator = AgentCoordinator()

# 接收任务
task_id = coordinator.receive_task(
    title="开发记忆系统",
    description="实现记忆管理、搜索、提炼功能",
    priority="p1",
    due_hours=48
)

# 查看进度
progress = coordinator.get_progress()
print(progress)

# 生成日报
report = coordinator.get_daily_report()
print(report)
```

---

## 📋 核心功能

### 1. 任务接收与分配

```python
# 接收新任务
task_id = coordinator.receive_task(
    title="任务标题",
    description="任务描述",
    priority="p1",      # p0/p1/p2/p3
    due_hours=24        # 完成时限
)

# 系统自动分析任务，选择最合适的 Agent
# 自动创建任务并分配
```

### 2. 任务分解

```python
# 将复杂任务分解为子任务
subtasks = coordinator.decompose_task(task_id, [
    {
        "title": "开发阶段",
        "description": "实现核心功能",
        "assigned_to": "agent_dev",
        "priority": "p1"
    },
    {
        "title": "测试阶段",
        "description": "编写测试用例",
        "assigned_to": "agent_qa",
        "priority": "p2"
    }
])
```

### 3. 进度追踪

```python
# 查询单个任务进度
progress = coordinator.get_progress(task_id)

# 查询整体进度
overview = coordinator.get_progress()
```

### 4. 自动生成日报

```python
report = coordinator.get_daily_report()
```

---

## 🤖 Agent 角色

### 开发专家 (agent_dev)
- **技能:** Python, JavaScript, API, 数据库，架构设计
- **职责:** 代码编写、功能实现、Bug 修复
- **容量:** 5 个并发任务

### 测试专家 (agent_qa)
- **技能:** 测试、pytest、自动化、Bug 报告
- **职责:** 测试用例、执行测试、质量验证
- **容量:** 5 个并发任务

### 文档专家 (agent_doc)
- **技能:** 写作、文档、Markdown、报告
- **职责:** 文档编写、记录整理、报告生成
- **容量:** 5 个并发任务

---

## 📊 任务优先级

| 优先级 | 标识 | 响应时间 | 说明 |
|--------|------|----------|------|
| P0 | 🔴 | 立即 | 紧急任务，可中断其他任务 |
| P1 | 🟠 | 1 小时内 | 高优先级任务 |
| P2 | 🟡 | 4 小时内 | 中等优先级（默认） |
| P3 | 🟢 | 24 小时内 | 低优先级，空闲时处理 |

---

## 🔄 工作流程

### 标准流程

```
1. 用户提交任务
   ↓
2. 主 Agent 分析任务
   ↓
3. 选择最合适的 Agent
   ↓
4. 创建任务并分配
   ↓
5. Agent 执行任务
   ↓
6. 更新进度
   ↓
7. 完成任务
   ↓
8. 生成报告
```

### 任务分解流程

```
复杂任务
   ↓
主 Agent 分析
   ↓
识别子任务
   ↓
创建子任务（设置依赖）
   ↓
分配给不同 Agent
   ↓
并行/串行执行
   ↓
汇总结果
```

---

## 🛠️ 技术实现

### 文件结构

```
multi-agent-system/
├── README.md              # 本文件
├── ARCHITECTURE.md        # 架构设计文档
├── config.json            # 配置文件
├── task_queue.py          # 任务队列管理
├── coordinator.py         # 主协调器
└── tasks.json             # 任务数据（运行时生成）
```

### 核心模块

**task_queue.py**
- 任务创建、更新、完成
- 队列管理（pending/in_progress/completed/failed）
- 依赖管理
- Agent 负载计算

**coordinator.py**
- 任务接收与分析
- Agent 选择与分配
- 任务分解
- 进度追踪
- 报告生成

---

## 📝 配置说明

### config.json

```json
{
  "agents": [
    {
      "id": "agent_dev",
      "name": "开发专家",
      "role": "developer",
      "skills": ["python", "javascript", "api"],
      "capacity": 5,
      "status": "available"
    }
  ],
  "settings": {
    "max_parallel_tasks": 5,
    "check_interval_minutes": 10,
    "auto_report": true,
    "report_time": "22:00"
  }
}
```

---

## 🎯 使用场景

### 场景 1: 开发新功能

```
用户：开发一个记忆管理系统

主 Agent:
1. 分析任务 → 需要开发、测试、文档
2. 分解任务:
   - 开发：核心功能实现 (agent_dev)
   - 测试：单元测试编写 (agent_qa)
   - 文档：PRD 和用户使用手册 (agent_doc)
3. 分配任务
4. 监督进度
5. 汇总报告
```

### 场景 2: 紧急 Bug 修复

```
用户：网站有严重 Bug，需要立即修复 (P0)

主 Agent:
1. 识别为 P0 紧急任务
2. 分配给 agent_dev（开发）
3. 通知 agent_qa 准备测试
4. 高优先级处理
5. 快速验证后部署
```

### 场景 3: 日常任务管理

```
每天 22:00 自动生成日报:
- 今日完成的任务
- 进行中的任务
- 明日计划
- 风险提醒
```

---

## 📊 监控与报告

### 团队状态看板

```
🏢 Agent 团队状态
==================================================

🟢 开发专家 (developer)
   负载：2/5
   技能：python, javascript, api
   当前任务:
     - 实现记忆搜索功能 (60%)
     - 优化提炼算法 (30%)

🟢 测试专家 (qa)
   负载：1/5
   技能：testing, pytest
   当前任务:
     - 编写单元测试 (80%)

🟢 文档专家 (writer)
   负载：0/5
   技能：writing, documentation

==================================================
队列：待处理 3 | 进行中 3 | 已完成 15
```

### 日报模板

```markdown
# Agent 团队日报 - 2026-03-10

## 今日完成
- 开发专家：实现记忆搜索功能 (100%)
- 测试专家：编写单元测试 (100%)
- 文档专家：完成 PRD 文档 (100%)

## 进行中
- 开发专家：优化提炼算法 (40%)
- 文档专家：原型图完善 (80%)

## 统计
- 总任务数：20
- 已完成：15
- 失败：0
- 待处理：3
- 进行中：2
```

---

## 🔧 与 OpenClaw 集成

### 方式 1: 作为子 Agent 运行

```python
# 在 OpenClaw 中 spawn 子 Agent
from openclaw import sessions_spawn

# 创建开发 Agent
sessions_spawn(
    runtime="subagent",
    agentId="agent_dev",
    task="实现记忆搜索功能",
    mode="session",
    thread=True
)
```

### 方式 2: 心跳自动检查

```python
# 在 HEARTBEAT.md 中添加
# 每 10 分钟检查任务进度
- 检查任务队列
- 更新任务状态
- 发送进度报告
```

### 方式 3: 飞书通知

```python
# 任务完成时发送飞书消息
def notify_task_complete(task_id, result):
    message.send(
        channel="feishu",
        target="user:ou_xxx",
        message=f"✅ 任务已完成：{task_id}"
    )
```

---

## 🎯 下一步计划

### Phase 1 - 基础框架 ✅ (本周)
- [x] 架构设计
- [x] 配置文件
- [x] 任务队列实现
- [x] 协调器实现
- [ ] OpenClaw 集成测试

### Phase 2 - 自主规划 (下周)
- [ ] 任务自动分解算法
- [ ] 智能 Agent 选择
- [ ] 进度自动监控
- [ ] 异常自动处理

### Phase 3 - 高级功能 (后续)
- [ ] 学习能力（从历史任务学习）
- [ ] 性能优化
- [ ] Web 界面
- [ ] 更多 Agent 角色

---

## 💡 关键优势

1. **分工明确** - 每个 Agent 有清晰的角色和职责
2. **自主执行** - 任务分配后自动执行
3. **自主规划** - 能根据目标自动制定计划
4. **可追踪** - 所有任务状态透明
5. **可扩展** - 随时添加新的 Agent 角色

---

## 📞 测试命令

```bash
# 测试任务队列
cd projects/multi-agent-system
python task_queue.py

# 测试协调器
python coordinator.py

# 查看团队状态
python -c "from coordinator import AgentCoordinator; c = AgentCoordinator(); print(c.get_team_status())"
```

---

_多 Agent 协作系统 - 让团队协作更高效_
