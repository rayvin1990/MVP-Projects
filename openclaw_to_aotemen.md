# OpenClaw -> 奥特门 协作协议

更新时间：2026-03-13

## 目的

OpenClaw 不直接把奥特门当成本地函数调用。
协作方式改为：OpenClaw 通过共享记忆系统派发任务，奥特门读取任务并执行，再把结果写回共享记忆。

共享记忆系统入口：
`C:\Users\57684\.openclaw\workspace\memory\memory-system-v2\main.py`

## 角色分工

- OpenClaw：总指挥，负责发现任务、整理目标、派发任务、追踪状态。
- 奥特门：执行代理，负责代码修改、排查问题、验证结果、汇报结论。
- Claude Code：可作为专项编码执行者，由奥特门或 OpenClaw 进一步分派。

## 基本原则

- 不要求 OpenClaw 直接调用奥特门 API。
- 统一通过共享记忆留痕，避免口头任务丢失。
- 每个任务都要写清楚工作区、目标、优先级、交付物。
- 执行结果也必须回写，形成闭环。

## 派发任务格式

OpenClaw 派发任务时，使用 `category=派发任务`。
内容建议使用固定模板：

```text
任务给: 奥特门
工作区: C:\Users\57684\saasfly
优先级: high
目标: 检查支付逻辑，定位并修复 bug
交付: 修改代码 + 验证结果 + 简短总结
备注: 如果涉及环境变量或外部服务，先报告风险
```

## 派发命令示例

```bash
python C:\Users\57684\.openclaw\workspace\memory\memory-system-v2\main.py log "任务给: 奥特门；工作区: C:\Users\57684\saasfly；优先级: high；目标: 检查支付逻辑，定位并修复 bug；交付: 修改代码 + 验证结果 + 简短总结" --agent openclaw --category 派发任务
```

## 奥特门执行反馈格式

奥特门处理任务后，使用 `category=执行反馈` 或 `category=完成回执`。

推荐模板：

```text
任务源: OpenClaw
工作区: C:\Users\57684\saasfly
状态: done
结果: 已修复支付逻辑中的 X 问题
变更: 修改了 A、B、C
验证: 已运行相关检查，结果通过
风险: 仍需确认生产环境配置
```

## 执行反馈命令示例

```bash
python C:\Users\57684\.openclaw\workspace\memory\memory-system-v2\main.py log "任务源: OpenClaw；工作区: C:\Users\57684\saasfly；状态: done；结果: 已完成修复并验证；变更: 更新相关代码；验证: 本地检查通过；风险: 待确认生产配置" --agent aotemen --category 完成回执
```

## 推荐状态词

- `new`: 新任务
- `in_progress`: 处理中
- `blocked`: 被阻塞
- `done`: 已完成

## 推荐分类

- `派发任务`
- `执行中`
- `执行反馈`
- `完成回执`
- `阻塞说明`

## 最小工作流

1. OpenClaw 发现任务。
2. OpenClaw 用 `log` 写入一条 `派发任务`。
3. 奥特门读取任务并执行。
4. 奥特门在关键节点写 `执行中` 或 `阻塞说明`。
5. 奥特门完成后写 `完成回执`。
6. OpenClaw 根据共享记忆继续调度后续动作。

## 什么时候适合这样协作

适合：
- 代码修改
- 问题排查
- 文档整理
- 多代理共享上下文

不适合：
- 需要毫秒级同步的实时调用
- 复杂事务编排
- 强一致性的任务队列系统

## 结论

当前阶段，把共享记忆系统当作任务总线是最实用的方案。
先把派发、反馈、回执跑通，再考虑做更重的自动调度。
