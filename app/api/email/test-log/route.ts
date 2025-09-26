import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST() {
  try {
    console.log('🧪 Creating test email log entry...');

    const supabase = getSupabaseClient();

    // Create a test email log entry
    const testEmailLog = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      template_id: 'call-outcome-interested-construction',
      subject: 'Great speaking with you - Construction AI Solutions',
      status: 'sent',
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      error_message: null,
      metadata: {
        fromEmail: 'contact@coldsolutions.ca',
        toEmail: 'test@example.com',
        messageId: `<test_${Date.now()}@coldsolutions.ca>`,
        variables: {
          contact_first_name: 'John',
          company_name: 'Test Construction Co'
        },
        source: 'test_endpoint',
        content: {
          text: 'Hi John,\n\nGreat speaking with you today - I could tell you understand how costly missed calls and slow follow-up are in construction.',
          html: '<p>Hi John,</p><p>Great speaking with you today - I could tell you understand how costly missed calls and slow follow-up are in construction.</p>'
        }
      },
      lead_id: null,
      campaign_id: null,
      sequence_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('email_logs')
      .insert(testEmailLog)
      .select();

    if (error) {
      console.error('❌ Failed to create test email log:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create test email log',
        details: error
      }, { status: 500 });
    }

    console.log('✅ Test email log created successfully:', data[0]);

    return NextResponse.json({
      success: true,
      message: 'Test email log created successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Test email log creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}