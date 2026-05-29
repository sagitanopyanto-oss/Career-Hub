export interface Job {
  id: string;
  judul: string;
  department: string;
  type: 'Full time' | 'Contract' | 'Part time' | 'Freelance';
  status: 'Aktif' | 'Draft' | 'Non aktif';
  salaryMin: number;
  salaryMax: number;
  hideSalary: boolean;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  benefits: string[];
  createdAt: string;
}

export interface Candidate {
  id: string;
  nama: string;
  telepon: string;
  email: string;
  gender: 'Laki-laki' | 'Perempuan';
  tempatLahir: string;
  tanggalLahir: string;
  pendidikan: 'D3' | 'S1' | 'S2' | 'SMA/SMK';
  jurusan: string;
  posisiDilamar: string;
  pengalaman: number; // in years
  statusPekerjaan: 'Aktif Bekerja' | 'Tidak Bekerja' | 'Fresh graduate';
  jabatanTerakhir: string;
  currentSalary?: number;
  expectedSalary: number;
  tahapProses: 'applied' | 'screening' | 'interview' | 'assessment' | 'offering' | 'medical' | 'hired' | 'rejected';
  ratingKecocokan: number; // percentage 0-100
  cvName: string;
  cvDataUrl?: string;
  cvMimeType?: string;
  tanggalApplied: string;
  tanggalScreening?: string;
  tanggalInterview?: string;
  tanggalAssessment?: string;
  tanggalOffering?: string;
  tanggalMedical?: string;
  tanggalHired?: string;
  keterangan: string;
}

// 🔹 PERBAIKAN INTERFACE: Tambah field hasilInterview & keterangan
export interface InterviewSchedule {
  id: string;
  kandidatId: string;
  nama: string;
  posisiDilamar: string;
  department: string;
  tanggal: string;
  waktu: string;
  type: 'Technical' | 'HR' | 'User' | 'Final';
  method: 'Phone' | 'Online' | 'Offline';
  status: 'Schedule' | 'Completed' | 'Cancelled';
  interviewer: string;
  hasilInterview?: 'Lulus' | 'Tidak Lulus' | 'Dipertimbangkan';
  keterangan?: string;
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  menu: string;
  itemAffected: string;
  details: string;
}

export interface SlaSetting {
  stage: string;
  targetDays: number;
}

export interface AdminRolePermissions {
  create: boolean;
  review: boolean;
  update: boolean;
  delete: boolean;
  email: boolean;
  whatsapp: boolean;
  lockSettings: boolean;
  lockHistory: boolean;
}

