/**
 * Verify Voice AI Tables Script
 * Checks that all tables were created successfully
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const EXPECTED_TABLES = [
  'voice_ai_leads',
  'voice_ai_campaigns',
  'voice_ai_call_logs',
  'voice_ai_research_queue',
  'voice_ai_call_queue',
  'voice_ai_settings'
];

async function verifyTables() {
  console.log('🔍 Verifying Voice AI Database Tables...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('\n' + '='.repeat(60) + '\n');

  let allTablesExist = true;

  for (const tableName of EXPECTED_TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(0);

      if (error) {
        console.log(`❌ ${tableName.padEnd(30)} NOT FOUND`);
        console.log(`   Error: ${error.message}\n`);
        allTablesExist = false;
      } else {
        console.log(`✅ ${tableName.padEnd(30)} EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${tableName.padEnd(30)} ERROR`);
      console.log(`   ${err.message}\n`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  if (allTablesExist) {
    console.log('🎉 SUCCESS! All Voice AI tables are ready!\n');
    console.log('Next steps:');
    console.log('  1. ✅ Database tables created');
    console.log('  2. 🚀 Start the MCP server: cd ../cold-solutions-mcp-server && npm run dev');
    console.log('  3. 🧪 Test the system: http://localhost:3000/voice-ai/leads');
    console.log('  4. 📊 Import sample leads via CSV');
    console.log('  5. 🎯 Create your first campaign\n');
  } else {
    console.log('⚠️  Some tables are missing!');
    console.log('Please run the SQL migration again in Supabase SQL Editor.\n');
  }
}

verifyTables().catch(console.error);
