// API 配置

export const API_CONFIG = {
  // Qwen3-VL-Plus API 配置
  qwen: {
    apiKey: process.env.QWEN_API_KEY || 'DASHSCOPE_API_KEY_PLACEHOLDER',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-vl-plus', // qwen-vl-plus �?qwen-vl-max
    endpoint: '/chat/completions',
  },
} as const;
