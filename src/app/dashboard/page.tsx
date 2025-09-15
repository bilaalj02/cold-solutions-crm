'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LeadManager, Lead, LeadList, SalesUser } from '@/lib/leads';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<SalesUser | null>(null);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLists, setFilteredLists] = useState<LeadList[]>([]);
  const [industryFilter, setIndustryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // CSV Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'parsing' | 'validating' | 'importing' | 'completed' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [newLeadList, setNewLeadList] = useState({
    name: '',
    description: '',
    location: '',
    industry: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // CSV Import functions
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.toLowerCase()] = values[index] || '';
      });
      return row;
    });
    
    return rows;
  };

  const validateCSVData = (data: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('No data found in CSV file');
      return { valid: false, errors };
    }
    
    const requiredFields = ['name', 'email'];
    const firstRow = data[0];
    
    requiredFields.forEach(field => {
      if (!firstRow[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  };

  const convertCSVToLeads = (data: any[], leadListId: string): Lead[] => {
    return data.map((row, index) => ({
      id: LeadManager.generateId(),
      name: row.name || `Lead ${index + 1}`,
      email: row.email || '',
      phone: row.phone || row.telephone || '',
      company: row.company || row.business || '',
      position: row.position || row.job_title || row.title || '',
      source: 'CSV Import' as const,
      status: 'New' as const,
      priority: 'Medium' as const,
      score: 7,
      assignedTo: currentUser?.id,
      territory: row.territory || row.region || newLeadList.location,
      industry: row.industry || newLeadList.industry,
      leadSource: 'CSV Import',
      originalSource: 'CSV Import',
      leadListId: leadListId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      notes: row.notes || '',
      tags: [],
      lifecycle: {
        stage: 'New',
        stageChangedAt: new Date().toISOString().split('T')[0],
        timeInStage: 0
      },
      isDuplicate: false
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    setImportStatus('parsing');
    setImportProgress(0);
    setImportError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      const validation = validateCSVData(data);
      
      if (validation.valid) {
        setCsvData(data);
        setImportStatus('idle');
        setImportProgress(100);
      } else {
        setImportError(validation.errors.join(', '));
        setImportStatus('error');
      }
    };
    
    reader.readAsText(file);
  };

  const handleImportLeads = async () => {
    if (!csvData.length || !newLeadList.name.trim()) return;
    
    setImportStatus('importing');
    setImportProgress(0);
    
    try {
      // Create lead list
      const leadList = LeadManager.createLeadList({
        name: newLeadList.name,
        description: newLeadList.description,
        territory: newLeadList.location,
        industry: newLeadList.industry,
        priority: newLeadList.priority,
        status: 'Active',
        tags: []
      });
      
      // Convert CSV data to leads
      const leads = convertCSVToLeads(csvData, leadList.id);
      
      // Save leads
      leads.forEach(lead => {
        LeadManager.saveLead(lead);
      });
      
      // Update lead list count
      leadList.leadCount = leads.length;
      LeadManager.saveLeadList(leadList);
      
      setImportStatus('completed');
      setImportProgress(100);
      
      // Refresh data
      const allLeads = LeadManager.getLeads();
      const allLeadLists = LeadManager.getLeadLists();
      setLeads(allLeads);
      setLeadLists(allLeadLists);
      setFilteredLists(allLeadLists);
      
      // Reset form
      setTimeout(() => {
        setShowImportModal(false);
        setCsvFile(null);
        setCsvData([]);
        setImportStatus('idle');
        setImportProgress(0);
        setNewLeadList({
          name: '',
          description: '',
          location: '',
          industry: '',
          priority: 'Medium'
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
      
    } catch (error) {
      setImportError('Failed to import leads');
      setImportStatus('error');
    }
  };

  const industries = Array.from(new Set(leadLists.map(list => list.industry).filter(Boolean)));

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
              <h1 className="text-3xl font-bold text-gray-900">Lead Lists</h1>
              <p className="text-sm text-gray-600 mt-1">Select a lead list to start making calls</p>
            </div>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{backgroundColor: '#3dbff2'}}
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              Import CSV
            </button>
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

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Import CSV Leads</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  {csvFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {csvFile.name} ({csvData.length} leads found)
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                {importStatus !== 'idle' && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {importError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{importError}</p>
                  </div>
                )}

                {/* Success Display */}
                {importStatus === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-600">Leads imported successfully!</p>
                  </div>
                )}

                {/* Lead List Details Form */}
                {csvData.length > 0 && importStatus === 'idle' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead List Name *</label>
                      <input
                        type="text"
                        value={newLeadList.name}
                        onChange={(e) => setNewLeadList({...newLeadList, name: e.target.value})}
                        className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Enter lead list name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newLeadList.description}
                        onChange={(e) => setNewLeadList({...newLeadList, description: e.target.value})}
                        className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        rows={2}
                        placeholder="Enter description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newLeadList.location}
                        onChange={(e) => setNewLeadList({...newLeadList, location: e.target.value})}
                        className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Enter location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <input
                        type="text"
                        value={newLeadList.industry}
                        onChange={(e) => setNewLeadList({...newLeadList, industry: e.target.value})}
                        className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Enter industry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={newLeadList.priority}
                        onChange={(e) => setNewLeadList({...newLeadList, priority: e.target.value as any})}
                        className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportLeads}
                disabled={!csvData.length || !newLeadList.name.trim() || importStatus === 'importing'}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{backgroundColor: '#3dbff2'}}
              >
                {importStatus === 'importing' ? 'Importing...' : 'Import Leads'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
