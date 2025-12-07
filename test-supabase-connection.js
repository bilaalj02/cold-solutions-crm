const { createClient } = require('@supabase/supabase-js');

// Hardcode the values temporarily to test
const supabaseUrl = 'https://ukxmrjmlwjzeapploqjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreG1yam1sd2p6ZWFwcGxvcWp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA0MjkxMywiZXhwIjoyMDczNjE4OTEzfQ.b_0o9xMrFIU-Ug8H2vLSa8NG5vLXo5pU1fVkEaV0JjQ';

console.log('Testing Supabase connection...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('1. Testing table access...');
  const { data, error } = await supabase
    .from('voice_ai_leads')
    .select('count')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
    return;
  }

  console.log('✅ Table accessible!');

  console.log('\n2. Testing insert...');
  const testLead = {
    business_name: 'Test Company',
    phone: '+16041234567',
    province: 'BC',
    industry: 'Plumbing',
    timezone: 'America/Vancouver',
    status: 'New',
    research_status: 'Pending',
    priority: 'Medium'
  };

  const { data: insertData, error: insertError } = await supabase
    .from('voice_ai_leads')
    .insert([testLead])
    .select();

  if (insertError) {
    console.error('❌ Insert error:', insertError.message);
    console.error('Code:', insertError.code);
    console.error('Details:', insertError.details);
    console.error('Hint:', insertError.hint);
    return;
  }

  console.log('✅ Insert successful!');
  console.log('Inserted ID:', insertData[0].id);

  // Clean up
  await supabase
    .from('voice_ai_leads')
    .delete()
    .eq('id', insertData[0].id);

  console.log('✅ Test data cleaned up');
  console.log('\n🎉 All tests passed! Database is ready.');
}

test().catch(console.error);
