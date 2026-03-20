# Project Execution Flow

## 项目执行总流程

```
1. 创始人提出目标
   ↓
2. nia 判断项目类型和优先级
   ↓
3. 指派 PM
   ↓
4. PM 读取历史记忆
   ↓
5. Market Research Agent 验证需求和竞品
   ↓
6. Product Manager Agent 判断 MVP 2.0 价值、差异化、尖叫点
   ↓
7. SEO / Growth Agent 给出搜索需求、页面地图、被动流量入口
   ↓
8. Documentation Manager 生成 PRD / 策略文档
   ↓
9. PM 拆任务
   ↓
10. Codex Team 做架构和开发
    ↓
11. Claude Team 做测试、部署准备、运维准备
    ↓
12. Security Manager 做安全审查
    ↓
13. Product Manager 再做上线前用户价值确认
    ↓
14. Final Review Agent 做总审
    ↓
15. Go 后由 Deploy Agent 部署
    ↓
16. nia 做归档、复盘、OKR 更新
```

## 质量门禁流程

```
开发完成
  ↓
测试完成（Claude Test Agent）
  ↓
安全检查完成（Security Manager）
  ↓
产品经理确认"值得发"（Product Manager）
  ↓
Final Review Agent 总审
  ↓
Go / Fix / No-Go
  ↓
Deploy Agent 部署
```

## Final Review 审查清单

| 检查项 | 负责人 |
|--------|--------|
| 功能是否达到交付标准 | PM |
| 测试是否完成 | Claude Test Agent |
| 严重 bug 是否清零 | Claude Test Agent |
| 安全风险是否可接受 | Security Manager |
| 部署条件是否齐全 | Claude Deploy Agent |
| 回滚方案是否存在 | Claude Deploy Agent |
| 文档是否完整 | Documentation Manager |
| Product Manager 是否确认"值得发布" | Product Manager |

## 任务调度协议

所有任务必须结构化：

```
TASK
Project:
Task:
Owner Agent:
Role:
Input:
Expected Output:
Dependencies:
Priority: P0/P1/P2
Deadline:
Validation Method:
```

**优先级定义：**
- P0 = critical
- P1 = important
- P2 = enhancement

**规则：**
- 不允许模糊任务
- 不允许混合所有权
- 不允许无依赖说明
- 不允许无输出定义
- 不允许无验证方法
