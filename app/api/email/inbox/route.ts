import { NextRequest, NextResponse } from 'next/server';
import { imapService } from '../../../../lib/imap-service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const folder = searchParams.get('folder') || 'INBOX';

    console.log('Fetching emails from IMAP...');

    // Try to fetch real emails from IMAP
    const imapResult = await imapService.fetchEmails({
      folder,
      limit,
      markAsRead: false,
    });

    if (imapResult.success && imapResult.emails && imapResult.emails.length > 0) {
      console.log(`Successfully fetched ${imapResult.emails.length} emails from IMAP`);

      // Convert IMAP emails to the format expected by the frontend
      const emails = imapResult.emails.map(email => ({
        id: email.id,
        from: email.from,
        to: email.to,
        subject: email.subject,
        text: email.text || email.html?.replace(/<[^>]*>/g, '') || '', // Strip HTML if no text
        date: email.date,
        messageId: email.messageId,
        unread: email.unread,
      }));

      return NextResponse.json({
        success: true,
        emails,
        total: emails.length,
        folder,
        source: 'imap',
        notice: `Showing ${emails.length} real emails from your ${folder} folder.`,
      });
    } else {
      console.log('IMAP fetch failed or no emails found, falling back to mock data:', imapResult.error);
    }

    // Mock email data for demonstration
    const mockEmails = [
      {
        id: '1',
        from: 'john.doe@example.com',
        to: 'sales@coldsolutions.com',
        subject: 'Re: Interested in your services',
        text: 'Hi, I would like to know more about your automation solutions...',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        messageId: '<msg1@example.com>',
        unread: true,
      },
      {
        id: '2',
        from: 'sarah.smith@techcorp.com',
        to: 'sales@coldsolutions.com',
        subject: 'Follow-up on proposal',
        text: 'Thank you for the detailed proposal. We have some questions...',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        messageId: '<msg2@example.com>',
        unread: false,
      },
      {
        id: '3',
        from: 'mike.johnson@manufacturing.com',
        to: 'sales@coldsolutions.com',
        subject: 'Meeting request',
        text: 'Could we schedule a call to discuss your solutions?',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        messageId: '<msg3@example.com>',
        unread: false,
      },
    ];

    // Filter and limit results
    const emails = mockEmails.slice(0, limit);

    return NextResponse.json({
      success: true,
      emails,
      total: mockEmails.length,
      folder,
      source: 'mock',
      notice: 'Showing demo data. IMAP connection failed or no emails found in your inbox.',
      imapError: imapResult.error || 'No IMAP emails available',
    });
  } catch (error) {
    console.error('Inbox fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch emails',
    }, { status: 500 });
  }
}