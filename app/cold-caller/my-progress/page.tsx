'use client';

import { useState, useEffect } from 'react';
import { LeadManager } from '../../../lib/leads';

interface CallerPerformance {
  callerId: string;
  totalLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  callsToday: number;
  callsThisWeek: number;
  callsThisMonth: number;
  contactRate: number;
  qualificationRate: number;
  winRate: number;
}

interface CallAnalytics {
  totalCalls: number;
  callsByOutcome: Record<string, number>;
  callsByStatus: Record<string, number>;
  callsByDay: Record<string, number>;
  timePeriod: string;
  startDate: string;
  endDate: string;
}

export default function MyProgressPage() {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedCaller, setSelectedCaller] = useState<string>('all');
  const [callerPerformance, setCallerPerformance] = useState<CallerPerformance[]>([]);
  const [callAnalytics, setCallAnalytics] = useState<CallAnalytics | null>(null);
  const [availableCallers, setAvailableCallers] = useState<string[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimePeriod, selectedCaller]);

  const loadAnalytics = () => {
    // Get all callers performance
    const performance = LeadManager.getAllCallersPerformance();
    setCallerPerformance(performance);
    
    // Get available callers
    const callers = ['all', ...performance.map(p => p.callerId)];
    setAvailableCallers(callers);

    // Get call analytics
    const analytics = LeadManager.getCallAnalytics(
      selectedTimePeriod, 
      selectedCaller === 'all' ? undefined : selectedCaller
    );
    setCallAnalytics(analytics);
  };

  const getTimePeriodLabel = (period: string) => {
    switch (period) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return period;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Booked Demo': return 'bg-blue-100 text-blue-800';
      case 'Interested': return 'bg-green-100 text-green-800';
      case 'Not Interested': return 'bg-red-100 text-red-800';
      case 'Requested More Info': return 'bg-yellow-100 text-yellow-800';
      case 'No Answer': return 'bg-orange-100 text-orange-800';
      case 'Callback Requested': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-gray-100 text-gray-800';
      case 'Contacted': return 'bg-blue-100 text-blue-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Proposal': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Won': return 'bg-emerald-100 text-emerald-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Call Analytics</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>list</span>
              <p className="text-sm font-medium leading-normal">Lead Lists</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller/call-log">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Call Log</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/cold-caller/my-progress">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>trending_up</span>
              <p className="text-sm font-medium leading-normal">My Progress</p>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Call Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">Track caller performance and call outcomes</p>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedTimePeriod}
                onChange={(e) => setSelectedTimePeriod(e.target.value as any)}
                className="rounded-md border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <select
                value={selectedCaller}
                onChange={(e) => setSelectedCaller(e.target.value)}
                className="rounded-md border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
              >
                <option value="all">All Callers</option>
                {availableCallers.filter(c => c !== 'all').map(callerId => (
                  <option key={callerId} value={callerId}>
                    Caller {callerId.slice(-4)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-lg">call</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {callAnalytics?.totalCalls || 0}
                  </p>
                  <p className="text-xs text-gray-500">{getTimePeriodLabel(selectedTimePeriod)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {callAnalytics?.callsByStatus.Qualified || 0}
                  </p>
                  <p className="text-xs text-gray-500">This period</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-600 text-lg">schedule</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Booked Demos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {callAnalytics?.callsByOutcome['Booked Demo'] || 0}
                  </p>
                  <p className="text-xs text-gray-500">This period</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 text-lg">trending_up</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {callAnalytics?.totalCalls ? 
                      Math.round(((callAnalytics.callsByOutcome['Booked Demo'] || 0) + (callAnalytics.callsByOutcome['Interested'] || 0)) / callAnalytics.totalCalls * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Positive outcomes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Call Outcomes Chart */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Call Outcomes</h3>
                <p className="text-sm text-gray-600">{getTimePeriodLabel(selectedTimePeriod)}</p>
              </div>
              <div className="p-6">
                {callAnalytics && Object.keys(callAnalytics.callsByOutcome).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(callAnalytics.callsByOutcome).map(([outcome, count]) => (
                      <div key={outcome} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(outcome)}`}>
                            {outcome}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <div className="ml-4 w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#3dbff2] h-2 rounded-full" 
                              style={{ width: `${callAnalytics.totalCalls > 0 ? (count / callAnalytics.totalCalls) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-gray-400 text-4xl">bar_chart</span>
                    <p className="mt-2 text-sm text-gray-500">No call data for this period</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Status Chart */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lead Status</h3>
                <p className="text-sm text-gray-600">{getTimePeriodLabel(selectedTimePeriod)}</p>
              </div>
              <div className="p-6">
                {callAnalytics && Object.keys(callAnalytics.callsByStatus).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(callAnalytics.callsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <div className="ml-4 w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#3dbff2] h-2 rounded-full" 
                              style={{ width: `${callAnalytics.totalCalls > 0 ? (count / callAnalytics.totalCalls) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-gray-400 text-4xl">pie_chart</span>
                    <p className="mt-2 text-sm text-gray-500">No status data for this period</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Caller Performance Table */}
          {selectedCaller === 'all' && (
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Caller Performance</h3>
                <p className="text-sm text-gray-600">Individual caller statistics</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls Today</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls This Week</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls This Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {callerPerformance.map((perf) => (
                      <tr key={perf.callerId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Caller {perf.callerId.slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.totalLeads}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.callsToday}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.callsThisWeek}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.callsThisMonth}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.contactRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.qualificationRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {perf.winRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}