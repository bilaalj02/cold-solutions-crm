import { NextRequest, NextResponse } from 'next/server';
import { notionService } from '@/lib/notion-service';

export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sync = searchParams.get('sync');

    if (sync === 'true') {
      // Handle sync from Notion
      const database = searchParams.get('database');
      if (database) {
        const leads = await notionService.syncLeadsFromNotion(database as any);
        return NextResponse.json({ message: 'Sync completed', leads });
      } else {
        const leads = await notionService.syncAllLeadsFromNotion();
        return NextResponse.json({ message: 'Full sync completed', leads });
      }
    } else {
      // Handle adding a new lead
      const leadData = await request.json();
      const newLead = await notionService.createLead(leadData);
      return NextResponse.json({ message: 'Lead created successfully', lead: newLead });
    }
  } catch (error) {
    console.error('Error in POST /api/leads:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}