'use client'

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDatabaseBySlug, NotionDatabase } from "../../../lib/notion-databases";
import { LeadManager, Lead } from "../../../lib/leads";
import { notionAPI } from "../../../lib/notion-api";

export default function NotionDatabasePage() {
  const params = useParams();
  const router = useRouter();
  const [database, setDatabase] = useState<NotionDatabase | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  useEffect(() => {
    if (params?.slug) {
      const db = getDatabaseBySlug(params.slug as string);
      if (db) {
        setDatabase(db);
        // Simulate loading leads from Notion database
        // In production, this would be an API call to Notion
        loadDatabaseLeads(db);
      } else {
        router.push('/leads');
      }
    }
  }, [params?.slug, router]);

  const loadDatabaseLeads = async (db: NotionDatabase) => {
    setLoading(true);

    try {
      // Call the API endpoint to get leads from this specific database
      const response = await fetch(`/api/leads?database=${db.slug}`);
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
      console.error('Error loading database leads:', error);
      setLeads([]);
      setFilteredLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_time || b.createdAt || '').getTime() - new Date(a.created_time || a.createdAt || '').getTime();
        case 'oldest':
          return new Date(a.created_time || a.createdAt || '').getTime() - new Date(b.created_time || b.createdAt || '').getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'company-asc':
          return (a.company || '').localeCompare(b.company || '');
        case 'company-desc':
          return (b.company || '').localeCompare(a.company || '');
        case 'status-asc':
          return a.status.localeCompare(b.status);
        case 'status-desc':
          return b.status.localeCompare(a.status);
        case 'score-high':
          return (b.score || 0) - (a.score || 0);
        case 'score-low':
          return (a.score || 0) - (b.score || 0);
        default:
          return 0;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, sortBy]);

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

  const getDatabaseColor = (color: string) => {
    switch (color) {
      case 'blue': return '#3b82f6';
      case 'purple': return '#8b5cf6';
      case 'green': return '#10b981';
      case 'orange': return '#f59e0b';
      case 'emerald': return '#10b981';
      case 'cyan': return '#06b6d4';
      default: return '#3dbff2';
    }
  };

  const handleSyncFromNotion = async () => {
    if (!database) return;

    setSyncing(true);
    try {
      const response = await fetch(`/api/leads?database=${database.slug}&sync=true`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh the leads after sync
        await loadDatabaseLeads(database);
      } else {
        console.error('Sync failed');
      }
    } catch (error) {
      console.error('Error syncing from Notion:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddLead = async (leadData: Partial<Lead>) => {
    if (!database) return;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          database: database.slug,
        }),
      });

      if (response.ok) {
        // Refresh the leads after adding
        await loadDatabaseLeads(database);
        setShowAddForm(false);
      } else {
        console.error('Failed to add lead');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  if (loading || !database) {
    return (
      <div className="flex min-h-screen flex-col bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#3dbff2'}}></div>
            <p className="text-gray-600">Loading {database?.name || 'database'}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#3dbff2]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{backgroundColor: getDatabaseColor(database.color)}}
            >
              <span className="material-symbols-outlined">{database.icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{color: '#0a2240'}}>{database.name}</h1>
              <p className="text-sm text-gray-600">{database.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Notion Database ID:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{database.id}</code>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold" style={{color: '#0a2240'}}>{leads.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: getDatabaseColor(database.color) + '20'}}>
                  <span className="material-symbols-outlined" style={{color: getDatabaseColor(database.color)}}>{database.icon}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Last Synced</p>
                  <p className="text-lg font-semibold text-green-600">Just now</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                  <span className="material-symbols-outlined text-green-600">sync</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Connection Status</p>
                  <p className="text-lg font-semibold text-green-600">Connected</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                  <span className="material-symbols-outlined text-green-600">link</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400">search</span>
                </div>
                <input
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                  placeholder="Search records..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="company-asc">Company (A-Z)</option>
                  <option value="company-desc">Company (Z-A)</option>
                  <option value="status-asc">Status (A-Z)</option>
                  <option value="status-desc">Status (Z-A)</option>
                  <option value="score-high">Score (High-Low)</option>
                  <option value="score-low">Score (Low-High)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSyncFromNotion}
                disabled={syncing}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-base ${syncing ? 'animate-spin' : ''}`}>sync</span>
                {syncing ? 'Syncing...' : 'Sync from Notion'}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                style={{backgroundColor: getDatabaseColor(database.color)}}
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Record
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>
                {database.name} Records ({filteredLeads.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium" style={{color: '#0a2240'}}>{lead.name}</div>
                          <div className="text-xs text-gray-500">{lead.email}</div>
                          {lead.position && (
                            <div className="text-xs text-gray-400">{lead.position}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{lead.company || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <a 
                          href={`tel:${lead.phone}`} 
                          className="text-[#3dbff2] hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{lead.source}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{
                                width: `${lead.score}%`, 
                                backgroundColor: lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#3dbff2' : '#f59e0b'
                              }}
                            ></div>
                          </div>
                          <span className="text-xs">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/leads/${lead.id}`}
                            className="text-[#3dbff2] hover:underline text-xs"
                          >
                            View
                          </a>
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

        </div>
      </main>

      {/* Add Lead Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Add New Lead</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <AddLeadForm
              database={database}
              onSubmit={handleAddLead}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Add Lead Form Component
function AddLeadForm({
  database,
  onSubmit,
  onCancel
}: {
  database: NotionDatabase;
  onSubmit: (leadData: Partial<Lead>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'Other' as const,
    status: 'New' as const,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({...formData, company: e.target.value})}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <input
          type="text"
          value={formData.position}
          onChange={(e) => setFormData({...formData, position: e.target.value})}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-[#3dbff2] text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Add Lead
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}