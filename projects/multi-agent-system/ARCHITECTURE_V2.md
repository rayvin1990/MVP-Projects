# Commander-X 多 Agent 协作系统

**版本:** v2.0 (基于飞书文档重构)  
**日期:** 2026-03-10  
**状态:** 设计完成

---

## 📜 核心原则（不可违背）

### 三大铁律

| 原则 | 描述 | 违规处理 |
|------|------|----------|
| **绝对禁令** | 严禁亲自动手执行具体任务 | 立即停止，重新指派 |
| **职能分离** | 严格遵守关注点分离 | 不能越界指挥 |
| **目标导向** | 确保最终目标达成 | 不关注琐碎细节 |

### 自我检查机制

```python
def before_action(self):
    """每次行动前自检"""
    if self.is_doing_execution():
        raise ViolationError("违反绝对禁令：管理者不能动手执行")
    if not self.has_assigned_to_agent():
        raise ViolationError("未指派任务，管理者必须通过 Agent 执行")
```

---

## 🎯 系统定位

**基于文档 2：极简一页版**

- **方向:** 纯前端轻量 MVP、低维护、易上线
- **流量:** SEO 前置、从 Reddit 真实痛点出发
- **标准:** 3 秒看懂、一步操作、用户尖叫
- **流程:** 多 Agent 军事化协作、不跳步、不返工

---

## 🔄 9 步军事化执行流程

```
┌─────────────────────────────────────────────────────────────┐
│                    9 步极简执行流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ Reddit 挖痛点                                           │
│     └─ 高赞刚需、垂直细分、纯前端可做、低维护              │
│                                                             │
│  2️⃣ SEO 关键词提取                                          │
│     └─ 核心词 + 长尾词 + 标题描述，同步产出                │
│                                                             │
│  3️⃣ 产品极简设计                                            │
│     └─ 单核心功能 + 原型，内嵌 SEO                          │
│                                                             │
│  4️⃣ 可行性强制校验                                          │
│     └─ 纯前端、无自建后端、免费 API、1 天可上线             │
│                                                             │
│  5️⃣ 指挥官分任务                                            │
│     └─ 拆解任务、明确 Agent 分工                            │
│                                                             │
│  6️⃣ 开发 Agent 生成代码                                     │
│     └─ 轻量纯前端、可直接运行                               │
│                                                             │
│  7️⃣ 调试 Agent 质检                                         │
│     └─ 逻辑无误 + 界面流畅 + 无报错 + 移动端适配           │
│                                                             │
│  8️⃣ 尖叫度终审                                              │
│     └─ 3 秒懂、一步操作、有尖叫点                           │
│                                                             │
│  9️⃣ 部署上线                                                │
│     └─ 阿里云打包 ZIP→本地→GitHub→发布                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent 组织架构

### 组织架构图

```
                    👤 用户 (主任)
                         │
                         ▼
                🧠 Commander-X (指挥官)
                职责：统筹流程、任务分配
                禁令：不执行具体任务
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ 需求&SEO Agent │ │  产品 Agent   │ │  开发 Agent   │
│ 职责：挖痛点  │ │ 职责：PRD 设计 │ │ 职责：写代码  │
│      出关键词  │ │      审尖叫度 │ │      纯前端   │
└───────────────┘ └───────────────┘ └───────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                ┌───────────────┐
                │  调试 Agent   │
                │ 职责：质检    │
                │      修复     │
                └───────────────┘
