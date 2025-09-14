import { Lead } from './leads';

export interface NotionProperty {
  id: string;
  type: string;
  name?: any;
  email?: any;
  phone_number?: any;
  select?: any;
  rich_text?: any;
  number?: any;
  date?: any;
}

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
}

export interface NotionDatabaseResponse {
  results: NotionPage[];
  next_cursor?: string;
  has_more: boolean;
}

export class NotionAPI {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.notion.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NOTION_API_KEY || '';
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async queryDatabase(databaseId: string, filter?: any, sorts?: any[]): Promise<NotionDatabaseResponse> {
    const body: any = {};
    
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    return this.makeRequest(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getDatabase(databaseId: string): Promise<any> {
    return this.makeRequest(`/databases/${databaseId}`);
  }

  async createPage(databaseId: string, properties: Record<string, any>): Promise<NotionPage> {
    return this.makeRequest('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });
  }

  async updatePage(pageId: string, properties: Record<string, any>): Promise<NotionPage> {
    return this.makeRequest(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
  }

  // Convert Notion page to Lead object
  convertNotionPageToLead(page: NotionPage): Lead {
    const props = page.properties;
    
    return {
      id: page.id,
      name: this.extractTextProperty(props.Name || props.name) || 'Unknown',
      email: this.extractEmailProperty(props.Email || props.email) || '',
      phone: this.extractPhoneProperty(props.Phone || props.phone) || '',
      company: this.extractTextProperty(props.Company || props.company) || '',
      position: this.extractTextProperty(props.Position || props.position) || '',
      source: this.extractSelectProperty(props.Source || props.source) || 'Notion',
      status: this.extractSelectProperty(props.Status || props.status) || 'New',
      score: this.extractNumberProperty(props.Score || props.score) || 50,
      priority: this.extractSelectProperty(props.Priority || props.priority) || 'Medium',
      territory: this.extractSelectProperty(props.Territory || props.territory) || 'Unassigned',
      industry: this.extractSelectProperty(props.Industry || props.industry) || 'Other',
      leadSource: this.extractSelectProperty(props['Lead Source'] || props.lead_source) || 'Notion',
      assignedTo: this.extractSelectProperty(props['Assigned To'] || props.assigned_to) || '',
      notes: this.extractTextProperty(props.Notes || props.notes) || '',
      tags: this.extractMultiSelectProperty(props.Tags || props.tags) || [],
      createdAt: new Date(page.created_time).toISOString(),
      updatedAt: new Date(page.last_edited_time).toISOString(),
      nextFollowUp: this.extractDateProperty(props['Next Follow Up'] || props.next_follow_up),
      lastContactDate: this.extractDateProperty(props['Last Contact'] || props.last_contact),
      isDuplicate: false,
      duplicateOf: undefined,
      lifecycleStage: this.extractSelectProperty(props['Lifecycle Stage'] || props.lifecycle_stage) || 'Lead'
    };
  }

  // Convert Lead to Notion properties
  convertLeadToNotionProperties(lead: Lead): Record<string, any> {
    return {
      Name: { title: [{ text: { content: lead.name } }] },
      Email: { email: lead.email },
      Phone: { phone_number: lead.phone },
      Company: { rich_text: [{ text: { content: lead.company || '' } }] },
      Position: { rich_text: [{ text: { content: lead.position || '' } }] },
      Source: { select: { name: lead.source } },
      Status: { select: { name: lead.status } },
      Score: { number: lead.score },
      Priority: { select: { name: lead.priority } },
      Territory: { select: { name: lead.territory } },
      Industry: { select: { name: lead.industry } },
      'Lead Source': { select: { name: lead.leadSource } },
      'Assigned To': { select: { name: lead.assignedTo || '' } },
      Notes: { rich_text: [{ text: { content: lead.notes || '' } }] },
      'Next Follow Up': lead.nextFollowUp ? { date: { start: lead.nextFollowUp } } : null,
      'Last Contact': lead.lastContactDate ? { date: { start: lead.lastContactDate } } : null,
      'Lifecycle Stage': { select: { name: lead.lifecycleStage } }
    };
  }

  private extractTextProperty(prop: NotionProperty): string {
    if (!prop) return '';
    
    if (prop.type === 'title' && prop.title) {
      return prop.title.map((t: any) => t.plain_text).join('');
    }
    
    if (prop.type === 'rich_text' && prop.rich_text) {
      return prop.rich_text.map((t: any) => t.plain_text).join('');
    }
    
    return '';
  }

  private extractEmailProperty(prop: NotionProperty): string {
    if (!prop) return '';
    return prop.type === 'email' ? prop.email : '';
  }

  private extractPhoneProperty(prop: NotionProperty): string {
    if (!prop) return '';
    return prop.type === 'phone_number' ? prop.phone_number : '';
  }

  private extractSelectProperty(prop: NotionProperty): string {
    if (!prop) return '';
    return prop.type === 'select' && prop.select ? prop.select.name : '';
  }

  private extractMultiSelectProperty(prop: NotionProperty): string[] {
    if (!prop || prop.type !== 'multi_select') return [];
    return prop.multi_select ? prop.multi_select.map((option: any) => option.name) : [];
  }

  private extractNumberProperty(prop: NotionProperty): number {
    if (!prop) return 0;
    return prop.type === 'number' ? prop.number || 0 : 0;
  }

  private extractDateProperty(prop: NotionProperty): string | undefined {
    if (!prop || prop.type !== 'date') return undefined;
    return prop.date ? prop.date.start : undefined;
  }
}

// Singleton instance
export const notionAPI = new NotionAPI();