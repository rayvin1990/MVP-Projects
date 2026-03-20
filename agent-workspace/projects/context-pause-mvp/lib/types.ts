// 上下文数据类型定义

export interface Context {
  id: string;
  name: string;
  description: string;
  files: string[];
  commands: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContextRequest {
  name: string;
  description: string;
  files: string[];
  commands: string[];
  notes: string;
}

export interface UpdateContextRequest extends CreateContextRequest {
  id: string;
}

export interface ContextResponse {
  success: boolean;
  data?: Context;
  error?: string;
}

export interface ContextsResponse {
  success: boolean;
  data?: Context[];
  error?: string;
}
