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

    // Make.com doesn't have a general /executions endpoint
    // Executions are accessed per scenario via /scenarios/{id}/executions
    // Let's first get the scenarios, then get executions for each scenario

    try {
      // First get scenarios using teamId (confirmed working with your team ID: 1172694)
      const scenariosResponse = await makeApiRequest(
        `/scenarios?teamId=1172694`,
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

      // Get executions from the first few scenarios (limit to avoid too many API calls)
      const executionsPromises = scenarios.slice(0, 3).map(async (scenario: any) => {
        try {
          const execResponse = await makeApiRequest(
            `/scenarios/${scenario.id}/executions?limit=5`,
            apiToken,
            organizationId
          );
          const execData = await execResponse.json();
          return {
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            executions: execData.executions || execData || []
          };
        } catch (error) {
          console.log(`Failed to get executions for scenario ${scenario.id}:`, error);
          return {
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            executions: [],
            error: 'Failed to fetch executions for this scenario'
          };
        }
      });

      const allExecutions = await Promise.all(executionsPromises);

      return NextResponse.json({
        executions: allExecutions,
        totalScenarios: scenarios.length,
        message: "Executions retrieved from active scenarios"
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