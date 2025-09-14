import { Client } from "@notionhq/client";

const DATABASES = JSON.parse(process.env.NOTION_DATABASES || '{}');

// Check if we're in development and API key is not set
if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_key_here') {
  console.warn('Notion API key not configured. Notion sync will not work.');
}

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  created_time: string;
  service_interest?: string;
  company?: string;
  notes?: string;
}

export interface DatabaseStats {
  total: number;
  new_today: number;
  qualified: number;
  converted: number;
}

export class NotionService {
  private notion: Client;

  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });
  }

  async getLeadsByDatabase(databaseType: keyof typeof DATABASES): Promise<LeadData[]> {
    try {
      // Check if Notion is properly configured
      if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_key_here') {
        console.warn(`Notion API not configured for database: ${String(databaseType)}`);
        return [];
      }

      const databaseId = DATABASES[databaseType];
      if (!databaseId) {
        throw new Error(`Database not found for type: ${String(databaseType)}`);
      }

      const response = await this.notion.databases.query({
        database_id: databaseId,
        page_size: 100,
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'descending',
          },
        ],
      });

      return response.results.map((page: any) => {
        const properties = page.properties;
        return {
          id: page.id,
          name: this.getPropertyValue(properties.Name || properties.name) || 'Unknown',
          email: this.getPropertyValue(properties.Email || properties.email) || '',
          phone: this.getPropertyValue(properties.Phone || properties.phone) || '',
          source: String(databaseType),
          status: this.getPropertyValue(properties.Status || properties.status) || 'New',
          created_time: page.created_time,
          service_interest: this.getPropertyValue(properties['Service Interest'] || properties.service_interest) || '',
          company: this.getPropertyValue(properties.Company || properties.company) || '',
          notes: this.getPropertyValue(properties.Notes || properties.notes) || '',
        };
      });
    } catch (error) {
      console.error(`Error fetching leads from ${String(databaseType)}:`, error);
      return [];
    }
  }

  async getAllLeads(): Promise<LeadData[]> {
    const allLeads: LeadData[] = [];
    
    for (const dbType of Object.keys(DATABASES)) {
      const leads = await this.getLeadsByDatabase(dbType as keyof typeof DATABASES);
      allLeads.push(...leads);
    }

    return allLeads.sort((a, b) => 
      new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
    );
  }

  async getDatabaseStats(databaseType: keyof typeof DATABASES): Promise<DatabaseStats> {
    const leads = await this.getLeadsByDatabase(databaseType);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newToday = leads.filter(lead => 
      new Date(lead.created_time) >= today
    ).length;

    const qualified = leads.filter(lead => 
      ['qualified', 'interested', 'hot'].includes(lead.status.toLowerCase())
    ).length;

    const converted = leads.filter(lead => 
      ['converted', 'closed', 'won'].includes(lead.status.toLowerCase())
    ).length;

    return {
      total: leads.length,
      new_today: newToday,
      qualified,
      converted,
    };
  }

  async getAllStats(): Promise<Record<string, DatabaseStats>> {
    const stats: Record<string, DatabaseStats> = {};
    
    for (const dbType of Object.keys(DATABASES)) {
      stats[dbType] = await this.getDatabaseStats(dbType as keyof typeof DATABASES);
    }

    return stats;
  }

  private getPropertyValue(property: any): string {
    if (!property) return '';
    
    switch (property.type) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'email':
        return property.email || '';
      case 'phone_number':
        return property.phone_number || '';
      case 'select':
        return property.select?.name || '';
      case 'multi_select':
        return property.multi_select?.map((item: any) => item.name).join(', ') || '';
      case 'date':
        return property.date?.start || '';
      case 'checkbox':
        return property.checkbox ? 'Yes' : 'No';
      case 'number':
        return property.number?.toString() || '';
      case 'url':
        return property.url || '';
      default:
        return '';
    }
  }
}

export const notionService = new NotionService();