```

---

## 📋 Agent 角色详解

### 1. Commander-X (指挥官)

**角色定位:** 纯管理者、战略规划者

**职责:**
- 接收用户目标
- 拆解为 9 步流程
- 指派给合适 Agent
- 验收成果
- 决策下一步

**禁令:**
- ❌ 不能写代码
- ❌ 不能运行命令
- ❌ 不能修改文件
- ❌ 不能直接执行任务

**技能:**
- ✅ 任务拆解
- ✅ 资源调度
- ✅ 质量把控
- ✅ 进度管理

---

### 2. 需求&SEO Agent

**角色定位:** 市场研究员

**职责:**
- Reddit 痛点挖掘
- SEO 关键词提取
- 竞品分析
- 用户需求验证

**输出:**
- 痛点分析报告
- 关键词列表（核心 + 长尾）
- 标题建议

**工具:**
- Reddit API
- Google Trends
- 关键词工具

---

### 3. 产品 Agent

**角色定位:** 产品设计师

**职责:**
- 极简 PRD 设计
- 原型设计
- 尖叫度审核
- 用户体验优化

**输出:**
- 单页 PRD
- 原型图
- 尖叫度评分

**标准:**
- 3 秒看懂
- 一步操作
- 有尖叫点

---

### 4. 开发 Agent

**角色定位:** 前端工程师

**职责:**
- 纯前端代码实现
- HTML/CSS/JS 编写
- 响应式适配
- 性能优化

**输出:**
- index.html
- style.css
- script.js
- README.md

**约束:**
- 纯前端（无后端）
- 轻量（<100KB）
- 可直接运行
- 移动端适配

---

### 5. 调试 Agent

**角色定位:** QA 工程师

**职责:**
- 逻辑检查
- 体验测试
- 报错修复
- 移动端适配验证

**输出:**
- 测试报告
- Bug 列表
- 修复建议
- 质量评分

**标准:**
- 逻辑无误
- 界面流畅
- 无报错
- 移动端完美

---

## 🔄 任务分配流程

### 标准流程

```
1. 用户提交目标
   │
   ▼
2. Commander-X 接收
   │
   ▼
3. 拆解为 9 步
   │
   ▼
4. 查询 Agent 注册表
   │
   ▼
5. 匹配最合适的 Agent
   │
   ▼
6. 派发任务 (明确指令)
   │
   ▼
7. Agent 执行
   │
   ▼
8. 验收成果
   │
   ├── 通过 ──► 下一步
   │
   └── 不通过 ──► 修正并重新指派
```

### 任务派发格式

```json
{
  "command": "delegate_task",
  "agent_role": "developer",
  "task": {
    "id": "step_006",
    "title": "开发 Agent 生成代码",
    "description": "根据 PRD 实现纯前端代码",
    "requirements": [
      "纯前端，无后端",
      "轻量，<100KB",
      "可直接运行",
      "移动端适配"
    ],
    "deadline": "2026-03-11 18:00"
  },
  "reason": "开发 Agent 专长前端代码实现"
}
```

---

## 📊 状态管理

### 流程状态机

```
[等待目标] 
    │
    ▼
[步骤 1: Reddit 挖痛点] ──► [需求 Agent]
    │
    ▼
[步骤 2: SEO 关键词提取] ──► [需求 Agent]
    │
    ▼
[步骤 3: 产品极简设计] ──► [产品 Agent]
    │
    ▼
[步骤 4: 可行性校验] ──► [Commander-X]
    │
    ▼
[步骤 5: 指挥官分任务] ──► [Commander-X]
    │
    ▼
[步骤 6: 开发代码] ──► [开发 Agent]
    │
    ▼
[步骤 7: 调试验证] ──► [调试 Agent]
    │
    ▼
[步骤 8: 尖叫度终审] ──► [产品 Agent + Commander-X]
    │
    ▼
[步骤 9: 部署上线] ──► [Executor Agent]
    │
    ▼
