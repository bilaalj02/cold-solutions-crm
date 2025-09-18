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

export interface RecentActivity {
  id: string;
  type: 'call_completed' | 'demo_booked' | 'lead_interested' | 'follow_up' | 'no_answer';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  leadName?: string;
  callOutcome?: string;
  callerName?: string;
  metadata?: Record<string, any>;
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get recent call logs for activity feed
    const recentCalls = await SupabaseService.getCallLogs({
      limit: limit * 2, // Get more to filter for interesting activities
      offset: 0
    });

    const activities: RecentActivity[] = [];

    // Convert recent calls to activity feed items
    recentCalls.calls.forEach((call, index) => {
      const callTime = new Date(call.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - callTime.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      let timeAgoText: string;
      if (minutesAgo < 1) {
        timeAgoText = 'just now';
      } else if (minutesAgo < 60) {
        timeAgoText = `${minutesAgo}m ago`;
      } else if (hoursAgo < 24) {
        timeAgoText = `${hoursAgo}h ago`;
      } else if (daysAgo === 1) {
        timeAgoText = '1 day ago';
      } else {
        timeAgoText = `${daysAgo} days ago`;
      }

      let activity: RecentActivity;

      // Create activity based on call outcome
      switch (call.call_outcome) {
        case 'Booked Demo':
          activity = {
            id: `call_${call.id}_demo`,
            type: 'demo_booked',
            title: `Demo booked with ${call.lead_name}`,
            description: `${call.caller_name} successfully scheduled a demo at ${call.lead_company || 'their company'}`,
            timestamp: timeAgoText,
            icon: 'videocam',
            color: '#10b981',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              duration: call.call_duration,
              phone: call.lead_phone,
              company: call.lead_company
            }
          };
          break;

        case 'Interested':
          activity = {
            id: `call_${call.id}_interested`,
            type: 'lead_interested',
            title: `${call.lead_name} expressed interest`,
            description: `Positive response during ${call.call_duration || 0}s call with ${call.caller_name}`,
            timestamp: timeAgoText,
            icon: 'thumb_up',
            color: '#3dbff2',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              duration: call.call_duration,
              notes: call.call_notes
            }
          };
          break;

        case 'Requested More Info':
          activity = {
            id: `call_${call.id}_info`,
            type: 'follow_up',
            title: `${call.lead_name} requested more information`,
            description: `Follow-up required after call with ${call.caller_name}`,
            timestamp: timeAgoText,
            icon: 'info',
            color: '#f59e0b',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              duration: call.call_duration
            }
          };
          break;

        case 'Callback Requested':
          activity = {
            id: `call_${call.id}_callback`,
            type: 'follow_up',
            title: `Callback scheduled with ${call.lead_name}`,
            description: `${call.caller_name} scheduled a follow-up call`,
            timestamp: timeAgoText,
            icon: 'schedule',
            color: '#8b5cf6',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              duration: call.call_duration
            }
          };
          break;

        case 'Follow Up Required':
          activity = {
            id: `call_${call.id}_followup`,
            type: 'follow_up',
            title: `Follow-up needed for ${call.lead_name}`,
            description: `Additional outreach required after ${call.caller_name}'s call`,
            timestamp: timeAgoText,
            icon: 'schedule_send',
            color: '#f59e0b',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              duration: call.call_duration
            }
          };
          break;

        case 'No Answer':
          activity = {
            id: `call_${call.id}_noanswer`,
            type: 'no_answer',
            title: `No answer from ${call.lead_name}`,
            description: `${call.caller_name} attempted to reach ${call.lead_phone}`,
            timestamp: timeAgoText,
            icon: 'phone_missed',
            color: '#6b7280',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              phone: call.lead_phone
            }
          };
          break;

        case 'Not Interested':
          activity = {
            id: `call_${call.id}_notinterested`,
            type: 'call_completed',
            title: `${call.lead_name} not interested`,
            description: `Call completed by ${call.caller_name} - lead marked as not interested`,
            timestamp: timeAgoText,
            icon: 'thumb_down',
            color: '#ef4444',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              duration: call.call_duration
            }
          };
          break;

        default:
          activity = {
            id: `call_${call.id}_general`,
            type: 'call_completed',
            title: `Call completed with ${call.lead_name}`,
            description: `${call.caller_name} finished call - ${call.call_outcome}`,
            timestamp: timeAgoText,
            icon: 'phone_in_talk',
            color: '#6b7280',
            leadName: call.lead_name,
            callOutcome: call.call_outcome,
            callerName: call.caller_name,
            metadata: {
              duration: call.call_duration
            }
          };
      }

      activities.push(activity);
    });

    // Sort by most recent first and limit
    const sortedActivities = activities
      .sort((a, b) => {
        // Custom sort to put recent times first
        const timeA = a.timestamp.includes('just now') ? 0 :
                     a.timestamp.includes('m ago') ? parseInt(a.timestamp) :
                     a.timestamp.includes('h ago') ? parseInt(a.timestamp) * 60 :
                     a.timestamp.includes('day') ? parseInt(a.timestamp) * 1440 : 99999;
        const timeB = b.timestamp.includes('just now') ? 0 :
                     b.timestamp.includes('m ago') ? parseInt(b.timestamp) :
                     b.timestamp.includes('h ago') ? parseInt(b.timestamp) * 60 :
                     b.timestamp.includes('day') ? parseInt(b.timestamp) * 1440 : 99999;
        return timeA - timeB;
      })
      .slice(0, limit);

    console.log('📊 Recent activity generated:', {
      total_activities: sortedActivities.length,
      activity_types: [...new Set(sortedActivities.map(a => a.type))],
      time_range: sortedActivities.length > 0 ? `${sortedActivities[sortedActivities.length - 1].timestamp} to ${sortedActivities[0].timestamp}` : 'none'
    });

    return NextResponse.json({
      success: true,
      activities: sortedActivities,
      total: sortedActivities.length,
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch recent activity',
      activities: []
    }, { status: 500, headers: corsHeaders });
  }
}