import React, { useState, useCallback, useMemo } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索节点、函数、类...',
  onSearch,
  onFilterChange,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      onSearch?.(newQuery);
    },
    [onSearch]
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newFilter = e.target.value;
      setFilter(newFilter);
      onFilterChange?.(newFilter);
    },
    [onFilterChange]
  );

  const filterOptions = useMemo(
    () => [
      { value: 'all', label: '全部' },
      { value: 'function', label: '函数' },
      { value: 'class', label: '类' },
      { value: 'import', label: '导入' },
      { value: 'variable', label: '变量' },
    ],
    []
  );

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          placeholder={placeholder}
          value={query}
          onChange={handleSearchChange}
        />
      </div>
      <select
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
        value={filter}
        onChange={handleFilterChange}
      >
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchBar;
