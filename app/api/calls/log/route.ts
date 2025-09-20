import { NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';
import { notionCRMService } from '@/lib/notion-crm-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// CORS headers for cold caller app integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export interface CallLogData {
  leadId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone: string;
  leadCompany?: string;
  leadPosition?: string;
  callOutcome: 'Booked Demo' | 'Interested' | 'Not Interested' | 'Requested More Info' | 'No Answer' | 'Callback Requested' | 'Follow Up Required';
  callNotes?: string;
  callerName: string;
  callerRole?: string;
  callDuration?: number; // in seconds
  timestamp: string;
  leadSource?: string;
  leadIndustry?: string;
  leadTerritory?: string;
  collectedEmail?: string;
  preferredPhone?: string;
}

export interface CallLogResponse {
  success: boolean;
  callId?: string;
  message: string;
  timestamp: string;
}

// Retell AI webhook interface
export interface RetellWebhookData {
  event: 'call_started' | 'call_ended' | 'call_analyzed';
  call: {
    call_id: string;
    from_number?: string;
    to_number?: string;
    direction?: 'inbound' | 'outbound';
    call_status?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    disconnection_reason?: string;
    transcript?: string;
    agent_id?: string;
    metadata?: Record<string, any>;
    retell_llm_dynamic_variables?: Record<string, any>;
  };
}

// Helper function to detect if data is from Retell AI webhook
function isRetellWebhookData(data: any): data is RetellWebhookData {
  return data.event && data.call && data.call.call_id;
}

