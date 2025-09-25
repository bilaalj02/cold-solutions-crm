import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Define the webhook data types
interface WebhookData {
  type: 'lead_created' | 'lead_updated' | 'lead_status_changed' | 'record_created' | 'record_updated' | 'metrics_updated' | 'email_sent'
  timestamp: string
  database?: string
  recordId?: string
  data: any
  changes?: any
}

// Email log interface for MCP server data
interface MCPEmailLog {
  timestamp: string
  status: 'SUCCESS' | 'ERROR'
  to: string
  from: string
  subject: string
  messageId: string | null
  template: string
  variables: Record<string, any>
  error?: string
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to store email log in Supabase
async function storeEmailLog(emailLog: MCPEmailLog) {
  const { error } = await supabase
    .from('email_logs')
    .insert({
      id: `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      template_id: emailLog.template,
      subject: emailLog.subject,
      status: emailLog.status === 'SUCCESS' ? 'sent' : 'bounced',
      sent_at: emailLog.timestamp,
      delivered_at: emailLog.status === 'SUCCESS' ? emailLog.timestamp : null,
      error_message: emailLog.error || null,
      metadata: {
        fromEmail: emailLog.from,
        toEmail: emailLog.to,
        messageId: emailLog.messageId,
        variables: emailLog.variables,
        source: 'mcp_server'
      },
      lead_id: null, // Will be linked later if needed
      campaign_id: null,
      sequence_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (error) {
    throw new Error(`Failed to store email log: ${error.message}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    // First, get the raw request body for debugging
    const rawBody = await request.text()
    console.log('📡 Raw webhook body received:', rawBody)

    // Try to parse the JSON
    let webhookData: WebhookData
    try {
      webhookData = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('Raw body that failed to parse:', rawBody)
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        rawBody: rawBody.substring(0, 500) // First 500 chars for debugging
      }, { status: 400 })
    }

    // Log webhook receipt
    console.log('📡 Cold Solutions MCP Server webhook received:', {
      type: webhookData.type || 'undefined',
      timestamp: webhookData.timestamp || 'undefined',
      database: webhookData.database || 'undefined',
      recordId: webhookData.recordId || 'undefined'
    })

    // Handle malformed webhook data
    if (!webhookData.type) {
      console.warn('⚠️ Received webhook with missing type field:', webhookData)
      return NextResponse.json({
        success: false,
        error: 'Missing webhook type',
        received: webhookData
      }, { status: 400 })
    }

    // Handle different webhook types from MCP server
    switch (webhookData.type) {
      case 'lead_created':
        console.log('🆕 New lead created:', {
          name: webhookData.data.name,
          email: webhookData.data.email,
          service: webhookData.data.service,
          database: webhookData.database
        })

        // Store lead data for dashboard pickup
        const leadForDashboard = {
          id: webhookData.recordId || `webhook_${Date.now()}`,
          name: webhookData.data.name || 'Unknown Lead',
          email: webhookData.data.email || '',
          phone: webhookData.data.phone || '',
          company: webhookData.data.businessName || '',
          source: mapSource(webhookData.data.source || webhookData.database),
          status: 'New' as const,
          priority: 'Medium' as const,
          score: 0,
          assignedTo: '',
          territory: '',
          industry: webhookData.data.service || '',
          leadSource: webhookData.database || 'MCP Server',
          originalSource: `${webhookData.database} via MCP`,
          notes: webhookData.data.message || '',
          createdAt: webhookData.timestamp ? new Date(webhookData.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          lastInteraction: webhookData.timestamp || new Date().toISOString(),
          nextFollowUp: '',
          tags: ['mcp-lead', webhookData.database || 'unknown'],
          lifecycle: {
            stage: 'New',
            stageChangedAt: new Date().toISOString(),
            timeInStage: 0
          },
          customFields: {
            mcpDatabase: webhookData.database,
            mcpRecordId: webhookData.recordId
          }
        }

        console.log('📝 Lead ready for dashboard:', leadForDashboard.name)
        break

      case 'lead_updated':
        console.log('✏️ Lead updated:', {
          leadId: webhookData.recordId,
          changes: webhookData.changes,
          database: webhookData.database
        })

        // TODO: Update lead in your dashboard
        // Example: await updateLeadInDashboard(webhookData.recordId, webhookData.changes)
        break

      case 'lead_status_changed':
        console.log('📈 Lead status changed:', {
          leadId: webhookData.recordId,
          oldStatus: webhookData.data?.oldStatus,
          newStatus: webhookData.data?.newStatus,
          database: webhookData.database
        })

        // TODO: Update lead status in dashboard
        // Example: await updateLeadStatus(webhookData.recordId, webhookData.data.newStatus)
        break

      case 'record_created':
        console.log('📝 New record created in database:', {
          database: webhookData.database,
          recordId: webhookData.recordId,
          timestamp: webhookData.timestamp
        })

        // TODO: Handle new records based on database type
        // Different handling for different database types
        if (webhookData.database === 'ai-audit-post-call') {
          console.log('🔍 AI Audit completed for lead')
          // Handle audit completion
        } else if (webhookData.database === 'whatsapp-bot-leads') {
          console.log('💬 WhatsApp bot generated new lead')
          // Handle WhatsApp leads
        }
        break

      case 'record_updated':
        console.log('🔄 Record updated:', {
          recordId: webhookData.recordId,
          database: webhookData.database,
          changes: webhookData.changes
        })

        // TODO: Handle record updates
        break

      case 'metrics_updated':
        console.log('📊 Business metrics updated:', webhookData.data)

        // TODO: Update dashboard metrics/analytics
        // Example: await updateDashboardMetrics(webhookData.data)
        break

      case 'email_sent':
        console.log('📧 Email log received from MCP server:', {
          to: webhookData.data.to,
          subject: webhookData.data.subject,
          status: webhookData.data.status
        })

        // Store email log in CRM database
        try {
          await storeEmailLog(webhookData.data as MCPEmailLog)
          console.log('✅ Email log stored successfully')
        } catch (error) {
          console.error('❌ Failed to store email log:', error)
        }
        break

      default:
        console.log('ℹ️ Unknown webhook type received:', webhookData.type)
    }

    // Send success response back to MCP server
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString(),
      processed: {
        type: webhookData.type,
        recordId: webhookData.recordId,
        database: webhookData.database
      }
    })

  } catch (error) {
    console.error('❌ MCP webhook processing error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for testing the endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Cold Solutions MCP Webhook Endpoint',
    status: 'Active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supportedEvents: [
      'lead_created',
      'lead_updated',
      'lead_status_changed',
      'record_created',
      'record_updated',
      'metrics_updated',
      'email_sent'
    ]
  })
}

// Helper function to map MCP sources to CRM sources
function mapSource(source: string): 'Website' | 'Referral' | 'Social Media' | 'Email Campaign' | 'Cold Call' | 'Event' | 'CSV Import' | 'Other' {
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