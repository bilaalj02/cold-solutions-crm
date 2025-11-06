'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmailLog {
  id: string;
  leadId?: string;
  campaignId?: string;
  sequenceId?: string;
  templateId: string;
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'replied' | 'unsubscribed';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  repliedAt?: string;
  errorMessage?: string;
  metadata: {
    fromEmail: string;
    toEmail: string;
    messageId?: string;
  };
  content?: {
    text: string;
    html: string;
  };
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSource, setDataSource] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching email logs...');

      // Add cache busting to ensure fresh data
      const response = await fetch(`/api/email/logs?t=${Date.now()}`);
      const data = await response.json();

      console.log('📧 Email logs response:', data);

      if (data.success) {
        console.log('📋 Raw logs data:', data.logs.slice(0, 2)); // Debug: show first 2 logs
        setLogs(data.logs);
        setDataSource(data.source || 'unknown');
        setNotice(data.notice || '');
        console.log(`✅ Loaded ${data.logs.length} email logs from ${data.source}`);
      } else {
        console.error('❌ Failed to fetch email logs:', data.error);
        setNotice('Failed to load email logs: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Failed to fetch email logs:', error);
      setNotice('Network error while fetching email logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'clicked': return 'bg-indigo-100 text-indigo-800';
      case 'replied': return 'bg-emerald-100 text-emerald-800';
      case 'unsubscribed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return 'send';
      case 'delivered': return 'check_circle';
      case 'bounced': return 'error';
      case 'opened': return 'visibility';
      case 'clicked': return 'mouse';
      case 'replied': return 'reply';
      case 'unsubscribed': return 'unsubscribe';
      default: return 'email';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesSearch = !searchTerm ||
      log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.metadata?.toEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.metadata?.fromEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Debug logging
  console.log(`🔍 Filter debug: Total logs: ${logs.length}, Filtered logs: ${filteredLogs.length}, Status filter: ${filterStatus}, Search term: "${searchTerm}"`);

  const viewEmailContent = (emailLog: EmailLog) => {
    setSelectedEmail(emailLog);
    setShowContentModal(true);
  };

  const closeContentModal = () => {
    setSelectedEmail(null);
    setShowContentModal(false);
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Email Logs</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/email/logs">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>history</span>
              <p className="text-sm font-medium leading-normal">Email Logs</p>
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
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/settings">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
              <p className="text-sm font-medium leading-normal">Email Settings</p>
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
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Email Logs</h1>
              <p className="text-sm text-gray-600 mt-1">Track all sent emails and delivery status</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {logs.length}
                  </div>
                  <div className="text-xs text-gray-500">Total Emails</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {logs.filter(log => log.status === 'delivered').length}
                  </div>
                  <div className="text-xs text-gray-500">Delivered</div>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    console.log('🛠️ Setting up database table...');
                    const response = await fetch('/api/email/setup-table', { method: 'POST' });
                    const data = await response.json();

                    console.log('🔍 Setup response:', data);

                    if (data.success) {
                      console.log('✅ Database table setup successful');
                      setNotice('Database table setup completed successfully');
                      await fetchEmailLogs(); // Refresh the logs
                    } else {
                      console.error('❌ Failed to setup table:', data);
                      setNotice(`Failed to setup table: ${data.error}`);
                    }
                  } catch (error) {
                    console.error('❌ Setup error:', error);
                    setNotice(`Setup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                style={{backgroundColor: '#f59e0b'}}
              >
                <span className="material-symbols-outlined text-base">build</span>
                Setup Table
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('🧪 Creating test email log...');
                    const response = await fetch('/api/email/test-log', { method: 'POST' });
                    const data = await response.json();

                    console.log('🔍 Test endpoint response:', data);

                    if (data.success) {
                      console.log('✅ Test email log created successfully');
                      await fetchEmailLogs(); // Refresh the logs
                    } else {
                      console.error('❌ Failed to create test email log:', data);
                      setNotice(`Failed to create test email: ${data.error} - ${data.message || ''}`);
                    }
                  } catch (error) {
                    console.error('❌ Test email log error:', error);
                    setNotice(`Test email error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                style={{backgroundColor: '#10b981'}}
              >
                <span className="material-symbols-outlined text-base">science</span>
                Create Test Email
              </button>
              <button
                onClick={fetchEmailLogs}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                style={{backgroundColor: '#3dbff2'}}
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400">search</span>
                </div>
                <input
                  className="block w-80 rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Search by email, subject..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="bounced">Bounced</option>
                <option value="opened">Opened</option>
                <option value="clicked">Clicked</option>
                <option value="replied">Replied</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          </div>

          {/* Email Logs Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                Email Activity ({filteredLogs.length})
              </h3>
              {dataSource === 'mock' && (
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Demo Data
                </div>
              )}
              {dataSource === 'database' && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Live Data
                </div>
              )}
            </div>

            {notice && (
              <div className={`px-6 py-3 border-b ${
                dataSource === 'mock' ? 'bg-blue-50' :
                notice.includes('error') || notice.includes('Failed') ? 'bg-red-50' :
                'bg-green-50'
              }`}>
                <p className={`text-sm ${
                  dataSource === 'mock' ? 'text-blue-700' :
                  notice.includes('error') || notice.includes('Failed') ? 'text-red-700' :
                  'text-green-700'
                }`}>
                  {dataSource === 'mock' ? 'ℹ️' :
                   notice.includes('error') || notice.includes('Failed') ? '❌' : '✅'} {notice}
                </p>
              </div>
            )}

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading email logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-gray-400 text-6xl">history</span>
                <p className="text-gray-500 mt-4">No email logs found</p>
                <p className="text-sm text-gray-400 mt-2">Send some emails to see activity here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Email Details</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{log.subject}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {log.metadata?.messageId && `ID: ${log.metadata.messageId.substring(0, 20)}...`}
                            </div>
                            {log.errorMessage && (
                              <div className="text-xs text-red-600 mt-1">Error: {log.errorMessage}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            <span className="material-symbols-outlined text-xs">{getStatusIcon(log.status)}</span>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{log.metadata?.toEmail || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">From: {log.metadata?.fromEmail || 'Unknown'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {new Date(log.sentAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-1">
                            {log.deliveredAt && (
                              <div>✓ Delivered: {new Date(log.deliveredAt).toLocaleString()}</div>
                            )}
                            {log.openedAt && (
                              <div>👁 Opened: {new Date(log.openedAt).toLocaleString()}</div>
                            )}
                            {log.clickedAt && (
                              <div>🖱 Clicked: {new Date(log.clickedAt).toLocaleString()}</div>
                            )}
                            {log.repliedAt && (
                              <div>↩️ Replied: {new Date(log.repliedAt).toLocaleString()}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {log.content ? (
                            <button
                              onClick={() => viewEmailContent(log)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md hover:opacity-90 transition-opacity"
                              style={{backgroundColor: '#3dbff2', color: 'white'}}
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              View Content
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No content</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Email Content Modal */}
      {showContentModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Email Content</h2>
              <button
                onClick={closeContentModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Email Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Subject:</span>
                    <p className="mt-1">{selectedEmail.subject}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEmail.status)}`}>
                      <span className="material-symbols-outlined text-xs">{getStatusIcon(selectedEmail.status)}</span>
                      {selectedEmail.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">From:</span>
                    <p className="mt-1">{selectedEmail.metadata.fromEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To:</span>
                    <p className="mt-1">{selectedEmail.metadata.toEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sent At:</span>
                    <p className="mt-1">{new Date(selectedEmail.sentAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Template:</span>
                    <p className="mt-1">{selectedEmail.templateId}</p>
                  </div>
                </div>
              </div>

              {/* Email Content Tabs */}
              {selectedEmail.content && (
                <div>
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                        style={{borderColor: '#3dbff2', color: '#3dbff2'}}
                      >
                        HTML View
                      </button>
                    </nav>
                  </div>

                  {/* HTML Content */}
                  <div className="bg-white border rounded-lg">
                    <div className="p-4">
                      <iframe
                        srcDoc={selectedEmail.content.html}
                        className="w-full h-96 border rounded"
                        title="Email HTML Content"
                      />
                    </div>
                  </div>

                  {/* Text Content (Hidden by default, can be toggled) */}
                  {selectedEmail.content.text && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">Plain Text Version:</h4>
                      <pre className="text-sm whitespace-pre-wrap text-gray-600">{selectedEmail.content.text}</pre>
                    </div>
                  )}
                </div>
              )}

              {!selectedEmail.content && (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-gray-400 text-6xl">mail</span>
                  <p className="text-gray-500 mt-4">No email content available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}