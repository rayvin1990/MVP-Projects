// API 配置

export const API_CONFIG = {
  // Qwen3-VL-Plus API 配置
  qwen: {
    apiKey: process.env.QWEN_API_KEY || 'sk-4f0f0d5dde074822b70d40ac48244d9d',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-vl-plus', // qwen-vl-plus 或 qwen-vl-max
    endpoint: '/chat/completions',
  },
} as const;
