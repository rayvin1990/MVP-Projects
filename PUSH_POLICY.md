# 推送分类管理制度

**建立时间**：2026-04-07

---

## 分类标准

### 🔴 本地私有（不推送）
- `TOOLS.md` - 本地工具配置（含 API Key）
- `.env.local` - 本地环境变量
- `credentials/` - 凭证目录
- `memory/` - 个人记忆
- `company/` - 公司内部资料

### 🟡 脱敏后可推送
- `projects/*/README.md` - 需确认无密钥
- `SECURITY_CHECKLIST.md` - 敏感信息已用 REDACTED

### 🟢 公开可推送
- `AGENTS.md`, `SOUL.md`, `USER.md` - 角色定义（无密钥）
- `HEARTBEAT.md` - 定时任务配置
- `projects/*/src/` - 源代码
- `utils/*.js` - 工具脚本

---

## 推送前检查清单

1. ✅ 确认文件在公开目录
2. ✅ 确认无 `REDACTED` 以外的密钥
3. ✅ pre-hook 扫描通过

---

**负责人**：mia