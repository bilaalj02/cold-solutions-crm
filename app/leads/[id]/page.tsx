'use client'

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeadManager, Lead, LeadActivity } from "../../../lib/leads";

export default function LeadDetails() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLead, setEditLead] = useState<Partial<Lead>>({});
  const [newActivity, setNewActivity] = useState({
    type: 'Note' as LeadActivity['type'],
    description: '',
    createdBy: 'Current User'
  });
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const foundLead = LeadManager.getLeadById(params.id as string);
      if (foundLead) {
        setLead(foundLead);
        setEditLead(foundLead);
        setActivities(LeadManager.getActivities(foundLead.id));
      } else {
        router.push('/leads');
      }
    }
  }, [params?.id, router]);

  const handleSaveEdit = () => {
    if (!lead || !editLead.name || !editLead.email || !editLead.phone) {
      alert('Please fill in required fields: Name, Email, and Phone');
      return;
    }

    const updatedLead: Lead = {
      ...lead,
      ...editLead,
      score: LeadManager.calculateScore(editLead),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    LeadManager.saveLead(updatedLead);
    setLead(updatedLead);
    setShowEditModal(false);

    // Add activity for the edit
    const activity: LeadActivity = {
      id: LeadManager.generateId(),
      leadId: lead.id,
      type: 'Note',
      description: 'Lead information updated',
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    LeadManager.addActivity(activity);
    setActivities([activity, ...activities]);
  };

  const handleAddActivity = () => {
    if (!lead || !newActivity.description.trim()) {
      alert('Please enter activity description');
      return;
    }

    const activity: LeadActivity = {
      id: LeadManager.generateId(),
      leadId: lead.id,
      type: newActivity.type,
      description: newActivity.description,
      createdAt: new Date().toISOString(),
      createdBy: newActivity.createdBy
    };

    LeadManager.addActivity(activity);
    setActivities([activity, ...activities]);
    setShowActivityModal(false);
    setNewActivity({
      type: 'Note',
      description: '',
      createdBy: 'Current User'
    });
  };

  const handleStatusChange = (newStatus: Lead['status']) => {
    if (!lead) return;

    const updatedLead: Lead = {
      ...lead,
      status: newStatus,
      score: LeadManager.calculateScore({...lead, status: newStatus}),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    LeadManager.saveLead(updatedLead);
    setLead(updatedLead);

    // Add activity for status change
    const activity: LeadActivity = {
      id: LeadManager.generateId(),
      leadId: lead.id,
      type: 'Status Change',
      description: `Status changed from ${lead.status} to ${newStatus}`,
      createdAt: new Date().toISOString(),
      createdBy: 'Current User'
    };
    LeadManager.addActivity(activity);
    setActivities([activity, ...activities]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Proposal': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Won': return 'bg-emerald-100 text-emerald-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!lead) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/leads')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#3dbff2]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Leads
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90" 
            style={{backgroundColor: '#3dbff2'}}
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit Lead
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lead Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold" style={{color: '#0a2240'}}>{lead.name}</h1>
                    {lead.company && (
                      <p className="text-lg text-gray-600">{lead.position} at {lead.company}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Lead Score</div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{
                              width: `${lead.score}%`, 
                              backgroundColor: lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#3dbff2' : '#f59e0b'
                            }}
                          ></div>
                        </div>
                        <span className="text-lg font-semibold" style={{color: '#0a2240'}}>{lead.score}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">email</span>
                        <a href={`mailto:${lead.email}`} className="text-[#3dbff2] hover:underline">{lead.email}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">phone</span>
                        <a href={`tel:${lead.phone}`} className="text-[#3dbff2] hover:underline">{lead.phone}</a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Lead Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Source:</span>
                        <span className="text-sm font-medium">{lead.source}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <select 
                          value={lead.status} 
                          onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
                          className={`text-sm font-medium rounded-full px-2.5 py-0.5 ${getStatusColor(lead.status)} border-0 focus:ring-2 focus:ring-[#3dbff2]`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                      {lead.assignedTo && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Assigned to:</span>
                          <span className="text-sm font-medium">{lead.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{lead.notes}</p>
                  </div>
                )}

                {lead.tags && lead.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Activities */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Activity Timeline</h3>
                  <button 
                    onClick={() => setShowActivityModal(true)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#3dbff2] hover:underline"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    Add Activity
                  </button>
                </div>
                <div className="p-6">
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#3dbff2] mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{activity.type}</span>
                              <span className="text-xs text-gray-500">{formatActivityTime(activity.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">by {activity.createdBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No activities recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-md border hover:bg-gray-50">
                    <span className="material-symbols-outlined text-[#3dbff2]">call</span>
                    Call Lead
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-md border hover:bg-gray-50">
                    <span className="material-symbols-outlined text-[#3dbff2]">email</span>
                    Send Email
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-md border hover:bg-gray-50">
                    <span className="material-symbols-outlined text-[#3dbff2]">event</span>
                    Schedule Meeting
                  </button>
                </div>
              </div>

              {(lead.estimatedValue || lead.expectedCloseDate) && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Deal Information</h3>
                  <div className="space-y-3">
                    {lead.estimatedValue && (
                      <div>
                        <div className="text-sm text-gray-500">Estimated Value</div>
                        <div className="text-lg font-semibold" style={{color: '#0a2240'}}>
                          ${lead.estimatedValue.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {lead.expectedCloseDate && (
                      <div>
                        <div className="text-sm text-gray-500">Expected Close Date</div>
                        <div className="text-sm font-medium">{lead.expectedCloseDate}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
            
            <div className="inline-block transform rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="mb-4">
                <h3 className="text-lg font-medium leading-6" style={{color: '#0a2240'}}>Edit Lead</h3>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={editLead.name || ''}
                      onChange={(e) => setEditLead({...editLead, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={editLead.email || ''}
                      onChange={(e) => setEditLead({...editLead, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={editLead.phone || ''}
                      onChange={(e) => setEditLead({...editLead, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                      value={editLead.company || ''}
                      onChange={(e) => setEditLead({...editLead, company: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                    value={editLead.notes || ''}
                    onChange={(e) => setEditLead({...editLead, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowActivityModal(false)}></div>
            
            <div className="inline-block transform rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="mb-4">
                <h3 className="text-lg font-medium leading-6" style={{color: '#0a2240'}}>Add Activity</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({...newActivity, type: e.target.value as LeadActivity['type']})}
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Note">Note</option>
                    <option value="Status Change">Status Change</option>
                    <option value="Score Change">Score Change</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2] sm:text-sm"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                    placeholder="Describe the activity..."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddActivity}
                  className="inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}