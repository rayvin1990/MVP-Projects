/**
 * DeepSeek API 使用示例
 * 妆妹微信小程序 AI 对话功能
 */

const { ai, deepseek } = require('./api');

// ============================================
// 示例 1: 初始化配置（在小程序启动时调用）
// ============================================

function initApp() {
  // 配置 DeepSeek API Key
  ai.setDeepSeekApiKey('sk-your-api-key-here');
  
  console.log('妆妹小程序已启动，AI 服务就绪');
}

// ============================================
// 示例 2: 简单对话（Promise 版本）
// ============================================

async function simpleChat() {
  try {
    const response = await ai.chatAsyncDeepSeek('今天适合画什么妆容？');
    console.log('妆妹回答:', response);
  } catch (error) {
    console.error('对话失败:', error.message);
  }
}

// ============================================
// 示例 3: 带上下文的对话
// ============================================

async function chatWithContext() {
  const messages = [
    { role: 'user', content: '我想画一个日常通勤妆' },
    { role: 'assistant', content: '好的！日常通勤妆要自然清新，我来给你推荐一下～首先底妆要轻薄...' },
    { role: 'user', content: '那眼妆用什么颜色比较好？' }
  ];
  
  try {
    const response = await ai.chatWithHistoryDeepSeek(messages);
    console.log('妆妹回答:', response);
    
    // 将新对话添加到历史记录
    messages.push(
      { role: 'assistant', content: response },
      { role: 'user', content: '谢谢！那口红呢？' }
    );
    
    // 继续对话
    const nextResponse = await ai.chatWithHistoryDeepSeek(messages);
    console.log('妆妹继续回答:', nextResponse);
  } catch (error) {
    console.error('对话失败:', error.message);
  }
}

// ============================================
// 示例 4: 流式对话（模拟流式效果）
// ============================================

function streamingChat() {
  const messages = [
    { role: 'user', content: '推荐一款适合夏天的口红' }
  ];
  
  ai.chatStreamDeepSeek(messages, {
    onChunk: (chunk, fullText) => {
      // 逐字显示（模拟打字机效果）
      process.stdout.write(chunk);
    },
    onComplete: (fullResponse) => {
      console.log('\n\n✅ 回答完成');
      console.log('完整回答:', fullResponse);
    },
    onError: (error) => {
      console.error('❌ 错误:', error.message);
    }
  });
}

// ============================================
// 示例 5: 自定义人设和参数
// ============================================

async function customPersona() {
  try {
    const response = await ai.chatAsyncDeepSeek('你觉得我适合什么风格的妆容？', {
      systemPrompt: '你是妆妹，一个专业的美妆顾问。你有 10 年化妆经验，擅长根据用户的脸型、肤色和场合推荐妆容。语气专业但亲切。',
      temperature: 0.8, // 更有创造性
      max_tokens: 2048  // 更长的回答
    });
    console.log('妆妹回答:', response);
  } catch (error) {
    console.error('对话失败:', error.message);
  }
}

// ============================================
// 示例 6: 在微信小程序页面中使用
// ============================================

/*
// pages/chat/chat.js

Page({
  data: {
    messages: [],
    inputText: '',
    isLoading: false
  },
  
  onLoad() {
    // 初始化时加载历史对话（如果有）
    const history = wx.getStorageSync('chat_history') || [];
    this.setData({ messages: history });
  },
  
  // 发送消息
  async sendMessage() {
    const { inputText, messages } = this.data;
    
    if (!inputText.trim() || this.data.isLoading) return;
    
    // 添加用户消息到界面
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
      
      // 添加 AI 回复到界面
      const updatedMessages = [...newMessages, { role: 'assistant', content: response }];
      this.setData({
        messages: updatedMessages,
        isLoading: false
      });
      
      // 保存到本地存储
      wx.setStorageSync('chat_history', updatedMessages);
      
    } catch (error) {
      console.error('对话失败:', error);
      this.setData({ isLoading: false });
      
      wx.showToast({
        title: '网络开小差了，请稍后再试',
        icon: 'none'
      });
    }
  },
  
  // 输入框变化
  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },
  
  // 清空对话
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.removeStorageSync('chat_history');
        }
      }
    });
  }
});
*/

// ============================================
// 示例 7: 错误处理最佳实践
// ============================================

async function chatWithErrorHandling(userMessage) {
  try {
    const response = await ai.chatAsyncDeepSeek(userMessage);
    return { success: true, data: response };
  } catch (error) {
    // 分类处理错误
    if (error.message.includes('API Key 未配置')) {
      return {
        success: false,
        error: 'API_KEY_NOT_CONFIGURED',
        message: '请先配置 DeepSeek API Key'
      };
    }
    
    if (error.message.includes('401')) {
      return {
        success: false,
        error: 'INVALID_API_KEY',
        message: 'API Key 无效，请检查配置'
      };
    }
    
    if (error.message.includes('429')) {
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: '请求太频繁，请稍后再试'
      };
    }
    
    if (error.message.includes('timeout') || error.message.includes('超时')) {
      return {
        success: false,
        error: 'REQUEST_TIMEOUT',
        message: '请求超时，请检查网络连接'
      };
    }
    
    // 其他错误
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: error.message || '发生未知错误'
    };
  }
}

// ============================================
// 运行示例
// ============================================

// 取消注释以运行示例
// initApp();
// simpleChat();
// chatWithContext();
// streamingChat();
// customPersona();

module.exports = {
  initApp,
  simpleChat,
  chatWithContext,
  streamingChat,
  customPersona,
  chatWithErrorHandling
};
