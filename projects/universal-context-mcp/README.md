# Universal Context MCP

**通用上下文中间层** - 为 AI 对话提供上下文缓存/压缩/检索，省 token、省时间、省调用。

## 🎯 核心卖点

| 指标 | 效果 |
|------|------|
| **Token 节省** | 30%-50%（通过上下文压缩） |
| **响应速度** | 提升 20%-40%（缓存命中） |
| **API 调用** | 减少 30%+（重复内容复用） |

## 🚀 3 分钟入门

### 1. 安装

```bash
cd universal-context-mcp
npm install
```

### 2. 启动

```bash
node src/server.js
```

### 3. 使用

在 Claude Code / Codex / OpenClaw 中配置 MCP 工具，然后使用以下工具：

| 工具 | 功能 |
|------|------|
| `get_context` | 获取增强后的上下文 |
| `classify_intent` | 意图识别 |
| `analyze_project` | 项目解析 |
| `search_similar` | 语义检索相似上下文 |
| `cache_context` | 缓存当前上下文 |
| `clear_cache` | 清除缓存 |

## 📦 安装

```bash
cd universal-context-mcp
npm install
```

## 🛠️ 使用

### 启动 MCP Server

```bash
node src/server.js
```

### 工具列表

- `get_context` - 获取增强后的上下文
- `classify_intent` - 意图识别
- `analyze_project` - 项目解析
- `search_similar` - 语义检索相似上下文
- `cache_context` - 缓存当前上下文
- `clear_cache` - 清除缓存

## 🔧 OpenClaw 集成

### 启用插件

```javascript
import UniversalContextMCPPlugin from './openclaw/plugin.js';

const plugin = new UniversalContextMCPPlugin();
await plugin.initialize();
```

### 多通道支持

- Feishu
- Telegram
- Discord

### 会话隔离

- Task ID 隔离
- 会话上下文管理
- 缓存隔离

## 📊 架构

```
┌─────────────────┐
│ Claude Code     │
│ (MCP Client)   │
└────────┬────────┘
         │ MCP Protocol (stdio)
         ▼
┌─────────────────┐
│ Universal Context MCP Server │
│                 │
│ - Router        │
│ - Input         │
│ - Output        │
│ - Cache         │
└─────────────────┘
```

## 🧪 测试

```bash
npm test          # 运行单元测试
npm run test:integration  # 运行集成测试
```

## 📝 文档

- [DESIGN.md](./DESIGN.md) - 技术方案设计
- [docs/API.md](./docs/API.md) - API 文档

## 📄 许可证

MIT License

---

**有问题？欢迎提 GitHub Issue**  
**觉得有用？欢迎 Star ⭐**
