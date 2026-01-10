import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer;
    const { searchParams } = new URL(request.url);

    // Query parameters
    const status = searchParams.get('status'); // 'Not Started', 'Complete', etc.
    const industry = searchParams.get('industry');
    const pushed = searchParams.get('pushed'); // 'true' or 'false'
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('business_intelligence_complete')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('analysis_status', status);
    }

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (pushed !== null) {
      query = query.eq('pushed_to_caller', pushed === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: data || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error in leads API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { leadIds } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'No lead IDs provided' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('business_intelligence_leads')
      .delete()
      .in('id', leadIds);

    if (error) {
      console.error('Error deleting leads:', error);
      return NextResponse.json(
        { error: 'Failed to delete leads: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: leadIds.length
    });

  } catch (error) {
    console.error('Error in delete API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete leads' },
      { status: 500 }
    );
  }
}
