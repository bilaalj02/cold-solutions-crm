'use client'

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeadManager, Lead } from "../../../../lib/leads";

interface CallResult {
  leadId: string;
  result: 'answered' | 'voicemail' | 'no-answer' | 'busy' | 'interested' | 'not-interested' | 'callback';
  notes: string;
  duration?: number;
  scheduledCallback?: string;
}

export default function ColdCallerListDetail() {
  const params = useParams();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [listInfo, setListInfo] = useState<any>(null);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [callResults, setCallResults] = useState<Record<string, CallResult>>({});
  const [showCallModal, setShowCallModal] = useState(false);
  const [currentCall, setCurrentCall] = useState<Partial<CallResult>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // Mock list information based on ID
  const getListInfo = (id: string) => {
    const lists = {
      '1': {
        name: 'East Coast Technology Companies',
        description: 'Tech startups and established companies in NY, NJ, CT area',
        territory: 'East Coast',
        industry: 'Technology'
      },
      '2': {
        name: 'West Coast Healthcare Providers', 
        description: 'Hospitals, clinics, and medical practices in CA, WA, OR',
        territory: 'West Coast',
        industry: 'Healthcare'
      },
      '3': {
        name: 'Midwest Manufacturing',
        description: 'Manufacturing companies in IL, MI, OH, IN',
        territory: 'Midwest',
        industry: 'Manufacturing'
      }
    };
    return lists[id as keyof typeof lists] || lists['1'];
  };

  useEffect(() => {
    if (params?.id) {
      setListInfo(getListInfo(params.id as string));
      
      // Get leads and simulate filtering for the specific list
      const allLeads = LeadManager.getLeads().filter(lead => !lead.isDuplicate);
      
      // Simulate different lead sets for different lists
      let listLeads: Lead[] = [];
      const listId = params.id as string;
      
      if (listId === '1') {
        listLeads = allLeads.filter(lead => 
          lead.industry === 'Technology' && 
          (lead.territory === 'East Coast' || !lead.territory)
        ).slice(0, 150);
      } else if (listId === '2') {
        listLeads = allLeads.filter(lead => 
          lead.industry === 'Healthcare' && 
          (lead.territory === 'West Coast' || !lead.territory)
        ).slice(0, 120);
      } else {
        listLeads = allLeads.slice(0, 100);
      }

      // Generate additional mock leads if we don't have enough
      while (listLeads.length < 100) {
        const baseLead = allLeads[listLeads.length % allLeads.length];
        const mockLead: Lead = {
          ...baseLead,
          id: `mock_${listLeads.length}`,
          name: `${baseLead.name} ${Math.floor(Math.random() * 1000)}`,
          email: `lead${listLeads.length}@example${Math.floor(Math.random() * 10)}.com`,
          phone: `555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          company: `${baseLead.company} ${Math.floor(Math.random() * 100)}`,
        };
        listLeads.push(mockLead);
      }

      setLeads(listLeads);
      setFilteredLeads(listLeads);
    }
  }, [params?.id]);

  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Called') {
        filtered = filtered.filter(lead => callResults[lead.id]);
      } else if (statusFilter === 'Not Called') {
        filtered = filtered.filter(lead => !callResults[lead.id]);
      }
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, callResults]);

  const handleCallLead = (lead: Lead) => {
    setCurrentCall({
      leadId: lead.id,
      result: undefined,
      notes: '',
      duration: 0
    });
    setShowCallModal(true);
  };

  const handleSaveCall = () => {
    if (!currentCall.leadId || !currentCall.result) {
      alert('Please select a call result');
      return;
    }

    const callResult: CallResult = {
      leadId: currentCall.leadId!,
      result: currentCall.result!,
      notes: currentCall.notes || '',
      duration: currentCall.duration,
      scheduledCallback: currentCall.scheduledCallback
    };

    setCallResults(prev => ({
      ...prev,
      [currentCall.leadId!]: callResult
    }));

    // Add activity to the lead
    const activity = {
      id: LeadManager.generateId(),
      leadId: currentCall.leadId!,
      type: 'Call' as const,
      description: `Cold call result: ${currentCall.result}${currentCall.notes ? ` - ${currentCall.notes}` : ''}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Cold Caller',
      duration: currentCall.duration,
      outcome: currentCall.result === 'interested' ? 'Positive' as const : 
               currentCall.result === 'not-interested' ? 'Negative' as const : 'Neutral' as const
    };

    LeadManager.addActivity(activity);

    setShowCallModal(false);
    setCurrentCall({});
  };

  const getCallStatusColor = (result?: string) => {
    switch (result) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'interested': return 'bg-emerald-100 text-emerald-800';
      case 'voicemail': return 'bg-yellow-100 text-yellow-800';
      case 'no-answer': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-orange-100 text-orange-800';
      case 'not-interested': return 'bg-red-100 text-red-800';
      case 'callback': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getCallStatusText = (result?: string) => {
    switch (result) {
      case 'answered': return 'Answered';
      case 'interested': return 'Interested';
      case 'voicemail': return 'Voicemail';
      case 'no-answer': return 'No Answer';
      case 'busy': return 'Busy';
      case 'not-interested': return 'Not Interested';
      case 'callback': return 'Callback Scheduled';
      default: return 'Not Called';
    }
  };

  const completedCalls = Object.keys(callResults).length;
  const progressPercentage = Math.round((completedCalls / leads.length) * 100);

  if (!listInfo) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

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
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>list</span>
              <p className="text-sm font-medium leading-normal">Cold Caller Lead Lists</p>
            </a>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}}>
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Calling Session</p>
            </div>
          </nav>
        </div>
        
        {/* Progress Panel */}
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium mb-3">Session Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Calls Made</span>
                <span>{completedCalls} / {leads.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{width: `${progressPercentage}%`, backgroundColor: '#3dbff2'}}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-green-300">
                  {Object.values(callResults).filter(r => r.result === 'interested').length}
                </div>
                <div>Interested</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-300">
                  {Object.values(callResults).filter(r => r.result === 'callback').length}
                </div>
                <div>Callbacks</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="#">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/cold-caller')}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#3dbff2]"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back to Lists
              </button>
              <div>
                <h1 className="text-2xl font-bold" style={{color: '#0a2240'}}>{listInfo.name}</h1>
                <p className="text-sm text-gray-600">{listInfo.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-[#3dbff2] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="material-symbols-outlined">view_list</span>
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-[#3dbff2] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="material-symbols-outlined">view_module</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="p-6 bg-white border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-symbols-outlined text-gray-400">search</span>
              </div>
              <input 
                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm" 
                placeholder="Search leads by name, email, company, or phone..." 
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Leads</option>
                <option value="Not Called">Not Called</option>
                <option value="Called">Called</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </div>
        </div>

        {/* Leads Content */}
        <div className="p-6">
          {viewMode === 'list' ? (
            // List View
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead, index) => {
                      const callResult = callResults[lead.id];
                      return (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium" style={{color: '#0a2240'}}>{lead.name}</div>
                              <div className="text-xs text-gray-500">{lead.email}</div>
                              {lead.position && (
                                <div className="text-xs text-gray-400">{lead.position}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{lead.company || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <a 
                              href={`tel:${lead.phone}`} 
                              className="text-[#3dbff2] hover:underline font-medium"
                            >
                              {lead.phone}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallStatusColor(callResult?.result)}`}>
                              {getCallStatusText(callResult?.result)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{
                                    width: `${lead.score}%`, 
                                    backgroundColor: lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#3dbff2' : '#f59e0b'
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs">{lead.score}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCallLead(lead)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white rounded-md hover:opacity-90"
                                style={{backgroundColor: '#3dbff2'}}
                              >
                                <span className="material-symbols-outlined text-base">call</span>
                                Call
                              </button>
                              {callResult && (
                                <button
                                  onClick={() => {
                                    setCurrentCall({...callResult, leadId: lead.id});
                                    setShowCallModal(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLeads.map((lead) => {
                const callResult = callResults[lead.id];
                return (
                  <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium truncate" style={{color: '#0a2240'}}>{lead.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCallStatusColor(callResult?.result)}`}>
                        {getCallStatusText(callResult?.result)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600 truncate">{lead.company || 'No company'}</div>
                      <div className="text-sm">
                        <a href={`tel:${lead.phone}`} className="text-[#3dbff2] hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                      {lead.position && (
                        <div className="text-xs text-gray-500 truncate">{lead.position}</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full" 
                            style={{
                              width: `${lead.score}%`, 
                              backgroundColor: lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#3dbff2' : '#f59e0b'
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{lead.score}</span>
                      </div>
                      
                      <button
                        onClick={() => handleCallLead(lead)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-md hover:opacity-90"
                        style={{backgroundColor: '#3dbff2'}}
                      >
                        <span className="material-symbols-outlined text-sm">call</span>
                        Call
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Call Result Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCallModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium mb-4" style={{color: '#0a2240'}}>Call Result</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call Outcome *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'answered', label: 'Answered', color: 'green' },
                      { value: 'interested', label: 'Interested', color: 'emerald' },
                      { value: 'voicemail', label: 'Voicemail', color: 'yellow' },
                      { value: 'no-answer', label: 'No Answer', color: 'gray' },
                      { value: 'busy', label: 'Busy', color: 'orange' },
                      { value: 'not-interested', label: 'Not Interested', color: 'red' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCurrentCall({...currentCall, result: option.value as any})}
                        className={`p-2 text-xs font-medium rounded-md border transition-colors ${
                          currentCall.result === option.value
                            ? `bg-${option.color}-100 border-${option.color}-300 text-${option.color}-800`
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {currentCall.result === 'callback' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Callback Date/Time</label>
                    <input
                      type="datetime-local"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                      value={currentCall.scheduledCallback || ''}
                      onChange={(e) => setCurrentCall({...currentCall, scheduledCallback: e.target.value})}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Call Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                    value={currentCall.duration || ''}
                    onChange={(e) => setCurrentCall({...currentCall, duration: parseFloat(e.target.value) || 0})}
                    placeholder="2.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                    value={currentCall.notes || ''}
                    onChange={(e) => setCurrentCall({...currentCall, notes: e.target.value})}
                    placeholder="Add any relevant notes about the call..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowCallModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCall}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  Save Call Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}