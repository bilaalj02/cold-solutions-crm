import { NextRequest, NextResponse } from 'next/server';
import { notionService } from '@/lib/notion-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const database = searchParams.get('database');
    
    if (database) {
      const stats = await notionService.getDatabaseStats(database as any);
      return NextResponse.json({ stats });
    } else {
      const allStats = await notionService.getAllStats();
      return NextResponse.json({ stats: allStats });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}