/**
 * 讯飞星火大模型 WebSocket API 封装
 * 适用于妆妹微信小程序 AI 对话功能
 */

const crypto = require('crypto');
const WebSocket = require('ws');

// 配置参数
const CONFIG = {
  appId: process.env.XUNFEI_APP_ID || '',
  apiKey: process.env.XUNFEI_API_KEY || '',
  apiSecret: process.env.XUNFEI_API_SECRET || '',
  host: 'spark-api.xf-yun.com',
  path: '/v4.0/chat',
  domain: '4.0Ultra'
};

/**
 * 生成鉴权 URL
 * 使用 HMAC-SHA256 签名算法
 * @returns {string} 鉴权后的 WebSocket URL
 */
function getAuthUrl() {
  const date = new Date().toUTCString();
  const host = CONFIG.host;
  const path = CONFIG.path;
  
  // 生成签名原文
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  // HMAC-SHA256 签名
  const signatureSha = crypto
    .createHmac('sha256', CONFIG.apiSecret)
    .update(signatureOrigin)
    .digest('base64');
  
  // 生成 authorization 原文
  const authorizationOrigin = `api_key="${CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
  
  // Base64 编码
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  
  // 构建完整的 WebSocket URL
  const url = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
  
  return url;
}

/**
 * 构建请求体
 * @param {string} userMessage - 用户消息
 * @param {string} systemPrompt - 系统提示词（可选）
 * @returns {object} 请求体对象
 */
function buildRequestBody(userMessage, systemPrompt = '你是妆妹，一个 AI 美妆闺蜜。语气温柔亲切，像好姐妹一样聊天。') {
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userMessage
    }
  ];
  
  return {
    header: {
      app_id: CONFIG.appId,
      uid: 'zhuangmei'
    },
    parameter: {
      chat: {
        domain: CONFIG.domain,
        temperature: 0.5,
        max_tokens: 2048
      }
    },
    payload: {
      message: {
        text: messages
      }
    }
  };
}

/**
 * 与讯飞星火对话
 * @param {string} userMessage - 用户消息
 * @param {object} options - 配置选项
 * @param {string} options.systemPrompt - 系统提示词
 * @param {function} options.onMessage - 收到消息回调（流式）
 * @param {function} options.onComplete - 完成回调
 * @param {function} options.onError - 错误回调
 * @returns {WebSocket} WebSocket 实例
 */
function chat(userMessage, options = {}) {
  const {
    systemPrompt,
    onMessage,
    onComplete,
    onError
  } = options;
  
  const url = getAuthUrl();
  const ws = new WebSocket(url);
  
  let fullResponse = '';
  
  // 连接打开
  ws.on('open', () => {
    const requestBody = buildRequestBody(userMessage, systemPrompt);
    ws.send(JSON.stringify(requestBody));
  });
  
  // 接收消息
  ws.on('message', (data) => {
    try {
      const response = JSON.parse(data.toString());
      
      // 检查错误
      if (response.header && response.header.code !== 0) {
        const error = new Error(`讯飞 API 错误：${response.header.code}`);
        error.code = response.header.code;
        error.message = response.header.message || '未知错误';
        
        if (onError) {
          onError(error);
        }
        ws.close();
        return;
      }
      
      // 提取响应内容
      if (response.payload && response.payload.choices && response.payload.choices.text) {
        const textItem = response.payload.choices.text[0];
        const content = textItem.content || '';
        
        fullResponse += content;
        
        // 流式回调
        if (onMessage && content) {
          onMessage(content, fullResponse);
        }
        
        // 检查是否完成（status: 2 表示最后一次）
        if (response.header && response.header.status === 2) {
          if (onComplete) {
            onComplete(fullResponse);
          }
          ws.close();
        }
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  });
  
  // 连接错误
  ws.on('error', (error) => {
    if (onError) {
      onError(error);
    }
  });
  
  // 连接关闭
  ws.on('close', () => {
    // 正常关闭，无需额外处理
  });
  
  return ws;
}

/**
 * 简易对话函数（Promise 版本）
 * 等待完整响应后返回
 * @param {string} userMessage - 用户消息
 * @param {object} options - 配置选项
 * @param {string} options.systemPrompt - 系统提示词
 * @returns {Promise<string>} AI 的完整回复
 */
async function chatAsync(userMessage, options = {}) {
  return new Promise((resolve, reject) => {
    let fullResponse = '';
    
    chat(userMessage, {
      systemPrompt: options.systemPrompt,
      onMessage: (chunk, full) => {
        // 流式更新（可选处理）
      },
      onComplete: (full) => {
        resolve(full);
      },
      onError: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 带会话历史的对话
 * @param {Array} messages - 消息历史 [{role, content}]
 * @param {object} options - 配置选项
 * @param {function} options.onMessage - 收到消息回调（流式）
 * @param {function} options.onComplete - 完成回调
 * @param {function} options.onError - 错误回调
 * @returns {WebSocket} WebSocket 实例
 */
function chatWithHistory(messages, options = {}) {
  const {
    onMessage,
    onComplete,
    onError
  } = options;
  
  const url = getAuthUrl();
  const ws = new WebSocket(url);
  
  let fullResponse = '';
  
  ws.on('open', () => {
    const requestBody = {
      header: {
        app_id: CONFIG.appId,
        uid: 'zhuangmei'
      },
      parameter: {
        chat: {
          domain: CONFIG.domain,
          temperature: 0.5,
          max_tokens: 2048
        }
      },
      payload: {
        message: {
          text: messages
        }
      }
    };
    
    ws.send(JSON.stringify(requestBody));
  });
  
  ws.on('message', (data) => {
    try {
      const response = JSON.parse(data.toString());
      
      if (response.header && response.header.code !== 0) {
        const error = new Error(`讯飞 API 错误：${response.header.code}`);
        error.code = response.header.code;
        
        if (onError) {
          onError(error);
        }
        ws.close();
        return;
      }
      
      if (response.payload && response.payload.choices && response.payload.choices.text) {
        const textItem = response.payload.choices.text[0];
        const content = textItem.content || '';
        
        fullResponse += content;
        
        if (onMessage && content) {
          onMessage(content, fullResponse);
        }
        
        if (response.header && response.header.status === 2) {
          if (onComplete) {
            onComplete(fullResponse);
          }
          ws.close();
        }
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  });
  
  ws.on('error', (error) => {
    if (onError) {
      onError(error);
    }
  });
  
  return ws;
}

module.exports = {
  chat,
  chatAsync,
  chatWithHistory,
  getAuthUrl,
  CONFIG
};