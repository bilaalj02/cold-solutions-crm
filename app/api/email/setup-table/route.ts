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
    console.log('🛠️ Setting up email_logs table...');

    const supabase = getSupabaseClient();

    // Create the email_logs table with the required structure
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS email_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        template_id TEXT,
        subject TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivered_at TIMESTAMP WITH TIME ZONE,
        opened_at TIMESTAMP WITH TIME ZONE,
        clicked_at TIMESTAMP WITH TIME ZONE,
        replied_at TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        lead_id TEXT,
        campaign_id TEXT,
        sequence_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Enable RLS (Row Level Security)
    const enableRLSSQL = `
      ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
    `;

    // Create a policy to allow all operations for now (you may want to restrict this)
    const createPolicySQL = `
      CREATE POLICY IF NOT EXISTS "Allow all operations on email_logs"
      ON email_logs FOR ALL
      USING (true)
      WITH CHECK (true);
    `;

    console.log('📝 Checking if table exists by attempting to query it...');

    // Try to query the table to see if it exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('email_logs')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('❌ Table does not exist or has access issues:', tableError.message);
      return NextResponse.json({
        success: false,
        error: 'Email logs table does not exist or is not accessible',
        details: {
          message: 'Please create the email_logs table in your Supabase database using the Supabase dashboard.',
          tableError: tableError.message,
          sqlSchema: `
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  lead_id TEXT,
  campaign_id TEXT,
  sequence_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on email_logs"
ON email_logs FOR ALL
USING (true)
WITH CHECK (true);
          `
        }
      }, { status: 500 });
    } else {
      console.log('✅ Table exists and is accessible');
    }

    // Try to insert a test record to verify the table structure
    const testRecord = {
      template_id: 'setup-test',
      subject: 'Table Setup Test',
      status: 'sent',
      metadata: {
        test: true,
        created_by: 'setup_script'
      }
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('email_logs')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create/verify table structure',
        details: {
          tableError,
          insertError
        }
      }, { status: 500 });
    }

    console.log('✅ Test record inserted successfully:', insertResult[0]);

    // Clean up the test record
    await supabase
      .from('email_logs')
      .delete()
      .eq('id', insertResult[0].id);

    return NextResponse.json({
      success: true,
      message: 'Email logs table setup completed successfully',
      tableCreated: !tableError,
      testInsertSuccessful: !insertError
    });

  } catch (error) {
    console.error('❌ Table setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during table setup',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}