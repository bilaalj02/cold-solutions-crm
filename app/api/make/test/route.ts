import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    console.log('=== Make API Diagnostic Test ===');
    console.log('API Token length:', apiToken?.length || 0);
    console.log('API Token prefix:', apiToken?.substring(0, 10) || 'none');
    console.log('Organization ID:', organizationId || 'none');
    console.log('Environment variables containing MAKE:',
      Object.keys(process.env).filter(key => key.includes('MAKE')));

    if (!apiToken || !organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials',
        debug: {
          hasApiToken: !!apiToken,
          hasOrgId: !!organizationId,
          tokenLength: apiToken?.length || 0,
          orgId: organizationId || 'missing'
        }
      });
    }

    // Test multiple endpoints in us2 region specifically, starting with basic connectivity
    const testEndpoints = [
      { name: 'API Ping', path: `/ping`, description: 'Basic connectivity test' },
      { name: 'API Info', path: `/info`, description: 'General API information' },
      { name: 'Organization Info', path: `/organizations/${organizationId}`, description: 'Organization details (known working)' },
      { name: 'Organizations List', path: `/organizations`, description: 'All accessible organizations' },
      { name: 'Scenarios List (TEAM)', path: `/scenarios?teamId=1172694`, description: 'Organization scenarios (using teamId)' },
      { name: 'Scenarios List (ORG)', path: `/scenarios?organizationId=${organizationId}`, description: 'Organization scenarios (using organizationId)' },
      { name: 'Executions List (TEAM)', path: `/executions?teamId=1172694&limit=5`, description: 'Recent executions (using teamId)' },
      { name: 'Executions List (ORG)', path: `/executions?organizationId=${organizationId}&limit=5`, description: 'Recent executions (using organizationId)' },
      { name: 'Teams List', path: `/teams?organizationId=${organizationId}`, description: 'Organization teams' },
    ];

    const testResults: any[] = [];

    // Focus on us2 region since we know that's where the org exists
    const region = 'us2';

    for (const endpoint of testEndpoints) {
      try {
        const testUrl = `https://${region}.make.com/api/v2${endpoint.path}`;
        console.log(`Testing ${endpoint.name}: ${testUrl}`);

        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${apiToken}`,
            'Content-Type': 'application/json',
          },
        });

        const responseText = await response.text();
        let parsedResponse;

        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = responseText;
        }

        testResults.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          description: endpoint.description,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          response: response.ok ? parsedResponse : responseText.substring(0, 300),
          headers: Object.fromEntries(response.headers.entries()),
          url: testUrl
        });

        console.log(`${endpoint.name} result:`, {
          status: response.status,
          statusText: response.statusText,
          success: response.ok
        });

      } catch (error) {
        testResults.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
        console.log(`${endpoint.name} error:`, error);
      }
    }

    return NextResponse.json({
      success: testResults.some(r => r.success),
      apiToken: apiToken ? `${apiToken.substring(0, 8)}...` : 'missing',
      organizationId,
      testResults,
      recommendations: [
        "1. Check if scenarios endpoint needs different permissions than organization endpoint",
        "2. Verify your API token has been saved correctly in environment variables",
        "3. Try regenerating the API token with the same scopes",
        "4. Check if there are any IP restrictions on the API token",
        "5. Verify the organization ID is exactly correct (current: " + organizationId + ")",
        "6. Check if the token needs to be activated or confirmed in Make.com",
        "7. Test the API token directly in Make.com's API documentation",
        "8. Contact Make.com support if all scopes are selected but still getting 401"
      ],
      debug: {
        tokenFormat: apiToken ? `${apiToken.length} chars, starts with: ${apiToken.substring(0, 10)}` : 'missing',
        orgIdFormat: `${organizationId?.length || 0} chars: ${organizationId}`,
        workingEndpoints: testResults.filter(r => r.success).map(r => r.endpoint),
        failingEndpoints: testResults.filter(r => !r.success).map(r => ({ endpoint: r.endpoint, status: r.status, error: r.response }))
      }
    });

  } catch (error) {
    console.error('Diagnostic test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Diagnostic test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}