import React, { useState } from 'react';
import {
  Plus, Search, Edit3, Trash2, Eye, Download, FileText, Sparkles,
  AlertTriangle, X, CheckCircle, Filter, Mail, Send, Paperclip,
  Upload, MessageCircle
} from 'lucide-react';
import { Candidate, Job, AppSettings } from '../data/mockData';

interface CandidatesViewProps {
  candidates: Candidate[];
  jobs: Job[];
  settings: AppSettings;
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
  candidates, jobs, settings,
  onAddCandidate, onUpdateCandidate, onDeleteCandidate,
  canCreate = true, canUpdate = true, canDelete = true,
  canEmail = true, canWhatsapp = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [filterPendidikan, setFilterPendidikan] = useState('All');
  const [filterStatusKerja, setFilterStatusKerja] = useState('All');
  const [filterAtsScore, setFilterAtsScore] = useState('All');
  const [filterUsia, setFilterUsia] = useState('All');
  const [filterExpectedSalary, setFilterExpectedSalary] = useState('All');

  const [selectedCandidateATS, setSelectedCandidateATS] = useState<Candidate | null>(null);
  const [previewCV, setPreviewCV] = useState<Candidate | null>(null);
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<Candidate | null>(null);
  const [emailStage, setEmailStage] = useState<'interview' | 'assessment' | 'offering' | 'medical' | 'onboarding' | 'rejected'>('interview');
  const [emailAttachments, setEmailAttachments] = useState<{ name: string; size: number; type: string; dataUrl: string }[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const [formNama, setFormNama] = useState('');
  const [formTelepon, setFormTelepon] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGender, setFormGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTanggalLahir, setFormTanggalLahir] = useState('1998-01-01');
  const [formPendidikan, setFormPendidikan] = useState<'D3' | 'S1' | 'S2' | 'SMA/SMK'>('S1');
  const [formJurusan, setFormJurusan] = useState('');
  const [formPosisiDilamar, setFormPosisiDilamar] = useState('');
  const [formPengalaman, setFormPengalaman] = useState(2);
  const [formStatusPekerjaan, setFormStatusPekerjaan] = useState<'Aktif Bekerja' | 'Tidak Bekerja' | 'Fresh graduate'>('Aktif Bekerja');
  const [formJabatanTerakhir, setFormJabatanTerakhir] = useState('');
  const [formCurrentSalary, setFormCurrentSalary] = useState(0);
  const [formExpectedSalary, setFormExpectedSalary] = useState(8000000);
  const [formTahapProses, setFormTahapProses] = useState<'applied' | 'screening' | 'interview' | 'assessment' | 'offering' | 'medical' | 'hired' | 'rejected'>('applied');
  const [formRatingKecocokan, setFormRatingKecocokan] = useState(70);
  const [formCvName, setFormCvName] = useState('CV_Resume.pdf');
  const [formCvDataUrl, setFormCvDataUrl] = useState('');
  const [formCvMimeType, setFormCvMimeType] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('');

  const [formTanggalApplied, setFormTanggalApplied] = useState(new Date().toISOString().split('T')[0]);
  const [formTanggalScreening, setFormTanggalScreening] = useState('');
  const [formTanggalInterview, setFormTanggalInterview] = useState('');
  const [formTanggalAssessment, setFormTanggalAssessment] = useState('');
  const [formTanggalOffering, setFormTanggalOffering] = useState('');
  const [formTanggalMedical, setFormTanggalMedical] = useState('');
  const [formTanggalHired, setFormTanggalHired] = useState('');

