'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadManager, Lead, SalesUser } from '@/lib/leads';

export default function CallLogPage() {
  const [currentUser, setCurrentUser] = useState<SalesUser | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const user = LeadManager.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // Load leads with call outcomes
    const allLeads = LeadManager.getLeads();
    const calledLeads = allLeads.filter(lead => lead.callOutcome && lead.lastCallDate);
    setLeads(calledLeads);
    setFilteredLeads(calledLeads);
  }, [router]);

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
      );
    }

    if (outcomeFilter !== 'All') {
      filtered = filtered.filter(lead => lead.callOutcome === outcomeFilter);
    }

    if (dateFilter !== 'All') {
      const now = new Date();
      let filterDate: Date;

      switch (dateFilter) {
        case 'Today':
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'This Week':
          filterDate = new Date(now);
          filterDate.setDate(now.getDate() - now.getDay());
          break;
        case 'This Month':
          filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          filterDate = new Date(0);
      }

      filtered = filtered.filter(lead => {
        if (!lead.lastCallDate) return false;
        const callDate = new Date(lead.lastCallDate);
        return callDate >= filterDate;
      });
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, outcomeFilter, dateFilter]);

  const handleLogout = () => {
    LeadManager.logout();
    router.push('/login');
  };

  const getCallOutcomeColor = (outcome: string) => {
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

  const outcomes = ['All', 'Booked Demo', 'Interested', 'Not Interested', 'Requested More Info', 'No Answer', 'Callback Requested'];
  const dateFilters = ['All', 'Today', 'This Week', 'This Month'];

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
            <p className="text-sm font-normal leading-normal text-blue-200">Call Log</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/dashboard">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-700 text-white" href="/call-log">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Call Log</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/my-progress">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>trending_up</span>
              <p className="text-sm font-medium leading-normal">My Progress</p>
            </a>
            {currentUser?.role === 'Admin' && (
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/users">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>people</span>
                <p className="text-sm font-medium leading-normal">Users</p>
              </a>
            )}
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
              <h1 className="text-3xl font-bold text-gray-900">Call Log</h1>
              <p className="text-sm text-gray-600 mt-1">View all your call activities and outcomes</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {outcomes.map(outcome => (
                <option key={outcome} value={outcome}>{outcome}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {dateFilters.map(filter => (
                <option key={filter} value={filter}>{filter}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-sm">call</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Booked Demos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.callOutcome === 'Booked Demo').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-600 text-sm">trending_up</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Interested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.callOutcome === 'Interested').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600 text-sm">close</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Not Interested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(lead => lead.callOutcome === 'Not Interested').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Log Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.company || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.lastCallDate ? new Date(lead.lastCallDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallOutcomeColor(lead.callOutcome || '')}`}>
                          {lead.callOutcome || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={lead.callNotes}>
                          {lead.callNotes || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-gray-400 text-2xl">call_made</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Calls Found</h3>
                <p className="text-gray-600">No calls match your current filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
