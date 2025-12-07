'use client'

import React, { useState, useEffect } from 'react';
import StandardSidebar from '../../../components/StandardSidebar';

interface AnalyticsData {
  total_calls: number;
  total_demos_booked: number;
  conversion_rate: number;
  avg_call_duration: number;
  calls_by_outcome: { outcome: string; count: number }[];
  calls_by_province: { province: string; count: number }[];
  calls_by_industry: { industry: string; count: number }[];
  calls_by_hour: { hour: number; count: number }[];
  daily_stats: { date: string; calls: number; demos: number }[];
  top_performing_campaigns: {
    campaign_name: string;
    calls_made: number;
    demos_booked: number;
    conversion_rate: number;
  }[];
}

export default function VoiceAIAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/voice-ai/analytics?days=${dateRange}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOutcomeColor = (outcome: string) => {
    const colors: Record<string, string> = {
      'Booked Demo': 'text-green-600',
      'Interested - Follow Up': 'text-blue-600',
      'Send Information': 'text-purple-600',
      'Not Interested': 'text-red-600',
      'No Answer': 'text-yellow-600',
      'Voicemail Left': 'text-gray-600',
    };
    return colors[outcome] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <StandardSidebar />
        <main className="flex-1 p-8 flex items-center justify-center" style={{position: 'relative', zIndex: 1}}>
          <div className="text-center">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <div className="text-gray-600">Loading analytics...</div>
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice AI Analytics</h1>
              <p className="text-gray-600">Performance insights and call metrics</p>
            </div>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 glass-input rounded-lg text-gray-900"
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Calls</span>
                <span className="material-symbols-outlined text-blue-600">call</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {analytics?.total_calls || 0}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Demos Booked</span>
                <span className="material-symbols-outlined text-green-600">event_available</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {analytics?.total_demos_booked || 0}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
                <span className="material-symbols-outlined text-purple-600">trending_up</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {analytics?.conversion_rate?.toFixed(1) || 0}%
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Duration</span>
                <span className="material-symbols-outlined text-blue-600">timer</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatDuration(analytics?.avg_call_duration || 0)}
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Calls by Outcome */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-gray-600">pie_chart</span>
                <h3 className="text-lg font-bold text-gray-900">Calls by Outcome</h3>
              </div>
              <div className="space-y-3">
                {analytics?.calls_by_outcome?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${getOutcomeColor(item.outcome)}`}>
                        circle
                      </span>
                      <span className="text-sm text-gray-700">{item.outcome}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calls by Province */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-gray-600">map</span>
                <h3 className="text-lg font-bold text-gray-900">Calls by Province</h3>
              </div>
              <div className="space-y-3">
                {analytics?.calls_by_province?.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">{item.province}</span>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${((item.count / (analytics?.total_calls || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Industry Performance */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600">business_center</span>
              <h3 className="text-lg font-bold text-gray-900">Performance by Industry</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics?.calls_by_industry?.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{item.industry}</div>
                  <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-xs text-gray-500 mt-1">calls made</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Campaigns */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600">campaign</span>
              <h3 className="text-lg font-bold text-gray-900">Top Performing Campaigns</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Campaign</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Calls Made</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Demos Booked</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics?.top_performing_campaigns?.map((campaign, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {campaign.campaign_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{campaign.calls_made}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        {campaign.demos_booked}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {campaign.conversion_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!analytics?.top_performing_campaigns || analytics.top_performing_campaigns.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No campaign data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Performance */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600">show_chart</span>
              <h3 className="text-lg font-bold text-gray-900">Daily Performance</h3>
            </div>
            <div className="space-y-2">
              {analytics?.daily_stats?.slice(-14).map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{new Date(stat.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-sm">call</span>
                      <span className="text-sm font-medium text-gray-900">{stat.calls} calls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600 text-sm">event_available</span>
                      <span className="text-sm font-medium text-green-600">{stat.demos} demos</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!analytics?.daily_stats || analytics.daily_stats.length === 0) && (
                <div className="text-center py-8 text-gray-500">No daily stats available</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
