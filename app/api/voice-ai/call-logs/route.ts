import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Fetch call logs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outcome = searchParams.get('outcome');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    let query = supabase
      .from('voice_ai_call_logs')
      .select(`
        *,
        voice_ai_leads (
          business_name,
          phone,
          province,
          industry
        )
      `)
      .order('started_at', { ascending: false });

    // Apply filters
    if (outcome) {
      query = query.eq('call_outcome', outcome);
    }
    if (start_date) {
      query = query.gte('started_at', start_date);
    }
    if (end_date) {
      query = query.lte('started_at', end_date);
    }

    const { data: callLogs, error } = await query;

    if (error) {
      console.error('Error fetching call logs:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Format the response
    const formattedLogs = callLogs.map((log: any) => ({
      ...log,
      lead: log.voice_ai_leads
    }));

    return NextResponse.json({ success: true, call_logs: formattedLogs });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/call-logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