  const stages: ('applied' | 'screening' | 'interview' | 'assessment' | 'offering' | 'medical' | 'hired' | 'rejected')[] = [
    'applied', 'screening', 'interview', 'assessment', 'offering', 'medical', 'hired', 'rejected'
  ];

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const openWhatsApp = (cand: Candidate) => {
    if (!canWhatsapp) { alert('⛔ Akses Ditolak\n\nRole Anda tidak memiliki izin untuk mengirim WhatsApp.'); return; }
    if (!settings.whatsappSettings.enabled) { alert('Fitur WhatsApp konfirmasi sedang dinonaktifkan pada menu Pengaturan.'); return; }
    let phone = cand.telepon.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
    else if (!phone.startsWith('62')) phone = '62' + phone;
    const draft = settings.whatsappSettings.confirmationTemplate
      .replace(/{nama}/g, cand.nama).replace(/{posisi}/g, cand.posisiDilamar)
      .replace(/{email}/g, cand.email).replace(/{telepon}/g, cand.telepon);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(draft)}`, '_blank');
  };

  const handleOpenAdd = () => {
    setEditingCandidate(null);
    setFormNama(''); setFormTelepon(''); setFormEmail(''); setFormGender('Laki-laki');
    setFormTempatLahir(''); setFormTanggalLahir('1998-01-01'); setFormPendidikan('S1');
    setFormJurusan(''); setFormPosisiDilamar(jobs.length > 0 ? jobs[0].judul : 'Senior React Developer');
    setFormPengalaman(2); setFormStatusPekerjaan('Aktif Bekerja'); setFormJabatanTerakhir('');
    setFormCurrentSalary(0); setFormExpectedSalary(8000000); setFormTahapProses('applied');
    setFormRatingKecocokan(75); setFormCvName('CV_Resume.pdf'); setFormCvDataUrl('');
    setFormCvMimeType(''); setFormKeterangan('');
    setFormTanggalApplied(new Date().toISOString().split('T')[0]);
    setFormTanggalScreening(''); setFormTanggalInterview(''); setFormTanggalAssessment('');
    setFormTanggalOffering(''); setFormTanggalMedical(''); setFormTanggalHired('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormNama(cand.nama); setFormTelepon(cand.telepon); setFormEmail(cand.email);
    setFormGender(cand.gender); setFormTempatLahir(cand.tempatLahir || '');
    setFormTanggalLahir(cand.tanggalLahir || '1998-01-01'); setFormPendidikan(cand.pendidikan);
    setFormJurusan(cand.jurusan); setFormPosisiDilamar(cand.posisiDilamar);
    setFormPengalaman(cand.pengalaman); setFormStatusPekerjaan(cand.statusPekerjaan);
    setFormJabatanTerakhir(cand.jabatanTerakhir); setFormCurrentSalary(cand.currentSalary || 0);
    setFormExpectedSalary(cand.expectedSalary); setFormTahapProses(cand.tahapProses);
    setFormRatingKecocokan(cand.ratingKecocokan); setFormCvName(cand.cvName);
    setFormCvDataUrl(cand.cvDataUrl || ''); setFormCvMimeType(cand.cvMimeType || '');
    setFormKeterangan(cand.keterangan); setFormTanggalApplied(cand.tanggalApplied);
    setFormTanggalScreening(cand.tanggalScreening || ''); setFormTanggalInterview(cand.tanggalInterview || '');
    setFormTanggalAssessment(cand.tanggalAssessment || ''); setFormTanggalOffering(cand.tanggalOffering || '');
    setFormTanggalMedical(cand.tanggalMedical || ''); setFormTanggalHired(cand.tanggalHired || '');
    setIsModalOpen(true);
  };

  const handleDownloadCV = (cand: Candidate) => {
    const element = document.createElement('a');
    if (cand.cvDataUrl) {
      if (cand.cvMimeType === 'application/pdf') {
        const raw = cand.cvDataUrl.split(',')[1];
        const byteChars = atob(raw);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        const dl = document.createElement('a');
        dl.href = url;
        dl.download = cand.cvName.endsWith('.pdf') ? cand.cvName : cand.cvName + '.pdf';
        document.body.appendChild(dl);
        setTimeout(() => { dl.click(); document.body.removeChild(dl); URL.revokeObjectURL(url); }, 600);
      } else {
        element.href = cand.cvDataUrl;
        element.download = cand.cvName;
        element.target = '_blank';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      return;
    }
    const mockContent = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 50 700 Td (CV - ${cand.nama}) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000266 00000 n \n0000000359 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n415\n%%EOF`;
    const blob = new Blob([mockContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    element.href = url;
    element.download = cand.cvName.includes('.pdf') ? cand.cvName : cand.cvName.replace(/\.[^.]+$/, '') + '.pdf';
    document.body.appendChild(element);
    setTimeout(() => { element.click(); document.body.removeChild(element); URL.revokeObjectURL(url); }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formEmail.trim()) return;
    let calculatedRating = formRatingKecocokan;
    if (!editingCandidate) {
      calculatedRating = Math.min(100, Math.max(45, 55 + (formPengalaman * 5) + (formPendidikan === 'S2' ? 10 : formPendidikan === 'S1' ? 5 : 0)));
    }
    const candData: Candidate = {
      id: editingCandidate ? editingCandidate.id : `CAN-${Math.floor(100 + Math.random() * 900)}`,
      nama: formNama, telepon: formTelepon, email: formEmail, gender: formGender,
      tempatLahir: formTempatLahir, tanggalLahir: formTanggalLahir,
      pendidikan: formPendidikan, jurusan: formJurusan, posisiDilamar: formPosisiDilamar,
      pengalaman: Number(formPengalaman), statusPekerjaan: formStatusPekerjaan,
      jabatanTerakhir: formJabatanTerakhir, currentSalary: Number(formCurrentSalary),
      expectedSalary: Number(formExpectedSalary), tahapProses: formTahapProses,
      ratingKecocokan: calculatedRating, cvName: formCvName || 'CV_Resume.pdf',
      cvDataUrl: formCvDataUrl || undefined, cvMimeType: formCvMimeType || undefined,
      tanggalApplied: formTanggalApplied, tanggalScreening: formTanggalScreening || undefined,
      tanggalInterview: formTanggalInterview || undefined, tanggalAssessment: formTanggalAssessment || undefined,
      tanggalOffering: formTanggalOffering || undefined, tanggalMedical: formTanggalMedical || undefined,
      tanggalHired: formTanggalHired || undefined, keterangan: formKeterangan
    };
    if (editingCandidate) onUpdateCandidate(candData);
    else onAddCandidate(candData);
    setIsModalOpen(false);
  };

  const hitungUsia = (tglLahir?: string) => {
    if (!tglLahir) return 0;
    const birthDate = new Date(tglLahir);
    const today = new Date('2026-02-28');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.posisiDilamar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'All' || c.tahapProses === filterStage;
    const matchesGender = filterGender === 'All' || c.gender === filterGender;
    const matchesPendidikan = filterPendidikan === 'All' || c.pendidikan === filterPendidikan;
    const matchesStatusKerja = filterStatusKerja === 'All' || c.statusPekerjaan === filterStatusKerja;
    const matchesAts = filterAtsScore === 'All' || (
      filterAtsScore === '85+' ? c.ratingKecocokan >= 85 :
        filterAtsScore === '70-84' ? c.ratingKecocokan >= 70 && c.ratingKecocokan < 85 :
          filterAtsScore === '50-69' ? c.ratingKecocokan >= 50 && c.ratingKecocokan < 70 :
            filterAtsScore === 'below50' ? c.ratingKecocokan < 50 : true
    );
    const usia = hitungUsia(c.tanggalLahir);
    const matchesUsia = filterUsia === 'All' || (
      filterUsia === '<25' ? usia < 25 :
        filterUsia === '25-30' ? usia >= 25 && usia <= 30 :
          filterUsia === '31-35' ? usia >= 31 && usia <= 35 :
            filterUsia === '>35' ? usia > 35 : true
    );
    const matchesExpectedSalary = filterExpectedSalary === 'All' || (
      filterExpectedSalary === '<5' ? c.expectedSalary < 5000000 :
        filterExpectedSalary === '5-10' ? c.expectedSalary >= 5000000 && c.expectedSalary < 10000000 :
          filterExpectedSalary === '10-15' ? c.expectedSalary >= 10000000 && c.expectedSalary < 15000000 :
            filterExpectedSalary === '15-20' ? c.expectedSalary >= 15000000 && c.expectedSalary < 20000000 :
              filterExpectedSalary === '>20' ? c.expectedSalary >= 20000000 : true
    );
    return matchesSearch && matchesStage && matchesGender && matchesPendidikan && matchesStatusKerja && matchesAts && matchesUsia && matchesExpectedSalary;
  });

