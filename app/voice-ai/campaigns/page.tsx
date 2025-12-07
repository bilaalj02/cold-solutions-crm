'use client'

import React, { useState, useEffect } from 'react';
import StandardSidebar from '../../../components/StandardSidebar';
import { Card } from '../../../components/ui/card';

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

export default function VoiceAICampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: 'Plumbing',
    provinces: [] as string[],
    daily_call_limit: 50,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/voice-ai/campaigns');
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await fetch('/api/voice-ai/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'Draft',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign created successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          industry: 'Plumbing',
          provinces: [],
          daily_call_limit: 50,
        });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const handleStartCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to start this campaign? Calls will begin immediately.')) return;

    try {
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign started successfully!');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to start campaign:', error);
      alert('Failed to start campaign');
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}/pause`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign paused successfully!');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Failed to pause campaign:', error);
      alert('Failed to pause campaign');
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/voice-ai/campaigns/${campaignId}/resume`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Campaign resumed successfully!');
        fetchCampaigns();
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

  const toggleProvince = (province: string) => {
    setFormData(prev => ({
      ...prev,
      provinces: prev.provinces.includes(province)
        ? prev.provinces.filter(p => p !== province)
        : [...prev.provinces, province]
    }));
  };

  return (
    <div className="flex min-h-screen">
      <StandardSidebar />

      <main className="flex-1 p-8 overflow-auto" style={{position: 'relative', zIndex: 1}}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice AI Campaigns</h1>
              <p className="text-gray-600">Create and manage calling campaigns</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-gray-900 font-medium"
            >
              <span className="material-symbols-outlined">add</span>
              Create Campaign
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Campaigns</span>
                <span className="material-symbols-outlined text-blue-600">campaign</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{campaigns.length}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Campaigns</span>
                <span className="material-symbols-outlined text-green-600">play_circle</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {campaigns.filter(c => c.status === 'Active').length}
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Calls Made</span>
                <span className="material-symbols-outlined text-blue-600">call</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {campaigns.reduce((sum, c) => sum + c.calls_made, 0)}
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Demos Booked</span>
                <span className="material-symbols-outlined text-purple-600">event_available</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {campaigns.reduce((sum, c) => sum + c.demos_booked, 0)}
              </div>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                <div className="text-gray-600">Loading campaigns...</div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <span className="material-symbols-outlined text-gray-400 text-6xl mb-4 block">campaign</span>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first campaign to start calling!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 glass-card hover:shadow-lg transition-all text-gray-900 font-medium"
                >
                  Create First Campaign
                </button>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="glass-card p-6">
                  {/* Campaign Header */}
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-gray-600">{campaign.description}</p>
                    )}
                  </div>

                  {/* Campaign Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-gray-400" style={{fontSize: '16px'}}>business_center</span>
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium text-gray-900">{campaign.industry}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-gray-400" style={{fontSize: '16px'}}>location_on</span>
                      <span className="text-gray-600">Provinces:</span>
                      <span className="font-medium text-gray-900">{campaign.provinces?.join(', ') || 'All'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-gray-400" style={{fontSize: '16px'}}>speed</span>
                      <span className="text-gray-600">Daily Limit:</span>
                      <span className="font-medium text-gray-900">{campaign.daily_call_limit} calls/day</span>
                    </div>
                  </div>

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-600">Leads</div>
                      <div className="text-lg font-bold text-gray-900">{campaign.total_leads}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Calls Made</div>
                      <div className="text-lg font-bold text-blue-600">{campaign.calls_made}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Completed</div>
                      <div className="text-lg font-bold text-green-600">{campaign.calls_completed}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Demos Booked</div>
                      <div className="text-lg font-bold text-purple-600">{campaign.demos_booked}</div>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  {campaign.calls_made > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Conversion Rate</span>
                        <span className="font-medium text-gray-900">{campaign.conversion_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${Math.min(campaign.conversion_rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {campaign.status === 'Draft' && (
                      <button
                        onClick={() => handleStartCampaign(campaign.id)}
                        className="flex-1 px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center justify-center gap-2 text-green-700 font-medium"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                        Start
                      </button>
                    )}
                    {campaign.status === 'Active' && (
                      <button
                        onClick={() => handlePauseCampaign(campaign.id)}
                        className="flex-1 px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center justify-center gap-2 text-yellow-700 font-medium"
                      >
                        <span className="material-symbols-outlined text-sm">pause</span>
                        Pause
                      </button>
                    )}
                    {campaign.status === 'Paused' && (
                      <button
                        onClick={() => handleResumeCampaign(campaign.id)}
                        className="flex-1 px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center justify-center gap-2 text-green-700 font-medium"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                        Resume
                      </button>
                    )}
                    <a
                      href={`/voice-ai/campaigns/${campaign.id}`}
                      className="flex-1 px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center justify-center gap-2 text-blue-700 font-medium"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      View
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h3>

            <div className="space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., BC Plumbers - Spring 2024"
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Campaign description..."
                  rows={3}
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Home Services">Home Services</option>
                  <option value="All">All Industries</option>
                </select>
              </div>

              {/* Provinces */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Provinces *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['BC', 'AB', 'ON', 'QC'].map((province) => (
                    <label key={province} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.provinces.includes(province)}
                        onChange={() => toggleProvince(province)}
                        className="rounded"
                      />
                      <span className="text-gray-900">{province}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Daily Call Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Call Limit
                </label>
                <input
                  type="number"
                  value={formData.daily_call_limit}
                  onChange={(e) => setFormData({ ...formData, daily_call_limit: parseInt(e.target.value) })}
                  min="1"
                  max="500"
                  className="w-full px-4 py-2 glass-input rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum calls per day (recommended: 50)</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: '',
                    description: '',
                    industry: 'Plumbing',
                    provinces: [],
                    daily_call_limit: 50,
                  });
                }}
                className="px-6 py-2 glass-card hover:shadow-lg transition-all text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={!formData.name || formData.provinces.length === 0}
                className="px-6 py-2 glass-card hover:shadow-lg transition-all text-blue-700 font-medium disabled:opacity-50"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
