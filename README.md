# Context Compression MVP

AI Agent 上下文压缩系统 - V2.0 with Vector Storage

## 项目概述

解决 AI 对话中的上下文长度限制问题，通过智能摘要压缩和向量检索保持对话连贯性。

### 核心功能

- ✅ **摘要压缩** - 使用 Qwen-Max 进行智能摘要
- ✅ **向量存储** - ChromaDB 集成，支持语义检索
- ✅ **向量嵌入** - 自动为压缩内容生成嵌入向量
- ✅ **语义检索** - 基于相似度的上下文检索
- ✅ **单 Agent 支持** - 单一对话代理上下文管理
- ✅ **会话历史管理** - 完整的会话生命周期管理
- ✅ **关键信息保留** - 自动提取和保留决策、偏好等关键信息

### 技术栈

- **核心框架**: 自研上下文压缩引擎
- **向量存储**: ChromaDB (支持持久化和内存模式)
- **摘要模型**: Qwen-Max
- **嵌入模型**: text-embedding-3-small (支持回退到哈希嵌入)

## 快速开始

### 1. 安装依赖

```bash
cd context-compression-mvp
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
QWEN_API_KEY=your_qwen_api_key_here
QWEN_MODEL=qwen-max
MEM0_API_KEY=your_mem0_api_key_here
```

### 3. 运行

```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 运行测试
npm test
```

## 使用示例

### 基础用法

```javascript
import ContextCompressionMVP from './src/index.js';

// 初始化
const app = new ContextCompressionMVP({
  compressionThreshold: 4000, // 触发压缩的阈值
});

// 处理对话
const result = await app.processTurn('session-123', {
  role: 'user',
  content: '你好，我想了解一下上下文压缩的功能',
});

console.log(result.context); // 获取处理后的上下文
console.log(result.compressed); // 是否已压缩
console.log(result.stats); // 统计信息
```

### 高级用法

```javascript
// 获取会话统计
const stats = app.getSessionStats('session-123');

// 获取所有会话
const sessions = app.getAllSessions();

// 清除会话
app.clearSession('session-123');

// 删除会话
app.deleteSession('session-123');

// 健康检查
const health = await app.healthCheck();

// 向量检索 (V2.0 新增)
const results = await app.retrieveContext('previous discussion about AI', 'session-123', 5);
console.log(results); // 相关上下文片段

// 获取向量存储统计
const vectorStats = await app.getVectorStoreStats();
console.log(vectorStats);
```

## 项目结构

```
context-compression-mvp/
├── src/
│   ├── index.js              # 主入口 (V2.0)
│   ├── core/
│   │   ├── compressor.js     # 压缩核心 (支持向量存储)
│   │   └── session-manager.js # 会话管理
│   ├── api/
│   │   └── qwen.js           # Qwen API 客户端
│   └── utils/
│       ├── vector-store.js       # 向量存储 (ChromaDB)
│       ├── embedding-service.js  # 嵌入服务
│       └── helpers.js            # 工具函数
├── tests/
│   ├── compressor.test.js    # 压缩器测试
│   ├── vector-store.test.js  # 向量存储测试 (V2.0)
│   └── integration.test.js   # 集成测试 (V2.0)
├── config/
│   └── index.js              # 配置管理
├── docs/                     # 文档 (预留)
├── .env.example              # 环境变量示例
├── package.json
└── README.md
```

## API 参考

### ContextCompressionMVP

#### 构造函数

```javascript
new ContextCompressionMVP(options?: {
  qwen?: { apiKey, model },
  compressor?: { maxContextLength, compressionRatio, preserveKeyInfo },
  sessionManager?: { maxHistoryLength, ttl },
  compressionThreshold?: number
})
```

#### 方法

- `processTurn(sessionId, message)` - 处理对话回合（自动压缩）
- `getContext(sessionId)` - 获取当前上下文
- `addMessage(sessionId, message)` - 添加消息
- `getSessionStats(sessionId)` - 获取会话统计
- `getAllSessions()` - 获取所有会话
- `clearSession(sessionId)` - 清除会话
- `deleteSession(sessionId)` - 删除会话
- `healthCheck()` - 健康检查
- `retrieveContext(query, sessionId?, limit?)` - **V2.0** 语义检索相关上下文
- `getVectorStoreStats()` - **V2.0** 获取向量存储统计

### ContextCompressor

核心压缩逻辑，处理摘要生成和关键信息提取。

### SessionManager

会话生命周期管理，包括消息存储、历史维护、过期清理。

### QwenClient

Qwen API 客户端，提供摘要生成和关键信息提取功能。

## 配置选项

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `MAX_CONTEXT_LENGTH` | 4000 | 最大上下文长度（字符） |
| `COMPRESSION_RATIO` | 0.3 | 目标压缩比例 |
| `PRESERVE_KEY_INFO` | true | 是否保留关键信息 |
| `QWEN_MODEL` | qwen-max | Qwen 模型名称 |
| `EMBEDDING_MODEL` | text-embedding-3-small | 嵌入模型 (V2.0) |
| `CHROMA_DB_PATH` | ./chroma_db | ChromaDB 存储路径 (V2.0) |
| `OPENAI_API_KEY` | - | OpenAI API 密钥（用于嵌入，可选） |

## 测试报告

运行测试：

```bash
npm test
```

### 测试覆盖

- ✅ ContextCompressor 初始化
- ✅ 压缩阈值判断
- ✅ 摘要压缩功能
- ✅ 关键信息提取
- ✅ 会话历史存储
- ✅ SessionManager 基本操作
- ✅ 会话统计
- ✅ 会话清理
- ✅ **VectorStore 初始化** (V2.0)
- ✅ **嵌入生成** (V2.0)
- ✅ **向量添加和搜索** (V2.0)
- ✅ **余弦相似度计算** (V2.0)
- ✅ **语义检索集成** (V2.0)
- ✅ **健康检查** (V2.0)

**测试通过率:** 47/47 ✅

## 开发计划

### MVP (Day 1) ✅

- [x] 项目结构
- [x] 摘要压缩核心
- [x] Qwen API 集成
- [x] 会话管理
- [x] 测试用例
- [x] 文档

### V2.0 (Day 2) ✅

- [x] 向量检索 (ChromaDB)
- [x] 向量嵌入功能
- [x] 测试向量检索准确性
- [x] 更新文档

### V2.1 (规划)

- [ ] 多 Agent 协作
- [ ] MEMORY.md 同步
- [ ] 高级检索策略
- [ ] 性能优化
- [ ] 持久化 ChromaDB 服务器集成

## Git 规范

每个任务完成后提交：

```bash
git commit -m "<type>: <description>" && git push
```

类型说明：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `test`: 测试
- `refactor`: 重构
- `chore`: 其他

## 许可证

MIT

## 作者

Codex (探险家)

---

**状态**: V2.0 完成 ✅ (向量检索集成)
**版本**: 2.0.0
**最后更新**: 2026-03-14
