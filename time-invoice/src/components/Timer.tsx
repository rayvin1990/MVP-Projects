'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TimeEntry, 
  Project, 
  getTimeEntries, 
  getProjects, 
  addTimeEntry, 
  updateTimeEntry, 
  formatDuration,
  calculateDuration 
} from '@/lib/storage';

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [description, setDescription] = useState('');

  // Initialize and load data
  useEffect(() => {
    setEntries(getTimeEntries());
    const projs = getProjects();
    setProjects(projs);
    if (projs.length > 0) {
      setSelectedProjectId(projs[0].id);
    }

    // Check for running timer
    const running = getTimeEntries().find(e => e.endTime === null);
    if (running) {
      setCurrentEntry(running);
      setIsRunning(true);
      setSelectedProjectId(running.projectId);
      setDescription(running.description);
    }
  }, []);

  // Timer update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && currentEntry) {
      interval = setInterval(() => {
        setElapsedTime(calculateDuration(currentEntry));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentEntry]);

  // Start timer
  const handleStart = useCallback(() => {
    if (!selectedProjectId) return;

    const entry = addTimeEntry({
      projectId: selectedProjectId,
      description,
      startTime: Date.now(),
      endTime: null,
    });

    setCurrentEntry(entry);
    setIsRunning(true);
    setEntries(prev => [entry, ...prev]);
  }, [selectedProjectId, description]);

  // Stop timer
  const handleStop = useCallback(() => {
    if (!currentEntry) return;

    updateTimeEntry(currentEntry.id, { endTime: Date.now() });
    setIsRunning(false);
    setCurrentEntry(null);
    setElapsedTime(0);
    setDescription('');
    
    // Refresh list
    setEntries(getTimeEntries());
  }, [currentEntry]);

  // Delete entry
  const handleDelete = useCallback((id: string) => {
    const { deleteTimeEntry } = require('@/lib/storage');
    deleteTimeEntry(id);
    setEntries(getTimeEntries());
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {formatDuration(elapsedTime)}
          </div>
          {isRunning && currentEntry && (
            <div className="text-sm text-zinc-500">
              Recording: {projects.find(p => p.id === currentEntry?.projectId)?.name}
            </div>
          )}
        </div>

        {/* Input Area */}
        {!isRunning && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Select Project
              </label>
              {projects.length === 0 ? (
                <div className="text-amber-600 dark:text-amber-400 text-sm p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  Please add a project in Projects settings first.
                </div>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you working on?"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!selectedProjectId}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white font-medium rounded-full transition-colors"
            >
              Start Timer
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-colors"
            >
              Stop Timer
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Time Entries
        </h2>
        
        {entries.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No records yet</p>
        ) : (
          <div className="space-y-3">
            {entries.filter(e => e.endTime).map(entry => {
              const project = projects.find(p => p.id === entry.projectId);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project?.color || '#6366f1' }}
                      />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {project?.name || 'Unknown Project'}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {entry.description}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(entry.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatDuration(calculateDuration(entry))}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
