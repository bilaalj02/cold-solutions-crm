import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Fetch single call log details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params.id;

    const { data: callLog, error } = await supabase
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
      .eq('id', callId)
      .single();

    if (error) {
      console.error('Error fetching call log:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      call_log: callLog,
      lead: callLog.voice_ai_leads
    });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/call-logs/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
