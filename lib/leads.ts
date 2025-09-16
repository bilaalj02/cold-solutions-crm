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

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'Status Change' | 'Score Change' | 'Assignment' | 'Task' | 'Follow-up';
  description: string;
  createdAt: string;
  createdBy: string;
  duration?: number;
  outcome?: 'Positive' | 'Negative' | 'Neutral';
  scheduledFor?: string;
  completed?: boolean;
  metadata?: Record<string, any>;
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

export interface Territory {
  id: string;
  name: string;
  description?: string;
  criteria: {
    states?: string[];
    industries?: string[];
    companySizeRange?: { min: number; max: number };
    valueRange?: { min: number; max: number };
  };
  assignedUsers: string[];
  active: boolean;
}

export interface ScoringRule {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  };
  points: number;
  active: boolean;
  priority: number;
}

export interface AutoRouting {
  id: string;
  name: string;
  description: string;
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
  action: {
    type: 'assign_to_user' | 'assign_to_territory' | 'set_priority' | 'add_tag';
    value: string;
  };
  active: boolean;
  priority: number;
}

export interface LeadList {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  territory?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  leadCount: number;
  status: 'Active' | 'Inactive' | 'Completed';
  tags: string[];
}

// Default users data
export const defaultUsers: SalesUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@coldsolutions.com',
    password: 'password123',
    role: 'Manager',
    territory: 'East Coast',
    department: 'Sales',
    maxLeads: 50,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@coldsolutions.com',
    password: 'password123',
    role: 'Sales Rep',
    territory: 'West Coast',
    department: 'Sales',
    maxLeads: 30,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@coldsolutions.com',
    password: 'password123',
    role: 'Sales Rep',
    territory: 'Midwest',
    department: 'Sales',
    maxLeads: 25,
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Default territories
export const defaultTerritories: Territory[] = [
  {
    id: '1',
    name: 'East Coast',
    description: 'Eastern United States territory',
    criteria: {
      states: ['NY', 'NJ', 'CT', 'MA', 'PA', 'FL', 'GA', 'NC', 'SC', 'VA'],
      industries: ['Technology', 'Finance', 'Healthcare'],
      companySizeRange: { min: 50, max: 1000 }
    },
    assignedUsers: ['1', '2'],
    active: true
  },
  {
    id: '2',
    name: 'West Coast',
    description: 'Western United States territory',
    criteria: {
      states: ['CA', 'WA', 'OR', 'NV', 'AZ'],
      industries: ['Technology', 'Entertainment', 'Retail'],
      companySizeRange: { min: 25, max: 500 }
    },
    assignedUsers: ['2'],
    active: true
  },
  {
    id: '3',
    name: 'Midwest',
    description: 'Midwest United States territory',
    criteria: {
      states: ['IL', 'MI', 'OH', 'IN', 'WI', 'MN', 'IA', 'MO'],
      industries: ['Manufacturing', 'Agriculture', 'Healthcare'],
      companySizeRange: { min: 10, max: 250 }
    },
    assignedUsers: ['3'],
    active: true
  }
];

// Default scoring rules
export const defaultScoringRules: ScoringRule[] = [
  {
    id: '1',
    name: 'High-Value Lead',
    description: 'Leads with estimated value over $20,000',
    criteria: { field: 'estimatedValue', operator: 'greater_than', value: 20000 },
    points: 15,
    active: true,
    priority: 1
  },
  {
    id: '2',
    name: 'Referral Source',
    description: 'Leads from referrals get bonus points',
    criteria: { field: 'source', operator: 'equals', value: 'Referral' },
    points: 20,
    active: true,
    priority: 2
  },
  {
    id: '3',
    name: 'Technology Industry',
    description: 'Technology companies get higher priority',
    criteria: { field: 'industry', operator: 'equals', value: 'Technology' },
    points: 10,
    active: true,
    priority: 3
  },
  {
    id: '4',
    name: 'Enterprise Contact',
    description: 'C-level or VP contacts get bonus points',
    criteria: { field: 'position', operator: 'contains', value: 'CEO|CTO|VP|Director' },
    points: 12,
    active: true,
    priority: 4
  }
];

