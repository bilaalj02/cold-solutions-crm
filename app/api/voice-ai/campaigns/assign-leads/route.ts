import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST - Assign leads to a campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaign_id, lead_ids } = body;

    if (!campaign_id || !lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'campaign_id and lead_ids array are required'
      }, { status: 400 });
    }

    console.log(`📊 Assigning ${lead_ids.length} leads to campaign ${campaign_id}...`);

    // Update all selected leads with the campaign_id
    const { data: updatedLeads, error: updateError } = await supabaseServer
      .from('voice_ai_leads')
      .update({
        campaign_id,
        status: 'Queued for Calling'
      })
      .in('id', lead_ids)
      .select();

    if (updateError) {
      console.error('Error assigning leads to campaign:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Update campaign total_leads count
    const { data: campaign } = await supabaseServer
      .from('voice_ai_campaigns')
      .select('total_leads')
      .eq('id', campaign_id)
      .single();

    if (campaign) {
      await supabaseServer
        .from('voice_ai_campaigns')
        .update({ total_leads: (campaign.total_leads || 0) + lead_ids.length })
        .eq('id', campaign_id);
    }

    console.log(`✅ Successfully assigned ${lead_ids.length} leads to campaign`);

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${lead_ids.length} leads to campaign`,
      count: updatedLeads?.length || 0
    });
  } catch (error: any) {
    console.error('Error in POST /api/voice-ai/campaigns/assign-leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