export interface AdminRole {
  id: string;
  roleName: string;
  email: string; // 🔹 BARU: Email pengirim untuk role ini
  accessLevel: 'Super Admin' | 'HR Manager' | 'Recruiter' | 'Interviewer' | 'Viewer';
  status: 'Active' | 'Inactive';
  description: string;
  permissions: AdminRolePermissions;
  password: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailSettings {
  enabled: boolean;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  templates: {
    interview: EmailTemplate;
    assessment: EmailTemplate;
    offering: EmailTemplate;
    medical: EmailTemplate;
    onboarding: EmailTemplate;
    rejected: EmailTemplate;
  };
}

export interface WhatsAppSettings {
  enabled: boolean;
  confirmationTemplate: string;
}

export interface AppSettings {
  autoScreeningATS: number; // percentage threshold e.g. 70
  syncGoogleCalendar: boolean;
  targetSlaDays: SlaSetting[];
  targetSlaManagement: number; // SLA compliance goal set by management e.g. 85
  budgetCostHiring: { department: string; budget: number; actual: number }[];
  adminRoles: AdminRole[];
  infoPortal: {
    heroTitle: string;
    heroSubtitle: string;
    contactEmail: string;
    contactLocation: string;
    contactTeam: string;
    isActive: boolean;
    logoUrl: string;
  };
  emailSettings: EmailSettings;
  whatsappSettings: WhatsAppSettings;
}

export const INITIAL_JOBS: Job[] = [
  {
    id: "JOB-001",
    judul: "Senior React Developer",
    department: "Technology",
    type: "Full time",
    status: "Aktif",
    salaryMin: 15000000,
    salaryMax: 22000000,
    hideSalary: false,
    description: "Kami mencari Senior React Developer yang berpengalaman dalam membangun aplikasi web yang cepat, responsif, dan scalable menggunakan ekosistem React modern.",
    responsibilities: [
      "Mengembangkan komponen UI reusable berkualitas tinggi menggunakan React & TailwindCSS",
      "Berkolaborasi dengan desainer UI/UX dan backend developer untuk mengintegrasikan REST/GraphQL API",
      "Mengoptimalkan performa aplikasi web untuk kecepatan maksimal",
      "Melakukan mentoring junior developers dan review code"
    ],
    qualifications: [
      "Pengalaman kerja minimal 4 tahun sebagai Frontend Developer dengan React",
      "Keahlian mendalam dalam TypeScript, React Hook, Context, dan State Management",
      "Pengalaman dengan Tailwind CSS dan responsive design",
      "Kemampuan problem-solving yang kuat dan pemahaman Agile/Scrum"
    ],
    skills: ["React", "TypeScript", "Tailwind CSS", "Redux", "Git", "REST API"],
    benefits: ["Asuransi Swasta", "BPJS Lengkap", "Laptop Macbook Pro Kerja", "WFA/Remote Friendly", "Bonus Tahunan"],
    createdAt: "2026-02-10"
  },
  {
    id: "JOB-002",
    judul: "HR Generalist Manager",
    department: "Human Resources",
    type: "Full time",
    status: "Aktif",
    salaryMin: 12000000,
    salaryMax: 18000000,
    hideSalary: false,
    description: "Memimpin operasi HR harian, mengelola proses rekrutmen, memantau retensi karyawan, kepatuhan ketenagakerjaan, serta pengembangan kapasitas organisasi.",
    responsibilities: [
      "Mengawasi siklus lengkap rekrutmen, onboarding, dan offboarding",
      "Mendesain program pelatihan karyawan dan mengevaluasi efektivitas kinerja (KPI)",
      "Memastikan kepatuhan terhadap peraturan ketenagakerjaan pemerintah",
      "Mengelola hubungan industrial dan mediasi konflik internal"
    ],
    qualifications: [
      "Minimal S1 Manajemen HR, Psikologi, atau Hukum",
      "Minimal 5 tahun pengalaman di bidang HR, minimal 2 tahun di level managerial/lead",
      "Komunikasi interpersonal yang kuat dan kemampuan kepemimpinan",
      "Paham undang-undang cipta kerja dan peraturan ketenagakerjaan Indonesia"
    ],
    skills: ["Recruitment", "Industrial Relations", "KPI Management", "UU Ketenagakerjaan", "Communication"],
    benefits: ["Asuransi Kesehatan", "Tunjangan Transport & Makan", "Koperasi Karyawan", "BPJS"],
    createdAt: "2026-02-15"
  },
  {
    id: "JOB-003",
    judul: "Product Designer (UI/UX)",
    department: "Product Design",
    type: "Full time",
    status: "Aktif",
    salaryMin: 9000000,
    salaryMax: 14000000,
    hideSalary: false,
    description: "Bertanggung jawab merancang user flow, wireframe, mockup visual, hingga prototype interaktif untuk produk digital web dan mobile CareerHub.",
    responsibilities: [
      "Melakukan user research dan menerjemahkan insight menjadi solusi desain yang fungsional",
      "Membuat user flow, wireframe, mockup pixel-perfect, dan prototipe interaktif",
      "Menyusun dan memelihara Design System perusahaan",
      "Melakukan uji kegunaan (usability testing) pada fitur baru"
    ],
    qualifications: [
      "Portofolio UI/UX yang solid untuk web & mobile",
      "Mahir menggunakan Figma, Adobe XD, atau Sketch",
      "Pemahaman yang kuat mengenai user-centered design, typography, dan warna",
      "Pengalaman bekerja dalam tim cross-functional dengan Software Engineer"
    ],
    skills: ["Figma", "UI Design", "User Research", "Prototyping", "Design System"],
    benefits: ["Asuransi Medis", "Budget Belajar & Sertifikasi", "Fleksibel Jam Kerja", "Laptop Kerja"],
    createdAt: "2026-02-18"
  },
  {
    id: "JOB-004",
    judul: "Digital Marketing Specialist",
    department: "Marketing",
    type: "Contract",
    status: "Aktif",
    salaryMin: 7000000,
    salaryMax: 10000000,
    hideSalary: true,
    description: "Mengembangkan, mengimplementasikan, dan mengelola kampanye pemasaran digital di berbagai saluran online untuk meningkatkan brand awareness dan akuisisi user.",
    responsibilities: [
      "Mengelola kampanye paid ads di Meta Ads, Google Ads, dan TikTok Ads",
      "Membuat strategi konten media sosial dan berkolaborasi dengan graphic designer",
      "Menganalisis performa kampanye menggunakan Google Analytics dan tools SEO/SEM",
      "Mengoptimalkan biaya iklan (CAC) untuk mencapai ROI maksimal"
    ],
    qualifications: [
      "Minimal 2 tahun pengalaman mengelola iklan digital berbayar (paid ads)",
      "Sertifikasi Google Ads atau Facebook Blueprint menjadi nilai tambah",
      "Keahlian analisis data dan pemahaman funnel pemasaran digital",
      "Kreatif dan peka terhadap tren media sosial terkini"
    ],
    skills: ["Meta Ads", "Google Ads", "SEO/SEM", "Copywriting", "Google Analytics"],
    benefits: ["Komisi Performa Iklan", "BPJS Kesehatan", "Co-working Space Membership"],
    createdAt: "2026-02-20"
  },
  {
    id: "JOB-005",
    judul: "Backend Engineer (Go/Node.js)",
    department: "Technology",
    type: "Full time",
    status: "Draft",
    salaryMin: 12000000,
    salaryMax: 20000000,
    hideSalary: false,
    description: "Mendesain dan mengimplementasikan backend service berkinerja tinggi, database terdistribusi, serta API handal menggunakan Go atau Node.js.",
    responsibilities: [
      "Merancang arsitektur microservices yang scalable dan aman",
      "Menulis kode backend yang bersih, efisien, dan memiliki test coverage yang baik",
      "Mengoptimalkan query database SQL dan NoSQL",
      "Mengamankan integrasi API dengan OAuth2, JWT, dan enkripsi data"
    ],
    qualifications: [
      "Minimal S1 Ilmu Komputer atau sejenisnya",
      "Minimal 3 tahun pengalaman di Backend Development menggunakan Golang atau Node.js",
      "Paham database PostgreSQL, MongoDB, Redis, dan Message Broker (RabbitMQ/Kafka)",
      "Pernah menerapkan containerization (Docker, Kubernetes)"
    ],
    skills: ["Go", "Node.js", "PostgreSQL", "Docker", "Redis", "gRPC", "API Design"],
    benefits: ["Asuransi Swasta Kelas 1", "Sertifikasi AWS Gratis", "Laptop High-End", "WFA"],
    createdAt: "2026-02-25"
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "CAN-001",
    nama: "Budi Santoso",
    telepon: "081234567890",
    email: "budi.santoso@email.com",
    gender: "Laki-laki",
    tempatLahir: "Jakarta",
    tanggalLahir: "1994-05-12",
    pendidikan: "S1",
    jurusan: "Teknik Informatika",
    posisiDilamar: "Senior React Developer",
    pengalaman: 5,
    statusPekerjaan: "Aktif Bekerja",
    jabatanTerakhir: "Frontend Developer",
    currentSalary: 16000000,
    expectedSalary: 18000000,
    tahapProses: "hired",
    ratingKecocokan: 92,
    cvName: "CV_Budi_Santoso_Frontend.pdf",
    tanggalApplied: "2026-02-05",
    tanggalScreening: "2026-02-06",
    tanggalInterview: "2026-02-08",
    tanggalAssessment: "2026-02-10",
    tanggalMedical: "2026-02-12",
    tanggalOffering: "2026-02-14",
    tanggalHired: "2026-02-16",
    keterangan: "Sangat direkomendasikan. Kemampuan teknis React & TypeScript luar biasa, lulus interview user dengan nilai A+."
  },
  {
    id: "CAN-002",
    nama: "Amalia Putri",
    telepon: "085678912345",
    email: "amalia.putri@email.com",
    gender: "Perempuan",
    tempatLahir: "Bandung",
    tanggalLahir: "1992-08-21",
    pendidikan: "S1",
    jurusan: "Psikologi",
    posisiDilamar: "HR Generalist Manager",
    pengalaman: 6,
    statusPekerjaan: "Aktif Bekerja",
    jabatanTerakhir: "Senior HR Specialist",
    currentSalary: 13500000,
    expectedSalary: 15000000,
    tahapProses: "offering",
    ratingKecocokan: 88,
    cvName: "CV_Amalia_Putri_HR.pdf",
    tanggalApplied: "2026-02-16",
    tanggalScreening: "2026-02-18",
    tanggalInterview: "2026-02-20",
    tanggalAssessment: "2026-02-22",
    tanggalMedical: "2026-02-23",
    tanggalOffering: "2026-02-25",
    keterangan: "Menunggu tanda tangan Offering Letter. Memiliki pemahaman yang baik terkait regulasi ketenagakerjaan dan mediasi konflik."
  },
  {
    id: "CAN-003",
    nama: "Reza Fahlevi",
    telepon: "082199887766",
    email: "reza.fahlevi@email.com",
    gender: "Laki-laki",
    tempatLahir: "Surabaya",
    tanggalLahir: "1996-11-03",
    pendidikan: "S1",
    jurusan: "Desain Komunikasi Visual",
    posisiDilamar: "Product Designer (UI/UX)",
    pengalaman: 3,
    statusPekerjaan: "Tidak Bekerja",
    jabatanTerakhir: "UI/UX Designer",
    currentSalary: 9500000,
    expectedSalary: 11000000,
    tahapProses: "interview",
    ratingKecocokan: 78,
    cvName: "CV_Reza_UIUX_Portfolio.pdf",
    tanggalApplied: "2026-02-19",
    tanggalScreening: "2026-02-21",
    tanggalInterview: "2026-02-24",
    keterangan: "Interview user dijadwalkan tanggal 24 Feb. Portofolio Figma sangat bagus, namun perlu digali lebih dalam tentang user research."
  },
  {
    id: "CAN-004",
    nama: "Siti Rahma",
    telepon: "089876543210",
    email: "siti.rahma@email.com",
    gender: "Perempuan",
    tempatLahir: "Yogyakarta",
    tanggalLahir: "2001-02-15",
    pendidikan: "S1",
    jurusan: "Ilmu Komunikasi",
    posisiDilamar: "Digital Marketing Specialist",
    pengalaman: 2,
    statusPekerjaan: "Fresh graduate",
    jabatanTerakhir: "Intern Digital Marketing",
    currentSalary: 0,
    expectedSalary: 7500000,
    tahapProses: "screening",
    ratingKecocokan: 65,
    cvName: "CV_Siti_Rahma_Marketing.pdf",
    tanggalApplied: "2026-02-21",
    tanggalScreening: "2026-02-22",
    keterangan: "Sudah di-screen. Fresh graduate yang aktif mengelola platform media sosial kampus, tapi kurang pengalaman di technical paid ads."
  },
  {
    id: "CAN-005",
    nama: "Denny Wijaya",
    telepon: "081122334455",
    email: "denny.wijaya@email.com",
    gender: "Laki-laki",
    tempatLahir: "Semarang",
    tanggalLahir: "1989-07-30",
    pendidikan: "S2",
    jurusan: "Magister Teknik Informatika",
    posisiDilamar: "Senior React Developer",
    pengalaman: 7,
    statusPekerjaan: "Aktif Bekerja",
    jabatanTerakhir: "Senior Frontend Lead",
    currentSalary: 21000000,
    expectedSalary: 23000000,
    tahapProses: "medical",
    ratingKecocokan: 95,
    cvName: "CV_Denny_Wijaya_S2.pdf",
    tanggalApplied: "2026-02-11",
    tanggalScreening: "2026-02-12",
    tanggalInterview: "2026-02-15",
    tanggalAssessment: "2026-02-18",
    tanggalMedical: "2026-02-22",
    keterangan: "Tahap medical check-up di RS Husada. Dokumen MCU sedang diverifikasi oleh HR."
  },
  {
    id: "CAN-006",
    nama: "Farhan Ramadhan",
    telepon: "081344556677",
    email: "farhan.r@email.com",
    gender: "Laki-laki",
    tempatLahir: "Malang",
    tanggalLahir: "1995-12-11",
    pendidikan: "S1",
    jurusan: "Sistem Informasi",
    posisiDilamar: "Backend Engineer (Go/Node.js)",
    pengalaman: 4,
    statusPekerjaan: "Tidak Bekerja",
    jabatanTerakhir: "Backend Developer",
    currentSalary: 12000000,
    expectedSalary: 14000000,
    tahapProses: "assessment",
    ratingKecocokan: 84,
    cvName: "CV_Farhan_Ramadhan_Backend.pdf",
    tanggalApplied: "2026-02-26",
    tanggalScreening: "2026-02-27",
    tanggalAssessment: "2026-02-28",
    keterangan: "Sedang mengerjakan online assessment (coding challenge) berdurasi 3 hari. Target selesai tanggal 3 Maret."
  },
  {
    id: "CAN-007",
    nama: "Eka Lestari",
    telepon: "085233445566",
    email: "eka.lestari@email.com",
    gender: "Perempuan",
    tempatLahir: "Medan",
    tanggalLahir: "1998-04-20",
    pendidikan: "D3",
    jurusan: "Administrasi Perkantoran",
    posisiDilamar: "HR Generalist Manager",
    pengalaman: 3,
    statusPekerjaan: "Aktif Bekerja",
    jabatanTerakhir: "HR Staff",
    currentSalary: 7000000,
    expectedSalary: 8000000,
    tahapProses: "rejected",
    ratingKecocokan: 45,
    cvName: "CV_Eka_Lestari_Admin.pdf",
    tanggalApplied: "2026-02-10",
    tanggalScreening: "2026-02-11",
    keterangan: "Ditolak saat screening. Kualifikasi belum memenuhi syarat minimal 5 tahun pengalaman di level Managerial/Senior."
  },
  {
    id: "CAN-008",
    nama: "Giri Kusuma",
    telepon: "087788990011",
    email: "giri.kusuma@email.com",
    gender: "Laki-laki",
    tempatLahir: "Denpasar",
    tanggalLahir: "1996-09-08",
    pendidikan: "S1",
    jurusan: "Teknik Elektro",
    posisiDilamar: "Senior React Developer",
    pengalaman: 4,
    statusPekerjaan: "Aktif Bekerja",
    jabatanTerakhir: "React JS Engineer",
    currentSalary: 14500000,
    expectedSalary: 16000000,
    tahapProses: "interview",
    ratingKecocokan: 81,
    cvName: "CV_Giri_Kusuma_React.pdf",
    tanggalApplied: "2026-02-14",
    tanggalScreening: "2026-02-15",
    tanggalInterview: "2026-02-19",
    keterangan: "Selesai interview HR. Lanjut ke interview user dengan pak Yudi."
  },
  {
    id: "CAN-009",
    nama: "Hana Olivia",
    telepon: "081299887755",
    email: "hana.olivia@email.com",
    gender: "Perempuan",
    tempatLahir: "Makassar",
    tanggalLahir: "1993-01-25",
    pendidikan: "S1",
    jurusan: "Desain Produk",
    posisiDilamar: "Product Designer (UI/UX)",
    pengalaman: 5,
    statusPekerjaan: "Aktif Bekerja",
    jabatanTerakhir: "Senior Product Designer",
    currentSalary: 13000000,
    expectedSalary: 14500000,
    tahapProses: "applied",
    ratingKecocokan: 89,
    cvName: "CV_Hana_Olivia_UIUX.pdf",
    tanggalApplied: "2026-02-28",
    keterangan: "Kandidat baru mendaftar hari ini. Rating kecocokan ATS tinggi (89%) karena menguasai Figma dan berpengalaman 5 tahun."
  },
  {
    id: "CAN-010",
    nama: "Irfan Hakim",
    telepon: "081399882211",
    email: "irfan.hakim@email.com",
    gender: "Laki-laki",
    tempatLahir: "Palembang",
    tanggalLahir: "1997-10-18",
    pendidikan: "SMA/SMK",
    jurusan: "Multimedia",
    posisiDilamar: "Digital Marketing Specialist",
    pengalaman: 4,
    statusPekerjaan: "Tidak Bekerja",
    jabatanTerakhir: "Digital Ads Freelance",
    currentSalary: 6500000,
    expectedSalary: 7000000,
    tahapProses: "interview",
    ratingKecocokan: 72,
    cvName: "CV_Irfan_Digital_Ads.pdf",
    tanggalApplied: "2026-02-18",
    tanggalScreening: "2026-02-19",
    tanggalInterview: "2026-02-22",
    keterangan: "Sudah di-interview oleh tim Marketing. Memiliki pengalaman mumpuni di Meta Ads tapi kurang di sisi strategi analytics SEO."
  }
];

// 🔹 PERBAIKAN DATA MOCK: Tambah field hasilInterview & keterangan
export const INITIAL_INTERVIEWS: InterviewSchedule[] = [
  {
    id: "INT-001",
    kandidatId: "CAN-003",
    nama: "Reza Fahlevi",
    posisiDilamar: "Product Designer (UI/UX)",
    department: "Product Design",
    tanggal: "2026-03-02",
    waktu: "10:00",
    type: "User",
    method: "Online",
    status: "Schedule",
    interviewer: "Yosef (Head of Design)"
    // Belum ada hasil karena status masih Schedule
  },
  {
    id: "INT-002",
    kandidatId: "CAN-008",
    nama: "Giri Kusuma",
    posisiDilamar: "Senior React Developer",
    department: "Technology",
    tanggal: "2026-02-19",
    waktu: "13:30",
    type: "HR",
    method: "Online",
    status: "Completed",
    interviewer: "Cindy (HR Recruiter)",
    hasilInterview: "Dipertimbangkan",
    keterangan: "Komunikasi baik, namun perlu pendalaman teknis React Hooks."
  },
  {
    id: "INT-003",
    kandidatId: "CAN-010",
    nama: "Irfan Hakim",
    posisiDilamar: "Digital Marketing Specialist",
    department: "Marketing",
    tanggal: "2026-02-22",
    waktu: "09:00",
    type: "Technical",
    method: "Online",
    status: "Completed",
    interviewer: "Andi Wibowo (CMO)",
    hasilInterview: "Lulus",
    keterangan: "Sangat kuat di Meta Ads & Copywriting. Direkomendasikan lanjut ke User Interview."
  },
  {
    id: "INT-004",
    kandidatId: "CAN-005",
    nama: "Denny Wijaya",
    posisiDilamar: "Senior React Developer",
    department: "Technology",
    tanggal: "2026-02-15",
    waktu: "15:00",
    type: "Final",
    method: "Offline",
    status: "Completed",
    interviewer: "Aditya (VP of Engineering)",
    hasilInterview: "Lulus",
    keterangan: "Excellent technical depth & leadership potential. Approved for Offer."
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  autoScreeningATS: 70,
  syncGoogleCalendar: true,
  targetSlaManagement: 85,
  targetSlaDays: [
    { stage: "applied", targetDays: 2 },
    { stage: "screening", targetDays: 3 },
    { stage: "interview", targetDays: 5 },
    { stage: "assessment", targetDays: 4 },
    { stage: "medical", targetDays: 3 },
    { stage: "offering", targetDays: 4 },
    { stage: "hired", targetDays: 7 },
  ],
  budgetCostHiring: [
    { department: "Technology", budget: 150000000, actual: 110000000 },
    { department: "Human Resources", budget: 50000000, actual: 35000000 },
    { department: "Product Design", budget: 60000000, actual: 48000000 },
    { department: "Marketing", budget: 40000000, actual: 28000000 }
  ],
  adminRoles: [
    {
      id: 'ROLE-001',
      roleName: 'Super Admin',
      email: 'superadmin@careerhub.co.id', // 🔹 BARU
      accessLevel: 'Super Admin',
      status: 'Active',
      description: 'Akses penuh untuk seluruh menu, pengaturan, dan audit log.',
      permissions: { create: true, review: true, update: true, delete: true, email: true, whatsapp: true, lockSettings: true, lockHistory: true },
      password: 'admin123'
    },
    {
      id: 'ROLE-002',
      roleName: 'Recruiter Lead',
      email: 'recruiter.lead@careerhub.co.id', // 🔹 BARU
      accessLevel: 'HR Manager',
      status: 'Active',
      description: 'Mengelola lowongan, kandidat, dan persetujuan tahap rekrutmen.',
      permissions: { create: true, review: true, update: true, delete: false, email: true, whatsapp: true, lockSettings: false, lockHistory: false },
      password: 'hr123'
    },
    {
      id: 'ROLE-003',
      roleName: 'Interview Panel',
      email: 'interview.panel@careerhub.co.id', // 🔹 BARU
      accessLevel: 'Interviewer',
      status: 'Active',
      description: 'Melihat kandidat, jadwal interview, dan memberi penilaian interview.',
      permissions: { create: false, review: true, update: false, delete: false, email: false, whatsapp: false, lockSettings: false, lockHistory: false },
      password: 'panel123'
    }
  ],
  infoPortal: {
    heroTitle: 'Portal informasi pelamar untuk langkah karier yang lebih jelas.',
    heroSubtitle: 'CareerHub membantu kandidat menemukan peluang yang relevan, memahami proses rekrutmen, dan mengirim lamaran dengan alur yang transparan dan profesional.',
    contactEmail: 'recruitment@careerhub.co.id',
    contactLocation: 'Jakarta, Indonesia',
    contactTeam: 'Tim HR & Talent Acquisition',
    isActive: true,
    logoUrl: ''
  },
  emailSettings: {
    enabled: true,
    senderName: 'CareerHub Recruitment Team',
    senderEmail: 'recruitment@careerhub.co.id',
    replyTo: 'recruitment@careerhub.co.id',
    templates: {
      interview: {
        subject: 'Undangan Interview - {posisi} di CareerHub',
        body: 'Yth. {nama},\n\nSelamat! Anda telah berhasil melewati tahap screening kami.\n\nKami mengundang Anda untuk mengikuti sesi Interview untuk posisi {posisi} yang akan dilaksanakan pada:\n\nSilakan hubungi kami untuk konfirmasi jadwal.\n\nSalam,\nTim Rekrutmen CareerHub'
      },
      assessment: {
        subject: 'Undangan Assessment - {posisi} di CareerHub',
        body: 'Yth. {nama},\n\nTerima kasih telah mengikuti sesi interview kami.\n\nSebagai langkah berikutnya, kami mengundang Anda untuk mengikuti Assessment untuk posisi {posisi}.\n\nSilakan cek detail jadwal dan instruksi lebih lanjut.\n\nSalam,\nTim Rekrutmen CareerHub'
      },
      offering: {
        subject: 'Penawaran Kerja - {posisi} di CareerHub',
        body: 'Yth. {nama},\n\nSelamat! Kami sangat senang untuk memberikan penawaran kerja untuk posisi {posisi}.\n\nTerlampir adalah surat penawaran resmi yang berisi detail mengenai kompensasi, benefit, dan tanggal mulai.\n\nSalam,\nTim Rekrutmen CareerHub'
      },
      medical: {
        subject: 'Medical Check-Up - {posisi} di CareerHub',
        body: 'Yth. {nama},\n\nSebagai bagian dari proses rekrutmen, kami mengundang Anda untuk menjalani Medical Check-Up.\n\nSilakan ikuti instruksi terlampir mengenai lokasi dan waktu pelaksanaan MCU.\n\nSalam,\nTim Rekrutmen CareerHub'
      },
      onboarding: {
        subject: 'Selamat Bergabung! - {posisi} di CareerHub',
        body: 'Yth. {nama},\n\nSelamat! Proses rekrutmen Anda telah selesai. Kami dengan senang hati menyambut Anda sebagai bagian dari tim CareerHub untuk posisi {posisi}.\n\nInformasi detail terkait hari pertama kerja, dokumen yang perlu dibawa, dan panduan onboarding akan dikirimkan secara terpisah.\n\nSalam hangat,\nTim Rekrutmen CareerHub'
      },
      rejected: {
        subject: 'Update Lamaran - {posisi} di CareerHub',
        body: 'Yth. {nama},\n\nTerima kasih telah meluangkan waktu untuk mengikuti proses rekrutmen di CareerHub untuk posisi {posisi}.\n\nSetelah melalui pertimbangan yang matang, kami informasikan bahwa lamaran Anda belum dapat kami lanjutkan ke tahap berikutnya.\n\nKami sangat menghargai partisipasi Anda dan semoga sukses untuk kesempatan karier lainnya.\n\nSalam,\nTim Rekrutmen CareerHub'
      }
    }
  },
  whatsappSettings: {
    enabled: true,
    confirmationTemplate: 'Halo {nama},\n\nKami dari tim rekrutmen CareerHub ingin menginformasikan mengenai status lamaran Anda untuk posisi {posisi}.\n\nMohon konfirmasi ketersediaan Anda. Terima kasih.\n\nSalam,\nTim Rekrutmen CareerHub'
  }
};

export function normalizeSettings(settings?: Partial<AppSettings> | null): AppSettings {
  return {
    ...INITIAL_SETTINGS,
    ...(settings || {}),
    targetSlaManagement: settings?.targetSlaManagement ?? INITIAL_SETTINGS.targetSlaManagement,
    targetSlaDays: settings?.targetSlaDays?.length ? settings.targetSlaDays : INITIAL_SETTINGS.targetSlaDays,
    budgetCostHiring: settings?.budgetCostHiring?.length ? settings.budgetCostHiring : INITIAL_SETTINGS.budgetCostHiring,
    adminRoles: settings?.adminRoles?.length ? settings.adminRoles : INITIAL_SETTINGS.adminRoles,
    infoPortal: settings?.infoPortal ? settings.infoPortal : INITIAL_SETTINGS.infoPortal,
    emailSettings: settings?.emailSettings ? settings.emailSettings : INITIAL_SETTINGS.emailSettings,
    whatsappSettings: settings?.whatsappSettings ? settings.whatsappSettings : INITIAL_SETTINGS.whatsappSettings,
  };
}

export const INITIAL_HISTORY: HistoryLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-02-28 09:30:15",
    user: "Admin HR",
    action: "CREATE",
    menu: "Portal Lowongan",
    itemAffected: "JOB-005 - Backend Engineer (Go/Node.js)",
    details: "Menambahkan lowongan pekerjaan baru dengan status Draft."
  },
  {
    id: "LOG-002",
    timestamp: "2026-02-28 10:15:22",
    user: "Admin HR",
    action: "UPDATE",
    menu: "Kandidat",
    itemAffected: "CAN-002 - Amalia Putri",
    details: "Mengubah tahap proses kandidat dari 'medical' menjadi 'offering'."
  },
  {
    id: "LOG-003",
    timestamp: "2026-02-28 11:00:00",
    user: "System ATS",
    action: "AUTO-SCREENING",
    menu: "Kandidat",
    itemAffected: "CAN-009 - Hana Olivia",
    details: "Kandidat baru didaftarkan. Hasil pencocokan ATS: 89% (Lolos ambang batas minimal 70%)."
  },
  {
    id: "LOG-004",
    timestamp: "2026-02-28 11:45:00",
    user: "Recruiter 1",
    action: "CREATE",
    menu: "Schedule Interview",
    itemAffected: "INT-001 - Reza Fahlevi (User Interview)",
    details: "Menjadwalkan interview User untuk Reza Fahlevi secara online pada 2026-03-02."
  },
  {
    id: "LOG-005",
    timestamp: "2026-02-28 14:00:00",
    user: "Admin HR",
    action: "UPDATE",
    menu: "Setting",
    itemAffected: "Pengaturan Target SLA",
    details: "Mengubah target SLA tahap proses 'hired' dari 5 hari menjadi 7 hari."
  }
];

