"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { MetricCards } from "@/components/Dashboard/MetricCards";
import { Chart } from "@/components/Dashboard/Chart";
import { Filters, FilterState } from "@/components/Dashboard/Filters";
import { VirtualizedTable } from "@/components/DataTable/VirtualizedTable";
import { TableRow, AnalyticsData } from "@/lib/mockData";
import { BarChart3, CheckCircle, AlertCircle, Menu, X } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);
  if (!user) return null;

  
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    platform: "All",
  });

  const [tableFilters, setTableFilters] = useState({
    device: "All",
    status: "all",
  });

  const [sortBy, setSortBy] = useState<keyof TableRow>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [tableData, setTableData] = useState<{
    data: TableRow[];
    total: number;
    totalPages?: number;
  }>({ data: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          dateStart: filters.dateRange.start,
          dateEnd: filters.dateRange.end,
          platform: filters.platform
        });

        const res = await fetch(`/api/analytics?${params}`);
        const data = await res.json();
        setAnalyticsData(data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filters]);

  // Fetch table data
  useEffect(() => {
    const fetchTableData = async () => {
      setTableLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: rowsPerPage.toString(),
          sortBy,
          sortOrder,
          dateStart: filters.dateRange.start,
          dateEnd: filters.dateRange.end,
          device: tableFilters.device,
          status: tableFilters.status
        });

        const res = await fetch(`/api/table-data?${params}`);
        const data = await res.json();
        setTableData(data);
      } catch (err) {
        setError('Failed to load table data');
        console.error(err);
      } finally {
        setTableLoading(false);
      }
    };

    fetchTableData();
  }, [filters, tableFilters, sortBy, sortOrder, page, rowsPerPage]);

  const handleSort = useCallback((column: keyof TableRow) => {
    setSortBy((prev) => {
      if (prev === column) {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortOrder('desc');
      }
      return column;
    });
    setPage(1);
  }, []);

  const handleBulkAction = async (userIds: string[]) => {
    const originalData = { ...tableData };

    setTableData((prev) => ({
      ...prev,
      data: prev.data.map((row) =>
        userIds.includes(row.user_id)
          ? { ...row, status: 'reviewed' as const }
          : row
      )
    }));

    try {
      const res = await fetch('/api/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, action: 'reviewed' })
      });

      if (!res.ok) {
        throw new Error('Failed to update records');
      }

      const result = await res.json();
      showNotification('success', result.message);
    } catch (err) {
      setTableData(originalData);
      showNotification('error', 'Failed to update records. Please try again.');
      throw err;
    }
  };

  const handleExport = async (selectedIds: string[]) => {
    try {
      const res = await fetch('/api/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            dateRange: filters.dateRange,
            device: tableFilters.device === 'All' ? undefined : tableFilters.device,
            status: tableFilters.status === 'all' ? undefined : tableFilters.status
          },
          sortBy,
          sortOrder,
          selectedIds: selectedIds.length > 0 ? selectedIds : undefined
        })
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('success', `Exported ${selectedIds.length || tableData.total} rows`);
    } catch (err) {
      showNotification('error', 'Failed to export data');
    }
  };

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  if (error && !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-lg border-2 transform transition-all duration-300 animate-slide-in ${notification.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400'
              : 'bg-red-500/95 text-white border-red-400'
            }`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">
                  Real-time insights and data visualization
                </p>
              </div>
            </div>
            {/* Logout Button */}
            {user && (
              <button
                className="ml-4 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition-colors"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col gap-4 mt-16">
              <a href="#" className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors py-2">
                Overview
              </a>
              <a href="#" className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors py-2">
                Reports
              </a>
              <a href="#" className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors py-2">
                Settings
              </a>
            </nav>
          </div>
        </div>
      )}


      <main className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <Filters onFilterChange={setFilters} />
        {analyticsData && (
          <>
            <MetricCards data={analyticsData} loading={loading} />
            <Chart data={analyticsData} loading={loading} />
          </>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Data View</h2>
          <p className="text-gray-600">Explore, filter, and export your analytics data</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-gray-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Table Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="table-device" className="block text-sm font-semibold text-gray-700">
                Device Type
              </label>
              <select
                id="table-device"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 font-medium appearance-none cursor-pointer"
                value={tableFilters.device}
                onChange={(e) => setTableFilters({ ...tableFilters, device: e.target.value })}
              >
                <option value="All">All Devices</option>
                <option value="Web">🌐 Web</option>
                <option value="iOS">📱 iOS</option>
                <option value="Android">🤖 Android</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="table-status" className="block text-sm font-semibold text-gray-700">
                Status Filter
              </label>
              <select
                id="table-status"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 font-medium appearance-none cursor-pointer"
                value={tableFilters.status}
                onChange={(e) => setTableFilters({ ...tableFilters, status: e.target.value })}
              >
                <option value="all">All Status</option>
                <option value="active">✅ Active</option>
                <option value="idle">⏸️ Idle</option>
                <option value="reviewed">👁️ Reviewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-gray-100/50">
          <div style={{ minHeight: 600, position: 'relative' }}>
            <VirtualizedTable
              data={tableData.data}
              total={tableData.total}
              loading={tableLoading}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onBulkAction={handleBulkAction}
              onExport={handleExport}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{tableData.totalPages || 1}</span>
              </span>
              <button
                className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min((tableData.totalPages || 1), p + 1))}
                disabled={page === (tableData.totalPages || 1)}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="rowsPerPage" className="text-sm text-gray-700">Rows per page:</label>
              <select
                id="rowsPerPage"
                className="px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-700"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[25, 50, 100, 250, 500].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-12 bg-white/50 backdrop-blur-lg border-t border-gray-200/50 py-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            © 2025 Analytics Dashboard. Built with Next.js & React.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

