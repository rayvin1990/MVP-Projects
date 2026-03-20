'use client';

import { useState, useEffect } from 'react';
import { 
  Project, 
  Client,
  getProjects, 
  getClients,
  addProject, 
  updateProject, 
  deleteProject,
  getSettings,
  saveSettings
} from '@/lib/storage';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState({ defaultHourlyRate: 100 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: COLORS[0],
    hourlyRate: 100,
    clientId: ''
  });

  // Load data
  useEffect(() => {
    setProjects(getProjects());
    setClients(getClients());
    const s = getSettings();
    setSettings({ defaultHourlyRate: s.defaultHourlyRate });
  }, []);

  // Open modal
  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        color: project.color,
        hourlyRate: project.hourlyRate,
        clientId: project.clientId || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        hourlyRate: settings.defaultHourlyRate,
        clientId: ''
      });
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  // Save project
  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        name: formData.name,
        color: formData.color,
        hourlyRate: formData.hourlyRate,
        clientId: formData.clientId || null
      });
    } else {
      addProject(
        formData.name,
        formData.color,
        formData.hourlyRate,
        formData.clientId || null
      );
    }

    setProjects(getProjects());
    closeModal();
  };

  // Delete project
  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    deleteProject(id);
    setProjects(getProjects());
  };

  // Update default hourly rate
  const handleDefaultRateChange = (rate: number) => {
    const s = getSettings();
    saveSettings({ ...s, defaultHourlyRate: rate });
    setSettings({ defaultHourlyRate: rate });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Projects
        </h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          + Add Project
        </button>
      </div>

      {/* Default Hourly Rate Setting */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Default Settings
        </h2>
        <div className="flex items-center gap-4">
          <label className="text-zinc-700 dark:text-zinc-300">
            Default Hourly Rate ($)
          </label>
          <input
            type="number"
            value={settings.defaultHourlyRate}
            onChange={(e) => handleDefaultRateChange(Number(e.target.value))}
            min={0}
            step={10}
            className="w-32 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="text-sm text-zinc-500">
            New projects will use this rate
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Projects ({projects.length})
        </h2>
        
        {projects.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No projects yet</p>
        ) : (
          <div className="space-y-3">
            {projects.map(project => {
              const client = clients.find(c => c.id === project.clientId);
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {project.name}
                      </div>
                      <div className="text-sm text-zinc-500">
                        ${project.hourlyRate}/hour
                        {client && (
                          <span className="ml-2 text-zinc-400">
                            • {client.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(project)}
                      className="px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-3 py-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {editingProject ? 'Edit Project' : 'Add Project'}
            </h3>
            
            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  min={0}
                  step={10}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Client Association */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Client (Optional)
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
