import React, { useState, useCallback, useMemo, useEffect } from 'react';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  matchType: 'name' | 'type';
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string, results: SearchResult[]) => void;
  onFilterChange?: (filter: string) => void;
  nodes?: Array<{ id: string; type?: string; data?: { label?: string } }>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索节点、函数、类...',
  onSearch,
  onFilterChange,
  nodes = [],
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Search and filter nodes
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = nodes
      .filter((node) => {
        const label = node.data?.label || '';
        const nodeType = node.type || '';
        const matchesQuery =
          label.toLowerCase().includes(query.toLowerCase()) ||
          nodeType.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === 'all' || nodeType === filter;
        return matchesQuery && matchesFilter;
      })
      .slice(0, 10)
      .map((node) => ({
        id: node.id,
        name: node.data?.label || 'Unknown',
        type: node.type,
        matchType: node.data?.label?.toLowerCase().includes(query.toLowerCase())
          ? 'name'
          : 'type',
      }));

    setSearchResults(results);
    onSearch?.(query, results);
  }, [query, filter, nodes, onSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      setShowResults(newQuery.length > 0);
    },
    []
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newFilter = e.target.value;
      setFilter(newFilter);
      onFilterChange?.(newFilter);
    },
    [onFilterChange]
  );

  const handleResultClick = useCallback((resultId: string) => {
    console.log('Navigate to node:', resultId);
    setShowResults(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResults(false);
      }
    },
    []
  );

  const filterOptions = useMemo(
    () => [
      { value: 'all', label: '全部类型' },
      { value: 'function', label: '函数' },
      { value: 'class', label: '类' },
      { value: 'import', label: '导入' },
      { value: 'variable', label: '变量' },
    ],
    []
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      function: 'bg-indigo-500',
      class: 'bg-emerald-500',
      import: 'bg-amber-500',
      variable: 'bg-blue-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="relative flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Search Icon */}
      <svg
        className="w-5 h-5 text-gray-400 flex-shrink-0"
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

      {/* Search Input */}
      <div className="relative flex-1">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          placeholder={placeholder}
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowResults(true)}
        />

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onClick={() => handleResultClick(result.id)}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${getTypeColor(result.type)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {result.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.type} • {result.matchType === 'name' ? '名称匹配' : '类型匹配'}
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-xs text-gray-400">↵</span>
                  )}
                </button>
              ))}
            </div>
            {searchResults.length >= 10 && (
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-200">
                显示前 10 个结果
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {showResults && query.length > 0 && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-sm text-gray-500">
            未找到匹配的结果
          </div>
        )}
      </div>

      {/* Filter Select */}
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

      {/* Keyboard Shortcut Hint */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">
          ESC
        </kbd>
        <span>关闭</span>
      </div>
    </div>
  );
};

export default SearchBar;
