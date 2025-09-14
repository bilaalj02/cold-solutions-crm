export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: 'inbound-voice-leads' | 'website-leads' | 'ai-audit-pre-call' | 'ai-audit-post-call' | 'whatsapp-follow-up' | 'whatsapp-bot-leads';
  status: 'new' | 'contacted' | 'qualified' | 'demo-booked' | 'closed-won' | 'closed-lost' | 'opted-in' | 'follow-up';
  industry?: string;
  notes?: string;
  leadValue?: number;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  nextFollowUp?: Date;
}

export interface VoiceAgentCall {
  id: string;
  leadId?: string;
  callerName?: string;
  callerPhone: string;
  callDuration: number; // in seconds
  callType: 'inbound' | 'outbound';
  outcome: 'qualified' | 'demo-booked' | 'follow-up' | 'not-interested' | 'callback-requested';
  industry?: string;
  summary?: string;
  transcript?: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'sales-rep' | 'manager' | 'admin';
  leadsAssigned: number;
  leadsContacted: number;
  demoBookings: number;
  closedDeals: number;
  revenue: number;
}

export interface BusinessMetrics {
  totalLeads: number;
  leadsThisWeek: number;
  leadsThisMonth: number;
  leadsThisYear: number;
  totalCalls: number;
  callsThisWeek: number;
  callsThisMonth: number;
  conversionRate: number;
  avgResponseTime: number; // in minutes
  totalRevenue: number;
  revenueThisMonth: number;
}

export interface DatabaseStats {
  name: string;
  id: string;
  type: string;
  description: string;
  leadCount: number;
  newLeadsToday: number;
  conversionRate: number;
  lastUpdated: Date;
}

export interface AIAuditData {
  id: string;
  leadId: string;
  businessName: string;
  website?: string;
  industry: string;
  currentTech: string[];
  painPoints: string[];
  recommendations: string[];
  estimatedROI: number;
  auditStatus: 'scheduled' | 'in-progress' | 'completed' | 'follow-up-needed';
  auditDate?: Date;
  completedBy?: string;
}