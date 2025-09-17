import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    // Debug logging
    console.log('Environment check:', {
      hasApiToken: !!apiToken,
      hasOrgId: !!organizationId,
      apiTokenLength: apiToken?.length || 0,
      orgIdValue: organizationId || 'undefined'
    });

    if (!apiToken || !organizationId) {
      return NextResponse.json(
        {
          error: 'Make.com credentials not configured',
          debug: {
            hasApiToken: !!apiToken,
            hasOrgId: !!organizationId,
            envKeys: Object.keys(process.env).filter(key => key.includes('MAKE'))
          }
        },
        { status: 400 }
      );
    }

    // Don't expose actual API token to client
    return NextResponse.json({
      apiToken: 'configured',
      organizationId
    });
  } catch (error) {
    console.error('Error getting Make config:', error);
    return NextResponse.json(
      { error: 'Failed to get Make configuration' },
      { status: 500 }
    );
  }
}