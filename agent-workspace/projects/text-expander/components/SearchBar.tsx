'use client';

import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  snippetCount: number;
}

export default function SearchBar({ searchQuery, onSearchChange, snippetCount }: SearchBarProps) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm mb-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-bold text-gray-800 mb-2">
            Search Snippets
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Enter keywords to search..."
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-black bg-white placeholder-gray-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          {searchQuery ? `Found ${snippetCount} snippets` : `${snippetCount} snippets total`}
        </div>
      </div>
    </div>
  );
}
