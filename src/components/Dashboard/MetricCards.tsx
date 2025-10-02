'use client';

import { Users, Activity, Clock, TrendingUp } from 'lucide-react';
import { AnalyticsData } from '@/lib/mockData';

interface MetricCardsProps {
  data: AnalyticsData;
  loading?: boolean;
}

export function MetricCards({ data, loading }: MetricCardsProps) {
  const metrics = [
    {
      label: 'Daily Active Users',
      value: data.dau.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Monthly Active Users',
      value: data.mau.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      label: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      label: 'Active Sessions',
      value: data.activeSessions.toLocaleString(),
      icon: Activity,
      color: 'bg-orange-500'
    },
    {
      label: 'Avg Session Duration',
      value: data.avgSessionDuration,
      icon: Clock,
      color: 'bg-pink-500'
    },
    {
      label: 'Bounce Rate',
      value: data.bounceRate,
      icon: TrendingUp,
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            role="region"
            aria-label={`${metric.label}: ${metric.value}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`${metric.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
