import { NextRequest, NextResponse } from 'next/server';
import { generateMockData, filterData, sortData } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');
  const sortBy = searchParams.get('sortBy') || 'timestamp';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');
  const device = searchParams.get('device');
  const status = searchParams.get('status');

  // Get all data
  const allData = generateMockData(50000);

  // Apply filters
  const filters: any = {};
  if (dateStart && dateEnd) {
    filters.dateRange = { start: dateStart, end: dateEnd };
  }
  if (device) filters.device = device;
  if (status) filters.status = status;

  let filtered = filterData(allData, filters);

  // Apply sorting
  filtered = sortData(filtered, sortBy as any, sortOrder);

  // Paginate
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  const response = NextResponse.json({
    data: paginatedData,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  });

  // Next.js caching and revalidation
  response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  // Optionally, you can use revalidate tag for ISR (if using app router and static generation)
  // response.headers.set('x-nextjs-revalidate', '60');

  return response;
}