export function getStoredData<T>(key: string, initial: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return initial;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return initial;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ═══════════════════════════════════════════════════════════════
// 🔹 TAHAP 1: ADMIN USER LOGIN SYSTEM
// ═══════════════════════════════════════════════════════════════

/**
 * Interface untuk user admin yang sedang login.
 * Berbeda dari AdminRole (definisi role), AdminUser adalah instance user spesifik.
 */
export interface AdminUser {
  id: string;
  nama: string;
  email: string;
  roleId: string;       // Reference ke AdminRole.id
  roleName: string;     // Denormalized untuk kemudahan akses
  accessLevel: AdminRole['accessLevel'];
  permissions: AdminRolePermissions;
  avatar?: string;
}

/**
 * Data login admin default.
 * Password disimpan plain text karena ini frontend-only mock.
 * Di production, gunakan hashing + backend auth.
 */
export const INITIAL_ADMIN_USERS: (AdminUser & { password: string })[] = [
  {
    id: 'USR-001',
    nama: 'Budi Santoso',
    email: 'budi@careerhub.co.id',
    roleId: 'ROLE-001',
    roleName: 'Super Admin',
    accessLevel: 'Super Admin',
    permissions: {
      create: true, review: true, update: true, delete: true,
      email: true, whatsapp: true, lockSettings: true, lockHistory: true
    },
    password: 'admin123'
  },
  {
    id: 'USR-002',
    nama: 'Amalia Putri',
    email: 'amalia@careerhub.co.id',
    roleId: 'ROLE-002',
    roleName: 'Recruiter Lead',
    accessLevel: 'HR Manager',
    permissions: {
      create: true, review: true, update: true, delete: false,
      email: true, whatsapp: true, lockSettings: false, lockHistory: false
    },
    password: 'hr123'
  },
  {
    id: 'USR-003',
    nama: 'Yosef Wijaya',
    email: 'yosef@careerhub.co.id',
    roleId: 'ROLE-003',
    roleName: 'Interview Panel',
    accessLevel: 'Interviewer',
    permissions: {
      create: false, review: true, update: false, delete: false,
      email: false, whatsapp: false, lockSettings: false, lockHistory: false
    },
    password: 'panel123'
  }
];

/**
 * Ambil data admin yang sedang login dari localStorage.
 * Returns null jika belum ada yang login.
 */
export function getStoredAdmin(): AdminUser | null {
  const raw = localStorage.getItem('careerhub_current_admin');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Simpan data admin yang sedang login ke localStorage.
 * Pass null untuk logout.
 */
export function setStoredAdmin(admin: AdminUser | null): void {
  if (admin === null) {
    localStorage.removeItem('careerhub_current_admin');
  } else {
    localStorage.setItem('careerhub_current_admin', JSON.stringify(admin));
  }
}

/**
 * Validasi kredensial login terhadap INITIAL_ADMIN_USERS.
 * Returns AdminUser (tanpa password) jika valid, null jika tidak.
 */
export function validateAdminLogin(email: string, password: string): AdminUser | null {
  const found = INITIAL_ADMIN_USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );
  if (!found) return null;

  // Return tanpa field password untuk keamanan
  const { password: _, ...safeUser } = found;
  return safeUser;
}
