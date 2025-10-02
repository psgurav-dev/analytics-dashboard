import { NextRequest, NextResponse } from 'next/server';
import { generateMockData, filterData, sortData } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  const { filters, sortBy, sortOrder, selectedIds } = await request.json();

  let data = generateMockData(50000);

  // Apply filters if provided
  if (filters) {
    data = filterData(data, filters);
  }

  // If specific rows selected, filter to those
  if (selectedIds && selectedIds.length > 0) {
    data = data.filter((row) => selectedIds.includes(row.user_id));
  }

  // Apply sorting
  if (sortBy) {
    data = sortData(data, sortBy, sortOrder || 'desc');
  }

  // Convert to CSV
  const headers = ['user_id', 'page', 'timestamp', 'device', 'status'];
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const value = row[h as keyof typeof row];
        // Escape commas and quotes
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ];

  const csv = csvRows.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-export-${Date.now()}.csv"`
    }
  });
}
