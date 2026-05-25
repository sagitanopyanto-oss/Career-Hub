import React, { useState } from 'react';
import { Job, Candidate, AppSettings } from '../data/mockData';

interface ChartsProps {
  candidates: Candidate[];
  jobs: Job[];
  settings: AppSettings;
  filterRange: 'month' | '6months' | 'annual';
  filterYear?: number;
  filterQuarters?: number[];
}

export const RecruitmentCharts: React.FC<ChartsProps> = ({
  candidates,
  jobs,
  settings,
  filterRange,
  filterYear = 0,
  filterQuarters = []
}) => {
  // State for Global Tooltip
  const [hoveredBar, setHoveredBar] = useState<{ 
    chart: string; 
    index: number; 
    label: string; 
    val1: number; 
    val2?: number; 
    x: number; 
    y: number 
  } | null>(null);

  const departmentNames = settings.budgetCostHiring.map(b => b.department);
  const tooltipWidth = 210;
  const tooltipHeight = 86;
  const filterLabel = filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan';

  // Helper to resolve department from candidate's applied job
  const resolveDepartment = (candidate: Candidate) => {
    const matchedJob = jobs.find((job) => job.judul === candidate.posisiDilamar || job.id === candidate.posisiDilamar);
    return matchedJob?.department || 'Technology';
  };

  // 1. DEPARTMENT DATA (Jobs vs Hired per Dept) - FIXED LOGIC
  const deptData = departmentNames.map((department) => {
    // Hitung hanya lowongan BERSTATUS 'Aktif'
    const jobsCount = jobs.filter((job) => 
      job.department === department && job.status === 'Aktif' // Filter ketat: hanya lowongan aktif
    ).length;

    const hiredCount = candidates.filter((candidate) => 
      candidate.tahapProses === 'hired' && resolveDepartment(candidate) === department
    ).length;

    return {
      department,
      jobs: jobsCount,
      hired: hiredCount,
    };
  });

  // 2. TREND DATA (Jobs vs Hired over Time) - FIXED LOGIC
  const buildTrendBuckets = () => {
    const now = new Date();
    const year = filterYear !== 0 ? filterYear : now.getFullYear();

    // If specific quarters are selected, break them into months
    if (filterQuarters.length > 0) {
      const quarterMonthMap: Record<number, [number, number]> = {
        1: [0, 2],   // Jan–Mar
        2: [3, 5],   // Apr–Jun
        3: [6, 8],   // Jul–Sep
        4: [9, 11],  // Okt–Des
      };
      const buckets: { label: string; start: Date; end: Date }[] = [];
      [...filterQuarters].sort().forEach(q => {
        const [startM, endM] = quarterMonthMap[q];
        for (let m = startM; m <= endM; m++) {
          const label = new Date(year, m, 1).toLocaleString('id-ID', { month: 'short' }) + ` ${String(year).slice(-2)}`;
          buckets.push({ label, start: new Date(year, m, 1), end: new Date(year, m + 1, 0) });
        }
      });
      return buckets;
    }

    // Period-based buckets relative to the selected year
    if (filterRange === 'month') {
      const m = now.getMonth();
      return [
        { label: `W1`, start: new Date(year, m, 1), end: new Date(year, m, 7) },
        { label: `W2`, start: new Date(year, m, 8), end: new Date(year, m, 14) },
        { label: `W3`, start: new Date(year, m, 15), end: new Date(year, m, 21) },
        { label: `W4`, start: new Date(year, m, 22), end: new Date(year, m + 1, 0) },
      ];
    }

    if (filterRange === '6months') {
      const buckets: { label: string; start: Date; end: Date }[] = [];
      for (let offset = 5; offset >= 0; offset--) {
        const d = new Date(year, now.getMonth() - offset, 1);
        const label = d.toLocaleString('id-ID', { month: 'short' }) + ` '${String(d.getFullYear()).slice(-2)}`;
        buckets.push({ label, start: new Date(d.getFullYear(), d.getMonth(), 1), end: new Date(d.getFullYear(), d.getMonth() + 1, 0) });
      }
      return buckets;
    }

    // Annual: show all 4 quarters of the selected year
    return [
      { label: `Q1 '${String(year).slice(-2)}`, start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
      { label: `Q2 '${String(year).slice(-2)}`, start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
      { label: `Q3 '${String(year).slice(-2)}`, start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
      { label: `Q4 '${String(year).slice(-2)}`, start: new Date(year, 9, 1), end: new Date(year, 11, 31) },
    ];
  };

  const buckets = buildTrendBuckets();

  const countInBucket = (dateStr: string | undefined, bucket: { start: Date; end: Date }) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    return date >= bucket.start && date <= bucket.end ? 1 : 0;
  };

  // 🔹 PERBAIKAN LOGIKA TREND: Hanya hitung lowongan BERSTATUS 'AKTIF'
  const trendPoints = buckets.map((bucket) => {
    // Hitung lowongan BARU yang BERSTATUS 'Aktif' berdasarkan createdAt
    const jobsCount = jobs
      .filter(job => job.status === 'Aktif') // Filter ketat: hanya lowongan aktif
      .reduce((sum, job) => sum + countInBucket(job.createdAt, bucket), 0);

    // Hitung kandidat HIRED berdasarkan tanggalHired (BUKAN tanggalApplied)
    const hiredCount = candidates
      .filter(c => c.tahapProses === 'hired') // Filter ketat: hanya yang statusnya hired
      .reduce((sum, candidate) => {
        return sum + countInBucket(candidate.tanggalHired, bucket);
      }, 0);

    return {
      label: bucket.label,
      jobs: jobsCount,
      hired: hiredCount,
    };
  });
  
  // 3. PIPELINE DATA
  const pipelineStages: { stage: string; label: string; count: number; color: string }[] = [
    { stage: 'applied', label: 'Applied', count: 0, color: 'bg-blue-500' },
    { stage: 'screening', label: 'Screening', count: 0, color: 'bg-indigo-500' },
    { stage: 'interview', label: 'Interview', count: 0, color: 'bg-purple-500' },
    { stage: 'assessment', label: 'Assessment', count: 0, color: 'bg-pink-500' },
    { stage: 'medical', label: 'Medical Check', count: 0, color: 'bg-amber-500' },
    { stage: 'offering', label: 'Offering', count: 0, color: 'bg-teal-500' },
    { stage: 'hired', label: 'Hired', count: 0, color: 'bg-emerald-500' },
    { stage: 'rejected', label: 'Rejected', count: 0, color: 'bg-rose-500' },
  ];

  pipelineStages.forEach(p => {
    p.count = candidates.filter((candidate) => candidate.tahapProses === p.stage).length;
  });

  // 4. HIRING COST DATA
  const hiringCostData = settings.budgetCostHiring.map((budget) => {
    const actual = candidates
      .filter((candidate) => candidate.tahapProses === 'hired' && resolveDepartment(candidate) === budget.department)
      .reduce((sum, candidate) => sum + candidate.expectedSalary, 0);

    return {
      department: budget.department,
      budget: budget.budget,
      actual,
    };
  });

  const formatMuta = (value: number) => {
    return `Rp ${(value / 1000000).toFixed(1)} Jt`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 relative">
      
      {/* 🔹 GLOBAL TOOLTIP OVERLAY (DYNAMIC LABELS) */}
      {hoveredBar && (
        <div 
          className="fixed z-[80] bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs pointer-events-none"
          style={{ 
            left: `${Math.max(12, Math.min(typeof window !== 'undefined' ? window.innerWidth - tooltipWidth - 12 : hoveredBar.x, hoveredBar.x + 12))}px`,
            top: `${Math.max(12, Math.min(typeof window !== 'undefined' ? window.innerHeight - tooltipHeight - 12 : hoveredBar.y, hoveredBar.y - 50))}px`
          }}
        >
          <p className="font-semibold text-slate-300 mb-1">{hoveredBar.label}</p>
          <div className="flex flex-col gap-0.5">
            
            {/* Logic Label Dinamis Berdasarkan Chart Type */}
            {hoveredBar.chart === 'dept' ? (
              // Chart 1: Department
              hoveredBar.label.includes('Hired') ? (
                 <p className="flex justify-between gap-4">
                  <span>Kandidat Hired:</span>
                  <span className="font-bold text-emerald-400">{hoveredBar.val1}</span>
                </p>
              ) : (
                <p className="flex justify-between gap-4">
                  <span>Lowongan Baru:</span>
                  <span className="font-bold text-indigo-400">{hoveredBar.val1}</span>
                </p>
              )
            ) : hoveredBar.chart === 'trend' ? (
              // Chart 2: Trend (Job vs Hired)
              hoveredBar.label.includes('Hired') ? (
                <p className="flex justify-between gap-4">
                  <span>Kandidat Hired:</span>
                  <span className="font-bold text-indigo-400">{hoveredBar.val1}</span>
                </p>
              ) : (
                <p className="flex justify-between gap-4">
                  <span>Lowongan Baru:</span>
                  <span className="font-bold text-blue-400">{hoveredBar.val1}</span>
                </p>
              )
            ) : hoveredBar.chart === 'cost' ? (
               // Chart 4: Cost Hiring
               <>
                <p className="flex justify-between gap-4">
                  <span>Budget Alokasi:</span>
                  <span className="font-bold text-slate-300">{formatMuta(hoveredBar.val1)}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span>Realisasi Aktual:</span>
                  <span className={`font-bold ${hoveredBar.val2! > hoveredBar.val1 ? 'text-red-400' : 'text-amber-400'}`}>
                    {formatMuta(hoveredBar.val2!)}
                  </span>
                </p>
               </>
            ) : null}

          </div>
        </div>
      )}

      {/* Chart 1: Recruitment by Department */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Lowongan vs Hired per Departemen</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100">
                ✓ {filterLabel}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs">Perbandingan posisi dibuka dan kandidat yang berhasil direkrut</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded"></span> Lowongan
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> Hired
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between px-2 pt-6 relative border-b border-slate-100">
          {deptData.map((data, idx) => {
            const maxVal = Math.max(...deptData.map(d => Math.max(d.jobs, d.hired)), 1);
            const jobsHeightPercent = (data.jobs / maxVal) * 80;
            const hiredHeightPercent = (data.hired / maxVal) * 80;

            return (
              <div key={data.department} className="flex flex-col items-center flex-1 group">
                <div className="w-full flex justify-center items-end gap-1 h-44 mb-2">
                  {/* Jobs Bar */}
                  <div 
                    className="w-3 sm:w-5 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t cursor-pointer hover:brightness-110 transition-all duration-300 relative"
                    style={{ height: `${Math.max(jobsHeightPercent, 5)}%` }}
                    onMouseEnter={(e) => {
                      setHoveredBar({
                        chart: 'dept',
                        index: idx,
                        label: `${data.department} (Lowongan)`,
                        val1: data.jobs,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseMove={(e) => setHoveredBar((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  {/* Hired Bar */}
                  <div 
                    className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t cursor-pointer hover:brightness-110 transition-all duration-300 relative"
                    style={{ height: `${Math.max(hiredHeightPercent, 5)}%` }}
                    onMouseEnter={(e) => {
                      setHoveredBar({
                        chart: 'dept',
                        index: idx,
                        label: `${data.department} (Hired)`,
                        val1: data.hired,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseMove={(e) => setHoveredBar((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-slate-500 text-center truncate w-20 md:w-28">
                  {data.department}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {data.jobs} / {data.hired}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Job vs Recruitment Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Tren Lowongan vs Rekrutmen</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100">
                ✓ {filterLabel}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs">Statistik postingan lowongan vs rekrutan sukses</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded"></span> Lowongan Baru
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 bg-indigo-400 rounded"></span> Kandidat Hired
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between px-2 pt-6 relative border-b border-slate-100">
          {trendPoints.map((point, idx) => {
            const maxVal = Math.max(...trendPoints.map(p => Math.max(p.jobs, p.hired)), 1);
            const jobsHeight = (point.jobs / maxVal) * 80;
            const hiredHeight = (point.hired / maxVal) * 80;

            return (
              <div key={point.label} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center items-end gap-1 h-44 mb-2">
                  <div 
                    className="w-2.5 sm:w-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t cursor-pointer hover:brightness-110 transition-all duration-300"
                    style={{ height: `${Math.max(jobsHeight, 5)}%` }}
                    onMouseEnter={(e) => {
                      setHoveredBar({
                        chart: 'trend',
                        index: idx,
                        label: `${point.label} - Lowongan Baru`,
                        val1: point.jobs,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseMove={(e) => setHoveredBar((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <div 
                    className="w-2.5 sm:w-4 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t cursor-pointer hover:brightness-110 transition-all duration-300"
                    style={{ height: `${Math.max(hiredHeight, 5)}%` }}
                    onMouseEnter={(e) => {
                      setHoveredBar({
                        chart: 'trend',
                        index: idx,
                        label: `${point.label} - Kandidat Hired`,
                        val1: point.hired,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseMove={(e) => setHoveredBar((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-slate-500 truncate w-14 text-center">
                  {point.label}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  L:{point.jobs} H:{point.hired}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 3: Pipeline Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Pipeline Tahap Rekrutmen</h3>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100">
              ✓ {filterLabel}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] sm:text-xs">Volume kandidat aktif di setiap fase rekrutmen</p>
        </div>

        <div className="space-y-3.5">
          {pipelineStages.map((stage) => {
            const maxVal = Math.max(...pipelineStages.map(s => s.count), 1);
            const widthPercent = (stage.count / maxVal) * 100;
            
            return (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span className="capitalize">{stage.label}</span>
                  <span>{stage.count} Kandidat</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div 
                    className={`${stage.color} h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.max(widthPercent, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 4: Hiring Cost Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Cost Hiring per Departemen</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100">
                ✓ {filterLabel}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs">Perbandingan budget alokasi vs pengeluaran riil</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 bg-slate-300 rounded"></span> Budget
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded"></span> Aktual
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {hiringCostData.map((data, idx) => {
            const budgetPercent = 100;
            const actualPercent = (data.actual / data.budget) * 100;
            const isOverBudget = data.actual > data.budget;

            return (
              <div key={data.department} className="space-y-1.5">
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs">
                  <span className="font-bold text-slate-700">{data.department}</span>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-slate-400">Real: <b className="text-slate-700">{formatMuta(data.actual)}</b></span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="text-slate-400">Budg: <b className="text-slate-700">{formatMuta(data.budget)}</b></span>
                    {isOverBudget ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-700 font-extrabold animate-pulse">OVER</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-100 text-green-700 font-extrabold">SAFE</span>
                    )}
                  </div>
                </div>

                {/* Double Bar showing budget vs actual */}
                <div className="space-y-1">
                  {/* Budget Line */}
                  <div className="w-full bg-slate-100 h-2 rounded-full relative overflow-hidden">
                    <div 
                      className="bg-slate-300 h-full rounded-full cursor-pointer"
                      style={{ width: `${budgetPercent}%` }}
                      onMouseEnter={(e) => {
                        setHoveredBar({
                          chart: 'cost',
                          index: idx,
                          label: `${data.department} (Budget)`,
                          val1: data.budget,
                          val2: data.actual,
                          x: e.clientX,
                          y: e.clientY
                        });
                      }}
                      onMouseMove={(e) => setHoveredBar((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  </div>
                  {/* Actual Line */}
                  <div className="w-full bg-slate-100 h-2 rounded-full relative overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 cursor-pointer ${isOverBudget ? 'bg-red-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(actualPercent, 100)}%` }}
                      onMouseEnter={(e) => {
                        setHoveredBar({
                          chart: 'cost',
                          index: idx,
                          label: `${data.department} (Realisasi)`,
                          val1: data.budget,
                          val2: data.actual,
                          x: e.clientX,
                          y: e.clientY
                        });
                      }}
                      onMouseMove={(e) => setHoveredBar((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
