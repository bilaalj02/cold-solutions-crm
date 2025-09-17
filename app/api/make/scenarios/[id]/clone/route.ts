import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../../../lib/make-api-helper';

export async function POST(
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

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required for cloning scenario' },
        { status: 400 }
      );
    }

    const response = await makeApiRequest(
      `/organizations/${organizationId}/scenarios/${params.id}/clone`,
      apiToken,
      organizationId,
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    );

    const clonedScenario = await response.json();
    return NextResponse.json(clonedScenario);

  } catch (error) {
    console.error('Error cloning scenario:', error);
    return NextResponse.json(
      {
        error: 'Failed to clone scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}