import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { parse } from 'csv-parse/sync';
import {
  CSVImportRow,
  ImportResult,
  ImportValidationResult
} from '@/types/business-intelligence';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer;

    // Get the CSV file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV with column normalization
    const records = parse(fileContent, {
      columns: (header) => {
        // Normalize column names to lowercase with underscores
        return header.map((col: string) =>
          col.toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^\w_]/g, '')
        );
      },
      skip_empty_lines: true,
      trim: true,
    }) as CSVImportRow[];

    console.log(`📊 Parsed ${records.length} rows from CSV`);

    // Validate and prepare data
    const validationResults: ImportValidationResult[] = records.map((row, index) =>
      validateRow(row, index + 2) // +2 because row 1 is headers, and we're 0-indexed
    );

    const validRows = validationResults.filter(r => r.valid);
    const invalidRows = validationResults.filter(r => !r.valid);

    console.log(`✅ ${validRows.length} valid rows, ❌ ${invalidRows.length} invalid rows`);

    const result: ImportResult = {
      success: true,
      imported: 0,
      duplicates: 0,
      errors: invalidRows.length,
      errorDetails: invalidRows.map(r => ({
        row: r.rowNumber,
        errors: r.errors
      }))
    };

    // Check for duplicates
    const duplicateCheck = await checkDuplicates(
      supabase,
      validRows.map(v => v.row)
    );

    const uniqueRows = validRows.filter((v, index) =>
      !duplicateCheck.duplicates.includes(index)
    );

    result.duplicates = validRows.length - uniqueRows.length;

    console.log(`🔍 ${result.duplicates} duplicates found, ${uniqueRows.length} unique rows to import`);

    // Insert valid, unique rows
    if (uniqueRows.length > 0) {
      const rowsToInsert = uniqueRows.map(v => ({
        business_name: v.row.business_name,
        industry: v.row.industry || null,
        website: v.row.website || null,
        city: v.row.city,
        state: v.row.state || null,
        country: v.row.country,
        address: v.row.address || null,
        zip_code: v.row.zip_code || null,
        phone: v.row.phone || null,
        google_maps_url: v.row.google_maps_url || null,
        analysis_status: 'Not Started',
        pushed_to_caller: false
      }));

      const { data, error } = await supabase
        .from('business_intelligence_leads')
        .insert(rowsToInsert)
        .select();

      if (error) {
        console.error('❌ Error inserting leads:', error);
        return NextResponse.json(
          { error: 'Failed to import leads: ' + error.message },
          { status: 500 }
        );
      }

      result.imported = data?.length || 0;
      console.log(`✅ Successfully imported ${result.imported} leads`);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in import:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}

/**
 * Validate a single CSV row
 */
function validateRow(row: CSVImportRow, rowNumber: number): ImportValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!row.business_name || row.business_name.trim() === '') {
    errors.push('Business name is required');
  }

  if (!row.city || row.city.trim() === '') {
    errors.push('City is required');
  }

  if (!row.country || row.country.trim() === '') {
    errors.push('Country is required');
  }

  // Optional field validation
  if (row.website && row.website.trim() !== '') {
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(row.website)) {
      // Don't fail, just warn - we'll try to fix it during analysis
      console.warn(`⚠️  Row ${rowNumber}: Website URL format may be invalid: ${row.website}`);
    }
  }

  if (row.phone && row.phone.trim() !== '') {
    // Basic phone validation (very permissive)
    const phonePattern = /[\d\(\)\-\+\s\.]{7,}/;
    if (!phonePattern.test(row.phone)) {
      console.warn(`⚠️  Row ${rowNumber}: Phone number format may be invalid: ${row.phone}`);
    }
  }

  return {
    valid: errors.length === 0,
    row,
    rowNumber,
    errors
  };
}

/**
 * Check for duplicate leads in database
 */
async function checkDuplicates(
  supabase: any,
  rows: CSVImportRow[]
): Promise<{ duplicates: number[] }> {
  const duplicateIndices: number[] = [];

  // Check each row against existing leads
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const { data, error } = await supabase
      .from('business_intelligence_leads')
      .select('id')
      .eq('business_name', row.business_name)
      .eq('city', row.city)
      .limit(1);

    if (error) {
      console.error('Error checking duplicates:', error);
      continue;
    }

    if (data && data.length > 0) {
      duplicateIndices.push(i);
    }
  }

  return { duplicates: duplicateIndices };
}
