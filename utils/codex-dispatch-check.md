# Codex 调度检查工具

## 功能
检查 `codex-dispatch.json`，当 `shouldTrigger=true` 时自动触发 Codex 执行任务。

## 使用方法

### 1. 手动检查
```powershell
python check_codex_dispatch.py
```

### 2. 自动检查（加入心跳）

在心跳时自动检查 Codex 任务。

---

## 实现逻辑

1. 读取 `C:\Users\57684\saasfly\memory\automation\codex-dispatch.json`
2. 检查 `shouldTrigger` 字段
3. 如果为 `true`，获取 `tasks` 列表
4. 尝试通过 ACP 或共享记忆区触发 Codex 执行

---

## 文件位置
- 调度文件：`C:\Users\57684\saasfly\memory\automation\codex-dispatch.json`
- 任务目录：`C:\Users\57684\saasfly\memory\roles\operating\tasks\`
- 结果目录：`C:\Users\57684\saasfly\memory\roles\operating\results\`

---

*最后更新：2026-03-15*
