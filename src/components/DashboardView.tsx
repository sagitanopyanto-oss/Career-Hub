import React, { useMemo } from 'react';
import {
  Users, Briefcase, UserCheck, Stethoscope, FileCheck, Award, Activity, Clock, CalendarClock, ArrowUpRight, CheckCircle, TrendingUp, DollarSign, BarChart3, PieChart, LineChart
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

  const nowDate = new Date();

  // Derive available years from all candidate and job dates
  const allYears = Array.from(new Set([
    ...candidates.map(c => new Date(c.tanggalApplied).getFullYear()),
    ...jobs.map(j => new Date(j.createdAt).getFullYear()),
    nowDate.getFullYear()
  ])).sort((a, b) => b - a); // descending

  // Quarter helper: get quarter number (1–4) from a Date
  const getQuarter = (date: Date) => Math.ceil((date.getMonth() + 1) / 4);

  // Date helper
  const diffInDays = (d1: string, d2: string) => {
    const timeDiff = new Date(d1).getTime() - new Date(d2).getTime();
    return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  };

  // Check if a date belongs to the selected quarter(s) within the selected year
  const isWithinYearAndQuarter = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    // Year filter
    if (filterYear !== 0 && date.getFullYear() !== filterYear) return false;

    // Quarter filter (if any quarters are selected)
    if (filterQuarters.length > 0) {
      const q = getQuarter(date);
      if (!filterQuarters.includes(q)) return false;
    }

    return true;
  };

  const isWithinFilterRange = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);

    // If quarters or specific year set, use year/quarter filter
    if (filterQuarters.length > 0) {
      return isWithinYearAndQuarter(dateStr);
    }

    // Year filter: restrict to selected year
    if (filterYear !== 0) {
      if (date.getFullYear() !== filterYear) return false;
    }

    if (filterRange === 'month') {
      return date.getMonth() === nowDate.getMonth() && date.getFullYear() === nowDate.getFullYear();
    } else if (filterRange === '6months') {
      const sixMonthsAgo = new Date(nowDate);
      sixMonthsAgo.setMonth(nowDate.getMonth() - 6);
      return date >= sixMonthsAgo && date <= nowDate;
    } else {
      // Annual: whole selected year
      if (filterYear !== 0) {
        return date.getFullYear() === filterYear;
      }
      const oneYearAgo = new Date(nowDate);
      oneYearAgo.setFullYear(nowDate.getFullYear() - 1);
      return date >= oneYearAgo && date <= nowDate;
    }
  };

  const toggleQuarter = (q: number) => {
    setFilterQuarters(
      filterQuarters.includes(q) ? filterQuarters.filter(x => x !== q) : [...filterQuarters, q]
    );
  };

  // Filter candidates and jobs based on the selected range
  const filteredCandidates = candidates.filter((candidate) => isWithinFilterRange(candidate.tanggalApplied));
  const filteredJobs = jobs.filter((job) => isWithinFilterRange(job.createdAt));
  const displayCandidates = filteredCandidates;

  // 6 Analytics Cards
  const totalApplicantsCount = displayCandidates.length;
  const activeJobsCount = filteredJobs.filter((job) => job.status === 'Aktif').length;
  const interviewCount = displayCandidates.filter(c => c.tahapProses === 'interview').length;
  const medicalCount = displayCandidates.filter(c => c.tahapProses === 'medical').length;
  const offeringCount = displayCandidates.filter(c => c.tahapProses === 'offering').length;
  const hiredCount = displayCandidates.filter(c => c.tahapProses === 'hired').length;

  // SLA Table Calculation - IMPROVED ROBUSTNESS
  const stages = [
    { key: 'screening', label: 'Screening', startKey: 'tanggalApplied', endKey: 'tanggalScreening' },
    { key: 'interview', label: 'Interview', startKey: 'tanggalScreening', endKey: 'tanggalInterview' },
    { key: 'assessment', label: 'Assessment', startKey: 'tanggalInterview', endKey: 'tanggalAssessment' },
    { key: 'medical', label: 'Medical Check', startKey: 'tanggalAssessment', endKey: 'tanggalMedical' },
    { key: 'offering', label: 'Offering', startKey: 'tanggalMedical', endKey: 'tanggalOffering' },
    { key: 'hired', label: 'Hired', startKey: 'tanggalOffering', endKey: 'tanggalHired' },
  ];

  let totalCompliant = 0;
  let totalViolation = 0;

  const slaTableData = stages.map(stg => {
    const targetSetting = settings.targetSlaDays.find(t => t.stage === stg.key);
    const targetDays = targetSetting ? targetSetting.targetDays : 3;
    let candidateCount = 0;
    let compliantCount = 0;
    let violationCount = 0;

    displayCandidates.forEach(c => {
      // Safe access to date fields
      const startVal = (c as any)[stg.startKey];
      const endVal = (c as any)[stg.endKey];

      // Only process if start date exists and is valid
      if (startVal && !isNaN(new Date(startVal).getTime())) {
        candidateCount++;
        
        if (endVal && !isNaN(new Date(endVal).getTime())) {
          // Completed stage: Calculate actual days
          const days = diffInDays(endVal, startVal);
          if (days <= targetDays) {
            compliantCount++;
          } else {
            violationCount++;
          }
        } else {
          // In-progress stage: Calculate days so far vs target
          const todayStr = nowDate.toISOString().split('T')[0];
          const daysSoFar = diffInDays(todayStr, startVal);
          
          // If days so far already exceed target, it's a violation (late)
          // If still within target, it's compliant (on track)
          if (daysSoFar > targetDays) {
            violationCount++;
          } else {
            compliantCount++; 
          }
        }
      }
    });

    const rate = candidateCount > 0 ? Math.round((compliantCount / candidateCount) * 100) : 0;
    totalCompliant += compliantCount;
    totalViolation += violationCount;

    let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
    if (rate < 50) status = 'CRITICAL';
    else if (rate < 80) status = 'WARNING';

    return {
      stage: stg.label,
      targetDays,
      candidates: candidateCount,
      compliant: compliantCount,
      violation: violationCount,
      rate,
      status
    };
  });

  // Calculate SLA compliant rate percentage
  const totalSlaProcessed = totalCompliant + totalViolation;
  const slaCompliantRate = totalSlaProcessed > 0 ? Math.round((totalCompliant / totalSlaProcessed) * 100) : 0;

  // Calculate Average Days to Hire - IMPROVED SAFETY
  const hiredCandidates = displayCandidates.filter(c =>
    c.tahapProses === 'hired' &&
    c.tanggalHired &&
    c.tanggalApplied &&
    !isNaN(new Date(c.tanggalHired).getTime()) &&
    !isNaN(new Date(c.tanggalApplied).getTime())
  );

  let averageDaysToHire = 0;
  if (hiredCandidates.length > 0) {
    const totalDays = hiredCandidates.reduce((acc, c) => {
      return acc + diffInDays(c.tanggalHired!, c.tanggalApplied);
    }, 0);
    averageDaysToHire = parseFloat((totalDays / hiredCandidates.length).toFixed(1));
  }

  // Target SLA - Dinamis berdasarkan data filter (Goal management benchmark vs realisasi)
  // Menggunakan rata-rata target dari setting sebagai baseline, dibandingkan dengan realisasi filter
  const averageTargetSla = settings.targetSlaDays.reduce((sum, s) => sum + s.targetDays, 0) / settings.targetSlaDays.length;
  const targetSlaPercent = slaCompliantRate; // Realisasi aktual dari data terfilter
  const slaGoalPercent = settings.targetSlaManagement ?? 85; // Target SLA dari pengaturan management

  // 🔹 PERBAIKAN: Hitung Trend Dinamis vs Rata-Rata Historis
  // 1. Hitung total compliant & violation untuk SEMUA kandidat (tanpa filter waktu)
  let allTimeCompliant = 0;
  let allTimeViolation = 0;

  candidates.forEach(c => {
    stages.forEach(stg => {
      const startVal = (c as any)[stg.startKey];
      const endVal = (c as any)[stg.endKey];

      if (startVal && !isNaN(new Date(startVal).getTime())) {
        const targetSetting = settings.targetSlaDays.find(t => t.stage === stg.key);
        const targetDays = targetSetting ? targetSetting.targetDays : 3;

        if (endVal && !isNaN(new Date(endVal).getTime())) {
          const days = diffInDays(endVal, startVal);
          if (days <= targetDays) allTimeCompliant++;
          else allTimeViolation++;
        } else {
           // Untuk tahap yang belum selesai, kita abaikan dalam perhitungan historis final 
           // atau anggap compliant jika belum lewat target hari ini
           const daysSoFar = diffInDays(nowDate.toISOString().split('T')[0], startVal);
           if (daysSoFar <= targetDays) allTimeCompliant++;
           else allTimeViolation++;
        }
      }
    });
  });

  const allTimeTotal = allTimeCompliant + allTimeViolation;
  const historicalSlaRate = allTimeTotal > 0 ? Math.round((allTimeCompliant / allTimeTotal) * 100) : 0;

  // 2. Hitung Trend (Selisih antara Rate Periode Ini vs Rate Historis)
  const slaTrend = slaCompliantRate - historicalSlaRate;

  // Recent Applicants
  const recentApplicants = [...displayCandidates]
    .sort((a, b) => new Date(b.tanggalApplied).getTime() - new Date(a.tanggalApplied).getTime())
    .slice(0, 5);

  // --- NEW: COST HIRING PER DEPARTMENT CALCULATION ---
  const costHiringData = useMemo(() => {
    // Group budgets by department for selected year
    const deptBudgets = settings.budgetCostHiring
      .filter(b => b.year === filterYear)
      .reduce((acc, curr) => {
        acc[curr.department] = curr.budget;
        return acc;
      }, {} as Record<string, number>);

    // Calculate actual spending per department (sum of expectedSalary for hired candidates in that dept)
    const deptActual = candidates
      .filter(c => c.tahapProses === 'hired' && c.tanggalHired)
      .filter(c => {
        const hireYear = new Date(c.tanggalHired).getFullYear();
        return hireYear === filterYear;
      })
      .reduce((acc, curr) => {
        // Simple matching: check if job title contains dept name or vice versa
        const matchedDept = Object.keys(deptBudgets).find(dept => 
          curr.posisiDilamar.toLowerCase().includes(dept.toLowerCase()) || 
          dept.toLowerCase().includes(curr.posisiDilamar.toLowerCase())
        );
        
        if (matchedDept) {
          acc[matchedDept] = (acc[matchedDept] || 0) + (curr.expectedSalary || 0);
        }
        return acc;
      }, {} as Record<string, number>);

    // Combine into array for chart
    return Object.keys(deptBudgets).map(dept => ({
      department: dept,
      budget: deptBudgets[dept] || 0,
      actual: deptActual[dept] || 0,
      remaining: (deptBudgets[dept] || 0) - (deptActual[dept] || 0)
    })).sort((a, b) => b.budget - a.budget); // Sort by budget desc
  }, [settings.budgetCostHiring, candidates, filterYear]);

  return (
    <div className="space-y-6">

      {/* Top Welcome & Filter controls */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-md space-y-4">
        {/* Row 1: Welcome + Period Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">Selamat Datang Kembali, Team Rekrutmen!</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">Analisis performa, SLA rekrutmen, dan funnel pelamar secara real-time.</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 self-start lg:self-auto bg-slate-800 p-1.5 rounded-lg border border-slate-700 overflow-x-auto shrink-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold px-2 whitespace-nowrap">Periode:</span>
            {(['month', '6months', 'annual'] as const).map((range) => (
              <button
                key={range}
                onClick={() => { setFilterRange(range); setFilterQuarters([]); }}
                className={`px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  filterRange === range && filterQuarters.length === 0 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === 'month' ? 'Bulan Ini' : range === '6months' ? '6 Bulan' : 'Tahunan'}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Year Dropdown + Quarter Checkboxes */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-800">
          {/* Year Dropdown */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold whitespace-nowrap">Tahun:</span>
            <select
              value={filterYear}
              onChange={(e) => { setFilterYear(Number(e.target.value)); setFilterQuarters([]); }}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value={0}>Semua Tahun</option>
              {allYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-700 shrink-0" />

          {/* Quarter Checkboxes */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold whitespace-nowrap">Kuartal:</span>
            {[
              { q: 1, label: 'Q1', desc: 'Jan–Mar' },
              { q: 2, label: 'Q2', desc: 'Apr–Jun' },
              { q: 3, label: 'Q3', desc: 'Jul–Sep' },
              { q: 4,  label: 'Q4', desc: 'Okt–Des' },
            ].map(({ q, label, desc }) => {
              const isActive = filterQuarters.includes(q);
              return (
                <button
                  key={q}
                  onClick={() => toggleQuarter(q)}
                  title={desc}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 flex items-center justify-center rounded border text-[8px] font-black shrink-0 ${
                    isActive ? 'bg-white/20 border-white/40 text-white'  : 'border-slate-600'
                  }`}>
                    {isActive ? '✓' : ''}
                  </span>
                  {label}
                  <span className={`hidden sm:inline text-[9px] font-medium ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {desc}
                  </span>
                </button>
              );
            })}
            {filterQuarters.length > 0 && (
              <button
                onClick={() => setFilterQuarters([])}
                className="text-[10px] text-slate-500 hover:text-rose-400 font-bold transition-colors underline underline-offset-2"
              >
                Reset Q
              </button>
            )}
          </div>

          {/* Active filter summary badge */}
          {(filterYear !== 0 || filterQuarters.length > 0) && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {filterYear !== 0 ? `${filterYear}` : ''}{filterQuarters.length > 0 ? ` · ${filterQuarters.map(q => `Q${q}`).join(', ')}` : ''}
              </span>
              <button
                onClick={() => { setFilterYear(nowDate.getFullYear()); setFilterQuarters([]); }}
                className="text-[9px] text-slate-500 hover:text-slate-300 font-bold transition-colors underline underline-offset-2"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6 Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { title: "Total Pelamar", count: totalApplicantsCount, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { title: "Lowongan Aktif", count: activeJobsCount, icon: Briefcase, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { title: "Kandidat Interview", count: interviewCount, icon: UserCheck, color: "text-purple-600 bg-purple-50 border-purple-100" },
          { title: "Medical Check", count: medicalCount, icon: Stethoscope, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { title: "Offering Letter", count: offeringCount, icon: FileCheck, color: "text-teal-600 bg-teal-50 border-teal-100" },
          { title: "Total Hired", count: hiredCount, icon: Award, color: "text-emerald-600 bg-emerald-50 border-emerald-100" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-3 sm:p-4 bg-white rounded-xl border flex items-center justify-between gap-2 shadow-sm hover:shadow transition-shadow ${card.color}`}>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">{card.title}</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight block mt-1">{card.count}</span>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-white shadow-sm border border-slate-100 shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 SLA Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {/* SLA Compliant */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-400 block">SLA Compliant Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-800">{slaCompliantRate}%</span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${slaTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className={`w-3.5 h-3.5 ${slaTrend < 0 ? 'rotate-180' : ''}`} /> {slaTrend >= 0 ? '+' : ''}{slaTrend.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total tahapan proses yang memenuhi target waktu.</p>
          </div>
        </div>

        {/* Rata-rata Hired */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-400 block">Rata-rata Waktu Hired (SLA)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-800">{averageDaysToHire} Hari</span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${averageDaysToHire <= averageTargetSla ? 'text-emerald-600' : 'text-amber-600'}`}>
                {averageDaysToHire <= averageTargetSla ? '✓ On Track' : `⚠ Max ${Math.round(averageTargetSla)} Hari`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Rata-rata waktu proses apply hingga tanda tangan kontrak.</p>
          </div>
        </div>

        {/* Target SLA */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3 sm:p-4 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <CalendarClock className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-400 block">Target SLA Terpenuhi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-800">{targetSlaPercent}%</span>
              <span className={`text-xs font-bold ${targetSlaPercent >= slaGoalPercent ? 'text-emerald-600' : 'text-amber-600'}`}>
                Goal: {slaGoalPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Target kumulatif kepatuhan SLA yang ditetapkan Management.</p>
          </div>
        </div>
      </div>

      {/* --- NEW SECTION: COST HIRING PER DEPARTMENT --- */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Cost Hiring per Departemen</h3>
            <p className="text-slate-400 text-[11px] sm:text-xs">Perbandingan budget alokasi vs pengeluaran riil ({filterYear})</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
              <CheckCircle className="w-2.5 h-2.5" /> {filterYear}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {costHiringData.length > 0 ? costHiringData.map((item, idx) => {
            const percentUsed = item.budget > 0 ? Math.min(100, Math.round((item.actual / item.budget) * 100)) : 0;
            const isOverBudget = item.actual > item.budget;
            
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.department}</span>
                  <span className={`${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Real: Rp {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.actual)} | Budg: Rp {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.budget)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percentUsed}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{percentUsed}% digunakan</span>
                  <span>Sisa: Rp {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.remaining)}</span>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              Belum ada data budget untuk tahun {filterYear}. Silakan konfigurasi di menu Settings.
            </div>
          )}
        </div>
      </div>

      {/* Recruitment Visualizations - Original Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lowongans vs Hired per Department */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Lowongan vs Hired per Departemen</h3>
              <p className="text-slate-400 text-[11px] sm:text-xs">Perbandingan posisi dibuka dan kandidat yang berhasil direkrut</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
              <CheckCircle className="w-2.5 h-2.5" /> {filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan'}
            </span>
          </div>
          <div className="h-[300px] flex items-end justify-around gap-2 pt-4 pb-2">
            {/* Mock Data Visualization - Replace with real chart library later */}
            {['Technology', 'Human Resources', 'Product Design', 'Marketing', 'Finance'].map((dept, i) => {
              const openJobs = filteredJobs.filter(j => j.department === dept && j.status === 'Aktif').length;
              const hiredCands = displayCandidates.filter(c => c.posisiDilamar.includes(dept) && c.tahapProses === 'hired').length;
              const maxVal = Math.max(openJobs, hiredCands, 1);
              
              return (
                <div key={dept} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex items-end gap-1 h-[200px] w-full justify-center">
                    <div 
                      className="w-3 bg-indigo-500 rounded-t-sm"
                      style={{ height: `${(openJobs / maxVal) * 100}%` }}
                      title={`Lowongan: ${openJobs}`}
                    ></div>
                    <div 
                      className="w-3 bg-emerald-500 rounded-t-sm"
                      style={{ height: `${(hiredCands / maxVal) * 100}%` }}
                      title={`Hired: ${hiredCands}`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[80px]">{dept}</span>
                  <span className="text-[9px] text-slate-400">{openJobs}/{hiredCands}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tren Lowongan vs Rekrutmen */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Tren Lowongan vs Rekrutmen</h3>
              <p className="text-slate-400 text-[11px] sm:text-xs">Statistik postingan lowongan vs rekrutan sukses</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
              <CheckCircle className="w-2.5 h-2.5" /> {filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan'}
            </span>
          </div>
          <div className="h-[300px] flex items-end justify-around gap-2 pt-4 pb-2">
            {/* Mock Monthly Data - Replace with real time-series data */}
            {['Des \'25', 'Jan \'26', 'Feb \'26', 'Mar \'26', 'Apr \'26', 'Mei \'26'].map((month, i) => {
              const newJobs = Math.floor(Math.random() * 5); // Mock data
              const newHires = Math.floor(Math.random() * 3); // Mock data
              const maxVal = Math.max(newJobs, newHires, 1);
              
              return (
                <div key={month} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex items-end gap-1 h-[200px] w-full justify-center">
                    <div 
                      className="w-3 bg-blue-500 rounded-t-sm"
                      style={{ height: `${(newJobs / maxVal) * 100}%` }}
                      title={`Lowongan Baru: ${newJobs}`}
                    ></div>
                    <div 
                      className="w-3 bg-purple-500 rounded-t-sm"
                      style={{ height: `${(newHires / maxVal) * 100}%` }}
                      title={`Kandidat Hired: ${newHires}`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600">{month}</span>
                  <span className="text-[9px] text-slate-400">L{newJobs} H{newHires}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pipeline Tahap Rekrutmen & Cost Hiring Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Tahap Rekrutmen */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Pipeline Tahap Rekrutmen</h3>
              <p className="text-slate-400 text-[11px] sm:text-xs">Volume kandidat aktif di setiap fase rekrutmen</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
              <CheckCircle className="w-2.5 h-2.5" /> {filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan'}
            </span>
          </div>
          <div className="space-y-3">
            {['Applied', 'Screening', 'Interview', 'Assessment', 'Medical Check', 'Offering', 'Hired', 'Rejected'].map((stage, i) => {
              const count = displayCandidates.filter(c => c.tahapProses.toLowerCase() === stage.toLowerCase()).length;
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-teal-500', 'bg-emerald-500', 'bg-rose-500'];
              const maxCount = Math.max(...['Applied', 'Screening', 'Interview', 'Assessment', 'Medical Check', 'Offering', 'Hired', 'Rejected'].map(s => 
                displayCandidates.filter(c => c.tahapProses.toLowerCase() === s.toLowerCase()).length
              ), 1);
              
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{stage}</span>
                    <span className="text-slate-500">{count} Kandidat</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${colors[i]}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Hiring per Departemen - Already added above, but keeping placeholder for layout consistency */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Cost Hiring per Departemen</h3>
              <p className="text-slate-400 text-[11px] sm:text-xs">Perbandingan budget alokasi vs pengeluaran riil</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
              <CheckCircle className="w-2.5 h-2.5" /> {filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan'}
            </span>
          </div>
          <div className="space-y-4">
            {costHiringData.slice(0, 5).map((item, idx) => { // Show top 5 departments
              const percentUsed = item.budget > 0 ? Math.min(100, Math.round((item.actual / item.budget) * 100)) : 0;
              const isOverBudget = item.actual > item.budget;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.department}</span>
                    <span className={`${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Real: Rp {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.actual)} | Budg: Rp {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.budget)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentUsed}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{percentUsed}% digunakan</span>
                    <span>Sisa: Rp {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(item.remaining)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SLA Detail Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Detail Kepatuhan SLA Rekrutmen</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
                <CheckCircle className="w-2.5 h-2.5" /> {filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs">Evaluasi waktu proses kandidat pada masing-masing tahapan (berdasarkan filter aktif)</p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
            Realtime SLA Tracker
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <th className="p-4">TAHAPAN REKRUTMEN</th>
                <th className="p-4">TARGET SLA</th>
                <th className="p-4">TOTAL KANDIDAT</th>
                <th className="p-4">COMPLIANT (≤ SLA)</th>
                <th className="p-4">VIOLATION (&gt; SLA)</th>
                <th className="p-4">COMPLIANT RATE</th>
                <th className="p-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {slaTableData.map((row, index) => {
                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'OPTIMAL':
                      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-md text-[10px]">OPTIMAL</span>;
                    case 'WARNING':
                      return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold rounded-md text-[10px]">WARNING</span>;
                    default:
                      return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-extrabold rounded-md text-[10px]">CRITICAL</span>;
                  }
                };

                return (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{row.stage}</td>
                    <td className="p-4 font-semibold text-slate-600">{row.targetDays} Hari</td>
                    <td className="p-4 text-slate-600">{row.candidates} Orang</td>
                    <td className="p-4 text-emerald-600 font-medium">✓ {row.compliant}</td>
                    <td className="p-4 text-rose-600 font-medium">✗ {row.violation}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-9">{row.rate}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div 
                            className={`h-full rounded-full ${
                              row.status === 'OPTIMAL' ? 'bg-emerald-500' : row.status === 'WARNING' ? 'bg-amber-500' :  'bg-rose-500'
                            }`}
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(row.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Applicants */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Pelamar Terbaru Masuk</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
                <CheckCircle className="w-2.5 h-2.5" /> {filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs">Kandidat yang baru saja mensubmit aplikasi lamaran (berdasarkan filter aktif)</p>
          </div>
          <button 
            onClick={() => setActiveMenu('candidates')}
            className="self-start sm:self-auto text-[11px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 whitespace-nowrap"
          >
            Lihat Database Kandidat <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <th className="p-4">ID / NAMA</th>
                <th className="p-4">POSISI DILAMAR</th>
                <th className="p-4">PENDIDIKAN</th>
                <th className="p-4">ATS MATCH</th>
                <th className="p-4">TANGGAL APPLY</th>
                <th className="p-4">STATUS PROSES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentApplicants.map((cand) => {
                const getStatusBadge = (tahap: string) => {
                  const colors: Record<string, string> = {
                    applied: 'bg-blue-100 text-blue-800',
                    screening: 'bg-indigo-100 text-indigo-800',
                    interview: 'bg-purple-100 text-purple-800',
                     assessment: 'bg-pink-100 text-pink-800',
                    medical: 'bg-amber-100 text-amber-800',
                    offering: 'bg-teal-100 text-teal-800',
                     hired: 'bg-emerald-100 text-emerald-800',
                    rejected: 'bg-rose-100 text-rose-800'
                  };
                  return (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${colors[tahap] || 'bg-slate-100 text-slate-800'}`}>
                      {tahap === 'medical' ? 'Medical Check' : tahap}
                    </span>
                  );
                };

                const getMatchBadge = (rating: number) => {
                  if (rating >= 85) return <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{rating}% Fit</span>;
                  if (rating >= 70) return <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{rating}% Match</span>;
                  return <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{rating}% Low</span>;
                };

                return (
                  <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{cand.nama}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{cand.id}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{cand.posisiDilamar}</td>
                    <td className="p-4 text-slate-500">{cand.pendidikan} - {cand.jurusan}</td>
                    <td className="p-4">{getMatchBadge(cand.ratingKecocokan)}</td>
                    <td className="p-4 font-semibold text-slate-600">{cand.tanggalApplied}</td>
                    <td className="p-4">{getStatusBadge(cand.tahapProses)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
