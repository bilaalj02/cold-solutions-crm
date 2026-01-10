import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const maxDuration = 300; // 5 minutes max execution time

export async function POST(request: NextRequest) {
  try {
    const { leadIds, limit = 100 } = await request.json();
    const supabase = supabaseServer;

    // MCP server URL
    const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000';

    console.log('🚀 Sending leads to MCP server for analysis...');

    // Fetch leads from CRM database
    let query = supabase
      .from('business_intelligence_leads')
      .select('*')
      .in('analysis_status', ['Not Started', 'Failed'])
      .limit(limit);

    if (leadIds && leadIds.length > 0) {
      query = query.in('id', leadIds);
    }

    const { data: leads, error: fetchError } = await query;

    if (fetchError || !leads || leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads found to analyze' },
        { status: 404 }
      );
    }

    console.log(`📊 Found ${leads.length} leads to analyze`);

    // Call MCP server's analyze endpoint
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/api/analyze-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: leads.length,
        leads: leads.map(lead => ({
          businessName: lead.business_name,
          industry: lead.industry || '',
          website: lead.website || '',
          city: lead.city,
          country: lead.country,
          state: lead.state,
          address: lead.address,
          zipCode: lead.zip_code,
          googleMapsUrl: lead.google_maps_url
        }))
      })
    });

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text();
      console.error(`❌ MCP server error (${mcpResponse.status}):`, errorText);
      throw new Error(`MCP server returned ${mcpResponse.status}: ${errorText}`);
    }

    const mcpData = await mcpResponse.json();
    console.log(`📥 MCP Response:`, JSON.stringify(mcpData, null, 2));

    // Store results in CRM database
    if (mcpData.success && mcpData.status && mcpData.status.results) {
      console.log(`✅ Processing ${mcpData.status.results.length} results from MCP`);
      for (const result of mcpData.status.results) {
        if (result.success && result.analysis) {
          // Find the lead ID from our database
          const lead = leads.find(l => l.business_name === result.businessName);
          if (lead) {
            // Update lead status
            await supabase
              .from('business_intelligence_leads')
              .update({ analysis_status: 'Complete', error_message: null })
              .eq('id', lead.id);

            // Insert/update analysis
            await supabase
              .from('business_analysis')
              .upsert({
                lead_id: lead.id,
                summary: result.analysis.summary,
                outreach_angle: result.analysis.outreachAngle,
                pain_points: result.analysis.painPoints || [],
                automation_opportunities: result.analysis.automationOpportunities || [],
                recommended_services: result.analysis.recommendedServices || [],
                competitive_advantages: result.analysis.competitiveAdvantages || [],
                google_rating: result.analysis.googleRating,
                total_reviews: result.analysis.totalReviews,
                competitors_found: result.analysis.competitorsFound,
                detected_technologies: result.analysis.detectedTechnologies,
                competitor_insights: result.analysis.competitorInsights,
                review_sentiment: result.analysis.reviewSentiment,
                raw_data: result.analysis,
                analyzed_at: new Date().toISOString()
              }, {
                onConflict: 'lead_id'
              });
          }
        } else {
          // Mark as failed
          const lead = leads.find(l => l.business_name === result.businessName);
          if (lead) {
            await supabase
              .from('business_intelligence_leads')
              .update({
                analysis_status: 'Failed',
                error_message: result.error || 'Unknown error'
              })
              .eq('id', lead.id);
          }
        }
      }
    } else {
      console.error('❌ Unexpected MCP response structure. Expected mcpData.success && mcpData.status.results');
      console.error('Received:', mcpData);
    }

    return NextResponse.json({
      success: true,
      status: mcpData.status || { results: [], processed: 0, successful: 0, failed: 0 }
    });

  } catch (error) {
    console.error('❌ Error in analyze API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
