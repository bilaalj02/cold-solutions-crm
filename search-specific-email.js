import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ukxmrjmlwjzeapploqjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreG1yam1sd2p6ZWFwcGxvcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDI5MTMsImV4cCI6MjA3MzYxODkxM30.cqR-YcFkbCOBKfoBp58gx5xC9OxTxMRir9rGNCQJdOg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchEmail() {
  console.log('🔍 Searching for House Pro Air Conditioning email...\n');

  // Search by recipient email
  const { data: byEmail, error: emailError } = await supabase
    .from('email_logs')
    .select('*')
    .or('metadata->>toEmail.eq.oncall@houseproac.net,subject.ilike.%House Pro%')
    .order('sent_at', { ascending: false })
    .limit(5);

  if (emailError) {
    console.error('❌ Error searching:', emailError);
  } else {
    console.log(`Found ${byEmail?.length || 0} emails matching House Pro:`);
    byEmail?.forEach((email, i) => {
      console.log(`\n${i + 1}. ${email.subject}`);
      console.log(`   To: ${email.metadata?.toEmail}`);
      console.log(`   Sent: ${email.sent_at}`);
      console.log(`   Status: ${email.status}`);
      console.log(`   ID: ${email.id}`);
    });
  }

  // Also check message ID
  console.log('\n🔍 Searching by message ID...\n');
  const { data: byMessageId, error: msgError } = await supabase
    .from('email_logs')
    .select('*')
    .eq('metadata->>messageId', '<aa53b554-de6c-da50-ecb8-02871fa80dd7@coldsolutionsai.com>')
    .limit(1);

  if (msgError) {
    console.error('❌ Error:', msgError);
  } else if (byMessageId && byMessageId.length > 0) {
    console.log('✅ Found by message ID:', byMessageId[0].subject);
  } else {
    console.log('❌ NOT FOUND by message ID');
  }

  // Check total count from last hour
  console.log('\n🔍 Checking emails from last hour...\n');
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recent, error: recentError } = await supabase
    .from('email_logs')
    .select('*')
    .gte('sent_at', oneHourAgo)
    .order('sent_at', { ascending: false });

  if (!recentError && recent) {
    console.log(`Found ${recent.length} emails in last hour:`);
    recent.forEach((email, i) => {
      console.log(`${i + 1}. ${email.subject} → ${email.metadata?.toEmail} (${email.sent_at})`);
    });
  }
}

searchEmail().catch(console.error);
