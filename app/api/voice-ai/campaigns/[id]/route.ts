import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET - Fetch single campaign by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: campaign, error } = await supabaseServer
      .from('voice_ai_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching campaign:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/campaigns/[id]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
