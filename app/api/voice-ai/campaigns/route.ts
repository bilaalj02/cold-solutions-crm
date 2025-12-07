import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET - Fetch all campaigns
export async function GET(request: NextRequest) {
  try {
    const { data: campaigns, error } = await supabaseServer
      .from('voice_ai_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/campaigns:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, industry, provinces, daily_call_limit, status } = body;

    if (!name || !provinces || provinces.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'name and provinces are required'
      }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('voice_ai_campaigns')
      .insert([{
        name,
        description,
        industry: industry || 'All',
        provinces: provinces,
        daily_call_limit: daily_call_limit || 50,
        status: status || 'Draft',
        total_leads: 0,
        calls_made: 0,
        calls_completed: 0,
        demos_booked: 0,
        conversion_rate: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaign: data });
  } catch (error: any) {
    console.error('Error in POST /api/voice-ai/campaigns:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
