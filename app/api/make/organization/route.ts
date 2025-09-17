import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../lib/make-api-helper';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    console.log('Make organization API debug:', {
      hasApiToken: !!apiToken,
      hasOrgId: !!organizationId,
      apiTokenPrefix: apiToken?.substring(0, 8) + '...',
      orgId: organizationId
    });

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

    if (!response.ok) {
      console.error('Make organization API failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);

      // Return default organization data to prevent crashes
      const defaultOrg = {
        id: organizationId,
        name: 'Cold Solutions Organization',
        plan: 'Professional',
        limits: { operations: 40000, dataTransfer: 100000000, scenarios: 1000 },
        usage: { operations: 0, dataTransfer: 0, scenarios: 0 }
      };

      return NextResponse.json({ data: defaultOrg });
    }

    const orgData = await response.json();
    console.log('Make organization API response:', JSON.stringify(orgData, null, 2));

    // Transform to match MakeOrganization interface
    // The actual Make API returns: { organization: { ... } }
    const org = orgData.organization || orgData;

    const organization = {
      id: org.id?.toString() || organizationId,
      name: org.name || 'Cold Solutions Organization',
      plan: org.productName || 'Professional',
      limits: {
        operations: org.license?.operations || 40000,
        dataTransfer: org.license?.transfer || 100000000,
        scenarios: org.license?.dslimit || 1000
      },
      usage: {
        operations: parseInt(org.operations) || 0,
        dataTransfer: parseInt(org.transfer) || 0,
        scenarios: org.activeScenarios || 0
      }
    };

    // Return in MakeApiResponse format
    return NextResponse.json({
      data: organization
    });

  } catch (error) {
    console.error('Error fetching Make organization:', error);

    // Return default organization data instead of error to prevent frontend crashes
    const defaultOrg = {
      id: process.env.MAKE_ORGANIZATION_ID || '4680352',
      name: 'Cold Solutions Organization',
      plan: 'Professional',
      limits: { operations: 40000, dataTransfer: 100000000, scenarios: 1000 },
      usage: { operations: 0, dataTransfer: 0, scenarios: 0 }
    };

    console.log('Returning default organization data due to error');
    return NextResponse.json({ data: defaultOrg });
  }
}