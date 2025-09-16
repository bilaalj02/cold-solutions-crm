import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    codeVersion: 'final-database-fix-2025-09-16',
    hardcodedFallbackActive: true,
    status: 'DEPLOYED - All database pages should work'
  };

  return NextResponse.json(debugInfo);
}