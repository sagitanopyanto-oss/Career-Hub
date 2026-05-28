import React, { useMemo, useState } from 'react';
import {
  Users, Briefcase, UserCheck, Stethoscope, FileCheck, Activity,
  CalendarClock, Clock, ArrowUpRight, TrendingUp, Award, CheckCircle,
  DollarSign, AlertTriangle, X
} from 'lucide-react';
import { Candidate, Job, AppSettings } from '../data/mockData';
import { RecruitmentCharts } from './RecruitmentCharts';

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
  const [selectedDetailYear, setSelectedDetailYear] = useState<number | null>(null);

  // Derive available years from all candidate and job dates + budget settings
  const allYears = Array.from(new Set([
    ...candidates.map(c => c.tanggalApplied ? new Date(c.tanggalApplied).getFullYear() : null),
    ...jobs.map(j => j.createdAt ? new Date(j.createdAt).getFullYear() : null),
    ...settings.budgetCostHiring.map(b => b.year),
    nowDate.getFullYear()
  ].filter(Boolean) as number[])).sort((a, b) => b - a);

  // Quarter helper
  const getQuarter = (date: Date) => Math.ceil((date.getMonth() + 1) / 4);

  // Date helper
  const diffInDays = (d1: string, d2: string) => {
    const timeDiff = new Date(d1).getTime() - new Date(d2).getTime();
    return Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  };

  const isWithinYearAndQuarter = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    if (filterYear !== 0 && date.getFullYear() !== filterYear) return false;
    if (filterQuarters.length > 0) {
      const q = getQuarter(date);
      if (!filterQuarters.includes(q)) return false;
    }
    return true;
  };

  const isWithinFilterRange = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    if (filterQuarters.length > 0) return isWithinYearAndQuarter(dateStr);
    if (filterYear !== 0 && date.getFullYear() !== filterYear) return false;
    if (filterRange === 'month') {
      return date.getMonth() === nowDate.getMonth() && date.getFullYear() === nowDate.getFullYear();
    } else if (filterRange === '6months') {
      const sixMonthsAgo = new Date(nowDate);
      sixMonthsAgo.setMonth(nowDate.getMonth() - 6);
      return date >= sixMonthsAgo && date <= nowDate;
    } else {
      if (filterYear !== 0) return date.getFullYear() === filterYear;
      const oneYearAgo = new Date(nowDate);
      oneYearAgo.setFullYear(nowDate.getFullYear() - 1);
      return date >= oneYearAgo && date <= nowDate;
    }
  };

  const toggleQuarter = (q: number) => {
    setFilterQuarters(filterQuarters.includes(q) ? filterQuarters.filter(x => x !== q) : [...filterQuarters, q]);
  };

  // Filter candidates and jobs based on the selected range
  const filteredCandidates = candidates.filter(c => isWithinFilterRange(c.tanggalApplied));
  const filteredJobs = jobs.filter(j => isWithinFilterRange(j.createdAt));
  const displayCandidates = filteredCandidates;

  // --- ANALYTICS CARDS DATA ---
  const totalApplicantsCount = displayCandidates.length;
  const activeJobsCount = filteredJobs.filter(j => j.status === 'Aktif').length;
  const interviewCount = displayCandidates.filter(c => c.tahapProses === 'interview').length;
  const medicalCount = displayCandidates.filter(c => c.tahapProses === 'medical').length;
  const offeringCount = displayCandidates.filter(c => c.tahapProses === 'offering').length;
  const hiredCount = displayCandidates.filter(c => c.tahapProses === 'hired').length;

  // --- SLA TABLE CALCULATION ---
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
    let candidateCount = 0, compliantCount = 0, violationCount = 0;

    displayCandidates.forEach(c => {
      const startVal = (c as any)[stg.startKey];
      const endVal = (c as any)[stg.endKey];
      if (startVal && !isNaN(new Date(startVal).getTime())) {
        candidateCount++;
        if (endVal && !isNaN(new Date(endVal).getTime())) {
          const days = diffInDays(endVal, startVal);
          if (days <= targetDays) compliantCount++; else violationCount++;
        } else {
          const todayStr = nowDate.toISOString().split('T')[0];
          const daysSoFar = diffInDays(todayStr, startVal);
          if (daysSoFar > targetDays) violationCount++; else compliantCount++;
        }
      }
    });

    const rate = candidateCount > 0 ? Math.round((compliantCount / candidateCount) * 100) : 0;
    totalCompliant += compliantCount;
    totalViolation += violationCount;
    let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
    if (rate < 50) status = 'CRITICAL';
    else if (rate < 80) status = 'WARNING';

    return { stage: stg.label, targetDays, candidates: candidateCount, compliant: compliantCount, violation: violationCount, rate, status };
  });

  const totalSlaProcessed = totalCompliant + totalViolation;
  const slaCompliantRate = totalSlaProcessed > 0 ? Math.round((totalCompliant / totalSlaProcessed) * 100) : 0;

  const hiredCandidates = displayCandidates.filter(c =>
    c.tahapProses === 'hired' && c.tanggalHired && c.tanggalApplied &&
    !isNaN(new Date(c.tanggalHired!).getTime()) && !isNaN(new Date(c.tanggalApplied).getTime())
  );
  let averageDaysToHire = 0;
  if (hiredCandidates.length > 0) {
    const totalDays = hiredCandidates.reduce((acc, c) => acc + diffInDays(c.tanggalHired!, c.tanggalApplied), 0);
    averageDaysToHire = parseFloat((totalDays / hiredCandidates.length).toFixed(1));
  }

  const averageTargetSla = settings.targetSlaDays.length > 0
    ? settings.targetSlaDays.reduce((sum, s) => sum + s.targetDays, 0) / settings.targetSlaDays.length : 3;
  const targetSlaPercent = slaCompliantRate;
  const slaGoalPercent = settings.targetSlaManagement ?? 85;

  let allTimeCompliant = 0, allTimeViolation = 0;
  candidates.forEach(c => {
    stages.forEach(stg => {
      const startVal = (c as any)[stg.startKey];
      const endVal = (c as any)[stg.endKey];
      if (startVal && !isNaN(new Date(startVal).getTime())) {
        const targetSetting = settings.targetSlaDays.find(t => t.stage === stg.key);
        const targetDays = targetSetting ? targetSetting.targetDays : 3;
        if (endVal && !isNaN(new Date(endVal).getTime())) {
          const days = diffInDays(endVal, startVal);
          if (days <= targetDays) allTimeCompliant++; else allTimeViolation++;
        } else {
          const daysSoFar = diffInDays(nowDate.toISOString().split('T')[0], startVal);
          if (daysSoFar <= targetDays) allTimeCompliant++; else allTimeViolation++;
        }
      }
    });
  });
  const allTimeTotal = allTimeCompliant + allTimeViolation;
  const historicalSlaRate = allTimeTotal > 0 ? Math.round((allTimeCompliant / allTimeTotal) * 100) : 0;
  const slaTrend = slaCompliantRate - historicalSlaRate;

  const recentApplicants = [...displayCandidates]
    .sort((a, b) => new Date(b.tanggalApplied).getTime() - new Date(a.tanggalApplied).getTime())
    .slice(0, 5);

  // --- 🔹 COST HIRING CLUSTER BAR CHART LOGIC ---
  const costHiringData = useMemo(() => {
    // 1. Aggregate Budget from Settings per Year
    const budgetByYear = settings.budgetCostHiring.reduce((acc, item) => {
      acc[item.year] = (acc[item.year] || 0) + item.budget;
      return acc;
    }, {} as Record<number, number>);

    // 2. Calculate Actual Spending Manually from Hired Candidates per Year
    const actualByYear = candidates
      .filter(c => c.tahapProses === 'hired' && c.tanggalHired)
      .reduce((acc, c) => {
        const hireYear = new Date(c.tanggalHired!).getFullYear();
        acc[hireYear] = (acc[hireYear] || 0) + (c.expectedSalary || 0);
        return acc;
      }, {} as Record<number, number>);

    // 3. Merge into chart data array
    const years = Array.from(new Set([...Object.keys(budgetByYear), ...Object.keys(actualByYear)]))
      .map(Number)
      .sort((a, b) => a - b);

    return years.map(year => ({
      year,
      budget: budgetByYear[year] || 0,
      actual: actualByYear[year] || 0
    }));
  }, [settings.budgetCostHiring, candidates]);

  // 🔹 FILTER DATA BERDASARKAN GLOBAL FILTER YEAR
  const filteredCostData = useMemo(() => {
    if (filterYear === 0) return costHiringData; // Tampilkan semua jika "Semua Tahun"
    return costHiringData.filter(item => item.year === filterYear);
  }, [costHiringData, filterYear]);

  // ✅ PERBAIKAN KRITIS: Gunakan Math.max(1, ...) dan pastikan height minimal 2px
  const maxCostVal = Math.max(
    ...filteredCostData.map(d => Math.max(d.budget, d.actual)),
    1 // fallback safety
  );

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Debug: Log jika maxCostVal = 0 (untuk debugging di dev)
  // console.log("DEBUG: maxCostVal =", maxCostVal, "filteredCostData =", filteredCostData);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Filter controls */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-md space-y-4">
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
                className={`px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${filterRange === range && filterQuarters.length === 0 ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                {range === 'month' ? 'Bulan Ini' : range === '6months' ? '6 Bulan' : 'Tahunan'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-800">
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

          <div className="hidden sm:block w-px h-8 bg-slate-700 shrink-0" />

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold whitespace-nowrap">Kuartal:</span>
            {[
              { q: 1, label: 'Q1', desc: 'Jan–Mar' },
              { q: 2, label: 'Q2', desc: 'Apr–Jun' },
              { q: 3, label: 'Q3', desc: 'Jul–Sep' },
              { q: 4, label: 'Q4', desc: 'Okt–Des' },
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
                    isActive ? 'bg-white/20 border-white/40 text-white' : 'border-slate-600'
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
        <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-400 block">SLA Compliant Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-800">{slaCompliantRate}%</span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${slaTrend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp className={`w-3.5 h-3.5 ${slaTrend < 0 ? 'rotate-180' : ''}`} />
                {slaTrend >= 0 ? '+' : ''}{slaTrend.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total tahapan proses yang memenuhi target waktu.</p>
          </div>
        </div>

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

      {/* Recruitment Visualizations */}
      <RecruitmentCharts
        candidates={displayCandidates}
        jobs={filteredJobs}
        settings={settings}
        filterRange={filterRange}
        filterYear={filterYear}
        filterQuarters={filterQuarters}
      />

      {/* 🔹 COST HIRING CLUSTER BAR CHART SECTION - REVISED VISUAL */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" /> Cost Hiring: Budget vs Actual
            </h3>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">
              Perbandingan alokasi budget tahunan dengan realisasi pengeluaran gaji kandidat hired
              {filterYear !== 0 && <span className="font-bold text-indigo-600"> (Tahun {filterYear})</span>}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-indigo-600"></span> Budget</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500"></span> Actual</span>
          </div>
        </div>

        {filteredCostData.length > 0 ? (
          <div className="space-y-8">
            {/* CHART AREA */}
            <div className="relative h-72 w-full border-b border-l border-slate-200 pl-10 pb-2">
              {/* Y-Axis Labels & Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-2">
                {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
                  const val = maxCostVal * ratio;
                  return (
                    <div key={ratio} className="border-t border-dashed border-slate-100 w-full h-0 relative flex items-center">
                      <span className="absolute -left-10 text-[9px] text-slate-400 font-medium w-8 text-right pr-2">
                        {val >= 1000000 ? `${(val / 1000000).toFixed(0)}jt` : val.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bars Container - PERBAIKAN KRITIS: gunakan min-height dan flex-shrink: 0 */}
              <div className="absolute inset-0 flex items-end justify-around gap-2 sm:gap-4 pl-2">
                {filteredCostData.map((item) => {
                  // Ensure height is at least 2px (not 0%)
                  const scaleBase = maxCostVal === 0 ? 1 : maxCostVal;
                  const budgetHeight = Math.max((item.budget / scaleBase) * 100, 2); // ⬅️ MIN 2%
                  const actualHeight = Math.max((item.actual / scaleBase) * 100, 2); // ⬅️ MIN 2%

                  const isOver = item.actual > item.budget && item.budget > 0;

                  return (
                    <div key={item.year} className="flex flex-col items-center gap-2 group relative flex-1 max-w-[100px]">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-32 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap min-w-[180px]">
                        <div className="font-bold mb-2 text-xs border-b border-slate-600 pb-1">{item.year}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span className="text-slate-300">Budget:</span> <span className="text-right font-semibold">{formatIDR(item.budget)}</span>
                          <span className="text-slate-300">Actual:</span> <span className={`text-right font-semibold ${isOver ? 'text-rose-300' : 'text-emerald-300'}`}>{formatIDR(item.actual)}</span>
                          <span className="text-slate-300 col-span-2 border-t border-slate-600 pt-1 mt-1">Variance:</span>
                          <span className={`col-span-2 text-right font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {item.budget > 0 ? `${((item.actual - item.budget) / item.budget * 100).toFixed(1)}%` : '-'}
                          </span>
                        </div>
                      </div>

                      {/* The Bars - PERBAIKAN: tambahkan min-height dan flex-shrink: 0 */}
                      <div className="flex items-end gap-1 sm:gap-3 w-full justify-center h-full px-1">
                        {/* Budget Bar */}
                        <div className="relative flex flex-col items-center justify-end h-full w-1/2 group/bar">
                          <div
                            className="w-full max-w-[30px] sm:max-w-[40px] bg-indigo-600 rounded-t-md transition-all duration-500 hover:bg-indigo-500 relative"
                            style={{
                              height: `${budgetHeight}%`,
                              minHeight: '2px', // ⬅️ PENTING: pastikan tidak 0
                              flexShrink: 0
                            }}
                          >
                            {item.budget > 0 && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-600 whitespace-nowrap">
                                {item.budget >= 1000000 ? `${(item.budget / 1000000).toFixed(1)}jt` : item.budget.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actual Bar */}
                        <div className="relative flex flex-col items-center justify-end h-full w-1/2 group/act">
                          <div
                            className={`w-full max-w-[30px] sm:max-w-[40px] rounded-t-md transition-all duration-500 relative ${
                              isOver ? 'bg-rose-500 hover:bg-rose-400' : 'bg-emerald-500 hover:bg-emerald-400'
                            }`}
                            style={{
                              height: `${actualHeight}%`,
                              minHeight: '2px', // ⬅️ PENTING
                              flexShrink: 0
                            }}
                          >
                            {item.actual > 0 && (
                              <span className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap ${
                                isOver ? 'text-rose-600' : 'text-emerald-600'
                              }`}>
                                {item.actual >= 1000000 ? `${(item.actual / 1000000).toFixed(1)}jt` : item.actual.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* X-Axis Label */}
                      <div className="text-center mt-2">
                        <span className="text-xs font-bold text-slate-600 block">{item.year}</span>
                        <button
                          onClick={() => setSelectedDetailYear(item.year)}
                          className="text-[9px] text-indigo-600 hover:text-indigo-800 underline mt-1 hidden sm:block"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
            <DollarSign className="w-8 h-8 opacity-30" />
            <p className="text-sm font-medium">Tidak ada data cost hiring untuk tahun {filterYear === 0 ? 'yang dipilih' : filterYear}.</p>
          </div>
        )}
      </div>

      {/* 🔹 MODAL DETAIL COST HIRING (POP UP) - UNCHANGED */}
      {selectedDetailYear !== null && (() => {
        const detailItem = costHiringData.find(d => d.year === selectedDetailYear);
        if (!detailItem) return null;

        const isOver = detailItem.actual > detailItem.budget && detailItem.budget > 0;
        const variance = detailItem.budget > 0 ? ((detailItem.actual - detailItem.budget) / detailItem.budget * 100).toFixed(1) : null;

        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={() => setSelectedDetailYear(null)}>
            <div className="my-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-800">Detail Cost Hiring - {detailItem.year}</h4>
                  <p className="text-xs text-slate-400">Perbandingan alokasi budget dan realisasi pengeluaran gaji kandidat hired.</p>
                </div>
                <button onClick={() => setSelectedDetailYear(null)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Budget:</span>
                  <span className="text-sm font-bold text-slate-700">{formatIDR(detailItem.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Actual:</span>
                  <span className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>{formatIDR(detailItem.actual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Variance:</span>
                  <span className={`text-sm font-bold ${variance && Number(variance) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {variance !== null ? `${Number(variance) >= 0 ? '+' : ''}${variance}%` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Status:</span>
                  {detailItem.budget === 0 && detailItem.actual === 0 ? (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-bold">No Data</span>
                  ) : isOver ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[9px] font-bold border border-rose-100">
                      <AlertTriangle className="w-3.5 h-3.5" /> Over Budget
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold border border-emerald-100">
                      <CheckCircle className="w-3.5 h-3.5" /> On Budget
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedDetailYear(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
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
                              row.status === 'OPTIMAL' ? 'bg-emerald-500' : row.status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
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
