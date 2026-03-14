import { Context, CreateContextRequest, UpdateContextRequest } from './types';

// 存储键
const STORAGE_KEY = 'context_pause_data';

// 获取所有上下文
export function getAllContexts(): Context[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse contexts:', error);
    return [];
  }
}

// 获取单个上下文
export function getContextById(id: string): Context | undefined {
  const contexts = getAllContexts();
  return contexts.find(c => c.id === id);
}

// 创建上下文
export function createContext(request: CreateContextRequest): Context {
  const contexts = getAllContexts();

  const newContext: Context = {
    id: Date.now().toString(),
    name: request.name,
    description: request.description,
    files: request.files || [],
    commands: request.commands || [],
    notes: request.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  contexts.push(newContext);
  saveContexts(contexts);

  return newContext;
}

// 更新上下文
export function updateContext(id: string, request: UpdateContextRequest): Context | null {
  const contexts = getAllContexts();
  const index = contexts.findIndex(c => c.id === id);

  if (index === -1) {
    return null;
  }

  const updatedContext: Context = {
    ...contexts[index],
    ...request,
    id,
    updatedAt: new Date().toISOString(),
  };

  contexts[index] = updatedContext;
  saveContexts(contexts);

  return updatedContext;
}

// 删除上下文
export function deleteContext(id: string): boolean {
  const contexts = getAllContexts();
  const filtered = contexts.filter(c => c.id !== id);

  if (filtered.length === contexts.length) {
    return false;
  }

  saveContexts(filtered);
  return true;
}

// 保存上下文列表
function saveContexts(contexts: Context[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contexts));
}
