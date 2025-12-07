'use client'

import React, { useState, useEffect } from 'react';
import StandardSidebar from '../../../components/StandardSidebar';
import { Card } from '../../../components/ui/card';

interface CallLog {
  id: string;
  lead_id: string;
  retell_call_id: string;
  call_status: string;
  call_outcome?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  transcript?: string;
  summary?: string;
  recording_url?: string;
  sentiment?: string;
  interest_level?: string;
  pain_points_mentioned?: string[];
  objections_raised?: string[];
  next_steps?: string;
  lead?: {
    business_name: string;
    phone: string;
    province: string;
    industry: string;
  };
}

export default function VoiceAICallLogsPage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchCallLogs();
  }, [filterOutcome, filterDate]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterOutcome) params.append('outcome', filterOutcome);
      if (filterDate) params.append('start_date', filterDate);

      const response = await fetch(`/api/voice-ai/call-logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setCallLogs(data.call_logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch call logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallDetails = async (callId: string) => {
    try {
      const response = await fetch(`/api/voice-ai/call-logs/${callId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedCall({ ...data.call_log, lead: data.lead });
      }
    } catch (error) {
      console.error('Failed to fetch call details:', error);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return 'bg-gray-100 text-gray-800';

    const badges: Record<string, string> = {
      'Booked Demo': 'bg-green-100 text-green-800',
      'Interested - Follow Up': 'bg-blue-100 text-blue-800',
      'Send Information': 'bg-purple-100 text-purple-800',
      'Not Interested': 'bg-red-100 text-red-800',
      'No Answer': 'bg-yellow-100 text-yellow-800',
      'Voicemail Left': 'bg-gray-100 text-gray-800',
    };
    return badges[outcome] || 'bg-gray-100 text-gray-800';
  };

  const getSentimentIcon = (sentiment?: string) => {
    const icons: Record<string, string> = {
      'positive': 'sentiment_satisfied',
      'neutral': 'sentiment_neutral',
      'negative': 'sentiment_dissatisfied',
    };
    return icons[sentiment || ''] || 'help';
  };

  const getSentimentColor = (sentiment?: string) => {
    const colors: Record<string, string> = {
      'positive': 'text-green-600',
      'neutral': 'text-gray-600',
      'negative': 'text-red-600',
    };
    return colors[sentiment || ''] || 'text-gray-600';
  };

  const getInterestBadge = (level?: string) => {
    const badges: Record<string, string> = {
      'Hot': 'bg-red-100 text-red-800',
      'Warm': 'bg-orange-100 text-orange-800',
      'Cold': 'bg-blue-100 text-blue-800',
      'None': 'bg-gray-100 text-gray-800',
    };
    return badges[level || 'None'] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex min-h-screen">
      <StandardSidebar />

      <main className="flex-1 p-8 overflow-auto" style={{position: 'relative', zIndex: 1}}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Logs</h1>
            <p className="text-gray-600">View call history, transcripts, and outcomes</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="px-4 py-2 glass-input rounded-lg text-gray-900"
            >
              <option value="">All Outcomes</option>
              <option value="Booked Demo">Booked Demo</option>
              <option value="Interested - Follow Up">Interested - Follow Up</option>
              <option value="Send Information">Send Information</option>
              <option value="Not Interested">Not Interested</option>
              <option value="No Answer">No Answer</option>
              <option value="Voicemail Left">Voicemail Left</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 glass-input rounded-lg text-gray-900"
            />

            <button
              onClick={() => {
                setFilterOutcome('');
                setFilterDate('');
              }}
              className="px-4 py-2 glass-card hover:shadow-lg transition-all text-gray-900 font-medium"
            >
              Clear Filters
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Calls</span>
                <span className="material-symbols-outlined text-blue-600">call</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{callLogs.length}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Demos Booked</span>
                <span className="material-symbols-outlined text-green-600">event_available</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {callLogs.filter(c => c.call_outcome === 'Booked Demo').length}
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Duration</span>
                <span className="material-symbols-outlined text-blue-600">timer</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatDuration(Math.round(
                  callLogs.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / callLogs.length || 0
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                <span className="material-symbols-outlined text-purple-600">check_circle</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {callLogs.length > 0
                  ? Math.round((callLogs.filter(c => c.call_status === 'completed').length / callLogs.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>

          {/* Call Logs Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date/Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Business</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Outcome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Interest</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Sentiment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        Loading call logs...
                      </td>
                    </tr>
                  ) : callLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No call logs found
                      </td>
                    </tr>
                  ) : (
                    callLogs.map((call) => (
                      <tr key={call.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTime(call.started_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{call.lead?.business_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{call.lead?.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDuration(call.duration_seconds)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeBadge(call.call_outcome)}`}>
                            {call.call_outcome || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInterestBadge(call.interest_level)}`}>
                            {call.interest_level || 'None'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className={`material-symbols-outlined ${getSentimentColor(call.sentiment)}`} style={{fontSize: '20px'}}>
                              {getSentimentIcon(call.sentiment)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => fetchCallDetails(call.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            <span className="text-sm">View</span>
                          </button>
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

      {/* Call Details Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 glass-card border-b border-gray-200 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedCall.lead?.business_name}</h3>
                <p className="text-sm text-gray-600 mt-1">Call ID: {selectedCall.retell_call_id}</p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Call Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="font-medium text-gray-900">{selectedCall.lead?.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Province</div>
                  <div className="font-medium text-gray-900">{selectedCall.lead?.province}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Industry</div>
                  <div className="font-medium text-gray-900">{selectedCall.lead?.industry}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="font-medium text-gray-900">{formatDuration(selectedCall.duration_seconds)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Started</div>
                  <div className="font-medium text-gray-900">{formatDateTime(selectedCall.started_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Outcome</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeBadge(selectedCall.call_outcome)}`}>
                    {selectedCall.call_outcome}
                  </span>
                </div>
              </div>

              {/* Summary */}
              {selectedCall.summary && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Summary</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg">{selectedCall.summary}</p>
                </div>
              )}

              {/* Sentiment & Interest */}
              <div className="grid grid-cols-2 gap-4">
                {selectedCall.sentiment && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Sentiment</div>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined ${getSentimentColor(selectedCall.sentiment)}`}>
                        {getSentimentIcon(selectedCall.sentiment)}
                      </span>
                      <span className="font-medium capitalize">{selectedCall.sentiment}</span>
                    </div>
                  </div>
                )}
                {selectedCall.interest_level && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Interest Level</div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInterestBadge(selectedCall.interest_level)}`}>
                      {selectedCall.interest_level}
                    </span>
                  </div>
                )}
              </div>

              {/* Pain Points */}
              {selectedCall.pain_points_mentioned && selectedCall.pain_points_mentioned.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Pain Points Mentioned</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCall.pain_points_mentioned.map((point, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Objections */}
              {selectedCall.objections_raised && selectedCall.objections_raised.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Objections Raised</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedCall.objections_raised.map((objection, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{objection}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {selectedCall.next_steps && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Next Steps</h4>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-lg">{selectedCall.next_steps}</p>
                </div>
              )}

              {/* Transcript */}
              {selectedCall.transcript && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Full Transcript</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{selectedCall.transcript}</pre>
                  </div>
                </div>
              )}

              {/* Recording */}
              {selectedCall.recording_url && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Call Recording</h4>
                  <audio controls className="w-full">
                    <source src={selectedCall.recording_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 glass-card border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-6 py-2 glass-card hover:shadow-lg transition-all text-gray-900 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
