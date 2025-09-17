import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    if (!apiToken || !organizationId) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    console.log('=== Testing Different Authentication Methods ===');

    const testMethods: Array<{ name: string; headers: Record<string, string> }> = [
      {
        name: 'Standard Token Header',
        headers: { 'Authorization': `Token ${apiToken}`, 'Content-Type': 'application/json' }
      },
      {
        name: 'Bearer Token Header',
        headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' }
      },
      {
        name: 'X-API-Key Header',
        headers: { 'X-API-Key': apiToken, 'Content-Type': 'application/json' }
      },
      {
        name: 'Token Only Header',
        headers: { 'Authorization': apiToken, 'Content-Type': 'application/json' }
      }
    ];

    const results: any[] = [];

    for (const method of testMethods) {
      try {
        // Test with corrected scenarios endpoint structure
        const testUrl = `https://us2.make.com/api/v2/scenarios?organizationId=${organizationId}`;
        console.log(`Testing ${method.name} with: ${testUrl}`);

        const response = await fetch(testUrl, {
          method: 'GET',
          headers: method.headers,
        });

        const responseText = await response.text();

        results.push({
          method: method.name,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          response: responseText.substring(0, 200),
          headers: method.headers
        });

        console.log(`${method.name} - Status: ${response.status}`);

        if (response.ok) {
          console.log(`✅ SUCCESS with ${method.name}!`);
          break; // Found working method
        }
      } catch (error) {
        results.push({
          method: method.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        });
      }
    }

    // Also test the basic organization endpoint to confirm it works
    try {
      const orgResponse = await fetch(`https://us2.make.com/api/v2/organizations/${organizationId}`, {
        headers: { 'Authorization': `Token ${apiToken}`, 'Content-Type': 'application/json' }
      });

      results.push({
        method: 'Organization Endpoint (Control)',
        status: orgResponse.status,
        success: orgResponse.ok,
        note: 'This should work based on build logs'
      });
    } catch (error) {
      results.push({
        method: 'Organization Endpoint (Control)',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    }

    return NextResponse.json({
      success: results.some(r => r.success),
      results,
      analysis: {
        tokenLength: apiToken.length,
        tokenPrefix: apiToken.substring(0, 10),
        organizationId,
        recommendedAction: results.some(r => r.success)
          ? 'Found working authentication method!'
          : 'All authentication methods failed - may need to check token permissions in Make.com'
      }
    });

  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}