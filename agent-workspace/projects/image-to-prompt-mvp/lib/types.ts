// TypeScript Type Definitions

export interface ImageUploadResponse {
  success: boolean;
  message?: string;
}

export interface PromptGenerationRequest {
  image: string; // Base64 encoded image
  apiKey?: string; // Optional API Key
}

export interface PromptGenerationResponse {
  success: boolean;
  prompt?: string;
  error?: string;
}

export interface GenerateState {
  imagePreview: string | null;
  isGenerating: boolean;
  generatedPrompt: string | null;
  error: string | null;
}

// API Configuration

export const API_CONFIG = {
  // Qwen3-VL-Plus API Configuration
  qwen: {
    apiKey: process.env.QWEN_API_KEY || 'DASHSCOPE_API_KEY_PLACEHOLDER',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-vl-plus', // qwen-vl-plus or qwen-vl-max
    endpoint: '/chat/completions',
  },
} as const;
