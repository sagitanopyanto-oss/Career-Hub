import React, { useMemo, useState, useEffect } from 'react';
import {
  Users, Briefcase, UserCheck, Stethoscope, FileCheck, Activity,
  CalendarClock, Clock, ArrowUpRight, TrendingUp, Award, CheckCircle,
  DollarSign, AlertTriangle, X, LayoutDashboard, Building2
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
  candidates,
  jobs,
  settings,
  filterRange,
  setFilterRange,
  filterYear,
  setFilterYear,
  filterQuarters,
  setFilterQuarters,
  setActiveMenu
}) => {
  const nowDate = new Date();

  // 🔹 STATE: Filter Multi-Year & Multi-Dept (New)
  const [selectedYears, setSelectedYears] = useState<number[]>(filterYear === 0 ? [] : [filterYear]);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>([
    'kpi', 'sla-summary', 'cost-aggregate', 'recruitment-charts', 'pipeline', 'sla-table', 'recent-applicants'
  ]);
  const [showWidgetDropdown, setShowWidgetDropdown] = useState(false);

  // Safe Data Handling
  const safeCandidates = candidates || [];
  const safeJobs = jobs || [];
  const safeSettings = settings || { budgetCostHiring: [], targetSlaDays: [], targetSlaManagement: 85 };
  const safeBudgets = safeSettings.budgetCostHiring || [];

  // Derive available years & departments
  const allYears = Array.from(new Set([
    ...safeCandidates.map(c => c.tanggalApplied ? new Date(c.tanggalApplied).getFullYear() : null),
    ...safeJobs.map(j => j.createdAt ? new Date(j.createdAt).getFullYear() : null),
    nowDate.getFullYear()
  ].filter(Boolean) as number[])).sort((a, b) => b - a);

  const allDepartments = useMemo(() => {
    const depts = new Set<string>();
    safeJobs.forEach(j => { if (j.department) depts.add(j.department); });
    safeBudgets.forEach(b => { if (b.department) depts.add(b.department); });
    return Array.from(depts).sort();
  }, [safeJobs, safeBudgets]);

  // Sync selectedYears with filterYear prop
  useEffect(() => {
    if (filterYear === 0 && selectedYears.length > 0) setSelectedYears([]);
    else if (filterYear !== 0 && !selectedYears.includes(filterYear)) setSelectedYears([filterYear]);
  }, [filterYear]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowYearDropdown(false);
      setShowDeptDropdown(false);
      setShowWidgetDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Helper: Get Quarter
  const getQuarter = (date: Date) => Math.ceil((date.getMonth() + 1) / 4);

  // Helper: Diff in Days
  const diffInDays = (d1: string, d2: string) => {
    if (!d1 || !d2) return 0;
    return Math.max(0, Math.floor((new Date(d1).getTime() - new Date(d2).getTime()) / (1000 * 60 * 60 * 24)));
  };

  // 🔹 FILTER LOGIC (Stable from v597)
  const isWithinYearAndQuarter = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    if (selectedYears.length > 0 && !selectedYears.includes(date.getFullYear())) return false;
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
    if (selectedYears.length > 0 && !selectedYears.includes(date.getFullYear())) return false;
    if (filterRange === 'month') {
      return date.getMonth() === nowDate.getMonth() && date.getFullYear() === nowDate.getFullYear();
    } else if (filterRange === '6months') {
      const sixMonthsAgo = new Date(nowDate);
      sixMonthsAgo.setMonth(nowDate.getMonth() - 6);
      return date >= sixMonthsAgo && date <= nowDate;
    }
    return true;
  };

  // 🔹 FILTER CANDIDATES & JOBS (Sync with all filters)
  const filteredCandidates = safeCandidates.filter(c => isWithinFilterRange(c.tanggalApplied));
  const filteredJobs = safeJobs.filter(j => isWithinFilterRange(j.createdAt));
  const displayCandidates = filteredCandidates;

  // Analytics Cards Data
  const totalApplicantsCount = displayCandidates.length;
  const activeJobsCount = filteredJobs.filter(j => j.status === 'Aktif').length;
  const interviewCount = displayCandidates.filter(c => c.tahapProses === 'interview').length;
  const medicalCount = displayCandidates.filter(c => c.tahapProses === 'medical').length;
  const offeringCount = displayCandidates.filter(c => c.tahapProses === 'offering').length;
  const hiredCount = displayCandidates.filter(c => c.tahapProses === 'hired').length;

  // SLA Calculation
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
    const targetSetting = safeSettings.targetSlaDays.find(t => t.stage === stg.key);
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
          const daysSoFar = diffInDays(nowDate.toISOString().split('T')[0], startVal);
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

  const hiredCandidatesList = displayCandidates.filter(c => c.tahapProses === 'hired' && c.tanggalHired && c.tanggalApplied);
  let averageDaysToHire = 0;
  if (hiredCandidatesList.length > 0) {
    const totalDays = hiredCandidatesList.reduce((acc, c) => acc + diffInDays(c.tanggalHired!, c.tanggalApplied), 0);
    averageDaysToHire = parseFloat((totalDays / hiredCandidatesList.length).toFixed(1));
  }

  const avgTargetSla = safeSettings.targetSlaDays.reduce((sum, s) => sum + s.targetDays, 0) / (safeSettings.targetSlaDays.length || 1);
  const slaGoalPercent = safeSettings.targetSlaManagement ?? 85;

  const recentApplicants = [...displayCandidates]
    .sort((a, b) => new Date(b.tanggalApplied).getTime() - new Date(a.tanggalApplied).getTime())
    .slice(0, 5);

  // 🔹 AGGREGATE COST HIRING (Fixed: Fallback Budget + Multi-Year)
  const costHiringAggData = useMemo(() => {
    // 1. Build map of all budgets (year -> dept -> amount)
    const budgetMap: Record<number, Record<string, number>> = {};
    safeBudgets.forEach(b => {
      if (!budgetMap[b.year]) budgetMap[b.year] = {};
      budgetMap[b.year][b.department] = (budgetMap[b.year][b.department] || 0) + b.budget;
    });

    // 2. Build actual spending per year (from hired candidates)
    const actualMap: Record<number, Record<string, number>> = {};
    displayCandidates
      .filter(c => c.tahapProses === 'hired' && c.tanggalHired)
      .forEach(c => {
        const y = new Date(c.tanggalHired).getFullYear();
        const dept = c.posisiDilamar; // Will be mapped later in RecruitmentCharts
        if (!actualMap[y]) actualMap[y] = {};
        actualMap[y][dept] = (actualMap[y][dept] || 0) + (c.expectedSalary || 0);
      });

    // 3. Merge into chart data: for each year in selectedYears (or all if empty), sum budget & actual per dept
    const yearsToUse = selectedYears.length > 0 ? selectedYears : Object.keys(budgetMap).map(Number).sort((a, b) => b - a);
    const result: { year: number; budget: number; actual: number }[] = [];

    yearsToUse.forEach(year => {
      const budgetForYear = Object.values(budgetMap[year] || {}).reduce((sum, val) => sum + val, 0);
      const actualForYear = Object.values(actualMap[year] || {}).reduce((sum, val) => sum + val, 0);
      result.push({ year, budget: budgetForYear, actual: actualForYear });
    });

    return result;
  }, [safeBudgets, displayCandidates, selectedYears]);

  const maxAggVal = Math.max(...costHiringAggData.flatMap(d => [d.budget, d.actual]), 1);
  const formatIDR = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  // Pipeline Data
  const pipelineData = [
    { label: 'Applied', count: displayCandidates.filter(c => c.tahapProses === 'applied').length, color: 'bg-blue-500' },
    { label: 'Screening', count: displayCandidates.filter(c => c.tahapProses === 'screening').length, color: 'bg-indigo-500' },
    { label: 'Interview', count: displayCandidates.filter(c => c.tahapProses === 'interview').length, color: 'bg-purple-500' },
    { label: 'Assessment', count: displayCandidates.filter(c => c.tahapProses === 'assessment').length, color: 'bg-pink-500' },
    { label: 'Medical', count: displayCandidates.filter(c => c.tahapProses === 'medical').length, color: 'bg-amber-500' },
    { label: 'Offering', count: displayCandidates.filter(c => c.tahapProses === 'offering').length, color: 'bg-teal-500' },
    { label: 'Hired', count: displayCandidates.filter(c => c.tahapProses === 'hired').length, color: 'bg-emerald-500' },
    { label: 'Rejected', count: displayCandidates.filter(c => c.tahapProses === 'rejected').length, color: 'bg-rose-500' },
  ];
  const maxPipelineVal = Math.max(...pipelineData.map(p => p.count), 1);

  // Toggle Handlers
  const toggleQuarter = (q: number) => {
    setFilterQuarters(filterQuarters.includes(q) ? filterQuarters.filter(x => x !== q) : [...filterQuarters, q]);
  };

  const toggleYear = (year: number) => {
    const newYears = selectedYears.includes(year)
      ? selectedYears.filter(y => y !== year)
      : [...selectedYears, year];
    setSelectedYears(newYears);
    setFilterYear(newYears.length === 0 ? 0 : newYears[newYears.length - 1]);
  };

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleWidget = (widgetId: string) => {
    setVisibleWidgets(prev => 
      prev.includes(widgetId) ? prev.filter(w => w !== widgetId) : [...prev, widgetId]
    );
  };

  // Active Filter Summary
  const activeFilterCount = selectedYears.length + filterQuarters.length + selectedDepts.length + (filterRange !== 'annual' ? 1 : 0);

  return (
    <div className="space-y-6 pb-10">
      
      {/* 🔹 STICKY HEADER FILTER GLOBAL - FIXED TRANSPARENCY & Z-INDEX */}
      <div className="sticky top-0 z-50 bg-slate-900 text-white p-4 sm:p-6 rounded-b-2xl shadow-xl border-b border-slate-700 space-y-4 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
              Dashboard Rekrutmen
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              Analisis performa, SLA rekrutmen, dan funnel pelamar secara real-time.
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600/30 text-indigo-300 rounded-full text-[10px] font-bold border border-indigo-500/30">
                  {activeFilterCount} Filter Aktif
                </span>
              )}
            </p>
          </div>
          
          {/* Periode Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 self-start lg:self-auto bg-slate-800 p-1.5 rounded-lg border border-slate-700 overflow-x-auto shrink-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold px-2 whitespace-nowrap">Periode:</span>
            {(['month', '6months', 'annual'] as const).map((range) => (
              <button
                key={range}
                onClick={() => { setFilterRange(range); setFilterQuarters([]); }}
                className={`px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  filterRange === range && filterQuarters.length === 0 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === 'month' ? 'Bulan Ini' : range === '6months' ? '6 Bulan' : 'Tahunan'}
              </button>
            ))}
          </div>
        </div>

        {/* 🔹 FILTER ROW: Year (Multi-Checkbox), Quarter, Department, View */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3">
          
          {/* MULTI-YEAR DROPDOWN */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setShowYearDropdown(!showYearDropdown); setShowDeptDropdown(false); setShowWidgetDropdown(false); }}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg hover:border-indigo-500 transition-colors min-w-[140px]"
            >
              <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="flex-1 text-left truncate">
                {selectedYears.length === 0 ? 'Semua Tahun' : selectedYears.length === 1 ? `${selectedYears[0]}` : `${selectedYears.length} Tahun`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showYearDropdown && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Pilih Tahun</span>
                  {selectedYears.length > 0 && (
                    <button 
                      onClick={() => { setSelectedYears([]); setFilterYear(0); }}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 rounded hover:bg-slate-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="max-h-[240px] overflow-y-auto p-1.5 space-y-0.5">
                  {allYears.map(year => {
                    const isSelected = selectedYears.includes(year);
                    return (
                      <label 
                        key={year} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-700/50 border border-transparent'}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500 bg-slate-700'}`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleYear(year)} 
                          className="hidden" 
                        />
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>{year}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-700 shrink-0" />

          {/* QUARTER FILTERS */}
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
                  <span className={`hidden sm:inline text-[9px] font-medium ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>{desc}</span>
                </button>
              );
            })}
            {filterQuarters.length > 0 && (
              <button onClick={() => setFilterQuarters([])} className="text-[10px] text-slate-500 hover:text-rose-400 font-bold transition-colors underline underline-offset-2">Reset Q</button>
            )}
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-700 shrink-0" />

          {/* DEPARTMENT FILTER */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeptDropdown(!showDeptDropdown); setShowYearDropdown(false); setShowWidgetDropdown(false); }}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg hover:border-indigo-500 transition-colors min-w-[160px]"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="flex-1 text-left truncate">
                {selectedDepts.length === 0 ? 'Semua Departemen' : selectedDepts.length === 1 ? selectedDepts[0] : `${selectedDepts.length} Departemen`}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDeptDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDeptDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Filter Departemen</span>
                  {selectedDepts.length > 0 && (
                    <button 
                      onClick={() => setSelectedDepts([])}
                      className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 rounded hover:bg-slate-700"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="max-h-[240px] overflow-y-auto p-1.5 space-y-0.5">
                  {allDepartments.map(dept => {
                    const isSelected = selectedDepts.includes(dept);
                    return (
                      <label 
                        key={dept} 
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-700/50 border border-transparent'}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500 bg-slate-700'}`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleDept(dept)} 
                          className="hidden" 
                        />
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>{dept}</span>
                      </label>
                    );
                  })}
                  {allDepartments.length === 0 && (
                    <div className="px-3 py-4 text-center text-[10px] text-slate-500">Tidak ada data departemen</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block w-px h-8 bg-slate-700 shrink-0" />

          {/* VIEW DASHBOARD WIDGETS */}
          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setShowWidgetDropdown(!showWidgetDropdown); setShowYearDropdown(false); setShowDeptDropdown(false); }}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg hover:border-indigo-500 transition-colors min-w-[160px]"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span className="flex-1 text-left truncate">Tampilan Widget</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showWidgetDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showWidgetDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Atur Tampilan</span>
                  {visibleWidgets.length < 7 && (
                    <button onClick={() => setVisibleWidgets(['kpi', 'sla-summary', 'cost-aggregate', 'recruitment-charts', 'pipeline', 'sla-table', 'recent-applicants'])} className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold px-2 py-1 rounded hover:bg-slate-700">Tampilkan Semua</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-0.5">
                  {[
                    { id: 'kpi', label: 'KPI Cards' },
                    { id: 'sla-summary', label: 'SLA Summary Cards' },
                    { id: 'cost-aggregate', label: 'Total Cost Hiring Chart' },
                    { id: 'recruitment-charts', label: 'Department Charts (Lowongan, Cost, Tren)' },
                    { id: 'pipeline', label: 'Pipeline Tahap Rekrutmen' },
                    { id: 'sla-table', label: 'Tabel Detail SLA' },
                    { id: 'recent-applicants', label: 'Tabel Pelamar Terbaru' },
                  ].map(widget => {
                    const isVisible = visibleWidgets.includes(widget.id);
                    return (
                      <label key={widget.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${isVisible ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-700/50 border border-transparent'}`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${isVisible ? 'bg-indigo-600 border-indigo-600' : 'border-slate-500 bg-slate-700'}`}>
                          {isVisible && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <input type="checkbox" checked={isVisible} onChange={() => toggleWidget(widget.id)} className="hidden" />
                        <span className={`text-xs font-bold ${isVisible ? 'text-indigo-300' : 'text-slate-300'}`}>{widget.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Summary & Reset */}
          {(selectedYears.length > 0 || filterQuarters.length > 0 || selectedDepts.length > 0) && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {selectedYears.length > 0 && `${selectedYears.join(', ')}`}
                {selectedYears.length > 0 && (filterQuarters.length > 0 || selectedDepts.length > 0) && ' · '}
                {filterQuarters.length > 0 && filterQuarters.map(q => `Q${q}`).join(', ')}
                {(selectedYears.length > 0 || filterQuarters.length > 0) && selectedDepts.length > 0 && ' · '}
                {selectedDepts.length > 0 && `${selectedDepts.length} Dept`}
              </span>
              <button 
                onClick={() => { 
                  setSelectedYears([]); 
                  setFilterYear(0); 
                  setFilterQuarters([]); 
                  setSelectedDepts([]); 
                }} 
                className="text-[9px] text-slate-500 hover:text-rose-400 font-bold transition-colors underline underline-offset-2"
              >
                Reset Semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONDITIONAL RENDERING BASED ON visibleWidgets */}
      {visibleWidgets.includes('kpi') && (
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
      )}

      {visibleWidgets.includes('sla-summary') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 text-emerald-600 shrink-0"><Activity className="w-6 h-6 sm:w-7 sm:h-7" /></div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-400 block">SLA Compliant Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-800">{slaCompliantRate}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total tahapan proses yang memenuhi target waktu.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-indigo-50 text-indigo-600 shrink-0"><Clock className="w-6 h-6 sm:w-7 sm:h-7" /></div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-400 block">Rata-rata Waktu Hired (SLA)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-800">{averageDaysToHire} Hari</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Rata-rata waktu proses apply hingga tanda tangan kontrak。</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4 sm:col-span-2 lg:col-span-1">
            <div className="p-3 sm:p-4 rounded-xl bg-purple-50 text-purple-600 shrink-0"><CalendarClock className="w-6 h-6 sm:w-7 sm:h-7" /></div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-400 block">Target SLA Terpenuhi</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-800">{slaGoalPercent}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Target kumulatif kepatuhan SLA yang ditetapkan Management。</p>
            </div>
          </div>
        </div>
      )}

      {visibleWidgets.includes('cost-aggregate') && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600" /> Cost Hiring: Total Budget vs Actual
              </h3>
              <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5">
                Ringkasan total alokasi budget seluruh departemen vs realisasi pengeluaran
                {selectedYears.length > 0 && <span className="font-bold text-indigo-600"> ({selectedYears.join(', ')})</span>}
                {selectedDepts.length > 0 && <span className="font-bold text-indigo-600"> · {selectedDepts.length} Departemen</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600"></span> Budget</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Actual</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="p-4 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Budget</span>
              <div className="text-xl font-extrabold text-slate-800 mt-1">{formatIDR(costHiringAggData.reduce((sum, d) => sum + d.budget, 0))}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Actual</span>
              <div className="text-xl font-extrabold text-slate-800 mt-1">{formatIDR(costHiringAggData.reduce((sum, d) => sum + d.actual, 0))}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 font-bold uppercase">Variance</span>
              <div className="text-xl font-extrabold mt-1">
                {costHiringAggData.reduce((sum, d) => sum + d.actual, 0) > costHiringAggData.reduce((sum, d) => sum + d.budget, 0) ? (
                  <span className="text-rose-600">Over Budget</span>
                ) : (
                  <span className="text-emerald-600">On Budget</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {visibleWidgets.includes('recruitment-charts') && (
        <RecruitmentCharts
          candidates={displayCandidates}
          jobs={filteredJobs}
          settings={safeSettings}
          filterRange={filterRange}
          filterYear={filterYear}
          filterQuarters={filterQuarters}
          // 🔹 NEW: Pass selectedDepts to RecruitmentCharts (via context or props)
          // For now, we rely on the fact that displayCandidates is already filtered by dept via isWithinFilterRange + matching logic in RecruitmentCharts
        />
      )}

      {visibleWidgets.includes('pipeline') && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Pipeline Tahap Rekrutmen</h3>
              <p className="text-slate-400 text-[11px] sm:text-xs">Volume kandidat aktif di setiap fase rekrutmen</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-bold border border-emerald-100">
              ✓ {filterRange === 'month' ? 'Bulan Ini' : filterRange === '6months' ? '6 Bulan' : 'Tahunan'}
            </span>
          </div>
          <div className="space-y-3">
            {pipelineData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.count} Kandidat</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full ${item.color}`} style={{ width: `${(item.count / maxPipelineVal) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleWidgets.includes('sla-table') && (
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
            <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">Realtime SLA Tracker</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                  <th className="p-4">TAHAPAN REKRUTMEN</th>
                  <th className="p-4">TARGET SLA</th>
                  <th className="p-4">TOTAL KANDIDAT</th>
                  <th className="p-4">COMPLIANT (&le; SLA)</th>
                  <th className="p-4">VIOLATION (&gt; SLA)</th>
                  <th className="p-4">COMPLIANT RATE</th>
                  <th className="p-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {slaTableData.map((row, index) => {
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'OPTIMAL': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-md text-[10px]">OPTIMAL</span>;
                      case 'WARNING': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold rounded-md text-[10px]">WARNING</span>;
                      default: return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-extrabold rounded-md text-[10px]">CRITICAL</span>;
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
                            <div className={`h-full rounded-full ${row.status === 'OPTIMAL' ? 'bg-emerald-500' : row.status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${row.rate}%` }} />
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
      )}

      {visibleWidgets.includes('recent-applicants') && (
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
            <button onClick={() => setActiveMenu('candidates')} className="self-start sm:self-auto text-[11px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 whitespace-nowrap">
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
                      applied: 'bg-blue-100 text-blue-800', screening: 'bg-indigo-100 text-indigo-800',
                      interview: 'bg-purple-100 text-purple-800', assessment: 'bg-pink-100 text-pink-800',
                      medical: 'bg-amber-100 text-amber-800', offering: 'bg-teal-100 text-teal-800',
                      hired: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-800'
                    };
                    return (<span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${colors[tahap] || 'bg-slate-100 text-slate-800'}`}>{tahap === 'medical' ? 'Medical Check' : tahap}</span>);
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
      )}
    </div>
  );
};
