'use client';

import React, { useState } from 'react';
import { CreateSnippetRequest, Snippet } from '@/lib/types';
import SearchBar from '@/components/SearchBar';
import SnippetList from '@/components/SnippetList';
import SnippetForm from '@/components/SnippetForm';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [copyFeedback, setCopyFeedback] = useState('');

  const handleCreate = () => {
    setEditingSnippet(undefined);
    setShowForm(true);
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateSnippetRequest) => {
    try {
      const url = editingSnippet
        ? `/api/snippets/${editingSnippet.id}`
        : '/api/snippets';

      const response = await fetch(url, {
        method: editingSnippet ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        // Save to localStorage
        const snippets = JSON.parse(localStorage.getItem('text_expander_data') || '[]');

        if (editingSnippet) {
          const index = snippets.findIndex((s: any) => s.id === editingSnippet.id);
          if (index !== -1) {
            snippets[index] = result.data;
          }
        } else {
          snippets.push(result.data);
        }

        localStorage.setItem('text_expander_data', JSON.stringify(snippets));
        setShowForm(false);
        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await response.json();
        alert(`Operation failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Operation failed, please try again');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) {
      return;
    }

    try {
      const response = await fetch(`/api/snippets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const snippets = JSON.parse(localStorage.getItem('text_expander_data') || '[]');
        const filtered = snippets.filter((s: any) => s.id !== id);
        localStorage.setItem('text_expander_data', JSON.stringify(filtered));
        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      alert('Delete failed, please try again');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopyFeedback('Copied to clipboard!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const loadSnippets = () => {
    try {
      const data = localStorage.getItem('text_expander_data');
      if (data) {
        const snippets = JSON.parse(data);
        setSnippets(snippets);
      }
    } catch (error) {
      console.error('Failed to load snippets:', error);
    }
  };

  // Initial load
  React.useEffect(() => {
    loadSnippets();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">
              Text Expander
            </h1>
            <p className="text-lg text-gray-800">
              Quickly insert commonly used text snippets
            </p>
          </header>

          {copyFeedback && (
            <div className="bg-green-600 text-white text-center py-3 px-4 rounded-lg mb-6 font-bold">
              {copyFeedback}
            </div>
          )}

          {!showForm ? (
            <>
              <div className="mb-6 flex justify-center">
                <button
                  onClick={handleCreate}
                  className="bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors text-lg font-bold shadow-md"
                >
                  Create Snippet
                </button>
              </div>

              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                snippetCount={snippets.length}
              />

              <SnippetList
                key={refreshKey}
                snippets={snippets.filter(s =>
                  searchQuery === '' ||
                  s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopy={handleCopy}
              />
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <SnippetForm
                snippet={editingSnippet}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
