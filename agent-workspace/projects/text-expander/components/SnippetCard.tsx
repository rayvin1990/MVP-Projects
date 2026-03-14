'use client';

import React from 'react';
import { Snippet } from '@/lib/types';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
}

export default function SnippetCard({ snippet, onEdit, onDelete, onCopy }: SnippetCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.content);
    onCopy(snippet.content);
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-black">{snippet.title}</h3>
          {snippet.abbreviation && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-sm font-mono rounded">
              {snippet.abbreviation}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(snippet)}
            className="text-blue-700 hover:text-blue-800 text-sm font-semibold"
          >
            Edit
          </button>
          <button
            onClick={() => onCopy(snippet.content)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold"
          >
            Copy
          </button>
          <button
            onClick={() => onDelete(snippet.id)}
            className="text-red-700 hover:text-red-800 text-sm font-semibold"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-bold text-gray-800 mb-2">Content:</h4>
        <div className="bg-gray-100 border border-gray-200 p-3 rounded font-mono text-sm max-h-40 overflow-auto">
          {snippet.content}
        </div>
      </div>

      {snippet.tags && snippet.tags.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-bold text-gray-800 mb-2">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 pt-3 border-t border-gray-300">
        <p>Created: {new Date(snippet.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
