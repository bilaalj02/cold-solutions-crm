import { NextResponse } from 'next/server';

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

    // Validate required fields
    if (!callData.leadId || !callData.leadName || !callData.leadPhone || !callData.callOutcome || !callData.callerName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: leadId, leadName, leadPhone, callOutcome, callerName',
        timestamp: new Date().toISOString()
      }, { status: 400, headers: corsHeaders });
    }

    // Log the received call data
    console.log('Call logged from Cold Caller App:', {
      leadName: callData.leadName,
      callOutcome: callData.callOutcome,
      callerName: callData.callerName,
      timestamp: callData.timestamp
    });

    // Generate a unique call ID
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Here you would typically save to your database
    // For now, we'll simulate successful storage

    // You can add database storage logic here, for example:
    // await saveToCRMDatabase(callData, callId);

    // For now, just log to console for debugging
    console.log('Call data received in CRM:', {
      callId,
      leadName: callData.leadName,
      company: callData.leadCompany,
      outcome: callData.callOutcome,
      notes: callData.callNotes,
      caller: callData.callerName,
      timestamp: callData.timestamp
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

    // For now, return mock data - you would replace this with actual database queries
    const mockCallLogs = [
      {
        callId: 'call_example_1',
        leadName: 'John Doe',
        leadCompany: 'Acme Corp',
        leadPhone: '+1234567890',
        callOutcome: 'Interested',
        callNotes: 'Very interested in our services, wants to schedule a demo',
        callerName: 'Sarah Johnson',
        timestamp: new Date().toISOString(),
        callDuration: 180
      }
    ];

    return NextResponse.json({
      success: true,
      calls: mockCallLogs,
      total: mockCallLogs.length,
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