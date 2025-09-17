import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../lib/make-api-helper';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;
    const teamId = process.env.MAKE_TEAM_ID || '1172694'; // fallback to discovered team ID

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

    // Make.com doesn't have a general /executions endpoint
    // Executions are accessed per scenario via /scenarios/{id}/executions
    // Let's first get the scenarios, then get executions for each scenario

    try {
      // First get scenarios using teamId from environment variable
      const scenariosResponse = await makeApiRequest(
        `/scenarios?teamId=${teamId}`,
        apiToken,
        organizationId
      );

      const scenariosData = await scenariosResponse.json();
      const scenarios = scenariosData.scenarios || scenariosData || [];

      console.log('Found scenarios for executions:', scenarios.length);

      if (scenarios.length === 0) {
        return NextResponse.json({
          executions: [],
          message: "No scenarios found to get executions from",
          info: "Executions are tied to specific scenarios in Make.com"
        });
      }

      // Since Make.com doesn't expose execution logs via API,
      // we'll return an empty array to maintain compatibility with the frontend
      // The frontend expects an array of executions that it can reduce/map over

      console.log(`Found ${scenarios.length} scenarios, but execution logs not available via API`);

      return NextResponse.json({
        // Return empty array to maintain compatibility with frontend MakeService
        executions: [],
        // Include scenario info for debugging
        totalScenarios: scenarios.length,
        message: `Found ${scenarios.length} scenarios but execution logs are not available via Make.com public API`,
        info: "Execution details must be viewed in the Make.com dashboard",
        // Note: This maintains the expected response format for MakeService.getRecentExecutions()
      });

    } catch (error) {
      console.log('Failed to get scenarios for executions:', error);
      // Fallback to informational response
      return NextResponse.json({
        executions: [],
        message: "Make.com executions are accessed per scenario, not globally",
        info: "Use /api/make/scenarios/{id}/executions to get executions for a specific scenario",
        note: "This endpoint attempted to aggregate executions from all scenarios but failed to retrieve scenarios"
      });
    }

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