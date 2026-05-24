import React, { useState } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Calendar, Clock, Video, Phone, MapPin, 
  CheckCircle2, XCircle, Clock3, X, UserCheck
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
  schedules, candidates, jobs,
  onAddSchedule, onUpdateSchedule, onDeleteSchedule,
  canCreate = true, canUpdate = true, canDelete = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
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

  const searchedCandidates = candidates.filter(c => 
    c.nama.toLowerCase().includes(candSearchInput.toLowerCase()) ||
    c.id.toLowerCase().includes(candSearchInput.toLowerCase())
  );

  const handleSelectCandidate = (cand: Candidate) => {
    const matchedJob = jobs.find(j => j.judul === cand.posisiDilamar || j.id === cand.posisiDilamar);
    const dept = matchedJob ? matchedJob.department : "Technology";
    setFormKandidatId(cand.id);
    setFormNama(cand.nama);
    setFormPosisiDilamar(cand.posisiDilamar);
    setFormDepartment(dept);
    setCandSearchInput(`${cand.id} - ${cand.nama}`);
    setShowCandDropdown(false);
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setFormKandidatId(''); setFormNama(''); setFormPosisiDilamar(''); setFormDepartment('');
    setFormTanggal(new Date().toISOString().split('T')[0]); setFormWaktu('10:00');
    setFormType('Technical'); setFormMethod('Online'); setFormStatus('Schedule');
    setFormInterviewer(''); setCandSearchInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sched: InterviewSchedule) => {
    setEditingSchedule(sched);
    setFormKandidatId(sched.kandidatId); setFormNama(sched.nama);
    setFormPosisiDilamar(sched.posisiDilamar); setFormDepartment(sched.department);
    setFormTanggal(sched.tanggal); setFormWaktu(sched.waktu);
    setFormType(sched.type); setFormMethod(sched.method);
    setFormStatus(sched.status); setFormInterviewer(sched.interviewer);
    setCandSearchInput(`${sched.kandidatId} - ${sched.nama}`);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKandidatId) { alert("Harap pilih kandidat terlebih dahulu!"); return; }
    const schedData: InterviewSchedule = {
      id: editingSchedule ? editingSchedule.id : `INT-${Math.floor(100 + Math.random() * 900)}`,
      kandidatId: formKandidatId, nama: formNama, posisiDilamar: formPosisiDilamar,
      department: formDepartment, tanggal: formTanggal, waktu: formWaktu,
      type: formType, method: formMethod, status: formStatus, interviewer: formInterviewer
    };
    editingSchedule ? onUpdateSchedule(schedData) : onAddSchedule(schedData);
    setIsModalOpen(false);
  };

  const filteredSchedules = schedules.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.interviewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.posisiDilamar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Helper Components (Dipisah agar tidak dirender ulang di dalam loop)
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Online': return <Video className="w-3.5 h-3.5 text-blue-500" />;
      case 'Phone': return <Phone className="w-3.5 h-3.5 text-teal-500" />;
      default: return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Selesai</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100"><XCircle className="w-3 h-3" /> Dibatalkan</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"><Clock3 className="w-3 h-3" /> Terjadwal</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight font-sans">Jadwal Interview Kandidat</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Atur jadwal temu, tipe interview, user penilai, dan status wawancara.</p>
        </div>
        {canCreate && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs sm:text-sm transition-all self-start lg:self-auto whitespace-nowrap">
            <Plus className="w-4 h-4" /> Buat Jadwal Baru
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input type="text" placeholder="Cari jadwal berdasarkan nama kandidat, user, atau posisi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" />
        </div>
      </div>

      {/* 🟢 TABEL DATA (PENGGANTI CARD GRID) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider w-12">No</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Kandidat</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Posisi & Dept</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Jadwal</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Tipe & Metode</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Interviewer</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((sched, idx) => (
                  <tr key={sched.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{sched.nama}</div>
                      <div className="text-[10px] text-slate-400 font-medium">ID: {sched.kandidatId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{sched.posisiDilamar}</div>
                      <div className="text-[10px] text-slate-400">{sched.department}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {sched.tanggal}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {sched.waktu} WIB
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{sched.type}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        {getMethodIcon(sched.method)} {sched.method}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{sched.interviewer || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(sched.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {canUpdate && (
                          <button onClick={() => handleOpenEdit(sched)} className="p-1.5 hover:bg-indigo-50 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors" title="Edit Jadwal">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => { if(window.confirm(`Hapus jadwal interview untuk "${sched.nama}"?`)) onDeleteSchedule(sched.id); }} className="p-1.5 hover:bg-red-50 border border-red-100 rounded-lg text-red-500 hover:text-red-700 transition-colors" title="Hapus Jadwal">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">Tidak ada jadwal wawancara</p>
                    <p className="text-slate-400 text-xs mt-1">Gunakan tombol "Buat Jadwal Baru" untuk menambahkan jadwal.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal (TIDAK BERUBAH) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-start sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-4 sm:my-8">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">{editingSchedule ? 'Ubah Informasi Jadwal' : 'Buat Jadwal Interview'}</h3>
                <p className="text-slate-400 text-xs mt-0.5">Tautkan kandidat, tentukan waktu wawancara, tipe, dan pewawancara.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="relative">
                <label className="text-xs font-bold text-slate-600 block mb-1">Kandidat Pelamar <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Ketik ID atau Nama Kandidat..." value={candSearchInput} onChange={(e) => { setCandSearchInput(e.target.value); setShowCandDropdown(true); if(!e.target.value) { setFormKandidatId(''); setFormNama(''); setFormPosisiDilamar(''); setFormDepartment(''); } }} onFocus={() => setShowCandDropdown(true)} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 placeholder:text-slate-400" />
                {showCandDropdown && candSearchInput && (
                  <div className="absolute z-10 w-full bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {searchedCandidates.length > 0 ? searchedCandidates.map(cand => (
                      <div key={cand.id} onClick={() => handleSelectCandidate(cand)} className="px-3.5 py-2 hover:bg-slate-50 cursor-pointer text-xs flex justify-between items-center">
                        <div><span className="font-bold text-slate-800">{cand.nama}</span><p className="text-slate-400 text-[10px]">{cand.posisiDilamar}</p></div>
                        <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{cand.id}</span>
                      </div>
                    )) : <div className="p-3 text-xs text-slate-400 italic text-center">Tidak ada kandidat ditemukan.</div>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                <div><span className="text-slate-400 block font-bold text-[9px] uppercase">NAMA KANDIDAT</span><span className="font-bold text-slate-800 block truncate">{formNama || 'Automated fill...'}</span></div>
                <div><span className="text-slate-400 block font-bold text-[9px] uppercase">POSISI DILAMAR</span><span className="font-bold text-slate-800 block truncate">{formPosisiDilamar || 'Automated fill...'}</span></div>
                <div className="col-span-2 pt-2 border-t border-slate-200/50"><span className="text-slate-400 block font-bold text-[9px] uppercase">DEPARTEMEN</span><span className="font-bold text-slate-800 block truncate">{formDepartment || 'Automated fill...'}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Tanggal</label><input type="date" required value={formTanggal} onChange={(e) => setFormTanggal(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Waktu (WIB)</label><input type="text" required placeholder="Contoh: 14:00" value={formWaktu} onChange={(e) => setFormWaktu(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Tipe Interview</label><select value={formType} onChange={(e) => setFormType(e.target.value as any)} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"><option value="Technical">Technical</option><option value="HR">HR</option><option value="User">User</option><option value="Final">Final</option></select></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Metode Interview</label><select value={formMethod} onChange={(e) => setFormMethod(e.target.value as any)} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"><option value="Online">Online</option><option value="Phone">Phone</option><option value="Offline">Offline</option></select></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Status</label><select value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700 bg-white"><option value="Schedule">Schedule</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">Interviewer (User)</label><input type="text" required placeholder="Contoh: Aditya (VP Engineering)" value={formInterviewer} onChange={(e) => setFormInterviewer(e.target.value)} className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-700" /></div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 p-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">Batal</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 transition-all">{editingSchedule ? 'Simpan Jadwal' : 'Buat Jadwal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
