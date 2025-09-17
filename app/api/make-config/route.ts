import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiToken = process.env.MAKE_API_TOKEN;
    const organizationId = process.env.MAKE_ORGANIZATION_ID;

    if (!apiToken || !organizationId) {
      return NextResponse.json(
        { error: 'Make.com credentials not configured' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      apiToken,
      organizationId
    });
  } catch (error) {
    console.error('Error getting Make config:', error);
    return NextResponse.json(
      { error: 'Failed to get Make configuration' },
      { status: 500 }
    );
  }
}