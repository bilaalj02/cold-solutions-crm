'use client'

import React, { useState, useEffect } from "react";
import { LeadManager, Lead } from "../../lib/leads";
import StandardSidebar from "../../components/StandardSidebar";

export default function LeadsDatabase() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'Website',
    status: 'New',
    notes: '',
    tags: [],
    estimatedValue: 0,
    expectedCloseDate: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        setFilteredLeads(data.leads || []);
      } else {
        console.error('Failed to fetch leads from API');
        setLeads([]);
        setFilteredLeads([]);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
      setFilteredLeads([]);
    }
  };

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sourceFilter !== 'All') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, sourceFilter, statusFilter]);

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.phone) {
      alert('Please fill in required fields: Name, Email, and Phone');
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLead,
          database: 'website-leads',
        }),
      });

      if (response.ok) {
        await loadLeads();
        setShowAddModal(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          source: 'Website',
          status: 'New',
          notes: '',
          tags: [],
          estimatedValue: 0,
          expectedCloseDate: ''
        });
      } else {
        console.error('Failed to add lead');
        alert('Failed to add lead. Please try again.');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Error adding lead. Please try again.');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadLeads();
        setShowDeleteModal(false);
        setLeadToDelete(null);
      } else {
        console.error('Failed to delete lead');
        alert('Failed to delete lead. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error deleting lead. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedLeads).map(leadId =>
        fetch(`/api/leads/${leadId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      await loadLeads();
      setSelectedLeads(new Set());
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      alert('Error deleting leads. Please try again.');
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const selectAllLeads = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Proposal': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Won': return 'bg-emerald-100 text-emerald-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Position', 'Source', 'Status', 'Score', 'Created At', 'Last Interaction', 'Estimated Value', 'Notes'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email,
        lead.phone,
        lead.company || '',
        lead.position || '',
        lead.source,
        lead.status,
        lead.score.toString(),
        lead.createdAt,
        lead.lastInteraction || '',
        lead.estimatedValue?.toString() || '',
        lead.notes.replace(/[\n\r]/g, ' ').substring(0, 100)
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSyncFromNotion = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/leads?sync=true', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        await loadLeads();
        setLastSyncTime(new Date().toLocaleString());
        alert('✅ Sync completed successfully!');
      } else {
        const data = await response.json();
        const errorMsg = data.error || 'Unknown error';
        alert(`❌ Sync failed: ${errorMsg}\n\nPlease check your Notion integration setup.`);
      }
    } catch (error) {
      console.error('Notion sync error:', error);
      alert('❌ Network error during sync. Please check your connection and try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <StandardSidebar />
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Leads Database</h1>
              <p className="text-gray-600 mt-1">Manage and track all your leads in one place.</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
              </div>
              <div className="mt-4 flex gap-4 md:mt-0 md:ml-4">
                {selectedLeads.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Delete Selected ({selectedLeads.size})
                  </button>
                )}
                <a
                  href="/leads/management"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  Advanced Management
                </a>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{backgroundColor: '#3dbff2', '--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add New Lead
                </button>
                <button
                  onClick={handleSyncFromNotion}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                >
                  <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>
                    {isSyncing ? 'sync' : 'cloud_sync'}
                  </span>
                  {isSyncing ? 'Syncing...' : 'Sync from Notion'}
                </button>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mb-4 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
              <div className="relative flex-1 md:max-w-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400">search</span>
                </div>
                <input
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Search leads..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="source-filter">Source:</label>
                  <select
                    className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                    id="source-filter"
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Social Media</option>
                    <option>Email Campaign</option>
                    <option>Cold Call</option>
                    <option>Event</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="status-filter">Status:</label>
                  <select
                    className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                    <option>Proposal</option>
                    <option>Negotiation</option>
                    <option>Won</option>
                    <option>Lost</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6" style={{color: '#0a2240'}} scope="col">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#3dbff2] border-gray-300 rounded focus:ring-[#3dbff2]"
                        checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                        onChange={selectAllLeads}
                      />
                    </th>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6" style={{color: '#0a2240'}} scope="col">
                      <a className="group inline-flex items-center" href="#">
                        Name
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-900">
                          <span className="material-symbols-outlined text-base">expand_less</span>
                        </span>
                      </a>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold" style={{color: '#0a2240'}} scope="col">
                      <a className="group inline-flex items-center" href="#">
                        Email
                        <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <span className="material-symbols-outlined text-base">unfold_more</span>
                        </span>
                      </a>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold" style={{color: '#0a2240'}} scope="col">
                      <a className="group inline-flex items-center" href="#">
                        Phone
                        <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <span className="material-symbols-outlined text-base">unfold_more</span>
                        </span>
                      </a>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold" style={{color: '#0a2240'}} scope="col">
                      <a className="group inline-flex items-center" href="#">
                        Source
                        <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <span className="material-symbols-outlined text-base">unfold_more</span>
                        </span>
                      </a>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold" style={{color: '#0a2240'}} scope="col">
                      <a className="group inline-flex items-center" href="#">
                        Status
                        <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <span className="material-symbols-outlined text-base">unfold_more</span>
                        </span>
                      </a>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold" style={{color: '#0a2240'}} scope="col">
                      <a className="group inline-flex items-center" href="#">
                        Score
                        <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <span className="material-symbols-outlined text-base">unfold_more</span>
                        </span>
                      </a>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold" style={{color: '#0a2240'}} scope="col">
                      <a className="group inline-flex items-center" href="#">
                        Created At
                        <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          <span className="material-symbols-outlined text-base">unfold_more</span>
                        </span>
                      </a>
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold" style={{color: '#0a2240'}} scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className={selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#3dbff2] border-gray-300 rounded focus:ring-[#3dbff2]"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                        />
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <a href={`/leads/${lead.id}`} className="text-[#3dbff2] hover:underline font-medium">
                          {lead.name}
                        </a>
                        {lead.company && (
                          <div className="text-xs text-gray-500">{lead.company}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.phone}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.source}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{width: `${lead.score}%`, backgroundColor: lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#3dbff2' : '#f59e0b'}}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-medium">{lead.score}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{lead.createdAt}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/leads/${lead.id}`}
                            className="text-[#3dbff2] hover:text-blue-900"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </a>
                          <button
                            onClick={() => {
                              setLeadToDelete(lead);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Lead"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Send Email"
                          >
                            <span className="material-symbols-outlined text-base">email</span>
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-green-600 hover:text-green-900"
                            title="Call Lead"
                          >
                            <span className="material-symbols-outlined text-base">call</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>

            <div className="inline-block transform rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="mb-4">
                <h3 className="text-lg font-medium leading-6" style={{color: '#0a2240'}}>Add New Lead</h3>
                <p className="mt-1 text-sm text-gray-500">Enter the lead information below.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.name || ''}
                      onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.email || ''}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.phone || ''}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                      placeholder="555-123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.company || ''}
                      onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.position || ''}
                      onChange={(e) => setNewLead({...newLead, position: e.target.value})}
                      placeholder="Job title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.source}
                      onChange={(e) => setNewLead({...newLead, source: e.target.value as any})}
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Email Campaign">Email Campaign</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Event">Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Value ($)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.estimatedValue || ''}
                      onChange={(e) => setNewLead({...newLead, estimatedValue: e.target.value ? parseInt(e.target.value) : undefined})}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Close Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={newLead.expectedCloseDate || ''}
                      onChange={(e) => setNewLead({...newLead, expectedCloseDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                    value={newLead.notes || ''}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                    placeholder="Additional information about the lead..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{'--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{backgroundColor: '#3dbff2', '--tw-ring-color': '#3dbff2'} as React.CSSProperties}
                  onClick={handleAddLead}
                >
                  Add Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && leadToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>

            <div className="inline-block transform rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="flex items-center">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <span className="material-symbols-outlined text-red-600">warning</span>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6" style={{color: '#0a2240'}}>Delete Lead</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete <span className="font-medium">{leadToDelete.name}</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteLead(leadToDelete.id)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}