import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// This is a placeholder for IMAP inbox functionality
// In a production environment, you would implement IMAP connection here
// For now, we'll return mock data to show the UI structure

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const folder = searchParams.get('folder') || 'INBOX';

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
      notice: 'This is demo data. Configure SMTP settings to connect your real email.',
    });
  } catch (error) {
    console.error('Inbox fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch emails',
    }, { status: 500 });
  }
}