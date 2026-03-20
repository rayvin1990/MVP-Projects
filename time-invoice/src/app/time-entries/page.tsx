'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  TimeEntry, 
  Project, 
  getTimeEntries, 
  getProjects, 
  deleteTimeEntry,
  formatDuration,
  calculateDuration
} from '@/lib/storage';

export default function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load data
  useEffect(() => {
    setEntries(getTimeEntries());
    setProjects(getProjects());
  }, []);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const project = projects.find(p => p.id === entry.projectId);
        const matchDescription = entry.description?.toLowerCase().includes(query);
        const matchProject = project?.name.toLowerCase().includes(query);
        if (!matchDescription && !matchProject) return false;
      }
      
      // Project filter
      if (selectedProjectId && entry.projectId !== selectedProjectId) {
        return false;
      }
      
      // Date filter
      if (selectedDate) {
        const entryDate = new Date(entry.startTime).toISOString().split('T')[0];
        if (entryDate !== selectedDate) return false;
      }
      
      return true;
    });
  }, [entries, projects, searchQuery, selectedProjectId, selectedDate]);

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Toggle select
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map(e => e.id)));
    }
  }, [filteredEntries, selectedIds]);

  // Batch delete
  const handleBatchDelete = useCallback(() => {
    selectedIds.forEach(id => deleteTimeEntry(id));
    setEntries(getTimeEntries());
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
  }, [selectedIds]);

  // Single delete
  const handleDelete = useCallback((id: string) => {
    deleteTimeEntry(id);
    setEntries(getTimeEntries());
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedProjectId('');
    setSelectedDate('');
  }, []);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => {
      if (entry.endTime) {
        return sum + calculateDuration(entry);
      }
      return sum;
    }, 0);
  }, [filteredEntries]);

  // Has filters
  const hasFilters = searchQuery || selectedProjectId || selectedDate;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Time Entries
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            View and manage all time records
          </p>
        </div>
        <Link
          href="/timer"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          + Track Time
        </Link>
      </div>

      {/* Filter Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description or project..."
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Project Filter */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Batch Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {selectedIds.size} entries selected
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Total: <span className="font-medium text-zinc-900 dark:text-zinc-100">{filteredEntries.length}</span> entries
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Duration: <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatDuration(totalDuration)}</span>
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-zinc-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            {hasFilters ? 'No matching entries' : 'No time entries yet'}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            {hasFilters ? 'Try adjusting your filters' : 'Start tracking your first time'}
          </p>
          {!hasFilters && (
            <Link
              href="/timer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Timer
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <div className="w-8">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredEntries.length && filteredEntries.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Project / Description
              </span>
            </div>
            <div className="w-32">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Start Time
              </span>
            </div>
            <div className="w-24">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Duration
              </span>
            </div>
            <div className="w-20">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </span>
            </div>
            <div className="w-16">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </span>
            </div>
          </div>

          {/* Entries List */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredEntries.map(entry => {
              const project = projects.find(p => p.id === entry.projectId);
              const isRunning = entry.endTime === null;
              const isSelected = selectedIds.has(entry.id);

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <div className="w-8">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(entry.id)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Project and Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project?.color || '#6366f1' }}
                      />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {project?.name || 'Unknown Project'}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  {/* Start Time */}
                  <div className="w-32 text-sm text-zinc-500 dark:text-zinc-400">
                    <div>{formatDate(entry.startTime)}</div>
                    <div className="text-xs">{formatTime(entry.startTime)}</div>
                  </div>

                  {/* Duration */}
                  <div className="w-24">
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {formatDuration(calculateDuration(entry))}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="w-20">
                    {isRunning ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Running
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="w-16 flex justify-end">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Confirm Delete
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Are you sure you want to delete {selectedIds.size} time entries? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
