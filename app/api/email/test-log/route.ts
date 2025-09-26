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

    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? '✅ Present' : '❌ Missing',
      supabaseServiceKey: supabaseServiceKey ? '✅ Present' : '❌ Missing'
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase configuration missing',
        details: {
          supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
          supabaseServiceKey: supabaseServiceKey ? 'Present' : 'Missing'
        }
      }, { status: 500 });
    }

    const supabase = getSupabaseClient();

    // First, let's check if the table exists and what its structure is
    console.log('🔍 Checking email_logs table structure...');

    const { data: tableCheck, error: tableError } = await supabase
      .from('email_logs')
      .select('*')
      .limit(1);

    console.log('Table check result:', { tableCheck, tableError });

    // Create a simplified test email log entry
    const testEmailLog = {
      template_id: 'call-outcome-interested-construction',
      subject: 'Great speaking with you - Construction AI Solutions',
      status: 'sent',
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
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
      }
    };

    console.log('📝 Inserting test email log:', testEmailLog);

    const { data, error } = await supabase
      .from('email_logs')
      .insert(testEmailLog)
      .select();

    if (error) {
      console.error('❌ Failed to create test email log:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create test email log',
        details: error,
        sqlError: error.message,
        hint: error.hint
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
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}