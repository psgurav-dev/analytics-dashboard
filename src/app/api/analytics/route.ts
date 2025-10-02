import { NextRequest, NextResponse } from 'next/server';
import { generateMockData, calculateAnalytics } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');
  const platform = searchParams.get('platform') || 'All';

  const allData = generateMockData(50000);
  
  const filters: any = { platform };
  if (dateStart && dateEnd) {
    filters.dateRange = { start: dateStart, end: dateEnd };
  }

  const analytics = calculateAnalytics(allData, filters);

  return NextResponse.json(analytics);

}
