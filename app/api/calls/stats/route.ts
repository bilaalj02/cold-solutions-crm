import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

export async function GET(request: Request): Promise<NextResponse<CallStats | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const callerFilter = searchParams.get('caller');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');

    console.log('Call stats requested with filters:', { callerFilter, dateFrom, dateTo });

    // For now, return mock data - you would replace this with actual database queries
    const mockStats: CallStats = {
      today: {
        totalCalls: 23,
        successful: 8, // Booked Demo (3) + Interested (5)
        unsuccessful: 12, // Not Interested (8) + No Answer (4)
        pending: 3, // Callback Requested (2) + Follow Up Required (1)
        callsByOutcome: {
          'Booked Demo': 3,
          'Interested': 5,
          'Not Interested': 8,
          'Requested More Info': 2,
          'No Answer': 4,
          'Callback Requested': 2,
          'Follow Up Required': 1
        }
      },
      thisWeek: {
        totalCalls: 156,
        successful: 47,
        unsuccessful: 89,
        pending: 20,
        callsByDay: {
          'Monday': 32,
          'Tuesday': 28,
          'Wednesday': 31,
          'Thursday': 35,
          'Friday': 30,
          'Saturday': 0,
          'Sunday': 0
        }
      },
      thisMonth: {
        totalCalls: 634,
        successful: 198,
        unsuccessful: 356,
        pending: 80,
        topCallers: [
          { name: 'Sarah Johnson', calls: 89, successRate: 34.8 },
          { name: 'Mike Chen', calls: 76, successRate: 31.6 },
          { name: 'Emily Rodriguez', calls: 71, successRate: 29.6 },
          { name: 'David Kim', calls: 68, successRate: 27.9 },
          { name: 'Alex Thompson', calls: 65, successRate: 26.2 }
        ]
      },
      allTime: {
        totalCalls: 2847,
        successful: 891,
        unsuccessful: 1623,
        pending: 333,
        averageCallDuration: 127 // seconds
      }
    };

    return NextResponse.json(mockStats);

  } catch (error) {
    console.error('Error retrieving call stats:', error);

    return NextResponse.json({
      error: 'Failed to retrieve call statistics'
    }, { status: 500 });
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
    });

  } catch (error) {
    console.error('Error updating call stats:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to update call statistics'
    }, { status: 500 });
  }
}