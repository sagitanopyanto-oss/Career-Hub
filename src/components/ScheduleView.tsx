import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock3,
  X,
  UserCheck
} from 'lucide-react';
import { InterviewSchedule, Candidate, Job } from '../data/mockData';

interface ScheduleViewProps {
  schedules: InterviewSchedule[];
  candidates: Candidate[];
  jobs: Job[];
  onAddSchedule: (schedule: InterviewSchedule) => void;
  onUpdateSchedule: (schedule: InterviewSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  candidates,
  jobs,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  canCreate = true,
  canUpdate = true,
  canDelete = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<InterviewSchedule | null>(null);

  // Form Fields
  const [formKandidatId, setFormKandidatId] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formPosisiDilamar, setFormPosisiDilamar] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formWaktu, setFormWaktu] = useState('10:00');
  const [formType, setFormType] = useState<'Technical' | 'HR' | 'User' | 'Final'>('Technical');
  const [formMethod, setFormMethod] = useState<'Phone' | 'Online' | 'Offline'>('Online');
  const [formStatus, setFormStatus] = useState<'Schedule' | 'Completed' | 'Cancelled'>('Schedule');
  const [formInterviewer, setFormInterviewer] = useState('');

  // Candidate Search UI State
  const [candSearchInput, setCandSearchInput] = useState('');
  const [showCandDropdown, setShowCandDropdown] = useState(false);

  // Filter candidates for the search dropdown
  const searchedCandidates = candidates.filter(c => {
    return c.nama.toLowerCase().includes(candSearchInput.toLowerCase()) ||
           c.id.toLowerCase().includes(candSearchInput.toLowerCase());
  });

  const handleSelectCandidate = (cand: Candidate) => {
    // Find candidate's job to get department
    const matchedJob = jobs.find(j => j.judul === cand.posisiDilamar || j.id === cand.posisiDilamar);
    const dept = matchedJob ? matchedJob.department : "Technology"; // Fallback to Tech

    setFormKandidatId(cand.id);
    setFormNama(cand.nama);
    setFormPosisiDilamar(cand.posisiDilamar);
    setFormDepartment(dept);
    
    // Auto-fill input text with the selected candidate's name/ID
    setCandSearchInput(`${cand.id} - ${cand.nama}`);
    setShowCandDropdown(false);
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setFormKandidatId('');
    setFormNama('');
    setFormPosisiDilamar('');
    setFormDepartment('');
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormWaktu('10:00');
    setFormType('Technical');
    setFormMethod('Online');
    setFormStatus('Schedule');
    setFormInterviewer('');
    setCandSearchInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sched: InterviewSchedule) => {
    setEditingSchedule(sched);
    setFormKandidatId(sched.kandidatId);
    setFormNama(sched.nama);
    setFormPosisiDilamar(sched.posisiDilamar);
    setFormDepartment(sched.department);
    setFormTanggal(sched.tanggal);
    setFormWaktu(sched.waktu);
    setFormType(sched.type);
    setFormMethod(sched.method);
    setFormStatus(sched.status);
    setFormInterviewer(sched.interviewer);
    
    setCandSearchInput(`${sched.kandidatId} - ${sched.nama}`);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKandidatId) {
      alert("Harap pilih kandidat terlebih dahulu!");
      return;
    }

    const schedData: InterviewSchedule = {
      id: editingSchedule ? editingSchedule.id : `INT-${Math.floor(100 + Math.random() * 900)}`,
      kandidatId: formKandidatId,
      nama: formNama,
      posisiDilamar: formPosisiDilamar,
      department: formDepartment,
      tanggal: formTanggal,
      waktu: formWaktu,
      type: formType,
      method: formMethod,
      status: formStatus,
      interviewer: formInterviewer
    };

    if (editingSchedule) {
      onUpdateSchedule(schedData);
    } else {
      onAddSchedule(schedData);
    }
    setIsModalOpen(false);
  };

  // Filter Schedules
  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.interviewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.posisiDilamar.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-sans">Jadwal Interview Kandidat</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Atur jadwal temu, tipe interview, user penilai, dan status wawancara.</p>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs sm:text-sm transition-all self-start lg:self-auto whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Buat Jadwal Baru
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari jadwal berdasarkan nama kandidat, user, atau posisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
          />
        </div>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((sched) => {
            const getMethodIcon = (method: string) => {
              switch (method) {
                case 'Online':
                  return <Video className="w-4 h-4 text-blue-500" />;
                case 'Phone':
                  return <Phone className="w-4 h-4 text-teal-500" />;
                default:
                  return <MapPin className="w-4 h-4 text-emerald-500" />;
              }
            };

            const getStatusBadge = (status: string) => {
              switch (status) {
                case 'Completed':
                  return (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                    </span>
                  );
                case 'Cancelled':
                  return (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      <XCircle className="w-3.5 h-3.5" /> Dibatalkan
                    </span>
                  );
                default:
                  return (
                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      <Clock3 className="w-3.5 h-3.5" /> Terjadwal
                    </span>
                  );
              }
            };

            return (
              <div key={sched.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4 hover:shadow-md transition-shadow relative">
                {/* Header card */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{sched.department}</span>
                    <h3 className="font-extrabold text-slate-800 text-base leading-tight mt-0.5">{sched.nama}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{sched.posisiDilamar}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(sched.status)}
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      ID: {sched.kandidatId}
                    </span>
                  </div>
                </div>

                {/* Date & Time / Method */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="space-y-1 text-slate-600">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">JADWAL INTERVIEW</span>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {sched.tanggal}
                    </p>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {sched.waktu} WIB
                    </p>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">TIPE & METODE</span>
                    <p className="font-semibold text-slate-800">
                      Type: <b className="text-indigo-600">{sched.type}</b>
                    </p>
                    <p className="font-semibold text-slate-800 flex items-center gap-1">
                      {getMethodIcon(sched.method)} {sched.method}
                    </p>
                  </div>
                </div>

                {/* Interviewer details */}
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>User/Interviewer: <b className="text-slate-800">{sched.interviewer || 'Belum Ditentukan'}</b></span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {canUpdate && (
                      <button
                        onClick={() => handleOpenEdit(sched)}
                        className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600"
                        title="Edit Jadwal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus jadwal interview untuk "${sched.nama}"?`)) {
                            onDeleteSchedule(sched.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 border border-red-100 rounded-lg text-red-500 hover:text-red-700"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-base">Tidak ada jadwal wawancara</h4>
            <p className="text-slate-400 text-xs mt-1">Gunakan tombol "Buat Jadwal Baru" untuk menjadwalkan wawancara pelamar.</p>
          </div>
        )}
      </div>

      {/* CRUD Modal Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {editingSchedule ? 'Ubah Informasi Jadwal' : 'Buat Jadwal Interview'}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Tautkan kandidat, tentukan waktu wawancara, tipe, dan pewawancara.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Candidate Search / Auto Direct Field */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Kandidat Pelamar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ketik ID atau Nama Kandidat..."
                  value={candSearchInput}
                  onChange={(e) => {
                    setCandSearchInput(e.target.value);
                    setShowCandDropdown(true);
                    if (!e.target.value) {
                      setFormKandidatId('');
                      setFormNama('');
                      setFormPosisiDilamar('');
                      setFormDepartment('');
                    }
                  }}
                  onFocus={() => setShowCandDropdown(true)}
                  className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 placeholder:text-slate-400"
                />

                {/* Candidate Suggestions */}
                {showCandDropdown && candSearchInput && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {searchedCandidates.length > 0 ? (
                      searchedCandidates.map(cand => (
                        <div
                          key={cand.id}
                          onClick={() => handleSelectCandidate(cand)}
                          className="px-3.5 py-2 hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{cand.nama}</span>
                            <p className="text-slate-400 text-[10px]">{cand.posisiDilamar}</p>
                          </div>
                          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {cand.id}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-400 italic text-center">
                        Tidak ada kandidat ditemukan.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Read Only Auto Filled Fields */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">NAMA KANDIDAT</span>
                  <span className="font-bold text-slate-800 block truncate">{formNama || 'Automated fill...'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">POSISI DILAMAR</span>
                  <span className="font-bold text-slate-800 block truncate">{formPosisiDilamar || 'Automated fill...'}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/50">
                  <span className="text-slate-400 block font-bold text-[9px] uppercase">DEPARTEMEN</span>
                  <span className="font-bold text-slate-800 block truncate">{formDepartment || 'Automated fill...'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Waktu (WIB)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 14:00"
                    value={formWaktu}
                    onChange={(e) => setFormWaktu(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                {/* Interview Type */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Tipe Interview</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="User">User</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                {/* Method */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Metode Interview</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"
                  >
                    <option value="Online">Online</option>
                    <option value="Phone">Phone</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"
                  >
                    <option value="Schedule">Schedule</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Interviewer */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Interviewer (User)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aditya (VP Engineering)"
                    value={formInterviewer}
                    onChange={(e) => setFormInterviewer(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 p-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all"
                >
                  {editingSchedule ? 'Simpan Jadwal' : 'Buat Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
