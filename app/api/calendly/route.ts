import { NextRequest, NextResponse } from 'next/server';
import { calendlyService } from '@/lib/calendly-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
    switch (type) {
      case 'stats':
        const stats = await calendlyService.getEventStats();
        return NextResponse.json({ stats });
      
      case 'upcoming':
        const upcoming = await calendlyService.getUpcomingEvents();
        return NextResponse.json({ events: upcoming });
      
      case 'recent':
        const recent = await calendlyService.getRecentEvents();
        return NextResponse.json({ events: recent });
      
      default:
        const events = await calendlyService.getScheduledEvents();
        return NextResponse.json({ events });
    }
  } catch (error) {
    console.error('Error fetching Calendly data:', error);
    return NextResponse.json({ error: 'Failed to fetch Calendly data' }, { status: 500 });
  }
}