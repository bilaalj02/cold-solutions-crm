import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN || process.env.MAKE_API_KEY;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    if (!apiToken || !organizationId) {
      return NextResponse.json(
        { error: 'Make.com credentials not configured' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.make.com/v2/organizations/${organizationId}`, {
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

    const organization = await response.json();
    return NextResponse.json(organization);

  } catch (error) {
    console.error('Error fetching Make organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}