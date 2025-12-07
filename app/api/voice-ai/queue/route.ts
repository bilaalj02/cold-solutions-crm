import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Fetch queue status and active queue
export async function GET(request: NextRequest) {
  try {
    // Get queue status counts
    const { data: queueData, error: queueError } = await supabase
      .from('voice_ai_call_queue')
      .select('status');

    if (queueError) {
      console.error('Error fetching queue status:', queueError);
      return NextResponse.json({ success: false, error: queueError.message }, { status: 500 });
    }

    // Count by status
    const status = {
      queued: queueData.filter(q => q.status === 'Queued').length,
      calling: queueData.filter(q => q.status === 'Calling').length,
      completed: queueData.filter(q => q.status === 'Complete').length,
      failed: queueData.filter(q => q.status === 'Failed').length,
    };

    // Get active queue (next items to be called)
    const { data: activeQueue, error: activeError } = await supabase
      .from('voice_ai_call_queue')
      .select(`
        id,
        lead_id,
        status,
        scheduled_for,
        attempt_number,
        voice_ai_leads (
          business_name,
          phone,
          province,
          industry
        ),
        voice_ai_campaigns (
          name
        )
      `)
      .in('status', ['Queued', 'Calling'])
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (activeError) {
      console.error('Error fetching active queue:', activeError);
      return NextResponse.json({ success: false, error: activeError.message }, { status: 500 });
    }

    // Format the response
    const formattedQueue = activeQueue.map((item: any) => ({
      id: item.id,
      business_name: item.voice_ai_leads?.business_name || 'Unknown',
      phone: item.voice_ai_leads?.phone || '',
      province: item.voice_ai_leads?.province || '',
      industry: item.voice_ai_leads?.industry || '',
      campaign_name: item.voice_ai_campaigns?.name || 'N/A',
      status: item.status,
      scheduled_for: item.scheduled_for,
      attempt_number: item.attempt_number,
    }));

    return NextResponse.json({
      success: true,
      status,
      active_queue: formattedQueue
    });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/queue:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
