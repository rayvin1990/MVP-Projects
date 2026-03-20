/**
 * API 统一入口
 * 集成各第三方服务 API
 */

const sparkApi = require('./spark_api');
const deepseekApi = require('./deepseek');

/**
 * AI 对话服务
 */
const ai = {
  /**
   * 与妆妹 AI 对话（流式）
   * @param {string} message - 用户消息
   * @param {object} options - 配置选项
   * @param {function} options.onMessage - 收到消息回调
   * @param {function} options.onComplete - 完成回调
   * @param {function} options.onError - 错误回调
   * @returns {WebSocket} WebSocket 实例
   */
  chat: function(message, options = {}) {
    return sparkApi.chat(message, {
      systemPrompt: options.systemPrompt || '你是妆妹，一个 AI 美妆闺蜜。语气温柔亲切，像好姐妹一样聊天。',
      onMessage: options.onMessage,
      onComplete: options.onComplete,
      onError: options.onError
    });
  },
  
  /**
   * 与妆妹 AI 对话（Promise 版本）
   * @param {string} message - 用户消息
   * @param {object} options - 配置选项
   * @returns {Promise<string>} AI 的完整回复
   */
  chatAsync: function(message, options = {}) {
    return sparkApi.chatAsync(message, {
      systemPrompt: options.systemPrompt || '你是妆妹，一个 AI 美妆闺蜜。语气温柔亲切，像好姐妹一样聊天。'
    });
  },
  
  /**
   * 带历史记录的对话
   * @param {Array} messages - 消息历史
   * @param {object} options - 配置选项
   * @returns {WebSocket} WebSocket 实例
   */
  chatWithHistory: function(messages, options = {}) {
    return sparkApi.chatWithHistory(messages, options);
  },
  
  /**
   * 与妆妹 AI 对话（DeepSeek 版本 - Promise）
   * @param {string|Array} messages - 用户消息（字符串）或消息历史（数组）
   * @param {object} options - 配置选项
   * @param {string} options.systemPrompt - 系统提示词
   * @param {number} options.temperature - 温度（0-2），默认 0.7
   * @param {number} options.max_tokens - 最大 token 数，默认 1024
   * @returns {Promise<string>} AI 的完整回复
   */
  chatAsyncDeepSeek: function(messages, options = {}) {
    return deepseekApi.chatAsync(messages, {
      systemPrompt: options.systemPrompt || '你是妆妹，一个 AI 美妆闺蜜。语气温柔亲切，像好姐妹一样聊天。',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024
    });
  },
  
  /**
   * 流式对话（DeepSeek 版本 - 模拟流式）
   * @param {Array} messages - 消息历史
   * @param {object} options - 配置选项
   * @param {function} options.onChunk - 收到数据块回调
   * @param {function} options.onComplete - 完成回调
   * @param {function} options.onError - 错误回调
   */
  chatStreamDeepSeek: function(messages, options = {}) {
    deepseekApi.chatStream(messages, options);
  },
  
  /**
   * 带历史记录的对话（DeepSeek 版本）
   * @param {Array} messages - 消息历史 [{role, content}]
   * @param {object} options - 配置选项
   * @returns {Promise<string>} AI 的完整回复
   */
  chatWithHistoryDeepSeek: function(messages, options = {}) {
    return deepseekApi.chatWithHistory(messages, options);
  },
  
  /**
   * 设置 DeepSeek API Key
   * @param {string} key - DeepSeek API Key
   */
  setDeepSeekApiKey: function(key) {
    deepseekApi.setApiKey(key);
  }
};

/**
 * 导出所有 API
 */
module.exports = {
  ai,
  spark: sparkApi,
  deepseek: deepseekApi
};
