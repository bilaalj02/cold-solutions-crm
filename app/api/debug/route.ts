import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    codeVersion: 'ai-audit-database-fix-2025-09-16-v2',
    hardcodedFallbackActive: true,
    aiAuditPreCallId: '265c6af7fe2a80febfa8cd94864f68f7',
    status: 'DEPLOYED - Fixed ai-audit-pre-call database ID'
  };

  return NextResponse.json(debugInfo);
}