// Default auto-routing rules
export const defaultAutoRouting: AutoRouting[] = [
  {
    id: '1',
    name: 'East Coast Auto-Assignment',
    description: 'Auto-assign East Coast leads to John Doe',
    conditions: [
      { field: 'territory', operator: 'equals', value: 'East Coast' },
      { field: 'estimatedValue', operator: 'greater_than', value: 10000 }
    ],
    action: { type: 'assign_to_user', value: '1' },
    active: true,
    priority: 1
  },
  {
    id: '2',
    name: 'High Priority Leads',
    description: 'Set high priority for valuable leads',
    conditions: [
      { field: 'estimatedValue', operator: 'greater_than', value: 50000 }
    ],
    action: { type: 'set_priority', value: 'High' },
    active: true,
    priority: 2
  },
  {
    id: '3',
    name: 'Technology Leads Tagging',
    description: 'Add tech tag to technology industry leads',
    conditions: [
      { field: 'industry', operator: 'equals', value: 'Technology' }
    ],
    action: { type: 'add_tag', value: 'tech-industry' },
    active: true,
    priority: 3
  }
];

// Default leads data
export const defaultLeads: Lead[] = [
  {
    id: '1',
    name: 'Ethan Harper',
    email: 'ethan.harper@example.com',
    phone: '555-123-4567',
    company: 'TechCorp Inc.',
    position: 'Marketing Director',
    source: 'Website',
    status: 'Qualified',
    priority: 'High',
    score: 85,
    assignedTo: '1',
    territory: 'East Coast',
    industry: 'Technology',
    leadSource: 'Google Ads',
    originalSource: 'Website',
    campaignId: 'CAMP_001',
    createdAt: '2023-01-15',
    updatedAt: '2023-01-16',
    lastInteraction: '2 days ago',
    nextFollowUp: '2023-01-20',
    notes: 'Interested in AI voice solutions for their call center. Budget approved.',
    tags: ['high-priority', 'tech', 'budget-approved'],
    estimatedValue: 15000,
    expectedCloseDate: '2023-02-15',
    customFields: { companySize: 250, decisionMaker: true },
    lifecycle: { stage: 'Qualified', stageChangedAt: '2023-01-16', timeInStage: 2 }
  },
  {
    id: '2',
    name: 'Olivia Bennett',
    email: 'olivia.bennett@example.com',
    phone: '555-987-6543',
    company: 'Healthcare Plus',
    position: 'Operations Manager',
    source: 'Referral',
    status: 'Contacted',
    priority: 'Medium',
    score: 78,
    assignedTo: '2',
    territory: 'West Coast',
    industry: 'Healthcare',
    leadSource: 'Partner Referral',
    originalSource: 'Referral',
    createdAt: '2023-02-20',
    updatedAt: '2023-02-22',
    lastInteraction: '3 days ago',
    nextFollowUp: '2023-02-28',
    notes: 'Needs solution for patient appointment scheduling. Follow up next week.',
    tags: ['healthcare', 'warm', 'referral'],
    estimatedValue: 8500,
    expectedCloseDate: '2023-03-10',
    customFields: { companySize: 150, urgency: 'medium' },
    lifecycle: { stage: 'Contacted', stageChangedAt: '2023-02-21', timeInStage: 5 }
  },
  {
    id: '3',
    name: 'Noah Carter',
    email: 'noah.carter@example.com',
    phone: '555-246-8013',
    company: 'Real Estate Pro',
    position: 'CEO',
    source: 'Social Media',
    status: 'New',
    priority: 'Medium',
    score: 62,
    territory: 'East Coast',
    industry: 'Real Estate',
    leadSource: 'LinkedIn',
    originalSource: 'Social Media',
    createdAt: '2023-03-10',
    updatedAt: '2023-03-10',
    lastInteraction: '5 days ago',
    nextFollowUp: '2023-03-15',
    notes: 'Found us through LinkedIn. Interested in lead qualification system.',
    tags: ['real-estate', 'new', 'linkedin'],
    estimatedValue: 12000,
    expectedCloseDate: '2023-04-15',
    customFields: { companySize: 50, decisionMaker: true },
    lifecycle: { stage: 'New', stageChangedAt: '2023-03-10', timeInStage: 8 }
  },
  {
    id: '4',
    name: 'Ava Davis',
    email: 'ava.davis@example.com',
    phone: '555-369-1470',
    company: 'Financial Services LLC',
    position: 'VP Operations',
    source: 'Website',
    status: 'New',
    priority: 'High',
    score: 65,
    assignedTo: '1',
    territory: 'East Coast',
    industry: 'Finance',
    leadSource: 'Content Download',
    originalSource: 'Website',
    campaignId: 'CAMP_002',
    createdAt: '2023-04-05',
    updatedAt: '2023-04-05',
    nextFollowUp: '2023-04-08',
    notes: 'Downloaded our whitepaper. Potential high-value client.',
    tags: ['finance', 'whitepaper', 'high-value'],
    estimatedValue: 25000,
    customFields: { companySize: 500, budget: 'approved' },
    lifecycle: { stage: 'New', stageChangedAt: '2023-04-05', timeInStage: 3 }
  },
  {
    id: '5',
    name: 'Liam Evans',
    email: 'liam.evans@example.com',
    phone: '555-753-9512',
    company: 'Dental Care Group',
    position: 'Practice Manager',
    source: 'Referral',
    status: 'Contacted',
    priority: 'High',
    score: 71,
    assignedTo: '2',
    territory: 'West Coast',
    industry: 'Healthcare',
    leadSource: 'Client Referral',
    originalSource: 'Referral',
    createdAt: '2023-05-12',
    updatedAt: '2023-05-14',
    lastInteraction: '1 day ago',
    nextFollowUp: '2023-05-18',
    notes: 'Referred by existing client. Very interested in our dental practice solution.',
    tags: ['healthcare', 'referral', 'hot', 'existing-client'],
    estimatedValue: 7500,
    expectedCloseDate: '2023-06-01',
    customFields: { companySize: 25, referredBy: 'MedCorp Solutions' },
    lifecycle: { stage: 'Contacted', stageChangedAt: '2023-05-13', timeInStage: 4 }
  }
];

