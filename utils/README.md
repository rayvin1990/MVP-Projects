# AI API 封装文档

## 文件结构

```
utils/
├── spark_api.js          # 讯飞 API 核心封装
├── deepseek.js           # DeepSeek API 核心封装
├── api.js                # 统一 API 入口
├── app.config.js         # 应用配置文件
├── spark_api.example.js  # 讯飞使用示例
├── deepseek.example.js   # DeepSeek 使用示例
└── README.md             # 本文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install ws
```

### 2. 配置 API Key

```javascript
// 在小程序启动时配置
const { ai } = require('./utils/api');
ai.setDeepSeekApiKey('sk-your-api-key-here');
```

### 3. 基本使用（讯飞星火 - WebSocket 流式）

```javascript
const { ai } = require('./utils/api');

// 流式对话
ai.chat('今天适合画什么妆容？', {
  onMessage: (chunk, full) => {
    console.log('收到:', chunk);
  },
  onComplete: (fullResponse) => {
    console.log('完成:', fullResponse);
  },
  onError: (error) => {
    console.error('错误:', error);
  }
});
```

### 4. DeepSeek API 使用（推荐）

```javascript
const { ai } = require('./utils/api');

// Promise 版本 - 简单对话
async function ask() {
  const response = await ai.chatAsyncDeepSeek('推荐一款口红');
  console.log(response);
}

// 带上下文的对话
async function chatWithContext() {
  const messages = [
    { role: 'user', content: '我想画日常妆' },
    { role: 'assistant', content: '好的，日常妆要自然...' },
    { role: 'user', content: '眼妆用什么颜色？' }
  ];
  
  const response = await ai.chatWithHistoryDeepSeek(messages);
  console.log(response);
}
```

## API 参考

### 讯飞星火 API（WebSocket）

#### ai.chat(message, options)

流式对话，适合实时显示。

**参数：**
- `message` (string): 用户消息
- `options` (object): 配置选项
  - `systemPrompt` (string): 系统提示词
  - `onMessage` (function): 收到消息回调 `(chunk, fullResponse)`
  - `onComplete` (function): 完成回调 `(fullResponse)`
  - `onError` (function): 错误回调 `(error)`

**返回：** WebSocket 实例

#### ai.chatAsync(message, options)

Promise 版本，等待完整响应。

**参数：**
- `message` (string): 用户消息
- `options` (object): 配置选项
  - `systemPrompt` (string): 系统提示词

**返回：** Promise<string>

#### ai.chatWithHistory(messages, options)

带历史记录的对话。

**参数：**
- `messages` (Array): 消息历史 `[{role, content}]`
- `options` (object): 配置选项
  - `onMessage` (function): 收到消息回调
  - `onComplete` (function): 完成回调
  - `onError` (function): 错误回调

**返回：** WebSocket 实例

---

### DeepSeek API（HTTP/HTTPS）

#### ai.chatAsyncDeepSeek(messages, options)

Promise 版本，适用于微信小程序。

**参数：**
- `messages` (string|Array): 用户消息（字符串）或消息历史（数组）
- `options` (object): 配置选项
  - `systemPrompt` (string): 系统提示词，默认妆妹人设
  - `temperature` (number): 温度（0-2），默认 0.7
  - `max_tokens` (number): 最大 token 数，默认 1024

**返回：** Promise<string>

#### ai.chatWithHistoryDeepSeek(messages, options)

带历史记录的对话。

**参数：**
- `messages` (Array): 消息历史 `[{role, content}]`
- `options` (object): 配置选项
  - `systemPrompt` (string): 系统提示词
  - `temperature` (number): 温度
  - `max_tokens` (number): 最大 token 数

**返回：** Promise<string>

#### ai.chatStreamDeepSeek(messages, options)

流式对话（模拟流式效果）。

**参数：**
- `messages` (Array): 消息历史
- `options` (object): 配置选项
  - `onChunk` (function): 收到数据块回调 `(chunk, fullText)`
  - `onComplete` (function): 完成回调 `(fullResponse)`
  - `onError` (function): 错误回调 `(error)`

#### ai.setDeepSeekApiKey(key)

设置 DeepSeek API Key。

**参数：**
- `key` (string): DeepSeek API Key

## 微信小程序集成

### 方式一：直接在小程序中使用 DeepSeek API

```javascript
// pages/chat/chat.js
const { ai } = require('../../utils/api');

Page({
  data: {
    messages: [],
    isLoading: false
  },
  
  onLoad() {
    // 初始化 API Key
    ai.setDeepSeekApiKey('sk-your-api-key-here');
  },
  
  async sendMessage() {
    const { inputText, messages } = this.data;
    
    if (!inputText.trim() || this.data.isLoading) return;
    
    const newMessages = [...messages, { role: 'user', content: inputText }];
    this.setData({ messages: newMessages, isLoading: true });
    
    try {
      const response = await ai.chatWithHistoryDeepSeek(newMessages);
      this.setData({
        messages: [...newMessages, { role: 'assistant', content: response }],
        isLoading: false
      });
    } catch (error) {
      console.error('对话失败:', error);
      this.setData({ isLoading: false });
      wx.showToast({ title: '网络开小差了', icon: 'none' });
    }
  }
});
```

