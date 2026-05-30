import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Download,
  FileText,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle,
  Filter,
  Mail,
  Send,
  MessageCircle,
} from 'lucide-react';
import {
  Candidate,
  Job,
  AppSettings,
  AdminUser,
} from '../data/mockData';

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
  candidates,
  jobs,
  settings,
  currentUser,
  onAddCandidate,
  onUpdateCandidate,
  onDeleteCandidate,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  canEmail = true,
  canWhatsapp = true,
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

  const hitungUsia = (tglLahir?: string): number => {
    if (!tglLahir) return 0;
    const birthDate = new Date(tglLahir);
    const today = new Date('2026-02-28');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const openWhatsApp = (cand: Candidate) => {
    if (!canWhatsapp) {
      alert('⛔ Akses Ditolak\n\nRole Anda tidak memiliki izin untuk mengirim WhatsApp.\nHubungi administrator jika Anda memerlukan akses ini.');
      return;
    }
    if (!settings.whatsappSettings.enabled) {
      alert('Fitur WhatsApp konfirmasi sedang dinonaktifkan pada menu Pengaturan.');
      return;
    }
    let phone = cand.telepon.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);
    else if (!phone.startsWith('62')) phone = '62' + phone;

    const draft = settings.whatsappSettings.confirmationTemplate
      .replace(/{nama}/g, cand.nama)
      .replace(/{posisi}/g, cand.posisiDilamar)
      .replace(/{email}/g, cand.email)
      .replace(/{telepon}/g, cand.telepon);

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(draft)}`, '_blank');
  };

  const handleOpenAdd = () => {
    setEditingCandidate(null);
    setFormNama('');
    setFormTelepon('');
    setFormEmail('');
    setFormGender('Laki-laki');
    setFormTempatLahir('');
    setFormTanggalLahir('1998-01-01');
    setFormPendidikan('S1');
    setFormJurusan('');
    setFormPosisiDilamar(jobs.length > 0 ? jobs[0].judul : 'Senior React Developer');
    setFormPengalaman(2);
    setFormStatusPekerjaan('Aktif Bekerja');
    setFormJabatanTerakhir('');
    setFormCurrentSalary(0);
    setFormExpectedSalary(8000000);
    setFormTahapProses('applied');
    setFormRatingKecocokan(75);
    setFormCvName('CV_Resume.pdf');
    setFormCvDataUrl('');
    setFormCvMimeType('');
    setFormKeterangan('');
    setFormTanggalApplied(new Date().toISOString().split('T')[0]);
    setFormTanggalScreening('');
    setFormTanggalInterview('');
    setFormTanggalAssessment('');
    setFormTanggalOffering('');
    setFormTanggalMedical('');
    setFormTanggalHired('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormNama(cand.nama);
    setFormTelepon(cand.telepon);
    setFormEmail(cand.email);
    setFormGender(cand.gender);
    setFormTempatLahir(cand.tempatLahir || '');
    setFormTanggalLahir(cand.tanggalLahir || '1998-01-01');
    setFormPendidikan(cand.pendidikan);
    setFormJurusan(cand.jurusan);
    setFormPosisiDilamar(cand.posisiDilamar);
    setFormPengalaman(cand.pengalaman);
    setFormStatusPekerjaan(cand.statusPekerjaan);
    setFormJabatanTerakhir(cand.jabatanTerakhir);
    setFormCurrentSalary(cand.currentSalary || 0);
    setFormExpectedSalary(cand.expectedSalary);
    setFormTahapProses(cand.tahapProses);
    setFormRatingKecocokan(cand.ratingKecocokan);
    setFormCvName(cand.cvName);
    setFormCvDataUrl(cand.cvDataUrl || '');
    setFormCvMimeType(cand.cvMimeType || '');
    setFormKeterangan(cand.keterangan);
    setFormTanggalApplied(cand.tanggalApplied);
    setFormTanggalScreening(cand.tanggalScreening || '');
    setFormTanggalInterview(cand.tanggalInterview || '');
    setFormTanggalAssessment(cand.tanggalAssessment || '');
    setFormTanggalOffering(cand.tanggalOffering || '');
    setFormTanggalMedical(cand.tanggalMedical || '');
    setFormTanggalHired(cand.tanggalHired || '');
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
        setTimeout(() => {
          dl.click();
          document.body.removeChild(dl);
          URL.revokeObjectURL(url);
        }, 600);
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

    // Mock CV content for download if no real file
    const mockContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
>>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
>>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
>>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 50 700 Td (CV - ${cand.nama}) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000359 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
>>
startxref
415
%%EOF`;
    const blob = new Blob([mockContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    element.href = url;
    element.download = cand.cvName.includes('.pdf') ? cand.cvName : cand.cvName.replace(/.[^.]+$/, '') + '.pdf';
    document.body.appendChild(element);
    setTimeout(() => {
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    }, 400);
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
      nama: formNama,
      telepon: formTelepon,
      email: formEmail,
      gender: formGender,
      tempatLahir: formTempatLahir,
      tanggalLahir: formTanggalLahir,
      pendidikan: formPendidikan,
      jurusan: formJurusan,
      posisiDilamar: formPosisiDilamar,
      pengalaman: Number(formPengalaman),
      statusPekerjaan: formStatusPekerjaan,
      jabatanTerakhir: formJabatanTerakhir,
      currentSalary: Number(formCurrentSalary),
      expectedSalary: Number(formExpectedSalary),
      tahapProses: formTahapProses,
      ratingKecocokan: calculatedRating,
      cvName: formCvName || 'CV_Resume.pdf',
      cvDataUrl: formCvDataUrl || undefined,
      cvMimeType: formCvMimeType || undefined,
      tanggalApplied: formTanggalApplied,
      tanggalScreening: formTanggalScreening || undefined,
      tanggalInterview: formTanggalInterview || undefined,
      tanggalAssessment: formTanggalAssessment || undefined,
      tanggalOffering: formTanggalOffering || undefined,
      tanggalMedical: formTanggalMedical || undefined,
      tanggalHired: formTanggalHired || undefined,
      keterangan: formKeterangan,
    };
    if (editingCandidate) onUpdateCandidate(candData);
    else onAddCandidate(candData);
    setIsModalOpen(false);
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
                    <span key={i} className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      ✓ {s}
                    </span>
                  ))}
                  {matchedSkills.length === 0 && (
                    <span className="text-slate-400 text-xs italic">Tidak ada keahlian yang terdeteksi cocok.</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 w-full font-bold">Keahlian Kurang (Gap):</span>
                  {missingSkills.map((s, i) => (
                    <span key={i} className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                      ✗ {s}
                    </span>
                  ))}
                  {missingSkills.length === 0 && (
                    <span className="text-slate-400 text-xs italic">Semua keahlian terpenuhi!</span>
                  )}
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
            <button onClick={() => setPreviewCV(null)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-0 sm:p-6 bg-slate-50/50 flex-1 overflow-y-auto max-h-[75vh]">
            <div className="bg-white shadow-sm border border-slate-200 w-full max-w-2xl mx-auto sm:rounded-xl overflow-hidden min-h-[500px]">
              <div className="bg-indigo-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{cand.nama}</h1>
                  <p className="text-indigo-200 font-semibold mt-1">{cand.jabatanTerakhir || cand.posisiDilamar}</p>
                </div>
                <div className="text-right flex flex-col gap-1 text-xs text-indigo-100">
                  <span className="flex items-center sm:justify-end gap-2">
                    <span className="w-4 text-center">✉</span>
                    {cand.email}
                  </span>
                  <span className="flex items-center sm:justify-end gap-2">
                    <span className="w-4 text-center">☎</span>
                    {cand.telepon}
                  </span>
                  <span className="flex items-center sm:justify-end gap-2">
                    <span className="w-4 text-center">⚐</span>
                    Indonesia
                  </span>
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
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">Top Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedJob ? matchedJob.skills.slice(0, 5).map(s => (
                      <span key={s} className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">
                        {s}
                      </span>
                    )) : (
                      <span className="text-xs text-slate-44
