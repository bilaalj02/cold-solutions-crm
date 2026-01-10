'use client';

import { useState, useEffect } from 'react';
import { BusinessIntelligenceComplete } from '@/types/business-intelligence';
import LeadImportModal from './components/LeadImportModal';
import LeadTable from './components/LeadTable';
import AnalysisProgress from './components/AnalysisProgress';
import { Button } from '@/components/ui/button';
import StandardSidebar from '@/components/StandardSidebar';

export default function BusinessIntelligencePage() {
  const [leads, setLeads] = useState<BusinessIntelligenceComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<any>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pushedFilter, setPushedFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, pushedFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (pushedFilter !== 'all') params.append('pushed', pushedFilter);

      const response = await fetch(`/api/business-intelligence/leads?${params}`);
      const data = await response.json();

      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select leads to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/business-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisProgress(data.status);
        alert(`Analysis complete! ${data.status.successful} leads analyzed successfully.`);
        fetchLeads();
        setSelectedLeads([]);
      } else {
        alert('Analysis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error analyzing leads:', error);
      alert('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeAll = async () => {
    const unanalyzed = leads.filter(l => l.analysis_status === 'Not Started').map(l => l.id);

    if (unanalyzed.length === 0) {
      alert('No unanalyzed leads found');
      return;
    }

    const estimatedCost = (unanalyzed.length * 0.07).toFixed(2);
    const confirmed = confirm(
      `Analyze ${unanalyzed.length} leads?\n\nEstimated cost: $${estimatedCost}\nEstimated time: ${Math.ceil(unanalyzed.length / 5 * 1.5)} minutes`
    );

    if (!confirmed) return;

    setAnalyzing(true);
    try {
      const response = await fetch('/api/business-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: unanalyzed })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisProgress(data.status);
        alert(`Analysis complete! ${data.status.successful}/${unanalyzed.length} leads analyzed successfully.`);
        fetchLeads();
      } else {
        alert('Analysis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error analyzing leads:', error);
      alert('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePushToCaller = async () => {
    const completedSelected = selectedLeads.filter(id => {
      const lead = leads.find(l => l.id === id);
      return lead?.analysis_status === 'Complete' && !lead.pushed_to_caller;
    });

    if (completedSelected.length === 0) {
      alert('Please select completed, unpushed leads');
      return;
    }

    const confirmed = confirm(`Push ${completedSelected.length} leads to Cold Caller?`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/business-intelligence/push-to-caller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: completedSelected })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully pushed ${data.pushedCount} leads to Cold Caller!\nLead List: ${data.leadListName}`);
        fetchLeads();
        setSelectedLeads([]);
      } else {
        alert('Push failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error pushing leads:', error);
      alert('Push failed');
    }
  };

  const handleDelete = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select leads to delete');
      return;
    }

    const confirmed = confirm(`Delete ${selectedLeads.length} leads?`);
    if (!confirmed) return;

    try {
      const response = await fetch('/api/business-intelligence/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: selectedLeads })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Deleted ${data.deleted} leads`);
        fetchLeads();
        setSelectedLeads([]);
      }
    } catch (error) {
      console.error('Error deleting leads:', error);
      alert('Delete failed');
    }
  };

  const stats = {
    total: leads.length,
    notStarted: leads.filter(l => l.analysis_status === 'Not Started').length,
    complete: leads.filter(l => l.analysis_status === 'Complete').length,
    failed: leads.filter(l => l.analysis_status === 'Failed').length,
    pushed: leads.filter(l => l.pushed_to_caller).length
  };

  return (
    <div className="flex">
      <StandardSidebar />
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Business Intelligence</h1>
            <p className="text-gray-600">Import leads, analyze businesses, and push to Cold Caller</p>
          </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Leads</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Not Analyzed</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.notStarted}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Complete</div>
          <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pushed to Caller</div>
          <div className="text-2xl font-bold text-blue-600">{stats.pushed}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            📥 Import CSV
          </Button>

          <Button
            onClick={handleAnalyzeAll}
            disabled={analyzing || stats.notStarted === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {analyzing ? '⏳ Analyzing...' : `🤖 Analyze All (${stats.notStarted})`}
          </Button>

          <Button
            onClick={handleAnalyze}
            disabled={analyzing || selectedLeads.length === 0}
            variant="outline"
          >
            🔍 Analyze Selected ({selectedLeads.length})
          </Button>

          <Button
            onClick={handlePushToCaller}
            disabled={selectedLeads.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            📤 Push to Caller ({selectedLeads.length})
          </Button>

          <Button
            onClick={handleDelete}
            disabled={selectedLeads.length === 0}
            variant="destructive"
          >
            🗑️ Delete ({selectedLeads.length})
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div>
            <label className="text-sm font-medium mr-2">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mr-2">Pushed:</label>
            <select
              value={pushedFilter}
              onChange={(e) => setPushedFilter(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All</option>
              <option value="false">Not Pushed</option>
              <option value="true">Pushed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analysis Progress */}
      {analyzing && analysisProgress && (
        <AnalysisProgress progress={analysisProgress} />
      )}

      {/* Lead Table */}
      <LeadTable
        leads={leads}
        loading={loading}
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
        onRefresh={fetchLeads}
      />

      {/* Import Modal */}
      {showImportModal && (
        <LeadImportModal
          onClose={() => setShowImportModal(false)}
          onImportComplete={() => {
            setShowImportModal(false);
            fetchLeads();
          }}
        />
      )}
        </div>
      </main>
    </div>
  );
}
