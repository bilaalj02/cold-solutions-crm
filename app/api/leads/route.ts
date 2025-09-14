import { NextRequest, NextResponse } from 'next/server';
import { notionService } from '@/lib/notion-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const database = searchParams.get('database');
    
    if (database) {
      const leads = await notionService.getLeadsByDatabase(database as any);
      return NextResponse.json({ leads });
    } else {
      const leads = await notionService.getAllLeads();
      return NextResponse.json({ leads });
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}