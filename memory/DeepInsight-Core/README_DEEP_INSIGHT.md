# DeepInsight Core - 深度认知协同系统

**版本:** v4.0 (战略升级)  
**日期:** 2026-03-10  
**状态:** ✅ 整合完成

---

## 🎯 系统定位

**系统代号:** DeepInsight Core (深度洞察核心)

**核心变革:** 从"任务驱动"转向"问题驱动"

**目标:** 基于博士级研究员和全球数据，提供穿透迷雾的真知灼见

---

## 🚀 快速开始

### 1. 配置环境变量（可选）

```powershell
# 配置 Bvare AI Search API Key（使用全球数据）
$env:BVARE_API_KEY="你的-bvare-api-key"

# 不配置则自动降级到国内数据源
```

### 2. 运行系统

```bash
cd projects/multi-agent-system
python deep_insight_core.py
```

### 3. 提出战略问题

```python
from deep_insight_core import DeepInsightCore

# 创建系统实例
core = DeepInsightCore()

# 提出战略问题
question = "在当前浏览器书签管理工具市场竞争中，我们应如何定位产品以构建护城河？"

# 获取决策包
decision = core.ask(question)

# 查看结果
print(f"建议：{decision['recommendation']}")
print(f"置信度：{decision['confidence_level']}")
print(f"成功概率：{decision['average_success_probability']}")
```

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│              DeepInsight Core 系统                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 首席战略官 (CSO/Commander)                         │
│     职责：提出高维度战略问题                            │
│                                                         │
│     ↓                                                   │
│                                                         │
│  🎓 首席战略研究员 (Dr. Insight)                       │
│     职责：构建框架 + 数据狩猎 + 假设验证                │
│     内置模型：波特五力、SWOT、PESTEL、麦肯锡七步        │
│     数据源：Bvare AI Search (全球数据)                  │
│                                                         │
│     ↓                                                   │
│                                                         │
│  🎲 战略推演沙盘 (The Sandbox)                         │
│     职责：多场景推演 + 反事实推理 + 风险评估            │
│     输出：乐观/中性/悲观场景                            │
│                                                         │
│     ↓                                                   │
│                                                         │
│  📦 决策包交付                                         │
│     包含：结论 + 推演 + 数据 + 风险 + 备用方案          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 深度推理循环（5 步）

```
1️⃣ 接收战略问题
   "在 AI 工具爆发背景下，是否应进入 AI 写作助手市场？"
   ↓
2️⃣ 构建分析框架
   "建议使用波特五力模型 + 技术成熟度曲线"
   ↓
3️⃣ 数据狩猎
   - 调用 Bvare AI Search
   - 搜索 Reddit/Twitter/News
   - 验证假设（寻找支持 + 反面证据）
   ↓
4️⃣ 沙盘推演
   - 乐观场景：成功 65%
   - 中性场景：成功 45%
   - 悲观场景：成功 20%
   - 反事实推理：如果关键假设不成立？
   ↓
5️⃣ 交付决策包
   {
     "建议": "谨慎进入",
     "置信度": "中",
     "成功概率": "43%",
     "风险": [...],
     "备用方案": [...]
   }
```

---

## 📊 内置分析模型

### 1. 波特五力模型
**用途:** 分析行业竞争结构

### 2. SWOT 分析
**用途:** 分析内部优势劣势和外部机会威胁

### 3. PESTEL 分析
**用途:** 分析宏观环境因素

### 4. 麦肯锡七步成诗
**用途:** 系统化问题解决

---

## 🎲 战略推演沙盘

### 多场景推演

| 场景 | 输出 |
|------|------|
| **乐观场景** | 成功概率、关键事件、预期 ROI |
| **中性场景** | 成功概率、关键事件、预期 ROI |
| **悲观场景** | 成功概率、风险事件、应对方案 |

### 反事实推理

**核心问题:** 如果关键假设不成立，会发生什么？

**输出:**
- 后果分析
- 备用方案
- 早期预警信号

---

## 📦 决策包结构

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

## 🛠️ 文件结构

