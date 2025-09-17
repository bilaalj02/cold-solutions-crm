import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../lib/make-api-helper';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    console.log('Make scenarios API debug:', {
      hasApiToken: !!apiToken,
      hasOrgId: !!organizationId,
      apiTokenPrefix: apiToken?.substring(0, 8) + '...',
      orgId: organizationId
    });

    if (!apiToken || !organizationId) {
      console.error('Missing Make credentials:', { hasApiToken: !!apiToken, hasOrgId: !!organizationId });
      return NextResponse.json(
        { error: 'Make.com credentials not configured' },
        { status: 400 }
      );
    }

    const response = await makeApiRequest(
      `/organizations/${organizationId}/scenarios`,
      apiToken,
      organizationId
    );

    const scenarios = await response.json();
    console.log('Successfully fetched scenarios:', scenarios?.length || 0);
    return NextResponse.json(scenarios);

  } catch (error) {
    console.error('Error fetching Make scenarios:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch scenarios',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}