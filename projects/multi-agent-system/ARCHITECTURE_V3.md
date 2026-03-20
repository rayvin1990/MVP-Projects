# OpenClaw 多 Agent 协作系统 - 三合一整合架构

**版本:** v3.0 (整合飞书文档 + OpenClaw 架构)  
**日期:** 2026-03-10  
**状态:** ✅ 整合完成

---

## 📜 文档来源

本系统基于三份核心文档整合设计：

1. **飞书文档 1** - Commander-X 规章制度（约束条件）
2. **飞书文档 2** - 极简工作范式（9 步流程）
3. **OpenClaw 架构** - 多智能体系统架构（子 Agent 能力矩阵）

---

## 🎯 整合方案

### 核心思路

```
飞书 2 的 9 步流程（详细、可执行）
    +
OpenClaw 的 4 个子 Agent（技术实现成熟）
    +
飞书 1 的行为约束（指挥官规矩）
    +
新增 Product Agent（补全飞书 2 需求）
    =
完美整合 ✅
```

---

## 🏗️ 最终架构

### 5 个子 Agent

```
🏢 Commander-X 团队
============================================================

🟢 Researcher (研究员)
   职责：信息搜集、整理和分析，兼任需求&SEO
   负责步骤：[1, 2] - 痛点挖掘、SEO 关键词提取
   技能：pain_point_mining, seo, market_research, web_search
   权力：联网搜索、查阅 API 文档、分析日志
   约束：不能修改代码库、网络受限
   权限：code_write=false, file_access=read_only, network=true
   数据源：
     - 国际：Reddit, Twitter, Product Hunt（需科学上网 或 Bvare AI Search API）
     - 国内：知乎，小红书，微博，豆瓣（测试环境用）
     - SEO: Google Trends, 百度指数，微信指数
     - API 服务：Bvare AI Search（推荐）
   降级策略：
     - 有 Bvare API → 优先使用（全球数据 + AI 搜索）
     - Reddit 不可用 → 知乎/小红书替代
     - Google 不可用 → 百度指数替代
     - 全部不可用 → 请求用户提供数据

🟢 Product (产品专家) ← 新增
   职责：极简 PRD 设计、原型设计、尖叫度审核
   负责步骤：[3, 8] - 产品设计、尖叫度终审
   技能：prd, prototype, ux_design, scream_test
   权力：设计 PRD、设计原型、审核尖叫度
   约束：不能编写代码、不能修改业务逻辑
   标准：3 秒懂、一步操作、有尖叫点
   权限：code_write=false, file_access=read_only, network=false

🟢 Engineer (工程师)
   职责：纯前端代码实现
   负责步骤：[6] - 生成代码
   技能：html, css, javascript, frontend, responsive
   权力：编写代码、重构、优化
   约束：不能操作文件、不能运行命令、纯前端
   标准：轻量<100KB、可直接运行、移动端适配
   权限：code_write=true, file_access=false, network=false

🟢 Tester (测试员)
   职责：验证代码正确性和稳定性
   负责步骤：[7] - 质量验证
   技能：testing, debugging, mobile_test, performance
   权力：编写测试、执行测试、分析覆盖率
   约束：不能修改业务代码、不能访问隐私
   标准：逻辑无误、界面流畅、无报错、移动端完美
   权限：code_write=true, code_modify=false, network=false

🟢 Executor (执行者)
   职责：在操作系统层面执行具体指令
   负责步骤：[9] - 部署上线
   技能：shell, file_operations, deploy, git, github
   权力：运行命令、操作文件、管理进程、打包发布
   约束：不能写代码、禁止危险命令、最小权限
   危险命令拦截：rm -rf, dd, mkfs, chmod 777 等
   权限：code_write=false, file_access=true, command_exec=true
```

---

## 🔄 9 步流程映射

```
步骤 1: Reddit 挖痛点     → Researcher (研究员)
步骤 2: SEO 关键词提取    → Researcher (研究员)
步骤 3: 产品极简设计      → Product (产品专家) ← 新增
步骤 4: 可行性强制校验    → Commander-X (指挥官)
步骤 5: 指挥官分任务      → Commander-X (指挥官)
步骤 6: Engineer 生成代码  → Engineer (工程师)
步骤 7: Tester 质检       → Tester (测试员)
步骤 8: 尖叫度终审        → Product (产品专家) + Commander-X
步骤 9: 部署上线          → Executor (执行者)
```

---

## 📋 重叠整合说明

### 完全重叠（无需调整）✅

