import { useState, useEffect } from 'react';
import {
  getStoredData,
  setStoredData,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_INTERVIEWS,
  INITIAL_SETTINGS,
  INITIAL_HISTORY,
  normalizeSettings,
  Job,
  Candidate,
  InterviewSchedule,
  AppSettings,
  HistoryLog,
  AdminUser,
  getStoredAdmin,
  setStoredAdmin,
  validateAdminLogin,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { InfoPortalView } from './components/InfoPortalView';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { CandidatesView } from './components/CandidatesView';
import { ScheduleView } from './components/ScheduleView';
import { HistoryLogView } from './components/HistoryLogView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { AdminRole } from './data/mockData';
import { Bell, Calendar, Menu, History, X, LogOut } from 'lucide-react';
import {
  canCreate,
  canUpdate,
  canDelete,
  canEmail,
  canWhatsapp,
  canLockSettings,
  canLockHistory,
  permissionDenied,
} from './utils/permissions';

export default function App() {
  // Navigation State
  const [activeMenu, setActiveMenu] = useState<string>('portal');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>((() =>
    getStoredData<string[]>('careerhub_dismissed_notifications', [])
  ));

  // Filter state
  const [filterRange, setFilterRange] = useState<'month' | '6months' | 'annual'>('6months');
  const [filterYear, setFilterYear] = useState<number>(2025);
  const [filterQuarters, setFilterQuarters] = useState<number[]>([]);

  // 🔹 TAHAP 2: Login state dengan AdminUser (bukan hanya AdminRole)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    getStoredData<boolean>('careerhub_is_logged_in', false)
  );
  const [currentRole, setCurrentRole] = useState<AdminRole | null>(() =>
    getStoredData<AdminRole | null>('careerhub_current_role', null)
  );
  // 🔹 TAHAP 2: State baru untuk user spesifik yang login
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() =>
    getStoredAdmin()
  );

  const isPublicPortalView = !isLoggedIn && activeMenu === 'portal';

  // Sync to localStorage
  useEffect(() => {
    setStoredData('careerhub_is_logged_in', isLoggedIn);
  }, [isLoggedIn]);
  useEffect(() => {
    setStoredData('careerhub_current_role', currentRole);
  }, [currentRole]);
  // 🔹 TAHAP 2: Sync currentUser ke localStorage via helper
  useEffect(() => {
    setStoredAdmin(currentUser);
  }, [currentUser]);

  // 🔹 TAHAP 2: handleLogin sekarang menerima AdminUser
  const handleLogin = (user: AdminUser) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    // Cari role yang sesuai dari settings untuk backward compatibility
    const matchedRole = settings.adminRoles.find(r => r.id === user.roleId) || null;
    setCurrentRole(matchedRole);
    addLog('LOGIN', 'System', `${user.nama} (${user.roleName})`, `User ${user.email} berhasil login dengan role ${user.roleName}.`);
  };

  const handleLogout = () => {
    addLog('LOGOUT', 'System', `${currentUser?.nama || currentRole?.roleName || 'Unknown'}`, `User logout dari sistem.`);
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentRole(null);
    setActiveMenu('portal');
    setIsNotificationOpen(false);
  };

  // Core Database States
  const [jobs, setJobs] = useState<Job[]>((() =>
    getStoredData<Job[]>('careerhub_jobs', INITIAL_JOBS)
  ));
  const [settings, setSettings] = useState <AppSettings >(() = >
    normalizeSettings(getStoredData <AppSettings >('careerhub_settings', INITIAL_SETTINGS))
  );
  
  // 🔹 FIX BARU: Sinkronkan currentUser dengan settings.adminRoles
  React.useEffect(() => {
    if (!currentUser || !currentRole) return;

    // Cari role terbaru dari settings berdasarkan roleId user yang login
    const updatedRole = settings.adminRoles.find(r => r.id === currentRole.id);

    if (updatedRole) {
      // Cek apakah email atau nama role berubah
      if (updatedRole.email !== currentUser.email || updatedRole.roleName !== currentUser.roleName) {
        // Update currentUser dengan data terbaru
        const updatedUser: AdminUser = {
          ...currentUser,
          email: updatedRole.email,
          roleName: updatedRole.roleName,
          accessLevel: updatedRole.accessLevel,
          permissions: updatedRole.permissions
        };
        
        setCurrentUser(updatedUser);
        setStoredAdmin(updatedUser); // Simpan ke localStorage
        
        console.log(`[SYNC] User ${currentUser.nama} synced with new email: ${updatedRole.email}`);
      }
    }
  }, [settings.adminRoles, currentUser, currentRole]);
  ));
  const [schedules, setSchedules] = useState<InterviewSchedule[]>((() =>
    getStoredData<InterviewSchedule[]>('careerhub_interviews', INITIAL_INTERVIEWS)
  ));
  const [settings, setSettings] = useState<AppSettings>(() =>
    normalizeSettings(getStoredData<AppSettings>('careerhub_settings', INITIAL_SETTINGS))
  );
  const [logs, setLogs] = useState<HistoryLog[]>((() =>
    getStoredData<HistoryLog[]>('careerhub_history', INITIAL_HISTORY)
  ));

  // Sync to Local Storage
  useEffect(() => {
    setStoredData('careerhub_jobs', jobs);
  }, [jobs]);
  useEffect(() => {
    setStoredData('careerhub_candidates', candidates);
  }, [candidates]);
  useEffect(() => {
    setStoredData('careerhub_interviews', schedules);
  }, [schedules]);
  useEffect(() => {
    setStoredData('careerhub_settings', settings);
  }, [settings]);
  useEffect(() => {
    setStoredData('careerhub_history', logs);
  }, [logs]);
  useEffect(() => {
    setStoredData('careerhub_dismissed_notifications', dismissedNotificationIds);
  }, [dismissedNotificationIds]);

  const activeNotifications = logs.filter(log => !dismissedNotificationIds.includes(log.id));

  // Logging Helper — 🔹 TAHAP 2: Gunakan currentUser.nama jika tersedia
  const addLog = (action: string, menu: string, itemAffected: string, details: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog: HistoryLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp,
      user: currentUser?.nama || 'Admin HR',
      action,
      menu,
      itemAffected,
      details,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // ─── Permission-checked CRUD helpers ────────────────────────────────────────
  const handleAddJob = (job: Job) => {
    if (!canCreate(currentRole)) { permissionDenied('membuat lowongan baru'); return; }
    setJobs(prev => [job, ...prev]);
    addLog('CREATE', 'Portal Lowongan', `${job.id} - ${job.judul}`, `Menerbitkan lowongan pekerjaan baru untuk Departemen ${job.department}.`);
  };

  const handleUpdateJob = (updatedJob: Job) => {
    if (!canUpdate(currentRole)) { permissionDenied('mengubah data lowongan'); return; }
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    addLog('UPDATE', 'Portal Lowongan', `${updatedJob.id} - ${updatedJob.judul}`, `Memperbarui detail lowongan pekerjaan (Gaji: ${updatedJob.hideSalary ? 'Hidden' : 'Show'}, Status: ${updatedJob.status}).`);
  };

  const handleDeleteJob = (id: string) => {
    if (!canDelete(currentRole)) { permissionDenied('menghapus lowongan'); return; }
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    setJobs(prev => prev.filter(j => j.id !== id));
    addLog('DELETE', 'Portal Lowongan', `${job.id} - ${job.judul}`, `Menghapus postingan lowongan pekerjaan dari database.`);
  };

  // CANDIDATE ACTIONS
  const handleAddCandidate = (cand: Candidate) => {
    if (!canCreate(currentRole)) { permissionDenied('mendaftarkan kandidat baru'); return; }
    // 🔹 PERBAIKAN: Hitung Ulang Skor ATS Jika 0 (Dari Portal Publik)
    let finalRating = cand.ratingKecocokan;

    // Jika skor 0 (biasanya dari form publik), lakukan simulasi sederhana
    if (finalRating === 0) {
      const expScore = Math.min(cand.pengalaman * 5, 40); // Max 40 poin dari pengalaman
      let eduScore = 0;
      if (cand.pendidikan === 'S2') eduScore = 30;
      else if (cand.pendidikan === 'S1') eduScore = 20;
      else if (cand.pendidikan === 'D3') eduScore = 10;

      // Base score 30 + Exp + Edu
      finalRating = Math.min(100, 30 + expScore + eduScore);
    }

    const processedCand: Candidate = {
      ...cand,
      ratingKecocokan: finalRating,
    };

    setCandidates(prev => [processedCand, ...prev]);

    const threshold = settings.autoScreeningATS;
    const isAutoPassed = processedCand.ratingKecocokan >= threshold;

    const atsDetails = isAutoPassed
      ? `Skor ATS ${processedCand.ratingKecocokan}% melampaui batas minimum ${threshold}%. Rekomendasi: AUTO-PASS.`
      : `Skor ATS ${processedCand.ratingKecocokan}% di bawah batas minimum ${threshold}%. Rekomendasi: REVIEW MANUAL.`;

    addLog('CREATE', 'Kandidat', `${processedCand.id} - ${processedCand.nama}`, `Mendaftarkan pelamar baru untuk posisi ${processedCand.posisiDilamar}.`);

    setTimeout(() => {
      addLog('AUTO-SCREENING', 'Kandidat', `${processedCand.id} - ${processedCand.nama}`, `Pemindaian CV otomatis oleh ATS. ${atsDetails}`);
    }, 400);
  };

  const handleUpdateCandidate = (updatedCand: Candidate) => {
    if (!canUpdate(currentRole)) { permissionDenied('mengubah data kandidat'); return; }
    const originalCand = candidates.find(c => c.id === updatedCand.id);
    const stageChanged = originalCand && originalCand.tahapProses !== updatedCand.tahapProses;
    setCandidates(prev => prev.map(c => c.id === updatedCand.id ? updatedCand : c));
    let logMsg = `Memperbarui data kandidat (Pendidikan: ${updatedCand.pendidikan}, Expected Salary: ${updatedCand.expectedSalary}).`;
    if (stageChanged) logMsg = `Transisi Tahapan Rekrutmen: Mengubah tahap dari '${originalCand?.tahapProses}' menjadi '${updatedCand.tahapProses}'.`;
    addLog('UPDATE', 'Kandidat', `${updatedCand.id} - ${updatedCand.nama}`, logMsg);
  };

  const handleDeleteCandidate = (id: string) => {
    if (!canDelete(currentRole)) { permissionDenied('menghapus data kandidat'); return; }
    const cand = candidates.find(c => c.id === id);
    if (!cand) return;
    setCandidates(prev => prev.filter(c => c.id !== id));
    addLog('DELETE', 'Kandidat', `${cand.id} - ${cand.nama}`, `Menghapus berkas profil kandidat pelamar.`);
  };

  // SCHEDULE INTERVIEW ACTIONS
  const handleAddSchedule = (sched: InterviewSchedule) => {
    if (!canCreate(currentRole)) { permissionDenied('membuat jadwal interview baru'); return; }
    setSchedules(prev => [sched, ...prev]);
    addLog('CREATE', 'Schedule Interview', `${sched.id} - ${sched.nama}`, `Menjadwalkan interview (${sched.type} - ${sched.method}) dengan interviewer ${sched.interviewer}.`);
  };

  const handleUpdateSchedule = (updatedSched: InterviewSchedule) => {
    if (!canUpdate(currentRole)) { permissionDenied('mengubah jadwal interview'); return; }
    setSchedules(prev => prev.map(s => s.id === updatedSched.id ? updatedSched : s));
    addLog('UPDATE', 'Schedule Interview', `${updatedSched.id} - ${updatedSched.nama}`, `Mengubah detail interview (Tanggal: ${updatedSched.tanggal}, Status: ${updatedSched.status}).`);
  };

  const handleDeleteSchedule = (id: string) => {
    if (!canDelete(currentRole)) { permissionDenied('menghapus jadwal interview'); return; }
    const sched = schedules.find(s => s.id === id);
    if (!sched) return;
    setSchedules(prev => prev.filter(s => s.id !== id));
    addLog('DELETE', 'Schedule Interview', `${sched.id} - ${sched.nama}`, `Membatalkan / menghapus agenda jadwal interview.`);
  };

  // SETTINGS ACTIONS — requires lockSettings permission
  const handleUpdateSettings = (updatedSettings: AppSettings) => {
    if (!canLockSettings(currentRole)) { permissionDenied('mengubah konfigurasi pengaturan'); return; }
    setSettings(updatedSettings);
    addLog('UPDATE', 'Setting', 'Konfigurasi Global', 'Memperbarui preferensi target SLA, budget cost hiring, ambang batas ATS, dan role admin.');
  };

  // CLEAR LOGS — requires lockHistory permission
  const handleClearLogs = () => {
    if (!canLockHistory(currentRole)) { permissionDenied('menghapus audit log'); return; }
    setLogs([]);
    addLog('DELETE', 'History Log', 'All Logs', 'Membersihkan seluruh log audit riwayat transaksi.');
  };

  // Render proper view based on activeMenu state
  const renderMainView = () => {
    switch (activeMenu) {
      case 'portal':
        return (
          <InfoPortalView
            jobs={jobs}
            settings={settings}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onAddCandidate={handleAddCandidate}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            candidates={candidates}
            jobs={jobs}
            settings={settings}
            filterRange={filterRange}
            setFilterRange={setFilterRange}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            filterQuarters={filterQuarters}
            setFilterQuarters={setFilterQuarters}
            setActiveMenu={setActiveMenu}
          />
        );
      case 'jobs':
        return (
          <JobsView
            jobs={jobs}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            canCreate={canCreate(currentRole)}
            canUpdate={canUpdate(currentRole)}
            canDelete={canDelete(currentRole)}
          />
        );
      case 'candidates':
        return (
          <CandidatesView
            candidates={candidates}
            jobs={jobs}
            settings={settings}
            currentUser={currentUser}
            onAddCandidate={handleAddCandidate}
            onUpdateCandidate={handleUpdateCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            canCreate={canCreate(currentRole)}
            canUpdate={canUpdate(currentRole)}
            canDelete={canDelete(currentRole)}
            canEmail={canEmail(currentRole)}
            canWhatsapp={canWhatsapp(currentRole)}
          />
        );
      case 'schedule':
        return (
          <ScheduleView
            schedules={schedules}
            candidates={candidates}
            jobs={jobs}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            canCreate={canCreate(currentRole)}
            canUpdate={canUpdate(currentRole)}
            canDelete={canDelete(currentRole)}
          />
        );
      case 'history':
        return (
          <HistoryLogView
            logs={logs}
            onClearLogs={handleClearLogs}
            canDelete={canLockHistory(currentRole)}
          />
        );
      case 'settings':
        return canLockSettings(currentRole) ? (
          <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
              <span className="text-3xl">⛔</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700">Akses Ditolak</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Role Anda <span className="font-bold text-rose-600">({currentRole?.roleName})</span> tidak memiliki izin untuk mengakses menu Pengaturan.
            </p>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500 font-medium">
            Menu tidak ditemukan.
          </div>
        );
    }
  };

  // Login modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Login Modal Pop-up */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LoginView
              adminRoles={settings.adminRoles}
              onLogin={(role) => {
                // Backward compat: cari user dari INITIAL_ADMIN_USERS berdasarkan roleId
                const foundUser = (window as any).INITIAL_ADMIN_USERS?.find(u => u.roleId === role.id);
                if (foundUser) {
                  handleLogin(foundUser);
                } else {
                  // fallback: buat dummy user
                  handleLogin({
                    id: `USR-${role.id}`,
                    nama: role.roleName,
                    email: `${role.roleName.toLowerCase().replace(/\s/g, '.')}@careerhub.co.id`,
                    roleId: role.id,
                    roleName: role.roleName,
                    accessLevel: role.accessLevel,
                    permissions: role.permissions,
                    password: role.password || '',
                  });
                }
                setIsLoginModalOpen(false);
                setActiveMenu('dashboard');
              }}
            />
          </div>
        </div>
      )}

      {/* Left Sidebar - hidden for public portal view (before login) */}
      {!isPublicPortalView && (
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar Header - hidden on public Info Lowongan page (before login) */}
        {!isPublicPortalView && (
          <header className="h-16 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-3 sm:px-4 md:px-6 z-10 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Hamburger - hidden when on info portal view after login */}
              {activeMenu !== 'portal' && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors shrink-0"
                  title="Buka Menu Navigasi"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              <span className="text-slate-700 font-extrabold text-sm uppercase tracking-widest block lg:hidden truncate">
                CareerHub
              </span>
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>
                  Hari ini: <b className="text-slate-700">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b>
                </span>
              </div>
            </div>

            {/* User info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
              {/* Quick Notify */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 relative transition-colors"
                  title="Notifikasi Transaksi"
                >
                  <Bell className="w-5 h-5" />
                  {activeNotifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-extrabold shadow-md border border-white">
                      {Math.min(activeNotifications.length, 9)}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsNotificationOpen(false)} />
                    <div className="absolute -right-20 sm:right-0 top-full mt-2 w-[min(80vw,18rem)] max-h-[280px] bg-white rounded-xl border border-slate-200 shadow-2xl z-30 overflow-hidden flex flex-col">
                      <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Bell className="w-4 h-4 text-indigo-600 shrink-0" />
                          <h4 className="font-extrabold text-slate-800 text-xs truncate">Notifikasi Transaksi</h4>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-extrabold shrink-0">
                            {Math.min(activeNotifications.length, 9)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() =>
                              setDismissedNotificationIds(prev => {
                                const allIds = logs.map(l => l.id);
                                return [...new Set([...prev, ...allIds])];
                              })
                            }
                            className="px-2 py-1 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-500 transition-colors"
                            title="Sembunyikan semua notifikasi"
                            disabled={activeNotifications.length === 0}
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => setIsNotificationOpen(false)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {activeNotifications.length > 0
                          ? activeNotifications.slice(0, 2).map(log => {
                              const getActionColor = (action: string) => {
                                if (action === 'CREATE') return 'text-emerald-600 bg-emerald-50';
                                if (action === 'UPDATE') return 'text-blue-600 bg-blue-50';
                                if (action === 'DELETE') return 'text-rose-600 bg-rose-50';
                                return 'text-purple-600 bg-purple-50';
                              };
                              return (
                                <div key={log.id} className="px-3 py-2.5 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-start gap-2">
                                    <div className={`p-1 rounded-md shrink-0 ${getActionColor(log.action)}`}>
                                      <History className="w-3 h-3" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${getActionColor(log.action)}`}>
                                          {log.action}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500">{log.menu}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-700 font-semibold mt-0.5 truncate">
                                        {log.itemAffected}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{log.details}</p>
                                      <p className="text-[9px] text-slate-300 mt-0.5">{log.timestamp}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          : (
                            <div className="p-4 text-center text-xs text-slate-400 font-medium">
                              Tidak ada notifikasi aktif.
                            </div>
                          )}
                      </div>
                      <button
                        onClick={() => {
                          setActiveMenu('history');
                          setIsNotificationOpen(false);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 text-indigo-600 font-bold text-[11px] border-t border-slate-100 transition-colors"
                      >
                        Lihat Semua Log Transaksi
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Avatar Recruiter & Role Info */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3 md:pl-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser?.nama?.substring(0, 2).toUpperCase() || currentRole?.roleName?.substring(0, 2).toUpperCase() || 'CH'}
                </div>
                <div className="hidden sm:block text-left min-w-0">
                  <span className="text-xs font-extrabold text-slate-800 block truncate max-w-[120px]">
                    {currentUser?.nama || currentRole?.roleName || 'Admin'}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold block truncate max-w-[120px]">
                    {currentUser?.email || currentRole?.accessLevel || 'CareerHub'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>
        )}

        {/* Scrollable Page Wrapper */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {renderMainView()}
        </main>
      </div>
    </div>
  );
}
