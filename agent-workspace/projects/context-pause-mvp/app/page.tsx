'use client';

import React, { useState } from 'react';
import { Context, CreateContextRequest } from '@/lib/types';
import ContextList from '@/components/ContextList';
import ContextForm from '@/components/ContextForm';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingContext(undefined);
    setShowForm(true);
  };

  const handleEdit = (context: Context) => {
    setEditingContext(context);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: CreateContextRequest) => {
    try {
      const url = editingContext
        ? `/api/contexts/${editingContext.id}`
        : '/api/contexts';

      console.log('Submitting to:', url);
      console.log('Data:', data);

      const response = await fetch(url, {
        method: editingContext ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);

        // Save to localStorage
        if (editingContext) {
          // Update
          const contexts = JSON.parse(localStorage.getItem('context_pause_data') || '[]');
          const index = contexts.findIndex((c: any) => c.id === editingContext.id);
          if (index !== -1) {
            contexts[index] = result.data;
            localStorage.setItem('context_pause_data', JSON.stringify(contexts));
          }
        } else {
          // Create
          const contexts = JSON.parse(localStorage.getItem('context_pause_data') || '[]');
          contexts.push(result.data);
          localStorage.setItem('context_pause_data', JSON.stringify(contexts));
        }

        // Refresh list
        if ((window as any).refreshContexts) {
          (window as any).refreshContexts();
        }

        setShowForm(false);
        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        alert(`Operation failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('Operation failed, please try again');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this context?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contexts/${id}`, {
      });

      if (response.ok) {
        // Delete from localStorage
        const contexts = JSON.parse(localStorage.getItem('context_pause_data') || '[]');
        const filtered = contexts.filter((c: any) => c.id !== id);
        localStorage.setItem('context_pause_data', JSON.stringify(filtered));

        // Refresh list
        if ((window as any).refreshContexts) {
          (window as any).refreshContexts();
        }

        setRefreshKey((prev) => prev + 1);
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete context:', error);
      alert('Delete failed, please try again');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black mb-4">
              Context Pause & Resume
            </h1>
            <p className="text-lg text-gray-800">
              Reduce context switching loss and maintain flow state
            </p>
          </header>

          {!showForm ? (
            <>
              <div className="mb-8 flex justify-center">
                <button
                  onClick={handleCreate}
                  className="bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors text-lg font-bold shadow-md"
                >
                  Create Context
                </button>
              </div>

              <ContextList
                key={refreshKey}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <ContextForm
                context={editingContext}
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
