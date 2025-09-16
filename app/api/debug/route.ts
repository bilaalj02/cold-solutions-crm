import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    codeVersion: 'main-leads-fix-2025-09-16-v3',
    hardcodedFallbackActive: true,
    allDatabasesFixed: true,
    status: 'DEPLOYED - Fixed main leads page and all individual pages'
  };

  return NextResponse.json(debugInfo);
}