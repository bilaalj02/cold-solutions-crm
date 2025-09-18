import { NextResponse } from 'next/server';
import { SupabaseService } from '../../../lib/supabase-service';

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

    const realStats: CallStats = {
      today: todayStats,
      thisWeek: {
        ...weekStats,
        callsByDay: weekStats.callsByDay || {}
      },
      thisMonth: {
        ...monthStats,
        topCallers
      },
      allTime: allTimeStats
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