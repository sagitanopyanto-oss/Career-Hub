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

// Helper: Format Currency
const formatIDR = (val: number) => {
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
  return `Rp ${val.toLocaleString('id-ID')}`;
};

// Helper: Map Position to Department (Keyword Matching)
const getDepartmentFromPosition = (position: string): string => {
  const p = position.toLowerCase();
  
  // Technology Keywords
  if (p.includes('react') || p.includes('frontend') || p.includes('backend') || 
      p.includes('engineer') || p.includes('developer') || p.includes('tech') ||
      p.includes('go/') || p.includes('node') || p.includes('fullstack')) {
    return 'Technology';
  }
  
  // Human Resources Keywords
  if (p.includes('hr') || p.includes('human resource') || p.includes('recruitment') || 
      p.includes('talent') || p.includes('people') || p.includes('generalist')) {
    return 'Human Resources';
  }
  
  // Product Design Keywords
  if (p.includes('design') || p.includes('ui') || p.includes('ux') || 
      p.includes('product designer') || p.includes('creative')) {
    return 'Product Design';
  }
  
  // Marketing Keywords
  if (p.includes('marketing') || p.includes('digital') || p.includes('ads') || 
      p.includes('seo') || p.includes('content') || p.includes('brand')) {
    return 'Marketing';
  }
  
  // Finance Keywords
  if (p.includes('finance') || p.includes('accounting') || p.includes('treasury') || 
      p.includes('audit') || p.includes('tax')) {
    return 'Finance';
  }
  
  // Fallback: kembalikan string asli agar tetap bisa dicocokkan secara eksak jika perlu
  return position;
};

