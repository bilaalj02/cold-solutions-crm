'use client'

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { LeadManager, Lead, LeadList, SalesUser } from "../../lib/leads";

export default function ColdCallerLeadList() {
  const [currentUser, setCurrentUser] = useState<SalesUser | null>(null);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLists, setFilteredLists] = useState<LeadList[]>([]);
  const [industryFilter, setIndustryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const router = useRouter();

  // CSV Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'parsing' | 'validating' | 'importing' | 'completed' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [duplicateLeads, setDuplicateLeads] = useState<{lead: Lead, duplicates: Lead[]}[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [newLeadList, setNewLeadList] = useState({
    name: '',
    description: '',
    location: '',
    industry: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical'
  });
  
  // Bulk assignment states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedLeadList, setSelectedLeadList] = useState<LeadList | null>(null);
  const [selectedCaller, setSelectedCaller] = useState('');
  const [assignmentProgress, setAssignmentProgress] = useState(0);
  const [assignmentStatus, setAssignmentStatus] = useState<'idle' | 'assigning' | 'completed' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Check authentication
    const user = LeadManager.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // Load lead lists from LeadManager
    const loadedLeadLists = LeadManager.getLeadLists();
    setLeadLists(loadedLeadLists);
    setFilteredLists(loadedLeadLists);
    setLeads(LeadManager.getLeads());
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

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

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
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // CSV Import Functions
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return data;
  };

  const validateCSVData = (data: any[]): {valid: boolean, errors: string[]} => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('No data found in CSV file');
      return {valid: false, errors};
    }
    
    const requiredFields = ['name', 'phone'];
    const missingFields = requiredFields.filter(field => 
      !data[0].hasOwnProperty(field)
    );
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate email format (only if email is provided)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    data.forEach((row, index) => {
      if (row.email && !emailRegex.test(row.email)) {
        errors.push(`Invalid email format in row ${index + 2}: ${row.email}`);
      }
    });
    
    return {valid: errors.length === 0, errors};
  };

  const convertCSVToLeads = (data: any[]): Lead[] => {
    console.log('Converting CSV data to leads, input data:', data);
    
    const leads = data.map((row, index) => {
      console.log(`Processing row ${index + 1}:`, row);
      
      const lead: Lead = {
        id: LeadManager.generateId(),
        name: row.name || `Lead ${index + 1}`,
        email: row.email || '',
        phone: row.phone || '',
        company: row.company || row.company_name || '',
        position: row.position || row.title || row.job_title || '',
        source: 'CSV Import',
        status: 'New',
        priority: (row.priority || 'Medium') as Lead['priority'],
        score: LeadManager.calculateScore({
          name: row.name,
          email: row.email,
          company: row.company || row.company_name,
          position: row.position || row.title || row.job_title,
          source: 'CSV Import',
          industry: row.industry,
          territory: row.territory || row.region,
          estimatedValue: row.estimated_value ? parseFloat(row.estimated_value) : undefined
        }),
        territory: row.territory || row.region || newLeadList.location,
        industry: row.industry || newLeadList.industry,
        leadSource: 'CSV Import',
        originalSource: 'CSV Import',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        notes: row.notes || row.comments || '',
        tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
        estimatedValue: row.estimated_value ? parseFloat(row.estimated_value) : undefined,
        customFields: {
          csvRow: index + 2,
          ...(row.company_size && { companySize: row.company_size }),
          ...(row.website && { website: row.website }),
          ...(row.address && { address: row.address })
        },
        lifecycle: {
          stage: 'New',
          stageChangedAt: new Date().toISOString(),
          timeInStage: 0
        }
      };
      
      console.log(`Created lead ${index + 1}:`, lead);
      return lead;
    });
    
    console.log('Converted to leads:', leads);
    return leads;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      console.log('Invalid file type');
      setImportError('Please select a CSV file');
      return;
    }
    
    setCsvFile(file);
    setImportError(null);
    console.log('File set, starting to read...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File read completed');
      const csvText = e.target?.result as string;
      console.log('CSV text length:', csvText.length);
      
      const data = parseCSV(csvText);
      console.log('Parsed CSV data:', data);
      setCsvData(data);
      
      const validation = validateCSVData(data);
      console.log('Validation result:', validation);
      if (!validation.valid) {
        setImportError(validation.errors.join('; '));
        return;
      }
      
      setImportStatus('idle');
      console.log('File upload completed successfully');
    };
    
    reader.onerror = (error) => {
      console.error('File read error:', error);
      setImportError('Error reading file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    };
    
    reader.readAsText(file);
  };

  const handleImportLeads = async () => {
    if (!csvData.length) {
      console.log('No CSV data to import');
      return;
    }
    
    console.log('Starting import process with', csvData.length, 'rows');
    setImportStatus('validating');
    setImportProgress(10);
    
    try {
      // Convert CSV data to leads
      console.log('Converting CSV to leads...');
      const newLeads = convertCSVToLeads(csvData);
      console.log('Converted to', newLeads.length, 'leads');
      setImportProgress(30);
      
      // Check for duplicates
      console.log('Checking for duplicates...');
      const duplicates: {lead: Lead, duplicates: Lead[]}[] = [];
      for (const lead of newLeads) {
        const existingDuplicates = LeadManager.findDuplicateLeads(lead);
        if (existingDuplicates.length > 0) {
          duplicates.push({lead, duplicates: existingDuplicates});
        }
      }
      
      console.log('Found', duplicates.length, 'duplicates');
      setImportProgress(50);
      
      if (duplicates.length > 0) {
        setDuplicateLeads(duplicates);
        setShowDuplicateModal(true);
        setImportStatus('idle');
        return;
      }
      
      // Proceed with import
      console.log('Processing import...');
      await processImport(newLeads);
    } catch (error) {
      console.error('Error during import:', error);
      setImportError('Error processing CSV data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setImportStatus('error');
    }
  };

  const processImport = async (leadsToImport: Lead[]) => {
    console.log('Processing import for', leadsToImport.length, 'leads');
    setImportStatus('importing');
    setImportProgress(60);
    
    try {
      // Create lead list first
      console.log('Creating lead list...');
      const leadListId = LeadManager.generateId();
      const leadList: LeadList = {
        id: leadListId,
        name: newLeadList.name,
        description: newLeadList.description,
        territory: newLeadList.location,
        industry: newLeadList.industry,
        priority: newLeadList.priority,
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        leadCount: leadsToImport.length,
        tags: []
      };
      
      // Save lead list
      LeadManager.saveLeadList(leadList);
      console.log('Created lead list:', leadList);
      
      // Save leads with leadListId
      console.log('Saving leads...');
      for (let i = 0; i < leadsToImport.length; i++) {
        const lead = { ...leadsToImport[i], leadListId: leadListId };
        LeadManager.saveLead(lead);
        const progress = 60 + ((i + 1) / leadsToImport.length) * 30;
        setImportProgress(Math.round(progress));
        console.log(`Saved lead ${i + 1}/${leadsToImport.length} (${Math.round(progress)}%)`);
      }
      
      setImportProgress(90);
      console.log('All leads saved');
      
      // Update lead lists
      const updatedLists = LeadManager.getLeadLists();
      setLeadLists(updatedLists);
      setFilteredLists(updatedLists);
      
      // Update leads
      const allLeads = LeadManager.getLeads();
      setLeads(allLeads);
      
      setImportProgress(100);
      setImportStatus('completed');
      console.log('Import completed successfully!');
      
      // Reset form
      setTimeout(() => {
        setShowImportModal(false);
        setCsvFile(null);
        setCsvData([]);
        setImportProgress(0);
        setImportStatus('idle');
        setImportError(null);
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
      console.error('Error in processImport:', error);
      setImportError('Error saving leads: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setImportStatus('error');
    }
  };

  const handleDuplicateResolution = (action: 'skip' | 'merge' | 'import') => {
    if (action === 'skip') {
      // Remove duplicates from import
      const leadsToImport = csvData.map((row, index) => {
        const lead = convertCSVToLeads([row])[0];
        const hasDuplicates = duplicateLeads.some(d => d.lead === lead);
        return hasDuplicates ? null : lead;
      }).filter(Boolean) as Lead[];
      
      processImport(leadsToImport);
    } else if (action === 'merge') {
      // Merge duplicates and import
      const leadsToImport = csvData.map((row, index) => {
        const lead = convertCSVToLeads([row])[0];
        const duplicateInfo = duplicateLeads.find(d => d.lead === lead);
        
        if (duplicateInfo) {
          // Merge with first duplicate
          const mergedLead = LeadManager.mergeLeads(duplicateInfo.duplicates[0].id, lead.id);
          return mergedLead || lead;
        }
        
        return lead;
      }).filter(Boolean) as Lead[];
      
      processImport(leadsToImport);
    } else {
      // Import all (including duplicates)
      const leadsToImport = convertCSVToLeads(csvData);
      processImport(leadsToImport);
    }
    
    setShowDuplicateModal(false);
    setDuplicateLeads([]);
  };

  // Bulk Assignment Functions
  const handleBulkAssignment = (leadList: LeadList) => {
    setSelectedLeadList(leadList);
    setShowAssignmentModal(true);
    setAssignmentStatus('idle');
    setAssignmentProgress(0);
  };

  const processBulkAssignment = async () => {
    if (!selectedLeadList || !selectedCaller) return;

    try {
      setAssignmentStatus('assigning');
      setAssignmentProgress(10);

      // Get all leads for this lead list (in a real app, you'd filter by lead list ID)
      const allLeads = LeadManager.getLeads();
      const leadsToAssign = allLeads.filter(lead => 
        lead.territory === selectedLeadList.territory && 
        lead.industry === selectedLeadList.industry &&
        !lead.assignedTo
      );

      setAssignmentProgress(30);

      // Assign leads to caller
      let successCount = 0;
      for (let i = 0; i < leadsToAssign.length; i++) {
        const lead = leadsToAssign[i];
        if (LeadManager.assignLeadToUser(lead.id, selectedCaller)) {
          successCount++;
        }
        setAssignmentProgress(30 + ((i + 1) / leadsToAssign.length) * 60);
      }

      setAssignmentProgress(90);

      // Update lead list with assignment info
      const updatedLists = leadLists.map(list => 
        list.id === selectedLeadList.id 
          ? { ...list, assignedTo: LeadManager.getUserById(selectedCaller)?.name }
          : list
      );
      setLeadLists(updatedLists);
      setFilteredLists(updatedLists);

      setAssignmentProgress(100);
      setAssignmentStatus('completed');

      // Reset form after delay
      setTimeout(() => {
        setShowAssignmentModal(false);
        setSelectedLeadList(null);
        setSelectedCaller('');
        setAssignmentProgress(0);
        setAssignmentStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      setAssignmentStatus('error');
    }
  };

  const industries = [...new Set(leadLists.map(list => list.industry).filter(Boolean))];

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
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/cold-caller">
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
        
        <div className="p-4 border-t border-gray-600">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">person</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-gray-300">{currentUser?.role || 'User'}</p>
            </div>
          </div>
        <div className="flex flex-col gap-2">
            {currentUser?.role === 'Admin' && (
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/settings">
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </a>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white"
            >
            <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
            <p className="text-sm font-medium leading-normal">Logout</p>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Lead Lists</h1>
              <p className="text-sm text-gray-600 mt-1">Select a lead list to start making calls</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  console.log('Import CSV button clicked!');
                  setShowImportModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#3dbff2'}}
              >
                <span className="material-symbols-outlined text-base">upload</span>
                Import CSV
              </button>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {filteredLists.reduce((acc, list) => acc + 0, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Calls Today</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {filteredLists.filter(list => list.status === 'Active').length}
                  </div>
                  <div className="text-xs text-gray-500">Active Lists</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Industry:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                <option value="All">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select 
                className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2] sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Lead Lists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <div key={list.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{color: '#0a2240'}}>{list.name}</h3>
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
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(0, list.leadCount)}%`,
                          backgroundColor: '#3dbff2'
                        }}
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


                  {/* Action Buttons */}
                  <div className="space-y-2">
                  <a 
                    href={`/cold-caller/list/${list.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      list.status === 'Active' 
                        ? 'text-white hover:opacity-90' 
                        : 'text-gray-500 bg-gray-100 cursor-not-allowed'
                    }`}
                    style={list.status === 'Active' ? {backgroundColor: '#3dbff2'} : {}}
                  >
                    <span className="material-symbols-outlined text-base">
                      {list.status === 'Completed' ? 'check_circle' : 'call'}
                    </span>
                    {list.status === 'Active' ? 'Start Calling' : 
                     list.status === 'Completed' ? 'Completed' : 'Paused'}
                  </a>
                    
                    {list.status === 'Active' && (
                      <button
                        onClick={() => handleBulkAssignment(list)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Assign to Caller
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLists.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-400 text-2xl">search_off</span>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>No Lead Lists Found</h3>
              <p className="text-gray-600">No lead lists match your current filter criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Import Leads from CSV</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {(importStatus === 'idle' || (importStatus === 'parsing' && csvData.length > 0)) && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required fields: name, phone. Optional: email, company, position, industry, territory, notes, tags
                  </p>
                </div>

                {csvData.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="material-symbols-outlined text-green-600 mr-2">check_circle</span>
                        <span className="text-green-800 font-medium">
                          CSV file parsed successfully! Found {csvData.length} leads.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lead List Name *
                        </label>
                        <input
                          type="text"
                          value={newLeadList.name}
                          onChange={(e) => setNewLeadList({...newLeadList, name: e.target.value})}
                          className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                          placeholder="e.g., Q1 2024 Tech Leads"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={newLeadList.location}
                          onChange={(e) => setNewLeadList({...newLeadList, location: e.target.value})}
                          className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                          placeholder="e.g., New York, NY or East Coast"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <select
                          value={newLeadList.industry}
                          onChange={(e) => setNewLeadList({...newLeadList, industry: e.target.value})}
                          className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                        >
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Retail">Retail</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={newLeadList.priority}
                          onChange={(e) => setNewLeadList({...newLeadList, priority: e.target.value as any})}
                          className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newLeadList.description}
                        onChange={(e) => setNewLeadList({...newLeadList, description: e.target.value})}
                        className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                        rows={3}
                        placeholder="Brief description of this lead list..."
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowImportModal(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          console.log('Import button clicked!');
                          console.log('CSV data length:', csvData.length);
                          console.log('Lead list name:', newLeadList.name);
                          handleImportLeads();
                        }}
                        disabled={!newLeadList.name}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{backgroundColor: '#3dbff2'}}
                      >
                        Import {csvData.length} Leads
                      </button>
                    </div>
                  </div>
                )}

                {importError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-red-600 mr-2">error</span>
                      <span className="text-red-800">{importError}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {importStatus !== 'idle' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-2xl">
                    {importStatus === 'completed' ? 'check_circle' : 'upload'}
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>
                  {importStatus === 'completed' ? 'Import Completed!' : 
                   importStatus === 'parsing' ? 'Parsing CSV...' :
                   importStatus === 'validating' ? 'Validating Data...' :
                   importStatus === 'importing' ? 'Importing Leads...' : 'Processing...'}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${importProgress}%`,
                      backgroundColor: '#3dbff2'
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{importProgress}% Complete</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Duplicate Resolution Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Duplicate Leads Found</h2>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                We found {duplicateLeads.length} leads that may be duplicates of existing leads. 
                How would you like to handle them?
              </p>
            </div>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {duplicateLeads.map((duplicate, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium" style={{color: '#0a2240'}}>
                      {duplicate.lead.name} ({duplicate.lead.email})
                    </h4>
                    <span className="text-sm text-gray-500">
                      {duplicate.duplicates.length} potential duplicate(s)
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Company: {duplicate.lead.company || 'N/A'}</p>
                    <p>Phone: {duplicate.lead.phone}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Existing leads:</p>
                    {duplicate.duplicates.map((dup, i) => (
                      <div key={i} className="text-xs text-gray-600 ml-2">
                        • {dup.name} ({dup.email}) - {dup.company || 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleDuplicateResolution('skip')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Skip Duplicates
              </button>
              <button
                onClick={() => handleDuplicateResolution('merge')}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#3dbff2'}}
              >
                Merge & Import
              </button>
              <button
                onClick={() => handleDuplicateResolution('import')}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#10b981'}}
              >
                Import All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assignment Modal */}
      {showAssignmentModal && selectedLeadList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Assign Lead List</h2>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {assignmentStatus === 'idle' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>
                    {selectedLeadList.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedLeadList.description}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-blue-600 mr-2">info</span>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">This will assign all unassigned leads in this list to the selected caller.</p>
                        <p className="mt-1">Territory: {selectedLeadList.territory} | Industry: {selectedLeadList.industry}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Cold Caller
                  </label>
                  <select
                    value={selectedCaller}
                    onChange={(e) => setSelectedCaller(e.target.value)}
                    className="w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-[#3dbff2] focus:outline-none focus:ring-[#3dbff2]"
                  >
                    <option value="">Choose a caller...</option>
                    {LeadManager.getUsers().map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.territory || 'No Territory'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowAssignmentModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processBulkAssignment}
                    disabled={!selectedCaller}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{backgroundColor: '#3dbff2'}}
                  >
                    Assign Leads
                  </button>
                </div>
              </div>
            )}

            {assignmentStatus !== 'idle' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-2xl">
                    {assignmentStatus === 'completed' ? 'check_circle' : 'person_add'}
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-2" style={{color: '#0a2240'}}>
                  {assignmentStatus === 'completed' ? 'Assignment Completed!' : 'Assigning Leads...'}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${assignmentProgress}%`,
                      backgroundColor: '#3dbff2'
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{assignmentProgress}% Complete</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}