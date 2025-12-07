/**
 * Voice AI Database Setup Script
 *
 * Run this to set up the Voice AI cold calling system in Supabase
 *
 * Usage: node scripts/setup-voice-ai-db.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration (from .env)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ukxmrjmlwjzeapploqjy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreG1yam1sd2p6ZWFwcGxvcWp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA0MjkxMywiZXhwIjoyMDczNjE4OTEzfQ.Ty5ibXv1t7LLTwHNWxzQhk_JM8UnrxGzz9Uqw3MrSKE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('🚀 Starting Voice AI Database Setup...\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '..', 'sql', 'voice_ai_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Migration file loaded:', sqlPath);
    console.log('📊 Executing SQL migration...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql function doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not available, attempting alternative method...\n');

      // Split SQL by statements and execute one by one
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';

        // Skip comments and empty statements
        if (statement.startsWith('--') || statement.trim() === ';') {
          continue;
        }

        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });

          if (stmtError) {
            console.log(`❌ Statement ${i + 1} failed:`, stmtError.message);
            errorCount++;
          } else {
            successCount++;
            if (successCount % 10 === 0) {
              console.log(`✅ ${successCount} statements executed successfully...`);
            }
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} skipped:`, err.message);
        }
      }

      console.log(`\n✅ Migration completed: ${successCount} successful, ${errorCount} errors\n`);
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const tables = [
      'voice_ai_leads',
      'voice_ai_campaigns',
      'voice_ai_call_logs',
      'voice_ai_research_queue',
      'voice_ai_call_queue',
      'voice_ai_settings'
    ];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);

      if (error) {
        console.log(`❌ Table ${table} verification failed:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists and is accessible`);
      }
    }

    console.log('\n🎉 Voice AI Database Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Configure Retell AI settings in the CRM Settings page');
    console.log('2. Import your first batch of leads');
    console.log('3. Create a campaign and start calling!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
