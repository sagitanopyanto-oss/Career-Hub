import React from 'react';
import { Candidate, Job, AppSettings } from '../data/mockData';

interface RecruitmentChartsProps {
  candidates: Candidate[];
  jobs: Job[];
  settings: AppSettings;
  filterRange: 'month' | '6months' | 'annual';
  filterYear: number;
  filterQuarters: number[];
}

export const RecruitmentCharts: React.FC<RecruitmentChartsProps> = ({
  candidates,
  jobs,
  settings,
  filterYear,
}) => {

  // --- HELPER: Get Unique Departments from Settings Budget based on Filter Year ---
  // Kita hanya mengambil departemen yang memiliki alokasi budget pada tahun yang dipilih
  // Ini mencegah duplikasi jika departemen yang sama punya budget di tahun berbeda
  const getDepartmentsForChart = () => {
    if (!settings.budgetCostHiring) return [];
    
    // 1. Filter budget sesuai tahun global dashboard
    const relevantBudgets = settings.budgetCostHiring.filter(b => 
      filterYear === 0 ? true : b.year === filterYear
    );

    // 2. Ambil nama departemen unik menggunakan Set
    const uniqueDepts = Array.from(new Set(relevantBudgets.map(b => b.department)));
    
    // 3. Sort alphabetically
    return uniqueDepts.sort();
  };

  const departments = getDepartmentsForChart();

  // --- CHART 1: Lowongan vs Hired per Departemen ---
  const jobVsHiredData = departments.map(dept => {
    // Count Active Jobs for this dept in current filter context
    // Note: Jobs usually don't have 'year', but we assume active jobs are current.
    // If jobs have createdAt, you might want to filter by year too.
    const openJobs = jobs.filter(j => 
      j.department === dept && 
      j.status === 'Aktif'
    ).length;

    // Count Hired Candidates for this dept in current filter context
    const hiredCands = candidates.filter(c => 
      c.posisiDilamar.toLowerCase().includes(dept.toLowerCase()) || 
      dept.toLowerCase().includes(c.posisiDilamar.toLowerCase()) // Simple matching logic
      && c.tahapProses === 'hired'
      && (filterYear === 0 ? true : new Date(c.tanggalHired!).getFullYear() === filterYear)
    ).length;

    return {
      department: dept,
      open: openJobs,
      hired: hiredCands
    };
  });

  // --- CHART 2: Cost Hiring per Departemen ---
  const costHiringData = departments.map(dept => {
    // Get Budget for this dept & year
    const budgetEntry = settings.budgetCostHiring.find(b => 
      b.department === dept && 
      (filterYear === 0 ? true : b.year === filterYear)
    );
    
    // If multiple entries exist for same dept/year (data inconsistency), take the first or sum them.
    // Here we assume unique constraint is handled in Settings, so findFirst is safe.
    const budget = budgetEntry ? budgetEntry.budget : 0;

    // Calculate Actual Spending (Sum of Expected Salary for Hired Candidates in this Dept & Year)
    const actual = candidates
      .filter(c => 
        (c.posisiDilamar.toLowerCase().includes(dept.toLowerCase()) || dept.toLowerCase().includes(c.posisiDilamar.toLowerCase()))
        && c.tahapProses === 'hired'
        && (filterYear === 0 ? true : new Date(c.tanggalHired!).getFullYear() === filterYear)
      )
      .reduce((sum, c) => sum + (c.expectedSalary || 0), 0);

    return {
      department: dept,
      budget: budget,
      actual: actual,
      remaining: budget - actual,
      status: actual > budget ? 'OVER' : 'SAFE'
    };
  });

  // Helper to format currency
  const formatIDR = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Find max value for scaling bars
  const maxJobVal = Math.max(...jobVsHiredData.map(d => Math.max(d.open, d.hired)), 1);
  const maxCostVal = Math.max(...costHiringData.map(d => Math.max(d.budget, d.actual)), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* CHART 1: Lowongan vs Hired */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Lowongan vs Hired per Departemen</h3>
            <p className="text-slate-400 text-[11px] sm:text-xs">Perbandingan posisi dibuka dan kandidat yang berhasil direkrut</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
             ✓ {filterYear === 0 ? 'Semua Tahun' : filterYear}
          </span>
        </div>

        <div className="h-[250px] flex items-end justify-around gap-2 pt-4 pb-2 overflow-x-auto">
          {jobVsHiredData.length > 0 ? jobVsHiredData.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 flex-1 min-w-[40px] group">
              <div className="flex items-end gap-1 h-[200px] w-full justify-center relative">
                {/* Bar Lowongan */}
                <div 
                  className="w-3 sm:w-4 bg-indigo-500 rounded-t-sm transition-all duration-500 hover:bg-indigo-600"
                  style={{ height: `${(item.open / maxJobVal) * 100}%` }}
                  title={`Lowongan: ${item.open}`}
                ></div>
                {/* Bar Hired */}
                <div 
                  className="w-3 sm:w-4 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:bg-emerald-600"
                  style={{ height: `${(item.hired / maxJobVal) * 100}%` }}
                  title={`Hired: ${item.hired}`}
                ></div>
              </div>
              <div className="text-center mt-2">
                 <span className="text-[10px] font-semibold text-slate-600 block truncate max-w-[60px]" title={item.department}>
                   {item.department}
                 </span>
                 <span className="text-[9px] text-slate-400">{item.open}/{item.hired}</span>
              </div>
            </div>
          )) : (
            <div className="w-full text-center text-slate-400 text-xs py-10">Tidak ada data departemen untuk tahun ini.</div>
          )}
        </div>
      </div>

      {/* CHART 2: Cost Hiring per Departemen */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Cost Hiring per Departemen</h3>
            <p className="text-slate-400 text-[11px] sm:text-xs">Perbandingan budget alokasi vs pengeluaran riil</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Budget</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Aktual</span>
          </div>
        </div>

        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {costHiringData.length > 0 ? costHiringData.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 truncate max-w-[120px]" title={item.department}>{item.department}</span>
                <div className="flex items-center gap-2">
                   <span className="text-slate-500">Real: <b className={item.status === 'OVER' ? 'text-rose-600' : 'text-slate-700'}>{formatIDR(item.actual)}</b></span>
                   <span className="text-slate-400">|</span>
                   <span className="text-slate-500">Budg: <b>{formatIDR(item.budget)}</b></span>
                   <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${item.status === 'OVER' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                     {item.status}
                   </span>
                </div>
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden relative">
                {/* Background Bar (Budget) */}
                <div 
                  className="absolute top-0 left-0 h-full bg-slate-300 rounded-full"
                  style={{ width: '100%' }} // Represents 100% of the budget capacity visually if we scale by maxCostVal, but here simple relative is better
                ></div>
                
                {/* Actual Bar */}
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${item.status === 'OVER' ? 'bg-rose-500' : 'bg-orange-500'}`}
                  style={{ 
                    width: `${Math.min((item.actual / (item.budget || 1)) * 100, 100)}%` 
                    // Note: If you want to compare against Global Max, use (item.actual / maxCostVal) * 100
                    // But for "Budget vs Actual" per row, comparing actual % of budget is often clearer.
                    // Let's stick to visual comparison relative to the row's own budget for clarity, 
                    // OR relative to global max if you want all bars aligned. 
                    // Based on screenshot, it looks like relative to global max or fixed scale.
                    // Let's use Global Max Scale for consistency with Chart 1:
                    width: `${(item.budget / maxCostVal) * 100}%` // This draws the budget bar length
                  }}
                ></div>
                 {/* Actual Bar Overlay */}
                 <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 opacity-80 ${item.status === 'OVER' ? 'bg-rose-600' : 'bg-orange-600'}`}
                  style={{ 
                    width: `${(item.actual / maxCostVal) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )) : (
             <div className="w-full text-center text-slate-400 text-xs py-10">Tidak ada data budget untuk tahun ini.</div>
          )}
        </div>
      </div>

    </div>
  );
};
