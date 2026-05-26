import React, { useState } from 'react';
import {
  Settings, Sparkles, CalendarDays, Clock, DollarSign, Save, CheckCircle2,
  Users, Plus, Edit3, Trash2, ShieldCheck, X, Target, MessageCircle,
  Eye, EyeOff, Lock, ChevronDown
} from 'lucide-react';
import { AppSettings, SlaSetting, AdminRole } from '../data/mockData';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [autoScreeningATS, setAutoScreeningATS] = useState(settings.autoScreeningATS);
  const [syncGoogleCalendar, setSyncGoogleCalendar] = useState(settings.syncGoogleCalendar);
  
  // 🔹 MIGRASI DATA LAMA: Jika budget tidak punya year, asumsikan 2025
  const [targetSlaDays, setTargetSlaDays] = useState<SlaSetting[]>([...settings.targetSlaDays]);
  const [targetSlaManagement, setTargetSlaManagement] = useState(settings.targetSlaManagement ?? 85);
  
  const [deptBudgets, setDeptBudgets] = useState(
    settings.budgetCostHiring.map(b => ({ 
      ...b, 
      year: b.year || 2025, // Default tahun lama ke 2025
      budget: b.budget || 0 
    }))
  );
  
  // 🔹 FILTER TAHUN BUDGET (Default 2025)
  const [selectedBudgetYear, setSelectedBudgetYear] = useState<number>(2025);
  const availableYears = Array.from(new Set([2025, 2026, 2027, ...deptBudgets.map(b => b.year)]));
  
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>(
    settings.adminRoles.map((role) => ({ ...role }))
  );
  const [infoPortal, setInfoPortal] = useState<AppSettings['infoPortal']>({ ...settings.infoPortal });
  const [emailSettings, setEmailSettings] = useState<AppSettings['emailSettings']>({
    ...settings.emailSettings,
    templates: {
      interview: { ...settings.emailSettings.templates.interview },
      assessment: { ...settings.emailSettings.templates.assessment },
      offering: { ...settings.emailSettings.templates.offering },
      medical: { ...settings.emailSettings.templates.medical },
      onboarding: { ...settings.emailSettings.templates.onboarding },
      rejected: { ...settings.emailSettings.templates.rejected },
    }
  });
  const [activeEmailTemplate, setActiveEmailTemplate] = useState<'interview' | 'assessment' | 'offering' | 'medical' | 'onboarding' | 'rejected'>('interview');
  const [whatsappSettings, setWhatsappSettings] = useState<AppSettings['whatsappSettings']>({
    ...settings.whatsappSettings
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSection, setSaveSection] = useState('');

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptBudget, setNewDeptBudget] = useState(0); // 🔹 DEFAULT 0
  
  const [roleFormName, setRoleFormName] = useState('');
  const [roleFormAccess, setRoleFormAccess] = useState<AdminRole['accessLevel']>('Recruiter');
  const [roleFormStatus, setRoleFormStatus] = useState<AdminRole['status']>('Active');
  const [roleFormDescription, setRoleFormDescription] = useState('');
  const [roleFormPermissions, setRoleFormPermissions] = useState<AppSettings['adminRoles'][0]['permissions']>({
    create: false, review: true, update: false, delete: false,
    email: true, whatsapp: false, lockSettings: false, lockHistory: false
  });
  const [roleFormPassword, setRoleFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 HELPER: Sanitasi input angka (hilangkan leading zero, hanya digit)
  const sanitizeNumberInput = (value: string): string => {
    let cleaned = value.replace(/[^\d]/g, '');
    if (cleaned.startsWith('0') && cleaned.length > 1) {
      cleaned = cleaned.replace(/^0+/, '');
    }
    return cleaned;
  };

  // 🔹 HANDLER SLA
  const handleSlaChange = (stage: string, val: number) => {
    setTargetSlaDays(prev =>
      prev.map(item => item.stage === stage ? { ...item, targetDays: Number(val) } : item)
    );
  };

  // 🔹 HANDLER BUDGET: Simpan sebagai string sementara, konversi saat save
  const handleBudgetChange = (dept: string, year: number, rawValue: string) => {
    const sanitized = sanitizeNumberInput(rawValue);
    setDeptBudgets(prev =>
      prev.map(item => (item.department === dept && item.year === year) 
        ? { ...item, budget: sanitized === '' ? 0 : Number(sanitized) } 
        : item)
    );
  };

  const syncBudgetsToParent = (updatedBudgets: typeof deptBudgets) => {
    onUpdateSettings({
      autoScreeningATS, syncGoogleCalendar, targetSlaDays, targetSlaManagement,
      budgetCostHiring: updatedBudgets, adminRoles, infoPortal, emailSettings, whatsappSettings
    });
  };

  const handleAddDeptBudget = (e: React.FormEvent) => {
  e.preventDefault();
  if (!newDeptName.trim()) return;
  const trimmedName = newDeptName.trim();
  
  // Cek duplikat per kombinasi department + year (gunakan newDeptYear)
  if (deptBudgets.some(d => d.department.toLowerCase() === trimmedName.toLowerCase() && d.year === newDeptYear)) {
    alert(`Departemen "${trimmedName}" sudah ada untuk tahun ${newDeptYear}!`);
    return;
  }

  const newEntry = { 
    department: trimmedName, 
    year: newDeptYear, // Gunakan newDeptYear
    budget: newDeptBudget, 
    actual: 0 
  };
  
  const nextBudgets = [...deptBudgets, newEntry];
  setDeptBudgets(nextBudgets);
  syncBudgetsToParent(nextBudgets);
  
  setNewDeptName('');
  setNewDeptYear(2025); // Reset ke default
  setNewDeptBudget(0);
  setIsBudgetModalOpen(false);
  
  setSaveSection('Departemen Baru');
  setSaveSuccess(true);
  setTimeout(() => { setSaveSuccess(false); setSaveSection(''); }, 3000);
};
  const handleRemoveDeptBudget = (deptName: string) => {
    const nextBudgets = deptBudgets.filter(d => d.department !== deptName);
    setDeptBudgets(nextBudgets);
    syncBudgetsToParent(nextBudgets);
  };

  const resetRoleForm = () => {
    setEditingRoleId(null); setRoleFormName(''); setRoleFormAccess('Recruiter');
    setRoleFormStatus('Active'); setRoleFormDescription(''); setRoleFormPassword('');
    setRoleFormPermissions({
      create: false, review: true, update: false, delete: false,
      email: true, whatsapp: false, lockSettings: false, lockHistory: false
    });
    setShowPassword(false);
  };

  const openCreateRole = () => { resetRoleForm(); setIsRoleModalOpen(true); };
  const openEditRole = (role: AdminRole) => {
    setEditingRoleId(role.id); setRoleFormName(role.roleName);
    setRoleFormAccess(role.accessLevel); setRoleFormStatus(role.status);
    setRoleFormDescription(role.description); setRoleFormPermissions({ ...role.permissions });
    setRoleFormPassword(role.password || ''); setShowPassword(false);
    setIsRoleModalOpen(true);
  };

  const saveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormName.trim()) return;
    if (!roleFormPassword.trim() && !editingRoleId) return;
    const nextRole: AdminRole = {
      id: editingRoleId || `ROLE-${String(adminRoles.length + 1).padStart(3, '0')}`,
      roleName: roleFormName.trim(), accessLevel: roleFormAccess, status: roleFormStatus,
      description: roleFormDescription.trim(), permissions: { ...roleFormPermissions },
      password: roleFormPassword.trim() || (editingRoleId ? adminRoles.find(r => r.id === editingRoleId)?.password || '' : '')
    };
    setAdminRoles((prev) => editingRoleId ? prev.map((item) => (item.id === editingRoleId ? nextRole : item)) : [nextRole, ...prev]);
    resetRoleForm(); setIsRoleModalOpen(false);
  };

  const deleteRole = (id: string) => setAdminRoles((prev) => prev.filter((item) => item.id !== id));

  const handleSave = (e: React.FormEvent, section: string = 'Semua') => {
    e.preventDefault();
    const updatedSettings: AppSettings = {
      autoScreeningATS, syncGoogleCalendar, targetSlaDays, targetSlaManagement,
      budgetCostHiring: deptBudgets, adminRoles, infoPortal, emailSettings, whatsappSettings
    };
    onUpdateSettings(updatedSettings);
    setSaveSection(section);
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setSaveSection(''); }, 3000);
  };

  // 🔹 CLASS CSS UNTUK INPUT ANGKA TANPA SPINNER
  const numberInputClass = "w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Pengaturan Rekrutmen & SLA
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Sesuaikan ambang batas ATS, integrasi kalender, target SLA, dan budget cost hiring departemen.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Konfigurasi {saveSection} berhasil disimpan dan audit log perubahan telah dicatat!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: ATS Auto Screening */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3>Skrining Otomatis ATS Kandidat</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tentukan ambang batas persentase kelulusan parsing CV. Kandidat dengan skor kecocokan di bawah batas ini akan ditandai untuk review manual.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Ambang Batas Kelulusan:</span>
                  <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{autoScreeningATS}% Match</span>
                </div>
                <input type="range" min="30" max="95" step="5" value={autoScreeningATS} onChange={(e) => setAutoScreeningATS(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button type="button" onClick={(e) => handleSave(e, 'Skrining ATS')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all">
              <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi
            </button>
          </div>
        </div>

        {/* Card 1B: Sync Google Calendar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                <h3>Sinkronisasi Kalender (Google Calendar)</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secara otomatis menyinkronkan jadwal interview yang dibuat di CareerHub ke Google Calendar Recruiter dan Interviewer.
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-600">Sync Google Calendar API:</span>
                <button type="button" onClick={() => setSyncGoogleCalendar(!syncGoogleCalendar)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${syncGoogleCalendar ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${syncGoogleCalendar ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button type="button" onClick={(e) => handleSave(e, 'Integrasi Kalender')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all">
              <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi
            </button>
          </div>
        </div>

        {/* Card 2: Target SLA Tahapan Rekrutmen */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3>Target SLA Tahapan Rekrutmen (Hari)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-2">
              Batas waktu maksimum pengerjaan kandidat pada setiap transisi tahap agar tetap mematuhi kesepakatan level layanan (SLA).
            </p>
            <div className="grid grid-cols-2 gap-4">
              {targetSlaDays.map((item) => (
                <div key={item.stage} className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block capitalize">
                    {item.stage === 'medical' ? 'Medical Check' : item.stage} (Hari)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.targetDays === 0 ? '' : item.targetDays.toString()}
                    onChange={(e) => handleSlaChange(item.stage, Number(e.target.value))}
                    placeholder="0"
                    className={numberInputClass}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button type="button" onClick={(e) => handleSave(e, 'Target SLA')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all">
              <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi
            </button>
          </div>
        </div>

        {/* Card 2B: Target SLA Management */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <h3>Target SLA Management</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tetapkan target persentase kepatuhan SLA yang diinginkan oleh management.
            </p>
            <div className="pt-2 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">Target Kepatuhan SLA:</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="50" max="100" step="5" value={targetSlaManagement} onChange={(e) => setTargetSlaManagement(Number(e.target.value))} className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 min-w-[70px] text-center">{targetSlaManagement}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Toleransi Pelanggaran:</span>
                  <span className="font-bold text-slate-700">{100 - targetSlaManagement}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Kategori Target:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${targetSlaManagement >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : targetSlaManagement >= 75 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                    {targetSlaManagement >= 90 ? 'STRICT' : targetSlaManagement >= 75 ? 'STANDARD' : 'RELAXED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button type="button" onClick={(e) => handleSave(e, 'Target SLA Management')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all">
              <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi
            </button>
          </div>
        </div>

        {/* Card 3: Budget Cost Hiring per Department - MULTI-YEAR TABLE */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:col-span-2 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <h3>Budget Cost Hiring per Departemen (Multi-Tahun)</h3>
              </div>
              
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* 🔹 DROPDOWN FILTER TAHUN */}
                <div className="relative">
                  <select
                    value={selectedBudgetYear}
                    onChange={(e) => setSelectedBudgetYear(Number(e.target.value))}
                    className="appearance-none pl-3 pr-8 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {availableYears.sort().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>

                <button type="button" onClick={() => setIsBudgetModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100">
                  <Plus className="w-3.5 h-3.5" /> Tambah Departemen + Tahun
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Atur batas budget tahunan untuk perekrutan per divisi. CareerHub akan memantau pengeluaran aktual berdasarkan expected salary kandidat hired.
            </p>

            {/* 🔹 TABEL MULTI-TAHUN SESUAI GAMBAR */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[1200px] text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th rowSpan={2} className="p-3 border-b border-r border-slate-200 font-bold w-12 text-center">No</th>
                    <th rowSpan={2} className="p-3 border-b border-r border-slate-200 font-bold">Departemen</th>
                    
                    {/* Header Tahun 2025 */}
                    <th colSpan={3} className="p-2 border-b border-r border-slate-200 font-bold text-center bg-indigo-50/50">2025</th>
                    
                    {/* Header Tahun 2026 */}
                    <th colSpan={3} className="p-2 border-b border-r border-slate-200 font-bold text-center bg-indigo-50/50">2026</th>
                    
                    {/* Header Tahun 2027 */}
                    <th colSpan={3} className="p-2 border-b border-r border-slate-200 font-bold text-center bg-indigo-50/50">2027</th>
                    
                    <th rowSpan={2} className="p-3 border-b border-slate-200 font-bold text-center w-24">Aksi</th>
                  </tr>
                  <tr>
                    {/* Sub-header 2025 */}
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Budget</th>
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Actual</th>
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Sisa</th>
                    
                    {/* Sub-header 2026 */}
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Budget</th>
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Actual</th>
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Sisa</th>
                    
                    {/* Sub-header 2027 */}
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Budget</th>
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Actual</th>
                    <th className="p-2 border-b border-r border-slate-200 font-semibold text-center">Sisa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {deptBudgets.length > 0 ? (
                    // Group by department name, then show all years in one row
                    Array.from(
                      new Set(deptBudgets.map(b => b.department))
                    ).map((deptName, index) => {
                      const budgetsByYear = deptBudgets.filter(b => b.department === deptName);
                      
                      // Helper to get budget for specific year
                      const getBudgetForYear = (year: number) => 
                        budgetsByYear.find(b => b.year === year) || { department: deptName, year, budget: 0, actual: 0 };

                      return (
                        <tr key={deptName} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center font-medium text-slate-500 align-middle border-r border-slate-100">{index + 1}</td>
                          <td className="p-3 font-bold text-slate-800 align-middle border-r border-slate-100">{deptName}</td>
                          
                          {/* 2025 Columns */}
                          <td className="p-2 border-r border-slate-100 align-middle">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={getBudgetForYear(2025).budget === 0 ? '' : getBudgetForYear(2025).budget.toString()}
                              onChange={(e) => {
                                const val = sanitizeNumberInput(e.target.value);
                                const numVal = val === '' ? 0 : Number(val);
                                setDeptBudgets(prev => 
                                  prev.map(item => 
                                    item.department === deptName && item.year === 2025 
                                      ? { ...item, budget: numVal } 
                                      : item
                                  )
                                );
                              }}
                              placeholder="0"
                              className="w-full text-center text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="p-2 text-center text-slate-600 font-medium border-r border-slate-100 align-middle">
                            {formatRupiah(getBudgetForYear(2025).actual)}
                          </td>
                          <td className={`p-2 text-center font-bold border-r border-slate-100 align-middle ${
                            getBudgetForYear(2025).budget - getBudgetForYear(2025).actual < 0 
                              ? 'text-rose-600' 
                              : getBudgetForYear(2025).budget - getBudgetForYear(2025).actual < getBudgetForYear(2025).budget * 0.2 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>
                            {formatRupiah(getBudgetForYear(2025).budget - getBudgetForYear(2025).actual)}
                          </td>

                          {/* 2026 Columns */}
                          <td className="p-2 border-r border-slate-100 align-middle">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={getBudgetForYear(2026).budget === 0 ? '' : getBudgetForYear(2026).budget.toString()}
                              onChange={(e) => {
                                const val = sanitizeNumberInput(e.target.value);
                                const numVal = val === '' ? 0 : Number(val);
                                setDeptBudgets(prev => 
                                  prev.map(item => 
                                    item.department === deptName && item.year === 2026 
                                      ? { ...item, budget: numVal } 
                                      : item
                                  )
                                );
                              }}
                              placeholder="0"
                              className="w-full text-center text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="p-2 text-center text-slate-600 font-medium border-r border-slate-100 align-middle">
                            {formatRupiah(getBudgetForYear(2026).actual)}
                          </td>
                          <td className={`p-2 text-center font-bold border-r border-slate-100 align-middle ${
                            getBudgetForYear(2026).budget - getBudgetForYear(2026).actual < 0 
                              ? 'text-rose-600' 
                              : getBudgetForYear(2026).budget - getBudgetForYear(2026).actual < getBudgetForYear(2026).budget * 0.2 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>
                            {formatRupiah(getBudgetForYear(2026).budget - getBudgetForYear(2026).actual)}
                          </td>

                          {/* 2027 Columns */}
                          <td className="p-2 border-r border-slate-100 align-middle">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={getBudgetForYear(2027).budget === 0 ? '' : getBudgetForYear(2027).budget.toString()}
                              onChange={(e) => {
                                const val = sanitizeNumberInput(e.target.value);
                                const numVal = val === '' ? 0 : Number(val);
                                setDeptBudgets(prev => 
                                  prev.map(item => 
                                    item.department === deptName && item.year === 2027 
                                      ? { ...item, budget: numVal } 
                                      : item
                                  )
                                );
                              }}
                              placeholder="0"
                              className="w-full text-center text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                          <td className="p-2 text-center text-slate-600 font-medium border-r border-slate-100 align-middle">
                            {formatRupiah(getBudgetForYear(2027).actual)}
                          </td>
                          <td className={`p-2 text-center font-bold border-r border-slate-100 align-middle ${
                            getBudgetForYear(2027).budget - getBudgetForYear(2027).actual < 0 
                              ? 'text-rose-600' 
                              : getBudgetForYear(2027).budget - getBudgetForYear(2027).actual < getBudgetForYear(2027).budget * 0.2 
                                ? 'text-amber-600' 
                                : 'text-emerald-600'
                          }`}>
                            {formatRupiah(getBudgetForYear(2027).budget - getBudgetForYear(2027).actual)}
                          </td>

                          {/* Aksi Column */}
                          <td className="p-2 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus semua data budget untuk departemen "${deptName}" dari semua tahun?`)) {
                                  setDeptBudgets(prev => prev.filter(d => d.department !== deptName));
                                  syncBudgetsToParent(prev.filter(d => d.department !== deptName));
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition-colors"
                              title="Hapus Semua Data Departemen Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={13} className="p-8 text-center text-slate-400 font-medium">
                        Belum ada alokasi budget. Silakan tambah departemen baru dengan memilih tahun.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button type="button" onClick={(e) => handleSave(e, 'Budget Departemen')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all">
              <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi
            </button>
          </div>
        </div>

        {/* Card 4: Info Portal Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:col-span-2 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3>Pengaturan Info Portal (Public)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
                <div className="shrink-0 flex flex-col gap-2 items-center">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                    {infoPortal.logoUrl ? <img src={infoPortal.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" /> : <span className="text-[10px] text-slate-400 font-semibold text-center">No Logo</span>}
                    <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[10px] font-bold">
                      Upload
                      <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setInfoPortal({ ...infoPortal, logoUrl: reader.result as string }); reader.readAsDataURL(file); }}} />
                    </label>
                  </div>
                  {infoPortal.logoUrl && <button type="button" onClick={() => setInfoPortal({ ...infoPortal, logoUrl: '' })} className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold">Hapus Logo</button>}
                </div>
                <div className="flex-1 space-y-4">
                  <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Judul Hero Utama</label><input type="text" value={infoPortal.heroTitle} onChange={(e) => setInfoPortal({ ...infoPortal, heroTitle: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                </div>
              </div>
              <div className="md:col-span-2"><label className="text-[11px] font-bold text-slate-600 block mb-1">Deskripsi Singkat (Subtitle)</label><textarea rows={2} value={infoPortal.heroSubtitle} onChange={(e) => setInfoPortal({ ...infoPortal, heroSubtitle: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Email Rekrutmen</label><input type="email" value={infoPortal.contactEmail} onChange={(e) => setInfoPortal({ ...infoPortal, contactEmail: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Lokasi Kantor</label><input type="text" value={infoPortal.contactLocation} onChange={(e) => setInfoPortal({ ...infoPortal, contactLocation: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Tim HR / Kontak</label><input type="text" value={infoPortal.contactTeam} onChange={(e) => setInfoPortal({ ...infoPortal, contactTeam: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
              <div className="flex items-center gap-3 pt-3">
                <span className="text-[11px] font-bold text-slate-600">Status Portal Publik:</span>
                <button type="button" onClick={() => setInfoPortal({ ...infoPortal, isActive: !infoPortal.isActive })} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${infoPortal.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${infoPortal.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button type="button" onClick={(e) => handleSave(e, 'Info Portal')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all"><Save className="w-3.5 h-3.5" /> Simpan Konfigurasi</button>
          </div>
        </div>

        {/* Card 5: Admin Role Management */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:col-span-2 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm"><Users className="w-4 h-4 text-slate-400" /><ShieldCheck className="w-4 h-4 text-indigo-600" /><h3>Role Admin</h3></div>
              <button type="button" onClick={openCreateRole} className="inline-flex items-center gap-2 self-start rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"><Plus className="w-3.5 h-3.5" /> Tambah Role</button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider"><tr><th className="p-4">Role</th><th className="p-4">Access Level</th><th className="p-4">Status</th><th className="p-4">Deskripsi</th><th className="p-4 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {adminRoles.map((role) => (
                    <tr key={role.id} className="align-top">
                      <td className="p-4"><div className="font-bold text-slate-800">{role.roleName}</div><div className="text-[10px] font-semibold text-slate-400">{role.id}</div></td>
                      <td className="p-4 text-slate-600">{role.accessLevel}</td>
                      <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${role.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{role.status}</span></td>
                      <td className="p-4 text-slate-500 leading-6">{role.description}</td>
                      <td className="p-4"><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => openEditRole(role)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" title="Edit role"><Edit3 className="w-3.5 h-3.5" /></button><button type="button" onClick={() => { if (window.confirm(`Hapus role ${role.roleName}?`)) deleteRole(role.id); }} className="rounded-lg border border-rose-100 p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700" title="Hapus role"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end"><button type="button" onClick={(e) => handleSave(e, 'Role Admin')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all"><Save className="w-3.5 h-3.5" /> Simpan Konfigurasi</button></div>
        </div>

        {/* Card 6: Email Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:col-span-2 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2"><Save className="w-4 h-4 text-indigo-600" /><h3>Pengaturan Email Rekrutmen</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="md:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="text-xs font-bold text-slate-700">Aktifkan Email Otomatis:</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={emailSettings.enabled} onChange={(e) => setEmailSettings({ ...emailSettings, enabled: e.target.checked })} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div></label></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Pengirim</label><input type="text" value={emailSettings.senderName} onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" placeholder="CareerHub Recruitment Team" /></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Email Pengirim</label><input type="email" value={emailSettings.senderEmail} onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" placeholder="recruitment@careerhub.co.id" /></div>
              <div className="md:col-span-2"><label className="text-[11px] font-bold text-slate-600 block mb-1">Reply To</label><input type="email" value={emailSettings.replyTo} onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" placeholder="recruitment@careerhub.co.id" /></div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-600 block mb-2">Template Email Tahapan:</label>
              <div className="flex gap-2 mb-3 flex-wrap">{(['interview', 'assessment', 'offering', 'medical', 'onboarding', 'rejected'] as const).map((stage) => (<button key={stage} onClick={() => setActiveEmailTemplate(stage)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeEmailTemplate === stage ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{stage === 'interview' ? 'Interview' : stage === 'assessment' ? 'Assessment' : stage === 'offering' ? 'Offering' : stage === 'onboarding' ? 'Onboarding' : stage === 'rejected' ? 'Rejected' : 'Medical'}</button>))}</div>
              <div className="mb-3"><label className="text-[11px] font-bold text-slate-600 block mb-1">Subject Email</label><input type="text" value={emailSettings.templates[activeEmailTemplate].subject} onChange={(e) => setEmailSettings({ ...emailSettings, templates: { ...emailSettings.templates, [activeEmailTemplate]: { ...emailSettings.templates[activeEmailTemplate], subject: e.target.value } } })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" placeholder="Subject email..." /></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Isi Email (Body)</label><textarea value={emailSettings.templates[activeEmailTemplate].body} onChange={(e) => setEmailSettings({ ...emailSettings, templates: { ...emailSettings.templates, [activeEmailTemplate]: { ...emailSettings.templates[activeEmailTemplate], body: e.target.value } } })} rows={8} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 resize-none" placeholder="Isi email..." /><p className="text-[10px] text-slate-400 mt-1">Variabel yang tersedia: {'{nama}'}, {'{posisi}'}, {'{email}'}, {'{telepon}'}</p></div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end"><button type="button" onClick={(e) => handleSave(e, 'Email Rekrutmen')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-all"><Save className="w-3.5 h-3.5" /> Simpan Konfigurasi</button></div>
        </div>

        {/* Card 7: WhatsApp Settings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:col-span-2 flex flex-col">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2"><MessageCircle className="w-4 h-4 text-emerald-600" /><h3>Pengaturan WhatsApp Konfirmasi</h3></div>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"><span className="text-xs font-bold text-slate-700">Aktifkan WhatsApp Konfirmasi:</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={whatsappSettings.enabled} onChange={(e) => setWhatsappSettings({ ...whatsappSettings, enabled: e.target.checked })} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div></label></div>
              <div><label className="text-[11px] font-bold text-slate-600 block mb-1">Draft Pesan WhatsApp</label><textarea rows={8} value={whatsappSettings.confirmationTemplate} onChange={(e) => setWhatsappSettings({ ...whatsappSettings, confirmationTemplate: e.target.value })} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-700 resize-none" placeholder="Tulis draft pesan WhatsApp..." /><p className="text-[10px] text-slate-400 mt-1">Variabel yang tersedia: {'{nama}'}, {'{posisi}'}, {'{email}'}, {'{telepon}'}</p></div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-900"><p className="font-bold mb-1">Preview Singkat:</p><p className="whitespace-pre-wrap leading-relaxed">{whatsappSettings.confirmationTemplate}</p></div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end"><button type="button" onClick={(e) => handleSave(e, 'WhatsApp Konfirmasi')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 text-xs transition-all"><Save className="w-3.5 h-3.5" /> Simpan Konfigurasi</button></div>
        </div>
      </div>

      {/* Budget Modal - WITH FREE YEAR INPUT & ANTI-LEADING-ZERO */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-3 sm:items-center sm:p-4">
          <div className="my-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
              <div>
                <h4 className="text-lg font-extrabold text-slate-800">Tambah Departemen + Tahun</h4>
                <p className="text-xs text-slate-400">Buat alokasi budget untuk departemen baru pada tahun tertentu.</p>
              </div>
              <button
                type="button"
                onClick={() => { setNewDeptName(''); setNewDeptYear(2025); setNewDeptBudget(0); setIsBudgetModalOpen(false); }}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeptBudget} className="space-y-4 p-5 sm:p-6">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Nama Departemen</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
                  placeholder="Contoh: Finance"
                />
              </div>

              {/* 🔹 PERBAIKAN UTAMA: Input Tahun dengan Anti-Leading-Zero */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Tahun Anggaran</label>
                <input
                  type="text" // Ubah dari "number" ke "text"
                  inputMode="numeric" // Tetap memunculkan keyboard angka di HP
                  required
                  value={newDeptYear === 0 ? '' : newDeptYear.toString()}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, ''); // Hanya izinkan angka
                    // Hilangkan leading zero: jika dimulai dengan '0' dan panjang > 1, hapus '0' di depan
                    let cleanVal = val;
                    if (cleanVal.startsWith('0') && cleanVal.length > 1) {
                      cleanVal = cleanVal.replace(/^0+/, '');
                    }
                    // Konversi ke number, jika kosong jadi 0
                    const numVal = cleanVal === '' ? 0 : Number(cleanVal);
                    setNewDeptYear(numVal);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Contoh: 2026"
                />
                <p className="text-[9px] text-slate-400 mt-1">Masukkan tahun anggaran (misal: 2025, 2026, dst)</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Alokasi Budget (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={newDeptBudget === 0 ? '' : newDeptBudget.toString()}
                    onChange={(e) => { 
                      const val = sanitizeNumberInput(e.target.value); 
                      setNewDeptBudget(val === '' ? 0 : Number(val)); 
                    }}
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2.5 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => { setNewDeptName(''); setNewDeptYear(2025); setNewDeptBudget(0); setIsBudgetModalOpen(false); }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-3 sm:items-center sm:p-4">
          <div className="my-4 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5 sm:p-6">
              <div><h4 className="text-lg font-extrabold text-slate-800">{editingRoleId ? 'Edit Role Admin' : 'Tambah Role Admin'}</h4><p className="text-xs text-slate-400">Atur level akses dan deskripsi role untuk tim HR.</p></div>
              <button type="button" onClick={() => { resetRoleForm(); setIsRoleModalOpen(false); }} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveRole} className="space-y-4 p-5 sm:p-6">
              <div><label className="mb-1 block text-xs font-bold text-slate-600">Nama Role</label><input value={roleFormName} onChange={(e) => setRoleFormName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none" placeholder="Contoh: Recruiter Lead" /></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-bold text-slate-600">Access Level</label><select value={roleFormAccess} onChange={(e) => setRoleFormAccess(e.target.value as AdminRole['accessLevel'])} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"><option value="Super Admin">Super Admin</option><option value="HR Manager">HR Manager</option><option value="Recruiter">Recruiter</option><option value="Interviewer">Interviewer</option><option value="Viewer">Viewer</option></select></div>
                <div><label className="mb-1 block text-xs font-bold text-slate-600">Status</label><select value={roleFormStatus} onChange={(e) => setRoleFormStatus(e.target.value as AdminRole['status'])} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              </div>
              <div><label className="mb-1 block text-xs font-bold text-slate-600">Deskripsi Role</label><textarea rows={3} value={roleFormDescription} onChange={(e) => setRoleFormDescription(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none" placeholder="Jelaskan tanggung jawab dan cakupan akses role" /></div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-600"><Lock className="w-3.5 h-3.5 text-indigo-600" />Password Role {!editingRoleId && <span className="text-red-500">*</span>}</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required={!editingRoleId} value={roleFormPassword} onChange={(e) => setRoleFormPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none" placeholder={editingRoleId ? 'Kosongkan jika tidak diubah' : 'Masukkan password untuk role'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" title={showPassword ? 'Sembunyikan' : 'Tampilkan'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">{editingRoleId ? 'Biarkan kosong untuk mempertahankan password lama' : 'Password digunakan untuk login ke sistem CareerHub'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="mb-3 block text-[10px] font-black text-slate-500 uppercase tracking-widest">Akses & Izin (Permissions)</label>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {[{ key: 'create', label: 'Create Data' }, { key: 'review', label: 'Review / View' }, { key: 'update', label: 'Update Data' }, { key: 'delete', label: 'Delete Data' }, { key: 'email', label: 'Kirim Email' }, { key: 'whatsapp', label: 'Kirim WhatsApp' }, { key: 'lockSettings', label: 'Lock Settings' }, { key: 'lockHistory', label: 'Lock History' }].map((p) => (
                    <label key={p.key} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex items-center justify-center"><input type="checkbox" checked={(roleFormPermissions as any)[p.key]} onChange={(e) => setRoleFormPermissions({ ...roleFormPermissions, [p.key]: e.target.checked })} className="peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" /><CheckCircle2 className="absolute h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" /></div>
                      <span className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors capitalize">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => { resetRoleForm(); setIsRoleModalOpen(false); }} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100">Batal</button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700">Simpan Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
