'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  date: Date;
  messageId: string;
  unread?: boolean;
}

export default function EmailInboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [smtpConnected, setSmtpConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetchEmails();
    testSmtpConnection();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/email/inbox');
      const data = await response.json();

      if (data.success) {
        setEmails(data.emails.map((email: any) => ({
          ...email,
          date: new Date(email.date)
        })));
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSmtpConnection = async () => {
    try {
      const response = await fetch('/api/email/test');
      const data = await response.json();
      setSmtpConnected(data.success);
    } catch (error) {
      setSmtpConnected(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Email Inbox</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/email/inbox">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>inbox</span>
              <p className="text-sm font-medium leading-normal">Inbox</p>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
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
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Email Inbox</h1>
              <p className="text-sm text-gray-600 mt-1">Manage incoming emails and responses</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                smtpConnected === true
                  ? 'bg-green-100 text-green-800'
                  : smtpConnected === false
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {smtpConnected === true ? '✓ SMTP Connected' :
                 smtpConnected === false ? '✗ SMTP Disconnected' :
                 'Checking Connection...'}
              </div>
              <button
                onClick={fetchEmails}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                style={{backgroundColor: '#3dbff2'}}
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Email List */}
          <div className="w-1/3 bg-white border-r">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Inbox ({emails.length})
                </h3>
                <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Demo Data
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-blue-50 border-b">
              <p className="text-xs text-blue-700">
                ℹ️ This inbox shows demo data. Real email integration requires IMAP configuration which is not yet implemented.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-gray-400 text-6xl">inbox</span>
                <p className="text-gray-500 mt-4">No emails found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Real email integration requires IMAP setup. Currently showing demo data above.
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${email.unread ? 'font-semibold' : 'font-medium'}`}>
                            {email.from}
                          </p>
                          {email.unread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm text-gray-600 truncate mt-1 ${email.unread ? 'font-medium' : ''}`}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {email.text.substring(0, 60)}...
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 ml-2">
                        {formatTime(email.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Detail */}
          <div className="flex-1 bg-white">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2" style={{color: '#0a2240'}}>
                        {selectedEmail.subject}
                      </h2>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>From:</strong> {selectedEmail.from}</p>
                        <p><strong>To:</strong> {selectedEmail.to}</p>
                        <p><strong>Date:</strong> {selectedEmail.date.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">reply</span>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">forward</span>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-gray-800">
                    {selectedEmail.text}
                  </div>
                </div>
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                            style={{backgroundColor: '#3dbff2'}}>
                      <span className="material-symbols-outlined text-base">reply</span>
                      Reply
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                      <span className="material-symbols-outlined text-base">forward</span>
                      Forward
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                      <span className="material-symbols-outlined text-base">person_add</span>
                      Add to CRM
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-gray-400 text-6xl">email</span>
                  <p className="text-gray-500 mt-4">Select an email to view</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SMTP Configuration Notice */}
        {smtpConnected === false && (
          <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <span className="material-symbols-outlined text-yellow-600 mr-2">warning</span>
              <div>
                <h4 className="text-sm font-medium text-yellow-800">SMTP Not Configured</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Configure your email settings in .env.local to send and receive emails.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}