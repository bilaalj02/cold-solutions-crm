'use client'

import React, { useState, useEffect } from "react";
import { LeadManager, LeadActivity, Lead } from "../../../lib/leads";

export default function CallLog() {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<LeadActivity[]>([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const allActivities = LeadManager.getActivities();
    const allLeads = LeadManager.getLeads();
    
    // Sort activities by date (newest first)
    const sortedActivities = allActivities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setActivities(sortedActivities);
    setFilteredActivities(sortedActivities);
    setLeads(allLeads);
  }, []);

  useEffect(() => {
    let filtered = activities;

    if (typeFilter !== 'All') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    if (outcomeFilter !== 'All') {
      filtered = filtered.filter(activity => activity.outcome === outcomeFilter);
    }

    if (dateFilter !== 'All') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'Today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(activity => 
            new Date(activity.createdAt) >= filterDate
          );
          break;
        case 'This Week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          weekStart.setHours(0, 0, 0, 0);
          filtered = filtered.filter(activity => 
            new Date(activity.createdAt) >= weekStart
          );
          break;
        case 'This Month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered.filter(activity => 
            new Date(activity.createdAt) >= monthStart
          );
          break;
      }
    }

    setFilteredActivities(filtered);
  }, [activities, typeFilter, outcomeFilter, dateFilter]);

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Unknown Lead';
  };

  const getLeadCompany = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.company : 'Unknown Company';
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      case 'Neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Call': return 'call';
      case 'Email': return 'email';
      case 'Meeting': return 'event';
      case 'Note': return 'note';
      case 'Status Change': return 'swap_horiz';
      case 'Assignment': return 'person_add';
      default: return 'info';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getStats = () => {
    const callActivities = activities.filter(a => a.type === 'Call');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCalls = callActivities.filter(a => 
      new Date(a.createdAt) >= today
    );
    
    const totalDuration = callActivities.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDuration = callActivities.length > 0 ? totalDuration / callActivities.length : 0;
    
    const positiveCalls = callActivities.filter(call => call.outcome === 'Positive').length;
    const conversionRate = callActivities.length > 0 ? (positiveCalls / callActivities.length) * 100 : 0;

    return {
      totalCalls: callActivities.length,
      todayCalls: todayCalls.length,
      avgDuration: Math.round(avgDuration),
      conversionRate: Math.round(conversionRate)
    };
  };

  const stats = getStats();

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Call Log</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>list</span>
              <p className="text-sm font-medium leading-normal">Lead Lists</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/cold-caller/call-log">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Call Log</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller/my-progress">
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
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Call Log</h1>
              <p className="text-sm text-gray-600 mt-1">Track all your call activities and outcomes</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {stats.todayCalls}
                  </div>
                  <div className="text-xs text-gray-500">Calls Today</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {stats.totalCalls}
                  </div>
                  <div className="text-xs text-gray-500">Total Calls</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#10b981'}}>
                    {stats.conversionRate}%
                  </div>
                  <div className="text-xs text-gray-500">Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Call">Calls</option>
                <option value="Email">Emails</option>
                <option value="Meeting">Meetings</option>
                <option value="Note">Notes</option>
                <option value="Status Change">Status Changes</option>
                <option value="Assignment">Assignments</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Outcome:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
              >
                <option value="All">All Outcomes</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600">
                          {getTypeIcon(activity.type)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1" style={{color: '#0a2240'}}>
                          {getLeadName(activity.leadId)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {getLeadCompany(activity.leadId)}
                        </p>
                        <p className="text-sm text-gray-700 mb-3">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(activity.createdAt)}</span>
                          <span>by {activity.createdBy}</span>
                          {activity.duration && (
                            <span>Duration: {formatDuration(activity.duration)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {activity.type}
                      </span>
                      {activity.outcome && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(activity.outcome)}`}>
                          {activity.outcome}
                        </span>
                      )}
                    </div>
                  </div>

                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Additional Details:</p>
                      <div className="text-sm text-gray-700">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-400 text-2xl">call_end</span>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>No Activities Found</h3>
              <p className="text-gray-600">No activities match your current filter criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
