import { Client } from '@notionhq/client';

// Notion CRM Database Integration
export class NotionCRMService {
  private notion: Client;
  private crmDatabaseId: string;

  constructor() {
    // Initialize Notion client with CRM database
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY || process.env.NOTION_TOKEN
    });
    this.crmDatabaseId = process.env.NOTION_CRM_DATABASE_ID || '271c6af7fe2a80f38695d0a28bf9724a';
  }

  /**
   * Fetch call data from Notion CRM database
   */
  async getCallDataFromNotion(): Promise<any[]> {
    try {
      console.log('📋 Fetching call data from Notion CRM database...');

      const response = await this.notion.databases.query({
        database_id: this.crmDatabaseId,
        page_size: 100,
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'descending'
          }
        ]
      });

      const callData = response.results.map((page: any) => {
        // Extract call information from Notion page properties
        const businessName = page.properties['Business Name']?.title?.[0]?.text?.content || 'Unknown';
        const contactName = page.properties['Contact Name']?.rich_text?.[0]?.text?.content || 'Unknown';
        const email = page.properties['Email']?.email || null;
        const phone = page.properties['Phone']?.phone_number || null;
        const status = page.properties['Status']?.status?.name || 'Unknown';
        const notes = page.properties['Notes']?.rich_text?.[0]?.text?.content || '';
        const callOutcome = page.properties['Call Outcome']?.select?.name || 'No Outcome';
        const createdTime = page.created_time;

        return {
          call_id: page.id,
          lead_id: page.id,
          lead_name: contactName,
          lead_email: email,
          lead_phone: phone,
          lead_company: businessName,
          call_outcome: callOutcome,
          call_notes: notes,
          caller_name: 'Cold Caller', // Default from Cold Caller App
          caller_role: 'Sales Rep',
          timestamp: createdTime,
          lead_source: 'Cold Caller App',
          status: status
        };
      });

      console.log(`✅ Fetched ${callData.length} calls from Notion CRM`);
      return callData;

    } catch (error) {
      console.error('❌ Error fetching call data from Notion:', error);
      return [];
    }
  }

  /**
   * Get call statistics from Notion CRM database
   */
  async getCallStatsFromNotion(startDate: Date, endDate: Date): Promise<any> {
    try {
      const callData = await this.getCallDataFromNotion();

      // Filter by date range
      const filteredCalls = callData.filter(call => {
        const callDate = new Date(call.timestamp);
        return callDate >= startDate && callDate <= endDate;
      });

      // Calculate statistics
      const totalCalls = filteredCalls.length;
      const successfulOutcomes = ['Booked Demo', 'Interested', 'Requested More Info'];
      const unsuccessfulOutcomes = ['Not Interested', 'No Answer'];
      const pendingOutcomes = ['Callback Requested', 'Follow Up Required'];

      const successful = filteredCalls.filter(call =>
        successfulOutcomes.includes(call.call_outcome)
      ).length;

      const unsuccessful = filteredCalls.filter(call =>
        unsuccessfulOutcomes.includes(call.call_outcome)
      ).length;

      const pending = filteredCalls.filter(call =>
        pendingOutcomes.includes(call.call_outcome)
      ).length;

      // Group by outcome
      const callsByOutcome: Record<string, number> = {};
      filteredCalls.forEach(call => {
        const outcome = call.call_outcome || 'No Outcome';
        callsByOutcome[outcome] = (callsByOutcome[outcome] || 0) + 1;
      });

      // Group by day for charts
      const callsByDay: Record<string, number> = {};
      filteredCalls.forEach(call => {
        const day = new Date(call.timestamp).toISOString().split('T')[0];
        callsByDay[day] = (callsByDay[day] || 0) + 1;
      });

      const stats = {
        totalCalls,
        successful,
        unsuccessful,
        pending,
        callsByOutcome,
        callsByDay,
        averageCallDuration: 0 // Notion doesn't track duration
      };

      console.log('📊 Notion CRM stats:', {
        totalCalls,
        successful,
        successRate: totalCalls > 0 ? Math.round((successful / totalCalls) * 100) : 0
      });

      return stats;

    } catch (error) {
      console.error('❌ Error calculating Notion CRM stats:', error);
      return {
        totalCalls: 0,
        successful: 0,
        unsuccessful: 0,
        pending: 0,
        callsByOutcome: {},
        callsByDay: {},
        averageCallDuration: 0
      };
    }
  }

  /**
   * Test connection to Notion CRM database
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.notion.databases.retrieve({ database_id: this.crmDatabaseId });
      console.log('✅ Notion CRM connection successful');
      return true;
    } catch (error) {
      console.error('❌ Notion CRM connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notionCRMService = new NotionCRMService();