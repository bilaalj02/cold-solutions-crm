import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST - Start a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`🚀 Starting campaign ${id}...`);

    // Update campaign status to Active
    const { data: campaign, error } = await supabaseServer
      .from('voice_ai_campaigns')
      .update({ status: 'Active' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error starting campaign:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`✅ Campaign ${id} started successfully`);

    // TODO: Trigger voice AI calling system here
    // This would integrate with your voice AI service to start making calls

    return NextResponse.json({
      success: true,
      message: 'Campaign started successfully',
      campaign
    });
  } catch (error: any) {
    console.error('Error in POST /api/voice-ai/campaigns/[id]/start:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
