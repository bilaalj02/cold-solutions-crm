import { NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';
import { notionCRMService } from '@/lib/notion-crm-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// CORS headers for cold caller app integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to check if a call outcome is successful
function isSuccessfulOutcome(outcome: string): boolean {
  return ['Booked Demo', 'Interested', 'Requested More Info'].includes(outcome);
}

// Helper function to check if a call outcome is unsuccessful
function isUnsuccessfulOutcome(outcome: string): boolean {
  return ['Not Interested', 'No Answer'].includes(outcome);
}

// Helper function to check if a call outcome is pending
function isPendingOutcome(outcome: string): boolean {
  return ['Callback Requested', 'Follow Up Required'].includes(outcome);
}

// Helper function to combine stats from Supabase and Notion
function combineStats(supabaseStats: any, notionStats: any): any {
  return {
    totalCalls: supabaseStats.totalCalls + notionStats.totalCalls,
    successful: supabaseStats.successful + notionStats.successful,
    unsuccessful: supabaseStats.unsuccessful + notionStats.unsuccessful,
    pending: supabaseStats.pending + notionStats.pending,
    callsByOutcome: {
      ...supabaseStats.callsByOutcome,
      ...Object.keys(notionStats.callsByOutcome).reduce((acc, key) => {
        acc[key] = (supabaseStats.callsByOutcome[key] || 0) + notionStats.callsByOutcome[key];
        return acc;
      }, {} as Record<string, number>)
    },
    callsByDay: {
      ...supabaseStats.callsByDay,
      ...Object.keys(notionStats.callsByDay || {}).reduce((acc, key) => {
        acc[key] = (supabaseStats.callsByDay?.[key] || 0) + notionStats.callsByDay[key];
        return acc;
      }, {} as Record<string, number>)
    },
    averageCallDuration: (supabaseStats.averageCallDuration + notionStats.averageCallDuration) / 2
  };
}


export interface CallStats {
  today: {
    totalCalls: number;
    successful: number; // Booked Demo, Interested, Requested More Info
    unsuccessful: number; // Not Interested, No Answer
    pending: number; // Callback Requested, Follow Up Required
    callsByOutcome: Record<string, number>;
  };
  thisWeek: {
    totalCalls: number;
    successful: number;
    unsuccessful: number;
    pending: number;
    callsByDay: Record<string, number>;
  };
  thisMonth: {
    totalCalls: number;
    successful: number;
    unsuccessful: number;
    pending: number;
    topCallers: Array<{ name: string; calls: number; successRate: number }>;
  };
  allTime: {
    totalCalls: number;
    successful: number;
    unsuccessful: number;
    pending: number;
    averageCallDuration: number;
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request): Promise<NextResponse<CallStats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const callerFilter = searchParams.get('caller');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');

    console.log('Call stats requested with filters:', { callerFilter, dateFrom, dateTo });

    // Calculate time periods
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get stats for different time periods from Supabase
    const todayStats = await SupabaseService.getCallStatsForPeriod(todayStart, now);
    const weekStats = await SupabaseService.getCallStatsForPeriod(weekStart, now);
    const monthStats = await SupabaseService.getCallStatsForPeriod(monthStart, now);
    const allTimeStats = await SupabaseService.getCallStatsForPeriod(new Date('2020-01-01'), now);

    // Get stats from Notion CRM database (Cold Caller App leads)
    let notionTodayStats, notionWeekStats, notionMonthStats, notionAllTimeStats;
    try {
      console.log('📋 Fetching call stats from Notion CRM database...');
      notionTodayStats = await notionCRMService.getCallStatsFromNotion(todayStart, now);
      notionWeekStats = await notionCRMService.getCallStatsFromNotion(weekStart, now);
      notionMonthStats = await notionCRMService.getCallStatsFromNotion(monthStart, now);
      notionAllTimeStats = await notionCRMService.getCallStatsFromNotion(new Date('2020-01-01'), now);
      console.log('✅ Successfully fetched Notion CRM stats');
    } catch (notionError) {
      console.warn('⚠️ Failed to fetch Notion CRM stats, using only Supabase data:', notionError);
      // Set empty stats if Notion fails
      const emptyStats = {
        totalCalls: 0,
        successful: 0,
        unsuccessful: 0,
        pending: 0,
        callsByOutcome: {},
        callsByDay: {},
        averageCallDuration: 0
      };
      notionTodayStats = emptyStats;
      notionWeekStats = emptyStats;
      notionMonthStats = emptyStats;
      notionAllTimeStats = emptyStats;
    }

    // Calculate top callers for this month
    const monthCallsResult = await SupabaseService.getCallLogs({
      limit: 1000,
      date: undefined
    });

    const monthCalls = monthCallsResult.calls.filter(call =>
      new Date(call.timestamp) >= monthStart
    );

    const callerStats = monthCalls.reduce((acc, call) => {
      if (!acc[call.caller_name]) {
        acc[call.caller_name] = { total: 0, successful: 0 };
      }
      acc[call.caller_name].total++;
      if (isSuccessfulOutcome(call.call_outcome)) {
        acc[call.caller_name].successful++;
      }
      return acc;
    }, {} as Record<string, { total: number; successful: number }>);

    const topCallers = (Object.entries(callerStats) as [string, { total: number; successful: number }][])
      .map(([name, stats]) => ({
        name,
        calls: stats.total,
        successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5);

    // Combine Supabase and Notion stats
    const combinedTodayStats = combineStats(todayStats, notionTodayStats);
    const combinedWeekStats = combineStats(weekStats, notionWeekStats);
    const combinedMonthStats = combineStats(monthStats, notionMonthStats);
    const combinedAllTimeStats = combineStats(allTimeStats, notionAllTimeStats);

    console.log('📊 Combined stats summary:', {
      today: `${combinedTodayStats.totalCalls} calls (Supabase: ${todayStats.totalCalls}, Notion: ${notionTodayStats.totalCalls})`,
      week: `${combinedWeekStats.totalCalls} calls (Supabase: ${weekStats.totalCalls}, Notion: ${notionWeekStats.totalCalls})`,
      successful: `${combinedTodayStats.successful} successful today`
    });

    const realStats: CallStats = {
      today: combinedTodayStats,
      thisWeek: {
        ...combinedWeekStats,
        callsByDay: combinedWeekStats.callsByDay || {}
      },
      thisMonth: {
        ...combinedMonthStats,
        topCallers
      },
      allTime: combinedAllTimeStats
    };

    return NextResponse.json(realStats, { headers: corsHeaders });

  } catch (error) {
    console.error('Error retrieving call stats:', error);

    return NextResponse.json({
      error: 'Failed to retrieve call statistics'
    }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // This endpoint could be used to trigger stats recalculation
    const body = await request.json();

    console.log('Stats recalculation requested:', body);

    // Here you would trigger any background stats calculation
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: 'Call statistics updated successfully',
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error updating call stats:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to update call statistics'
    }, { status: 500, headers: corsHeaders });
  }
}