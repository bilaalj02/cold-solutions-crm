import { Client } from "@notionhq/client";

// Parse database configuration with fallback
let DATABASES: Record<string, string> = {};
try {
  if (process.env.NOTION_DATABASES) {
    const databasesArray = JSON.parse(process.env.NOTION_DATABASES);
    // Convert array to object for easier lookup
    if (Array.isArray(databasesArray)) {
      DATABASES = databasesArray.reduce((acc: Record<string, string>, db: any) => {
        acc[db.name] = db.id;
        return acc;
      }, {});
    } else {
      DATABASES = databasesArray;
    }
  }
} catch (error) {
  console.warn('Failed to parse NOTION_DATABASES:', error);
  DATABASES = {};
}

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

      // Map frontend slugs to actual database names
      const slugToNameMap: Record<string, string> = {
        'inbound': 'inbound-voice-leads',
        'ai-audit-pre-call': 'ai-audit-pre-call',
        'ai-audit-post-call': 'ai-audit-post-call',
        'cold-caller-followup': 'whatsapp-followup-leads',
        'whatsapp-bot': 'whatsapp-bot-leads',
        'website-leads': 'website-leads'
      };

      const actualDatabaseName = slugToNameMap[String(databaseType)] || String(databaseType);
      let databaseId = DATABASES[actualDatabaseName];

      // Fallback: try to find database by partial name match if exact match fails
      if (!databaseId) {
        const availableNames = Object.keys(DATABASES);
        const partialMatch = availableNames.find(name =>
          name.includes(String(databaseType)) || String(databaseType).includes(name.split('-')[0])
        );
        if (partialMatch) {
          databaseId = DATABASES[partialMatch];
          console.warn(`Using fallback database: ${partialMatch} for slug: ${String(databaseType)}`);
        }
      }

      if (!databaseId) {
        console.error(`Database lookup failed:`);
        console.error(`- Requested slug: ${String(databaseType)}`);
        console.error(`- Mapped to: ${actualDatabaseName}`);
        console.error(`- Available databases:`, Object.keys(DATABASES));
        throw new Error(`Database not found for type: ${String(databaseType)} (mapped to: ${actualDatabaseName})`);
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

  async createLead(leadData: any): Promise<LeadData> {
    try {
      if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_key_here') {
        throw new Error('Notion API not configured');
      }

      // Map frontend slugs to actual database names
      const slugToNameMap: Record<string, string> = {
        'inbound': 'inbound-voice-leads',
        'ai-audit-pre-call': 'ai-audit-pre-call',
        'ai-audit-post-call': 'ai-audit-post-call',
        'cold-caller-followup': 'whatsapp-followup-leads',
        'whatsapp-bot': 'whatsapp-bot-leads',
        'website-leads': 'website-leads'
      };

      // Determine which database to use
      const databaseSlug = leadData.database || 'website-leads';
      const actualDatabaseName = slugToNameMap[databaseSlug] || databaseSlug;
      const databaseId = DATABASES[actualDatabaseName];

      if (!databaseId) {
        console.error(`Available databases:`, Object.keys(DATABASES));
        throw new Error(`Database not found for type: ${databaseSlug} (mapped to: ${actualDatabaseName})`);
      }

      const response = await this.notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [{ text: { content: leadData.name } }]
          },
          Email: {
            email: leadData.email
          },
          Phone: {
            phone_number: leadData.phone || ''
          },
          Company: {
            rich_text: [{ text: { content: leadData.company || '' } }]
          },
          Status: {
            select: { name: leadData.status || 'New' }
          },
          Notes: {
            rich_text: [{ text: { content: leadData.notes || '' } }]
          }
        }
      });

      return {
        id: response.id,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || '',
        source: actualDatabaseName,
        status: leadData.status || 'New',
        created_time: new Date().toISOString(),
        company: leadData.company || '',
        notes: leadData.notes || ''
      };
    } catch (error) {
      console.error('Error creating lead in Notion:', error);
      throw error;
    }
  }

  async deleteLead(leadId: string): Promise<void> {
    try {
      if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_key_here') {
        throw new Error('Notion API not configured');
      }

      await this.notion.pages.update({
        page_id: leadId,
        archived: true
      });
    } catch (error) {
      console.error('Error deleting lead from Notion:', error);
      throw error;
    }
  }

  async getLeadById(leadId: string): Promise<LeadData | null> {
    try {
      if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_key_here') {
        throw new Error('Notion API not configured');
      }

      const response = await this.notion.pages.retrieve({ page_id: leadId });

      if ('properties' in response) {
        const properties = response.properties;
        return {
          id: response.id,
          name: this.getPropertyValue(properties.Name || properties.name) || 'Unknown',
          email: this.getPropertyValue(properties.Email || properties.email) || '',
          phone: this.getPropertyValue(properties.Phone || properties.phone) || '',
          source: 'Unknown',
          status: this.getPropertyValue(properties.Status || properties.status) || 'New',
          created_time: response.created_time,
          company: this.getPropertyValue(properties.Company || properties.company) || '',
          notes: this.getPropertyValue(properties.Notes || properties.notes) || '',
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching lead by ID from Notion:', error);
      return null;
    }
  }

  async updateLead(leadId: string, leadData: any): Promise<LeadData> {
    try {
      if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_key_here') {
        throw new Error('Notion API not configured');
      }

      const properties: any = {};

      if (leadData.name) {
        properties.Name = { title: [{ text: { content: leadData.name } }] };
      }
      if (leadData.email) {
        properties.Email = { email: leadData.email };
      }
      if (leadData.phone) {
        properties.Phone = { phone_number: leadData.phone };
      }
      if (leadData.company) {
        properties.Company = { rich_text: [{ text: { content: leadData.company } }] };
      }
      if (leadData.status) {
        properties.Status = { select: { name: leadData.status } };
      }
      if (leadData.notes) {
        properties.Notes = { rich_text: [{ text: { content: leadData.notes } }] };
      }

      const response = await this.notion.pages.update({
        page_id: leadId,
        properties
      });

      return {
        id: leadId,
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        source: 'Updated',
        status: leadData.status || 'New',
        created_time: new Date().toISOString(),
        company: leadData.company || '',
        notes: leadData.notes || ''
      };
    } catch (error) {
      console.error('Error updating lead in Notion:', error);
      throw error;
    }
  }

  async syncLeadsFromNotion(databaseType?: keyof typeof DATABASES): Promise<LeadData[]> {
    try {
      if (databaseType) {
        return await this.getLeadsByDatabase(databaseType);
      } else {
        return await this.getAllLeads();
      }
    } catch (error) {
      console.error('Error syncing leads from Notion:', error);
      throw error;
    }
  }

  async syncAllLeadsFromNotion(): Promise<LeadData[]> {
    return await this.getAllLeads();
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