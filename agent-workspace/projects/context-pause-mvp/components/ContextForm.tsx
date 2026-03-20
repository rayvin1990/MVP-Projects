'use client';

import React, { useState } from 'react';
import { CreateContextRequest, Context } from '@/lib/types';

interface ContextFormProps {
  context?: Context;
  onSubmit: (data: CreateContextRequest) => void;
  onCancel: () => void;
}

export default function ContextForm({ context, onSubmit, onCancel }: ContextFormProps) {
  const [name, setName] = useState(context?.name || '');
  const [description, setDescription] = useState(context?.description || '');
  const [files, setFiles] = useState(context?.files?.join('\n') || '');
  const [commands, setCommands] = useState(context?.commands?.join('\n') || '');
  const [notes, setNotes] = useState(context?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateContextRequest = {
      name: name.trim(),
      description: description.trim(),
      files: files.split('\n').filter(f => f.trim()),
      commands: commands.split('\n').filter(c => c.trim()),
      notes: notes.trim(),
    };

    onSubmit(data);
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-black mb-6">
        {context ? 'Edit Context' : 'Create Context'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black bg-white placeholder-gray-500"
            placeholder="e.g., User login feature development"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black bg-white placeholder-gray-500"
            placeholder="Describe the purpose of this context..."
          />
        </div>

        <div>
          <label htmlFor="files" className="block text-sm font-bold text-gray-800 mb-2">
            Related Files (one per line)
          </label>
          <textarea
            id="files"
            value={files}
            onChange={(e) => setFiles(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono text-sm text-black bg-white placeholder-gray-500"
            placeholder="src/components/Login.tsx&#10;src/pages/login.tsx"
          />
        </div>

        <div>
          <label htmlFor="commands" className="block text-sm font-bold text-gray-800 mb-2">
            Commands (one per line)
          </label>
          <textarea
            id="commands"
            value={commands}
            onChange={(e) => setCommands(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono text-sm text-black bg-white placeholder-gray-500"
            placeholder="npm run dev&#10;npm run test"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-bold text-gray-800 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black bg-yellow-100 placeholder-gray-600"
            placeholder="Where did I leave off? What's next?"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors font-bold"
          >
            {context ? 'Save' : 'Create'}
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
