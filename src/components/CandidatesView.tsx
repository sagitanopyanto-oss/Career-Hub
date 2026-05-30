import React, { useState } from 'react';
import {
  Plus, Search, Edit3, Trash2, Eye, Download, FileText, Sparkles,
  AlertTriangle, X, CheckCircle, Filter, Mail, Send, MessageCircle
} from 'lucide-react';
import { Candidate, Job, AppSettings, AdminUser } from '../data/mockData';

interface CandidatesViewProps {
  candidates: Candidate[];
  jobs: Job[];
  settings: AppSettings;
  currentUser?: AdminUser | null;
  onAddCandidate: (candidate: Candidate) => void;
  onUpdateCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (id: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canEmail?: boolean;
  canWhatsapp?: boolean;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates, jobs, settings, currentUser,
  onAddCandidate, onUpdateCandidate, onDeleteCandidate,
  canCreate = true, canUpdate = true, canDelete = true,
  canEmail = true, canWhatsapp = true
}) => {
  // --- STATE FILTERS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [filterPendidikan, setFilterPendidikan] = useState('All');
  const [filterStatusKerja, setFilterStatusKerja] = useState('All');
  const [filterAtsScore, setFilterAtsScore] = useState('All');
  const [filterUsia, setFilterUsia] = useState('All');

  // --- STATE MODALS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<Candidate | null>(null);
  const [selectedCandidateWA, setSelectedCandidateWA] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);

  // --- STATE FORM INPUTS ---
  const [formNama, setFormNama] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNoWa, setFormNoWa] = useState('');
  const [formGender, setFormGender] = useState('Pria');
  const [formUsia, setFormUsia] = useState(23);
  const [formPendidikan, setFormPendidikan] = useState('S1');
  const [formJurusan, setFormJurusan] = useState('');
  const [formAsalSekolah, setFormAsalSekolah] = useState('');
  const [formDomisili, setFormDomisili] = useState('');
  const [formJobId, setFormJobId] = useState('');
  const [formStage, setFormStage] = useState('Screening');
  const [formStatusKerja, setFormStatusKerja] = useState('Belum Bekerja');
  const [formPengalaman, setFormPengalaman] = useState('');
  const [formAtsScore, setFormAtsScore] = useState(75);
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formTanggalHired, setFormTanggalHired] = useState('');

  // --- HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingCandidate(null);
    setFormNama(''); setFormEmail(''); setFormNoWa('');
    setFormGender('Pria'); setFormUsia(23); setFormPendidikan('S1');
    setFormJurusan(''); setFormAsalSekolah(''); setFormDomisili('');
    setFormJobId(jobs[0]?.id || ''); setFormStage('Screening');
    setFormStatusKerja('Belum Bekerja'); setFormPengalaman('');
    setFormAtsScore(75); setFormKeterangan(''); setFormTanggalHired('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormNama(cand.nama); setFormEmail(cand.email); setFormNoWa(cand.noWa);
    setFormGender(cand.gender); setFormUsia(cand.usia); setFormPendidikan(cand.pendidikan);
    setFormJurusan(cand.jurusan || ''); setFormAsalSekolah(cand.asalSekolah || '');
    setFormDomisili(cand.domisili || ''); setFormJobId(cand.jobId); setFormStage(cand.stage);
    setFormStatusKerja(cand.statusKerja || 'Belum Bekerja'); setFormPengalaman(cand.pengalaman || '');
    setFormAtsScore(cand.atsScore); setFormKeterangan(cand.keterangan || '');
    setFormTanggalHired(cand.tanggalHired || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Candidate = {
      id: editingCandidate ? editingCandidate.id : `cand-${Date.now()}`,
      nama: formNama, email: formEmail, noWa: formNoWa, gender: formGender as any,
      usia: Number(formUsia), pendidikan: formPendidikan, jurusan: formJurusan,
      asalSekolah: formAsalSekolah, domisili: formDomisili, jobId: formJobId,
      stage: formStage as any, statusKerja: formStatusKerja as any,
      pengalaman: formPengalaman, atsScore: Number(formAtsScore),
      keterangan: formKeterangan, tanggalHired: formTanggalHired || undefined
    };

    if (editingCandidate) onUpdateCandidate(payload);
    else onAddCandidate(payload);
    setIsModalOpen(false);
  };

  // --- FILTER LOGIC ---
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cand.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (cand.domisili && cand.domisili.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = filterStage === 'All' || cand.stage === filterStage;
    const matchesGender = filterGender === 'All' || cand.gender === filterGender;
    const matchesPendidikan = filterPendidikan === 'All' || cand.pendidikan === filterPendidikan;
    const matchesStatusKerja = filterStatusKerja === 'All' || cand.statusKerja === filterStatusKerja;
    
    let matchesAts = true;
    if (filterAtsScore === 'High') matchesAts = cand.atsScore >= 80;
    else if (filterAtsScore === 'Medium') matchesAts = cand.atsScore >= 60 && cand.atsScore < 80;
    else if (filterAtsScore === 'Low') matchesAts = cand.atsScore < 60;

    let matchesUsia = true;
    if (filterUsia === 'Under25') matchesUsia = cand.usia < 25;
    else if (filterUsia === '25to30') matchesUsia = cand.usia >= 25 && cand.usia <= 30;
    else if (filterUsia === 'Over30') matchesUsia = cand.usia > 30;

    return matchesSearch && matchesStage && matchesGender && matchesPendidikan && matchesStatusKerja && matchesAts && matchesUsia;
  });

  // ==========================================
  // RENDER EMAIL MODAL WITH SECURITY VALIDATION
  // ==========================================
  const renderEmailModal = (cand: Candidate) => {
    const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
    
    // 🔹 LANGKAH 1: PENAMBAHAN STATE UNTUK KONTROL KONDISI 1 & KONDISI 2
    const [isEmailMatch, setIsEmailMatch] = useState<boolean | null>(null);

    const [emailSubject, setEmailSubject] = useState(settings.emailTemplates[0]?.subject || '');
    const [emailBody, setEmailBody] = useState(settings.emailTemplates[0]?.body || '');

    const selectedJob = jobs.find(j => j.id === cand.jobId);
    const replacedSubject = emailSubject.replace(/{nama}/g, cand.nama).replace(/{posisi}/g, selectedJob?.title || '');
    const replacedBody = emailBody.replace(/{nama}/g, cand.nama).replace(/{posisi}/g, selectedJob?.title || '');

    // 🔹 LANGKAH 2: LOGIKA VALIDASI KETAT handleSendEmail
    const handleSendEmail = async () => {
      const subject = replacedSubject;
      const body = replacedBody;
      const fullEmailText = `Kepada: ${cand.email}\nSubjek: ${subject}\n\n${body}`;

      // 1. Validasi Awal: Admin wajib memilih opsi status kecocokan email
      if (isEmailMatch === null) {
        alert("⚠️ Mohon verifikasi kecocokan Email Admin dengan Email Browser Anda terlebih dahulu pada opsi di bawah!");
        return;
      }

      // ❌ KONDISI 2: Email Admin A --> Browser B = FALSE (Blokir total)
      if (isEmailMatch === false) {
        alert(
          `⛔ GAGAL MENGIRIM EMAIL (STATUS: FALSE)\n\n` +
          `Sebab: Email Role Admin (${senderEmail}) berbeda dengan email yang aktif di browser Anda!\n\n` +
          `Tindakan: Fitur otomatisasi Gmail Compose dilarang dan diblokir demi keamanan data.`
        );
        return; // 🛑 MUTLAK: Menghentikan program di sini. Jendela Gmail Compose TIDAK TERBUKA.
      }

      // 🔵 KONDISI 1: Email Admin A --> Browser A = TRUE (Lanjut buka compose)
      const isGmailWeb = /gmail\.com|googlemail\.com/i.test(cand.email);
      let isGoogleLoggedIn = false;
      try {
        const response = await fetch('https://mail.google.com/favicon.ico', { mode: 'no-cors' });
        isGoogleLoggedIn = response.type === 'opaque' || response.ok;
      } catch { isGoogleLoggedIn = false; }
      
      const useGmailCompose = isGmailWeb || isGoogleLoggedIn;

      if (useGmailCompose) {
        const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cand.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&as=${encodeURIComponent(senderEmail)}`;
        const newTab = window.open(gmailComposeUrl, '_blank');

        if (newTab) {
          alert(`✅ KONDISI 1 (TRUE): Gmail Compose berhasil dibuka di tab baru!\n\n📎 Silakan lampirkan CV kandidat secara manual.`);
          setSelectedCandidateEmail(null); // Tutup modal rekruter hanya jika sukses
        } else {
          await navigator.clipboard.writeText(fullEmailText).catch(() => {});
          alert(`⚠️ Jendela diblokir browser. Template disalin ke clipboard.`);
          setSelectedCandidateEmail(null);
        }
      } else {
        const mailtoLink = `mailto:${cand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        setSelectedCandidateEmail(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Mail size={18} /></div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Kirim Email Massal / Template</h3>
                <p className="text-[10px] text-slate-500 font-medium">Kandidat: {cand.nama} ({selectedJob?.title})</p>
              </div>
            </div>
            <button onClick={() => setSelectedCandidateEmail(null)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><X size={16} /></button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Email Role Admin</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Template</label>
                <select
                  onChange={(e) => {
                    const tpl = settings.emailTemplates.find(t => t.id === e.target.value);
                    if (tpl) { setEmailSubject(tpl.subject); setEmailBody(tpl.body); }
                  }}
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700"
                >
                  {settings.emailTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            {/* 🔹 LANGKAH 3: TAMPILAN RADIO BUTTON SEBAGAI VALIDASI ANTIPALSU */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <label className="text-xs font-bold text-amber-800 block mb-1.5">
                🔒 Validasi Keamanan: Apakah Akun Browser yang aktif saat ini adalah <span className="underline">{senderEmail}</span>?
              </label>
              <div className="flex gap-4 mt-1">
                <label className="inline-flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="emailVerification"
                    checked={isEmailMatch === true}
                    onChange={() => setIsEmailMatch(true)}
                    className="mr-1.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  Ya, Sama (Kondisi 1 - TRUE)
                </label>
                <label className="inline-flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="emailVerification"
                    checked={isEmailMatch === false}
                    onChange={() => setIsEmailMatch(false)}
                    className="mr-1.5 text-red-600 focus:ring-red-500"
                  />
                  Tidak, Berbeda (Kondisi 2 - FALSE)
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Subjek</label>
              <input
                type="text"
                value={replacedSubject}
                readOnly
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-100 bg-slate-50 text-slate-500 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Isi Pesan (Preview)</label>
              <textarea
                rows={8}
                value={replacedBody}
                readOnly
                className="w-full text-xs font-medium px-3 py-2 border border-slate-100 bg-slate-50 text-slate-600 rounded-lg whitespace-pre-wrap font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">* Variabel {`{nama}`} dan {`{posisi}`} otomatis terisi sesuai profil kandidat.</p>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setSelectedCandidateEmail(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">Batal</button>
            <button onClick={handleSendEmail} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10"><Send size={14} /> Buka Jendela Gmail</button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER WHATSAPP MODAL ---
  const renderWAModal = (cand: Candidate) => {
    const selectedJob = jobs.find(j => j.id === cand.jobId);
    const defaultTemplate = settings.waTemplates && settings.waTemplates[0] ? settings.waTemplates[0].body : "Halo {nama}, kami dari tim HR...";
    const [waBody, setWaBody] = useState(defaultTemplate);

    const replacedWABody = waBody.replace(/{nama}/g, cand.nama).replace(/{posisi}/g, selectedJob?.title || '');

    const handleSendWA = () => {
      let formattedPhone = cand.noWa.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
      
      const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(replacedWABody)}`;
      window.open(waUrl, '_blank');
      setSelectedCandidateWA(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><MessageCircle size={18} /></div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Kirim WhatsApp Blast</h3>
                <p className="text-[10px] text-slate-500 font-medium">Kandidat: {cand.nama} ({cand.noWa})</p>
              </div>
            </div>
            <button onClick={() => setSelectedCandidateWA(null)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><X size={16} /></button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-700">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Template WA</label>
              <select
                onChange={(e) => setWaBody(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700"
              >
                {settings.waTemplates?.map(t => <option key={t.id} value={t.body}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Isi Pesan WA (Preview)</label>
              <textarea
                rows={6}
                value={replacedWABody}
                readOnly
                className="w-full text-xs font-medium px-3 py-2 border border-slate-100 bg-slate-50 text-slate-600 rounded-lg whitespace-pre-wrap"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setSelectedCandidateWA(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">Batal</button>
            <button onClick={handleSendWA} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/10"><MessageCircle size={14} /> Kirim via WhatsApp</button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDERING UTAMA PANEL DAN TABEL ---
  return (
    <div className="space-y-6 text-slate-700">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Database Kandidat</h2>
          <p className="text-xs text-slate-500 font-medium">Total Terfilter: <span className="text-indigo-600 font-bold">{filteredCandidates.length}</span> dari {candidates.length} pelamar</p>
        </div>
        {canCreate && (
          <button onClick={handleOpenAddModal} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all"><Plus size={16} /> Tambah Kandidat</button>
        )}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Cari nama, email, atau domisili kandidat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-400" />
          </div>
          <div className="flex gap-2">
            <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"><option value="All">Semua Tahapan</option><option value="Screening">Screening</option><option value="Interview HR">Interview HR</option><option value="Interview User">Interview User</option><option value="Technical Test">Technical Test</option><option value="Offering">Offering</option><option value="Hired">Hired</option><option value="Rejected">Rejected</option></select>
            <select value={filterAtsScore} onChange={(e) => setFilterAtsScore(e.target.value)} className="text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"><option value="All">Semua Skor ATS</option><option value="High">Tinggi (≥80)</option><option value="Medium">Sedang (60-79)</option><option value="Low">Rendah (&lt;60)</option></select>
          </div>
        </div>
      </div>

      {/* KANDIDAT TABEL */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] font-bold tracking-wider">
                <th className="p-4">Nama & Kontak</th>
                <th className="p-4">Posisi Dilamar</th>
                <th className="p-4">Tahapan</th>
                <th className="p-4 text-center">Skor ATS</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {filteredCandidates.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-slate-400 font-semibold">Tidak ada data kandidat yang cocok.</td></tr>
              ) : (
                filteredCandidates.map(cand => {
                  const job = jobs.find(j => j.id === cand.jobId);
                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{cand.nama}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{cand.email} • {cand.noWa}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{job ? job.title : 'Posisi Tidak Ditemukan'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cand.stage === 'Hired' ? 'bg-emerald-50 text-emerald-600' : cand.stage === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>{cand.stage}</span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700">{cand.atsScore}%</td>
                      <td className="p-4 text-right space-x-1">
                        {canEmail && <button onClick={() => setSelectedCandidateEmail(cand)} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors" title="Kirim Email"><Mail size={14} /></button>}
                        {canWhatsapp && <button onClick={() => setSelectedCandidateWA(cand)} className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors" title="Kirim WA"><MessageCircle size={14} /></button>}
                        {canUpdate && <button onClick={() => handleOpenEditModal(cand)} className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title="Edit"><Edit3 size={14} /></button>}
                        {canDelete && <button onClick={() => onDeleteCandidate(cand.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors" title="Hapus"><Trash2 size={14} /></button>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER DYNAMIC MODALS CONDITIONAL */}
      {selectedCandidateEmail && renderEmailModal(selectedCandidateEmail)}
      {selectedCandidateWA && renderWAModal(selectedCandidateWA)}
    </div>
  );
};
