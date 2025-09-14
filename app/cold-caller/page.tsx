'use client'

import React, { useState, useEffect } from "react";
import { LeadManager, Lead } from "../../lib/leads";

interface LeadList {
  id: string;
  name: string;
  description: string;
  territory: string;
  industry: string;
  assignedTo?: string;
  totalLeads: number;
  completedCalls: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Paused' | 'Completed';
  createdAt: string;
  deadline?: string;
}

export default function ColdCallerLeadList() {
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLists, setFilteredLists] = useState<LeadList[]>([]);
  const [territoryFilter, setTerritoryFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock lead lists data - in production this would come from the backend
  const defaultLeadLists: LeadList[] = [
    {
      id: '1',
      name: 'East Coast Technology Companies',
      description: 'Tech startups and established companies in NY, NJ, CT area',
      territory: 'East Coast',
      industry: 'Technology',
      assignedTo: 'John Smith',
      totalLeads: 150,
      completedCalls: 45,
      priority: 'High',
      status: 'Active',
      createdAt: '2024-01-15',
      deadline: '2024-02-15'
    },
    {
      id: '2',
      name: 'West Coast Healthcare Providers',
      description: 'Hospitals, clinics, and medical practices in CA, WA, OR',
      territory: 'West Coast',
      industry: 'Healthcare',
      assignedTo: 'Sarah Johnson',
      totalLeads: 120,
      completedCalls: 80,
      priority: 'Medium',
      status: 'Active',
      createdAt: '2024-01-10',
      deadline: '2024-02-10'
    },
    {
      id: '3',
      name: 'Midwest Manufacturing',
      description: 'Manufacturing companies in IL, MI, OH, IN',
      territory: 'Midwest',
      industry: 'Manufacturing',
      assignedTo: 'Mike Davis',
      totalLeads: 200,
      completedCalls: 35,
      priority: 'Medium',
      status: 'Active',
      createdAt: '2024-01-20',
      deadline: '2024-03-01'
    },
    {
      id: '4',
      name: 'Southeast Financial Services',
      description: 'Banks, credit unions, and financial advisors in FL, GA, NC, SC',
      territory: 'Southeast',
      industry: 'Finance',
      assignedTo: 'Lisa Chen',
      totalLeads: 180,
      completedCalls: 120,
      priority: 'High',
      status: 'Active',
      createdAt: '2024-01-12',
      deadline: '2024-02-20'
    },
    {
      id: '5',
      name: 'Texas Real Estate Agencies',
      description: 'Real estate agencies and property management companies in Texas',
      territory: 'Southwest',
      industry: 'Real Estate',
      assignedTo: 'David Wilson',
      totalLeads: 100,
      completedCalls: 85,
      priority: 'Low',
      status: 'Active',
      createdAt: '2024-01-08',
      deadline: '2024-02-08'
    },
    {
      id: '6',
      name: 'Northeast Retail Chains',
      description: 'Retail stores and chains in MA, NH, VT, ME',
      territory: 'Northeast',
      industry: 'Retail',
      totalLeads: 175,
      completedCalls: 175,
      priority: 'Medium',
      status: 'Completed',
      createdAt: '2023-12-15',
      deadline: '2024-01-15'
    }
  ];

  useEffect(() => {
    setLeadLists(defaultLeadLists);
    setFilteredLists(defaultLeadLists);
    setLeads(LeadManager.getLeads());
  }, []);

  useEffect(() => {
    let filtered = leadLists;

    if (territoryFilter !== 'All') {
      filtered = filtered.filter(list => list.territory === territoryFilter);
    }

    if (industryFilter !== 'All') {
      filtered = filtered.filter(list => list.industry === industryFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(list => list.status === statusFilter);
    }

    setFilteredLists(filtered);
  }, [leadLists, territoryFilter, industryFilter, statusFilter]);

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const territories = [...new Set(leadLists.map(list => list.territory))];
  const industries = [...new Set(leadLists.map(list => list.industry))];

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, \"Noto Sans\", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Cold Caller Dashboard</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/cold-caller">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>list</span>
              <p className="text-sm font-medium leading-normal">Cold Caller Lead Lists</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller/my-progress">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>trending_up</span>
              <p className="text-sm font-medium leading-normal">My Progress</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller/call-log">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Call Log</p>
            </a>
          </nav>
        </div>
        
        <div className="flex flex-col gap-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="#">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="#">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
            <p className="text-sm font-medium leading-normal">Logout</p>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Lead Lists</h1>
              <p className="text-sm text-gray-600 mt-1">Select a lead list to start making calls</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {filteredLists.reduce((acc, list) => acc + list.completedCalls, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Calls Today</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {filteredLists.filter(list => list.status === 'Active').length}
                  </div>
                  <div className="text-xs text-gray-500">Active Lists</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Territory:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="All">All Territories</option>
                {territories.map(territory => (
                  <option key={territory} value={territory}>{territory}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Industry:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                <option value="All">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Lead Lists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <div key={list.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{color: '#0a2240'}}>{list.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {list.territory}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {list.industry}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(list.priority)}`}>
                        {list.priority} Priority
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(list.status)}`}>
                        {list.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{list.completedCalls} of {list.totalLeads}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(list.completedCalls, list.totalLeads)}%`,
                          backgroundColor: '#3dbff2'
                        }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {getProgressPercentage(list.completedCalls, list.totalLeads)}% Complete
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div>Created: {list.createdAt}</div>
                    {list.deadline && <div>Deadline: {list.deadline}</div>}
                  </div>

                  {list.assignedTo && (
                    <div className="text-xs text-gray-600 mb-4">
                      Assigned to: <span className="font-medium">{list.assignedTo}</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <a 
                    href={`/cold-caller/list/${list.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      list.status === 'Active' 
                        ? 'text-white hover:opacity-90' 
                        : 'text-gray-500 bg-gray-100 cursor-not-allowed'
                    }`}
                    style={list.status === 'Active' ? {backgroundColor: '#3dbff2'} : {}}
                  >
                    <span className="material-symbols-outlined text-base">
                      {list.status === 'Completed' ? 'check_circle' : 'call'}
                    </span>
                    {list.status === 'Active' ? 'Start Calling' : 
                     list.status === 'Completed' ? 'Completed' : 'Paused'}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredLists.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-400 text-2xl">search_off</span>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>No Lead Lists Found</h3>
              <p className="text-gray-600">No lead lists match your current filter criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}