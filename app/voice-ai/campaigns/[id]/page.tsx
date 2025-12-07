'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StandardSidebar from '../../../../components/StandardSidebar';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  industry: string;
  provinces: string[];
  status: string;
  daily_call_limit: number;
  total_leads: number;
  calls_made: number;
  calls_completed: number;
  demos_booked: number;
  conversion_rate: number;
  created_at: string;
}

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
  call_attempts: number;
  last_call_at?: string;
  created_at: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
    fetchCampaignLeads();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}`);
      const data = await response.json();

      if (data.success) {
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignLeads = async () => {
    try {
      setLeadsLoading(true);
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}/leads`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaign leads:', error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleStartCampaign = async () => {
    if (!confirm('Are you sure you want to start this campaign? Calls will begin immediately.')) return;

    try {
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign started successfully!');
        fetchCampaign();
      }
    } catch (error) {
      console.error('Failed to start campaign:', error);
      alert('Failed to start campaign');
    }
  };

  const handlePauseCampaign = async () => {
    try {
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}/pause`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign paused successfully!');
        fetchCampaign();
      }
    } catch (error) {
      console.error('Failed to pause campaign:', error);
      alert('Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async () => {
    try {
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}/resume`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign resumed successfully!');
        fetchCampaign();
      }
    } catch (error) {
      console.error('Failed to resume campaign:', error);
      alert('Failed to resume campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Active': 'bg-green-100 text-green-800',
      'Paused': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Archived': 'bg-gray-100 text-gray-600',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getLeadStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <StandardSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen">
        <StandardSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h2>
            <button
              onClick={() => router.push('/voice-ai/campaigns')}
              className="px-6 py-3 glass-card hover:shadow-lg transition-all text-blue-700 font-medium"
            >
              Back to Campaigns
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <StandardSidebar />

      <main className="flex-1 p-8 overflow-auto" style={{position: 'relative', zIndex: 1}}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push('/voice-ai/campaigns')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              {campaign.description && (
                <p className="text-gray-600 ml-12">{campaign.description}</p>
              )}
            </div>

            {/* Campaign Actions */}
            <div className="flex gap-3">
              {campaign.status === 'Draft' && (
                <button
                  onClick={handleStartCampaign}
                  className="px-6 py-3 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-green-700 font-medium"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Start Campaign
                </button>
              )}
              {campaign.status === 'Active' && (
                <button
                  onClick={handlePauseCampaign}
                  className="px-6 py-3 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-yellow-700 font-medium"
                >
                  <span className="material-symbols-outlined">pause</span>
                  Pause Campaign
                </button>
              )}
              {campaign.status === 'Paused' && (
                <button
                  onClick={handleResumeCampaign}
                  className="px-6 py-3 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-green-700 font-medium"
                >
                  <span className="material-symbols-outlined">play_arrow</span>
                  Resume Campaign
                </button>
              )}
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Leads</span>
                <span className="material-symbols-outlined text-blue-600">groups</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{campaign.total_leads}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Calls Made</span>
                <span className="material-symbols-outlined text-blue-600">call</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{campaign.calls_made}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Completed</span>
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{campaign.calls_completed}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Demos Booked</span>
                <span className="material-symbols-outlined text-purple-600">event_available</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{campaign.demos_booked}</div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">Industry</span>
                <p className="font-medium text-gray-900">{campaign.industry}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Provinces</span>
                <p className="font-medium text-gray-900">{campaign.provinces?.join(', ') || 'All'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Daily Call Limit</span>
                <p className="font-medium text-gray-900">{campaign.daily_call_limit} calls/day</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <p className="font-medium text-gray-900">{campaign.conversion_rate}%</p>
              </div>
            </div>
          </div>

          {/* Campaign Leads */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Campaign Leads ({leads.length})
            </h3>

            {leadsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <div className="text-gray-600">Loading leads...</div>
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-gray-400 text-6xl mb-4 block">group_off</span>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">No leads assigned yet</h4>
                <p className="text-gray-600 mb-4">Add leads to this campaign from the Leads page</p>
                <button
                  onClick={() => router.push('/voice-ai/leads')}
                  className="px-6 py-3 glass-card hover:shadow-lg transition-all text-blue-700 font-medium"
                >
                  Go to Leads
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Business</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Research</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{lead.business_name}</div>
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              {lead.website}
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{lead.contact_name || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{lead.phone}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.city}, {lead.province}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeadStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.research_status === 'Complete' ? 'bg-green-100 text-green-800' :
                            lead.research_status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            lead.research_status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.research_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{lead.call_attempts}</td>
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
