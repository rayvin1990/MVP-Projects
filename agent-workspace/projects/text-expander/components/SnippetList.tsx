'use client';

import React, { useState, useEffect } from 'react';
import { Snippet } from '@/lib/types';
import SnippetCard from './SnippetCard';

interface SnippetListProps {
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
}

export default function SnippetList({ onEdit, onDelete, onCopy }: SnippetListProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      const response = await fetch('/api/snippets');
      const data = await response.json();

      if (data.success && data.data) {
        setSnippets(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter snippets
  const filteredSnippets = snippets.filter(snippet =>
    searchQuery === '' ||
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (filteredSnippets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700 text-lg font-semibold">No snippets found</p>
        <p className="text-gray-600 text-sm mt-2">
          {searchQuery ? `No snippets containing "${searchQuery}"` : 'No snippets yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSnippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}
