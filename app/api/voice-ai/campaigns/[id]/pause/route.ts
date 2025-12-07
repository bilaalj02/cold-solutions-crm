import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST - Pause a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: campaign, error } = await supabaseServer
      .from('voice_ai_campaigns')
      .update({ status: 'Paused' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error pausing campaign:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign paused successfully',
      campaign
    });
  } catch (error: any) {
    console.error('Error in POST /api/voice-ai/campaigns/[id]/pause:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
