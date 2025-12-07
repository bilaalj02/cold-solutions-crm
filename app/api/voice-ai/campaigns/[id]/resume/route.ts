import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST - Resume a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: campaign, error } = await supabaseServer
      .from('voice_ai_campaigns')
      .update({ status: 'Active' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error resuming campaign:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign resumed successfully',
      campaign
    });
  } catch (error: any) {
    console.error('Error in POST /api/voice-ai/campaigns/[id]/resume:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