export class LeadManager {
  private static STORAGE_KEY = 'cold_solutions_leads';
  private static ACTIVITIES_KEY = 'cold_solutions_lead_activities';
  private static USERS_KEY = 'cold_solutions_users';
  private static TERRITORIES_KEY = 'cold_solutions_territories';
  private static SCORING_RULES_KEY = 'cold_solutions_scoring_rules';
  private static AUTO_ROUTING_KEY = 'cold_solutions_auto_routing';
  private static LEAD_LISTS_KEY = 'cold_solutions_lead_lists';

  static getLeads(): Lead[] {
    if (typeof window === 'undefined') return defaultLeads;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      this.saveLeads(defaultLeads);
      return defaultLeads;
    }
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

  static deleteLead(id: string): void {
    const leads = this.getLeads().filter(l => l.id !== id);
    this.saveLeads(leads);
  }

  static saveLeads(leads: Lead[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(leads));
    }
  }

  static getLeadById(id: string): Lead | undefined {
    return this.getLeads().find(lead => lead.id === id);
  }

  static addActivity(activity: LeadActivity): void {
    if (typeof window === 'undefined') return;
    
    const activities = this.getActivities();
    activities.unshift(activity);
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
  }

  static getActivities(leadId?: string): LeadActivity[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.ACTIVITIES_KEY);
    const activities = stored ? JSON.parse(stored) : [];
    
    if (leadId) {
      return activities.filter((a: LeadActivity) => a.leadId === leadId);
    }
    
    return activities;
  }

  static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }


  // Territory Management
  static getTerritories(): Territory[] {
    if (typeof window === 'undefined') return defaultTerritories;
    
    const stored = localStorage.getItem(this.TERRITORIES_KEY);
    if (!stored) {
      this.saveTerritories(defaultTerritories);
      return defaultTerritories;
    }
    return JSON.parse(stored);
  }

  static saveTerritories(territories: Territory[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TERRITORIES_KEY, JSON.stringify(territories));
    }
  }

  static getTerritoryById(id: string): Territory | undefined {
    return this.getTerritories().find(territory => territory.id === id);
  }

  static assignLeadToTerritory(leadId: string): string | null {
    const lead = this.getLeadById(leadId);
    if (!lead) return null;

    const territories = this.getTerritories();
    for (const territory of territories) {
      if (!territory.active) continue;

      // Check territory criteria
      if (territory.criteria.industries && lead.industry) {
        if (!territory.criteria.industries.includes(lead.industry)) continue;
      }

      if (territory.criteria.valueRange && lead.estimatedValue) {
        const { min, max } = territory.criteria.valueRange;
        if (lead.estimatedValue < min || lead.estimatedValue > max) continue;
      }

      // If all criteria match, assign to this territory
      lead.territory = territory.name;
      this.saveLead(lead);
      return territory.id;
    }

    return null;
  }

  // Scoring Rules Management
  static getScoringRules(): ScoringRule[] {
    if (typeof window === 'undefined') return defaultScoringRules;
    
    const stored = localStorage.getItem(this.SCORING_RULES_KEY);
    if (!stored) {
      this.saveScoringRules(defaultScoringRules);
      return defaultScoringRules;
    }
    return JSON.parse(stored);
  }

  static saveScoringRules(rules: ScoringRule[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SCORING_RULES_KEY, JSON.stringify(rules));
    }
  }

  static addScoringRule(rule: ScoringRule): void {
    const rules = this.getScoringRules();
    rules.push(rule);
    this.saveScoringRules(rules);
  }

  // Auto-Routing Management
  static getAutoRoutingRules(): AutoRouting[] {
    if (typeof window === 'undefined') return defaultAutoRouting;
    
    const stored = localStorage.getItem(this.AUTO_ROUTING_KEY);
    if (!stored) {
      this.saveAutoRoutingRules(defaultAutoRouting);
      return defaultAutoRouting;
    }
    return JSON.parse(stored);
  }

  static saveAutoRoutingRules(rules: AutoRouting[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.AUTO_ROUTING_KEY, JSON.stringify(rules));
    }
  }

  // Advanced Lead Operations
  static findDuplicateLeads(newLead: Partial<Lead>): Lead[] {
    const leads = this.getLeads();
    const duplicates: Lead[] = [];

    for (const lead of leads) {
      let matchScore = 0;
      
      // Email exact match (highest weight)
      if (newLead.email && lead.email.toLowerCase() === newLead.email.toLowerCase()) {
        matchScore += 100;
      }
      
      // Phone number match (high weight)
      if (newLead.phone && lead.phone.replace(/\D/g, '') === newLead.phone.replace(/\D/g, '')) {
        matchScore += 80;
      }
      
      // Name + Company match (medium weight)
      if (newLead.name && newLead.company && lead.name && lead.company) {
        const nameMatch = this.calculateSimilarity(newLead.name, lead.name);
        const companyMatch = this.calculateSimilarity(newLead.company, lead.company);
        if (nameMatch > 0.8 && companyMatch > 0.8) {
          matchScore += 60;
        }
      }
      
      // If match score is above threshold, consider it a duplicate
      if (matchScore >= 60) {
        duplicates.push(lead);
      }
    }

    return duplicates;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;
    
    const maxLength = Math.max(s1.length, s2.length);
    const editDistance = this.levenshteinDistance(s1, s2);
    
    return (maxLength - editDistance) / maxLength;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static mergeLeads(primaryLeadId: string, secondaryLeadId: string): Lead | null {
    const primaryLead = this.getLeadById(primaryLeadId);
    const secondaryLead = this.getLeadById(secondaryLeadId);
    
    if (!primaryLead || !secondaryLead) return null;
    
    // Merge data, preferring primary lead but filling in gaps from secondary
    const mergedLead: Lead = {
      ...primaryLead,
      // Merge notes
      notes: primaryLead.notes + (secondaryLead.notes ? '\n\n--- Merged from duplicate lead ---\n' + secondaryLead.notes : ''),
      // Merge tags
      tags: [...new Set([...primaryLead.tags, ...secondaryLead.tags])],
      // Use higher estimated value
      estimatedValue: Math.max(primaryLead.estimatedValue || 0, secondaryLead.estimatedValue || 0),
      // Use earlier created date
      createdAt: primaryLead.createdAt < secondaryLead.createdAt ? primaryLead.createdAt : secondaryLead.createdAt,
      // Update timestamp
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    // Mark secondary lead as duplicate and save merged lead
    secondaryLead.isDuplicate = true;
    secondaryLead.duplicateOf = primaryLeadId;
    
    this.saveLead(mergedLead);
    this.saveLead(secondaryLead);
    
    // Merge activities
    const primaryActivities = this.getActivities(primaryLeadId);
    const secondaryActivities = this.getActivities(secondaryLeadId);
    
    // Update secondary activities to point to primary lead
    secondaryActivities.forEach(activity => {
      activity.leadId = primaryLeadId;
      activity.description = `[Merged] ${activity.description}`;
      this.addActivity(activity);
    });
    
    return mergedLead;
  }

  static assignLeadToUser(leadId: string, userId: string): boolean {
    const lead = this.getLeadById(leadId);
    const user = this.getUserById(userId);
    
    if (!lead || !user) return false;
    
    lead.assignedTo = userId;
    lead.updatedAt = new Date().toISOString().split('T')[0];
    
    this.saveLead(lead);
    
    // Add assignment activity
    const activity: LeadActivity = {
      id: this.generateId(),
      leadId: leadId,
      type: 'Assignment',
      description: `Lead assigned to ${user.name}`,
      createdAt: new Date().toISOString(),
      createdBy: 'System'
    };
    
    this.addActivity(activity);
    return true;
  }

  static bulkAssignLeads(leadIds: string[], userId: string): number {
    let successCount = 0;
    
    leadIds.forEach(leadId => {
      if (this.assignLeadToUser(leadId, userId)) {
        successCount++;
      }
    });
    
    return successCount;
  }

  static bulkUpdateLeadStatus(leadIds: string[], status: Lead['status']): number {
    let successCount = 0;
    
    leadIds.forEach(leadId => {
      const lead = this.getLeadById(leadId);
      if (lead) {
        const oldStatus = lead.status;
        lead.status = status;
        lead.updatedAt = new Date().toISOString().split('T')[0];
        lead.lifecycle.stage = status;
        lead.lifecycle.stageChangedAt = new Date().toISOString();
        
        this.saveLead(lead);
        
        // Add status change activity
        const activity: LeadActivity = {
          id: this.generateId(),
          leadId: leadId,
          type: 'Status Change',
          description: `Status changed from ${oldStatus} to ${status} (bulk operation)`,
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        };
        
        this.addActivity(activity);
        successCount++;
      }
    });
    
    return successCount;
  }

  static bulkUpdateLeadPriority(leadIds: string[], priority: Lead['priority']): number {
    let successCount = 0;
    
    leadIds.forEach(leadId => {
      const lead = this.getLeadById(leadId);
      if (lead) {
        const oldPriority = lead.priority;
        lead.priority = priority;
        lead.updatedAt = new Date().toISOString().split('T')[0];
        
        this.saveLead(lead);
        
        // Add priority change activity
        const activity: LeadActivity = {
          id: this.generateId(),
          leadId: leadId,
          type: 'Note',
          description: `Priority changed from ${oldPriority} to ${priority} (bulk operation)`,
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        };
        
        this.addActivity(activity);
        successCount++;
      }
    });
    
    return successCount;
  }

  static getLeadsByUser(userId: string): Lead[] {
    return this.getLeads().filter(lead => lead.assignedTo === userId && !lead.isDuplicate);
  }

  static getLeadsByTerritory(territory: string): Lead[] {
    return this.getLeads().filter(lead => lead.territory === territory && !lead.isDuplicate);
  }

  static getLeadsByPriority(priority: Lead['priority']): Lead[] {
    return this.getLeads().filter(lead => lead.priority === priority && !lead.isDuplicate);
  }

  static getLeadsByStatus(status: Lead['status']): Lead[] {
    return this.getLeads().filter(lead => lead.status === status && !lead.isDuplicate);
  }

  static applyAutoRouting(leadId: string): boolean {
    const lead = this.getLeadById(leadId);
    if (!lead) return false;
    
    const routingRules = this.getAutoRoutingRules()
      .filter(rule => rule.active)
      .sort((a, b) => a.priority - b.priority);
    
    for (const rule of routingRules) {
      let conditionsMet = true;
      
      for (const condition of rule.conditions) {
        const fieldValue = (lead as any)[condition.field];
        
        switch (condition.operator) {
          case 'equals':
            if (fieldValue !== condition.value) conditionsMet = false;
            break;
          case 'contains':
            if (!fieldValue || !fieldValue.toString().includes(condition.value)) conditionsMet = false;
            break;
          case 'greater_than':
            if (!fieldValue || fieldValue <= condition.value) conditionsMet = false;
            break;
          case 'less_than':
            if (!fieldValue || fieldValue >= condition.value) conditionsMet = false;
            break;
          case 'in':
            if (!condition.value.includes(fieldValue)) conditionsMet = false;
            break;
          case 'not_in':
            if (condition.value.includes(fieldValue)) conditionsMet = false;
            break;
        }
        
        if (!conditionsMet) break;
      }
      
      if (conditionsMet) {
        // Apply the action
        switch (rule.action.type) {
          case 'assign_to_user':
            this.assignLeadToUser(leadId, rule.action.value);
            break;
          case 'assign_to_territory':
            lead.territory = rule.action.value;
            this.saveLead(lead);
            break;
          case 'set_priority':
            lead.priority = rule.action.value as Lead['priority'];
            this.saveLead(lead);
            break;
          case 'add_tag':
            if (!lead.tags.includes(rule.action.value)) {
              lead.tags.push(rule.action.value);
              this.saveLead(lead);
            }
            break;
        }
        
        // Log the routing action
        const activity: LeadActivity = {
          id: this.generateId(),
          leadId: leadId,
          type: 'Note',
          description: `Auto-routing rule applied: ${rule.name}`,
          createdAt: new Date().toISOString(),
          createdBy: 'System'
        };
        
        this.addActivity(activity);
        return true;
      }
    }
    
    return false;
  }

  static calculateScore(lead: Partial<Lead>): number {
    let score = 50; // Base score
    
    // Apply custom scoring rules first
    const scoringRules = this.getScoringRules()
      .filter(rule => rule.active)
      .sort((a, b) => a.priority - b.priority);
    
    for (const rule of scoringRules) {
      const fieldValue = (lead as any)[rule.criteria.field];
      let ruleMatches = false;
      
      switch (rule.criteria.operator) {
        case 'equals':
          ruleMatches = fieldValue === rule.criteria.value;
          break;
        case 'contains':
          ruleMatches = fieldValue && fieldValue.toString().includes(rule.criteria.value);
          break;
        case 'greater_than':
          ruleMatches = fieldValue && fieldValue > rule.criteria.value;
          break;
        case 'less_than':
          ruleMatches = fieldValue && fieldValue < rule.criteria.value;
          break;
        case 'in':
          ruleMatches = rule.criteria.value.includes(fieldValue);
          break;
        case 'not_in':
          ruleMatches = !rule.criteria.value.includes(fieldValue);
          break;
      }
      
      if (ruleMatches) {
        score += rule.points;
      }
    }
    
    // Fallback to default scoring if no custom rules applied significant changes
    if (Math.abs(score - 50) < 10) {
      // Source scoring
      const sourceScores = {
        'Referral': 20,
        'Website': 15,
        'Social Media': 10,
        'Email Campaign': 8,
        'Cold Call': 5,
        'Event': 12,
        'CSV Import': 7,
        'Other': 5
      };
      score += sourceScores[lead.source as keyof typeof sourceScores] || 0;
      
      // Company presence bonus
      if (lead.company) score += 10;
      if (lead.position) score += 5;
      
      // Status bonus
      const statusScores = {
        'New': 0,
        'Contacted': 5,
        'Qualified': 15,
        'Proposal': 20,
        'Negotiation': 25,
        'Won': 30,
        'Lost': -10
      };
      score += statusScores[lead.status as keyof typeof statusScores] || 0;
      
      // Estimated value bonus
      if (lead.estimatedValue) {
        if (lead.estimatedValue > 20000) score += 15;
        else if (lead.estimatedValue > 10000) score += 10;
        else if (lead.estimatedValue > 5000) score += 5;
      }
      
      // Priority bonus
      const priorityScores = {
        'Low': -5,
        'Medium': 0,
        'High': 10,
        'Critical': 15
      };
      score += priorityScores[lead.priority as keyof typeof priorityScores] || 0;
    }
    
    return Math.min(Math.max(score, 0), 100);
  }

  // Lead List Management
  static getLeadLists(): LeadList[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.LEAD_LISTS_KEY);
    if (!stored) {
      return [];
    }
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

  // Analytics methods
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

    const callsByStatus = filteredLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const callsByDay = filteredLeads.reduce((acc, lead) => {
      const date = lead.lastCallDate || '';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCalls,
      callsByOutcome,
      callsByStatus,
      callsByDay,
      timePeriod,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }

  static getCallerPerformance(callerId: string) {
    const leads = this.getLeads().filter(lead => lead.assignedTo === callerId);
    const totalLeads = leads.length;
    const contactedLeads = leads.filter(lead => lead.status !== 'New').length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
    const wonLeads = leads.filter(lead => lead.status === 'Won').length;
    const lostLeads = leads.filter(lead => lead.status === 'Lost').length;

    const callsToday = leads.filter(lead => {
      if (!lead.lastCallDate) return false;
      const callDate = new Date(lead.lastCallDate);
      const today = new Date();
      return callDate.toDateString() === today.toDateString();
    }).length;

    const callsThisWeek = leads.filter(lead => {
      if (!lead.lastCallDate) return false;
      const callDate = new Date(lead.lastCallDate);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return callDate >= weekStart;
    }).length;

    const callsThisMonth = leads.filter(lead => {
      if (!lead.lastCallDate) return false;
      const callDate = new Date(lead.lastCallDate);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return callDate >= monthStart;
    }).length;

    return {
      callerId,
      totalLeads,
      contactedLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      callsToday,
      callsThisWeek,
      callsThisMonth,
      contactRate: totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0,
      qualificationRate: contactedLeads > 0 ? (qualifiedLeads / contactedLeads) * 100 : 0,
      winRate: qualifiedLeads > 0 ? (wonLeads / qualifiedLeads) * 100 : 0
    };
  }

  static getAllCallersPerformance() {
    const leads = this.getLeads();
    const callerIds = [...new Set(leads.map(lead => lead.assignedTo).filter((id): id is string => Boolean(id)))];

    return callerIds.map(callerId => this.getCallerPerformance(callerId));
  }

  // User Management
  static getUsers(): SalesUser[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      
      if (!stored) {
        // Create default admin user
        const defaultUsers = [{
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@coldsolutions.com',
          password: 'admin123',
          role: 'Admin' as const,
          territory: 'All',
          department: 'Management',
          maxLeads: 1000,
          active: true,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: undefined
        }];
        this.saveUsers(defaultUsers);
        return defaultUsers;
      }
      
      const users = JSON.parse(stored);
      console.log('Loaded users from localStorage:', users.length);
      return users;
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
      // Return default admin user if localStorage fails
      return [{
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@coldsolutions.com',
        password: 'admin123',
        role: 'Admin' as const,
        territory: 'All',
        department: 'Management',
        maxLeads: 1000,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: undefined
      }];
    }
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

  static deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    this.saveUsers(users);
  }

  static getUserById(id: string): SalesUser | undefined {
    return this.getUsers().find(user => user.id === id);
  }

  static createUser(data: Omit<SalesUser, 'id' | 'createdAt'>): SalesUser {
    const user: SalesUser = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    this.saveUser(user);
    return user;
  }

  static authenticateUser(email: string, password: string): SalesUser | null {
    try {
      const users = this.getUsers();
      console.log('Authenticating user:', email, 'Total users:', users.length);
      
      const user = users.find(u => {
        const emailMatch = u.email.toLowerCase() === email.toLowerCase();
        const passwordMatch = u.password === password;
        const isActive = u.active;
        console.log('User check:', { email: u.email, emailMatch, passwordMatch, isActive });
        return emailMatch && passwordMatch && isActive;
      });
      
      if (user) {
        console.log('User found:', user.name, user.role);
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUser(user);
        return user;
      } else {
        console.log('No matching user found');
        return null;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  static getCurrentUser(): SalesUser | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('current_user');
    if (!stored) return null;
    
    const userId = JSON.parse(stored);
    return this.getUserById(userId) || null;
  }

  static setCurrentUser(user: SalesUser | null): void {
    if (typeof window === 'undefined') return;
    
    try {
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user.id));
        console.log('Current user set in localStorage:', user.id);
      } else {
        localStorage.removeItem('current_user');
        console.log('Current user removed from localStorage');
      }
    } catch (error) {
      console.error('Error setting current user in localStorage:', error);
    }
  }

  static logout(): void {
    this.setCurrentUser(null);
  }
}