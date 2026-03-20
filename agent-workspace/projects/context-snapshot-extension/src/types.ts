// 类型定义

export interface ContextSnapshot {
  id: string;
  name: string;
  description: string;
  files: string[];
  commands: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureContextResult {
  success: boolean;
  data?: ContextSnapshot;
  error?: string;
}

export interface RestoreContextResult {
  success: boolean;
  error?: string;
}
