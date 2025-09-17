import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../lib/make-api-helper';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    console.log('Make executions API debug:', {
      hasApiToken: !!apiToken,
      hasOrgId: !!organizationId,
      apiTokenPrefix: apiToken?.substring(0, 8) + '...',
      orgId: organizationId
    });

    if (!apiToken || !organizationId) {
      console.error('Missing Make credentials for executions:', { hasApiToken: !!apiToken, hasOrgId: !!organizationId });
      return NextResponse.json(
        { error: 'Make.com credentials not configured' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const response = await makeApiRequest(
      `/organizations/${organizationId}/executions?limit=${limit}`,
      apiToken,
      organizationId
    );

    const executions = await response.json();
    console.log('Successfully fetched executions:', executions?.length || 0);
    return NextResponse.json(executions);

  } catch (error) {
    console.error('Error fetching Make executions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch executions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}