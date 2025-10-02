import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userIds, action } = await request.json();

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate 10% failure rate for testing rollback
  if (Math.random() < 0.1) {
    return NextResponse.json(
      { error: 'Failed to update records. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    updated: userIds.length,
    message: `Successfully marked ${userIds.length} rows as ${action}`
  });
}
