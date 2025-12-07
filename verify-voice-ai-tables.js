const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Using service role key:', !!envVars.SUPABASE_SERVICE_ROLE_KEY);
console.log('Key starts with:', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
  console.log('\n📋 Checking for voice_ai_leads table...\n');

  // Try to select from the table
  const { data, error } = await supabase
    .from('voice_ai_leads')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ ERROR: voice_ai_leads table does NOT exist or is not accessible!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('\n📝 You need to run the SQL migration in Supabase:');
    console.error('1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    console.error('2. Click "SQL Editor" in the left sidebar');
    console.error('3. Click "New Query"');
    console.error('4. Copy and paste the contents of sql/voice_ai_system.sql');
    console.error('5. Click "Run" to execute the migration');
    return false;
  }

  console.log('✅ voice_ai_leads table EXISTS and is accessible!');
  console.log('Current row count:', data?.length || 0);

  // Try inserting a test lead
  console.log('\n🧪 Testing insert...');
  const testLead = {
    business_name: 'Test Business',
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
    console.error('❌ INSERT FAILED:');
    console.error('Error code:', insertError.code);
    console.error('Error message:', insertError.message);
    console.error('Error details:', insertError.details);
    console.error('Error hint:', insertError.hint);
    return false;
  }

  console.log('✅ Successfully inserted test lead!');
  console.log('Inserted lead ID:', insertData[0].id);

  // Delete the test lead
  await supabase
    .from('voice_ai_leads')
    .delete()
    .eq('id', insertData[0].id);

  console.log('✅ Test lead deleted');
  console.log('\n🎉 All checks passed! Your database is ready.');

  return true;
}

verifyTables()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
  });
