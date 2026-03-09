'use client';

import React, { useState, useEffect } from 'react';
import { Context } from '@/lib/types';
import ContextCard from './ContextCard';

interface ContextListProps {
  onEdit: (context: Context) => void;
  onDelete: (id: string) => void;
}

export default function ContextList({ onEdit, onDelete }: ContextListProps) {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load directly from localStorage
    loadContexts();
  }, []);

  const loadContexts = () => {
    try {
      setLoading(true);

      const data = localStorage.getItem('context_pause_data');
      if (data) {
        const contexts = JSON.parse(data);
        setContexts(contexts);
        console.log('Loaded contexts from localStorage:', contexts);
      } else {
        setContexts([]);
        console.log('No contexts in localStorage');
      }
    } catch (error) {
      console.error('Failed to load contexts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh method to parent component
  useEffect(() => {
    (window as any).refreshContexts = loadContexts;
  }, [loadContexts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (contexts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-700 text-lg font-semibold">No contexts yet</p>
        <p className="text-gray-600 text-sm mt-2">Click "Create Context" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contexts.map((context) => (
        <ContextCard
          key={context.id}
          context={context}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
