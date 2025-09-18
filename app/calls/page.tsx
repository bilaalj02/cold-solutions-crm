'use client'

import React, { useState, useEffect } from "react";
import StandardSidebar from "../components/StandardSidebar";
import { motion } from 'framer-motion';

interface CallLog {
  callId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone: string;
  leadCompany?: string;
  callOutcome: string;
  callNotes?: string;
  callerName: string;
  callDuration?: number;
  timestamp: string;
}

interface CallStats {
  today: {
    totalCalls: number;
    successful: number;
    unsuccessful: number;
    pending: number;
    callsByOutcome: Record<string, number>;
  };
  thisWeek: {
    totalCalls: number;
    callsByDay: Record<string, number>;
  };
}

export default function CallsDatabase() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callStats, setCallStats] = useState<CallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCalls, setTotalCalls] = useState(0);
  const callsPerPage = 10;

  // Fetch real call data
  const fetchCallData = async () => {
    try {
      setIsLoading(true);

      // Fetch call statistics
      const statsResponse = await fetch('/api/calls/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setCallStats(statsData);
      }

      // Fetch call logs with pagination
      const logsResponse = await fetch(`/api/calls/log?limit=${callsPerPage * currentPage}`);
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setCallLogs(logsData.calls || []);
        setTotalCalls(logsData.total || logsData.calls?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch call data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCallData();
  }, [currentPage]);

  // Helper function to get outcome badge color
  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case 'Booked Demo':
      case 'Interested':
        return 'bg-green-100 text-green-800';
      case 'Not Interested':
      case 'No Answer':
        return 'bg-red-100 text-red-800';
      case 'Callback Requested':
      case 'Follow Up Required':
        return 'bg-yellow-100 text-yellow-800';
      case 'Requested More Info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format call duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalCalls / callsPerPage);

  return (
    <div className="flex min-h-screen w-full group/design-root overflow-x-hidden bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Standardized Sidebar */}
      <StandardSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        <header className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Call Logs</h1>
              <p className="text-gray-600 mt-1">Track and manage all call activities from your sales team.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">call</span>
                  <span className="text-sm font-medium text-blue-700">
                    {callStats?.today.totalCalls || 0} calls today
                  </span>
                </div>
              </div>
              <button
                onClick={fetchCallData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600">refresh</span>
                <span className="text-sm font-medium text-gray-700">Refresh</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calls Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Calls This Week</p>
                  <p className="text-3xl font-bold mt-1" style={{color: '#0a2240'}}>
                    {isLoading ? (
                      <div className="animate-pulse h-9 bg-gray-200 rounded w-20"></div>
                    ) : (
                      callStats?.thisWeek.totalCalls || 0
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">Daily breakdown</p>
                  </div>
                </div>
              </div>

              {/* Weekly Call Chart */}
              <div className="grid grid-cols-7 gap-4 items-end mt-6 h-48">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const dayShort = day.substring(0, 3);
                  const callCount = callStats?.thisWeek.callsByDay?.[day] || 0;
                  const maxCalls = Math.max(...Object.values(callStats?.thisWeek.callsByDay || {}));
                  const height = maxCalls > 0 ? (callCount / maxCalls) * 100 : 0;
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

                  return (
                    <motion.div
                      key={day}
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t-md transition-all duration-300"
                        style={{
                          height: `${Math.max(height, 5)}%`,
                          backgroundColor: isToday ? '#3dbff2' : '#e1f5fe'
                        }}
                      ></div>
                      <p className={`text-xs font-medium ${isToday ? 'font-bold text-[#0a2240]' : 'text-gray-500'}`}>
                        {dayShort}
                      </p>
                      <p className="text-xs text-gray-400">{callCount}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Call Outcomes */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-4">Today's Call Outcomes</h3>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 mx-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  Object.entries(callStats?.today.callsByOutcome || {}).map(([outcome, count]) => {
                    const total = callStats?.today.totalCalls || 1;
                    const percentage = (count / total) * 100;

                    return (
                      <div key={outcome} className="flex items-center">
                        <p className="font-medium w-28 text-sm" style={{color: '#0a2240'}}>{outcome}</p>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="h-2.5 rounded-full"
                            style={{backgroundColor: '#3dbff2'}}
                          ></motion.div>
                        </div>
                        <p className="text-sm font-semibold ml-4" style={{color: '#0a2240'}}>{count}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Calls Table */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold" style={{color: '#0a2240'}}>Recent Calls</h3>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2]"></div>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Lead</th>
                      <th className="px-6 py-3 font-medium">Company</th>
                      <th className="px-6 py-3 font-medium">Caller</th>
                      <th className="px-6 py-3 font-medium">Date & Time</th>
                      <th className="px-6 py-3 font-medium">Duration</th>
                      <th className="px-6 py-3 font-medium text-center">Outcome</th>
                      <th className="px-6 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody style={{color: '#0a2240'}}>
                    {callLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-gray-300">call</span>
                            <p>No call logs found</p>
                            <p className="text-sm">Start making calls to see them appear here!</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      callLogs.map((call, index) => (
                        <motion.tr
                          key={call.callId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{call.leadName}</p>
                              <p className="text-xs text-gray-500">{call.leadPhone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{call.leadCompany || 'N/A'}</td>
                          <td className="px-6 py-4 font-medium">{call.callerName}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(call.timestamp)}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDuration(call.callDuration)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeBadgeColor(call.callOutcome)}`}>
                              {call.callOutcome}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                            {call.callNotes || 'No notes'}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
                <p>Showing {Math.min((currentPage - 1) * callsPerPage + 1, totalCalls)} to {Math.min(currentPage * callsPerPage, totalCalls)} of {totalCalls} results</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded-md ${
                          currentPage === pageNum
                            ? 'text-white bg-[#3dbff2] border-[#3dbff2]'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span>...</span>}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}