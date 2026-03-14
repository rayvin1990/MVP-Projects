'use client';

import React from 'react';
import { Context } from '@/lib/types';

interface ContextCardProps {
  context: Context;
  onEdit: (context: Context) => void;
  onDelete: (id: string) => void;
}

export default function ContextCard({ context, onEdit, onDelete }: ContextCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-black">{context.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(context)}
            className="text-blue-700 hover:text-blue-800 text-sm font-semibold"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(context.id)}
            className="text-red-700 hover:text-red-800 text-sm font-semibold"
          >
            Delete
          </button>
        </div>
      </div>

      {context.description && (
        <p className="text-gray-800 mb-4">{context.description}</p>
      )}

      {context.files && context.files.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-800 mb-2">Related Files:</h4>
          <ul className="list-disc list-inside text-sm text-gray-800">
            {context.files.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      )}

      {context.commands && context.commands.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-800 mb-2">Commands:</h4>
          <ul className="list-disc list-inside text-sm text-black font-mono bg-gray-100 p-2 rounded border border-gray-200">
            {context.commands.map((cmd, index) => (
              <li key={index}>{cmd}</li>
            ))}
          </ul>
        </div>
      )}

      {context.notes && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-800 mb-2">Notes:</h4>
          <p className="text-sm text-black bg-yellow-100 p-2 rounded border border-yellow-300">
            {context.notes}
          </p>
        </div>
      )}

      <div className="text-xs text-gray-600 pt-4 border-t border-gray-300">
        <p>Created: {formatDate(context.createdAt)}</p>
        <p>Updated: {formatDate(context.updatedAt)}</p>
      </div>
    </div>
  );
}