  // ─── ATS ANALYSIS MODAL ──────────────────────────────────────────────
  const renderATSPanel = (cand: Candidate) => {
    const matchedJob = jobs.find(j => j.judul === cand.posisiDilamar || j.id === cand.posisiDilamar) || jobs[0];
    const jobSkills = matchedJob ? matchedJob.skills : ["React", "TypeScript", "Tailwind CSS"];
    let matchedSkills: string[] = [];
    let missingSkills: string[] = [];
    jobSkills.forEach((s, idx) => {
      const skillThreshold = cand.ratingKecocokan / 100;
      if ((idx + 1) / jobSkills.length <= skillThreshold + 0.15) matchedSkills.push(s);
      else missingSkills.push(s);
    });
    const meetsThreshold = cand.ratingKecocokan >= settings.autoScreeningATS;

    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-900 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-base">Hasil Analisis ATS CareerHub</h3>
                <p className="text-indigo-200 text-[10px]">Verifikasi otomatis dokumen & profil pelamar</p>
              </div>
            </div>
            <button onClick={() => setSelectedCandidateATS(null)} className="p-1.5 hover:bg-indigo-800 rounded-lg text-indigo-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">PELAMAR</span>
                <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{cand.nama}</h4>
                <p className="text-slate-500 text-xs mt-0.5">{cand.posisiDilamar} ({matchedJob?.department || 'Technology'})</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase">ATS SCORE</span>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  <span className="text-2xl font-black text-indigo-600">{cand.ratingKecocokan}%</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-start gap-3 ${meetsThreshold ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
              {meetsThreshold ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider">{meetsThreshold ? "AUTO-PASS (Lolos Screening)" : "MANUAL REVIEW REQUIRED"}</h5>
                <p className="text-[11px] mt-1 leading-relaxed">
                  {meetsThreshold
                    ? `Skor kecocokan (${cand.ratingKecocokan}%) di atas ambang batas otomatis rekruter (${settings.autoScreeningATS}%). Profil kandidat terverifikasi memiliki basis keahlian yang sangat kuat.`
                    : `Skor kecocokan (${cand.ratingKecocokan}%) berada di bawah ambang batas otomatis (${settings.autoScreeningATS}%). Direkomendasikan untuk melakukan review resume manual untuk memvalidasi gap keahlian.`}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">SKILL MATCH ANALYSIS</span>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-400 w-full font-bold">Keahlian Sesuai:</span>
                  {matchedSkills.map((s, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">✓ {s}</span>
                  ))}
                  {matchedSkills.length === 0 && <span className="text-slate-400 text-xs italic">Tidak ada keahlian yang terdeteksi cocok.</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 w-full font-bold">Keahlian Kurang (Gap):</span>
                  {missingSkills.map((s, i) => (
                    <span key={i} className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">✗ {s}</span>
                  ))}
                  {missingSkills.length === 0 && <span className="text-slate-400 text-xs italic">Semua keahlian terpenuhi!</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div><span className="text-slate-400 block">Pendidikan Formal</span><span className="font-bold text-slate-800">{cand.pendidikan} ({cand.jurusan || 'Jurusan Umum'})</span></div>
              <div><span className="text-slate-400 block">Masa Kerja & Posisi Terakhir</span><span className="font-bold text-slate-800">{cand.pengalaman} Tahun - {cand.jabatanTerakhir || 'Fresh Graduate'}</span></div>
              <div><span className="text-slate-400 block">Current Salary</span><span className="font-bold text-slate-800">{formatRupiah(cand.currentSalary || 0)}</span></div>
              <div><span className="text-slate-400 block">Expected Salary</span><span className="font-bold text-slate-800">{formatRupiah(cand.expectedSalary)}</span></div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block">REKOMENDASI SISTEM</span>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                {cand.ratingKecocokan >= 85
                  ? `"Kandidat ${cand.nama} sangat kuat. Portofolio & latar belakang menunjukkan kecocokan sangat tinggi. Segera jadwalkan wawancara teknis."`
                  : cand.ratingKecocokan >= 70
                    ? `"Kandidat ${cand.nama} memenuhi syarat utama. Pengalaman kerja cukup memadai untuk posisi dilamar. Jadwalkan interview awal."`
                    : `"Kandidat ${cand.nama} terindikasi memiliki beberapa keahlian gap. Harap lakukan konfirmasi skill tambahan saat interview HR jika dilanjutkan."`}
              </p>
            </div>
          </div>

          {/* ✅ FOOTER ATS - FIXED: Tag <div> lengkap, tanpa tombol salin template */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setSelectedCandidateATS(null)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all"
            >
              Tutup Analisis
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── CV PREVIEW MODAL ────────────────────────────────────────────────
  const renderCVPreview = (cand: Candidate) => {
    const matchedJob = jobs.find(j => j.judul === cand.posisiDilamar || j.id === cand.posisiDilamar);
    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8 flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-sm">Review Resume / CV - {cand.nama}</h3>
            </div>
            <button onClick={() => setPreviewCV(null)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-0 sm:p-6 bg-slate-50/50 flex-1 overflow-y-auto max-h-[75vh]">
            <div className="bg-white shadow-sm border border-slate-200 w-full max-w-2xl mx-auto sm:rounded-xl overflow-hidden min-h-[500px]">
              <div className="bg-indigo-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{cand.nama}</h1>
                  <p className="text-indigo-200 font-semibold mt-1">{cand.jabatanTerakhir || cand.posisiDilamar}</p>
                </div>
                <div className="text-right flex flex-col gap-1 text-xs text-indigo-100">
                  <span className="flex items-center sm:justify-end gap-2"><span className="w-4 text-center">✉</span> {cand.email}</span>
                  <span className="flex items-center sm:justify-end gap-2"><span className="w-4 text-center">☎</span> {cand.telepon}</span>
                  <span className="flex items-center sm:justify-end gap-2"><span className="w-4 text-center">⚐</span> Indonesia</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-6 sm:p-8 bg-slate-50 space-y-8 md:col-span-1">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Personal</h3>
                    <div className="space-y-3 text-xs text-slate-600">
                      <div><span className="block text-slate-400 font-bold mb-0.5">Gender</span><span>{cand.gender}</span></div>
                      <div><span className="block text-slate-400 font-bold mb-0.5">Tempat, Tanggal Lahir</span><span>{cand.tempatLahir}, {new Date(cand.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ({hitungUsia(cand.tanggalLahir)} Thn)</span></div>
                      <div><span className="block text-slate-400 font-bold mb-0.5">Status Pekerjaan</span><span>{cand.statusPekerjaan}</span></div>
                      <div><span className="block text-slate-400 font-bold mb-0.5">Gaji Saat Ini</span><span className="font-semibold text-slate-800">{formatRupiah(cand.currentSalary || 0)}</span></div>
                      <div><span className="block text-slate-400 font-bold mb-0.5">Ekspektasi Gaji</span><span className="font-semibold text-slate-800">{formatRupiah(cand.expectedSalary)}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Top Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedJob ? matchedJob.skills.slice(0, 5).map(s => (<span key={s} className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">{s}</span>)) : <span className="text-xs text-slate-400">Tidak ada data.</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">ATS Score</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] text-white ${cand.ratingKecocokan >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}>{cand.ratingKecocokan}%</div>
                      <span className="text-[10px] text-slate-500 font-semibold leading-tight">{cand.ratingKecocokan >= 70 ? 'Recommended' : 'Needs Review'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8 md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Pengalaman Kerja</h3>
                    <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                      <div className="relative">
                        <div className="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full -left-[21px] top-1 ring-4 ring-white"></div>
                        <h4 className="font-bold text-slate-800 text-sm">{cand.jabatanTerakhir || cand.posisiDilamar}</h4>
                        <p className="text-xs text-slate-500 font-medium mb-2">Total Pengalaman: {cand.pengalaman} Tahun</p>
                        <p className="text-xs text-slate-600 leading-relaxed">Berpengalaman selama {cand.pengalaman} tahun dalam bidang {cand.jurusan || 'yang relevan'}, terbiasa bekerja dalam tim maupun individu dengan orientasi pencapaian target dan solusi yang inovatif.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Pendidikan Formal</h3>
                    <div className="relative pl-4 border-l-2 border-slate-100">
                      <div className="relative">
                        <div className="absolute w-2.5 h-2.5 bg-slate-300 rounded-full -left-[21px] top-1 ring-4 ring-white"></div>
                        <h4 className="font-bold text-slate-800 text-sm">{cand.jurusan || 'Jurusan Umum'}</h4>
                        <p className="text-xs text-slate-500 font-medium mb-1">Gelar: {cand.pendidikan}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Aplikasi Pekerjaan</h3>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-xs">
                      <p className="text-indigo-900 mb-1">Posisi dilamar:</p>
                      <p className="font-black text-indigo-700 text-sm">{cand.posisiDilamar}</p>
                      <p className="text-indigo-600 mt-2 font-semibold">Tanggal Apply: {cand.tanggalApplied}</p>
                    </div>
                  </div>
                  {cand.cvDataUrl && (
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Dokumen Terlampir</h3>
                      <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                        {cand.cvMimeType?.includes('image') ? (
                          <img src={cand.cvDataUrl} alt={cand.cvName} className="w-full max-h-[320px] object-contain bg-white" />
                        ) : cand.cvMimeType?.includes('pdf') ? (
                          <iframe src={cand.cvDataUrl} title={cand.cvName} className="w-full h-[320px] bg-white" />
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-500">Preview tidak tersedia untuk format ini. Silakan gunakan tombol download untuk membuka dokumen.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => setPreviewCV(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">Tutup</button>
            <button onClick={() => { handleDownloadCV(cand); setPreviewCV(null); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"><Download className="w-4 h-4" /> Download CV</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── EMAIL MODAL ─────────────────────────────────────────────────────
  const renderEmailModal = (cand: Candidate) => {
    const template = settings.emailSettings.templates[emailStage];
    const replacedSubject = template.subject.replace(/{nama}/g, cand.nama).replace(/{posisi}/g, cand.posisiDilamar).replace(/{email}/g, cand.email).replace(/{telepon}/g, cand.telepon);
    const replacedBody = template.body.replace(/{nama}/g, cand.nama).replace(/{posisi}/g, cand.posisiDilamar).replace(/{email}/g, cand.email).replace(/{telepon}/g, cand.telepon);

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleSendEmail = () => {
      const subject = replacedSubject;
      let body = replacedBody;

      // Tambahkan info lampiran ke body email jika ada
      if (emailAttachments.length > 0) {
        const attachmentList = emailAttachments.map(a => `• ${a.name}`).join('\n');
        body += `\n\n---\nLampiran Terlampir:\n${attachmentList}\n(Catatan: Silakan lampirkan file secara manual di jendela compose email Anda)`;
      }

      // Buat Link Gmail Compose Langsung
      const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cand.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Coba buka tab baru
      const newWindow = window.open(gmailLink, '_blank');

      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // JIKA POP-UP DIBLOKIR: Fallback ke Copy Clipboard + Instruksi Manual
        const fullEmailText = `Kepada: ${cand.email}\nSubjek: ${subject}\n\n${body}`;
        
        navigator.clipboard.writeText(fullEmailText).then(() => {
          alert('⚠️ Pop-up Gmail diblokir oleh browser.\n\n✅ Template email & alamat tujuan SUDAH DISALIN ke clipboard.\n\nSilakan:\n1. Buka Gmail Anda secara manual.\n2. Klik "Compose" / "Buat Email Baru".\n3. PASTE (Ctrl+V) di kolom Subjek dan Isi Pesan.');
        }).catch(() => {
          alert('❌ Gagal menyalin template. Silakan copy manual dari preview Subject & Body di atas.');
        });
      } else {
        // JIKA BERHASIL: Feedback sukses
        alert(`✅ Tab Gmail telah dibuka untuk mengirim pesan ke ${cand.email}.\n\nPastikan Anda melampirkan file secara manual jika diperlukan.`);
      }
      
      setSelectedCandidateEmail(null);
      setEmailAttachments([]);
    };
    
    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const maxSize = 10 * 1024 * 1024;
      const newAttachments: { name: string; size: number; type: string; dataUrl: string }[] = [];
      Array.from(files).forEach(file => {
        if (file.size > maxSize) { alert(`File "${file.name}" melebihi batas maksimum 10MB.`); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
          newAttachments.push({ name: file.name, size: file.size, type: file.type || 'application/octet-stream', dataUrl: reader.result as string });
          if (newAttachments.length === Array.from(files).filter(f => f.size <= maxSize).length) setEmailAttachments(prev => [...prev, ...newAttachments]);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    };

    const removeAttachment = (index: number) => setEmailAttachments(prev => prev.filter((_, i) => i !== index));

    const getFileIcon = (type: string) => {
      if (type.includes('pdf')) return '📄';
      if (type.includes('image')) return '🖼️';
      if (type.includes('word') || type.includes('document')) return '📝';
      if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
      if (type.includes('zip') || type.includes('rar')) return '🗜️';
      return '📎';
    };

    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Send className="w-5 h-5" /></div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">Kirim Email Notifikasi</h3>
                <p className="text-indigo-100 text-[10px] sm:text-xs">Kirim email untuk tahapan rekrutmen kandidat</p>
              </div>
            </div>
            <button onClick={() => { setSelectedCandidateEmail(null); setEmailAttachments([]); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-black text-lg">{cand.nama.charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-slate-800 text-sm truncate">{cand.nama}</h4>
                  <p className="text-xs text-slate-500 truncate">{cand.email}</p>
                  <p className="text-[10px] text-slate-400 truncate">{cand.posisiDilamar}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">Pilih Tahapan Email:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {(['interview', 'assessment', 'offering', 'medical', 'onboarding', 'rejected'] as const).map((stage) => (
                  <button key={stage} onClick={() => setEmailStage(stage)} className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${emailStage === stage ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                    {stage === 'interview' ? 'Interview' : stage === 'assessment' ? 'Assessment' : stage === 'offering' ? 'Offering' : stage === 'onboarding' ? 'Onboarding' : stage === 'rejected' ? 'Rejected' : 'Medical'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Subject:</label>
                <div className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">{replacedSubject}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Isi Email:</label>
                <div className="w-full text-xs font-medium px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[150px]">{replacedBody}</div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-xs">
                <p className="font-bold text-indigo-900 mb-1">Pengirim:</p>
                <p className="text-indigo-700">{settings.emailSettings.senderName} &lt;{settings.emailSettings.senderEmail}&gt;</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-600" /> Lampiran Attachment
                  {emailAttachments.length > 0 && <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-extrabold">{emailAttachments.length}</span>}
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 transition-all">
                  <Upload className="w-3 h-3" /> Upload File
                  <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.zip,.rar" onChange={handleAttachmentUpload} className="hidden" />
                </label>
              </div>
              {emailAttachments.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50">
                  <Paperclip className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">Belum ada lampiran</p>
                  <p className="text-[10px] text-slate-400 mt-1">Upload dokumen pendukung (PDF, DOC, XLS, gambar) max 10MB per file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emailAttachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-xl shrink-0">{getFileIcon(file.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeAttachment(idx)} className="p-1.5 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-md transition-all shrink-0 ml-2" title="Hapus Lampiran"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                    <span>Total {emailAttachments.length} file</span>
                    <span>{formatFileSize(emailAttachments.reduce((sum, f) => sum + f.size, 0))}</span>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-2 italic">Format yang didukung: PDF, DOC, DOCX, XLS, XLSX, PPT, PNG, JPG, ZIP, RAR</p>
            </div>
          </div>

          {/* ✅ FOOTER EMAIL - Tombol Salin Template HANYA di sini */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            {emailAttachments.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Paperclip className="w-3 h-3" />
                <span>{emailAttachments.length} lampiran ({formatFileSize(emailAttachments.reduce((sum, f) => sum + f.size, 0))})</span>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={async () => {
                  const textToCopy = `Kepada: ${cand.email}\nSubjek: ${replacedSubject}\n\n${replacedBody}`;
                  try {
                    await navigator.clipboard.writeText(textToCopy);
                    alert('✅ Template email & alamat tujuan berhasil disalin ke clipboard.');
                  } catch {
                    alert('⚠️ Gagal menyalin. Silakan salin manual dari kolom Subject & Body di atas.');
                  }
                }}
                className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5"
              >
                📋 Salin Template
              </button>
              <button onClick={() => { setSelectedCandidateEmail(null); setEmailAttachments([]); }} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">Batal</button>
              <button onClick={handleSendEmail} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"><Send className="w-4 h-4" /> Kirim Email</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Database & Kandidat Pelamar</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Kelola berkas lamaran, pantau tahap proses, dan lakukan analisis kecocokan resume menggunakan ATS.</p>
        </div>
        <button onClick={handleOpenAdd} disabled={!canCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs sm:text-sm transition-all self-start lg:self-auto whitespace-nowrap" title={!canCreate ? 'Anda tidak memiliki izin untuk menambah kandidat' : undefined}>
          <Plus className="w-4 h-4" /> Daftarkan Kandidat Baru
        </button>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input type="text" placeholder="Cari kandidat berdasarkan nama, email, posisi, ID pelamar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tahap Proses</label><select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"><option value="All">Semua Tahap</option>{stages.map(stg => (<option key={stg} value={stg} className="capitalize">{stg === 'medical' ? 'Medical Check' : stg.charAt(0).toUpperCase() + stg.slice(1)}</option>))}</select></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gender</label><select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"><option value="All">Semua Gender</option><option value="Laki-laki">Laki-Laki</option><option value="Perempuan">Perempuan</option></select></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pendidikan</label><select value={filterPendidikan} onChange={(e) => setFilterPendidikan(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"><option value="All">Semua Pendidikan</option><option value="SMA/SMK">SMA/SMK</option><option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option></select></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status Pekerjaan</label><select value={filterStatusKerja} onChange={(e) => setFilterStatusKerja(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"><option value="All">Semua Status</option><option value="Aktif Bekerja">Aktif Bekerja</option><option value="Tidak Bekerja">Tidak Bekerja</option><option value="Fresh graduate">Fresh Graduate</option></select></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skor ATS</label><select value={filterAtsScore} onChange={(e) => setFilterAtsScore(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"><option value="All">Semua Skor</option><option value="85+">Excellent (85%+)</option><option value="70-84">Good (70-84%)</option><option value="50-69">Fair (50-69%)</option><option value="below50">Low (&lt;50%)</option></select></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Usia</label><select value={filterUsia} onChange={(e) => setFilterUsia(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"><option value="All">Semua Usia</option><option value="<25">&lt; 25 Tahun</option><option value="25-30">25 - 30 Tahun</option><option value="31-35">31 - 35 Tahun</option><option value=">35">&gt; 35 Tahun</option></select></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expected Salary</label><select value={filterExpectedSalary} onChange={(e) => setFilterExpectedSalary(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"><option value="All">Semua Gaji</option><option value="<5">&lt; 5 Juta</option><option value="5-10">5 - 10 Juta</option><option value="10-15">10 - 15 Juta</option><option value="15-20">15 - 20 Juta</option><option value=">20">&gt; 20 Juta</option></select></div>
        </div>
        {(filterStage !== 'All' || filterGender !== 'All' || filterPendidikan !== 'All' || filterStatusKerja !== 'All' || filterAtsScore !== 'All' || filterUsia !== 'All' || filterExpectedSalary !== 'All') && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
            <Filter className="w-3 h-3 text-indigo-500" />
            <span>Filter aktif: {[filterStage, filterGender, filterPendidikan, filterStatusKerja, filterAtsScore, filterUsia, filterExpectedSalary].filter(f => f !== 'All').length} pilihan</span>
            <button onClick={() => { setFilterStage('All'); setFilterGender('All'); setFilterPendidikan('All'); setFilterStatusKerja('All'); setFilterAtsScore('All'); setFilterUsia('All'); setFilterExpectedSalary('All'); }} className="text-indigo-600 hover:underline ml-1">Reset Semua</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto max-h-[calc(100vh-280px)]">
          <table className="w-full text-left text-xs border-collapse min-w-[1250px]">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
              <tr className="text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="p-4 border-b border-slate-200 w-12 text-center">No</th>
                <th className="p-4 border-b border-slate-200">ID Pelamar & Nama</th>
                <th className="p-4 border-b border-slate-200">Usia & Info</th>
                <th className="p-4 border-b border-slate-200">Posisi Dilamar</th>
                <th className="p-4 border-b border-slate-200">Kontak Info</th>
                <th className="p-4 border-b border-slate-200">Pendidikan & Pengalaman</th>
                <th className="p-4 border-b border-slate-200">Status & Gaji</th>
                <th className="p-4 border-b border-slate-200">ATS Match</th>
                <th className="p-4 border-b border-slate-200">CV</th>
                <th className="p-4 border-b border-slate-200">Tanggal Tahapan</th>
                <th className="p-4 border-b border-slate-200">Keterangan</th>
                <th className="p-4 border-b border-slate-200">Tahap Proses</th>
                <th className="p-4 border-b border-slate-200 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((cand, index) => {
                  const getTahapBadge = (tahap: string) => {
                    const classes: Record<string, string> = {
                      applied: 'bg-blue-50 text-blue-700 border-blue-100', screening: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                      interview: 'bg-purple-50 text-purple-700 border-purple-100', assessment: 'bg-pink-50 text-pink-700 border-pink-100',
                      offering: 'bg-teal-50 text-teal-700 border-teal-100', medical: 'bg-amber-50 text-amber-700 border-amber-100',
                      hired: 'bg-emerald-50 text-emerald-700 border-emerald-100', rejected: 'bg-rose-50 text-rose-700 border-rose-100'
                    };
                    return (<span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${classes[tahap] || 'bg-slate-50 text-slate-700'}`}>{tahap === 'medical' ? 'Medical Check' : tahap}</span>);
                  };
                  const getRatingBadge = (rating: number) => {
                    if (rating >= 85) return <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{rating}%</span>;
                    if (rating >= 70) return <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{rating}%</span>;
                    return <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{rating}%</span>;
                  };
                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-center font-medium text-slate-500 align-top">{index + 1}</td>
                      <td className="p-4 align-top"><div className="flex flex-col"><span className="font-bold text-slate-800">{cand.nama}</span><span className="text-[10px] text-slate-400 font-semibold">{cand.id}</span></div></td>
                      <td className="p-4 space-y-0.5 text-slate-500 align-top"><div className="flex flex-col"><span className="font-semibold text-slate-700">{hitungUsia(cand.tanggalLahir)} Tahun</span><span className="text-[10px] text-slate-400">{cand.gender}</span></div></td>
                      <td className="p-4 font-semibold text-slate-800 align-top">{cand.posisiDilamar}</td>
                      <td className="p-4 space-y-0.5 text-slate-500 align-top"><p className="font-medium text-slate-700">{cand.telepon}</p><p>{cand.email}</p></td>
                      <td className="p-4 space-y-0.5 text-slate-600 align-top"><p className="font-semibold text-slate-700">{cand.pendidikan} - {cand.jurusan}</p><p className="text-[10px] text-slate-500">Exp: {cand.pengalaman} Thn ({cand.jabatanTerakhir || 'Fresh Grad'})</p></td>
                      <td className="p-4 space-y-0.5 text-slate-600 align-top"><p className="font-semibold text-slate-700">{cand.statusPekerjaan}</p><p className="text-[10px] text-slate-500">Current: {formatRupiah(cand.currentSalary || 0)}</p><p className="text-[10px] text-slate-500">Expected: {formatRupiah(cand.expectedSalary)}</p></td>
                      <td className="p-4 align-top"><div className="flex items-center gap-1">{getRatingBadge(cand.ratingKecocokan)}<button onClick={() => setSelectedCandidateATS(cand)} className="p-1 hover:bg-slate-100 text-indigo-600 rounded-md" title="Analisis ATS"><Sparkles className="w-3.5 h-3.5" /></button></div></td>
                      <td className="p-4 align-top"><div className="flex items-center gap-1 text-slate-500"><button onClick={() => setPreviewCV(cand)} className="p-1 hover:bg-slate-100 hover:text-indigo-600 rounded-md" title="Preview CV"><Eye className="w-4 h-4" /></button><button onClick={() => handleDownloadCV(cand)} className="p-1 hover:bg-slate-100 hover:text-indigo-600 rounded-md" title="Download CV"><Download className="w-4 h-4" /></button></div></td>
                      <td className="p-4 align-top">
                        <div className="space-y-0.5 min-w-[140px]">
                          {[
                            { key: 'applied', label: 'Applied', date: cand.tanggalApplied },
                            { key: 'screening', label: 'Screening', date: cand.tanggalScreening },
                            { key: 'interview', label: 'Interview', date: cand.tanggalInterview },
                            { key: 'assessment', label: 'Assessment', date: cand.tanggalAssessment },
                            { key: 'offering', label: 'Offering', date: cand.tanggalOffering },
                            { key: 'medical', label: 'Medical', date: cand.tanggalMedical },
                            { key: 'hired', label: 'Hired', date: cand.tanggalHired },
                          ].map((step) => {
                            const isCurrentStep = step.key === cand.tahapProses;
                            const isPast = step.date !== undefined && step.date !== '';
                            const nextStep = ['applied', 'screening', 'interview', 'assessment', 'offering', 'medical', 'hired'].indexOf(cand.tahapProses);
                            const stepIndex = ['applied', 'screening', 'interview', 'assessment', 'offering', 'medical', 'hired'].indexOf(step.key);
                            const isCompleted = stepIndex < nextStep || (stepIndex <= nextStep && isPast);
                            return (
                              <div key={step.key} className={`flex items-center gap-1.5 ${isCurrentStep ? 'bg-indigo-50 px-1 py-0.5 rounded -mx-1' : ''}`}>
                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 border ${isCompleted ? 'bg-emerald-500 border-emerald-300' : isCurrentStep ? 'bg-indigo-500 border-indigo-300 animate-pulse' : 'bg-slate-200 border-slate-300'}`} />
                                <span className={`text-[9px] w-14 shrink-0 ${isCurrentStep ? 'font-bold text-indigo-700' : isCompleted ? 'font-semibold text-slate-600' : 'text-slate-300'}`}>{step.label}</span>
                                <span className={`text-[9px] ${step.date ? 'text-slate-500 font-semibold' : 'text-slate-300'}`}>{step.date || '—'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4 max-w-[150px] truncate text-slate-500 align-top" title={cand.keterangan}>{cand.keterangan || '-'}</td>
                      <td className="p-4 align-top">{getTahapBadge(cand.tahapProses)}</td>
                      <td className="p-4 text-center align-top">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button onClick={() => { setSelectedCandidateEmail(cand); if (cand.tahapProses === 'screening') setEmailStage('interview'); else if (cand.tahapProses === 'interview') setEmailStage('assessment'); else if (cand.tahapProses === 'medical') setEmailStage('offering'); else if (cand.tahapProses === 'offering') setEmailStage('onboarding'); else if (cand.tahapProses === 'rejected') setEmailStage('rejected'); else setEmailStage('interview'); }} className="p-1.5 hover:bg-indigo-50 border border-indigo-100 rounded-md text-indigo-600 hover:text-indigo-800" title={canEmail ? 'Kirim Email Notifikasi' : 'Izin email tidak aktif untuk role Anda'} disabled={!settings.emailSettings.enabled || !canEmail}><Mail className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openWhatsApp(cand)} className={`p-1.5 border rounded-md transition-all ${(settings.whatsappSettings.enabled && canWhatsapp) ? 'hover:bg-emerald-50 border-emerald-100 text-emerald-600 hover:text-emerald-800' : 'border-slate-200 text-slate-300 cursor-not-allowed'}`} title={!canWhatsapp ? 'Izin WhatsApp tidak aktif untuk role Anda' : settings.whatsappSettings.enabled ? 'Kirim WhatsApp' : 'WhatsApp dinonaktifkan di Pengaturan'} disabled={!settings.whatsappSettings.enabled || !canWhatsapp}><MessageCircle className="w-3.5 h-3.5" /></button>
                          {canUpdate && (<button onClick={() => handleOpenEdit(cand)} className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-600 hover:text-indigo-600" title="Edit Data"><Edit3 className="w-3.5 h-3.5" /></button>)}
                          {canDelete && (<button onClick={() => { if (window.confirm(`Hapus data kandidat "${cand.nama}"?`)) onDeleteCandidate(cand.id); }} className="p-1.5 hover:bg-red-50 border border-red-100 rounded-md text-red-500 hover:text-red-700" title="Hapus Data"><Trash2 className="w-3.5 h-3.5" /></button>)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={13} className="p-8 text-center text-slate-400">Tidak ada data kandidat ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">{editingCandidate ? 'Ubah Data Pelamar' : 'Daftarkan Pelamar Baru'}</h3>
                <p className="text-slate-400 text-xs mt-0.5">Lengkapi profil pelamar beserta riwayat pendidikan, gaji, dan tahapan rekrutmen.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap <span className="text-red-500">*</span></label><input type="text" required placeholder="Contoh: Budi Santoso" value={formNama} onChange={(e) => setFormNama(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Email <span className="text-red-500">*</span></label><input type="email" required placeholder="budi@email.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Nomor Telepon <span className="text-red-500">*</span></label><input type="text" required placeholder="0812XXXXXXXX" value={formTelepon} onChange={(e) => setFormTelepon(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Gender <span className="text-red-500">*</span></label><select required value={formGender} onChange={(e) => setFormGender(e.target.value as any)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Tempat Lahir <span className="text-red-500">*</span></label><input type="text" required placeholder="Contoh: Jakarta" value={formTempatLahir} onChange={(e) => setFormTempatLahir(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Tanggal Lahir <span className="text-red-500">*</span></label><input type="date" required value={formTanggalLahir} onChange={(e) => setFormTanggalLahir(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Posisi Dilamar <span className="text-red-500">*</span></label><select required value={formPosisiDilamar} onChange={(e) => setFormPosisiDilamar(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white">{jobs.map(job => (<option key={job.id} value={job.judul}>{job.judul}</option>))}</select></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Status Pekerjaan Saat Ini <span className="text-red-500">*</span></label><select required value={formStatusPekerjaan} onChange={(e) => setFormStatusPekerjaan(e.target.value as any)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"><option value="Aktif Bekerja">Aktif Bekerja</option><option value="Tidak Bekerja">Tidak Bekerja</option><option value="Fresh graduate">Fresh graduate</option></select></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Jabatan/Posisi Terakhir <span className="text-red-500">*</span></label><input type="text" required placeholder="Contoh: Frontend Developer" value={formJabatanTerakhir} onChange={(e) => setFormJabatanTerakhir(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Masa Kerja / Pengalaman (Tahun) <span className="text-red-500">*</span></label><input type="number" required min="0" value={formPengalaman} onChange={(e) => setFormPengalaman(Number(e.target.value))} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Pendidikan Terakhir <span className="text-red-500">*</span></label><select required value={formPendidikan} onChange={(e) => setFormPendidikan(e.target.value as any)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"><option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option><option value="SMA/SMK">SMA/SMK</option></select></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Jurusan Pendidikan <span className="text-red-500">*</span></label><input type="text" required placeholder="Teknik Informatika / DKV" value={formJurusan} onChange={(e) => setFormJurusan(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Current Salary (IDR) <span className="text-red-500">*</span></label><input type="number" required min="0" value={formCurrentSalary} onChange={(e) => setFormCurrentSalary(Number(e.target.value))} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Expected Salary (IDR) <span className="text-red-500">*</span></label><input type="number" required min="0" value={formExpectedSalary} onChange={(e) => setFormExpectedSalary(Number(e.target.value))} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Nama Berkas CV (PDF/DOCX)</label><input type="text" value={formCvName} onChange={(e) => setFormCvName(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Upload Dokumen CV <span className="text-red-500">*</span></label>
                  <input type="file" required={!editingCandidate && !formCvDataUrl} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; setFormCvName(file.name); setFormCvMimeType(file.type || 'application/octet-stream'); const reader = new FileReader(); reader.onloadend = () => setFormCvDataUrl(reader.result as string); reader.readAsDataURL(file); }} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg file:mr-3 file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-indigo-700 focus:outline-none focus:border-indigo-500 text-slate-700 bg-white" />
                  <p className="mt-1 text-[10px] text-slate-400">Format yang didukung: PDF, DOC, DOCX, PNG, JPG.</p>
                  {formCvDataUrl && (<p className="mt-1 text-[10px] font-semibold text-emerald-600">Dokumen siap disimpan: {formCvName}</p>)}
                </div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Tahap Proses</label><select value={formTahapProses} onChange={(e) => setFormTahapProses(e.target.value as any)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white font-bold">{stages.map(stg => (<option key={stg} value={stg}>{stg}</option>))}</select></div>
                {editingCandidate && (<div><label className="text-xs font-bold text-slate-600 block mb-1">ATS Score / Rating Kecocokan (%)</label><input type="number" min={0} max={100} value={formRatingKecocokan} onChange={(e) => setFormRatingKecocokan(Number(e.target.value))} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>)}
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-xs font-extrabold text-slate-400 tracking-wider uppercase block">Tanggal Transaksi Tahapan</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">Apply Date</label><input type="date" required value={formTanggalApplied} onChange={(e) => setFormTanggalApplied(e.target.value)} className="w-full text-[10px] font-semibold px-2 py-1.5 border border-slate-200 rounded text-slate-700" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">Screening Date</label><input type="date" value={formTanggalScreening} onChange={(e) => setFormTanggalScreening(e.target.value)} className="w-full text-[10px] font-semibold px-2 py-1.5 border border-slate-200 rounded text-slate-700" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">Interview Date</label><input type="date" value={formTanggalInterview} onChange={(e) => setFormTanggalInterview(e.target.value)} className="w-full text-[10px] font-semibold px-2 py-1.5 border border-slate-200 rounded text-slate-700" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">Assessment Date</label><input type="date" value={formTanggalAssessment} onChange={(e) => setFormTanggalAssessment(e.target.value)} className="w-full text-[10px] font-semibold px-2 py-1.5 border border-slate-200 rounded text-slate-700" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">Medical Date</label><input type="date" value={formTanggalMedical} onChange={(e) => setFormTanggalMedical(e.target.value)} className="w-full text-[10px] font-semibold px-2 py-1.5 border border-slate-200 rounded text-slate-700" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">Offering Date</label><input type="date" value={formTanggalOffering} onChange={(e) => setFormTanggalOffering(e.target.value)} className="w-full text-[10px] font-semibold px-2 py-1.5 border border-slate-200 rounded text-slate-700" /></div>
                  <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">Hired Date</label><input type="date" value={formTanggalHired} onChange={(e) => setFormTanggalHired(e.target.value)} className="w-full text-[10px] font-semibold px-2 py-1.5 border border-slate-200 rounded text-slate-700" /></div>
                </div>
              </div>
              <div><label className="text-xs font-bold text-slate-600 block mb-1">Catatan Keterangan HR</label><textarea rows={2} placeholder="Catatan tambahan mengenai interview, hasil tes, dll..." value={formKeterangan} onChange={(e) => setFormKeterangan(e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 p-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">Batal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all">{editingCandidate ? 'Simpan Perubahan' : 'Daftarkan Pelamar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCandidateATS && renderATSPanel(selectedCandidateATS)}
      {previewCV && renderCVPreview(previewCV)}
      {selectedCandidateEmail && renderEmailModal(selectedCandidateEmail)}
    </div>
  );
};
