// 文本扩展工具类型定义

export interface Snippet {
  id: string;
  title: string;
  content: string;
  abbreviation?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnippetRequest {
  title: string;
  content: string;
  abbreviation?: string;
  tags?: string[];
}

export interface UpdateSnippetRequest extends CreateSnippetRequest {
  id: string;
}

export interface SnippetResponse {
  success: boolean;
  data?: Snippet;
  error?: string;
}

export interface SnippetsResponse {
  success: boolean;
  data?: Snippet[];
  error?: string;
}