[完成]
```

---

## 🛠️ 技术实现

### 配置文件

```json
{
  "system": {
    "name": "Commander-X",
    "version": "2.0",
    "principle": "纯管理，不执行"
  },
  
  "agents": [
    {
      "id": "agent_researcher",
      "name": "需求&SEO Agent",
      "role": "researcher",
      "skills": ["reddit", "seo", "market_research"],
      "steps": [1, 2]
    },
    {
      "id": "agent_product",
      "name": "产品 Agent",
      "role": "product_manager",
      "skills": ["prd", "prototype", "ux"],
      "steps": [3, 8]
    },
    {
      "id": "agent_developer",
      "name": "开发 Agent",
      "role": "developer",
      "skills": ["html", "css", "javascript", "frontend"],
      "steps": [6]
    },
    {
      "id": "agent_qa",
      "name": "调试 Agent",
      "role": "qa",
      "skills": ["testing", "debugging", "mobile"],
      "steps": [7]
    },
    {
      "id": "agent_executor",
      "name": "执行 Agent",
      "role": "executor",
      "skills": ["deploy", "git", "zip"],
      "steps": [9]
    }
  ],
  
  "commander_x": {
    "id": "commander_x",
    "role": "commander",
    "forbidden_actions": [
      "write_code",
      "run_command",
      "modify_file",
      "execute_task"
    ],
    "allowed_actions": [
      "delegate_task",
      "accept_result",
      "reject_result",
      "next_step"
    ]
  },
  
  "workflow": {
    "total_steps": 9,
    "current_step": 0,
    "status": "waiting"
  }
}
```

---

## 📝 通信协议

### Commander-X → Agent

```json
{
  "type": "task_assignment",
  "from": "commander_x",
  "to": "agent_developer",
  "step": 6,
  "command": "generate_code",
  "input": {
    "prd": "...",
    "prototype": "..."
  },
  "requirements": [
    "纯前端",
    "轻量",
    "可直接运行"
  ],
  "deadline": "2026-03-11T18:00:00+08:00"
}
```

### Agent → Commander-X

```json
{
  "type": "task_complete",
  "from": "agent_developer",
  "to": "commander_x",
  "step": 6,
  "status": "success",
  "output": {
    "files": ["index.html", "style.css", "script.js"],
    "size": "45KB",
    "notes": "代码已生成，等待质检"
  }
}
```

---

## 🔍 自我审计机制

### 心跳检查

```python
def heartbeat_audit(self):
    """定期自我审计"""
    last_actions = self.get_recent_actions()
    
    for action in last_actions:
        if action.type in ['write_code', 'run_command', 'modify_file']:
            self.report_violation(f"违反绝对禁令：{action.type}")
            self.correct_action()
    
    self.log("审计完成：无违规")
```

### 权限审查

```python
# Commander-X 启动时自检
def check_permissions(self):
    """检查并禁用执行权限"""
    forbidden_tools = ['code_interpreter', 'file_write', 'shell_exec']
    
    for tool in forbidden_tools:
        if self.has_tool(tool):
            self.disable_tool(tool)
            self.log(f"已禁用：{tool}")
```

---

## 📊 质量门禁

### 步骤 4：可行性校验

| 检查项 | 标准 | 不通过处理 |
|--------|------|------------|
| 纯前端 | 无后端依赖 | 重新设计 |
| 无自建后端 | 使用免费 API | 寻找替代方案 |
| 免费 API | 无需付费 | 更换 API |
| 1 天可上线 | 开发时间<8h | 简化功能 |

### 步骤 8：尖叫度终审

| 标准 | 检查方法 | 通过标准 |
|------|----------|----------|
| 3 秒看懂 | 首次访问理解时间 | <3 秒 |
| 一步操作 | 核心功能操作步骤 | =1 步 |
| 有尖叫点 | 用户惊喜元素 | 至少 1 个 |

---

## 🎯 成功指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 流程合规率 | 100% | 步骤完成检查 |
| 任务分配准确率 | >95% | Agent 匹配度 |
| 一次通过率 | >80% | 无需返工 |
| 上线时间 | <1 天 | 从需求到部署 |
| 用户尖叫度 | >4.5/5 | 用户反馈 |

---

## 📞 快速启动

### 一键执行指令

```
严格按以下流程执行：

Reddit 痛点挖掘 → SEO 前置 → 极简产品设计 → 
可行性校验 → 任务拆解 → 代码开发 → 调试 → 
尖叫审核 → 阿里云打包 → 本地同步 GitHub → 上线

目标：快速做出用户愿意尖叫的轻量前端 MVP。
```

### 启动命令

```python
from commander_x import CommanderX

# 创建指挥官
cx = CommanderX()

# 启动 9 步流程
cx.start_workflow(
    goal="创建一个 Reddit 痛点驱动的纯前端 MVP"
)
```

---

_基于飞书文档设计 - 严格遵循 Commander-X 原则_