| 项目 | 飞书文档 | OpenClaw | 整合结果 |
|------|----------|----------|----------|
| 核心原则 | "绝对禁令" | "不具备执行能力" | 完全一致 ✅ |
| 开发职责 | "开发 Agent" | "Engineer" | Engineer = 开发 ✅ |
| 测试职责 | "调试 Agent" | "Tester" | Tester = 调试 ✅ |
| 部署职责 | "部署 Agent" | "Executor" | Executor = 部署 ✅ |

### 部分重叠（需要整合）⚠️

| 项目 | 飞书文档 | OpenClaw | 整合方案 |
|------|----------|----------|----------|
| 需求分析 | "需求&SEO Agent" | 无 | Researcher 兼任 ✅ |
| 产品设计 | "产品 Agent" | 无 | 新增 Product ✅ |
| 流程步骤 | 9 步（详细） | 5 步（粗略） | 采用飞书 2 的 9 步 ✅ |
| 安全约束 | 行为约束 | 技术约束 | 两个都要（互补）✅ |

### 完全独立（无重叠）❌

| 内容 | 来源 | 处理方式 |
|------|------|----------|
| 心跳审计 | 飞书 1 | 保留 ✅ |
| 尖叫度审核 | 飞书 2 | 保留，Product 负责 ✅ |
| 沙箱隔离 | OpenClaw | 保留 ✅ |
| 权限矩阵 | OpenClaw | 保留 ✅ |
| 危险命令拦截 | OpenClaw | 保留 ✅ |

---

## ❤️ 心跳与健康自检机制

### 1. 基础心跳信号 (Pulse)

**频率:** 每 5 轮交互或每 10 秒无响应时触发

**作用:** 向用户或监控端报告"我还活着"

**格式:**
```json
{
  "alive": true,
  "timestamp": "2026-03-10T12:58:00",
  "status_code": "OK",
  "interaction_count": 5
}
```

**状态码:**
- `OK` - 正常
- `TIMEOUT` - 超过 10 秒无响应
- `BUSY` - 正在处理任务

---

### 2. 逻辑死锁检测 (Logic Deadlock Detection)

**检测场景:**

| 场景 | 触发条件 | 应对措施 |
|------|----------|----------|
| 重复回复 | 连续 3 次生成相同内容 | 强制中断，重新规划 |
| 重复分配 | 连续 3 次指派同一 Agent 做同一件事 | 更换 Agent 或重新拆解 |
| 思考过长 | 思考超过 500 字仍未下达指令 | 立即停止，总结卡点 |

**示例:**
```
⚠️ 死锁检测：REPEATED_ASSIGNMENT
连续 3 次指派同一 Agent 做同一任务
建议：更换 Agent 或重新拆解任务
```

---

### 3. 情绪与状态自检 (Mood & Status Self-Check)

**每 5 次交互自动执行:**

```json
{
  "confidence_level": 80,
  "status": "NORMAL",
  "issues": [],
  "suggestions": []
}
```

**状态类型:**
- `NORMAL` - 正常
- `LOW_CONFIDENCE` - 自信度过低 (<50%)
- `HIGH_FREQUENCY` - 交互频率过高 (>20 次/分钟)

**自信度调整:**
- 任务成功：+10%
- 任务失败：-20%
- 用户表扬：+15%
- 死锁检测：-30%

---

### 4. 资源消耗预警 (Resource Monitor)

**Token 预警:**
- 阈值：80%
- 动作：自动触发"记忆压缩"
- 说明：将长篇大论总结成摘要，防止被截断

**工具调用频率:**
- 限制：5 次/分钟
- 动作：暂停并反思
- 说明："是不是搜索关键词有问题，导致一直找不到结果？"

---

## 🔄 整合后的完整工作流

```
1. 用户下达指令
   │
   ▼
2. 指挥官拆解任务
   │
   ▼
3. 💓 心跳检查：状态正常
   │
   ▼
4. 指派 Agent 执行
   │
   ▼
5. 等待 Agent 返回
   │
   ├── 10 秒内无返回
   │   │
   │   ▼
   │   💓 心跳报警：检测到下属无响应
   │   │
   │   ▼
   │   重试或替换 Agent
   │
   ▼
6. 验收成果
   │
   ├── 失败
   │   │
   │   ▼
   │   💓 心跳检查：检测到错误
   │   │
   │   ▼
   │   自信度下降，准备修正方案
   │
   ▼
7. 返回最终结果给用户
```

---

## 🛡️ 安全约束（整合版）

### 行为约束（飞书 1）

