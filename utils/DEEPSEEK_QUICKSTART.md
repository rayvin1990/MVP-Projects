# DeepSeek API 快速集成指南

## 5 分钟快速上手

### 步骤 1: 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入控制台获取 API Key（格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxx`）

### 步骤 2: 配置文件

复制配置文件模板：

```bash
# 在 utils 目录下
cp app.config.js app.config.local.js
```

编辑 `app.config.local.js`，填入你的 API Key：

```javascript
deepseek: {
  apiKey: 'sk-你的真实 API Key',  // ← 填在这里
  // ...其他配置
}
```

### 步骤 3: 在小程序中初始化

```javascript
// app.js (小程序入口)
const { ai } = require('./utils/api');

App({
  onLaunch() {
    // 初始化 DeepSeek AI
    ai.setDeepSeekApiKey('sk-你的 API Key');
    console.log('妆妹 AI 已就绪');
  }
});
```

### 步骤 4: 开始对话

```javascript
// 在任意页面中
const { ai } = require('../../utils/api');

// 简单对话
Page({
  async sendMessage() {
    const response = await ai.chatAsyncDeepSeek('你好，妆妹！');
    console.log(response);
  }
});
```

---

## 完整示例：聊天页面

### WXML (pages/chat/chat.wxml)

```xml
<view class="chat-container">
  <!-- 消息列表 -->
  <scroll-view scroll-y class="message-list">
    <view wx:for="{{messages}}" wx:key="index" class="message {{item.role}}">
      <text>{{item.content}}</text>
    </view>
    <view wx:if="{{isLoading}}" class="loading">妆妹思考中...</view>
  </scroll-view>
  
  <!-- 输入框 -->
  <view class="input-area">
    <input 
      value="{{inputText}}" 
      bindinput="onInput" 
      placeholder="想问什么？"
      disabled="{{isLoading}}"
    />
    <button bindtap="sendMessage" disabled="{{isLoading}}">发送</button>
  </view>
</view>
```

### JS (pages/chat/chat.js)

```javascript
const { ai } = require('../../utils/api');

Page({
  data: {
    messages: [],
    inputText: '',
    isLoading: false
  },
  
  onLoad() {
    // 加载历史对话
    const history = wx.getStorageSync('chat_history') || [];
    this.setData({ messages: history });
  },
  
  // 输入变化
  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },
  
  // 发送消息
  async sendMessage() {
    const { inputText, messages } = this.data;
    
    if (!inputText.trim() || this.data.isLoading) return;
    
    // 添加用户消息
    const newMessages = [...messages, { role: 'user', content: inputText }];
    this.setData({
      messages: newMessages,
      inputText: '',
      isLoading: true
    });
    
    try {
      // 调用 DeepSeek API
      const response = await ai.chatWithHistoryDeepSeek(newMessages, {
        systemPrompt: '你是妆妹，一个 AI 美妆闺蜜。语气温柔亲切，像好姐妹一样聊天。',
        temperature: 0.7,
        max_tokens: 1024
      });
      
      // 添加 AI 回复
      this.setData({
        messages: [...newMessages, { role: 'assistant', content: response }],
        isLoading: false
      });
      
      // 保存历史
      wx.setStorageSync('chat_history', this.data.messages);
      
    } catch (error) {
      console.error('对话失败:', error);
      this.setData({ isLoading: false });
      
      wx.showToast({
        title: error.message || '网络开小差了',
        icon: 'none'
      });
    }
  },
  
  // 清空对话
  clearHistory() {
    wx.showModal({
      title: '清空对话',
      content: '确定清空所有对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.removeStorageSync('chat_history');
        }
      }
    });
  }
});
```

### WXSS (pages/chat/chat.wxss)

```css
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.message {
  margin: 20rpx 0;
  padding: 20rpx;
  border-radius: 16rpx;
  max-width: 80%;
}

.message.user {
  background: #07c160;
  color: white;
  margin-left: auto;
}

.message.assistant {
  background: #f5f5f5;
  color: #333;
}

.loading {
  text-align: center;
  color: #999;
  padding: 20rpx;
}

.input-area {
  display: flex;
  padding: 20rpx;
  border-top: 1rpx solid #eee;
  background: white;
}

.input-area input {
  flex: 1;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.input-area button {
  padding: 0 40rpx;
}
```

---

## 常见问题

### Q: API Key 应该放在哪里？

**A:** 生产环境请放在云函数环境变量中：

```javascript
// cloudfunctions/ai-chat/config.json
{
  "envVariables": {
    "DEEPSEEK_API_KEY": "sk-xxx"
  }
}
```

### Q: 如何控制对话成本？

**A:** 
1. 限制 `max_tokens`（默认 1024）
2. 限制历史消息数量（使用 `trimHistory()`）
3. 设置合理的 `temperature`（0.5-0.8 之间）

```javascript
const { deepseek } = require('../../utils/api');
const trimmed = deepseek.trimHistory(messages, 10); // 只保留最近 10 条
```

### Q: 如何处理网络错误？

**A:** 使用 try-catch 包裹，并给用户友好提示：

```javascript
try {
  const response = await ai.chatAsyncDeepSeek(message);
} catch (error) {
  wx.showToast({
    title: '网络开小差了，请稍后再试',
    icon: 'none'
  });
}
```

### Q: 支持流式输出吗？

**A:** DeepSeek API 目前不支持真正的流式输出，但可以使用模拟流式效果：

```javascript
ai.chatStreamDeepSeek(messages, {
  onChunk: (chunk, full) => {
    // 逐字显示
  },
  onComplete: (full) => {
    // 完成
  }
});
```

---

## 下一步

- 查看 `deepseek.example.js` 了解更多使用示例
- 阅读 `README.md` 了解完整 API 文档
- 访问 [DeepSeek 官方文档](https://platform.deepseek.com/api-docs/)

---

**开发愉快！有问题随时找主任～** ⚡
