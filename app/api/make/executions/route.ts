import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    if (!apiToken || !organizationId) {
      return NextResponse.json(
        { error: 'Make.com credentials not configured' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const response = await fetch(`https://api.make.com/v2/organizations/${organizationId}/executions?limit=${limit}`, {
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Make API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const executions = await response.json();
    return NextResponse.json(executions);

  } catch (error) {
    console.error('Error fetching Make executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}