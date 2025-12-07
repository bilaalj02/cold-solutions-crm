'use client'

import React, { useState, useEffect } from 'react';
import StandardSidebar from '../../../components/StandardSidebar';
import { Card } from '../../../components/ui/card';

interface QueueItem {
  id: string;
  business_name: string;
  phone: string;
  province: string;
  industry: string;
  campaign_name?: string;
  status: string;
  scheduled_for: string;
  attempt_number: number;
}

interface QueueStatus {
  queued: number;
  calling: number;
  completed: number;
  failed: number;
}

export default function VoiceAIQueuePage() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    queued: 0,
    calling: 0,
    completed: 0,
    failed: 0,
  });
  const [activeQueue, setActiveQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchQueue();

    // Auto-refresh every 5 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchQueue, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/voice-ai/queue');
      const data = await response.json();

      if (data.success) {
        setQueueStatus(data.status);
        setActiveQueue(data.active_queue || []);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      'Queued': 'schedule',
      'Calling': 'call',
      'Complete': 'check_circle',
      'Failed': 'error',
    };
    return icons[status] || 'help';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Queued': 'text-blue-600',
      'Calling': 'text-purple-600 animate-pulse',
      'Complete': 'text-green-600',
      'Failed': 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const totalInQueue = queueStatus.queued + queueStatus.calling;
  const progressPercentage = queueStatus.completed > 0
    ? (queueStatus.completed / (queueStatus.completed + queueStatus.failed + totalInQueue)) * 100
    : 0;

  return (
    <div className="flex min-h-screen">
      <StandardSidebar />

      <main className="flex-1 p-8 overflow-auto" style={{position: 'relative', zIndex: 1}}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Queue Monitor</h1>
              <p className="text-gray-600">Real-time monitoring of active calls</p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Auto-refresh (5s)</span>
              </label>

              <button
                onClick={fetchQueue}
                className="px-4 py-2 glass-card hover:shadow-lg transition-all flex items-center gap-2 text-gray-900 font-medium"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>
          </div>

          {/* Queue Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Queued</span>
                <span className="material-symbols-outlined text-blue-600">schedule</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{queueStatus.queued}</div>
              <div className="text-xs text-gray-500 mt-1">Waiting to be called</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Calling Now</span>
                <span className="material-symbols-outlined animate-pulse text-purple-600">call</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{queueStatus.calling}</div>
              <div className="text-xs text-gray-500 mt-1">Active calls in progress</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Completed</span>
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{queueStatus.completed}</div>
              <div className="text-xs text-gray-500 mt-1">Successfully completed</div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Failed</span>
                <span className="material-symbols-outlined text-red-600">error</span>
              </div>
              <div className="text-3xl font-bold text-red-600">{queueStatus.failed}</div>
              <div className="text-xs text-gray-500 mt-1">Failed or skipped</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="glass-card p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <span className="text-sm text-gray-600">
                {queueStatus.completed} / {queueStatus.completed + queueStatus.failed + totalInQueue} calls
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {progressPercentage.toFixed(1)}% complete
            </div>
          </div>

          {/* Active Queue */}
          <div className="glass-card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">list</span>
                <h3 className="text-xl font-bold text-gray-900">Active Queue</h3>
                {queueStatus.calling > 0 && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full animate-pulse">
                    {queueStatus.calling} calling now
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                  <div className="text-gray-600">Loading queue...</div>
                </div>
              ) : activeQueue.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-gray-400 text-6xl mb-4 block">call</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Queue is Empty</h3>
                  <p className="text-gray-600">No calls currently queued or in progress</p>
                  <p className="text-sm text-gray-500 mt-2">Start a campaign to begin calling</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Business</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Province</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Industry</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Campaign</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Scheduled</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Attempt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${getStatusColor(item.status)}`} style={{fontSize: '20px'}}>
                              {getStatusIcon(item.status)}
                            </span>
                            <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.business_name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.phone}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.province}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.industry}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.campaign_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>{formatDate(item.scheduled_for)}</div>
                          <div className="text-xs text-gray-400">{formatTime(item.scheduled_for)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            #{item.attempt_number}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {activeQueue.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center">
                Showing next {activeQueue.length} calls in queue
              </div>
            )}
          </div>

          {/* Real-time Indicator */}
          {autoRefresh && (
            <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates every 5 seconds</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
