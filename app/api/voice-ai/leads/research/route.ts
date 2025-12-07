import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST - Trigger research for leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_ids } = body;

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'lead_ids array is required'
      }, { status: 400 });
    }

    console.log(`🔬 Triggering research for ${lead_ids.length} lead(s)...`);

    // Get MCP server URL from environment or use default
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3000';

    try {
      // Call the MCP server's research endpoint
      const response = await fetch(`${mcpServerUrl}/api/voice-ai/research/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lead_ids }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MCP server research error:', errorText);
        throw new Error(`MCP server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Research triggered successfully:', data);

      return NextResponse.json({
        success: true,
        message: `Research queued for ${lead_ids.length} lead(s)`,
        data
      });
    } catch (fetchError: any) {
      console.error('Failed to connect to MCP server:', fetchError);

      // Fallback: Update status locally if MCP server is unavailable
      const { error: updateError } = await supabaseServer
        .from('voice_ai_leads')
        .update({ research_status: 'Pending' })
        .in('id', lead_ids);

      if (updateError) {
        console.error('Error updating lead research status:', updateError);
      }

      return NextResponse.json({
        success: true,
        message: `Research queued for ${lead_ids.length} lead(s) (MCP server offline, will process when available)`,
        warning: 'MCP server connection failed'
      });
    }
  } catch (error: any) {
    console.error('Error in POST /api/voice-ai/leads/research:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
