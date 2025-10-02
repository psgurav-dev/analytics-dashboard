// lib/mockData.ts
export interface TableRow {
  user_id: string;
  page: string;
  timestamp: string;
  device: 'Web' | 'iOS' | 'Android';
  status: 'active' | 'idle' | 'reviewed';
}

export interface AnalyticsData {
  dau: number;
  mau: number;
  totalUsers: number;
  activeSessions: number;
  avgSessionDuration: string;
  bounceRate: string;
  chartData: Array<{ date: string; value: number }>;
}

// Generate deterministic data for consistency
const PAGES = [
  '/home', '/dashboard', '/profile', '/settings', '/products',
  '/checkout', '/cart', '/search', '/about', '/contact',
  '/blog', '/docs', '/pricing', '/features', '/help'
];

const DEVICES: Array<'Web' | 'iOS' | 'Android'> = ['Web', 'iOS', 'Android'];
const STATUSES: Array<'active' | 'idle' | 'reviewed'> = ['active', 'idle', 'reviewed'];

// Seeded random for consistency
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

let cachedData: TableRow[] | null = null;

export function generateMockData(count: number = 50000): TableRow[] {
  if (cachedData && cachedData.length === count) {
    return cachedData;
  }

  console.log(`Generating ${count} mock rows...`);
  const data: TableRow[] = [];
  const rng = new SeededRandom(12345);
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(
      thirtyDaysAgo + rng.next() * (now - thirtyDaysAgo)
    ).toISOString();

    data.push({
      user_id: `user_${String(i + 1000).padStart(6, '0')}`,
      page: PAGES[Math.floor(rng.next() * PAGES.length)],
      timestamp,
      device: DEVICES[Math.floor(rng.next() * DEVICES.length)],
      status: STATUSES[Math.floor(rng.next() * STATUSES.length)]
    });
  }

  cachedData = data;
  console.log(`Generated ${count} rows`);
  return data;
}

export function filterData(
  data: TableRow[],
  filters: {
    dateRange?: { start: string; end: string };
    device?: string;
    status?: string;
  }
): TableRow[] {
  return data.filter((row) => {
    if (filters.dateRange) {
      const rowDate = new Date(row.timestamp).getTime();
      const start = new Date(filters.dateRange.start).getTime();
      const end = new Date(filters.dateRange.end).getTime();
      if (rowDate < start || rowDate > end) return false;
    }

    if (filters.device && filters.device !== 'All' && row.device !== filters.device) {
      return false;
    }

    if (filters.status && filters.status !== 'all' && row.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export function sortData(
  data: TableRow[],
  sortBy: keyof TableRow,
  sortOrder: 'asc' | 'desc'
): TableRow[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (sortBy === 'timestamp') {
      const aTime = new Date(aVal as string).getTime();
      const bTime = new Date(bVal as string).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

export function calculateAnalytics(
  data: TableRow[],
  filters: {
    dateRange?: { start: string; end: string };
    platform?: string;
  }
): AnalyticsData {
  let filtered = data;

  // Apply filters
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start).getTime();
    const end = new Date(filters.dateRange.end).getTime();
    filtered = filtered.filter((row) => {
      const rowTime = new Date(row.timestamp).getTime();
      return rowTime >= start && rowTime <= end;
    });
  }

  if (filters.platform && filters.platform !== 'All') {
    filtered = filtered.filter((row) => row.device === filters.platform);
  }

  // Calculate metrics
  const uniqueUsers = new Set(filtered.map((r) => r.user_id)).size;
  const activeSessions = filtered.filter((r) => r.status === 'active').length;

  // DAU calculation (unique users per day, average)
  const usersByDay = new Map<string, Set<string>>();
  filtered.forEach((row) => {
    const day = row.timestamp.split('T')[0];
    if (!usersByDay.has(day)) {
      usersByDay.set(day, new Set());
    }
    usersByDay.get(day)!.add(row.user_id);
  });

  const dau = Math.round(
    Array.from(usersByDay.values()).reduce((sum, users) => sum + users.size, 0) /
      (usersByDay.size || 1)
  );

  // Chart data (last 30 days)
  const chartData = Array.from(usersByDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, users]) => ({
      date,
      value: users.size
    }));

  return {
    dau,
    mau: uniqueUsers,
    totalUsers: uniqueUsers,
    activeSessions,
    avgSessionDuration: '4m 32s',
    bounceRate: '42.5%',
    chartData
  };
}