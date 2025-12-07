import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET - Fetch all voice AI leads with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');
    const industry = searchParams.get('industry');
    const status = searchParams.get('status');
    const research_status = searchParams.get('research_status');

    let query = supabaseServer
      .from('voice_ai_leads')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (province) {
      query = query.eq('province', province);
    }
    if (industry) {
      query = query.eq('industry', industry);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (research_status) {
      query = query.eq('research_status', research_status);
    }

    const { data: leads, error } = await query;

    if (error) {
      console.error('Error fetching voice AI leads:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create new lead or import CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leads, single_lead } = body;

    if (single_lead) {
      // Create single lead
      const { data, error } = await supabaseServer
        .from('voice_ai_leads')
        .insert([single_lead])
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, lead: data });
    } else if (leads && Array.isArray(leads)) {
      // Bulk import from CSV
      const { data, error } = await supabaseServer
        .from('voice_ai_leads')
        .insert(leads)
        .select();

      if (error) {
        console.error('Error importing leads:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${data.length} leads`,
        count: data.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid request. Provide either single_lead or leads array'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in POST /api/voice-ai/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update lead
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, updates } = body;

    if (!lead_id) {
      return NextResponse.json({
        success: false,
        error: 'lead_id is required'
      }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('voice_ai_leads')
      .update(updates)
      .eq('id', lead_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error: any) {
    console.error('Error in PUT /api/voice-ai/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lead_id = searchParams.get('id');

    if (!lead_id) {
      return NextResponse.json({
        success: false,
        error: 'lead_id is required'
      }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('voice_ai_leads')
      .delete()
      .eq('id', lead_id);

    if (error) {
      console.error('Error deleting lead:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/voice-ai/leads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
