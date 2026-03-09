'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  TimeEntry, 
  Client, 
  Invoice,
  getTimeEntries, 
  getClients, 
  addClient,
  addInvoice,
  calculateDuration,
  calculateHours,
  formatDuration,
  formatCurrency,
  getSettings
} from '@/lib/storage';

export default function CreateInvoicePage() {
  // Data state
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Form state
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<number>(100);
  const [notes, setNotes] = useState('');
  
  // New client form
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  
  // Preview mode
  const [showPreview, setShowPreview] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  // Load data
  useEffect(() => {
    setTimeEntries(getTimeEntries().filter(e => e.endTime !== null));
    setClients(getClients());
    const settings = getSettings();
    setHourlyRate(settings.defaultHourlyRate || 100);
  }, []);

  // Completed time entries (available for invoicing)
  const completedEntries = useMemo(() => {
    return timeEntries.filter(e => e.endTime !== null);
  }, [timeEntries]);

  // Selected entries
  const selectedEntries = useMemo(() => {
    return completedEntries.filter(e => selectedEntryIds.has(e.id));
  }, [completedEntries, selectedEntryIds]);

  // Calculate total duration and amount
  const totalHours = useMemo(() => {
    return calculateHours(selectedEntries);
  }, [selectedEntries]);

  const totalAmount = useMemo(() => {
    return totalHours * hourlyRate;
  }, [totalHours, hourlyRate]);

  // Toggle entry selection
  const toggleEntry = (id: string) => {
    const newSet = new Set(selectedEntryIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEntryIds(newSet);
  };

  // Select all
  const selectAll = () => {
    setSelectedEntryIds(new Set(completedEntries.map(e => e.id)));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedEntryIds(new Set());
  };

  // Add new client
  const handleAddClient = () => {
    if (!newClientName.trim()) return;
    const client = addClient({
      name: newClientName.trim(),
      email: newClientEmail.trim(),
      address: newClientAddress.trim(),
    });
    setClients(prev => [...prev, client]);
    setSelectedClientId(client.id);
    setShowNewClientForm(false);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientAddress('');
  };

  // Generate invoice
  const handleGenerateInvoice = () => {
    if (!selectedClientId || selectedEntries.length === 0) return;
    
    const invoice = addInvoice({
      clientId: selectedClientId,
      timeEntryIds: Array.from(selectedEntryIds),
      hourlyRate,
      totalAmount,
      status: 'draft',
      notes: notes.trim() || undefined,
    });
    
    setCreatedInvoice(invoice);
    setShowPreview(true);
  };

  // Selected client
  const selectedClient = clients.find(c => c.id === selectedClientId);

  // If preview mode, show preview
  if (showPreview && createdInvoice) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-700">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Invoice</h1>
              <p className="text-zinc-500">{createdInvoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Date</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                {new Date(createdInvoice.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Bill To</h2>
            {selectedClient && (
              <div className="text-zinc-900 dark:text-zinc-100">
                <p className="font-semibold text-lg">{selectedClient.name}</p>
                {selectedClient.email && <p>{selectedClient.email}</p>}
                {selectedClient.address && <p>{selectedClient.address}</p>}
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Items</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-3 text-zinc-600 dark:text-zinc-400 font-medium">Description</th>
                  <th className="text-right py-3 text-zinc-600 dark:text-zinc-400 font-medium">Duration</th>
                  <th className="text-right py-3 text-zinc-600 dark:text-zinc-400 font-medium">Rate</th>
                  <th className="text-right py-3 text-zinc-600 dark:text-zinc-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedEntries.map(entry => {
                  const hours = calculateDuration(entry) / (1000 * 60 * 60);
                  const amount = hours * hourlyRate;
                  return (
                    <tr key={entry.id} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 text-zinc-900 dark:text-zinc-100">
                        {entry.description || 'No description'}
                      </td>
                      <td className="py-3 text-right text-zinc-600 dark:text-zinc-400 font-mono">
                        {formatDuration(calculateDuration(entry))}
                      </td>
                      <td className="py-3 text-right text-zinc-600 dark:text-zinc-400">
                        ${hourlyRate}/h
                      </td>
                      <td className="py-3 text-right text-zinc-900 dark:text-zinc-100 font-medium">
                        ${amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="text-right">
              <p className="text-zinc-600 dark:text-zinc-400 mb-1">
                Total Hours: <span className="font-mono">{totalHours.toFixed(2)} hours</span>
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-500 mb-1">Notes</p>
              <p className="text-zinc-700 dark:text-zinc-300">{notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Link
              href="/invoices/create"
              className="px-6 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setShowPreview(false)}
            >
              Back to Edit
            </Link>
            <Link
              href="/timer"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page Header */}
      <div className="mb-6">
        <Link href="/" className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm mb-2 inline-flex items-center gap-1">
          ← Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create Invoice</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Select Time Entries */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Select Time Entries</h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-sm text-zinc-500 hover:text-zinc-600 dark:text-zinc-400"
              >
                Deselect
              </button>
            </div>
          </div>

          {completedEntries.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No completed time entries</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {completedEntries.map(entry => (
                <label
                  key={entry.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEntryIds.has(entry.id)
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEntryIds.has(entry.id)}
                    onChange={() => toggleEntry(entry.id)}
                    className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.description || 'No description'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(entry.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                    {formatDuration(calculateDuration(entry))}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Selected Summary */}
          {selectedEntries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Selected {selectedEntries.length} entries
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {totalHours.toFixed(2)} hours
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Client and Settings */}
        <div className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Client</h2>
              <button
                onClick={() => setShowNewClientForm(!showNewClientForm)}
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                + New Client
              </button>
            </div>

            {showNewClientForm && (
              <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-3">
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client Name *"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                />
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                />
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Address"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddClient}
                    disabled={!newClientName.trim()}
                    className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowNewClientForm(false)}
                    className="px-3 py-2 text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.email && `(${client.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Rate Settings */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Rate Settings</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                min="0"
                step="10"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes..."
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Amount Preview */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Invoice Preview</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Total Hours</span>
                <span className="text-zinc-900 dark:text-zinc-100">{totalHours.toFixed(2)} hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Hourly Rate</span>
                <span className="text-zinc-900 dark:text-zinc-100">${hourlyRate}/h</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-700">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Total</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerateInvoice}
              disabled={!selectedClientId || selectedEntries.length === 0}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
