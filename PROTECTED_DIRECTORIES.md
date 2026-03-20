# 🔴 禁止清理目录清单（永久保护）

**签发人：** 主任  
**生效日期：** 2026-03-18  
**状态：** 🔒 永久生效

---

## 绝对禁止清理的目录

### 1. Node.js / npm 相关
```
%APPDATA%\npm
%APPDATA%\npm-cache
%LOCALAPPDATA%\npm
C:\Users\57684\AppData\Roaming\npm
C:\Users\57684\AppData\Roaming\npm-cache
```

### 2. OpenClaw / Agent 相关
```
~/.openclaw/agents/*/node_modules
~/.openclaw/workspace/node_modules
~/.openclaw/
```

### 3. 开发工具运行时
```
%LOCALAPPDATA%\Programs\Python
%LOCALAPPDATA%\Programs\NodeJS
%PROGRAMFILES%\nodejs
```

### 4. 系统环境变量路径
- 任何在 PATH 环境变量中引用的目录
- 任何在系统配置文件中引用的目录

### 5. 应用数据
```
%APPDATA%\*
%LOCALAPPDATA%\*
```

---

## ✅ 清理前必须遵守的流程

1. **列出完整清单** - 删除前必须列出所有待删除文件/目录
2. **等待主任确认** - 主任说"可以清理"才能执行
3. **不确定就问** - 宁可多问，不可乱删

---

## ⚠️ 违规后果

- 可能导致 Node.js/npm 无法使用
- 可能导致 OpenClaw/Agent 系统崩溃
- 可能导致开发工具损坏
- 可能导致系统环境变量丢失

---

## 📋 执行原则

**所有代理和子代理必须遵守此清单。**

清理操作前必须：
1. 检查待删除路径是否匹配上述任何目录
2. 如匹配，立即停止并报告主任
3. 如不确定，先询问再行动

---

*此文件由小卡创建于 2026-03-18，所有会话必须加载并遵守。*
