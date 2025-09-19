'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    fromName: '',
    fromEmail: '',
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Load current configuration
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const response = await fetch('/api/email/test');
      const data = await response.json();

      if (data.config) {
        setSettings({
          smtpHost: data.config.smtp.host || '',
          smtpPort: data.config.smtp.port?.toString() || '587',
          smtpSecure: data.config.smtp.secure || false,
          smtpUser: data.config.smtp.user || '',
          smtpPass: '', // Don't expose password
          fromName: data.config.fromName || '',
          fromEmail: data.config.fromEmail || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/email/test');
      const data = await response.json();

      setTestResult({
        success: data.success,
        message: data.success ? 'SMTP connection successful!' : `Connection failed: ${data.error}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection'
      });
    } finally {
      setTesting(false);
    }
  };

  const emailProviders = [
    {
      name: 'Private Email (Namecheap)',
      smtp: { host: 'mail.privateemail.com', port: 587, secure: false },
      imap: { host: 'mail.privateemail.com', port: 993, secure: true },
      instructions: 'Use your Private Email address and password. Server: mail.privateemail.com'
    },
    {
      name: 'Gmail',
      smtp: { host: 'smtp.gmail.com', port: 587, secure: false },
      imap: { host: 'imap.gmail.com', port: 993, secure: true },
      instructions: 'Use your Gmail address and generate an App Password in your Google Account settings.'
    },
    {
      name: 'Outlook/Hotmail',
      smtp: { host: 'smtp.live.com', port: 587, secure: false },
      imap: { host: 'outlook.office365.com', port: 993, secure: true },
      instructions: 'Use your Outlook.com email address and password.'
    },
    {
      name: 'Yahoo',
      smtp: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
      imap: { host: 'imap.mail.yahoo.com', port: 993, secure: true },
      instructions: 'Use your Yahoo email address and generate an App Password.'
    },
  ];

  const setProvider = (provider: typeof emailProviders[0]) => {
    setSettings(prev => ({
      ...prev,
      smtpHost: provider.smtp.host,
      smtpPort: provider.smtp.port.toString(),
      smtpSecure: provider.smtp.secure,
    }));
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Email Settings</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/email/settings">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
              <p className="text-sm font-medium leading-normal">Email Settings</p>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/inbox">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>inbox</span>
              <p className="text-sm font-medium leading-normal">Inbox</p>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/composer">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>edit</span>
              <p className="text-sm font-medium leading-normal">Email Composer</p>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>arrow_back</span>
              <p className="text-sm font-medium leading-normal">Back to Dashboard</p>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Email Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Configure SMTP settings for sending and receiving emails</p>
            </div>
            <button
              onClick={testConnection}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              style={{backgroundColor: '#3dbff2'}}
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">wifi_find</span>
                  Test Connection
                </>
              )}
            </button>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto">
          {/* Test Result */}
          {testResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <span className={`material-symbols-outlined mr-2 ${
                  testResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {testResult.success ? 'check_circle' : 'error'}
                </span>
                <p className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Quick Setup */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Quick Setup</h3>
            <p className="text-gray-600 mb-4">Choose your email provider for automatic configuration:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {emailProviders.map((provider) => (
                <div key={provider.name} className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{provider.name}</h4>
                    <button
                      onClick={() => setProvider(provider)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Use This
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{provider.instructions}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-6" style={{color: '#0a2240'}}>SMTP Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  name="smtpHost"
                  value={settings.smtpHost}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port *
                </label>
                <select
                  name="smtpPort"
                  value={settings.smtpPort}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                >
                  <option value="587">587 (STARTTLS)</option>
                  <option value="465">465 (SSL)</option>
                  <option value="25">25 (Plain)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="smtpUser"
                  value={settings.smtpUser}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password / App Password *
                </label>
                <input
                  type="password"
                  name="smtpPass"
                  value={settings.smtpPass}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  name="fromName"
                  value={settings.fromName}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Cold Solutions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  name="fromEmail"
                  value={settings.fromEmail}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="sales@coldsolutions.com"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <span className="material-symbols-outlined text-yellow-600 mr-2">info</span>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Configuration Note</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    These settings are currently configured in your .env.local file. Update the following variables:
                  </p>
                  <pre className="text-xs text-yellow-700 mt-2 bg-yellow-100 p-2 rounded">
{`SMTP_HOST=${settings.smtpHost}
SMTP_PORT=${settings.smtpPort}
SMTP_USER=${settings.smtpUser}
SMTP_PASS=your_password_here
SMTP_FROM_NAME=${settings.fromName}
SMTP_FROM_EMAIL=${settings.fromEmail}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}