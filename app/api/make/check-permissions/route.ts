import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    if (!apiToken || !organizationId) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    console.log('=== Checking Make API Permissions and Access ===');

    // First, get the list of all organizations the user has access to
    try {
      const orgsResponse = await fetch(`https://us2.make.com/api/v2/organizations`, {
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      let organizationsData = null;
      if (orgsResponse.ok) {
        organizationsData = await orgsResponse.json();
        console.log('Organizations accessible to user:', organizationsData);
      } else {
        console.log('Failed to get organizations list:', orgsResponse.status, await orgsResponse.text());
      }

      // Check if the specified organization ID is in the accessible list
      const hasAccessToOrg = organizationsData && organizationsData.some
        ? organizationsData.some((org: any) => org.id.toString() === organizationId)
        : false;

      // Now test specific organization access
      const specificOrgResponse = await fetch(`https://us2.make.com/api/v2/organizations/${organizationId}`, {
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      let specificOrgData = null;
      if (specificOrgResponse.ok) {
        specificOrgData = await specificOrgResponse.json();
        console.log('Specific organization data:', specificOrgData);
      }

      // Test team membership (might be required for scenarios access)
      const teamsResponse = await fetch(`https://us2.make.com/api/v2/teams?organizationId=${organizationId}`, {
        headers: {
          'Authorization': `Token ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      let teamsData = null;
      if (teamsResponse.ok) {
        teamsData = await teamsResponse.json();
        console.log('Teams data:', teamsData);
      } else {
        console.log('Failed to get teams:', teamsResponse.status, await teamsResponse.text());
      }

      return NextResponse.json({
        analysis: {
          apiTokenValid: !!apiToken,
          organizationIdProvided: !!organizationId,
          targetOrgId: organizationId,
          userHasAccessToOrganization: hasAccessToOrg,
          organizationExists: specificOrgResponse.ok,
          teamsAccessible: teamsResponse.ok
        },
        results: {
          allOrganizations: {
            status: orgsResponse.status,
            success: orgsResponse.ok,
            count: organizationsData?.length || 0,
            data: organizationsData
          },
          specificOrganization: {
            status: specificOrgResponse.status,
            success: specificOrgResponse.ok,
            data: specificOrgData
          },
          teams: {
            status: teamsResponse.status,
            success: teamsResponse.ok,
            data: teamsData
          }
        },
        recommendations: [
          hasAccessToOrg ? "✅ User has access to the target organization" : "❌ User may not have access to organization " + organizationId,
          specificOrgResponse.ok ? "✅ Organization endpoint accessible" : "❌ Cannot access organization details",
          teamsResponse.ok ? "✅ Teams endpoint accessible" : "❌ Cannot access teams (might need team membership for scenarios)",
          "If teams access fails, you may need to be added to a team within the organization",
          "Some Make API endpoints require team membership, not just organization access"
        ]
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return NextResponse.json({
        error: 'Permission check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Outer permission check error:', error);
    return NextResponse.json({
      error: 'Permission check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}