'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadManager, Lead, LeadList, SalesUser } from '@/lib/leads';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<SalesUser | null>(null);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLists, setFilteredLists] = useState<LeadList[]>([]);
  const [industryFilter, setIndustryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const user = LeadManager.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // Load lead lists and leads
    const allLeads = LeadManager.getLeads();
    const allLeadLists = LeadManager.getLeadLists();
    
    setLeads(allLeads);
    setLeadLists(allLeadLists);
    setFilteredLists(allLeadLists);
  }, [router]);

  useEffect(() => {
    let filtered = leadLists;

    if (industryFilter !== 'All') {
      filtered = filtered.filter(list => list.industry === industryFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(list => list.status === statusFilter);
    }

    setFilteredLists(filtered);
  }, [leadLists, industryFilter, statusFilter]);

  const handleLogout = () => {
    LeadManager.logout();
    router.push('/login');
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
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const industries = [...new Set(leadLists.map(list => list.industry).filter(Boolean))];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-gray-400 text-2xl animate-spin">refresh</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-sm text-gray-600">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4 bg-blue-600">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Caller</h1>
            <p className="text-sm font-normal leading-normal text-blue-200">Dashboard</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-700 text-white" href="/dashboard">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/call-log">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Call Log</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/my-progress">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>trending_up</span>
              <p className="text-sm font-medium leading-normal">My Progress</p>
            </a>
          </nav>
        </div>
        
        <div className="p-4 border-t border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">person</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-blue-200">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-gray-50">
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lead Lists</h1>
              <p className="text-sm text-gray-600 mt-1">Select a lead list to start making calls</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="All">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Lead Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <div key={list.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.name}</h3>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(list.priority || 'Medium')}`}>
                      {list.priority || 'Medium'} Priority
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
                    <span className="text-sm text-gray-600">0 of {list.leadCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                      style={{ width: `${getProgressPercentage(0, list.leadCount)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {getProgressPercentage(0, list.leadCount)}% Complete
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div>Created: {list.createdAt}</div>
                  <div>Updated: {list.updatedAt}</div>
                </div>

                {/* Action Button */}
                <div className="space-y-2">
                  <a 
                    href={`/list/${list.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">phone</span>
                    Start Calling
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredLists.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-400 text-2xl">list</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lead Lists Found</h3>
              <p className="text-gray-600">No lead lists match your current filter criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
