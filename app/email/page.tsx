'use client'

import React, { useState, useEffect } from "react";
import { EmailTemplate, EmailCampaign, EmailSequence } from "../../lib/email-system";
import { SupabaseEmailManager } from "../../lib/supabase-email";
import TemplateModal from "../../components/TemplateModal";

export default function EmailManagementPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'sequences' | 'analytics'>('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, campaignsData] = await Promise.all([
        SupabaseEmailManager.getTemplates(),
        SupabaseEmailManager.getCampaigns()
      ]);

      setTemplates(templatesData);
      setCampaigns(campaignsData);
      // setSequences will be implemented later
      setSequences([]);
    } catch (error) {
      console.error('Error loading email data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'follow-up': return 'bg-orange-100 text-orange-800';
      case 'nurture': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'closing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    return sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0';
  };

  const calculateClickRate = (clicked: number, sent: number) => {
    return sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0';
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setShowDeleteConfirm(templateId);
  };

  const confirmDeleteTemplate = async (templateId: string) => {
    try {
      const success = await SupabaseEmailManager.deleteTemplate(templateId);
      if (success) {
        await loadData(); // Reload data from database
      } else {
        alert('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
    setShowDeleteConfirm(null);
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      if (editingTemplate) {
        // Update existing template
        const updatedTemplate = await SupabaseEmailManager.updateTemplate(editingTemplate.id, templateData);
        if (updatedTemplate) {
          await loadData(); // Reload data from database
        } else {
          alert('Failed to update template');
        }
      } else {
        // Create new template
        const newTemplate = await SupabaseEmailManager.createTemplate(templateData);
        if (newTemplate) {
          await loadData(); // Reload data from database
        } else {
          alert('Failed to create template');
        }
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    }
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Email Management</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/inbox">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>inbox</span>
              <p className="text-sm font-medium leading-normal">Inbox</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/composer">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>edit</span>
              <p className="text-sm font-medium leading-normal">Email Composer</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/settings">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
              <p className="text-sm font-medium leading-normal">Email Settings</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email/logs">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>history</span>
              <p className="text-sm font-medium leading-normal">Email Logs</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>arrow_back</span>
              <p className="text-sm font-medium leading-normal">Back to Dashboard</p>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Email Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage templates, campaigns, and automated sequences</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {templates.reduce((acc, t) => acc + t.stats.sent, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Sent</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {campaigns.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-xs text-gray-500">Active Campaigns</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { key: 'templates', label: 'Templates', icon: 'description' },
                { key: 'campaigns', label: 'Campaigns', icon: 'campaign' },
                { key: 'sequences', label: 'Sequences', icon: 'auto_awesome' },
                { key: 'analytics', label: 'Analytics', icon: 'analytics' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-[#3dbff2] text-[#3dbff2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-gray-400">search</span>
              </div>
              <input 
                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm" 
                placeholder="Search..." 
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'templates' && (
                <button
                  onClick={handleCreateTemplate}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Template
                </button>
              )}
              {activeTab === 'campaigns' && (
                <button 
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Campaign
                </button>
              )}
              {activeTab === 'sequences' && (
                <button 
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Sequence
                </button>
              )}
            </div>
          </div>

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Email Templates ({filteredTemplates.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{template.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{template.subject}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {template.isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                            {template.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{template.leadStage || 'Any'}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Sent: <span className="font-medium">{template.stats.sent.toLocaleString()}</span></div>
                            <div>Opened: <span className="font-medium">{template.stats.opened.toLocaleString()}</span></div>
                            <div>Clicked: <span className="font-medium">{template.stats.clicked.toLocaleString()}</span></div>
                            <div>Replied: <span className="font-medium">{template.stats.replied.toLocaleString()}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Open Rate: <span className="font-medium">{calculateOpenRate(template.stats.opened, template.stats.sent)}%</span></div>
                            <div>Click Rate: <span className="font-medium">{calculateClickRate(template.stats.clicked, template.stats.sent)}%</span></div>
                            <div>Reply Rate: <span className="font-medium">{calculateClickRate(template.stats.replied, template.stats.sent)}%</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-[#3dbff2] hover:underline text-xs"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              Preview
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => handleEditTemplate(template)}
                              title="Edit template"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              className="text-gray-400 hover:text-red-600"
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Delete template"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Email Campaigns ({filteredCampaigns.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium" style={{color: '#0a2240'}}>{campaign.name}</div>
                            <div className="text-xs text-gray-500">{campaign.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {new Date(campaign.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {campaign.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>Sent: <span className="font-medium">{campaign.stats.sent.toLocaleString()}</span></div>
                            <div>Open Rate: <span className="font-medium">{calculateOpenRate(campaign.stats.opened, campaign.stats.sent)}%</span></div>
                            <div>Click Rate: <span className="font-medium">{calculateClickRate(campaign.stats.clicked, campaign.stats.sent)}%</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            <div>{campaign.schedule.frequency}</div>
                            <div>{campaign.schedule.time}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="text-[#3dbff2] hover:underline text-xs">
                              View
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-base">more_horiz</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sequences Tab */}
          {activeTab === 'sequences' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                  Email Sequences ({sequences.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {sequences.map((sequence) => (
                  <div key={sequence.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2" style={{color: '#0a2240'}}>{sequence.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{sequence.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {sequence.trigger}
                          </span>
                          {sequence.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Sequence Steps ({sequence.steps.length})</h5>
                      <div className="space-y-2">
                        {sequence.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 rounded-full bg-[#3dbff2] text-white flex items-center justify-center text-xs">
                              {step.order}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Step {step.order}</div>
                              <div className="text-gray-500">
                                Delay: {step.delay.value} {step.delay.unit}
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {step.stats.sent} sent
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{sequence.stats.enrolled}</div>
                          <div className="text-gray-500">Enrolled</div>
                        </div>
                        <div>
                          <div className="font-medium">{sequence.stats.completed}</div>
                          <div className="text-gray-500">Completed</div>
                        </div>
                        <div>
                          <div className="font-medium">{sequence.stats.dropOffRate}%</div>
                          <div className="text-gray-500">Drop-off</div>
                        </div>
                      </div>
                      <button className="text-[#3dbff2] hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Total Emails Sent</p>
                      <p className="text-2xl font-bold" style={{color: '#0a2240'}}>
                        {templates.reduce((acc, t) => acc + t.stats.sent, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                      <span className="material-symbols-outlined text-blue-600">send</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Average Open Rate</p>
                      <p className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                        {(() => {
                          const totalSent = templates.reduce((acc, t) => acc + t.stats.sent, 0);
                          const totalOpened = templates.reduce((acc, t) => acc + t.stats.opened, 0);
                          return totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
                        })()}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-cyan-100">
                      <span className="material-symbols-outlined text-cyan-600">visibility</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Average Click Rate</p>
                      <p className="text-2xl font-bold" style={{color: '#10b981'}}>
                        {(() => {
                          const totalSent = templates.reduce((acc, t) => acc + t.stats.sent, 0);
                          const totalClicked = templates.reduce((acc, t) => acc + t.stats.clicked, 0);
                          return totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
                        })()}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                      <span className="material-symbols-outlined text-green-600">mouse</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Total Replies</p>
                      <p className="text-2xl font-bold" style={{color: '#f59e0b'}}>
                        {templates.reduce((acc, t) => acc + t.stats.replied, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
                      <span className="material-symbols-outlined text-yellow-600">reply</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance by Template Type */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                    Performance by Template Type
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from(new Set(templates.map(t => t.type))).map(type => {
                      const typeTemplates = templates.filter(t => t.type === type);
                      const totalSent = typeTemplates.reduce((acc, t) => acc + t.stats.sent, 0);
                      const totalOpened = typeTemplates.reduce((acc, t) => acc + t.stats.opened, 0);
                      const totalClicked = typeTemplates.reduce((acc, t) => acc + t.stats.clicked, 0);
                      const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
                      const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(type)}`}>
                              {type}
                            </span>
                            <div className="text-sm text-gray-600">
                              {typeTemplates.length} template{typeTemplates.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <div className="font-medium">{totalSent.toLocaleString()}</div>
                              <div className="text-gray-500">Sent</div>
                            </div>
                            <div>
                              <div className="font-medium">{openRate}%</div>
                              <div className="text-gray-500">Open Rate</div>
                            </div>
                            <div>
                              <div className="font-medium">{clickRate}%</div>
                              <div className="text-gray-500">Click Rate</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Template Preview</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Name</label>
                  <div className="mt-1 text-sm">{selectedTemplate.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                  <div className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">{selectedTemplate.subject}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Content</label>
                  <div className="mt-1 text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap font-mono">
                    {selectedTemplate.content}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Variables</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedTemplate.variables.map(variable => (
                      <span key={variable} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {'{{'}{variable}{'}}'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Create/Edit Modal */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Delete Template</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteTemplate(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}