'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EmailTemplate } from '../../../lib/email-system';
import { SupabaseEmailManager } from '../../../lib/supabase-email';

export default function EmailComposerPage() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
    templateId: '',
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await SupabaseEmailManager.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'templateId') {
      const template = templates.find(t => t.id === value);
      setSelectedTemplate(template || null);
      if (template) {
        setFormData(prev => ({
          ...prev,
          subject: template.subject,
          content: template.content
        }));
        // Initialize variables
        const newVariables: Record<string, string> = {};
        template.variables.forEach(variable => {
          newVariables[variable] = '';
        });
        setVariables(newVariables);
      } else {
        setVariables({});
      }
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const getPreviewContent = () => {
    if (!selectedTemplate) return formData.content;

    return SupabaseEmailManager.replaceVariables(formData.content, variables);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const emailData = {
        to: formData.to,
        subject: selectedTemplate ? SupabaseEmailManager.replaceVariables(formData.subject, variables) : formData.subject,
        text: getPreviewContent(),
        html: getPreviewContent().replace(/\n/g, '<br>'),
        templateId: formData.templateId || undefined,
        variables: Object.keys(variables).length > 0 ? variables : undefined,
      };

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Email sent successfully!');
        // Reset form
        setFormData({
          to: '',
          subject: '',
          content: '',
          templateId: '',
        });
        setVariables({});
        setSelectedTemplate(null);
      } else {
        alert(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send email. Please check your SMTP configuration.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Email Composer</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/email/composer">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>edit</span>
              <p className="text-sm font-medium leading-normal">Email Composer</p>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/inbox">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>inbox</span>
              <p className="text-sm font-medium leading-normal">Inbox</p>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
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
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Email Composer</h1>
              <p className="text-sm text-gray-600 mt-1">Compose and send emails using templates</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Composer */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Template (Optional)
                    </label>
                    <select
                      name="templateId"
                      value={formData.templateId}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                    >
                      <option value="">Select a template (or write custom email)</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To *
                    </label>
                    <input
                      type="email"
                      name="to"
                      value={formData.to}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      placeholder="Email subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      rows={12}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm font-mono"
                      placeholder="Type your message here..."
                    />
                  </div>
                </div>

                {/* Variables & Preview */}
                <div className="space-y-6">
                  {selectedTemplate && selectedTemplate.variables.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Template Variables</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
                        {selectedTemplate.variables.map(variable => (
                          <div key={variable}>
                            <label className="block text-xs text-gray-600 mb-1">
                              {variable}
                            </label>
                            <input
                              type="text"
                              value={variables[variable] || ''}
                              onChange={(e) => handleVariableChange(variable, e.target.value)}
                              className="w-full text-xs rounded border-gray-300 focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                              placeholder={`Enter ${variable}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                    <div className="border rounded-md p-3 bg-gray-50 max-h-60 overflow-y-auto">
                      <div className="text-xs text-gray-600 mb-2">
                        <strong>Subject:</strong> {selectedTemplate ? SupabaseEmailManager.replaceVariables(formData.subject, variables) : formData.subject}
                      </div>
                      <div className="text-xs text-gray-800 whitespace-pre-wrap">
                        {getPreviewContent() || 'Type your message to see preview...'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                      style={{backgroundColor: '#3dbff2'}}
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">send</span>
                          Send Email
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    >
                      <span className="material-symbols-outlined text-base">save</span>
                      Save as Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}