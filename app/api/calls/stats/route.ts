import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// CORS headers for cold caller app integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Import call logs from the log endpoint (in production, use shared database)
// For now, we'll fetch from the API endpoint
async function getCallLogs() {
  try {
    const response = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/calls/log?limit=1000`);
    if (response.ok) {
      const data = await response.json();
      return data.calls || [];
    }
  } catch (error) {
    console.error('Error fetching call logs for stats:', error);
  }
  return [];
}

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

// Calculate statistics from real call data
function calculateStatsFromCalls(calls: any[], callerFilter?: string | null, dateFrom?: string | null, dateTo?: string | null): CallStats {
  // Apply filters
  let filteredCalls = calls;

  if (callerFilter) {
    filteredCalls = filteredCalls.filter(call =>
      call.callerName.toLowerCase().includes(callerFilter.toLowerCase())
    );
  }

  if (dateFrom || dateTo) {
    filteredCalls = filteredCalls.filter(call => {
      const callDate = new Date(call.timestamp);
      if (dateFrom && callDate < new Date(dateFrom)) return false;
      if (dateTo && callDate > new Date(dateTo)) return false;
      return true;
    });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter calls by time periods
  const todayCalls = filteredCalls.filter(call => new Date(call.timestamp) >= todayStart);
  const weekCalls = filteredCalls.filter(call => new Date(call.timestamp) >= weekStart);
  const monthCalls = filteredCalls.filter(call => new Date(call.timestamp) >= monthStart);

  // Calculate today's stats
  const todayStats = {
    totalCalls: todayCalls.length,
    successful: todayCalls.filter(call => isSuccessfulOutcome(call.callOutcome)).length,
    unsuccessful: todayCalls.filter(call => isUnsuccessfulOutcome(call.callOutcome)).length,
    pending: todayCalls.filter(call => isPendingOutcome(call.callOutcome)).length,
    callsByOutcome: todayCalls.reduce((acc, call) => {
      acc[call.callOutcome] = (acc[call.callOutcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  // Calculate this week's stats
  const callsByDay = weekCalls.reduce((acc, call) => {
    const dayName = new Date(call.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    acc[dayName] = (acc[dayName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ensure all days are represented
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  daysOfWeek.forEach(day => {
    if (!callsByDay[day]) callsByDay[day] = 0;
  });

  const weekStats = {
    totalCalls: weekCalls.length,
    successful: weekCalls.filter(call => isSuccessfulOutcome(call.callOutcome)).length,
    unsuccessful: weekCalls.filter(call => isUnsuccessfulOutcome(call.callOutcome)).length,
    pending: weekCalls.filter(call => isPendingOutcome(call.callOutcome)).length,
    callsByDay
  };

  // Calculate this month's stats and top callers
  const callerStats = monthCalls.reduce((acc, call) => {
    if (!acc[call.callerName]) {
      acc[call.callerName] = { total: 0, successful: 0 };
    }
    acc[call.callerName].total++;
    if (isSuccessfulOutcome(call.callOutcome)) {
      acc[call.callerName].successful++;
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

  const monthStats = {
    totalCalls: monthCalls.length,
    successful: monthCalls.filter(call => isSuccessfulOutcome(call.callOutcome)).length,
    unsuccessful: monthCalls.filter(call => isUnsuccessfulOutcome(call.callOutcome)).length,
    pending: monthCalls.filter(call => isPendingOutcome(call.callOutcome)).length,
    topCallers
  };

  // Calculate all-time stats
  const averageCallDuration = filteredCalls.length > 0
    ? filteredCalls.reduce((sum, call) => sum + (call.callDuration || 0), 0) / filteredCalls.length
    : 0;

  const allTimeStats = {
    totalCalls: filteredCalls.length,
    successful: filteredCalls.filter(call => isSuccessfulOutcome(call.callOutcome)).length,
    unsuccessful: filteredCalls.filter(call => isUnsuccessfulOutcome(call.callOutcome)).length,
    pending: filteredCalls.filter(call => isPendingOutcome(call.callOutcome)).length,
    averageCallDuration: Math.round(averageCallDuration)
  };

  return {
    today: todayStats,
    thisWeek: weekStats,
    thisMonth: monthStats,
    allTime: allTimeStats
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

    // Get real call logs from API
    const callLogs = await getCallLogs();

    // Calculate real statistics
    const realStats: CallStats = calculateStatsFromCalls(callLogs, callerFilter, dateFrom, dateTo);

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