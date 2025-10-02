// components/DataTable/VirtualizedTable.tsx
'use client';

import { useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { TableRow as TableRowData } from '@/lib/mockData';
import { ChevronUp, ChevronDown, Download, CheckSquare, Filter, Smartphone, Activity } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface VirtualizedTableProps {
  data: TableRowData[];
  total: number;
  loading: boolean;
  onSort: (column: keyof TableRowData) => void;
  sortBy: keyof TableRowData;
  sortOrder: 'asc' | 'desc';
  onBulkAction: (userIds: string[]) => Promise<void>;
  onExport: (selectedIds: string[]) => void;
}

export function VirtualizedTable({
  data,
  total,
  loading,
  onSort,
  sortBy,
  sortOrder,
  onBulkAction,
  onExport
}: VirtualizedTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TableRowData | null>(null);

  const columns: Array<{ key: keyof TableRowData; label: string; width: string; icon?: any }> = [
    { key: 'user_id', label: 'User ID', width: 'sm:flex-[1.2] flex-[2]', icon: Activity },
    { key: 'page', label: 'Page', width: 'sm:flex-[1.5] flex-[3]' },
    { key: 'timestamp', label: 'Timestamp', width: 'sm:flex-[1.8] flex-[3]' },
    { key: 'device', label: 'Device', width: 'sm:flex-1 flex-[2]', icon: Smartphone },
    { key: 'status', label: 'Status', width: 'sm:flex-1 flex-[2]' }
  ];

  const toggleRow = useCallback((userId: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedRows.size === data.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(data.map(row => row.user_id)));
  }, [data, selectedRows.size]);

  const handleBulkAction = async () => {
    if (!selectedRows.size) return;
    setIsProcessing(true);
    const selectedIds = Array.from(selectedRows);
    try {
      await onBulkAction(selectedIds);
      setSelectedRows(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => onExport(Array.from(selectedRows));

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = data[index];
    const isSelected = selectedRows.has(row.user_id);

    const getDeviceColor = (device: string) => ({
      Web: 'bg-blue-100 text-blue-700 border-blue-200',
      iOS: 'bg-gray-100 text-gray-700 border-gray-200',
      Android: 'bg-green-100 text-green-700 border-green-200'
    }[device] || 'bg-gray-100 text-gray-700 border-gray-200');

    const getStatusColor = (status: string) => ({
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      idle: 'bg-amber-100 text-amber-700 border-amber-200',
      reviewed: 'bg-slate-100 text-slate-700 border-slate-200'
    }[status] || 'bg-gray-100 text-gray-700 border-gray-200');

    return (
      <div
        style={style}
        className={`flex items-center px-2 sm:px-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 ${isSelected ? 'bg-gradient-to-r from-blue-50 to-transparent border-l-4 border-l-blue-500' : ''}`}
        role="row"
        aria-selected={isSelected}
        onClick={e => {
          if ((e.target as HTMLElement).closest("input[type='checkbox']")) return;
          setSelectedUser(row);
          setDrawerOpen(true);
        }}
      >
        <div className="w-10 flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleRow(row.user_id)}
            className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
          />
        </div>

        <div className="sm:flex-[1.2] flex-[2] px-2 sm:px-4 py-2">
          <span className="text-sm font-mono font-semibold text-gray-900">{row.user_id}</span>
        </div>

        <div className="sm:flex-[1.5] flex-[3] px-2 sm:px-4 py-2">
          <span className="text-sm text-gray-700 font-medium truncate block">{row.page}</span>
        </div>

        <div className="sm:flex-[1.8] flex-[3] px-2 sm:px-4 py-2">
          <span className="text-sm text-gray-600">
            {new Date(row.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="sm:flex-1 flex-[2] px-2 sm:px-4 py-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full border ${getDeviceColor(row.device)}`}>{row.device}</span>
        </div>

        <div className="sm:flex-1 flex-[2] px-2 sm:px-4 py-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(row.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'active' ? 'bg-emerald-500 animate-pulse' : row.status === 'idle' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
            {row.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
      <AnimatePresence>
        {drawerOpen && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ x: { type: 'spring', stiffness: 400, damping: 40 }, opacity: { duration: 0.2 } }}
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 overflow-y-auto p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg font-bold text-gray-900">User Details</h3>
                <button onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
              </div>
              <div className="space-y-2 sm:space-y-4 text-sm">
                <p><span className="font-semibold">User ID:</span> {selectedUser.user_id}</p>
                <p><span className="font-semibold">Page:</span> {selectedUser.page}</p>
                <p><span className="font-semibold">Timestamp:</span> {new Date(selectedUser.timestamp).toLocaleString()}</p>
                <p><span className="font-semibold">Device:</span> {selectedUser.device}</p>
                <p><span className="font-semibold">Status:</span> {selectedUser.status}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Table Header & Bulk Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-3 sm:p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Data Table</h2>
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{data.length.toLocaleString()}</span> of{' '}
            <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> rows
          </p>
        </div>
        {selectedRows.size > 0 ? (
          <div className="flex gap-2">
            <button
              onClick={handleBulkAction}
              disabled={isProcessing}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckSquare className="w-4 h-4" />
              Mark Reviewed
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Selected
            </button>
          </div>
        ) : (
          <button
            onClick={() => onExport([])}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm sm:text-sm font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1 sm:gap-2"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        )}
      </div>

      {/* Table Column Header Row */}
      <div className="flex items-center px-2 sm:px-4 bg-gray-50 border-b border-gray-200" role="row">
        <div className="w-10 flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedRows.size === data.length && data.length > 0}
            onChange={toggleAll}
            className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer transition-all"
            aria-label="Select all rows"
          />
        </div>
        {columns.map(col => (
          <div key={col.key} className={`${col.width} px-2 sm:px-4 py-3 font-semibold text-gray-700 flex items-center gap-1 cursor-pointer select-none`} onClick={() => onSort(col.key)} role="columnheader">
            {col.icon && <span className="text-gray-400"><col.icon className="w-4 h-4" /></span>}
            <span>{col.label}</span>
            {sortBy === col.key && (
              sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />
            )}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div role="rowgroup" className="min-w-[700px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="mt-4 text-gray-600 font-medium">Loading data...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No data found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <List height={600} itemCount={data.length} itemSize={60} width="100%" overscanCount={10}>
              {Row}
            </List>
          )}
        </div>
      </div>
    </div>
  );
}
