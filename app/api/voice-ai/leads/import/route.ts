import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST - Import leads from CSV
export async function POST(request: NextRequest) {
  console.log('========== IMPORT ENDPOINT HIT ==========');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);

  let body;
  try {
    console.log('Attempting to parse request body...');
    body = await request.json();
    console.log('Body parsed successfully:', { bodyKeys: Object.keys(body), bodyType: typeof body });
  } catch (parseError: any) {
    console.error('========== ERROR PARSING JSON ==========');
    console.error('Parse error:', parseError.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to parse JSON request body',
      details: parseError.message
    }, { status: 400 });
  }

  const { csvData } = body;
  console.log('csvData extracted:', { hasCsvData: !!csvData, csvDataType: typeof csvData });

  if (!csvData) {
    console.error('No csvData in request body:', body);
    return NextResponse.json({
      success: false,
      error: 'csvData is required'
    }, { status: 400 });
  }

  try {
    console.log('CSV data length:', csvData.length);

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    console.log('Split into lines:', lines.length);

    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'CSV must contain header row and at least one data row'
      }, { status: 400 });
    }

    // Get headers and normalize them
    const rawHeaders = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    console.log('Raw headers:', rawHeaders);

    // Normalize headers - replace spaces with underscores and map common variations
    const headerMap: Record<string, string> = {
      'business name': 'business_name',
      'business_name': 'business_name',
      'phone': 'phone',
      'phone number': 'phone',
      'phone_number': 'phone',
      'province': 'province',
      'industry': 'industry',
      'contact name': 'contact_name',
      'contact_name': 'contact_name',
      'email': 'email',
      'email address': 'email',
      'website': 'website',
      'address': 'address',
      'city': 'city',
      'postal code': 'postal_code',
      'postal_code': 'postal_code',
      'zip': 'postal_code',
      'zip code': 'postal_code'
    };

    const headers = rawHeaders.map(h => headerMap[h] || h.replace(/\s+/g, '_'));
    console.log('Normalized headers:', headers);

    // Required fields
    const requiredFields = ['business_name', 'phone', 'province', 'industry'];
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Parse data rows
    const leads = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',').map((v: string) => v.trim());

      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const leadData: any = {};
      headers.forEach((header: string, index: number) => {
        leadData[header] = values[index];
      });

      // Validate required fields
      const hasRequiredFields = requiredFields.every(field => leadData[field]);
      if (!hasRequiredFields) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      // Normalize and validate province (case-insensitive)
      const provinceMap: Record<string, string> = {
        'bc': 'BC',
        'british columbia': 'BC',
        'ab': 'AB',
        'alberta': 'AB',
        'on': 'ON',
        'ontario': 'ON',
        'qc': 'QC',
        'quebec': 'QC',
        'québec': 'QC'
      };

      const normalizedProvince = provinceMap[leadData.province?.toLowerCase()] || leadData.province?.toUpperCase();
      if (!['BC', 'AB', 'ON', 'QC'].includes(normalizedProvince)) {
        errors.push(`Row ${i + 1}: Invalid province "${leadData.province}". Must be BC, AB, ON, or QC`);
        continue;
      }
      leadData.province = normalizedProvince;

      // Normalize and validate industry (case-insensitive)
      const industryMap: Record<string, string> = {
        'plumbing': 'Plumbing',
        'plumber': 'Plumbing',
        'hvac': 'HVAC',
        'heating': 'HVAC',
        'cooling': 'HVAC',
        'home services': 'Home Services',
        'home service': 'Home Services',
        'other': 'Other'
      };

      const normalizedIndustry = industryMap[leadData.industry?.toLowerCase()] || leadData.industry;
      if (!['Plumbing', 'HVAC', 'Home Services', 'Other'].includes(normalizedIndustry)) {
        errors.push(`Row ${i + 1}: Invalid industry "${leadData.industry}". Must be Plumbing, HVAC, Home Services, or Other`);
        continue;
      }
      leadData.industry = normalizedIndustry;

      // Set timezone based on province
      const timezones: Record<string, string> = {
        'BC': 'America/Vancouver',
        'AB': 'America/Edmonton',
        'ON': 'America/Toronto',
        'QC': 'America/Montreal'
      };
      leadData.timezone = timezones[leadData.province];

      // Set default values
      leadData.status = 'New';
      leadData.research_status = 'Pending';
      leadData.priority = 'Medium';

      leads.push(leadData);
    }

    console.log('Parsed leads:', leads.length);
    console.log('Errors:', errors.length);

    if (leads.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid leads found in CSV',
        errors
      }, { status: 400 });
    }

    // Insert leads into database
    console.log('Inserting into database...');
    console.log('Lead data sample:', JSON.stringify(leads[0], null, 2));
    console.log('Total leads to insert:', leads.length);

    let data, error;
    try {
      console.log('Calling Supabase insert...');
      const result = await supabaseServer
        .from('voice_ai_leads')
        .insert(leads)
        .select();

      data = result.data;
      error = result.error;

      console.log('Supabase insert completed');
      console.log('Has error?', !!error);
      console.log('Has data?', !!data);

      if (error) {
        console.error('========== SUPABASE ERROR DETAILS ==========');
        console.error('Error object:', JSON.stringify(error, null, 2));
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);

        return NextResponse.json({
          success: false,
          error: error.message || 'Database insert failed',
          errorCode: error.code,
          errorDetails: error,
          imported: 0
        }, { status: 500 });
      }

      if (!data || data.length === 0) {
        console.error('========== NO DATA RETURNED ==========');
        return NextResponse.json({
          success: false,
          error: 'No data returned from database',
          imported: 0
        }, { status: 500 });
      }

      console.log('✅ Successfully inserted:', data.length, 'leads');

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${data.length} leads`,
        imported: data.length,
        leads: data
      });
    } catch (insertError: any) {
      console.error('========== EXCEPTION DURING INSERT ==========');
      console.error('Exception type:', insertError.constructor.name);
      console.error('Exception message:', insertError.message);
      console.error('Exception stack:', insertError.stack);

      return NextResponse.json({
        success: false,
        error: 'Database insert threw exception: ' + insertError.message,
        exceptionType: insertError.constructor.name,
        imported: 0,
        errors
      }, { status: 500 });
    }

    if (error) {
      console.error('========== DATABASE ERROR ==========');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error name:', error.name);
      console.error('Full error keys:', Object.keys(error));
      console.error('Full error object:', JSON.stringify(error, null, 2));

      return NextResponse.json({
        success: false,
        error: error.message || 'Database insert failed',
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        errorName: error.name,
        fullError: JSON.stringify(error),
        imported: 0,
        errors
      }, { status: 500 });
    }

    console.log('Successfully inserted:', data?.length || 0, 'leads');

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${data.length} leads`,
      imported: data.length,
      errors: errors.length > 0 ? errors : undefined,
      leads: data
    });

  } catch (error: any) {
    console.error('========== ERROR IN IMPORT ENDPOINT ==========');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      errorType: error.constructor.name,
      details: error.toString()
    }, { status: 500 });
  }
}
