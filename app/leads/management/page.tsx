'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeadManager, SalesUser, Territory, ScoringRule, AutoRouting, Lead } from "../../../lib/leads";

export default function LeadManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scoring' | 'territories' | 'routing' | 'users' | 'bulk'>('scoring');
  const [users, setUsers] = useState<SalesUser[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [routingRules, setRoutingRules] = useState<AutoRouting[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Modal states
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [showRoutingModal, setShowRoutingModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Form states
  const [newScoringRule, setNewScoringRule] = useState<Partial<ScoringRule>>({
    name: '',
    description: '',
    criteria: { field: 'source', operator: 'equals', value: '' },
    points: 0,
    active: true,
    priority: 1
  });

  const [newTerritory, setNewTerritory] = useState<Partial<Territory>>({
    name: '',
    description: '',
    criteria: { states: [], industries: [] },
    assignedUsers: [],
    active: true
  });

  const [newRoutingRule, setNewRoutingRule] = useState<Partial<AutoRouting>>({
    name: '',
    description: '',
    conditions: [{ field: 'source', operator: 'equals', value: '' }],
    action: { type: 'assign_to_user', value: '' },
    active: true,
    priority: 1
  });

  useEffect(() => {
    setUsers(LeadManager.getUsers());
    setTerritories(LeadManager.getTerritories());
    setScoringRules(LeadManager.getScoringRules());
    setRoutingRules(LeadManager.getAutoRoutingRules());
    setLeads(LeadManager.getLeads().filter(lead => !lead.isDuplicate));
  }, []);

  const handleAddScoringRule = () => {
    if (!newScoringRule.name || !newScoringRule.criteria?.field) {
      alert('Please fill in required fields');
      return;
    }

    const rule: ScoringRule = {
      id: LeadManager.generateId(),
      name: newScoringRule.name!,
      description: newScoringRule.description || '',
      criteria: newScoringRule.criteria!,
      points: newScoringRule.points || 0,
      active: newScoringRule.active ?? true,
      priority: newScoringRule.priority || 1
    };

    LeadManager.addScoringRule(rule);
    setScoringRules(LeadManager.getScoringRules());
    setShowScoringModal(false);
    setNewScoringRule({
      name: '',
      description: '',
      criteria: { field: 'source', operator: 'equals', value: '' },
      points: 0,
      active: true,
      priority: 1
    });
  };

  const handleBulkOperation = (operation: 'assign' | 'status' | 'priority' | 'delete', value?: string) => {
    const leadIds = Array.from(selectedLeads);
    let successCount = 0;

    switch (operation) {
      case 'assign':
        if (value) {
          successCount = LeadManager.bulkAssignLeads(leadIds, value);
        }
        break;
      case 'status':
        if (value) {
          successCount = LeadManager.bulkUpdateLeadStatus(leadIds, value as Lead['status']);
        }
        break;
      case 'priority':
        if (value) {
          successCount = LeadManager.bulkUpdateLeadPriority(leadIds, value as Lead['priority']);
        }
        break;
      case 'delete':
        leadIds.forEach(id => LeadManager.deleteLead(id));
        successCount = leadIds.length;
        break;
    }

    // Refresh data
    setLeads(LeadManager.getLeads().filter(lead => !lead.isDuplicate));
    setSelectedLeads(new Set());
    setShowBulkModal(false);

    alert(`Successfully updated ${successCount} leads`);
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
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

  return (
    <div className="flex min-h-screen flex-col bg-white" style={{fontFamily: 'Inter, \"Noto Sans\", sans-serif'}}>
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
          <h1 className="text-xl font-bold" style={{color: '#0a2240'}}>Advanced Lead Management</h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-4 md:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'scoring', name: 'Scoring Rules', icon: 'rule' },
              { id: 'territories', name: 'Territories', icon: 'location_on' },
              { id: 'routing', name: 'Auto-Routing', icon: 'alt_route' },
              { id: 'users', name: 'Users & Teams', icon: 'group' },
              { id: 'bulk', name: 'Bulk Operations', icon: 'checklist' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'border-[#3dbff2] text-[#3dbff2]' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Scoring Rules Tab */}
          {activeTab === 'scoring' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Lead Scoring Rules</h2>
                  <p className="text-sm text-gray-600">Configure automatic lead scoring based on custom criteria</p>
                </div>
                <button
                  onClick={() => setShowScoringModal(true)}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add Scoring Rule
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Criteria</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scoringRules.map((rule) => (
                        <tr key={rule.id}>
                          <td className="px-6 py-4 font-medium" style={{color: '#0a2240'}}>{rule.name}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {rule.criteria.field} {rule.criteria.operator} {rule.criteria.value}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {rule.points > 0 ? '+' : ''}{rule.points}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{rule.priority}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-[#3dbff2] hover:underline text-sm">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Operations Tab */}
          {activeTab === 'bulk' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Bulk Lead Operations</h2>
                <p className="text-sm text-gray-600">Select leads and perform bulk operations</p>
              </div>

              {selectedLeads.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedLeads.size} leads selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowBulkModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Bulk Actions
                      </button>
                      <button
                        onClick={() => setSelectedLeads(new Set())}
                        className="p-2 text-blue-700 hover:text-blue-900"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#3dbff2] border-gray-300 rounded"
                            checked={selectedLeads.size === leads.length && leads.length > 0}
                            onChange={() => {
                              if (selectedLeads.size === leads.length) {
                                setSelectedLeads(new Set());
                              } else {
                                setSelectedLeads(new Set(leads.map(lead => lead.id)));
                              }
                            }}
                          />
                        </th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Territory</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.slice(0, 20).map((lead) => (
                        <tr key={lead.id} className={selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-[#3dbff2] border-gray-300 rounded"
                              checked={selectedLeads.has(lead.id)}
                              onChange={() => toggleLeadSelection(lead.id)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium" style={{color: '#0a2240'}}>{lead.name}</div>
                              <div className="text-xs text-gray-500">{lead.company}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                              {lead.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {lead.assignedTo ? LeadManager.getUserById(lead.assignedTo)?.name || 'Unknown' : 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{lead.territory || 'Not Set'}</td>
                          <td className="px-6 py-4">
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
                              <span className="text-xs font-medium">{lead.score}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Add Scoring Rule Modal */}
      {showScoringModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowScoringModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-medium mb-4" style={{color: '#0a2240'}}>Add Scoring Rule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rule Name *</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                    value={newScoringRule.name || ''}
                    onChange={(e) => setNewScoringRule({...newScoringRule, name: e.target.value})}
                    placeholder="High-value leads"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                    rows={3}
                    value={newScoringRule.description || ''}
                    onChange={(e) => setNewScoringRule({...newScoringRule, description: e.target.value})}
                    placeholder="Describe when this rule should apply..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Field</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                      value={newScoringRule.criteria?.field || ''}
                      onChange={(e) => setNewScoringRule({
                        ...newScoringRule,
                        criteria: {...newScoringRule.criteria!, field: e.target.value}
                      })}
                    >
                      <option value="source">Source</option>
                      <option value="status">Status</option>
                      <option value="priority">Priority</option>
                      <option value="industry">Industry</option>
                      <option value="estimatedValue">Estimated Value</option>
                      <option value="company">Company</option>
                      <option value="position">Position</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Operator</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                      value={newScoringRule.criteria?.operator || ''}
                      onChange={(e) => setNewScoringRule({
                        ...newScoringRule,
                        criteria: {...newScoringRule.criteria!, operator: e.target.value as any}
                      })}
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Value</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                      value={newScoringRule.criteria?.value || ''}
                      onChange={(e) => setNewScoringRule({
                        ...newScoringRule,
                        criteria: {...newScoringRule.criteria!, value: e.target.value}
                      })}
                      placeholder="Value"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Points</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                      value={newScoringRule.points || ''}
                      onChange={(e) => setNewScoringRule({...newScoringRule, points: parseInt(e.target.value) || 0})}
                      placeholder="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3dbff2] focus:ring-[#3dbff2]"
                      value={newScoringRule.priority || ''}
                      onChange={(e) => setNewScoringRule({...newScoringRule, priority: parseInt(e.target.value) || 1})}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowScoringModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddScoringRule}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                >
                  Add Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowBulkModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium mb-4" style={{color: '#0a2240'}}>
                Bulk Actions ({selectedLeads.size} leads)
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const userId = prompt('Enter user ID to assign to:');
                    if (userId) handleBulkOperation('assign', userId);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium border rounded-md hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-[#3dbff2]">person_add</span>
                  Assign to User
                </button>
                
                <button
                  onClick={() => {
                    const status = prompt('Enter status (New, Contacted, Qualified, etc.):');
                    if (status) handleBulkOperation('status', status);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium border rounded-md hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-[#3dbff2]">update</span>
                  Update Status
                </button>
                
                <button
                  onClick={() => {
                    const priority = prompt('Enter priority (Low, Medium, High, Critical):');
                    if (priority) handleBulkOperation('priority', priority);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium border rounded-md hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-[#3dbff2]">flag</span>
                  Set Priority
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedLeads.size} leads?`)) {
                      handleBulkOperation('delete');
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Delete Leads
                </button>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}