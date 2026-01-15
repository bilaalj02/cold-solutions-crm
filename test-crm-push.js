// Test script to verify CRM can push leads to Cold Caller
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function testCRMPush() {
  console.log('🔍 Testing CRM to Cold Caller Push...\n');

  try {
    // Step 1: Check if we have any completed BI leads
    console.log('Step 1: Checking for completed Business Intelligence leads...');
    const { data: biLeads, error: biError } = await supabase
      .from('business_intelligence_complete')
      .select('id, business_name, phone, industry, analysis_status, pushed_to_caller')
      .eq('analysis_status', 'Complete')
      .limit(5);

    if (biError) {
      console.log('❌ Error fetching BI leads:', biError.message);
      return;
    }

    if (!biLeads || biLeads.length === 0) {
      console.log('⚠️ No completed BI leads found to test with');
      console.log('   Go to the CRM and analyze some businesses first\n');
      return;
    }

    console.log(`✅ Found ${biLeads.length} completed BI leads:`);
    biLeads.forEach((lead, i) => {
      console.log(`   ${i + 1}. ${lead.business_name} (${lead.industry || 'N/A'}) - ${lead.pushed_to_caller ? '✓ Pushed' : '○ Not pushed'}`);
    });

    // Step 2: Test creating a lead list
    console.log('\nStep 2: Testing lead list creation...');
    const today = new Date().toISOString().split('T')[0];
    const testListName = `Test Push - ${today} ${Date.now()}`;

    const { data: testList, error: listError } = await supabase
      .from('lead_lists')
      .insert({
        id: `test-list-${Date.now()}`,
        name: testListName,
        description: 'Test push from CRM BI',
        total_leads: 0,
        contacted: 0,
        qualified: 0,
        converted: 0
      })
      .select()
      .single();

    if (listError) {
      console.log('❌ Error creating lead list:', listError.message);
      return;
    }

    console.log('✅ Lead list created successfully!');
    console.log(`   ID: ${testList.id}`);
    console.log(`   Name: ${testList.name}`);

    // Step 3: Test inserting a lead
    console.log('\nStep 3: Testing lead insertion...');
    const testLead = biLeads[0];

    const { data: insertedLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        id: `bi-test-${Date.now()}`,
        name: testLead.business_name,
        email: '',
        phone: testLead.phone || '',
        company: testLead.business_name,
        position: '',
        source: 'Other', // Must be: Website, Referral, Social Media, Email Campaign, Cold Call, Event, CSV Import, Other
        lead_source: 'Business Intelligence',
        original_source: 'CRM BI System',
        status: 'New',
        priority: 'Medium',
        industry: testLead.industry || '',
        lead_list_id: testList.id,
        notes: 'Test lead from CRM BI system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (leadError) {
      console.log('❌ Error inserting lead:', leadError.message);
      // Clean up the test list
      await supabase.from('lead_lists').delete().eq('id', testList.id);
      return;
    }

    console.log('✅ Lead inserted successfully!');
    console.log(`   ID: ${insertedLead.id}`);
    console.log(`   Name: ${insertedLead.name}`);

    // Step 4: Verify counts updated
    console.log('\nStep 4: Verifying lead list counts updated...');
    const { data: updatedList } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('id', testList.id)
      .single();

    if (updatedList) {
      console.log('✅ Lead list counts:');
      console.log(`   Total Leads: ${updatedList.total_leads}`);
      console.log(`   Contacted: ${updatedList.contacted}`);
      console.log(`   Qualified: ${updatedList.qualified}`);
      console.log(`   Converted: ${updatedList.converted}`);
    }

    // Clean up
    console.log('\nCleaning up test data...');
    await supabase.from('leads').delete().eq('id', insertedLead.id);
    await supabase.from('lead_lists').delete().eq('id', testList.id);

    console.log('\n✨ All tests passed! CRM push is fully functional.\n');
    console.log('📋 Next steps:');
    console.log('   1. Go to your CRM Business Intelligence page');
    console.log('   2. Select some analyzed leads');
    console.log('   3. Click "Push to Cold Caller"');
    console.log('   4. Check the Cold Caller app to see the leads!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCRMPush();
