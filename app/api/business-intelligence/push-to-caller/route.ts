import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { PushToCallerRequest, PushToCallerResult } from '@/types/business-intelligence';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer;
    const { leadIds, leadListId, leadListName }: PushToCallerRequest = await request.json();

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'No lead IDs provided' },
        { status: 400 }
      );
    }

    const result: PushToCallerResult = {
      success: false,
      pushedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      leadListId: '',
      leadListName: '',
      errors: []
    };

    console.log(`🔄 Pushing ${leadIds.length} leads to Cold Caller...`);

    // 1. Get or create lead list
    let finalLeadListId = leadListId;
    let finalLeadListName = leadListName;

    if (!finalLeadListId) {
      // Auto-create today's list
      const today = new Date().toISOString().split('T')[0];
      finalLeadListName = leadListName || `BI Leads - ${today}`;

      const { data: existingList } = await supabase
        .from('lead_lists')
        .select('*')
        .eq('name', finalLeadListName)
        .single();

      if (existingList) {
        finalLeadListId = existingList.id;
      } else {
        // Generate a unique ID for the lead list
        const newListId = `bi-list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Try to insert with tracking columns first
        let { data: newList, error: listError } = await supabase
          .from('lead_lists')
          .insert({
            id: newListId,
            name: finalLeadListName,
            description: `Business Intelligence leads imported on ${today}`,
            total_leads: 0,
            contacted: 0,
            qualified: 0,
            converted: 0
          })
          .select()
          .single();

        // If error mentions missing columns, try fallback without tracking columns
        if (listError && (listError.message.includes('contacted') || listError.message.includes('schema cache'))) {
          console.log('⚠️ Tracking columns not found, trying fallback insert...');
          const fallbackResult = await supabase
            .from('lead_lists')
            .insert({
              id: newListId,
              name: finalLeadListName,
              description: `Business Intelligence leads imported on ${today}`,
              lead_count: 0
            })
            .select()
            .single();

          newList = fallbackResult.data;
          listError = fallbackResult.error;
        }

        if (listError || !newList) {
          return NextResponse.json(
            {
              error: 'Failed to create lead list: ' + (listError?.message || 'Unknown error'),
              hint: 'You may need to run the database migration. See RUN_MIGRATION_FOR_CRM_PUSH.md in the cold-caller-app folder.'
            },
            { status: 500 }
          );
        }

        finalLeadListId = newList.id;
      }
    }

    // Ensure we have valid IDs
    if (!finalLeadListId || !finalLeadListName) {
      return NextResponse.json(
        { error: 'Failed to determine lead list' },
        { status: 500 }
      );
    }

    result.leadListId = finalLeadListId;
    result.leadListName = finalLeadListName;

    console.log(`📋 Using lead list: ${finalLeadListName} (${finalLeadListId})`);

    // 2. Fetch leads with their analysis
    const { data: leadsWithAnalysis, error: fetchError } = await supabase
      .from('business_intelligence_complete')
      .select('*')
      .in('id', leadIds)
      .eq('analysis_status', 'Complete');

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch leads: ' + fetchError.message },
        { status: 500 }
      );
    }

    if (!leadsWithAnalysis || leadsWithAnalysis.length === 0) {
      return NextResponse.json(
        { error: 'No completed analyzed leads found with the provided IDs' },
        { status: 404 }
      );
    }

    // 3. Convert and insert leads into caller system
    const callerLeads = leadsWithAnalysis.map(lead => {
      // Determine priority based on opportunity score
      let priority = 'Medium';
      if ((lead.competitors_found || 0) > 5 && (lead.google_rating || 0) < 4.0) {
        priority = 'High';
      } else if ((lead.google_rating || 0) >= 4.5) {
        priority = 'Low'; // Happy customers, less urgent
      }

      return {
        id: `bi-${lead.id}`,
        name: lead.business_name,
        email: '',
        phone: lead.phone || undefined,
        company: lead.business_name,
        position: '',
        source: 'Other', // Cold Caller DB constraint requires: Website, Referral, Social Media, Email Campaign, Cold Call, Event, CSV Import, Other
        lead_source: 'Business Intelligence', // Store the actual source here
        original_source: 'CRM Business Intelligence System',
        status: 'New',
        priority,
        industry: lead.industry || '',
        lead_list_id: finalLeadListId,
        notes: `Business Intelligence Analysis\n\n${lead.summary || ''}\n\nAnalyzed: ${new Date(lead.analyzed_at || '').toLocaleDateString()}`,
        custom_fields: {
          preCallNotes: {
            summary: lead.summary,
            painPoints: lead.pain_points || [],
            automationOpportunities: lead.automation_opportunities || [],
            outreachAngle: lead.outreach_angle,
            recommendedServices: lead.recommended_services || [],
            competitiveAdvantages: lead.competitive_advantages || [],
            googleRating: lead.google_rating,
            totalReviews: lead.total_reviews,
            competitorsFound: lead.competitors_found,
            detectedTechnologies: lead.detected_technologies,
            competitorInsights: lead.competitor_insights,
            reviewSentiment: lead.review_sentiment
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    // Insert into leads table
    const { data: insertedLeads, error: insertError } = await supabase
      .from('leads')
      .upsert(callerLeads, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      console.error('Error inserting leads:', insertError);
      result.failedCount = callerLeads.length;
      result.errors.push(insertError.message);
    } else {
      result.pushedCount = insertedLeads?.length || 0;

      // 4. Update lead list count
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('lead_list_id', finalLeadListId);

      await supabase
        .from('lead_lists')
        .update({ total_leads: count || 0 })
        .eq('id', finalLeadListId);

      // 5. Mark leads as pushed in BI system
      await supabase
        .from('business_intelligence_leads')
        .update({ pushed_to_caller: true })
        .in('id', leadIds);

      console.log(`✅ Successfully pushed ${result.pushedCount} leads to Cold Caller`);
    }

    result.success = result.pushedCount > 0;

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in push-to-caller API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to push leads' },
      { status: 500 }
    );
  }
}
