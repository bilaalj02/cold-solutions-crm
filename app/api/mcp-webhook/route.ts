import { NextRequest, NextResponse } from 'next/server'

// Define the webhook data types
interface WebhookData {
  type: 'lead_created' | 'lead_updated' | 'lead_status_changed' | 'record_created' | 'record_updated' | 'metrics_updated'
  timestamp: string
  database?: string
  recordId?: string
  data: any
  changes?: any
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

        // TODO: Add lead to your dashboard database/state
        // You can integrate with your existing lead management system here
        // Example: await addLeadToDashboard(webhookData.data)
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
      'metrics_updated'
    ]
  })
}