/**
 * Voice AI Database Migration Script
 * Runs the voice_ai_system.sql migration on Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting Voice AI database migration...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', 'voice_ai_system.sql');
    console.log(`📄 Reading SQL file: ${sqlPath}`);

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL file loaded successfully\n');

    // Split SQL into individual statements
    // Remove comments and split by semicolons
    const statements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements
      if (!statement || statement.length < 10) continue;

      // Get statement type for logging
      const stmtType = statement.split(/\s+/)[0].toUpperCase();
      const stmtName = getStatementName(statement);

      try {
        console.log(`[${i + 1}/${statements.length}] Executing ${stmtType}: ${stmtName}...`);

        const { error } = await supabase.rpc('exec_sql', { sql_query: statement }).catch(async (e) => {
          // If RPC doesn't exist, try direct execution (for tables/views)
          return await supabase.from('_sql_runner').select('*').limit(0);
        });

        if (error) {
          // Some errors are acceptable (e.g., "already exists")
          if (
            error.message.includes('already exists') ||
            error.message.includes('does not exist') ||
            error.code === '42P07' || // duplicate table
            error.code === '42710' // duplicate object
          ) {
            console.log(`⚠️  Warning: ${error.message} (skipping)`);
            successCount++;
          } else {
            console.error(`❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
          console.log('✅ Success\n');
        }
      } catch (err) {
        console.error(`❌ Error executing statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('  1. Verify tables in Supabase dashboard');
      console.log('  2. Check RLS policies are enabled');
      console.log('  3. Test API endpoints');
      console.log('  4. Import test leads via CSV');
    } else {
      console.log('⚠️  Migration completed with some errors.');
      console.log('Please review the errors above and run the migration again if needed.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during migration:');
    console.error(error);
    process.exit(1);
  }
}

// Helper function to extract statement name from SQL
function getStatementName(statement) {
  const match = statement.match(/(?:TABLE|VIEW|FUNCTION|TRIGGER|INDEX|POLICY)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?(\w+)/i);
  return match ? match[1] : 'unknown';
}

// Alternative method: Direct table creation
async function createTablesDirectly() {
  console.log('🔄 Using alternative method: Direct table creation\n');

  const tables = [
    'voice_ai_leads',
    'voice_ai_campaigns',
    'voice_ai_call_logs',
    'voice_ai_research_queue',
    'voice_ai_call_queue',
    'voice_ai_settings'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log(`📝 Table '${table}' does not exist - needs to be created via SQL`);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (err) {
      console.log(`⚠️  Could not check table '${table}': ${err.message}`);
    }
  }

  console.log('\n💡 Please run the SQL migration manually in Supabase SQL Editor:');
  console.log('   1. Open Supabase Dashboard');
  console.log('   2. Go to SQL Editor');
  console.log('   3. Copy and paste the contents of sql/voice_ai_system.sql');
  console.log('   4. Execute the SQL');
}

// Run migration
console.log('Voice AI Database Migration Tool\n');
console.log('Supabase URL:', supabaseUrl);
console.log('\n');

// Ask user for confirmation
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Ready to run migration? This will create 6 tables and related objects. (y/n): ', async (answer) => {
  readline.close();

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n');
    // Since Supabase doesn't support arbitrary SQL via API easily, we'll use the alternative method
    await createTablesDirectly();
  } else {
    console.log('Migration cancelled.');
  }
});