// Helper function to convert Retell AI webhook data to CallLogData format
function convertRetellToCallLogData(retellData: RetellWebhookData): CallLogData {
  const call = retellData.call;

  // Calculate call duration
  const callDuration = call.start_timestamp && call.end_timestamp
    ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
    : undefined;

  // Determine call outcome based on disconnection reason and call status
  let callOutcome: CallLogData['callOutcome'] = 'No Answer'; // Default

  if (call.disconnection_reason === 'user_hangup' && callDuration && callDuration > 30) {
    callOutcome = 'Interested'; // Assume longer calls are positive
  } else if (call.disconnection_reason === 'agent_hangup') {
    callOutcome = 'Follow Up Required';
  } else if (call.call_status === 'registered' && callDuration && callDuration > 60) {
    callOutcome = 'Booked Demo'; // Longer successful calls
  }

  // Extract lead info from dynamic variables or metadata
  const leadName = call.retell_llm_dynamic_variables?.customer_name ||
                   call.metadata?.customer_name ||
                   call.from_number ||
                   'Unknown Caller';

  const leadPhone = call.from_number || call.to_number || 'Unknown';

  return {
    leadId: call.call_id,
    leadName,
    leadPhone,
    leadEmail: call.retell_llm_dynamic_variables?.customer_email || call.metadata?.customer_email,
    leadCompany: call.retell_llm_dynamic_variables?.company || call.metadata?.company,
    callOutcome,
    callNotes: call.transcript ? `Retell AI Call Transcript: ${call.transcript.substring(0, 500)}...` : 'Retell AI Voice Call',
    callerName: 'Retell AI Voice Agent',
    callerRole: 'AI Agent',
    callDuration,
    timestamp: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : new Date().toISOString(),
    leadSource: 'Retell AI Voice Agent',
    leadIndustry: call.metadata?.industry,
    leadTerritory: call.metadata?.territory
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request): Promise<NextResponse<CallLogResponse>> {
  try {
    const rawData = await request.json();

    // Detect data source and convert if needed
    let callData: CallLogData;

    if (isRetellWebhookData(rawData)) {
      // Handle Retell AI webhook data
      console.log('📞 Retell AI webhook received:', {
        event: rawData.event,
        callId: rawData.call.call_id,
        direction: rawData.call.direction,
        duration: rawData.call.end_timestamp && rawData.call.start_timestamp
          ? Math.round((rawData.call.end_timestamp - rawData.call.start_timestamp) / 1000)
          : 'unknown'
      });

      // Only process call_ended events for logging
      if (rawData.event !== 'call_ended') {
        console.log(`⏭️ Skipping ${rawData.event} event - only logging call_ended events`);
        return NextResponse.json({
          success: true,
          message: `${rawData.event} event received but not logged`,
          timestamp: new Date().toISOString()
        }, { headers: corsHeaders });
      }

      callData = convertRetellToCallLogData(rawData);
    } else {
      // Handle Cold Caller App data (existing format)
      callData = rawData as CallLogData;
    }

    // Validate required fields (leadEmail is optional)
    if (!callData.leadId || !callData.leadName || !callData.leadPhone || !callData.callOutcome || !callData.callerName) {
      console.log('❌ CRM API Validation Failed:', {
        hasLeadId: !!callData.leadId,
        hasLeadName: !!callData.leadName,
        hasLeadPhone: !!callData.leadPhone,
        hasCallOutcome: !!callData.callOutcome,
        hasCallerName: !!callData.callerName,
        receivedData: callData
      });

      return NextResponse.json({
        success: false,
        message: 'Missing required fields: leadId, leadName, leadPhone, callOutcome, callerName',
        timestamp: new Date().toISOString()
      }, { status: 400, headers: corsHeaders });
    }

    // Log the received call data
    const dataSource = isRetellWebhookData(rawData) ? 'Retell AI' : 'Cold Caller App';
    console.log(`✅ Call received from ${dataSource}:`, {
      leadName: callData.leadName,
      callOutcome: callData.callOutcome,
      callerName: callData.callerName,
      timestamp: callData.timestamp,
      leadId: callData.leadId,
      leadPhone: callData.leadPhone,
      source: callData.leadSource
    });

    // Generate a unique call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store call data in Supabase
    const callRecord = await SupabaseService.createCallLog({
      call_id: callId,
      lead_id: callData.leadId,
      lead_name: callData.leadName,
      lead_email: callData.leadEmail,
      lead_phone: callData.leadPhone,
      lead_company: callData.leadCompany,
      lead_position: callData.leadPosition,
      call_outcome: callData.callOutcome as any,
      call_notes: callData.callNotes,
      caller_name: callData.callerName,
      caller_role: callData.callerRole,
      call_duration: callData.callDuration,
      timestamp: callData.timestamp || new Date().toISOString(),
      lead_source: callData.leadSource,
      lead_industry: callData.leadIndustry,
      lead_territory: callData.leadTerritory,
      collected_email: callData.collectedEmail,
      preferred_phone: callData.preferredPhone
    });

    if (!callRecord) {
      throw new Error('Failed to store call in database');
    }

    console.log('📞 Call stored in CRM database:', {
      callId,
      leadName: callData.leadName,
      company: callData.leadCompany,
      outcome: callData.callOutcome,
      notes: callData.callNotes,
      caller: callData.callerName,
      databaseId: callRecord.id
    });

    return NextResponse.json({
      success: true,
      callId,
      message: 'Call logged successfully in CRM',
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error logging call to CRM:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to log call in CRM',
      timestamp: new Date().toISOString()
    }, { status: 500, headers: corsHeaders });
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const caller = searchParams.get('caller');
    const outcome = searchParams.get('outcome');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Call logs requested with filters:', { date, caller, outcome, limit, offset });

    // Fetch call logs from Supabase
    const result = await SupabaseService.getCallLogs({
      limit,
      offset,
      date: date || undefined,
      caller: caller || undefined,
      outcome: outcome || undefined
    });

    // Transform Supabase data to match expected format
    const transformedSupabaseCalls = result.calls.map(call => ({
      callId: call.call_id,
      leadId: call.lead_id,
      leadName: call.lead_name,
      leadEmail: call.lead_email,
      leadPhone: call.lead_phone,
      leadCompany: call.lead_company,
      leadPosition: call.lead_position,
      callOutcome: call.call_outcome,
      callNotes: call.call_notes,
      callerName: call.caller_name,
      callerRole: call.caller_role,
      callDuration: call.call_duration,
      timestamp: call.timestamp,
      leadSource: call.lead_source,
      leadIndustry: call.lead_industry,
      leadTerritory: call.lead_territory,
      collectedEmail: call.collected_email,
      preferredPhone: call.preferred_phone,
      dataSource: 'Supabase'
    }));

    // Fetch call data from Notion CRM database (Cold Caller App leads)
    let notionCalls: any[] = [];
    try {
      console.log('📋 Fetching call logs from Notion CRM database...');
      const notionCallData = await notionCRMService.getCallDataFromNotion();

      // Transform Notion data to match expected format and apply filters
      notionCalls = notionCallData
        .filter(call => {
          // Apply date filter if specified
          if (date) {
            const callDate = new Date(call.timestamp).toISOString().split('T')[0];
            if (callDate !== date) return false;
          }
          // Apply caller filter if specified
          if (caller && !call.caller_name.toLowerCase().includes(caller.toLowerCase())) {
            return false;
          }
          // Apply outcome filter if specified
          if (outcome && call.call_outcome !== outcome) {
            return false;
          }
          return true;
        })
        .map(call => ({
          callId: call.call_id,
          leadId: call.lead_id,
          leadName: call.lead_name,
          leadEmail: call.lead_email,
          leadPhone: call.lead_phone,
          leadCompany: call.lead_company,
          leadPosition: null,
          callOutcome: call.call_outcome,
          callNotes: call.call_notes,
          callerName: call.caller_name,
          callerRole: call.caller_role,
          callDuration: null,
          timestamp: call.timestamp,
          leadSource: call.lead_source,
          leadIndustry: null,
          leadTerritory: null,
          collectedEmail: null,
          preferredPhone: null,
          dataSource: 'Notion CRM'
        }));

      console.log(`✅ Fetched ${notionCalls.length} calls from Notion CRM`);
    } catch (notionError) {
      console.warn('⚠️ Failed to fetch Notion CRM call logs, using only Supabase data:', notionError);
    }

    // Combine both data sources
    const allCalls = [...transformedSupabaseCalls, ...notionCalls];

    // Sort by timestamp (newest first)
    allCalls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination to combined results
    const paginatedCalls = allCalls.slice(offset, offset + limit);

    console.log('📊 Combined call logs:', {
      supabase: transformedSupabaseCalls.length,
      notion: notionCalls.length,
      total: allCalls.length,
      paginated: paginatedCalls.length
    });

    return NextResponse.json({
      success: true,
      calls: paginatedCalls,
      total: allCalls.length,
      supabaseTotal: result.total,
      notionTotal: notionCalls.length,
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error retrieving call logs:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve call logs',
      timestamp: new Date().toISOString()
    }, { status: 500, headers: corsHeaders });
  }
}