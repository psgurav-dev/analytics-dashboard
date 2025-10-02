'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsData } from '@/lib/mockData';

interface ChartProps {
  data: AnalyticsData;
  loading?: boolean;
}

export function Chart({ data, loading }: ChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Daily Active Users Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data.chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number) => [value, 'Users']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            aria-label="Daily active users over time"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
