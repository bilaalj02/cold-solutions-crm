import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../lib/make-api-helper';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    if (!apiToken || !organizationId) {
      return NextResponse.json(
        {
          error: {
            message: 'Make.com credentials not configured',
            code: '400'
          }
        },
        { status: 400 }
      );
    }

    const response = await makeApiRequest(
      `/organizations/${organizationId}`,
      apiToken,
      organizationId
    );

    const orgData = await response.json();

    // Transform to match MakeOrganization interface
    const organization = {
      id: orgData.id?.toString() || organizationId,
      name: orgData.name || 'Cold Solutions Organization',
      plan: orgData.plan?.name || 'Professional',
      limits: {
        operations: orgData.limits?.operations || 40000,
        dataTransfer: orgData.limits?.dataTransfer || 100000000, // 100MB
        scenarios: orgData.limits?.scenarios || 1000
      },
      usage: {
        operations: orgData.usage?.operations || 0,
        dataTransfer: orgData.usage?.dataTransfer || 0,
        scenarios: orgData.usage?.scenarios || 0
      }
    };

    // Return in MakeApiResponse format
    return NextResponse.json({
      data: organization
    });

  } catch (error) {
    console.error('Error fetching Make organization:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Failed to fetch organization',
          code: '500'
        },
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}