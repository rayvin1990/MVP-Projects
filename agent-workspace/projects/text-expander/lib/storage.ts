import { Snippet, CreateSnippetRequest, UpdateSnippetRequest } from './types';

// 存储键
const STORAGE_KEY = 'text_expander_data';

// 获取所有片段
export function getAllSnippets(): Snippet[] {
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
    console.error('Failed to parse snippets:', error);
    return [];
  }
}

// 创建片段
export function createSnippet(request: CreateSnippetRequest): Snippet {
  const snippets = getAllSnippets();

  const newSnippet: Snippet = {
    id: Date.now().toString(),
    title: request.title,
    content: request.content,
    abbreviation: request.abbreviation,
    tags: request.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  snippets.push(newSnippet);
  saveSnippets(snippets);

  return newSnippet;
}

// 更新片段
export function updateSnippet(id: string, request: UpdateSnippetRequest): Snippet | null {
  const snippets = getAllSnippets();
  const index = snippets.findIndex(s => s.id === id);

  if (index === -1) {
    return null;
  }

  const updatedSnippet: Snippet = {
    ...snippets[index],
    ...request,
    id,
    updatedAt: new Date().toISOString(),
  };

  snippets[index] = updatedSnippet;
  saveSnippets(snippets);

  return updatedSnippet;
}

// 删除片段
export function deleteSnippet(id: string): boolean {
  const snippets = getAllSnippets();
  const filtered = snippets.filter(s => s.id !== id);

  if (filtered.length === snippets.length) {
    return false;
  }

  saveSnippets(filtered);
  return true;
}

// 搜索片段
export function searchSnippets(query: string): Snippet[] {
  const snippets = getAllSnippets();
  const lowerQuery = query.toLowerCase();

  return snippets.filter(s =>
    s.title.toLowerCase().includes(lowerQuery) ||
    s.content.toLowerCase().includes(lowerQuery) ||
    s.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// 保存片段列表
function saveSnippets(snippets: Snippet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}
