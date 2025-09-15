import { Lead } from './leads'

// Webhook lead processing utilities
export class WebhookLeadProcessor {
  private static WEBHOOK_LEADS_KEY = 'webhook_leads'
  private static PROCESSED_WEBHOOKS_KEY = 'processed_webhooks'

  // Store incoming webhook lead data
  static storeWebhookLead(webhookData: any): void {
    if (typeof window === 'undefined') return

    const webhookLeads = this.getStoredWebhookLeads()
    webhookLeads.push({
      ...webhookData,
      storedAt: new Date().toISOString()
    })

    localStorage.setItem(this.WEBHOOK_LEADS_KEY, JSON.stringify(webhookLeads))
    console.log('📥 Webhook lead stored for processing:', webhookData.data?.name)
  }

  // Get stored webhook leads
  static getStoredWebhookLeads(): any[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.WEBHOOK_LEADS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Convert webhook data to CRM lead format
  static convertWebhookToLead(webhookData: any): Lead {
    const data = webhookData.data || {}

    return {
      id: webhookData.recordId || `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || 'Unknown Lead',
      email: data.email || '',
      phone: data.phone || '',
      company: data.businessName || data.company || '',
      position: '',
      source: this.mapSource(data.source || webhookData.database),
      status: 'New',
      priority: 'Medium',
      score: 0,
      assignedTo: '',
      territory: '',
      industry: data.service || data.industry || '',
      leadSource: webhookData.database || 'MCP Server',
      originalSource: `${webhookData.database || 'Unknown'} via MCP`,
      notes: data.message || '',
      createdAt: webhookData.timestamp ? new Date(webhookData.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      lastContactedAt: '',
      nextFollowUpAt: '',
      tags: [
        'mcp-lead',
        webhookData.database || 'unknown-source',
        data.service ? data.service.toLowerCase().replace(/\s+/g, '-') : ''
      ].filter(Boolean),
      customFields: {
        mcpDatabase: webhookData.database,
        mcpRecordId: webhookData.recordId,
        webhookType: webhookData.type,
        webhookTimestamp: webhookData.timestamp,
        originalWebhookData: webhookData
      }
    }
  }

  // Map webhook sources to CRM source enum
  private static mapSource(source: string): Lead['source'] {
    if (!source) return 'Other'

    const lowerSource = source.toLowerCase()

    if (lowerSource.includes('website') || lowerSource.includes('web')) {
      return 'Website'
    } else if (lowerSource.includes('call') || lowerSource.includes('voice') || lowerSource.includes('inbound')) {
      return 'Cold Call'
    } else if (lowerSource.includes('referral')) {
      return 'Referral'
    } else if (lowerSource.includes('social')) {
      return 'Social Media'
    } else if (lowerSource.includes('email')) {
      return 'Email Campaign'
    } else if (lowerSource.includes('event')) {
      return 'Event'
    } else {
      return 'Other'
    }
  }

  // Process all stored webhook leads and add them to CRM
  static processStoredWebhookLeads(): { processed: number, leads: Lead[] } {
    if (typeof window === 'undefined') return { processed: 0, leads: [] }

    const webhookLeads = this.getStoredWebhookLeads()
    const processedWebhooks = this.getProcessedWebhooks()
    const newLeads: Lead[] = []

    webhookLeads.forEach(webhookData => {
      // Skip if already processed
      const webhookId = webhookData.recordId || `${webhookData.timestamp}_${webhookData.data?.email}`
      if (processedWebhooks.includes(webhookId)) {
        return
      }

      // Convert to CRM lead
      const lead = this.convertWebhookToLead(webhookData)
      newLeads.push(lead)

      // Mark as processed
      processedWebhooks.push(webhookId)
    })

    // Save processed webhooks list
    localStorage.setItem(this.PROCESSED_WEBHOOKS_KEY, JSON.stringify(processedWebhooks))

    // Clear processed webhook leads
    if (newLeads.length > 0) {
      localStorage.removeItem(this.WEBHOOK_LEADS_KEY)
    }

    console.log(`🔄 Processed ${newLeads.length} webhook leads`)
    return { processed: newLeads.length, leads: newLeads }
  }

  // Get list of processed webhook IDs
  private static getProcessedWebhooks(): string[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.PROCESSED_WEBHOOKS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Clear all webhook data (for testing/reset)
  static clearWebhookData(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(this.WEBHOOK_LEADS_KEY)
    localStorage.removeItem(this.PROCESSED_WEBHOOKS_KEY)
    console.log('🧹 Cleared all webhook data')
  }
}