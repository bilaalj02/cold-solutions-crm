import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    supabaseUrl: supabaseUrl,
    supabaseUrlLength: supabaseUrl?.length || 0,
    hasAnonKey: hasKey,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    // Show first 30 chars of URL to verify which database
    urlPreview: supabaseUrl?.substring(0, 30) + '...',
  });
}
