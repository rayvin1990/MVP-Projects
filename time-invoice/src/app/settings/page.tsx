'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, Settings } from '@/lib/storage';

// Timezone options
const TIMEZONES = [
  { value: 'Asia/Shanghai', label: 'China Standard Time (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (UTC+9)' },
  { value: 'Asia/Seoul', label: 'Korea Standard Time (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (UTC+8)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (UTC+8)' },
  { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (UTC+0)' },
  { value: 'Europe/Paris', label: 'Central European Time (UTC+1)' },
  { value: 'Europe/Berlin', label: 'Central European Time (UTC+1)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (UTC+11)' },
  { value: 'UTC', label: 'UTC' },
];

// Currency options
const CURRENCIES = [
  { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'KRW', label: 'Korean Won (₩)', symbol: '₩' },
  { value: 'HKD', label: 'Hong Kong Dollar (HK$)', symbol: 'HK$' },
  { value: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'S$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    defaultProjectId: null,
    autoStart: false,
    defaultHourlyRate: 100,
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    defaultTimezone: 'Asia/Shanghai',
    defaultCurrency: 'CNY',
  });
  const [saved, setSaved] = useState(false);

  // Load settings
  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
  }, []);

  // Save settings
  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Handle input change
  const handleChange = (field: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Business/Personal Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Business Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Business/Personal Name
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Your business name or personal name"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Address
              </label>
              <textarea
                value={settings.businessAddress}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                placeholder="Business or personal address"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Timer Settings */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Timer Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Default Hourly Rate
              </label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">
                  {CURRENCIES.find(c => c.value === settings.defaultCurrency)?.symbol || '$'}
                </span>
                <input
                  type="number"
                  value={settings.defaultHourlyRate}
                  onChange={(e) => handleChange('defaultHourlyRate', Number(e.target.value))}
                  min={0}
                  step={0.01}
                  className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-zinc-500">/ hour</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Default Timezone
              </label>
              <select
                value={settings.defaultTimezone}
                onChange={(e) => handleChange('defaultTimezone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Currency Settings
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Default Currency
            </label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => handleChange('defaultCurrency', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {CURRENCIES.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Save Settings
          </button>
          
          {saved && (
            <span className="text-green-600 dark:text-green-400">
              ✓ Settings saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
