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
        {snippet ? 'Edit Snippet' : 'Create Snippet'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-gray-800 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black bg-white placeholder-gray-500"
            placeholder="e.g., My email address"
            required
          />
        </div>

        <div>
          <label htmlFor="abbreviation" className="block text-sm font-bold text-gray-800 mb-2">
            Abbreviation (optional)
          </label>
          <input
            type="text"
            id="abbreviation"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono text-black bg-white placeholder-gray-500"
            placeholder="e.g., email"
          />
          <p className="text-xs text-gray-600 mt-1">Expands when triggered by shortcut</p>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-bold text-gray-800 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black bg-white placeholder-gray-500"
            placeholder="Enter the text content to expand..."
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-bold text-gray-800 mb-2">
            Tags (optional, comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black bg-white placeholder-gray-500"
            placeholder="e.g., email, address, common"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors font-bold"
          >
            {snippet ? 'Save' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-bold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
