import { NextResponse } from 'next/server';
import { makeApiRequest } from '../../../../lib/make-api-helper';

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

    // Note: Make.com doesn't have a direct API endpoint to list webhooks
    // Webhooks are created within scenarios and have dynamic URLs
    // This endpoint returns an informational message instead
    return NextResponse.json({
      message: "Make.com webhooks are created within scenarios and don't have a dedicated list endpoint",
      info: "Webhooks are managed through the scenario interface in Make.com",
      webhooks: [],
      note: "This is expected behavior - Make.com generates webhook URLs dynamically"
    });

  } catch (error) {
    console.error('Error fetching Make webhooks:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch webhooks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}