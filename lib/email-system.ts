export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'follow-up' | 'nurture' | 'proposal' | 'closing' | 'win' | 'lost' | 'custom';
  leadStage?: string;
  industry?: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
}

export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  type: 'one-time' | 'sequence' | 'drip';
  templateId?: string;
  sequenceTemplates?: string[];
  targetSegment: {
    territories?: string[];
    industries?: string[];
    leadStages?: string[];
    leadSources?: string[];
    tags?: string[];
    customFilters?: any[];
  };
  schedule: {
    startDate: string;
    endDate?: string;
    frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    time?: string;
    timezone: string;
  };
  settings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    trackOpens: boolean;
    trackClicks: boolean;
    unsubscribeLink: boolean;
  };
  stats: {
    totalTargeted: number;
    sent: number;
    delivered: number;
    bounced: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    replied: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'lead-stage-change' | 'date-based' | 'lead-score' | 'tag-added';
  triggerConditions: any;
  steps: EmailSequenceStep[];
  isActive: boolean;
  stats: {
    enrolled: number;
    completed: number;
    dropOffRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailSequenceStep {
  id: string;
  order: number;
  templateId: string;
  delay: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  conditions?: {
    skipIf?: any[];
    stopIf?: any[];
  };
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
}

export interface EmailLog {
  id: string;
  leadId: string;
  campaignId?: string;
  sequenceId?: string;
  templateId: string;
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'replied' | 'unsubscribed';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  repliedAt?: string;
  errorMessage?: string;
  metadata: {
    fromEmail: string;
    toEmail: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class EmailManager {
  private static templates: EmailTemplate[] = [
    {
      id: 'welcome-new-lead',
      name: 'Welcome - New Lead',
      subject: 'Welcome {{firstName}} - Let\'s Transform Your {{industry}} Business',
      content: `Hi {{firstName}},

Welcome to Cold Solutions! I noticed your interest in improving your {{industry}} operations.

We've helped over 200+ businesses like {{company}} reduce costs by 30% while improving efficiency.

I'd love to schedule a quick 15-minute call to discuss:
• Your current challenges with {{painPoint}}
• How we've solved similar issues for {{industry}} companies
• A custom solution tailored to {{company}}

Are you available for a brief call this week?

Best regards,
{{senderName}}
{{senderTitle}}
Cold Solutions

P.S. Check out our recent case study with a similar {{industry}} company: {{caseStudyLink}}`,
      type: 'welcome',
      leadStage: 'New',
      variables: ['firstName', 'lastName', 'company', 'industry', 'painPoint', 'senderName', 'senderTitle', 'caseStudyLink'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      stats: { sent: 150, opened: 105, clicked: 42, replied: 18 }
    },
    {
      id: 'follow-up-no-response',
      name: 'Follow-up - No Response',
      subject: 'Quick follow-up on {{company}}\'s {{industry}} optimization',
      content: `Hi {{firstName}},

I wanted to quickly follow up on my previous email about helping {{company}} optimize your {{industry}} operations.

I understand you're busy, so I'll keep this brief.

Many {{industry}} companies are facing:
• Rising operational costs
• Inefficient processes
• Compliance challenges

We've developed proven solutions that have saved our clients an average of $50,000+ annually.

Would a 10-minute call work better for you? I have slots available this week.

If you'd like to schedule a time, just reply with your preferred day and time.

Best,
{{senderName}}

P.S. If you'd prefer to see results first, here's a {{industry}} case study: {{caseStudyLink}}`,
      type: 'follow-up',
      leadStage: 'Contacted',
      variables: ['firstName', 'company', 'industry', 'senderName', 'caseStudyLink'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      stats: { sent: 89, opened: 67, clicked: 23, replied: 11 }
    },
    {
      id: 'proposal-ready',
      name: 'Proposal Ready',
      subject: 'Your Custom {{industry}} Solution Proposal - {{company}}',
      content: `Hi {{firstName}},

Great news! I've prepared a custom proposal for {{company}} based on our discussion about your {{industry}} challenges.

The proposal includes:
✓ Detailed analysis of your current situation
✓ Recommended solutions tailored to {{company}}
✓ Expected ROI and timeline
✓ Investment options and next steps

Key highlights:
• Projected annual savings: $75,000+
• Implementation timeline: 4-6 weeks
• Expected ROI: 300%+

I've attached the full proposal to this email.

When would be a good time to review this together? I'm available this week and next.

Looking forward to moving forward with transforming {{company}}'s {{industry}} operations!

Best regards,
{{senderName}}
{{senderTitle}}
Cold Solutions`,
      type: 'proposal',
      leadStage: 'Qualified',
      variables: ['firstName', 'company', 'industry', 'senderName', 'senderTitle'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      stats: { sent: 34, opened: 32, clicked: 28, replied: 15 }
    }
  ];

  private static campaigns: EmailCampaign[] = [
    {
      id: 'q1-2024-outreach',
      name: 'Q1 2024 Industry Outreach',
      description: 'Targeted outreach to manufacturing and healthcare leads',
      status: 'active',
      type: 'sequence',
      sequenceTemplates: ['welcome-new-lead', 'follow-up-no-response'],
      targetSegment: {
        industries: ['Manufacturing', 'Healthcare'],
        leadStages: ['New', 'Contacted']
      },
      schedule: {
        startDate: '2024-01-15',
        frequency: 'daily',
        time: '09:00',
        timezone: 'America/New_York'
      },
      settings: {
        fromName: 'Mike Johnson',
        fromEmail: 'mike@coldsolutions.com',
        replyTo: 'replies@coldsolutions.com',
        trackOpens: true,
        trackClicks: true,
        unsubscribeLink: true
      },
      stats: {
        totalTargeted: 450,
        sent: 420,
        delivered: 412,
        bounced: 8,
        opened: 298,
        clicked: 89,
        unsubscribed: 3,
        replied: 47
      },
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      createdBy: 'mike.johnson'
    }
  ];

  private static sequences: EmailSequence[] = [
    {
      id: 'new-lead-nurture',
      name: 'New Lead Nurture Sequence',
      description: 'Automated nurture sequence for new leads',
      trigger: 'lead-stage-change',
      triggerConditions: { fromStage: null, toStage: 'New' },
      isActive: true,
      steps: [
        {
          id: 'step-1',
          order: 1,
          templateId: 'welcome-new-lead',
          delay: { value: 0, unit: 'hours' },
          stats: { sent: 150, opened: 105, clicked: 42, replied: 18 }
        },
        {
          id: 'step-2',
          order: 2,
          templateId: 'follow-up-no-response',
          delay: { value: 3, unit: 'days' },
          conditions: {
            skipIf: [{ field: 'status', operator: 'equals', value: 'Qualified' }]
          },
          stats: { sent: 89, opened: 67, clicked: 23, replied: 11 }
        }
      ],
      stats: {
        enrolled: 150,
        completed: 89,
        dropOffRate: 40.7
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z'
    }
  ];

  static getTemplates(): EmailTemplate[] {
    return this.templates;
  }

  static getTemplateById(id: string): EmailTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  static getCampaigns(): EmailCampaign[] {
    return this.campaigns;
  }

  static getCampaignById(id: string): EmailCampaign | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  static getSequences(): EmailSequence[] {
    return this.sequences;
  }

  static getSequenceById(id: string): EmailSequence | undefined {
    return this.sequences.find(s => s.id === id);
  }

  static createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): EmailTemplate {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { sent: 0, opened: 0, clicked: 0, replied: 0 }
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  static updateTemplate(id: string, updates: Partial<EmailTemplate>): EmailTemplate | null {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.templates[index];
  }

  static createCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): EmailCampaign {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalTargeted: 0,
        sent: 0,
        delivered: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        replied: 0
      }
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  static replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  static getAvailableVariables(): string[] {
    return [
      'firstName', 'lastName', 'fullName', 'company', 'position', 'industry', 
      'territory', 'email', 'phone', 'leadSource', 'leadStage', 'painPoint',
      'senderName', 'senderTitle', 'senderEmail', 'senderPhone',
      'caseStudyLink'
    ];
  }
}