import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// CORS headers for cold caller app integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// In-memory storage for call logs (replace with database in production)
let callLogs: Array<CallLogData & { callId: string; timestamp: string }> = [];

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

    // Store call data in memory (replace with database in production)
    const callRecord = {
      ...callData,
      callId,
      timestamp: new Date().toISOString()
    };

    callLogs.push(callRecord);

    // Keep only last 1000 calls to prevent memory issues
    if (callLogs.length > 1000) {
      callLogs = callLogs.slice(-1000);
    }

    console.log('📞 Call stored in CRM:', {
      callId,
      leadName: callData.leadName,
      company: callData.leadCompany,
      outcome: callData.callOutcome,
      notes: callData.callNotes,
      caller: callData.callerName,
      totalCalls: callLogs.length
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

    console.log('Call logs requested with filters:', { date, caller, outcome, limit });

    // Filter call logs based on parameters
    let filteredCalls = [...callLogs];

    if (date) {
      const filterDate = new Date(date).toDateString();
      filteredCalls = filteredCalls.filter(call =>
        new Date(call.timestamp).toDateString() === filterDate
      );
    }

    if (caller) {
      filteredCalls = filteredCalls.filter(call =>
        call.callerName.toLowerCase().includes(caller.toLowerCase())
      );
    }

    if (outcome) {
      filteredCalls = filteredCalls.filter(call => call.callOutcome === outcome);
    }

    // Sort by timestamp (newest first) and limit results
    filteredCalls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const paginatedCalls = filteredCalls.slice(0, limit);

    return NextResponse.json({
      success: true,
      calls: paginatedCalls,
      total: filteredCalls.length,
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