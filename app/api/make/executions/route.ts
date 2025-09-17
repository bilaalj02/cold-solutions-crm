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

      // Return scenario information instead of trying to fetch executions
      // as the /scenarios/{id}/executions endpoint appears to not exist in Make API
      const scenarioSummary = scenarios.map((scenario: any) => ({
        scenarioId: scenario.id,
        scenarioName: scenario.name || 'Unnamed Scenario',
        status: scenario.scheduling?.type || 'unknown',
        lastRun: scenario.lastExecution || null,
        isActive: scenario.scheduling?.type !== 'indefinitely',
        note: 'Individual execution logs not available via API'
      }));

      return NextResponse.json({
        success: true,
        totalScenarios: scenarios.length,
        scenarios: scenarioSummary,
        message: `Successfully found ${scenarios.length} scenarios in your team`,
        info: "Make.com doesn't expose individual execution logs via public API",
        suggestion: "View execution details in the Make.com dashboard at make.com"
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