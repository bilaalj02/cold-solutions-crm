'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StandardSidebar from '../../../components/StandardSidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';

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
  const [testingImap, setTestingImap] = useState(false);
  const [imapTestResult, setImapTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
          smtpHost: data.config?.smtp?.host || data.config?.host || '',
          smtpPort: data.config?.smtp?.port?.toString() || data.config?.port?.toString() || '587',
          smtpSecure: data.config?.smtp?.secure || data.config?.tls || false,
          smtpUser: data.config?.smtp?.user || data.config?.user || '',
          smtpPass: '', // Don't expose password
          fromName: data.config?.fromName || '',
          fromEmail: data.config?.fromEmail || '',
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

  const testImapConnection = async () => {
    setTestingImap(true);
    setImapTestResult(null);

    try {
      const response = await fetch('/api/email/test-imap');
      const data = await response.json();

      setImapTestResult({
        success: data.success,
        message: data.success ? 'IMAP connection successful!' : `IMAP connection failed: ${data.error}`
      });
    } catch (error) {
      setImapTestResult({
        success: false,
        message: 'Failed to test IMAP connection'
      });
    } finally {
      setTestingImap(false);
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
    <ProtectedRoute>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <StandardSidebar />

        <div className="flex flex-col flex-1 min-h-screen">
          <header className="glass-card border-0 p-6 m-4 mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Configure your email connection settings</p>
          </header>

          <main className="flex-1 p-6">
            {/* Test Buttons */}
            <div className="glass-card border-0 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Connection Testing</h3>
                  <p className="text-sm text-gray-600 mt-1">Test your SMTP and IMAP connections</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={testConnection}
                    disabled={testing}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                    style={{backgroundColor: '#3dbff2'}}
                  >
                    {testing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Testing SMTP...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">send</span>
                        Test SMTP
                      </>
                    )}
                  </button>
                  <button
                    onClick={testImapConnection}
                    disabled={testingImap}
                    className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                    style={{backgroundColor: '#10b981'}}
                  >
                    {testingImap ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Testing IMAP...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">inbox</span>
                        Test IMAP
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className={`glass-card border-0 mb-6 p-4 ${
                testResult.success ? 'bg-green-50' : 'bg-red-50'
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
                    SMTP: {testResult.message}
                  </p>
                </div>
              </div>
            )}

            {imapTestResult && (
              <div className={`glass-card border-0 mb-6 p-4 ${
                imapTestResult.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center">
                  <span className={`material-symbols-outlined mr-2 ${
                    imapTestResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {imapTestResult.success ? 'check_circle' : 'error'}
                  </span>
                  <p className={`text-sm font-medium ${
                    imapTestResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    IMAP: {imapTestResult.message}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Setup */}
            <div className="glass-card border-0 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Setup</h3>
              <p className="text-gray-600 mb-4">Choose your email provider for automatic configuration:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailProviders.map((provider) => (
                  <div key={provider.name} className="border border-gray-200 rounded-lg p-4 hover:border-[#3dbff2] cursor-pointer transition-all bg-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{provider.name}</h4>
                      <button
                        onClick={() => setProvider(provider)}
                        className="text-sm font-medium hover:underline"
                        style={{color: '#3dbff2'}}
                      >
                        Use This
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">{provider.instructions}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Configuration */}
            <div className="glass-card border-0 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">SMTP Configuration</h3>

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

              <div className="mt-6 p-4 bg-yellow-50/80 border border-yellow-300 rounded-lg">
                <div className="flex items-start">
                  <span className="material-symbols-outlined text-yellow-600 mr-2">info</span>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Configuration Note</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      These settings are currently configured in your .env.local file. Update the following variables:
                    </p>
                    <pre className="text-xs text-yellow-700 mt-2 bg-yellow-100/80 p-2 rounded">
{`SMTP_HOST=${settings.smtpHost}
SMTP_PORT=${settings.smtpPort}
SMTP_USER=${settings.smtpUser}
SMTP_PASS=your_password_here
SMTP_FROM_NAME=${settings.fromName}
SMTP_FROM_EMAIL=${settings.fromEmail}

# IMAP for receiving emails
IMAP_HOST=${settings.smtpHost}
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=${settings.smtpUser}
IMAP_PASS=your_password_here`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}