import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET - Fetch all leads for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: leads, error } = await supabaseServer
      .from('voice_ai_leads')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaign leads:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, leads: leads || [] });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/campaigns/[id]/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
