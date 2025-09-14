'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeadManager, Lead } from "../../../lib/leads";

interface DuplicateGroup {
  leads: Lead[];
  score: number;
  reasons: string[];
}

export default function LeadDuplicates() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrimary, setSelectedPrimary] = useState<Record<string, string>>({});
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<DuplicateGroup | null>(null);

  useEffect(() => {
    detectDuplicates();
  }, []);

  const detectDuplicates = () => {
    setLoading(true);
    const allLeads = LeadManager.getLeads().filter(lead => !lead.isDuplicate);
    setLeads(allLeads);

    const groups: DuplicateGroup[] = [];
    const processedIds = new Set<string>();

    allLeads.forEach(lead => {
      if (processedIds.has(lead.id)) return;

      const duplicates = LeadManager.findDuplicateLeads(lead);
      if (duplicates.length > 0) {
        const group: DuplicateGroup = {
          leads: [lead, ...duplicates.filter(dup => !processedIds.has(dup.id))],
          score: 0,
          reasons: []
        };

        // Calculate duplicate score and reasons
        duplicates.forEach(duplicate => {
          if (duplicate.email === lead.email) {
            group.score += 100;
            group.reasons.push('Identical email address');
          }
          if (duplicate.phone.replace(/\D/g, '') === lead.phone.replace(/\D/g, '')) {
            group.score += 80;
            group.reasons.push('Identical phone number');
          }
          if (duplicate.company && lead.company && 
              duplicate.company.toLowerCase() === lead.company.toLowerCase()) {
            group.score += 40;
            group.reasons.push('Same company');
          }
          if (duplicate.name.toLowerCase().includes(lead.name.toLowerCase()) ||
              lead.name.toLowerCase().includes(duplicate.name.toLowerCase())) {
            group.score += 30;
            group.reasons.push('Similar names');
          }
        });

        // Remove duplicates from reasons
        group.reasons = [...new Set(group.reasons)];

        if (group.leads.length > 1) {
          groups.push(group);
          group.leads.forEach(l => processedIds.add(l.id));
        }
      }
    });

    // Sort groups by duplicate confidence score
    groups.sort((a, b) => b.score - a.score);
    setDuplicateGroups(groups);
    setLoading(false);
  };

  const handleMergeLeads = (group: DuplicateGroup) => {
    setCurrentGroup(group);
    setShowMergeModal(true);
  };

  const confirmMerge = () => {
    if (!currentGroup) return;

    const primaryId = selectedPrimary[currentGroup.leads[0].id];
    if (!primaryId) {
      alert('Please select a primary lead');
      return;
    }

    // Merge all other leads into the primary
    currentGroup.leads.forEach(lead => {
      if (lead.id !== primaryId) {
        LeadManager.mergeLeads(primaryId, lead.id);
      }
    });

    // Refresh the duplicate detection
    detectDuplicates();
    setShowMergeModal(false);
    setCurrentGroup(null);
    setSelectedPrimary({});

    alert('Leads merged successfully!');
  };

  const markAsNotDuplicate = (group: DuplicateGroup) => {
    // Mark leads as reviewed so they don't appear as duplicates again
    group.leads.forEach(lead => {
      lead.customFields = { 
        ...lead.customFields, 
        duplicateReviewed: true,
        reviewedAt: new Date().toISOString()
      };
      LeadManager.saveLead(lead);
    });

    // Remove from current groups
    setDuplicateGroups(groups => groups.filter(g => g !== group));
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderColor: '#3dbff2'}}></div>
          <p className="mt-4 text-gray-600">Detecting duplicate leads...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold" style={{color: '#0a2240'}}>Duplicate Lead Detection</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={detectDuplicates}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
            style={{backgroundColor: '#3dbff2'}}
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Re-scan for Duplicates
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          
          {duplicateGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>No Duplicates Found</h3>
              <p className="text-gray-600">Great! Your lead database appears to be clean with no duplicate entries.</p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{color: '#0a2240'}}>
                  Potential Duplicate Leads ({duplicateGroups.length} groups found)
                </h2>
                <p className="text-sm text-gray-600">
                  Review and merge duplicate leads to keep your database clean and accurate.
                </p>
              </div>

              <div className="space-y-6">
                {duplicateGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b bg-yellow-50 border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium" style={{color: '#0a2240'}}>
                            Duplicate Group {groupIndex + 1}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              group.score >= 100 ? 'bg-red-100 text-red-800' :
                              group.score >= 70 ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {group.score >= 100 ? 'High Confidence' :
                               group.score >= 70 ? 'Medium Confidence' :
                               'Low Confidence'}
                            </span>
                            <span className="text-sm text-gray-600">
                              Match Score: {group.score}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>Reasons:</strong> {group.reasons.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleMergeLeads(group)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                            style={{backgroundColor: '#3dbff2'}}
                          >
                            <span className="material-symbols-outlined text-base">merge</span>
                            Merge Leads
                          </button>
                          <button
                            onClick={() => markAsNotDuplicate(group)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                            Not Duplicates
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {group.leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <a 
                                    href={`/leads/${lead.id}`}
                                    className="font-medium text-[#3dbff2] hover:underline"
                                  >
                                    {lead.name}
                                  </a>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                              <td className="px-6 py-4 text-gray-600">{lead.phone}</td>
                              <td className="px-6 py-4 text-gray-600">{lead.company || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority || 'Medium')}`}>
                                  {lead.priority || 'Medium'}
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
                              <td className="px-6 py-4 text-gray-600 text-xs">{lead.createdAt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Merge Modal */}
      {showMergeModal && currentGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowMergeModal(false)}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <h3 className="text-lg font-medium mb-4" style={{color: '#0a2240'}}>
                Merge Duplicate Leads
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Select which lead should be the primary (master) record. All other leads will be merged into this one, and their data will be combined.
              </p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentGroup.leads.map((lead) => (
                  <div key={lead.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPrimary[currentGroup.leads[0].id] === lead.id ? 'border-[#3dbff2] bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`} onClick={() => setSelectedPrimary({...selectedPrimary, [currentGroup.leads[0].id]: lead.id})}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="primaryLead"
                            checked={selectedPrimary[currentGroup.leads[0].id] === lead.id}
                            onChange={() => setSelectedPrimary({...selectedPrimary, [currentGroup.leads[0].id]: lead.id})}
                            className="h-4 w-4 text-[#3dbff2] border-gray-300"
                          />
                          <div>
                            <h4 className="font-medium" style={{color: '#0a2240'}}>{lead.name}</h4>
                            <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {lead.company && `${lead.company} • `}
                              Created: {lead.createdAt} • 
                              Score: {lead.score} • 
                              Status: {lead.status}
                            </p>
                            {lead.notes && (
                              <p className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded">
                                <strong>Notes:</strong> {lead.notes.substring(0, 100)}
                                {lead.notes.length > 100 && '...'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowMergeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMerge}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                  style={{backgroundColor: '#3dbff2'}}
                  disabled={!selectedPrimary[currentGroup.leads[0].id]}
                >
                  Merge Selected Leads
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}