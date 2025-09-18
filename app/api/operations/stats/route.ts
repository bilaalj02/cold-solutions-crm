import { NextResponse } from 'next/server';
import { SupabaseService } from '@/lib/supabase-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export interface OperationalStats {
  system_status: 'operational' | 'degraded' | 'down';
  active_agents: number;
  published_agents: number;
  queue_depth: number;
  api_response_time: number;
  memory_usage: number;
  error_rate: number;
  calls_today: number;
  success_rate_today: number;
  uptime_percentage: number;
  voice_agent_calls_today: number;
  average_call_duration: number;
  total_call_minutes_today: number;
  peak_calls_hour: number;
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Get today's call statistics
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todayStats = await SupabaseService.getCallStatsForPeriod(todayStart, today);

    // Calculate success rate (Booked Demo, Interested, Requested More Info)
    const successfulCalls = todayStats.successful;
    const totalCalls = todayStats.totalCalls;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    // Simulate some operational metrics (in a real implementation, these would come from monitoring tools)
    const apiResponseTime = 120 + Math.random() * 50; // 120-170ms
    const memoryUsage = 65 + Math.random() * 15; // 65-80%
    const errorRate = Math.random() * 2; // 0-2%
    const uptime = 99.8 + Math.random() * 0.2; // 99.8-100%

    // Determine system status based on metrics
    let systemStatus: OperationalStats['system_status'] = 'operational';
    if (errorRate > 1.5 || memoryUsage > 85 || apiResponseTime > 200) {
      systemStatus = 'degraded';
    }
    if (errorRate > 5 || memoryUsage > 95 || apiResponseTime > 500) {
      systemStatus = 'down';
    }

    // Get recent calls to estimate queue depth
    const recentCalls = await SupabaseService.getCallLogs({
      limit: 100,
      offset: 0
    });

    // Estimate queue depth based on recent activity
    const now = new Date();
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    const recentActivity = recentCalls.calls.filter(call =>
      new Date(call.timestamp) > last5Minutes
    ).length;

    // Simulate queue depth based on recent activity
    const queueDepth = Math.max(0, Math.floor(recentActivity * 1.5 + Math.random() * 10));

    // Get actual agent count and analytics from Retell AI
    let activeAgents = 0;
    let publishedAgents = 0;

    try {
      const retellApiKey = process.env.RETELL_API_KEY;
      if (retellApiKey) {
        const agentResponse = await fetch('https://api.retellai.com/list-agents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${retellApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (agentResponse.ok) {
          const agentData = await agentResponse.json();
          const agents = Array.isArray(agentData) ? agentData : [];

          // Count total agents and published agents
          activeAgents = agents.length;
          publishedAgents = agents.filter(agent => agent.is_published).length;

          console.log('📊 Real agent count:', {
            total_agents: activeAgents,
            published_agents: publishedAgents
          });
        }
      }
    } catch (error) {
      console.warn('Could not fetch agent count from Retell AI:', error);
      // Fallback based on call data
      const retellCalls = recentCalls.calls.filter(call =>
        call.caller_name === 'Retell AI Voice Agent'
      ).length;
      activeAgents = retellCalls > 0 ? Math.max(1, Math.ceil(retellCalls / 5)) : 0;
      publishedAgents = activeAgents;
    }

    // Calculate enhanced call analytics
    const voiceAgentCalls = recentCalls.calls.filter(call =>
      call.caller_name === 'Retell AI Voice Agent'
    ).length;

    const totalCallDuration = recentCalls.calls.reduce((sum, call) =>
      sum + (call.call_duration || 0), 0
    );

    const averageCallDuration = totalCalls > 0 ? Math.round(totalCallDuration / totalCalls) : 0;
    const totalCallMinutes = Math.round(totalCallDuration / 60);

    // Calculate peak hour (simplified - hour with most calls)
    const callsByHour: Record<number, number> = {};
    recentCalls.calls.forEach(call => {
      const hour = new Date(call.timestamp).getHours();
      callsByHour[hour] = (callsByHour[hour] || 0) + 1;
    });

    const peakCallsHour = Math.max(...Object.values(callsByHour), 0);

    const stats: OperationalStats = {
      system_status: systemStatus,
      active_agents: activeAgents,
      published_agents: publishedAgents,
      queue_depth: queueDepth,
      api_response_time: Math.round(apiResponseTime),
      memory_usage: Math.round(memoryUsage),
      error_rate: Math.round(errorRate * 10) / 10, // One decimal place
      calls_today: totalCalls,
      success_rate_today: Math.round(successRate),
      uptime_percentage: Math.round(uptime * 10) / 10, // One decimal place
      voice_agent_calls_today: voiceAgentCalls,
      average_call_duration: averageCallDuration,
      total_call_minutes_today: totalCallMinutes,
      peak_calls_hour: peakCallsHour
    };

    console.log('📊 Operational stats calculated:', {
      system_status: stats.system_status,
      active_agents: stats.active_agents,
      calls_today: stats.calls_today,
      success_rate: `${stats.success_rate_today}%`
    });

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Error calculating operational stats:', error);

    // Return fallback stats on error
    return NextResponse.json({
      success: false,
      stats: {
        system_status: 'degraded' as const,
        active_agents: 0,
        published_agents: 0,
        queue_depth: 0,
        api_response_time: 0,
        memory_usage: 0,
        error_rate: 100,
        calls_today: 0,
        success_rate_today: 0,
        uptime_percentage: 0,
        voice_agent_calls_today: 0,
        average_call_duration: 0,
        total_call_minutes_today: 0,
        peak_calls_hour: 0
      },
      timestamp: new Date().toISOString()
    }, { status: 500, headers: corsHeaders });
  }
}