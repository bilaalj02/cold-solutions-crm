import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../../../lib/make-api-helper';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    if (!apiToken || !organizationId) {
      return NextResponse.json(
        { error: 'Make.com credentials not configured' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';

    const response = await makeApiRequest(
      `/organizations/${organizationId}/scenarios/${params.id}/executions?page=${page}&limit=${limit}`,
      apiToken,
      organizationId
    );

    const executions = await response.json();
    return NextResponse.json(executions);

  } catch (error) {
    console.error('Error fetching scenario executions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch scenario executions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}