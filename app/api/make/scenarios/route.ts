import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../lib/make-api-helper';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;
    const teamId = process.env.MAKE_TEAM_ID || '1172694'; // fallback to discovered team ID

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

    // Try with teamId first, then fallback to organizationId
    let response;
    try {
      // First try with teamId from environment variable
      response = await makeApiRequest(
        `/scenarios?teamId=${teamId}`,
        apiToken,
        organizationId
      );
    } catch (error) {
      console.log('TeamId approach failed, trying organizationId approach...');
      // Fallback to organizationId approach
      response = await makeApiRequest(
        `/scenarios?organizationId=${organizationId}`,
        apiToken,
        organizationId
      );
    }

    const data = await response.json();
    const scenarios = data.scenarios || data || [];

    console.log('Successfully fetched scenarios:', scenarios.length);

    // Transform the data to match the expected MakeScenario interface
    const transformedScenarios = scenarios.map((scenario: any) => ({
      id: scenario.id?.toString() || '',
      name: scenario.name || 'Unnamed Scenario',
      description: scenario.description || '',
      status: scenario.is_enabled ? 'active' : 'inactive',
      folder: scenario.folder ? {
        id: scenario.folder.id?.toString() || '',
        name: scenario.folder.name || 'Unnamed Folder'
      } : undefined,
      scheduling: {
        type: scenario.is_enabled ? 'indefinitely' : 'once',
        interval: scenario.scheduling?.interval || undefined,
        intervalType: scenario.scheduling?.intervalType || undefined
      },
      lastRun: scenario.last_execution_time || undefined,
      nextRun: scenario.next_execution_time || undefined,
      stats: {
        totalRuns: scenario.execution_count || 0,
        successfulRuns: scenario.execution_count || 0,
        failedRuns: 0,
        incompleteRuns: 0,
        averageExecutionTime: scenario.average_execution_time || undefined
      },
      createdAt: scenario.created_at || new Date().toISOString(),
      updatedAt: scenario.updated_at || new Date().toISOString(),
      blueprint: scenario.blueprint || undefined
    }));

    return NextResponse.json({
      scenarios: transformedScenarios,
      totalStats: {
        totalScenarios: transformedScenarios.length,
        activeScenarios: transformedScenarios.filter((s: any) => s.status === 'active').length,
        totalRuns: transformedScenarios.reduce((sum: number, s: any) => sum + s.stats.totalRuns, 0),
        successfulRuns: transformedScenarios.reduce((sum: number, s: any) => sum + s.stats.successfulRuns, 0),
        failedRuns: transformedScenarios.reduce((sum: number, s: any) => sum + s.stats.failedRuns, 0),
        averageSuccessRate: transformedScenarios.length > 0 ?
          (transformedScenarios.reduce((sum: number, s: any) => sum + s.stats.successfulRuns, 0) /
           Math.max(transformedScenarios.reduce((sum: number, s: any) => sum + s.stats.totalRuns, 0), 1)) * 100 : 100
      }
    });

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