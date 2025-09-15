'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LeadManager, Lead, LeadList, SalesUser } from '@/lib/leads';

export default function LeadListPage() {
  const [currentUser, setCurrentUser] = useState<SalesUser | null>(null);
  const [leadList, setLeadList] = useState<LeadList | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [tempCallOutcome, setTempCallOutcome] = useState<string>('');
  const [tempCallNotes, setTempCallNotes] = useState<string>('');
  const [showCallOutcomeModal, setShowCallOutcomeModal] = useState(false);
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [selectedCallOutcome, setSelectedCallOutcome] = useState<string>('');
  const [selectedCallNotes, setSelectedCallNotes] = useState<string>('');
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;

  useEffect(() => {
    // Check authentication
    const user = LeadManager.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // Get the specific lead list
    const leadLists = LeadManager.getLeadLists();
    const currentList = leadLists.find(list => list.id === listId);
    setLeadList(currentList || null);

    // Get leads for this list
    const allLeads = LeadManager.getLeads();
    const listLeads = allLeads.filter(lead => lead.leadListId === listId);
    setLeads(listLeads);
    setFilteredLeads(listLeads);
  }, [listId, router]);

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.position && lead.position.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm]);

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

  const handleCallButtonClick = (lead: Lead) => {
    setCallingLead(lead);
    setSelectedCallOutcome('');
    setSelectedCallNotes('');
    setShowCallOutcomeModal(true);
  };

  const handleCallOutcomeSubmit = () => {
    if (!callingLead || !selectedCallOutcome) return;

    const updatedLead = {
      ...callingLead,
      callOutcome: selectedCallOutcome as any,
      callNotes: selectedCallNotes,
      lastCallDate: new Date().toISOString().split('T')[0],
      lastInteraction: new Date().toISOString(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    // Update status based on outcome
    if (selectedCallOutcome === 'Booked Demo' || selectedCallOutcome === 'Interested') {
      updatedLead.status = 'Qualified';
    } else if (selectedCallOutcome === 'Not Interested') {
      updatedLead.status = 'Lost';
    } else {
      updatedLead.status = 'Contacted';
    }

    LeadManager.saveLead(updatedLead);

    // Update local state
    const updatedLeads = leads.map(lead => 
      lead.id === callingLead.id ? updatedLead : lead
    );
    setLeads(updatedLeads);

    // Close modal and reset
    setShowCallOutcomeModal(false);
    setCallingLead(null);
    setSelectedCallOutcome('');
    setSelectedCallNotes('');
  };

  const handleCallOutcomeCancel = () => {
    setShowCallOutcomeModal(false);
    setCallingLead(null);
    setSelectedCallOutcome('');
    setSelectedCallNotes('');
  };

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

  if (!leadList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-gray-400 text-2xl">error</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lead List Not Found</h3>
          <p className="text-sm text-gray-600">The requested lead list could not be found.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
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
            <p className="text-sm font-normal leading-normal text-blue-200">Lead List</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/dashboard">
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
              <h1 className="text-3xl font-bold text-gray-900">Lead List: {leadList.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{leadList.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leadList.status)}`}>
                {leadList.status}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(leadList.priority || 'Medium')}`}>
                {leadList.priority || 'Medium'} Priority
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Search and Stats */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Total: {leads.length}</span>
                <span>Filtered: {filteredLeads.length}</span>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-10">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 z-10">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.company || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.position || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.industry || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.territory || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.lastInteraction ? new Date(lead.lastInteraction).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={lead.notes}>
                          {lead.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.callOutcome ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallOutcomeColor(lead.callOutcome)}`}>
                            {lead.callOutcome}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={lead.callNotes}>
                          {lead.callNotes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCallButtonClick(lead)}
                            disabled={lead.status === 'Lost' || lead.status === 'Won'}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                              lead.status === 'Lost' || lead.status === 'Won'
                                ? 'text-gray-500 bg-gray-100 cursor-not-allowed'
                                : lead.callOutcome
                                ? 'text-green-700 bg-green-100 hover:bg-green-200'
                                : 'text-white bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {lead.callOutcome ? 'check_circle' : 'call'}
                            </span>
                            {lead.status === 'Lost' ? 'Lost' : lead.status === 'Won' ? 'Won' : lead.callOutcome ? 'Called' : 'Call'}
                          </button>
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
                  <span className="material-symbols-outlined text-gray-400 text-2xl">search_off</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Found</h3>
                <p className="text-gray-600">No leads match your current search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Call Outcome Modal */}
      {showCallOutcomeModal && callingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Call Outcome</h2>
              <button
                onClick={handleCallOutcomeCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">{callingLead.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{callingLead.company}</p>
                <p className="text-sm text-gray-600">{callingLead.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Outcome *</label>
                <select
                  value={selectedCallOutcome}
                  onChange={(e) => setSelectedCallOutcome(e.target.value)}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Select Outcome</option>
                  <option value="Booked Demo">Booked Demo</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Requested More Info">Requested More Info</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Callback Requested">Callback Requested</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes</label>
                <textarea
                  value={selectedCallNotes}
                  onChange={(e) => setSelectedCallNotes(e.target.value)}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  rows={3}
                  placeholder="Add notes about the call..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCallOutcomeCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCallOutcomeSubmit}
                  disabled={!selectedCallOutcome}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
