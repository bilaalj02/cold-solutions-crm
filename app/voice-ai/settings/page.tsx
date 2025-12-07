'use client'

import React, { useState, useEffect } from 'react';
import StandardSidebar from '../../../components/StandardSidebar';

interface VoiceAISettings {
  daily_call_limit: number;
  calling_start_hour: number;
  calling_end_hour: number;
  max_retries: number;
  retry_delay_hours: number;
  enable_voicemail_detection: boolean;
  enable_dnc_check: boolean;
  default_agent_voice: string;
  enable_call_recording: boolean;
  auto_analyze_calls: boolean;
}

export default function VoiceAISettingsPage() {
  const [settings, setSettings] = useState<VoiceAISettings>({
    daily_call_limit: 50,
    calling_start_hour: 9,
    calling_end_hour: 17,
    max_retries: 3,
    retry_delay_hours: 24,
    enable_voicemail_detection: true,
    enable_dnc_check: true,
    default_agent_voice: 'jennifer',
    enable_call_recording: true,
    auto_analyze_calls: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/voice-ai/settings');
      const data = await response.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/voice-ai/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <StandardSidebar />
        <main className="flex-1 p-8 flex items-center justify-center" style={{position: 'relative', zIndex: 1}}>
          <div className="text-center">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <div className="text-gray-600">Loading settings...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <StandardSidebar />

      <main className="flex-1 p-8 overflow-auto" style={{position: 'relative', zIndex: 1}}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice AI Settings</h1>
            <p className="text-gray-600">Configure calling behavior and preferences</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 glass-card border-l-4 border-green-600">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <span className="text-green-800 font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Call Limits */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600">speed</span>
              <h3 className="text-lg font-bold text-gray-900">Call Limits</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Call Limit
                </label>
                <input
                  type="number"
                  value={settings.daily_call_limit}
                  onChange={(e) => setSettings({ ...settings, daily_call_limit: parseInt(e.target.value) })}
                  min="1"
                  max="500"
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of calls per day</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Retries
                </label>
                <input
                  type="number"
                  value={settings.max_retries}
                  onChange={(e) => setSettings({ ...settings, max_retries: parseInt(e.target.value) })}
                  min="0"
                  max="10"
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Number of retry attempts for failed calls</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Delay (hours)
                </label>
                <input
                  type="number"
                  value={settings.retry_delay_hours}
                  onChange={(e) => setSettings({ ...settings, retry_delay_hours: parseInt(e.target.value) })}
                  min="1"
                  max="168"
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Hours to wait before retrying a failed call</p>
              </div>
            </div>
          </div>

          {/* Calling Hours */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600">schedule</span>
              <h3 className="text-lg font-bold text-gray-900">Calling Hours</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Hour (24h format)
                </label>
                <select
                  value={settings.calling_start_hour}
                  onChange={(e) => setSettings({ ...settings, calling_start_hour: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Earliest time to make calls</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Hour (24h format)
                </label>
                <select
                  value={settings.calling_end_hour}
                  onChange={(e) => setSettings({ ...settings, calling_end_hour: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i}:00</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Latest time to make calls</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-600 text-sm">info</span>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Note on Calling Hours</p>
                  <p className="mt-1">Calls are automatically scheduled based on the lead's province timezone to ensure compliance with local calling hours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600">record_voice_over</span>
              <h3 className="text-lg font-bold text-gray-900">Voice Settings</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Agent Voice
              </label>
              <select
                value={settings.default_agent_voice}
                onChange={(e) => setSettings({ ...settings, default_agent_voice: e.target.value })}
                className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
              >
                <option value="jennifer">Jennifer (Female - Professional)</option>
                <option value="michael">Michael (Male - Friendly)</option>
                <option value="sarah">Sarah (Female - Warm)</option>
                <option value="david">David (Male - Confident)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Voice used for AI agent calls</p>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600">toggle_on</span>
              <h3 className="text-lg font-bold text-gray-900">Features</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-600">voicemail</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Voicemail Detection</div>
                    <div className="text-xs text-gray-500 mt-1">Automatically detect and handle voicemails</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_voicemail_detection}
                  onChange={(e) => setSettings({ ...settings, enable_voicemail_detection: e.target.checked })}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-600">block</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Do Not Call (DNC) Check</div>
                    <div className="text-xs text-gray-500 mt-1">Skip numbers on DNC lists automatically</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_dnc_check}
                  onChange={(e) => setSettings({ ...settings, enable_dnc_check: e.target.checked })}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-600">mic</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Call Recording</div>
                    <div className="text-xs text-gray-500 mt-1">Record all calls for quality and training</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_call_recording}
                  onChange={(e) => setSettings({ ...settings, enable_call_recording: e.target.checked })}
                  className="rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-600">psychology</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Auto AI Analysis</div>
                    <div className="text-xs text-gray-500 mt-1">Automatically analyze calls with AI for sentiment and outcomes</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_analyze_calls}
                  onChange={(e) => setSettings({ ...settings, auto_analyze_calls: e.target.checked })}
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="glass-card p-6 mb-6 border-l-4 border-yellow-600">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-600">warning</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Compliance Notice</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Ensure compliance with Canadian Anti-Spam Legislation (CASL)</li>
                  <li>Respect Do Not Call (DNC) lists for all provinces</li>
                  <li>Calls are only made during permitted hours (9 AM - 5 PM local time)</li>
                  <li>Obtain proper consent before calling businesses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => fetchSettings()}
              className="px-6 py-3 glass-card hover:shadow-lg transition-all text-gray-700 font-medium"
              disabled={saving}
            >
              Reset Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 glass-card hover:shadow-lg transition-all text-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
