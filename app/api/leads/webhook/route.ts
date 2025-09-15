import { NextRequest, NextResponse } from 'next/server'

// This endpoint handles adding leads to the dashboard from MCP webhook data
export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()

    console.log('🔄 Processing webhook lead for dashboard:', webhookData)

    // Convert MCP webhook data to CRM lead format
    const crmLead = {
      id: webhookData.recordId || `mcp_${Date.now()}`,
      name: webhookData.data.name || 'Unknown',
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
      createdAt: webhookData.timestamp || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      lastContactedAt: '',
      nextFollowUpAt: '',
      tags: [webhookData.database || 'mcp-lead'],
      customFields: {
        mcpDatabase: webhookData.database,
        mcpRecordId: webhookData.recordId,
        service: webhookData.data.service
      }
    }

    console.log('📝 Converted lead data:', crmLead)

    // Since this is server-side and CRM uses localStorage (client-side),
    // we'll store in a way that the frontend can pick up
    // Return the lead data so frontend can process it
    return NextResponse.json({
      success: true,
      message: 'Lead processed for dashboard integration',
      lead: crmLead,
      webhook: webhookData,
      action: 'add_to_dashboard'
    })

  } catch (error) {
    console.error('❌ Error processing webhook lead:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to map MCP sources to CRM sources
function mapSource(source: string): 'Website' | 'Referral' | 'Social Media' | 'Email Campaign' | 'Cold Call' | 'Event' | 'CSV Import' | 'Other' {
  const lowerSource = source?.toLowerCase() || ''

  if (lowerSource.includes('website') || lowerSource.includes('web')) {
    return 'Website'
  } else if (lowerSource.includes('call') || lowerSource.includes('voice')) {
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