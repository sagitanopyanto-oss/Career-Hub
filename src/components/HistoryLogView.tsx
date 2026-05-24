import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  RefreshCw, 
  Filter 
} from 'lucide-react';
import { HistoryLog } from '../data/mockData';

interface HistoryLogViewProps {
  logs: HistoryLog[];
  onClearLogs: () => void;
  canDelete?: boolean;
}

export const HistoryLogView: React.FC<HistoryLogViewProps> = ({ logs, onClearLogs, canDelete = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterMenu, setFilterMenu] = useState('All');

  // Filter logs
  const filteredLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter(log => {
      const matchesSearch = log.itemAffected.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.user.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'All' || log.action === filterAction;
      const matchesMenu = filterMenu === 'All' || log.menu === filterMenu;
      
      return matchesSearch && matchesAction && matchesMenu;
    });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-700 border border-green-100">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100">DELETE</span>;
      case 'AUTO-SCREENING':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100">AUTO ATS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" /> Audit History Logs
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">Rekaman komprehensif setiap perubahan data transaksi pada sistem CareerHub.</p>
        </div>
        {canDelete && (
          <button
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin menghapus semua catatan audit log? Tindakan ini tidak dapat dibatalkan.")) {
                onClearLogs();
              }
            }}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2.5 rounded-xl border border-rose-100 text-xs transition-all self-start lg:self-auto whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" /> Bersihkan Audit Logs
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari logs (keterangan, user, target)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
          />
        </div>

        {/* Action Type */}
        <div className="relative flex items-center">
          <Filter className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">Semua Aksi</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="AUTO-SCREENING">AUTO ATS</option>
          </select>
        </div>

        {/* Menu category */}
        <div className="relative flex items-center">
          <RefreshCw className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={filterMenu}
            onChange={(e) => setFilterMenu(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">Semua Menu</option>
            <option value="Kandidat">Kandidat</option>
            <option value="Portal Lowongan">Portal Lowongan</option>
            <option value="Schedule Interview">Schedule Interview</option>
            <option value="Setting">Setting</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[920px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <th className="p-4">ID Log</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Pengguna (User)</th>
                <th className="p-4">Aksi</th>
                <th className="p-4">Menu</th>
                <th className="p-4">Item Terdampak (Affected)</th>
                <th className="p-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">{log.id}</td>
                    <td className="p-4 font-semibold text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-4 font-bold text-slate-800">{log.user}</td>
                    <td className="p-4">{getActionBadge(log.action)}</td>
                    <td className="p-4 font-semibold text-slate-600">{log.menu}</td>
                    <td className="p-4 font-semibold text-slate-700 truncate max-w-[200px]" title={log.itemAffected}>
                      {log.itemAffected}
                    </td>
                    <td className="p-4 text-slate-500 leading-relaxed font-medium">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada logs perubahan yang sesuai dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
