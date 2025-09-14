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
      // Try to load from Notion API first (requires API key in environment)
      if (process.env.NEXT_PUBLIC_NOTION_API_KEY) {
        try {
          const response = await notionAPI.queryDatabase(db.id);
          const notionLeads = response.results.map(page => notionAPI.convertNotionPageToLead(page));
          setLeads(notionLeads);
          setFilteredLeads(notionLeads);
          setLoading(false);
          return;
        } catch (error) {
          console.warn('Notion API failed, falling back to mock data:', error);
        }
      }
      
      // Fallback to mock data if Notion API is not available
      setTimeout(() => {
        // Get all leads and simulate filtering for the specific database
        const allLeads = LeadManager.getLeads().filter(lead => !lead.isDuplicate);
      
      // Simulate different lead sets based on database type
      let databaseLeads: Lead[] = [];
      
      switch (db.slug) {
        case 'inbound':
          databaseLeads = allLeads.filter(lead => 
            lead.source === 'Website' || lead.source === 'Email Campaign'
          ).slice(0, 50);
          break;
        case 'ai-audit-pre-call':
          databaseLeads = allLeads.filter(lead => 
            lead.status === 'New' || lead.status === 'Contacted'
          ).slice(0, 30);
          break;
        case 'ai-audit-post-call':
          databaseLeads = allLeads.filter(lead => 
            lead.status === 'Qualified' || lead.status === 'Proposal'
          ).slice(0, 25);
          break;
        case 'cold-caller-followup':
          databaseLeads = allLeads.filter(lead => 
            lead.nextFollowUp && new Date(lead.nextFollowUp) > new Date()
          ).slice(0, 40);
          break;
        case 'whatsapp-bot':
          databaseLeads = allLeads.filter(lead => 
            lead.leadSource === 'WhatsApp Bot' || lead.source === 'Social Media'
          ).slice(0, 35);
          break;
        case 'website-leads':
          databaseLeads = allLeads.filter(lead => 
            lead.source === 'Website'
          ).slice(0, 60);
          break;
        default:
          databaseLeads = allLeads.slice(0, 20);
      }

      // Generate additional mock leads if needed
      while (databaseLeads.length < 15) {
        const baseLead = allLeads[databaseLeads.length % allLeads.length];
        const mockLead: Lead = {
          ...baseLead,
          id: `${db.slug}_${databaseLeads.length}`,
          name: `${baseLead.name} (${db.name.split(' ')[0]} Lead)`,
          email: `${db.slug.toLowerCase()}${databaseLeads.length}@example.com`,
          phone: `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        };
        databaseLeads.push(mockLead);
      }

        setLeads(databaseLeads);
        setFilteredLeads(databaseLeads);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading database leads:', error);
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

    setFilteredLeads(filtered);
  }, [leads, searchTerm]);

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
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                <span className="material-symbols-outlined text-base">sync</span>
                Sync from Notion
              </button>
              <button 
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
    </div>
  );
}