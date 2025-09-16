'use client'

import React, { useState, useEffect } from "react";
import { LeadManager, Lead, LeadActivity, LeadList } from "../../../../lib/leads";
import { useParams } from "next/navigation";

export default function LeadListDetail() {
  const params = useParams();
  const listId = params.id as string;
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [leadList, setLeadList] = useState<LeadList | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState<'Positive' | 'Negative' | 'Neutral'>('Neutral');
  const [callDuration, setCallDuration] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [tempCallOutcome, setTempCallOutcome] = useState<string>('');
  const [tempCallNotes, setTempCallNotes] = useState<string>('');
  const [showCallOutcomeModal, setShowCallOutcomeModal] = useState(false);
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [selectedCallOutcome, setSelectedCallOutcome] = useState<string>('');
  const [selectedCallNotes, setSelectedCallNotes] = useState<string>('');

  useEffect(() => {
    // Get the specific lead list
    const leadLists = LeadManager.getLeadLists();
    const currentList = leadLists.find(list => list.id === listId);
    setLeadList(currentList || null);

    // Get leads for this specific list
    const allLeads = LeadManager.getLeads();
    const listLeads = allLeads.filter(lead => lead.leadListId === listId);
      setLeads(listLeads);
      setFilteredLeads(listLeads);
  }, [listId]);

  useEffect(() => {
    let filtered = leads;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeads(filtered);
  }, [leads, statusFilter, priorityFilter, searchTerm]);

  const handleStartCall = (lead: Lead) => {
    setSelectedLead(lead);
    setShowCallModal(true);
    setCallNotes('');
    setCallOutcome('Neutral');
    setCallDuration(0);
    setIsCalling(true);
  };

  const handleEndCall = () => {
    if (!selectedLead) return;

    // Create call activity
    const activity: LeadActivity = {
      id: LeadManager.generateId(),
      leadId: selectedLead.id,
      type: 'Call',
      description: `Call completed - Outcome: ${callOutcome}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      duration: callDuration,
      outcome: callOutcome,
      metadata: {
        notes: callNotes,
        callType: 'Cold Call'
      }
    };

    LeadManager.addActivity(activity);

    // Update lead status based on outcome
    if (callOutcome === 'Positive') {
      selectedLead.status = 'Contacted';
    } else if (callOutcome === 'Negative') {
      selectedLead.status = 'Lost';
    }

    selectedLead.lastInteraction = new Date().toISOString();
    selectedLead.notes = selectedLead.notes + (callNotes ? `\n\nCall Notes (${new Date().toLocaleDateString()}): ${callNotes}` : '');
    
    LeadManager.saveLead(selectedLead);

    // Update local state
    const updatedLeads = leads.map(lead => 
      lead.id === selectedLead.id ? selectedLead : lead
    );
    setLeads(updatedLeads);

    setShowCallModal(false);
    setSelectedLead(null);
    setIsCalling(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Proposal': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const handleCallOutcomeChange = (leadId: string, outcome: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = {
          ...lead,
          callOutcome: outcome as any,
          lastCallDate: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        // Update status based on outcome
        if (outcome === 'Booked Demo') {
          updatedLead.status = 'Qualified';
        } else if (outcome === 'Interested') {
          updatedLead.status = 'Qualified';
        } else if (outcome === 'Not Interested') {
          updatedLead.status = 'Lost';
        } else if (outcome === 'Requested More Info') {
          updatedLead.status = 'Contacted';
        } else if (outcome === 'Callback Requested') {
          updatedLead.status = 'Contacted';
        } else if (outcome === 'No Answer') {
          updatedLead.status = 'Contacted';
        }
        
        LeadManager.saveLead(updatedLead);
        return updatedLead;
      }
      return lead;
    });
    
    setLeads(updatedLeads);
  };

  const handleCallNotesChange = (leadId: string, notes: string) => {
    const updatedLeads = leads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = {
          ...lead,
          callNotes: notes,
          updatedAt: new Date().toISOString().split('T')[0]
        };
        LeadManager.saveLead(updatedLead);
        return updatedLead;
      }
      return lead;
    });
    
    setLeads(updatedLeads);
  };

  const startEditingLead = (lead: Lead) => {
    setEditingLead(lead);
    setTempCallOutcome(lead.callOutcome || '');
    setTempCallNotes(lead.callNotes || '');
  };

  const saveLeadEdits = () => {
    if (editingLead) {
      handleCallOutcomeChange(editingLead.id, tempCallOutcome);
      handleCallNotesChange(editingLead.id, tempCallNotes);
      setEditingLead(null);
      setTempCallOutcome('');
      setTempCallNotes('');
    }
  };

  const cancelEditing = () => {
    setEditingLead(null);
    setTempCallOutcome('');
    setTempCallNotes('');
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

    // Map call outcomes to activity outcomes
    const getActivityOutcome = (callOutcome: string): 'Positive' | 'Negative' | 'Neutral' => {
      switch (callOutcome) {
        case 'Booked Demo':
        case 'Interested':
        case 'Requested More Info':
          return 'Positive';
        case 'Not Interested':
          return 'Negative';
        case 'No Answer':
        case 'Callback Requested':
        default:
          return 'Neutral';
      }
    };

    // Create call activity for call log
    const activity: LeadActivity = {
      id: LeadManager.generateId(),
      leadId: callingLead.id,
      type: 'Call',
      description: `Call completed - Outcome: ${selectedCallOutcome}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      duration: 0, // Default duration since we don't track it in this flow
      outcome: getActivityOutcome(selectedCallOutcome),
      metadata: {
        notes: selectedCallNotes,
        callType: 'Cold Call',
        callOutcome: selectedCallOutcome // Store the original call outcome in metadata
      }
    };

    LeadManager.addActivity(activity);
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

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Lead List Detail</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/cold-caller">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>list</span>
              <p className="text-sm font-medium leading-normal">Lead Lists</p>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
              <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>
                {leadList?.name || `Lead List: ${listId}`}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {leadList?.description || 'Click on a lead to start calling'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {leads.length}
                  </div>
                  <div className="text-xs text-gray-500">Total Leads</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {leads.filter(lead => lead.status === 'New').length}
                  </div>
                  <div className="text-xs text-gray-500">New Leads</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#10b981'}}>
                    {leads.filter(lead => lead.status === 'Contacted').length}
                  </div>
                  <div className="text-xs text-gray-500">Contacted</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters and Search */}
        <div className="p-6 bg-white border-b">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <label className="text-sm font-medium text-gray-700">Search:</label>
              <input
                type="text"
                placeholder="Search by name, company, email, phone..."
                className="flex-1 rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Outcome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Notes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    </tr>
                  </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.company || '-'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.position || '-'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.industry || '-'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.territory || '-'}</div>
                          </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                          </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                            </span>
                          </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{color: '#3dbff2'}}>
                          {lead.score}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.source}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.lastInteraction ? new Date(lead.lastInteraction).toLocaleDateString() : '-'}
                              </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingLead?.id === lead.id ? (
                          <select
                            value={tempCallOutcome}
                            onChange={(e) => setTempCallOutcome(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:border-[#3dbff2] focus:outline-none"
                          >
                            <option value="">Select Outcome</option>
                            <option value="Booked Demo">Booked Demo</option>
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                            <option value="Requested More Info">Requested More Info</option>
                            <option value="No Answer">No Answer</option>
                            <option value="Callback Requested">Callback Requested</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCallOutcomeColor(lead.callOutcome || '')}`}>
                            {lead.callOutcome || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {editingLead?.id === lead.id ? (
                          <textarea
                            value={tempCallNotes}
                            onChange={(e) => setTempCallNotes(e.target.value)}
                            placeholder="Add call notes..."
                            className="text-xs border border-gray-300 rounded px-2 py-1 w-full h-16 resize-none focus:border-[#3dbff2] focus:outline-none"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={lead.callNotes || ''}>
                            {lead.callNotes || '-'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={lead.notes || ''}>
                          {lead.notes || '-'}
                            </div>
                          </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                          {editingLead?.id === lead.id ? (
                            <>
                              <button
                                onClick={saveLeadEdits}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-white hover:opacity-90"
                                style={{backgroundColor: '#10b981'}}
                              >
                                <span className="material-symbols-outlined text-sm">save</span>
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleCallButtonClick(lead)}
                                disabled={lead.status === 'Lost' || lead.status === 'Won'}
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                  lead.status === 'Lost' || lead.status === 'Won'
                                    ? 'text-gray-500 bg-gray-100 cursor-not-allowed'
                                    : lead.callOutcome
                                    ? 'text-green-700 bg-green-100 hover:bg-green-200'
                                    : 'text-white hover:opacity-90'
                                }`}
                                style={lead.status !== 'Lost' && lead.status !== 'Won' && !lead.callOutcome ? {backgroundColor: '#3dbff2'} : {}}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {lead.callOutcome ? 'check_circle' : 'call'}
                                </span>
                                {lead.status === 'Lost' ? 'Lost' : lead.status === 'Won' ? 'Won' : lead.callOutcome ? 'Called' : 'Call'}
                              </button>
                                <button
                                onClick={() => startEditingLead(lead)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                  Edit
                                </button>
                            </>
                              )}
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
                <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>No Leads Found</h3>
                <p className="text-gray-600">No leads match your current filter criteria.</p>
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Call Modal */}
      {showCallModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>
                {isCalling ? 'Call in Progress' : 'Call Completed'}
              </h2>
              <button
                onClick={() => setShowCallModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>
                  {selectedLead.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{selectedLead.company}</p>
                <p className="text-sm text-gray-600">{selectedLead.phone}</p>
              </div>

              {isCalling && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-green-600 text-2xl">call</span>
                  </div>
                  <p className="text-sm text-gray-600">Call in progress...</p>
                  <div className="mt-4">
                      <button
                      onClick={() => setIsCalling(false)}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{backgroundColor: '#ef4444'}}
                    >
                      End Call
                      </button>
                  </div>
                </div>
              )}

              {!isCalling && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call Outcome
                    </label>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value as any)}
                      className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                    >
                      <option value="Positive">Positive</option>
                      <option value="Neutral">Neutral</option>
                      <option value="Negative">Negative</option>
                    </select>
                  </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call Duration (minutes)
                    </label>
                  <input
                    type="number"
                      value={callDuration}
                      onChange={(e) => setCallDuration(parseInt(e.target.value) || 0)}
                      className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                      placeholder="0"
                  />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call Notes
                    </label>
                  <textarea
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                      rows={4}
                      placeholder="Enter call notes..."
                    />
              </div>
              
                  <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCallModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                      onClick={handleEndCall}
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{backgroundColor: '#3dbff2'}}
                >
                      Save Call
                </button>
              </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Outcome Modal */}
      {showCallOutcomeModal && callingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>
                Call Outcome
              </h2>
              <button
                onClick={handleCallOutcomeCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>
                  {callingLead.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{callingLead.company}</p>
                <p className="text-sm text-gray-600">{callingLead.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Outcome *
                </label>
                <select
                  value={selectedCallOutcome}
                  onChange={(e) => setSelectedCallOutcome(e.target.value)}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Notes
                </label>
                <textarea
                  value={selectedCallNotes}
                  onChange={(e) => setSelectedCallNotes(e.target.value)}
                  className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
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
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{backgroundColor: '#3dbff2'}}
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