```
multi-agent-system/
├── README_DEEP_INSIGHT.md    # 本文档
├── deep_insight_core.py      # 统一入口 ⭐
├── dr_insight.py             # 首席战略研究员
├── sandbox.py                # 战略推演沙盘
├── bvare_search.py           # Bvare AI Search
├── heartbeat.py              # 心跳监控
├── commander_x.py            # 指挥官模块
├── config_v3.json            # 系统配置
└── ARCHITECTURE_V4.md        # 架构文档
```

---

## 🧪 测试结果

### 测试问题

> "在当前浏览器书签管理工具市场竞争中，我们应如何定位产品以构建护城河？"

### 系统输出

```
============================================================
📦 决策包
============================================================
策略：推出免费 + 付费增值模式的书签管理工具
建议：不推荐，建议重新设计策略
置信度：低
平均成功概率：21.0%
最终建议：建议暂缓，先验证核心假设或重新设计策略
============================================================
```

### 场景推演

| 场景 | 成功概率 | 预期 ROI | 时间线 |
|------|----------|----------|--------|
| 乐观 | 39.4% | 51.0% | 8 个月 |
| 中性 | 18.8% | 30.0% | 12 个月 |
| 悲观 | 5.0% | 14.4% | 20 个月 |

---

## 💡 使用示例

### 示例 1: 市场进入决策

```python
from deep_insight_core import DeepInsightCore

core = DeepInsightCore()

question = "在 AI 工具爆发的背景下，我们是否应该进入 AI 写作助手市场？"
decision = core.ask(question)

print(f"建议：{decision['recommendation']}")
print(f"置信度：{decision['confidence_level']}")
```

### 示例 2: 技术路线选择

```python
core = DeepInsightCore()

question = "应该选择纯前端方案还是前后端分离架构？"
decision = core.ask(question)

print(f"最终建议：{decision['final_advice']}")
```

---

## ⚙️ 配置说明

### 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `BVARE_API_KEY` | Bvare AI Search API Key | 否（不配置则降级） |

### 配置文件 (config_v3.json)

```json
{
  "heartbeat": {
    "enabled": true,
    "pulse": {"frequency": 5, "timeout": 10},
    "deadlock_detection": {"enabled": true},
    "self_check": {"enabled": true}
  },
  "bvare": {
    "enabled": true,
    "api_key_env": "BVARE_API_KEY"
  }
}
```

---

## 🎯 系统优势

| 维度 | 传统系统 | DeepInsight Core |
|------|----------|------------------|
| 驱动方式 | 任务驱动 | 问题驱动 ✅ |
| 分析深度 | 浅层信息 | 博士级分析 ✅ |
| 思维模型 | 无 | 内置商业模型 ✅ |
| 验证机制 | 单向搜集 | 假设验证 + 证伪 ✅ |
| 推演能力 | 无 | 多场景沙盘 ✅ |
| 风险评估 | 简单列举 | 概率计算 ✅ |
| 交付物 | 报告 | 决策包 ✅ |

---

## 📊 心跳监控

### 功能

- **基础心跳:** 每 5 次交互报告状态
- **死锁检测:** 检测重复行为
- **状态自检:** 自信度、频率检查
- **资源监控:** Token 使用、工具调用频率

### 输出示例

```
💓 心跳：OK
🔍 自检：NORMAL (自信度：100%)
⚠️ 死锁检测：无
📊 工具调用：2 次/分钟 ✅ 正常
```

---

## 🚀 下一步

### Phase 1 - 核心整合 ✅ (已完成)
- [x] Dr. Insight 模块
- [x] Sandbox 沙盘模块
- [x] Bvare Search 集成
- [x] Heartbeat 监控
- [x] 统一入口

### Phase 2 - 真实验证 (进行中)
- [ ] 配置 Bvare API Key
- [ ] 真实项目测试
- [ ] 性能优化

### Phase 3 - 增强功能 (计划中)
- [ ] 更多分析模型
- [ ] 数据可视化
- [ ] 协作编辑

---

## 📞 快速命令

```bash
# 测试系统
python deep_insight_core.py

# 查看系统状态
python -c "from deep_insight_core import DeepInsightCore; c = DeepInsightCore(); print(c.get_system_status())"

# 提出战略问题
python -c "from deep_insight_core import DeepInsightCore; c = DeepInsightCore(); c.ask('你的问题')"
```

---

_DeepInsight Core - 深度认知协同系统 v4.0_
