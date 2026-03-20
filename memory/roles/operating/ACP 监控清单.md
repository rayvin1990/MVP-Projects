# ACP 监控清单

**优先级：** P0（公司运转核心）  
**负责人：** Nia  
**检查频率：** 每日

---

## 📋 每日检查项

### 1. 版本检查
```bash
# 检查 acpx 版本
acpx --version

# 检查 openclaw 期望版本
# 位置：~/.openclaw/openclaw.json → plugins.entries.acpx
```

### 2. ACP 功能测试
```
测试命令：
sessions_spawn(agentId="claude", runtime="acp", task="测试")

预期：status = "accepted"
失败：status = "error" → 立即上报
```

### 3. 网关状态
```bash
openclaw gateway status
```

---

## 🚨 故障应急预案

**ACP 不可用时：**
1. 立即上报主任
2. 启用临时方案（飞书 + 共享记忆区）
3. 奥特分析根因
4. 修复后测试验证
5. 写入故障报告

---

## 📝 检查日志

| 日期 | 检查人 | acpx 版本 | 测试结果 | 备注 |
|------|--------|----------|----------|------|
| 2026-03-19 | Nia | 0.3.0 | ✅ 正常 | 奥特修复后 |

---

**制度来源：** 主任指示"ACP 效率最高，这个问题不解决公司很难运转"
