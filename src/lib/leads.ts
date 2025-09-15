export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  source: 'Website' | 'Referral' | 'Social Media' | 'Email Campaign' | 'Cold Call' | 'Event' | 'CSV Import' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  assignedTo?: string;
  territory?: string;
  industry?: string;
  leadSource?: string;
  originalSource?: string;
  campaignId?: string;
  leadListId?: string;
  createdAt: string;
  updatedAt: string;
  lastInteraction?: string;
  nextFollowUp?: string;
  notes: string;
  callOutcome?: 'Booked Demo' | 'Interested' | 'Not Interested' | 'Requested More Info' | 'No Answer' | 'Callback Requested';
  callNotes?: string;
  lastCallDate?: string;
  tags: string[];
  estimatedValue?: number;
  expectedCloseDate?: string;
  customFields?: Record<string, any>;
  lifecycle: {
    stage: string;
    stageChangedAt: string;
    timeInStage: number;
  };
  duplicateOf?: string;
  isDuplicate?: boolean;
}

export interface LeadList {
  id: string;
  name: string;
  description?: string;
  territory?: string;
  industry?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Paused' | 'Completed';
  createdAt: string;
  updatedAt: string;
  leadCount: number;
  tags: string[];
}

export interface SalesUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Manager' | 'Sales Rep' | 'User';
  territory?: string;
  department?: string;
  maxLeads?: number;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export class LeadManager {
  private static STORAGE_KEY = 'cold_caller_leads';
  private static USERS_KEY = 'cold_caller_users';
  private static LEAD_LISTS_KEY = 'cold_caller_lead_lists';

  static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Lead Management
  static getLeads(): Lead[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  }

  static saveLead(lead: Lead): void {
    const leads = this.getLeads();
    const existingIndex = leads.findIndex(l => l.id === lead.id);
    
    if (existingIndex >= 0) {
      leads[existingIndex] = { ...lead, updatedAt: new Date().toISOString().split('T')[0] };
    } else {
      leads.push(lead);
    }
    
    this.saveLeads(leads);
  }

  static saveLeads(leads: Lead[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
    }
  }

  static deleteLead(id: string): void {
    const leads = this.getLeads().filter(l => l.id !== id);
    this.saveLeads(leads);
  }

  static getLeadById(id: string): Lead | undefined {
    return this.getLeads().find(lead => lead.id === id);
  }

  // Lead List Management
  static getLeadLists(): LeadList[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.LEAD_LISTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  }

  static saveLeadList(leadList: LeadList): void {
    const leadLists = this.getLeadLists();
    const existingIndex = leadLists.findIndex(l => l.id === leadList.id);
    
    if (existingIndex >= 0) {
      leadLists[existingIndex] = { ...leadList, updatedAt: new Date().toISOString().split('T')[0] };
    } else {
      leadLists.push(leadList);
    }
    
    this.saveLeadLists(leadLists);
  }

  static saveLeadLists(leadLists: LeadList[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.LEAD_LISTS_KEY, JSON.stringify(leadLists));
    }
  }

  static deleteLeadList(id: string): void {
    const leadLists = this.getLeadLists().filter(l => l.id !== id);
    this.saveLeadLists(leadLists);
  }

  static getLeadListById(id: string): LeadList | undefined {
    return this.getLeadLists().find(leadList => leadList.id === id);
  }

  static createLeadList(data: Omit<LeadList, 'id' | 'createdAt' | 'updatedAt' | 'leadCount'>): LeadList {
    const leadList: LeadList = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      leadCount: 0
    };
    
    this.saveLeadList(leadList);
    return leadList;
  }

  // User Management
  static getUsers(): SalesUser[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.USERS_KEY);
    if (!stored) {
      // Create default admin and caller users
      const defaultUsers = [
        {
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@coldcaller.com',
          password: 'admin123',
          role: 'Admin' as const,
          territory: 'All',
          department: 'Management',
          maxLeads: 1000,
          active: true,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: undefined
        },
        {
          id: 'caller-001',
          name: 'Cold Caller',
          email: 'caller@coldcaller.com',
          password: 'caller123',
          role: 'Sales Rep' as const,
          territory: 'All',
          department: 'Sales',
          maxLeads: 200,
          active: true,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: undefined
        }
      ];
      this.saveUsers(defaultUsers);
      console.log('Created default users:', defaultUsers);
      return defaultUsers;
    }
    const users = JSON.parse(stored);
    console.log('Loaded users from storage:', users);
    return users;
  }

  static saveUser(user: SalesUser): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.saveUsers(users);
  }

  static saveUsers(users: SalesUser[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  static authenticateUser(email: string, password: string): SalesUser | null {
    const users = this.getUsers();
    console.log('Attempting to authenticate:', email, 'with users:', users);
    const user = users.find(u => u.email === email && u.password === password && u.active);
    console.log('Found user:', user);
    
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.saveUser(user);
    }
    
    return user || null;
  }

  static getCurrentUser(): SalesUser | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('current_caller');
    if (!stored) return null;
    
    const userId = JSON.parse(stored);
    return this.getUsers().find(u => u.id === userId) || null;
  }

  static setCurrentUser(user: SalesUser | null): void {
    if (typeof window === 'undefined') return;
    
    if (user) {
      localStorage.setItem('current_caller', JSON.stringify(user.id));
    } else {
      localStorage.removeItem('current_caller');
    }
  }

  static logout(): void {
    this.setCurrentUser(null);
  }

  static createUser(data: Omit<SalesUser, 'id' | 'createdAt'>): SalesUser {
    const user: SalesUser = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.saveUser(user);
    return user;
  }

  static deleteUser(id: string): void {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    this.saveUsers(filteredUsers);
  }

  static getUserById(id: string): SalesUser | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  // Analytics for cold callers
  static getCallAnalytics(timePeriod: 'day' | 'week' | 'month' | 'year' = 'day', callerId?: string) {
    const leads = this.getLeads();
    const now = new Date();
    let startDate: Date;

    switch (timePeriod) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const filteredLeads = leads.filter(lead => {
      if (callerId && lead.assignedTo !== callerId) return false;
      if (!lead.lastCallDate) return false;
      const callDate = new Date(lead.lastCallDate);
      return callDate >= startDate;
    });

    const totalCalls = filteredLeads.length;
    const callsByOutcome = filteredLeads.reduce((acc, lead) => {
      const outcome = lead.callOutcome || 'Unknown';
      acc[outcome] = (acc[outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCalls,
      callsByOutcome,
      timePeriod,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }
}
