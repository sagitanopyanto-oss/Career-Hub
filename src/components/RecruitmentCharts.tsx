import React from 'react';
import { Candidate, Job, AppSettings } from '../data/mockData';

interface RecruitmentChartsProps {
  candidates: Candidate[]; // Data SUDAH difilter oleh DashboardView (Global Filter)
  jobs: Job[];             // Data SUDAH difilter oleh DashboardView (Global Filter)
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
  filterQuarters,
}) => {

  // --- HELPER: Get Unique Departments & Aggregate Data ---
  const getChartData = () => {
    if (!settings.budgetCostHiring) return { depts: [], costData: [] };
    
    // 1. Filter budget sesuai tahun global dashboard
    // Jika filterYear 0 (Semua Tahun), ambil semua. Jika spesifik, ambil hanya tahun itu.
    let relevantBudgets = settings.budgetCostHiring.filter(b => 
      filterYear === 0 ? true : b.year === filterYear
    );

    // 2. Jika "Semua Tahun", kita perlu mengelompokkan dan menjumlahkan budget per departemen
    if (filterYear === 0) {
      const budgetMap: Record<string, number> = {};
      relevantBudgets.forEach(b => {
        budgetMap[b.department] = (budgetMap[b.department] || 0) + b.budget;
      });
      
      relevantBudgets = Object.keys(budgetMap).map(dept => ({
        department: dept,
        year: 0,
        budget: budgetMap[dept],
        actual: 0
      }));
    }

    // 3. Ambil nama departemen unik
    const uniqueDepts = Array.from(new Set(relevantBudgets.map(b => b.department))).sort();

    // 4. Hitung Cost Hiring Data (Actual)
    // PENTING: 'candidates' prop di sini ADALAH data yang sudah difilter oleh DashboardView
    // berdasarkan Year, Quarter, dan Range. Jadi kita TIDAK PERLU filter tanggal lagi di sini.
    // Kita hanya perlu mempastikannya berstatus 'hired' dan cocok dengan departemen.
    const costData = uniqueDepts.map(dept => {
      const budgetEntry = relevantBudgets.find(b => b.department === dept);
      const budget = budgetEntry ? budgetEntry.budget : 0;

      // Sum actual dari kandidat yang SUDAH DIFILTER oleh parent
      const actual = candidates
        .filter(c => 
          c.tahapProses === 'hired' &&
          // Match Department Name (Case Insensitive & Partial Match)
          (c.posisiDilamar.toLowerCase().includes(dept.toLowerCase()) || 
           dept.toLowerCase().includes(c.posisiDilamar.toLowerCase()))
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

    return { depts: uniqueDepts, costData };
  };

  const { depts: departments, costData } = getChartData();

  // --- CHART 1: Lowongan vs Hired per Departemen ---
  // Menggunakan data 'jobs' dan 'candidates' yang SUDAH DIFILTER oleh DashboardView
  const jobVsHiredData = departments.map(dept => {
    // Count Active Jobs for this dept
    // Karena jobs sudah difilter by date/range di parent, kita hitung semua yang status 'Aktif'
    const openJobs = jobs.filter(j => 
      j.department.toLowerCase() === dept.toLowerCase() && 
      j.status === 'Aktif'
    ).length;

    // Count Hired Candidates for this dept
    // Karena candidates sudah difilter by date/range/year/quarter di parent,
    // kita cukup hitung yang status 'hired' dan cocok departemennya.
    const hiredCands = candidates.filter(c => 
      c.tahapProses === 'hired' &&
      (c.posisiDilamar.toLowerCase().includes(dept.toLowerCase()) || 
       dept.toLowerCase().includes(c.posisiDilamar.toLowerCase()))
    ).length;

    return { department: dept, open: openJobs, hired: hiredCands };
  });

  // --- CHART 3: Tren Lowongan vs Rekrutmen (Dynamic based on Filter) ---
  const nowDate = new Date();
  let trendMonths: { month: string; monthNum: number; year: number }[] = [];

  // Logika Dinamis Berdasarkan Filter Quarter & Year
  if (filterQuarters.length > 0) {
    // Jika Quarter dipilih, tampilkan bulan-bulan dalam quarter tersebut pada Tahun yang dipilih
    const sortedQuarters = [...filterQuarters].sort((a, b) => a - b);
    const targetYear = filterYear === 0 ? nowDate.getFullYear() : filterYear;
    
    sortedQuarters.forEach(q => {
      const startMonth = (q - 1) * 3; // Q1=0, Q2=3, Q3=6, Q4=9
      for (let i = 0; i < 3; i++) {
        const m = startMonth + i;
        const d = new Date(targetYear, m, 1);
        trendMonths.push({
          month: d.toLocaleString('id-ID', { month: 'short' }),
          monthNum: m,
          year: targetYear
        });
      }
    });
  } else if (filterYear !== 0) {
    // Jika Tahun dipilih (tanpa quarter), tampilkan 12 bulan tahun tersebut
    for (let m = 0; m < 12; m++) {
      const d = new Date(filterYear, m, 1);
      trendMonths.push({
        month: d.toLocaleString('id-ID', { month: 'short' }),
        monthNum: m,
        year: filterYear
      });
    }
  } else {
    // Jika "Semua Tahun" & "Semua Quarter", tampilkan 6 bulan terakhir sebagai tren cepat
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1);
      trendMonths.push({
        month: d.toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
        monthNum: d.getMonth(),
        year: d.getFullYear()
      });
    }
  }

  const trendData = trendMonths.map(m => {
    // Untuk Trend Chart, kita perlu menghitung data per bulan.
    // Meskipun 'candidates' dan 'jobs' sudah difilter global, kita harus memastikan
    // kita hanya mengambil data yang jatuh pada bulan spesifik ini.
    
    const jobsCreated = jobs.filter(j => {
      const jd = new Date(j.createdAt);
      return jd.getMonth() === m.monthNum && jd.getFullYear() === m.year;
    }).length;

    const hiresMade = candidates.filter(c => {
      if (c.tahapProses !== 'hired' || !c.tanggalHired) return false;
      const hd = new Date(c.tanggalHired);
      return hd.getMonth() === m.monthNum && hd.getFullYear() === m.year;
    }).length;

    return { label: m.month, jobs: jobsCreated, hires: hiresMade };
  });

  const maxJobVal = Math.max(...jobVsHiredData.map(d => Math.max(d.open, d.hired)), 1);
  const maxCostVal = Math.max(...costData.map(d => Math.max(d.budget, d.actual)), 1);
  const maxTrendVal = Math.max(...trendData.map(t => Math.max(t.jobs, t.hires)), 1);

  const formatIDR = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

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
                {/* Bar Lowongan (Blue) */}
                <div 
                  className="w-3 sm:w-4 bg-indigo-500 rounded-t-sm transition-all duration-500 hover:bg-indigo-600"
                  style={{ height: `${(item.open / maxJobVal) * 100}%` }}
                  title={`Lowongan: ${item.open}`}
                ></div>
                {/* Bar Hired (Green) - FIX: Pastikan height dihitung dengan benar */}
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
            <div className="w-full text-center text-slate-400 text-xs py-10">Tidak ada data departemen untuk periode ini.</div>
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
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Budget</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aktual</span>
          </div>
        </div>

        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {costData.length > 0 ? costData.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 truncate max-w-[120px]" title={item.department}>{item.department}</span>
                <div className="flex items-center gap-2">
                   {/* FIX: Angka Real sekarang sinkron karena menggunakan data candidates yang sudah difilter */}
                   <span className="text-slate-500">Real: <b className={item.status === 'OVER' ? 'text-rose-600' : 'text-emerald-600'}>{formatIDR(item.actual)}</b></span>
                   <span className="text-slate-400">|</span>
                   <span className="text-slate-500">Budg: <b>{formatIDR(item.budget)}</b></span>
                </div>
              </div>
              
              {/* Visual Bar */}
              <div className="w-full flex items-center gap-1 h-3">
                 <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden relative">
                    {/* Budget Fill */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(item.budget / maxCostVal) * 100}%` }}
                    ></div>
                    {/* Actual Fill */}
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full opacity-80 ${item.status === 'OVER' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${(item.actual / maxCostVal) * 100}%` }}
                    ></div>
                 </div>
              </div>
              <div className="text-right">
                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.status === 'OVER' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.status === 'OVER' ? '⚠ Over Budget' : '✅ On Budget'}
                 </span>
              </div>
            </div>
          )) : (
             <div className="w-full text-center text-slate-400 text-xs py-10">Tidak ada data budget untuk periode ini.</div>
          )}
        </div>
      </div>

      {/* CHART 3: Tren Lowongan vs Rekrutmen */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Tren Lowongan vs Rekrutmen</h3>
            <p className="text-slate-400 text-[11px] sm:text-xs">
              {filterQuarters.length > 0 
                ? `Statistik Bulanan Q${filterQuarters.join(',')} Tahun ${filterYear === 0 ? nowDate.getFullYear() : filterYear}` 
                : filterYear !== 0 
                  ? `Statistik Bulanan Tahun ${filterYear}` 
                  : 'Statistik 6 Bulan Terakhir'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Lowongan Baru</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Kandidat Hired</span>
          </div>
        </div>

        <div className="h-[200px] flex items-end justify-around gap-2 pt-4 pb-2 overflow-x-auto">
          {trendData.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 flex-1 min-w-[30px] group">
              <div className="flex items-end gap-1 h-[150px] w-full justify-center relative">
                 {/* Bar Lowongan */}
                 <div 
                   className="w-2 sm:w-3 bg-indigo-500 rounded-t-sm transition-all duration-500 hover:bg-indigo-600"
                   style={{ height: `${(item.jobs / maxTrendVal) * 100}%` }}
                   title={`Lowongan: ${item.jobs}`}
                 ></div>
                 {/* Bar Hired */}
                 <div 
                   className="w-2 sm:w-3 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:bg-emerald-600"
                   style={{ height: `${(item.hires / maxTrendVal) * 100}%` }}
                   title={`Hired: ${item.hires}`}
                 ></div>
              </div>
              <span className="text-[9px] font-semibold text-slate-600">{item.label}</span>
              <span className="text-[8px] text-slate-400">L{item.jobs} H{item.hires}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