### 方式二：在云函数中使用（推荐生产环境）

```javascript
// cloudfunctions/ai-chat/index.js
const { ai } = require('../../utils/api');

// 在云函数初始化时配置 API Key
ai.setDeepSeekApiKey(process.env.DEEPSEEK_API_KEY);

exports.main = async (event, context) => {
  const { messages } = event;
  
  try {
    const response = await ai.chatWithHistoryDeepSeek(messages);
    return { success: true, response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

```javascript
// 在小程序中调用云函数
wx.cloud.callFunction({
  name: 'ai-chat',
  data: {
    messages: [
      { role: 'user', content: '你好，妆妹' }
    ]
  },
  success: res => {
    console.log(res.result.response);
  }
});
```

## 配置说明

### 环境变量（推荐）

建议将敏感信息放入环境变量：

```bash
# .env
# 讯飞星火
XUNFEI_APP_ID=REDACTED
XUNFEI_API_KEY=REDACTED
XUNFEI_API_SECRET=REDACTED

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

```javascript
// app.config.js
const config = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  spark: {
    appId: process.env.XUNFEI_APP_ID,
    apiKey: process.env.XUNFEI_API_KEY,
    apiSecret: process.env.XUNFEI_API_SECRET
  }
};
```

### 在微信小程序云函数中使用环境变量

```javascript
// cloudfunctions/ai-chat/config.json
{
  "permissions": {
    "openapi": []
  },
  "envVariables": {
    "DEEPSEEK_API_KEY": "sk-xxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

```javascript
// cloudfunctions/ai-chat/index.js
const { ai } = require('../../utils/api');
ai.setDeepSeekApiKey(process.env.DEEPSEEK_API_KEY);
```

## 错误处理

### 讯飞星火 API 错误

1. **签名错误** - 检查 API 密钥配置
2. **网络错误** - 检查 WebSocket 连接
3. **配额超限** - 检查账户额度
4. **参数错误** - 检查请求格式

### DeepSeek API 错误

1. **401 Unauthorized** - API Key 无效或未配置
2. **429 Too Many Requests** - 请求频率超限
3. **500 Server Error** - DeepSeek 服务端错误
4. **Timeout** - 网络超时

### 错误处理示例

```javascript
async function safeChat(message) {
  try {
    const response = await ai.chatAsyncDeepSeek(message);
    return { success: true, data: response };
  } catch (error) {
    if (error.message.includes('API Key 未配置')) {
      return { success: false, error: '请先配置 API Key' };
    }
    if (error.message.includes('401')) {
      return { success: false, error: 'API Key 无效' };
    }
    if (error.message.includes('429')) {
      return { success: false, error: '请求太频繁，请稍后再试' };
    }
    return { success: false, error: error.message };
  }
}
```

## 技术细节

### 鉴权流程

1. 生成 UTC 时间戳
2. 构建签名原文：`host + date + request-line`
3. HMAC-SHA256 签名（使用 api_secret）
4. Base64 编码生成 authorization
5. 拼接 WebSocket URL

### 流式响应

- `status: 0` - 中间结果
- `status: 2` - 最后一次结果

### 消息格式

**请求：**
```json
{
  "header": { "app_id": "...", "uid": "..." },
  "parameter": { "chat": { "domain": "...", "temperature": 0.5 } },
  "payload": { "message": { "text": [...] } }
}
```

**响应：**
```json
{
  "header": { "code": 0, "status": 2 },
  "payload": { "choices": { "text": [{"content": "..."}] } }
}
```

## 注意事项

### 安全相关

1. ⚠️ **不要将 API 密钥暴露在客户端代码中** - 生产环境请使用云函数
2. ⚠️ **不要在 GitHub 等公开仓库提交包含密钥的文件** - 使用 .gitignore
3. ⚠️ **定期更换 API Key** - 提高安全性

### 性能相关

4. ⚠️ **注意 WebSocket 连接数限制**（讯飞）
5. ⚠️ **合理设置 max_tokens 避免超限**
6. ⚠️ **控制对话历史长度** - 避免 token 超限，建议使用 `trimHistory()` 函数

### DeepSeek 特定

7. ⚠️ **DeepSeek API 目前不支持真正的流式输出** - 使用模拟流式效果
8. ⚠️ **注意请求频率限制** - 建议添加请求间隔
9. ⚠️ **监控 token 使用量** - 避免费用超限

### 推荐实践

```javascript
// 限制历史消息数量
const { deepseek } = require('./api');
const trimmedMessages = deepseek.trimHistory(messages, 10); // 保留最近 10 条

// 添加请求间隔
async function chatWithDelay(messages, delayMs = 1000) {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return await ai.chatWithHistoryDeepSeek(messages);
}
```

## 相关资源

- [讯飞星火官方文档](https://www.xfyun.cn/doc/spark/Web.html)
- [DeepSeek 官方文档](https://platform.deepseek.com/api-docs/)
- [WebSocket MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [微信小程序 wx.request](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)
