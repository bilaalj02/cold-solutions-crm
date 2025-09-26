import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null; // Return null if not configured
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const status = searchParams.get('status');

    // Try to fetch real email logs from Supabase
    const supabase = getSupabaseClient();

    if (supabase) {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: realLogs, error } = await query;

      // If we have real logs, use them; otherwise fall back to mock data
      if (!error && realLogs && realLogs.length > 0) {
        const logs = realLogs.map(log => ({
          id: log.id,
          templateId: log.template_id,
          subject: log.subject,
          status: log.status,
          sentAt: log.sent_at,
          deliveredAt: log.delivered_at,
          openedAt: log.opened_at,
          clickedAt: log.clicked_at,
          repliedAt: log.replied_at,
          errorMessage: log.error_message,
          metadata: log.metadata,
          content: log.metadata?.content // Extract content from metadata
        }));

        return NextResponse.json({
          success: true,
          logs,
          total: logs.length,
          source: 'database',
        });
      }
    }

    // Mock email logs data for demonstration
    // In production, you would fetch from Supabase email_logs table
    const mockLogs = [
      {
        id: '1',
        templateId: 'welcome-new-lead',
        subject: 'Welcome John - Let\'s Transform Your Manufacturing Business',
        status: 'delivered',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(), // 2 hours ago + 30 seconds
        openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        metadata: {
          fromEmail: 'contact@coldsolutions.ca',
          toEmail: 'john.doe@manufacturing.com',
          messageId: '<msg1@coldsolutions.ca>',
        }
      },
      {
        id: '2',
        templateId: 'follow-up-no-response',
        subject: 'Quick follow-up on TechCorp\'s Healthcare optimization',
        status: 'sent',
        sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        metadata: {
          fromEmail: 'contact@coldsolutions.ca',
          toEmail: 'sarah@techcorp.com',
          messageId: '<msg2@coldsolutions.ca>',
        }
      },
      {
        id: '3',
        templateId: 'custom',
        subject: 'Custom email regarding your inquiry',
        status: 'bounced',
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        errorMessage: 'Recipient email address not found',
        metadata: {
          fromEmail: 'contact@coldsolutions.ca',
          toEmail: 'invalid@nonexistent.com',
          messageId: '<msg3@coldsolutions.ca>',
        }
      },
      {
        id: '4',
        templateId: 'welcome-new-lead',
        subject: 'Welcome Mike - Let\'s Transform Your Healthcare Business',
        status: 'replied',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        deliveredAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45000).toISOString(),
        openedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        clickedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        repliedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        metadata: {
          fromEmail: 'contact@coldsolutions.ca',
          toEmail: 'mike@healthcare-solutions.com',
          messageId: '<msg4@coldsolutions.ca>',
        }
      },
      {
        id: '5',
        templateId: 'proposal-ready',
        subject: 'Your Custom Manufacturing Solution Proposal - ABC Corp',
        status: 'clicked',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
        openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        clickedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        metadata: {
          fromEmail: 'contact@coldsolutions.ca',
          toEmail: 'procurement@abccorp.com',
          messageId: '<msg5@coldsolutions.ca>',
        }
      }
    ];

    // Filter by status if provided
    let filteredLogs = mockLogs;
    if (status && status !== 'all') {
      filteredLogs = mockLogs.filter(log => log.status === status);
    }

    // Limit results
    const logs = filteredLogs.slice(0, limit);

    return NextResponse.json({
      success: true,
      logs,
      total: filteredLogs.length,
      source: 'mock',
      notice: 'This is demo data. Real email logs will appear here once you start sending emails through the system.',
    });
  } catch (error) {
    console.error('Email logs fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch email logs',
    }, { status: 500 });
  }
}