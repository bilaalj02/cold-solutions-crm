import { NextRequest, NextResponse } from 'next/server';
import { imapService } from '../../../../lib/imap-service';

export async function GET() {
  try {
    const testResult = await imapService.testConnection();

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'IMAP connection successful',
        config: imapService.getConfig(),
      });
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error,
        config: imapService.getConfig(),
      }, { status: 500 });
    }
  } catch (error) {
    console.error('IMAP connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test IMAP connection',
    }, { status: 500 });
  }
}