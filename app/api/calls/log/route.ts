import { NextResponse } from 'next/server';
import { SupabaseService } from '../../../lib/supabase-service';

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

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request): Promise<NextResponse<CallLogResponse>> {
  try {
    const callData: CallLogData = await request.json();

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
    console.log('✅ Call received from Cold Caller App:', {
      leadName: callData.leadName,
      callOutcome: callData.callOutcome,
      callerName: callData.callerName,
      timestamp: callData.timestamp,
      leadId: callData.leadId,
      leadPhone: callData.leadPhone
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
      date,
      caller,
      outcome
    });

    // Transform data to match expected format
    const transformedCalls = result.calls.map(call => ({
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
      preferredPhone: call.preferred_phone
    }));

    return NextResponse.json({
      success: true,
      calls: transformedCalls,
      total: result.total,
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