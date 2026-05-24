import React, { useRef, useState } from 'react';
import { ArrowRight, Briefcase, CalendarDays, ChevronRight, Mail, MapPin, ShieldCheck, Sparkles, X, MessageCircle, EyeOff } from 'lucide-react';
import { Job, AppSettings } from '../data/mockData';

interface InfoPortalViewProps {
  jobs: Job[];
  settings: AppSettings;
  onOpenLoginModal: () => void;
}

export const InfoPortalView: React.FC<InfoPortalViewProps> = ({ jobs, settings, onOpenLoginModal }) => {
  const { infoPortal } = settings;
  const jobsSectionRef = useRef<HTMLDivElement | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Applicant Form states
  const [appNama, setAppNama] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appTelepon, setAppTelepon] = useState('');
  const [appGender, setAppGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [appTempatLahir, setAppTempatLahir] = useState('');
  const [appTanggalLahir, setAppTanggalLahir] = useState('');
  const [appPendidikan, setAppPendidikan] = useState<'D3' | 'S1' | 'S2' | 'SMA/SMK'>('S1');
  const [appJurusan, setAppJurusan] = useState('');
  const [appJabatan, setAppJabatan] = useState('');
  const [appPengalaman, setAppPengalaman] = useState(0);
  const [appStatusKerja, setAppStatusKerja] = useState<'Aktif Bekerja' | 'Tidak Bekerja' | 'Fresh graduate'>('Tidak Bekerja');
  const [appCurSalary, setAppCurSalary] = useState(0);
  const [appExpSalary, setAppExpSalary] = useState(0);
  const [appCvData, setAppCvData] = useState('');
  const [appCvName, setAppCvName] = useState('');
  const [appCoverLetter, setAppCoverLetter] = useState('');

  const resetAppForm = () => {
    setAppNama(''); setAppEmail(''); setAppTelepon(''); setAppGender('Laki-laki');
    setAppTempatLahir(''); setAppTanggalLahir(''); setAppPendidikan('S1');
    setAppJurusan(''); setAppJabatan(''); setAppPengalaman(0);
    setAppStatusKerja('Tidak Bekerja'); setAppCurSalary(0); setAppExpSalary(0);
    setAppCvData(''); setAppCvName(''); setAppCoverLetter('');
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNama.trim() || !selectedJob) return;

    const appData = {
      nama: appNama, email: appEmail, telepon: appTelepon, gender: appGender,
      tempatLahir: appTempatLahir, tanggalLahir: appTanggalLahir,
      pendidikan: appPendidikan, jurusan: appJurusan, jabatan: appJabatan,
      pengalaman: appPengalaman, statusKerja: appStatusKerja,
      curSalary: appCurSalary, expSalary: appExpSalary,
      cvName: appCvName, cvData: appCvData, coverLetter: appCoverLetter,
      jobId: selectedJob.id, jobTitle: selectedJob.judul
    };

    console.log('Application Submitted:', appData);
    alert(`Terima kasih ${appNama}! Lamaran Anda untuk posisi ${selectedJob.judul} telah terkirim.`);
    
    setIsApplying(false);
    setSelectedJob(null);
    resetAppForm();
  };

  const openApplyForm = (job: Job) => {
    setSelectedJob(job);
    setIsApplying(true);
    resetAppForm();
  };

  const activeJobs = jobs.filter((job) => job.status === 'Aktif');

  const scrollToJobs = () => {
    jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl">
        <div className="grid min-h-[78vh] lg:grid-cols-[1.15fr_0.85fr]">
           <div className="relative flex items-start pt-12 p-6 sm:p-8 md:p-12 lg:p-16">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_32%)]" />
             <div className="relative max-w-2xl space-y-8">
               {/* Top badge */}
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs font-bold text-white/90">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                 CAREERHUB ATS v1.0
               </div>
              <div className="space-y-5">
                <div className="inline-flex flex-col sm:flex-row items-center gap-5 sm:gap-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 sm:px-6 sm:py-6 shadow-xl backdrop-blur-sm">
                  {infoPortal.logoUrl ? (
                    <div className="flex h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36 items-center justify-center rounded-2xl bg-white p-3 shadow-lg shrink-0">
                      <img src={infoPortal.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36 items-center justify-center rounded-2xl bg-white text-4xl sm:text-5xl font-black text-slate-900 shadow-lg shrink-0">
                      CH
                    </div>
                  )}
                  <div className="min-w-0 text-center sm:text-left">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.45em] text-slate-400">Company Recruitment Platform</p>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">CareerHub</h2>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-300">Talent Acquisition • Recruitment Analytics • ATS Management</p>
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  {infoPortal.heroTitle}
                </h1>
                <p className="max-w-xl text-sm sm:text-base leading-7 text-slate-300">
                  {infoPortal.heroSubtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={scrollToJobs}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Lihat Lowongan <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Masuk Dashboard HR <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 pt-4 text-sm text-slate-300 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
                  <p className="font-semibold text-white">Proses transparan</p>
                  <p className="mt-1 text-xs leading-5">Pelamar dapat memantau tahapan rekrutmen dengan lebih mudah.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Briefcase className="mb-3 h-5 w-5 text-indigo-300" />
                  <p className="font-semibold text-white">Lowongan relevan</p>
                  <p className="mt-1 text-xs leading-5">Kesempatan kerja dikurasi sesuai kebutuhan company dan tim.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Sparkles className="mb-3 h-5 w-5 text-amber-300" />
                  <p className="font-semibold text-white">Career journey</p>
                  <p className="mt-1 text-xs leading-5">Dari apply hingga offering, semuanya terstruktur dan rapi.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/10 lg:border-l lg:border-t-0 bg-slate-900/70 p-6 sm:p-8 md:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),transparent_40%),linear-gradient(320deg,rgba(16,185,129,0.12),transparent_35%)]" />
            <div className="relative h-full space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400 mb-5">Proses Rekrutmen</p>
                <div className="relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-indigo-500 via-indigo-400/60 to-emerald-500" />
                  <div className="space-y-0">
                    {[
                      { step: 'Apply', desc: 'Kirim lamaran & CV', color: 'bg-indigo-500', icon: '📝' },
                      { step: 'Screening', desc: 'Evaluasi CV oleh ATS & HR', color: 'bg-indigo-500', icon: '🔍' },
                      { step: 'Interview', desc: 'Wawancara HR, User & Final', color: 'bg-indigo-500', icon: '💬' },
                      { step: 'Assessment', desc: 'Tes teknis & psikologi', color: 'bg-indigo-400', icon: '📋' },
                      { step: 'Offering', desc: 'Surat penawaran kerja', color: 'bg-indigo-400', icon: '✉️' },
                      { step: 'Medical', desc: 'Pemeriksaan kesehatan', color: 'bg-indigo-300', icon: '🏥' },
                      { step: 'Hired', desc: 'Selamat bergabung!', color: 'bg-emerald-500', icon: '🎉' },
                    ].map((item, index) => (
                      <div key={item.step} className="relative flex items-start gap-4 pl-0 pb-4 last:pb-0 group">
                        {/* Node dot */}
                        <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${item.color} text-white shadow-lg shrink-0 ring-4 ring-slate-950/60`}>
                          <span className="text-xs">{item.icon}</span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Step {index + 1}</span>
                            <span className="flex-1 border-t border-dotted border-white/10" />
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">{item.step}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  <CalendarDays className="h-4 w-4 text-indigo-300" />
                  Kontak Rekrutmen
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-300" />
                    <span>{infoPortal.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-amber-300" />
                    <span>{infoPortal.contactLocation}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-indigo-300" />
                    <span>{infoPortal.contactTeam}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer Section */}
              <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                  Peringatan Resmi
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300 text-justify">
                  Harap berhati-hati terhadap penipuan yang mengatasnamakan perusahaan. Kami hanya menggunakan kontak resmi sebagaimana tercantum di atas untuk seluruh keperluan komunikasi rekrutmen. Seluruh tahapan seleksi <span className="font-bold text-emerald-400">gratis/tanpa biaya</span>. Kami tidak bertanggung jawab atas undangan atau informasi yang berasal dari nomor, alamat, atau tautan yang tidak tercantum dalam situs resmi ini. Pastikan selalu mengacu pada informasi yang tertera di sini untuk menghindari hal-hal yang tidak diinginkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={jobsSectionRef} className="scroll-mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Lowongan Terbuka</h2>
              <p className="text-xs text-slate-400">Pilihan posisi aktif yang sedang dibuka oleh perusahaan.</p>
            </div>
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-extrabold">
              Total: {activeJobs.length} Lowongan Aktif
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeJobs.map((job) => (
              <div key={job.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between group cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors" onClick={() => openApplyForm(job)}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{job.department}</p>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{job.judul}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{job.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-semibold">{job.type}</span>
                  {job.hideSalary ? (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold flex items-center gap-1" title="Gaji Dirahasiakan">
                      <EyeOff className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0, notation: 'compact' }).format(job.salaryMin)}
                    </span>
                  )}
                  <button className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors">
                    Lamar
                  </button>
                </div>
              </div>
            ))}
            {activeJobs.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada lowongan aktif saat ini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-bold text-slate-800">Panduan Pelamar</h2>
            <p className="text-xs text-slate-500">Cara sederhana mengikuti proses di CareerHub.</p>
          </div>

          <div className="mt-4 space-y-3">
            {[
              'Pilih lowongan yang sesuai dengan profil dan skill Anda.',
              'Unggah CV dan lengkapi data pelamar dengan benar.',
              'Pantau email serta jadwal interview dari tim HR.',
            ].map((text, index) => (
              <div key={text} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={scrollToJobs}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Lihat Semua Lowongan <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Application Form Modal */}
      {isApplying && selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white/20 rounded-lg shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base truncate">Lamar: {selectedJob.judul}</h3>
                  <p className="text-indigo-100 text-[10px] sm:text-xs truncate">{selectedJob.department} • {selectedJob.type}</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsApplying(false); setSelectedJob(null); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <form id="applicantForm" onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" required value={appNama} onChange={(e) => setAppNama(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="Contoh: Budi Santoso" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={appEmail} onChange={(e) => setAppEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="budi@email.com" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Nomor Telepon <span className="text-red-500">*</span></label>
                    <input type="text" required value={appTelepon} onChange={(e) => setAppTelepon(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="0812XXXXXXXX" />
                    <p className="text-[9px] text-orange-600 mt-1.5 flex items-center gap-1.5 font-semibold">
                      <MessageCircle className="w-3 h-3 text-orange-500" />
                      Pastikan nomor telepon terhubung dengan WhatsApp untuk proses konfirmasi
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Gender <span className="text-red-500">*</span></label>
                    <select required value={appGender} onChange={(e) => setAppGender(e.target.value as any)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Tempat Lahir <span className="text-red-500">*</span></label>
                    <input type="text" required value={appTempatLahir} onChange={(e) => setAppTempatLahir(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="Contoh: Jakarta" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <input type="date" required value={appTanggalLahir} onChange={(e) => setAppTanggalLahir(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Pendidikan Terakhir <span className="text-red-500">*</span></label>
                    <select required value={appPendidikan} onChange={(e) => setAppPendidikan(e.target.value as any)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Jurusan <span className="text-red-500">*</span></label>
                    <input type="text" required value={appJurusan} onChange={(e) => setAppJurusan(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="Teknik Informatika" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Jabatan Terakhir <span className="text-red-500">*</span></label>
                    <input type="text" required value={appJabatan} onChange={(e) => setAppJabatan(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" placeholder="Frontend Developer" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Pengalaman (Tahun) <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={appPengalaman} onChange={(e) => setAppPengalaman(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Status Pekerjaan <span className="text-red-500">*</span></label>
                    <select required value={appStatusKerja} onChange={(e) => setAppStatusKerja(e.target.value as any)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                      <option value="Aktif Bekerja">Aktif Bekerja</option>
                      <option value="Tidak Bekerja">Tidak Bekerja</option>
                      <option value="Fresh graduate">Fresh Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Gaji Saat Ini <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={appCurSalary} onChange={(e) => setAppCurSalary(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Ekspektasi Gaji <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={appExpSalary} onChange={(e) => setAppExpSalary(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Upload CV <span className="text-red-500">*</span></label>
                    <input type="file" required accept=".pdf,.doc,.docx" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAppCvName(file.name);
                        const reader = new FileReader();
                        reader.onloadend = () => setAppCvData(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-700 bg-white" />
                    {appCvName && <p className="text-[10px] text-emerald-600 mt-1 font-bold">✓ {appCvName}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold text-slate-600">Cover Letter / Resume <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={5}
                      value={appCoverLetter}
                      onChange={(e) => setAppCoverLetter(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none resize-none"
                      placeholder="Tulis surat lamaran atau ringkasan resume Anda di sini..."
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Minimal 100 karakter.</p>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => { setIsApplying(false); setSelectedJob(null); }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                form="applicantForm"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/10 transition-all"
              >
                Kirim Lamaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