export const RecruitmentCharts: React.FC<RecruitmentChartsProps> = ({
  candidates, 
  jobs, 
  settings,
  filterYear
}) => {
  const nowDate = new Date();

  const getChartData = () => {
    if (!settings.budgetCostHiring) return { depts: [], costData: [] };

    // 1. Build a Map of All Budgets for Easy Lookup: { DeptName: { Year: Amount } }
    const allBudgetsMap: Record<string, Record<number, number>> = {};
    settings.budgetCostHiring.forEach(b => {
      if (!allBudgetsMap[b.department]) allBudgetsMap[b.department] = {};
      allBudgetsMap[b.department][b.year] = b.budget;
    });

    // 2. Determine Which Departments to Show
    let targetDepts = new Set<string>();
    
    // Add depts with budget in target year
    Object.keys(allBudgetsMap).forEach(dept => {
      if (filterYear === 0 || allBudgetsMap[dept][filterYear]) {
        targetDepts.add(dept);
      }
    });

    // Add depts with hires in target year (even if no budget defined)
    candidates.filter(c => c.tahapProses === 'hired' && c.tanggalHired).forEach(c => {
      const hireYear = new Date(c.tanggalHired).getFullYear();
      if (filterYear === 0 || hireYear === filterYear) {
        const dept = getDepartmentFromPosition(c.posisiDilamar);
        targetDepts.add(dept);
      }
    });

    const uniqueDepts = Array.from(targetDepts).sort();

    // 3. Calculate Data Per Department with FALLBACK LOGIC
    const costData = uniqueDepts.map(dept => {
      let budget = 0;
      let budgetSourceYear = filterYear;
      let isUsingPrevYear = false;
      let hasNoBudget = false;

      if (filterYear !== 0) {
        // Case: Specific Year Selected (e.g., 2026)
        if (allBudgetsMap[dept] && allBudgetsMap[dept][filterYear]) {
          // Budget exists for this year
          budget = allBudgetsMap[dept][filterYear];
        } else {
          // Budget MISSING for this year. Check Previous Year (2025)
          const prevYear = filterYear - 1;
          if (allBudgetsMap[dept] && allBudgetsMap[dept][prevYear]) {
            budget = allBudgetsMap[dept][prevYear];
            budgetSourceYear = prevYear;
            isUsingPrevYear = true;
          } else {
            hasNoBudget = true;
          }
        }
      } else {
        // Case: All Years Selected -> Sum all budgets for this dept
        if (allBudgetsMap[dept]) {
          budget = Object.values(allBudgetsMap[dept]).reduce((a, b) => a + b, 0);
        }
      }

      // Calculate Actual Spending
      // Only count hires that fall into the current Filter Context
      const actual = candidates
        .filter(c => 
          c.tahapProses === 'hired' &&
          c.tanggalHired &&
          (filterYear === 0 ? true : new Date(c.tanggalHired).getFullYear() === filterYear) &&
          getDepartmentFromPosition(c.posisiDilamar).toLowerCase() === dept.toLowerCase()
        )
        .reduce((sum, c) => sum + (c.expectedSalary || 0), 0);

      return {
        department: dept,
        budget: budget,
        actual: actual,
        remaining: budget - actual,
        status: actual > budget ? 'OVER' : 'SAFE',
        // Metadata for UI
        budgetSourceYear: budgetSourceYear,
        isUsingPrevYear: isUsingPrevYear,
        hasNoBudget: hasNoBudget && actual > 0
      };
    });

    return { depts: uniqueDepts, costData };
  };

  const { costData } = getChartData();
  const maxCostVal = Math.max(...costData.map(d => Math.max(d.budget, d.actual)), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* CHART 2: Cost Hiring per Departemen - WITH FALLBACK INDICATOR */}
       <div className= "bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-2" >
         <div className= "flex items-center justify-between mb-4 " >
           <div >
             <h3 className= "font-bold text-slate-800 text-sm sm:text-base " >Cost Hiring per Departemen </h3 >
             <p className= "text-slate-400 text-[11px] sm:text-xs " >Perbandingan budget alokasi vs pengeluaran riil </p >
           </div >
           <div className= "flex items-center gap-2 text-[10px] font-bold " >
             <span className= "flex items-center gap-1 " > <span className= "w-2 h-2 rounded-full bg-indigo-500 " > </span > Budget </span >
             <span className= "flex items-center gap-1 " > <span className= "w-2 h-2 rounded-full bg-emerald-500 " > </span > Aktual </span >
           </div >
         </div >

         <div className= "space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar " >
          {costData.length  > 0 ? costData.map((item, idx) => (
             <div key={idx} className= "space-y-1 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 " >
               <div className= "flex justify-between items-start text-xs font-semibold " >
                 <div className="flex flex-col">
                    <span className= "text-slate-700 truncate max-w-[120px] " title={item.department} >{item.department} </span >
                    
                    {/* BADGE: Shows if using previous year budget */}
                    {item.isUsingPrevYear && (
                      <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1 w-fit border border-amber-100">
                        ⚠ Menggunakan Budget {item.budgetSourceYear}
                      </span>
                    )}
                    
                    {/* BADGE: Shows if no budget exists */}
                    {item.hasNoBudget && (
                      <span className="text-[9px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-1 w-fit border border-rose-100">
                        ❌ Tidak Ada Budget Aktif
                      </span>
                    )}
                 </div>
                 
                 <div className= "flex flex-col items-end gap-1 " >
                    <div className="flex items-center gap-2">
                        <span className= "text-slate-500 " >Real:  <b className={item.status === 'OVER' ? 'text-rose-600' : 'text-emerald-600'} >{formatIDR(item.actual)} </b > </span >
                        <span className= "text-slate-400 " >| </span >
                        <span className= "text-slate-500 " >Budg:  <b >{formatIDR(item.budget)} </b > </span >
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.status === 'OVER' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`} >
                      {item.status === 'OVER' ? '⚠ Over Budget' : '✅ On Budget'}
                    </span >
                 </div>
               </div >
          
              {/* Visual Bar */}
               <div className= "w-full flex items-center gap-1 h-3 mt-1 " >
                 <div className= "flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden relative " >
                   <div className= "absolute top-0 left-0 h-full bg-indigo-500 rounded-full " style={{ width: `${(item.budget / maxCostVal) * 100}%` }} > </div >
                   <div className={`absolute top-0 left-0 h-full rounded-full opacity-80 ${item.status === 'OVER' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(item.actual / maxCostVal) *  100}%` }} > </div >
                 </div >
               </div >
             </div >
          )) : (
              <div className= "w-full text-center text-slate-400 text-xs py-10 " >Tidak ada data budget untuk periode ini. </div >
          )}
         </div >
       </div >

      {/* Placeholder for other charts (Job vs Hired & Trend) - Keep your existing code for these if needed, or remove if not used in this specific view */}
      <div className="hidden lg:block"></div> 
      
    </div >
  );
};
