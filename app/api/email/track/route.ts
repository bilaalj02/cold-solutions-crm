import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      template_id,
      template_name,
      recipient_email,
      recipient_name,
      subject,
      status = 'delivered',
      industry = 'general',
      lead_id,
      metadata = {}
    } = body;

    // Validate required fields
    if (!template_name || !recipient_email || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: template_name, recipient_email, subject' },
        { status: 400 }
      );
    }

    // Insert to email_sends table (for analytics)
    const { data, error } = await supabase
      .from('email_sends')
      .insert([
        {
          template_id,
          template_name,
          recipient_email,
          recipient_name,
          subject,
          status,
          industry,
          lead_id,
          metadata,
          sent_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error tracking email send:', error);
      return NextResponse.json(
        { error: 'Failed to track email send', details: error.message },
        { status: 500 }
      );
    }

    // ALSO insert to email_logs table (for Email Logs page UI)
    const emailLogRecord = {
      template_id: template_id || template_name,
      subject,
      status: status === 'delivered' ? 'sent' : status,
      sent_at: new Date().toISOString(),
      delivered_at: status === 'delivered' ? new Date().toISOString() : null,
      metadata: {
        template_id: template_id || template_name,
        fromEmail: 'contact@coldsolutions.ca',
        toEmail: recipient_email,
        messageId: metadata?.messageId || `<${Date.now()}@coldsolutions.ca>`,
        content: metadata?.content || null
      }
    };

    const { error: logError } = await supabase
      .from('email_logs')
      .insert([emailLogRecord]);

    if (logError) {
      console.error('Error inserting to email_logs:', logError);
      // Don't fail the request if email_logs insert fails
    } else {
      console.log('✅ Email logged to both email_sends and email_logs tables');
    }

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Email send tracked successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in email tracking endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve email sends (for analytics)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const template_id = searchParams.get('template_id');
    const industry = searchParams.get('industry');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('email_sends')
      .select('*')
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (template_id) {
      query = query.eq('template_id', template_id);
    }

    if (industry) {
      query = query.eq('industry', industry);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching email sends:', error);
      return NextResponse.json(
        { error: 'Failed to fetch email sends', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error in GET email tracking endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
