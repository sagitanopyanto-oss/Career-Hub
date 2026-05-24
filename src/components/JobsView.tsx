import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  EyeOff, 
  Eye,
  Briefcase, 
  MapPin, 
  Layers, 
  DollarSign, 
  X,
  CheckCircle2,
  Award,
  ListChecks,
  Gift,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { Job } from '../data/mockData';

interface JobsViewProps {
  jobs: Job[];
  onAddJob: (job: Job) => void;
  onUpdateJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  canCreate = true,
  canUpdate = true,
  canDelete = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Review modal state
  const [reviewJob, setReviewJob] = useState<Job | null>(null);
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
  const [appCvMime, setAppCvMime] = useState('');
  const [appCoverLetter, setAppCoverLetter] = useState('');

  // Form states
  const [formJudul, setFormJudul] = useState('');
  const [formDept, setFormDept] = useState('Technology');
  const [formType, setFormType] = useState<'Full time' | 'Contract' | 'Part time' | 'Freelance'>('Full time');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Draft' | 'Non aktif'>('Aktif');
  const [formSalaryMin, setFormSalaryMin] = useState(5000000);
  const [formSalaryMax, setFormSalaryMax] = useState(10000000);
  const [formHideSalary, setFormHideSalary] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formResponsibilities, setFormResponsibilities] = useState('');
  const [formQualifications, setFormQualifications] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formBenefits, setFormBenefits] = useState('');

  const openAddModal = () => {
    setEditingJob(null);
    setFormJudul('');
    setFormDept('Technology');
    setFormType('Full time');
    setFormStatus('Aktif');
    setFormSalaryMin(8000000);
    setFormSalaryMax(15000000);
    setFormHideSalary(false);
    setFormDescription('');
    setFormResponsibilities('');
    setFormQualifications('');
    setFormSkills('');
    setFormBenefits('');
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormJudul(job.judul);
    setFormDept(job.department);
    setFormType(job.type);
    setFormStatus(job.status);
    setFormSalaryMin(job.salaryMin);
    setFormSalaryMax(job.salaryMax);
    setFormHideSalary(job.hideSalary);
    setFormDescription(job.description);
    setFormResponsibilities(job.responsibilities.join('\n'));
    setFormQualifications(job.qualifications.join('\n'));
    setFormSkills(job.skills.join(', '));
    setFormBenefits(job.benefits.join('\n'));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim()) return;

    // Convert newlines to array
    const responsibilities = formResponsibilities.split('\n').map(r => r.trim()).filter(Boolean);
    const qualifications = formQualifications.split('\n').map(q => q.trim()).filter(Boolean);
    const skills = formSkills.split(',').map(s => s.trim()).filter(Boolean);
    const benefits = formBenefits.split('\n').map(b => b.trim()).filter(Boolean);

    const jobData: Job = {
      id: editingJob ? editingJob.id : `JOB-${Math.floor(100 + Math.random() * 900)}`,
      judul: formJudul,
      department: formDept,
      type: formType,
      status: formStatus,
      salaryMin: Number(formSalaryMin),
      salaryMax: Number(formSalaryMax),
      hideSalary: formHideSalary,
      description: formDescription,
      responsibilities,
      qualifications,
      skills,
      benefits,
      createdAt: editingJob ? editingJob.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingJob) {
      onUpdateJob(jobData);
    } else {
      onAddJob(jobData);
    }
    setIsModalOpen(false);
  };

  const resetAppForm = () => {
    setAppNama(''); setAppEmail(''); setAppTelepon(''); setAppGender('Laki-laki');
    setAppTempatLahir(''); setAppTanggalLahir(''); setAppPendidikan('S1');
    setAppJurusan(''); setAppJabatan(''); setAppPengalaman(0);
    setAppStatusKerja('Tidak Bekerja'); setAppCurSalary(0); setAppExpSalary(0);
    setAppCvData(''); setAppCvName(''); setAppCvMime(''); setAppCoverLetter('');
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNama.trim()) return;

    // Capture application data (simulation)
    const appData = {
      nama: appNama,
      email: appEmail,
      telepon: appTelepon,
      job: reviewJob?.judul,
      cv: appCvName,
      cvData: appCvData,
      cvMime: appCvMime,
      coverLetter: appCoverLetter
    };

    console.log('Application Submitted:', appData);
    alert(`Terima kasih ${appNama}! Lamaran Anda untuk posisi ${reviewJob?.judul} telah terkirim.`);
    
    setIsApplying(false);
    setReviewJob(null);
    resetAppForm();
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.judul.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === 'All' || job.department === selectedDept;
    const matchesType = selectedType === 'All' || job.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || job.status === selectedStatus;
    
    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Portal Lowongan Kerja</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Kelola postingan pekerjaan, kualifikasi, deskripsi, dan penawaran gaji.</p>
        </div>
        {canCreate && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs sm:text-sm transition-all self-start lg:self-auto whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Tambah Lowongan Baru
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul / skill pekerjaan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Department */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">Semua Departmen</option>
            <option value="Technology">Technology</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Product Design">Product Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">Semua Tipe Pekerjaan</option>
            <option value="Full time">Full time</option>
            <option value="Contract">Contract</option>
            <option value="Part time">Part time</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Draft">Draft</option>
            <option value="Non aktif">Non aktif</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Status Ribbon */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-md tracking-wider ${
                  job.status === 'Aktif' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : job.status === 'Draft' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {job.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{job.department}</span>
                <h3 className="font-extrabold text-slate-800 text-lg mt-0.5 leading-tight pr-14">{job.judul}</h3>
                
                <div className="flex flex-wrap gap-2.5 mt-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                    <Briefcase className="w-3.5 h-3.5" /> {job.type}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                    <MapPin className="w-3.5 h-3.5" /> Jakarta, Indonesia
                  </span>
                </div>

                {/* Salary Info */}
                <div className="mt-4 flex items-center gap-1.5 text-slate-600">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold">Gaji Ditawarkan:</span>
                  {job.hideSalary ? (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                      <EyeOff className="w-3.5 h-3.5" /> Rahasia / Hidden
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-800">
                      {formatRupiah(job.salaryMin)} - {formatRupiah(job.salaryMax)}
                    </span>
                  )}
                </div>

                {/* Description snippet */}
                <p className="mt-4 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="mt-5 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Required Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">Dibuat: {job.createdAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReviewJob(job)}
                    className="p-2 hover:bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg hover:text-indigo-700 transition-colors"
                    title="Review Detail Lowongan"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canUpdate && (
                    <button
                      onClick={() => openEditModal(job)}
                      className="p-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:text-indigo-600 transition-colors"
                      title="Edit Lowongan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus lowongan "${job.judul}"?`)) {
                          onDeleteJob(job.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 border border-red-100 text-red-500 rounded-lg hover:text-red-700 transition-colors"
                      title="Hapus Lowongan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-base">Tidak ada lowongan ditemukan</h4>
            <p className="text-slate-400 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter kategori Anda.</p>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {reviewJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
            {/* Review Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-start">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">{reviewJob.department}</span>
                <h3 className="font-extrabold text-lg sm:text-xl mt-1 leading-tight">{reviewJob.judul}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">{reviewJob.type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    reviewJob.status === 'Aktif' ? 'bg-emerald-400/30 text-emerald-100' :
                    reviewJob.status === 'Draft' ? 'bg-amber-400/30 text-amber-100' :
                    'bg-slate-400/30 text-slate-200'
                  }`}>{reviewJob.status}</span>
                </div>
              </div>
              <button 
                onClick={() => setReviewJob(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Review Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {!isApplying ? (
                <>
                  {/* Salary */}
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <DollarSign className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gaji Ditawarkan</span>
                      {reviewJob.hideSalary ? (
                        <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                          <EyeOff className="w-4 h-4" /> Dirahasiakan
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-800">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(reviewJob.salaryMin)} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(reviewJob.salaryMax)}
                        </span>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-semibold">{reviewJob.createdAt}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" /> Deskripsi Pekerjaan
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{reviewJob.description}</p>
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                      <ListChecks className="w-4 h-4 text-indigo-500" /> Tugas & Tanggung Jawab
                    </h4>
                    <ul className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {reviewJob.responsibilities.map((r, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-indigo-500" /> Kualifikasi
                    </h4>
                    <ul className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {reviewJob.qualifications.map((q, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-indigo-400 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Keahlian Yang Dibutuhkan</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {reviewJob.skills.map((s, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-100">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-indigo-500" /> Benefit & Fasilitas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {reviewJob.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-medium">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Applicant Form */
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
                          setAppCvMime(file.type);
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
                        placeholder="Tulis surat lamaran atau ringkasan resume Anda di sini. Jelaskan mengapa Anda tertarik dengan posisi ini dan bagaimana kualifikasi Anda sesuai dengan kebutuhan perusahaan..."
                      />
                      <p className="text-[9px] text-slate-400 mt-1">Minimal 100 karakter. Gunakan ruang ini untuk menyoroti pencapaian dan motivasi Anda.</p>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Review Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              {!isApplying ? (
                <>
                  <button
                    onClick={() => { setReviewJob(null); openEditModal(reviewJob); }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Lowongan
                  </button>
                  <button
                    onClick={() => setIsApplying(true)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all"
                  >
                    Lamar Sekarang
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setIsApplying(false); resetAppForm(); }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    form="applicantForm"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/10 transition-all"
                  >
                    Kirim Lamaran
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {editingJob ? 'Edit Informasi Lowongan' : 'Tambah Lowongan Baru'}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Lengkapi form di bawah untuk mempublikasikan / menyimpan draf pekerjaan.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Judul Pekerjaan <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Senior React Developer"
                    value={formJudul}
                    onChange={(e) => setFormJudul(e.target.value)}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Departemen</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tipe Pekerjaan</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"
                  >
                    <option value="Full time">Full time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part time">Part time</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status Lowongan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Draft">Draft</option>
                    <option value="Non aktif">Non aktif</option>
                  </select>
                </div>

                {/* Hide Salary Checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="hideSalary"
                    checked={formHideSalary}
                    onChange={(e) => setFormHideSalary(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="hideSalary" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-1">
                    Sembunyikan Nilai Gaji di Publik
                  </label>
                </div>

                {/* Salary Min */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Min Salary (IDR)</label>
                  <input
                    type="number"
                    value={formSalaryMin}
                    onChange={(e) => setFormSalaryMin(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                {/* Salary Max */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Max Salary (IDR)</label>
                  <input
                    type="number"
                    value={formSalaryMax}
                    onChange={(e) => setFormSalaryMax(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Deskripsi Pekerjaan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan overview / deskripsi umum dari posisi pekerjaan..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Tugas & Tanggung Jawab <span className="text-slate-400 font-medium">(Satu baris untuk setiap poin)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Mengembangkan frontend menggunakan React&#10;Melakukan testing aplikasi&#10;Melakukan review code tim"
                  value={formResponsibilities}
                  onChange={(e) => setFormResponsibilities(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>

              {/* Qualifications */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Kualifikasi <span className="text-slate-400 font-medium">(Satu baris untuk setiap poin)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Pengalaman kerja minimal 3 tahun&#10;Menguasai framework CSS Tailwind&#10;Pendidikan minimal S1 Informatika"
                  value={formQualifications}
                  onChange={(e) => setFormQualifications(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Keahlian / Skills <span className="text-slate-400 font-medium">(Pisahkan dengan tanda koma)</span>
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind CSS, Git"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>

              {/* Benefits */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Benefit / Keuntungan <span className="text-slate-400 font-medium">(Satu baris untuk setiap poin)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Asuransi Kesehatan Swasta&#10;Laptop Macbook Pro&#10;WFA / Jam kerja fleksibel"
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                />
              </div>

              {/* Footer Form */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 p-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all"
                >
                  {editingJob ? 'Simpan Perubahan' : 'Publish Lowongan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