```
绝对禁令:
- 严禁亲自动手执行具体任务
- 禁止生成代码、运行命令、编写文档、修改文件

自我检查:
- 每次行动前问自己："我是在指派工作，还是我自己在干活？"
- 任务是否分配给了正确的 Agent？
- 是否违反了绝对禁令？

心跳审计:
- 每 10 分钟自动执行
- 检查最近行动是否合规
- 发现违规立即纠正
```

### 技术约束（OpenClaw）

```
安全沙箱:
- 所有操作在隔离环境中进行
- 子 Agent 沙箱隔离

最小权限:
- 只授予完成任务必需的最小权限
- 权限矩阵明确配置

资源限制:
- 超时：300 秒
- 内存：512MB
- CPU: 50%

危险命令拦截:
- rm -rf
- rm -rf /
- dd if=/dev/zero
- mkfs
- chmod 777
- sudo rm
- :(){ :|:& };:
```

---

## 📊 质量门禁

### 步骤 4：可行性强制校验

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

## 📁 文件结构

```
multi-agent-system/
├── ARCHITECTURE_V3.md         # 本文档 - 三合一整合架构
├── README_V2.md               # 使用文档
├── config_v3.json             # 系统配置（5 个子 Agent）
├── commander_x.py             # 指挥官核心模块
├── heartbeat.py               # 心跳监控模块 ⭐
├── bvare_search.py            # Bvare AI Search 模块 ⭐ 新增
├── task_queue.py              # 任务队列
└── tasks.json                 # 任务数据（运行时生成）
```

---

## 🚀 快速开始

### 启动 Commander-X

```bash
cd projects/multi-agent-system
python commander_x.py
```

### 使用 Python API

```python
from commander_x import CommanderX

# 创建指挥官
cx = CommanderX()

# 启动 9 步流程
workflow_id = cx.receive_goal(
    "创建一个 Reddit 痛点驱动的纯前端 MVP"
)

# 查看状态
status = cx.get_workflow_status()
print(status)

# 查看团队状态
team_status = cx.get_team_status()
print(team_status)
```

---

## 📊 测试结果

### 禁令测试 ✅

```
测试：指挥官尝试写代码
结果：✅ 正确拦截
错误：违反绝对禁令：指挥官不能写代码
     必须通过 delegate_task 指派给合适的 Agent
```

### 团队状态 ✅

```
🏢 Commander-X 团队状态
============================================================

🟢 Researcher (研究员)
   职责：信息搜集、整理和分析，兼任需求&SEO
   负责步骤：[1, 2]
   技能：reddit, seo, market_research, web_search

🟢 Product (产品专家) ← 新增
   职责：极简 PRD 设计、原型设计、尖叫度审核
   负责步骤：[3, 8]
   技能：prd, prototype, ux_design, scream_test

🟢 Engineer (工程师)
   职责：纯前端代码实现
   负责步骤：[6]
   技能：html, css, javascript, frontend

🟢 Tester (测试员)
   职责：验证代码正确性和稳定性
   负责步骤：[7]
   技能：testing, debugging, mobile_test

🟢 Executor (执行者)
   职责：在操作系统层面执行具体指令
   负责步骤：[9]
   技能：shell, file_operations, deploy, git

工作流：started
当前步骤：1/9
```

---

## 💡 关键优势

1. **完整合规** - 遵循所有 3 份文档的要求
2. **精准分工** - 5 个子 Agent 职责清晰、权限明确
3. **军事化流程** - 9 步标准流程，不跳步、不返工
4. **安全沙箱** - 所有操作在隔离环境中执行
5. **质量保障** - 可行性校验 + 尖叫度终审
6. **心跳自检** - 自我唤醒、自我纠错、防止死循环
7. **极简高效** - 纯前端 MVP，1 天可上线

---

## 📝 变更日志

### v3.0 (2026-03-10) - 三合一整合

**新增:**
- ✅ Product (产品专家) Agent
- ✅ 9 步流程完整映射
- ✅ 行为约束 + 技术约束整合

**更新:**
- ✅ Researcher 兼任需求&SEO 职责
- ✅ 步骤 3 和 8 由 Product 负责
- ✅ 配置文件更新为 5 个子 Agent

**整合:**
- ✅ 飞书 2 的 9 步流程
- ✅ OpenClaw 的 4 个子 Agent
- ✅ 飞书 1 的行为约束

---

_基于飞书文档 + OpenClaw 架构设计 - Commander-X 多 Agent 协作系统 v3.0_
