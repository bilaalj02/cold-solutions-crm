import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '../../../../lib/email-service';

export async function GET() {
  try {
    const result = await emailService.testConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMTP connection successful',
        config: emailService.getConfig(),
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test connection',
    }, { status: 500 });
  }
}