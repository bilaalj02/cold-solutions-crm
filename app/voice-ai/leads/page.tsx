'use client'

import React, { useState, useEffect } from 'react';
import StandardSidebar from '../../../components/StandardSidebar';

interface Lead {
  id: string;
  business_name: string;
  contact_name?: string;
  phone: string;
  email?: string;
  website?: string;
  city?: string;
  province?: string;
  industry?: string;
  status: string;
  research_status: string;
  research_data?: any;
  call_attempts: number;
  campaign_id?: string;
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  industry: string;
  provinces: string[];
  status: string;
}

export default function VoiceAILeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterProvince, setFilterProvince] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<any>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [filterProvince, filterIndustry, filterStatus]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterProvince) params.append('province', filterProvince);
      if (filterIndustry) params.append('industry', filterIndustry);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`/api/voice-ai/leads?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async () => {
    if (!importFile) return;

    try {
      setImporting(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const csvData = e.target?.result as string;

        const response = await fetch('/api/voice-ai/leads/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData }),
        });

        const data = await response.json();

        if (data.success) {
          alert(`Successfully imported ${data.imported} leads!`);
          setShowImportModal(false);
          setImportFile(null);
          fetchLeads();
        } else {
          alert(`Import completed with errors. Imported: ${data.imported}, Errors: ${data.errors}`);
        }
      };

      reader.readAsText(importFile);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import leads');
    } finally {
      setImporting(false);
    }
  };

  const handleTriggerResearch = async (leadIds: string[]) => {
    try {
      const response = await fetch('/api/voice-ai/leads/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: leadIds }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Research queued for ${leadIds.length} leads!`);
        fetchLeads();
      }
    } catch (error) {
      console.error('Failed to trigger research:', error);
      alert('Failed to trigger research');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/voice-ai/leads?id=${leadId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Lead deleted successfully');
        fetchLeads();
      } else {
        alert('Failed to delete lead: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch('/api/voice-ai/campaigns');
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleAddToCampaign = async (campaignId: string) => {
    if (selectedLeads.length === 0) {
      alert('Please select leads first');
      return;
    }

    try {
      const response = await fetch('/api/voice-ai/campaigns/assign-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          lead_ids: selectedLeads
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully added ${selectedLeads.length} leads to campaign!`);
        setShowCampaignModal(false);
        setSelectedLeads([]);
        fetchLeads();
      } else {
        alert('Failed to add leads to campaign: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to add leads to campaign:', error);
      alert('Failed to add leads to campaign');
    }
  };

  const openCampaignModal = () => {
    if (selectedLeads.length === 0) {
      alert('Please select leads first');
      return;
    }
    fetchCampaigns();
    setShowCampaignModal(true);
  };

  const filteredLeads = leads.filter(lead => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.business_name?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-800',
      'Research Complete': 'bg-green-100 text-green-800',
      'Queued for Calling': 'bg-yellow-100 text-yellow-800',
      'Calling': 'bg-purple-100 text-purple-800',
      'Interested': 'bg-green-100 text-green-800',
      'Not Interested': 'bg-gray-100 text-gray-800',
      'Do Not Call': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getResearchStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Complete': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex min-h-screen" style={{position: 'relative'}}>
      <StandardSidebar />

      <main className="flex-1 p-8 overflow-auto" style={{position: 'relative', zIndex: 1}}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice AI Leads</h1>
            <p className="text-gray-600">Manage leads for voice AI cold calling campaigns</p>
          </div>

          {/* Actions Bar */}
          <div className="mb-6 flex gap-4 flex-wrap items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-gray-900"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Import CSV
              </button>

              <button
                onClick={() => {
                  if (selectedLeads.length === 0) {
                    alert('Please select leads first');
                    return;
                  }
                  handleTriggerResearch(selectedLeads);
                }}
                className="px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-gray-900"
                disabled={selectedLeads.length === 0}
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
                Run Research ({selectedLeads.length})
              </button>

              <button
                onClick={openCampaignModal}
                className="px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-purple-700"
                disabled={selectedLeads.length === 0}
              >
                <span className="material-symbols-outlined text-sm">campaign</span>
                Add to Campaign ({selectedLeads.length})
              </button>

              <a
                href="/voice-ai-leads-template.csv"
                download
                className="px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-gray-900"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Template CSV
              </a>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 glass-input rounded-lg text-gray-900"
              />

              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="px-4 py-2 glass-input rounded-lg text-gray-900"
              >
                <option value="">All Provinces</option>
                <option value="BC">BC</option>
                <option value="AB">Alberta</option>
                <option value="ON">Ontario</option>
                <option value="QC">Quebec</option>
              </select>

              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="px-4 py-2 glass-input rounded-lg text-gray-900"
              >
                <option value="">All Industries</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Home Services">Home Services</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 glass-input rounded-lg text-gray-900"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Research Complete">Research Complete</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Leads</span>
                <span className="material-symbols-outlined text-blue-600">group</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{leads.length}</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Research Complete</span>
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {leads.filter(l => l.research_status === 'Complete').length}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Ready to Call</span>
                <span className="material-symbols-outlined text-blue-600">call</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {leads.filter(l => l.research_status === 'Complete' && l.call_attempts === 0).length}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Interested</span>
                <span className="material-symbols-outlined text-purple-600">star</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {leads.filter(l => l.status === 'Interested').length}
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white bg-opacity-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads(filteredLeads.map(l => l.id));
                          } else {
                            setSelectedLeads([]);
                          }
                        }}
                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Business Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Province</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Industry</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Research</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Calls</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        Loading leads...
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <span className="material-symbols-outlined text-gray-400 text-6xl mb-4 block">contact_page</span>
                        <p className="text-gray-500 font-medium">No leads found</p>
                        <p className="text-gray-400 text-sm mt-1">Import a CSV to get started</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white hover:bg-opacity-30 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads([...selectedLeads, lead.id]);
                              } else {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{lead.business_name}</div>
                          {lead.contact_name && (
                            <div className="text-sm text-gray-500">{lead.contact_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{lead.phone}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lead.province}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{lead.industry}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResearchStatusColor(lead.research_status)}`}>
                            {lead.research_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{lead.call_attempts}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {lead.research_status === 'Complete' ? (
                              <button
                                onClick={() => {
                                  setSelectedResearch(lead);
                                  setShowResearchModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Research"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTriggerResearch([lead.id])}
                                className="text-purple-600 hover:text-purple-900"
                                title="Trigger Research"
                              >
                                <span className="material-symbols-outlined text-sm">psychology</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Import Leads from CSV</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 glass-input rounded-lg"
              />
            </div>

            <div className="text-sm text-gray-600 mb-4">
              CSV should include: business_name, phone, email, website, city, province, industry
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="px-4 py-2 glass-card hover:shadow-lg transition-all text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={!importFile || importing}
                className="px-4 py-2 glass-card hover:shadow-lg transition-all text-blue-600 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Research Modal */}
      {showResearchModal && selectedResearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Research: {selectedResearch.business_name}
              </h3>
              <button
                onClick={() => setShowResearchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {selectedResearch.research_data ? (
              <div className="space-y-6">
                {/* Business Summary */}
                {selectedResearch.research_data.summary && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Executive Summary</h4>
                    <p className="text-gray-700">{selectedResearch.research_data.summary}</p>
                  </div>
                )}

                {/* Online Presence */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedResearch.research_data.googleRating && (
                    <div className="glass-card p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Google Rating</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedResearch.research_data.googleRating}
                        </span>
                        <span className="text-gray-600">
                          ({selectedResearch.research_data.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedResearch.research_data.website && (
                    <div className="glass-card p-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Website</h5>
                      <a
                        href={selectedResearch.research_data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {selectedResearch.research_data.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Pain Points */}
                {selectedResearch.research_data.painPoints && selectedResearch.research_data.painPoints.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Pain Points</h4>
                    <ul className="space-y-2">
                      {selectedResearch.research_data.painPoints.map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-red-500 text-sm mt-1">error</span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Automation Opportunities */}
                {selectedResearch.research_data.automationOpportunities &&
                 selectedResearch.research_data.automationOpportunities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Automation Opportunities</h4>
                    <div className="space-y-3">
                      {selectedResearch.research_data.automationOpportunities.map((opp: any, idx: number) => (
                        <div key={idx} className="glass-card p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-gray-900">{opp.name}</h5>
                            <span className={`px-2 py-1 rounded text-xs ${
                              opp.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              opp.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {opp.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{opp.description}</p>
                          <div className="text-sm">
                            <p className="text-gray-600 mb-1"><strong>Why:</strong> {opp.why}</p>
                            <p className="text-gray-600"><strong>Impact:</strong> {opp.estimatedImpact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Services */}
                {selectedResearch.research_data.recommendedServices &&
                 selectedResearch.research_data.recommendedServices.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommended Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResearch.research_data.recommendedServices.map((service: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 glass-card text-sm text-blue-600"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outreach Angle */}
                {selectedResearch.research_data.outreachAngle && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Outreach Angle</h4>
                    <p className="text-gray-700 italic">{selectedResearch.research_data.outreachAngle}</p>
                  </div>
                )}

                {/* Competitor Insights */}
                {selectedResearch.research_data.competitorInsights && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Competitor Insights</h4>
                    <div className="glass-card p-4">
                      {typeof selectedResearch.research_data.competitorInsights === 'string' ? (
                        <p className="text-gray-700">{selectedResearch.research_data.competitorInsights}</p>
                      ) : (
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedResearch.research_data.competitorInsights, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Competitors List */}
                {selectedResearch.research_data.competitors &&
                 selectedResearch.research_data.competitors.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Competitors ({selectedResearch.research_data.competitors.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedResearch.research_data.competitors.slice(0, 6).map((comp: any, idx: number) => (
                        <div key={idx} className="glass-card p-3">
                          <h5 className="font-semibold text-gray-900">{comp.name}</h5>
                          {comp.rating && (
                            <p className="text-sm text-gray-600">Rating: {comp.rating} ({comp.user_ratings_total || 0} reviews)</p>
                          )}
                          {comp.vicinity && (
                            <p className="text-xs text-gray-500">{comp.vicinity}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No research data available</p>
            )}
          </div>
        </div>
      )}

      {/* Campaign Selection Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Add {selectedLeads.length} Leads to Campaign
              </h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {loadingCampaigns ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <div className="text-gray-600">Loading campaigns...</div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-gray-400 text-6xl mb-4 block">campaign</span>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">No campaigns available</h4>
                <p className="text-gray-600 mb-4">Create a campaign first to add leads to it</p>
                <a
                  href="/voice-ai/campaigns"
                  className="px-6 py-3 glass-card hover:shadow-lg transition-all text-blue-700 font-medium inline-block"
                >
                  Go to Campaigns
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => handleAddToCampaign(campaign.id)}
                    className="w-full glass-card p-4 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                        campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">business_center</span>
                        {campaign.industry}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {campaign.provinces?.join(', ') || 'All'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
