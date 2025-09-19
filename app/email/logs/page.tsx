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
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSource, setDataSource] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      const response = await fetch('/api/email/logs');
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs.map((log: any) => ({
          ...log,
          sentAt: new Date(log.sentAt)
        })));
        setDataSource(data.source || 'unknown');
        setNotice(data.notice || '');
      }
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
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
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.metadata.toEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.metadata.fromEmail.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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

            {notice && dataSource === 'mock' && (
              <div className="px-6 py-3 bg-blue-50 border-b">
                <p className="text-sm text-blue-700">
                  ℹ️ {notice}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{log.subject}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {log.metadata.messageId && `ID: ${log.metadata.messageId.substring(0, 20)}...`}
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
                            <div className="font-medium">{log.metadata.toEmail}</div>
                            <div className="text-xs text-gray-500">From: {log.metadata.fromEmail}</div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}