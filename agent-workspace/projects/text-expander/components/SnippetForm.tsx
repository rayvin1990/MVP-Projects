'use client';

import React, { useState } from 'react';
import { CreateSnippetRequest, Snippet } from '@/lib/types';

interface SnippetFormProps {
  snippet?: Snippet;
  onSubmit: (data: CreateSnippetRequest) => void;
  onCancel: () => void;
}

export default function SnippetForm({ snippet, onSubmit, onCancel }: SnippetFormProps) {
  const [title, setTitle] = useState(snippet?.title || '');
  const [content, setContent] = useState(snippet?.content || '');
  const [abbreviation, setAbbreviation] = useState(snippet?.abbreviation || '');
  const [tags, setTags] = useState(snippet?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateSnippetRequest = {
      title: title.trim(),
      content: content.trim(),
      abbreviation: abbreviation.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
    };

    onSubmit(data);
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-black mb-6">
        {snippet ? '编辑文本片段' : '创建文本片段'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-gray-800 mb-2">
            标题 *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
            placeholder="例如：我的邮箱地址"
            required
          />
        </div>

        <div>
          <label htmlFor="abbreviation" className="block text-sm font-bold text-gray-800 mb-2">
            快捷缩写（可选）
          </label>
          <input
            type="text"
            id="abbreviation"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono text-black"
            placeholder="例如：email"
          />
          <p className="text-xs text-gray-600 mt-1">快捷键触发时展开</p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-bold text-gray-800 mb-2">
            内容 *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
            placeholder="输入要展开的文本内容..."
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-bold text-gray-800 mb-2">
            标签（可选，逗号分隔）
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black"
            placeholder="例如：邮箱,地址,常用"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors font-bold"
          >
            {snippet ? '保存' : '创建'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-bold"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
