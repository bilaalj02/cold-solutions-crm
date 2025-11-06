/**
 * Check Email Logs in Database
 * Quick script to verify emails are being saved
 */

import { createClient } from '@supabase/supabase-js';

// Hardcode for quick check
const supabaseUrl = 'https://ukxmrjmlwjzeapploqjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreG1yam1sd2p6ZWFwcGxvcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDI5MTMsImV4cCI6MjA3MzYxODkxM30.cqR-YcFkbCOBKfoBp58gx5xC9OxTxMRir9rGNCQJdOg';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmailLogs() {
  console.log('🔍 Checking email_logs table...\n');

  // Get total count
  const { count, error: countError } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting emails:', countError);
  } else {
    console.log(`📊 Total emails in email_logs: ${count || 0}\n`);
  }

  // Get recent emails
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching emails:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ No emails found in database');
    console.log('\n💡 This means the webhook might not be inserting data.');
    console.log('   Check the /api/email/track endpoint in your CRM.');
    return;
  }

  console.log(`✅ Found ${data.length} recent emails:\n`);

  data.forEach((email, index) => {
    console.log(`${index + 1}. ${email.subject || 'No subject'}`);
    console.log(`   To: ${email.metadata?.toEmail || 'Unknown'}`);
    console.log(`   Status: ${email.status}`);
    console.log(`   Sent: ${email.sent_at || email.created_at}`);
    console.log(`   Opened: ${email.opened_at ? '✅ Yes' : '❌ No'}`);
    console.log(`   Clicked: ${email.clicked_at ? '✅ Yes' : '❌ No'}`);
    console.log('');
  });

  // Check email_sends table too
  console.log('\n🔍 Checking email_sends table...\n');

  const { data: sendsData, error: sendsError } = await supabase
    .from('email_sends')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(5);

  if (sendsError) {
    console.error('❌ Error fetching email_sends:', sendsError);
  } else if (sendsData && sendsData.length > 0) {
    console.log(`✅ Found ${sendsData.length} recent sends:\n`);
    sendsData.forEach((send, index) => {
      console.log(`${index + 1}. ${send.template_name}`);
      console.log(`   To: ${send.recipient_email}`);
      console.log(`   Status: ${send.status}`);
      console.log(`   Sent: ${send.sent_at}`);
      console.log('');
    });
  } else {
    console.log('⚠️ No sends found in email_sends table');
  }
}

checkEmailLogs().catch(console.error);
