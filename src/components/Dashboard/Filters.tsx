'use client';

import { useState, useEffect } from 'react';

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  dateRange: { start: string; end: string };
  platform: string;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    platform: 'All'
  });

  useEffect(() => {
    // Debounce filter changes
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="date-start"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            id="date-start"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.dateRange.start}
            onChange={(e) =>
              setFilters({
                ...filters,
                dateRange: { ...filters.dateRange, start: e.target.value }
              })
            }
          />
        </div>
        <div>
          <label
            htmlFor="date-end"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            id="date-end"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.dateRange.end}
            onChange={(e) =>
              setFilters({
                ...filters,
                dateRange: { ...filters.dateRange, end: e.target.value }
              })
            }
          />
        </div>
        <div>
          <label
            htmlFor="platform"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Platform
          </label>
          <select
            id="platform"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          >
            <option value="All">All Platforms</option>
            <option value="Web">Web</option>
            <option value="iOS">iOS</option>
            <option value="Android">Android</option>
          </select>
        </div>
      </div>
    </div>
  );
}