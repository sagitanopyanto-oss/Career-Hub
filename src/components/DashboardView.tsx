import React, { useMemo } from 'react';
import {
  Users, Briefcase, CheckCircle2, Clock, TrendingUp, DollarSign,
  Filter, ChevronDown, CalendarDays, ArrowRight, Target
} from 'lucide-react';
import { Candidate, Job, AppSettings } from '../data/mockData';

interface DashboardViewProps {
  candidates: Candidate[];
  jobs: Job[];
  settings: AppSettings;
  filterRange: 'month' | '6months' | 'annual';
  setFilterRange: (range: 'month' | '6months' | 'annual') => void;
  filterYear: number;
  setFilterYear: (year: number) => void;
  filterQuarters: number[];
  setFilterQuarters: (quarters: number[]) => void;
  setActiveMenu: (menu: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  candidates, jobs, settings,
  filterRange, setFilterRange,
  filterYear, setFilterYear,
  filterQuarters, setFilterQuarters,
  setActiveMenu
}) => {

  // --- 1. FILTER LOGIC FOR CANDIDATES & JOBS ---
  const nowDate = new Date();
  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      // Use applied date if hired date is missing
      const dateStr = cand.tanggalHired || cand.tanggalApplied;
      if (!dateStr) return false;

      const date = new Date(dateStr);
      const yearMatch = date.getFullYear() === filterYear;
      
      let rangeMatch = true;
      if (filterRange === 'month') {
        rangeMatch = date.getMonth() === nowDate.getMonth() && date.getFullYear() === nowDate.getFullYear();
      } else if (filterRange === '6months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        rangeMatch = date >= sixMonthsAgo;
      }
      return yearMatch && rangeMatch;
    });
  }, [candidates, filterYear, filterRange]);

  const activeJobsCount = jobs.filter(j => j.status === 'Aktif').length;

  // --- 2. BUDGET & ACTUAL SPENDING CALCULATION ---
  // Extract unique departments for filter dropdown
  const availableDepts = useMemo(() => {
    const depts = new Set(settings.budgetCostHiring.map(b => b.department));
    return Array.from(depts).sort();
  }, [settings.budgetCostHiring]);

  const [filterDept, setFilterDept] = React.useState<string>('All');

  // Calculate Budget & Actual Spending for selected year & dept
  const budgetMetrics = useMemo(() => {
    let totalBudget = 0;
    let totalActual = 0;

    // Get all hired candidates in the selected year (fallback to applied date)
    const hiredInYear = candidates.filter(c => {
      if (c.tahapProses !== 'hired') return false;
      const dateStr = c.tanggalHired || c.tanggalApplied;
      if (!dateStr) return false;
      const year = new Date(dateStr).getFullYear();
      return year === filterYear;
    });

    // Sum budget for selected year & dept
    settings.budgetCostHiring.forEach(item => {
      if (item.year !== filterYear) return;
      if (filterDept !== 'All' && item.department !== filterDept) return;
      totalBudget += item.budget;

      // Sum actual spending for this department in this year
      const deptActual = hiredInYear
        .filter(c => 
          c.posisiDilamar.toLowerCase().includes(item.department.toLowerCase()) ||
          item.department.toLowerCase().includes(c.posisiDilamar.toLowerCase())
        )
        .reduce((sum, c) => sum + (c.expectedSalary || 0), 0);
      
      totalActual += deptActual;
    });

    const remaining = totalBudget - totalActual;
    const utilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

    return { totalBudget, totalActual, remaining, utilization };
  }, [settings.budgetCostHiring, candidates, filterYear, filterDept]);

  // Prepare chart data (always show at least one row)
  const chartData = useMemo(() => {
    if (filterDept === 'All') {
      return [{
        name: `Total ${filterYear}`,
        Budget: budgetMetrics.totalBudget,
        Actual: budgetMetrics.totalActual,
      }];
    } else {
      const deptBudget = settings.budgetCostHiring.find(b => b.department === filterDept && b.year === filterYear);
      const budgetVal = deptBudget ? deptBudget.budget : 0;
      
      const deptActual = candidates
        .filter(c => c.tahapProses === 'hired')
        .filter(c => {
          const dateStr = c.tanggalHired || c.tanggalApplied;
          return dateStr && new Date(dateStr).getFullYear() === filterYear;
        })
        .filter(c => 
          c.posisiDilamar.toLowerCase().includes(filterDept.toLowerCase()) ||
          filterDept.toLowerCase().includes(c.posisiDilamar.toLowerCase())
        )
        .reduce((sum, c) => sum + (c.expectedSalary || 0), 0);

      return [{
        name: filterDept,
        Budget: budgetVal,
        Actual: deptActual,
      }];
    }
  }, [filterDept, filterYear, budgetMetrics, settings.budgetCostHiring, candidates]);

  // Helper for formatting currency
  const formatRupiah = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Helper for percentage display
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Dashboard Analitik Rekrutmen</h2>
          <p className="text-xs text-slate-500">Overview performa hiring, budget, dan pipeline kandidat.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
              {filterYear}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Range Filter */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['month', '6months', 'annual'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRange(r)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                  filterRange === r ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {r === 'month' ? 'Bulan Ini' : r === '6months' ? '6 Bulan' : 'Tahunan'}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <div className="relative">
             <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700">
               <Filter className="w-3.5 h-3.5" />
               <span>{filterDept === 'All' ? 'Semua Dept' : filterDept}</span>
               <ChevronDown className="w-3 h-3 text-indigo-400" />
             </div>
             <select 
               value={filterDept}
               onChange={(e) => setFilterDept(e.target.value)}
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
             >
               <option value="All">Semua Departemen</option>
               {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hired */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Hired ({filterYear})</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{filteredCandidates.length}</h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Kandidat Baru
            </p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lowongan Aktif</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{activeJobsCount}</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Posisi Terbuka</p>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Utilisasi Budget</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{formatPercent(budgetMetrics.utilization)}</h3>
            <p className={`text-[10px] font-semibold mt-1 ${budgetMetrics.utilization > 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {budgetMetrics.utilization > 90 ? 'Hampir Habis' : 'Masih Aman'}
            </p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sisa Budget</p>
            <h3 className="text-xl font-black text-slate-800 mt-1 truncate">{formatRupiah(budgetMetrics.remaining)}</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Dari Total {formatRupiah(budgetMetrics.totalBudget)}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Budget vs Actual */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Analisa Cost Hiring: Budget vs Actual</h3>
              <p className="text-[10px] text-slate-400">Perbandingan alokasi budget dengan realisasi pengeluaran gaji kandidat hired.</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full flex flex-col">
            {/* Y-Axis Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-2 px-2">
              <span>{formatRupiah(Math.max(budgetMetrics.totalBudget, budgetMetrics.totalActual))}</span>
              <span>{formatRupiah(Math.max(budgetMetrics.totalBudget, budgetMetrics.totalActual) / 2)}</span>
              <span>Rp 0</span>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex items-end justify-center gap-8 border-l border-b border-slate-200 pl-4 pb-0 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-dashed border-slate-100 w-full h-0"></div>
                <div className="border-t border-dashed border-slate-100 w-full h-0"></div>
                <div className="border-t border-dashed border-slate-100 w-full h-0"></div>
              </div>

              {/* Bars */}
              {chartData.map((data, i) => {
                const maxVal = Math.max(data.Budget, data.Actual, 1);
                const budgetHeight = (data.Budget / maxVal) * 100;
                const actualHeight = (data.Actual / maxVal) * 100;

                return (
                  <div key={i} className="flex flex-col items-center gap-1 z-10 group">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                      <div className="font-bold mb-1">{data.name}</div>
                      <div className="text-slate-300">Budget: {formatRupiah(data.Budget)}</div>
                      <div className="text-emerald-300">Actual: {formatRupiah(data.Actual)}</div>
                      <div className="text-blue-300">Sisa: {formatRupiah(data.Budget - data.Actual)}</div>
                    </div>

                    <div className="flex items-end gap-4 h-[200px]">
                      {/* Budget Bar */}
                      <div className="flex flex-col items-center gap-1">
                        <div 
                          className="w-12 bg-slate-300 rounded-t-md transition-all duration-500 hover:bg-slate-400 relative"
                          style={{ height: `${budgetHeight}%` }}
                        >
                          {data.Budget > 0 && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
                              {Math.round(data.Budget / 1000000)}jt
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">Budget</span>
                      </div>

                      {/* Actual Bar */}
                      <div className="flex flex-col items-center gap-1">
                        <div 
                          className={`w-12 rounded-t-md transition-all duration-500 relative ${
                            data.Actual > data.Budget ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                          style={{ height: `${actualHeight}%` }}
                        >
                          {data.Actual > 0 && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
                              {Math.round(data.Actual / 1000000)}jt
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">Actual</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panel: Pipeline Kandidat */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
           <h3 className="font-extrabold text-slate-800 text-sm mb-4">Status Pipeline Kandidat</h3>
           <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {['Applied', 'Screening', 'Interview', 'Offering', 'Hired'].map((stage, idx) => {
                 const count = candidates.filter(c => c.tahapProses.toLowerCase() === stage.toLowerCase()).length;
                 const colors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700', 'bg-emerald-100 text-emerald-700'];
                 return (
                   <div key={stage} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${colors[idx].split(' ')[0].replace('100', '500')}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{stage}</p>
                          <p className="text-[10px] text-slate-400">Kandidat Aktif</p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-slate-800">{count}</span>
                   </div>
                 )
              })}
           </div>
           <button onClick={() => setActiveMenu('candidates')} className="mt-4 w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
             Lihat Semua Kandidat <ArrowRight className="w-3 h-3" />
           </button>
        </div>

      </div>
    </div>
  );
};
