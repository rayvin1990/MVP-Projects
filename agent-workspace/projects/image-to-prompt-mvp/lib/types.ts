// TypeScript 类型定义

export interface ImageUploadResponse {
  success: boolean;
  message?: string;
}

export interface PromptGenerationRequest {
  image: string; // Base64 编码的图片
  apiKey?: string; // 可选的 API Key
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
