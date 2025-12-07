import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Fetch call logs for the date range
    const { data: callLogs, error } = await supabase
      .from('voice_ai_call_logs')
      .select('*')
      .gte('started_at', startDateStr);

    if (error) {
      console.error('Error fetching analytics data:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Calculate key metrics
    const total_calls = callLogs.length;
    const total_demos_booked = callLogs.filter(log => log.call_outcome === 'Booked Demo').length;
    const conversion_rate = total_calls > 0 ? (total_demos_booked / total_calls) * 100 : 0;

    const totalDuration = callLogs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0);
    const avg_call_duration = total_calls > 0 ? Math.round(totalDuration / total_calls) : 0;

    // Calls by outcome
    const outcomeMap = new Map<string, number>();
    callLogs.forEach(log => {
      const outcome = log.call_outcome || 'Unknown';
      outcomeMap.set(outcome, (outcomeMap.get(outcome) || 0) + 1);
    });
    const calls_by_outcome = Array.from(outcomeMap.entries()).map(([outcome, count]) => ({
      outcome,
      count
    }));

    // Calls by province
    const { data: leads, error: leadsError } = await supabase
      .from('voice_ai_leads')
      .select('id, province')
      .in('id', callLogs.map(log => log.lead_id));

    const provinceMap = new Map<string, number>();
    if (!leadsError && leads) {
      callLogs.forEach(log => {
        const lead = leads.find(l => l.id === log.lead_id);
        if (lead) {
          const province = lead.province || 'Unknown';
          provinceMap.set(province, (provinceMap.get(province) || 0) + 1);
        }
      });
    }
    const calls_by_province = Array.from(provinceMap.entries()).map(([province, count]) => ({
      province,
      count
    }));

    // Calls by industry
    const industryMap = new Map<string, number>();
    if (!leadsError && leads) {
      const { data: industryLeads, error: industryError } = await supabase
        .from('voice_ai_leads')
        .select('id, industry')
        .in('id', callLogs.map(log => log.lead_id));

      if (!industryError && industryLeads) {
        callLogs.forEach(log => {
          const lead = industryLeads.find(l => l.id === log.lead_id);
          if (lead) {
            const industry = lead.industry || 'Unknown';
            industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
          }
        });
      }
    }
    const calls_by_industry = Array.from(industryMap.entries()).map(([industry, count]) => ({
      industry,
      count
    }));

    // Daily stats
    const dailyMap = new Map<string, { calls: number; demos: number }>();
    callLogs.forEach(log => {
      const date = new Date(log.started_at).toISOString().split('T')[0];
      const current = dailyMap.get(date) || { calls: 0, demos: 0 };
      current.calls += 1;
      if (log.call_outcome === 'Booked Demo') {
        current.demos += 1;
      }
      dailyMap.set(date, current);
    });
    const daily_stats = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Top performing campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('voice_ai_campaigns')
      .select('*')
      .order('conversion_rate', { ascending: false })
      .limit(5);

    const top_performing_campaigns = campaigns?.map(c => ({
      campaign_name: c.name,
      calls_made: c.calls_made,
      demos_booked: c.demos_booked,
      conversion_rate: c.conversion_rate
    })) || [];

    // Calls by hour (for optimization insights)
    const hourMap = new Map<number, number>();
    callLogs.forEach(log => {
      const hour = new Date(log.started_at).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    const calls_by_hour = Array.from(hourMap.entries()).map(([hour, count]) => ({
      hour,
      count
    })).sort((a, b) => a.hour - b.hour);

    return NextResponse.json({
      success: true,
      analytics: {
        total_calls,
        total_demos_booked,
        conversion_rate,
        avg_call_duration,
        calls_by_outcome,
        calls_by_province,
        calls_by_industry,
        calls_by_hour,
        daily_stats,
        top_performing_campaigns
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/voice-ai/analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
