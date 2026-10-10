// Global app store using Zustand
import { create } from "zustand";
import {
  STUDENTS, TEACHERS, STAFF, FEE_COLLECTIONS, ACTIVITIES,
  type Student, type Teacher, type Staff, type FeeCollection, type Activity, type Role,
} from "./sms-data";

export type ModuleKey =
  | "dashboard" | "students" | "teachers" | "staff" | "classes" | "timetable"
  | "attendance" | "salary" | "fees" | "defaulters" | "results" | "certificates"
  | "reports" | "analytics" | "users" | "settings" | "ledger"
  | "exam" | "library" | "transport" | "hostel" | "inventory" | "events"
  | "discipline" | "alumni" | "parent" | "sms" | "leave" | "concession";

export interface SchoolInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null; // base64 data URL
  session: string;
}

export interface FeeStructureConfig {
  // Per-class tuition fees (class name → monthly tuition)
  classFees: Record<string, number>;
  // Global hostel fee (applied to all hostellers)
  hostelFee: number;
  // Admission fee = multiplier × monthly tuition
  admissionMultiplier: number;
  // Late payment fine (flat, after due date)
  lateFee: number;
  // Fee due date (day of month, 1-28)
  dueDate: number;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  name: string;
  type: "Birth Certificate" | "Photo" | "Transfer Certificate" | "Report Card" | "Medical Record" | "Other";
  uploadDate: string;
  dataUrl: string; // base64
  size: number; // bytes
}

export interface CommunicationLog {
  id: string;
  studentId: string;
  type: "Phone Call" | "Meeting" | "SMS" | "Email" | "Note";
  date: string;
  direction: "Incoming" | "Outgoing";
  subject: string;
  notes: string;
  user: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
  mode: "Cash" | "Bank" | "Cheque";
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "fee" | "attendance" | "admission" | "salary" | "system" | "birthday";
  read: boolean;
  action?: { module: ModuleKey; label: string };
}

interface AppState {
  // Auth
  role: Role;
  setRole: (role: Role) => void;
  userName: string;

  // Navigation
  activeModule: ModuleKey;
  setActiveModule: (m: ModuleKey) => void;

  // Module visibility (on/off)
  enabledModules: Record<ModuleKey, boolean>;
  toggleModule: (m: ModuleKey) => void;
  setModuleEnabled: (m: ModuleKey, enabled: boolean) => void;
  setAllModulesEnabled: (enabled: boolean) => void;

  // School branding
  school: SchoolInfo;
  updateSchool: (patch: Partial<SchoolInfo>) => void;
  setLogo: (logo: string | null) => void;

  // Fee structure config
  feeStructure: FeeStructureConfig;
  updateFeeStructure: (patch: Partial<FeeStructureConfig>) => void;
  setClassFee: (className: string, amount: number) => void;

  // Managed collections (CRUD via store so they persist)
  classes: { name: string; sections: string[]; monthlyFee: number; classTeacher?: string }[];
  subjects: string[];
  addClass: (cls: { name: string; sections: string[]; monthlyFee: number }) => void;
  updateClass: (name: string, patch: Partial<{ sections: string[]; monthlyFee: number; classTeacher: string }>) => void;
  deleteClass: (name: string) => void;
  addSubject: (subject: string) => void;
  deleteSubject: (subject: string) => void;

  // Data
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  feeCollections: FeeCollection[];
  activities: Activity[];
  documents: StudentDocument[];
  commLogs: CommunicationLog[];
  transactions: Transaction[];

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Command palette
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: () => number;

  // Selected student for cross-module navigation
  selectedStudentId: string | null;
  setSelectedStudent: (id: string | null) => void;

  // Actions
  addStudent: (s: Student) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  promoteStudent: (id: string, newClass: string, newSection: string) => void;
  addTeacher: (t: Teacher) => void;
  updateTeacher: (id: string, patch: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  addStaff: (s: Staff) => void;
  updateStaff: (id: string, patch: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  collectFee: (studentId: string, amount: number, mode: "Cash" | "Cheque" | "Bank Transfer", feeType: string, breakdown?: { tuition?: number; admission?: number; hostel?: number }) => void;
  markAttendance: (studentIds: string[], status: "Present" | "Absent" | "Late" | "Leave") => void;

  // Document vault
  addDocument: (doc: StudentDocument) => void;
  deleteDocument: (id: string) => void;

  // Communication log
  addCommLog: (log: CommunicationLog) => void;
  deleteCommLog: (id: string) => void;

  // Transactions (income/expense ledger)
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;

  // === Generic module data store ===
  // For entities that don't have dedicated typed collections (exams, leave, concessions, incidents, alumni, books, routes, inventory, events, hostel rooms).
  // Each collection is keyed by name and persisted to localStorage.
  moduleData: Record<string, any[]>;
  addModuleItem: (collection: string, item: any) => void;
  updateModuleItem: (collection: string, id: string, patch: any) => void;
  deleteModuleItem: (collection: string, id: string) => void;
  setModuleData: (collection: string, items: any[]) => void;

  // Attendance records (per-student, per-day)
  attendanceRecords: AttendanceRecord[];
  saveAttendance: (records: AttendanceRecord[]) => void;
}

// Attendance record — one per student per day
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // ISO date YYYY-MM-DD
  status: "Present" | "Absent" | "Late" | "Leave";
  markedBy: string;
  markedAt: string;
}

const ROLE_NAMES: Record<Role, string> = {
  admin: "Administrator",
  accountant: "Accountant",
  teacher: "Teacher",
};

const DEFAULT_SCHOOL: SchoolInfo = {
  name: "",
  tagline: "",
  address: "",
  phone: "",
  email: "",
  logo: null,
  session: "",
};

const DEFAULT_FEE_STRUCTURE: FeeStructureConfig = {
  classFees: {},
  hostelFee: 0,
  admissionMultiplier: 0,
  lateFee: 0,
  dueDate: 0,
};

// === Module Control ===
// Modules that are always ON and cannot be disabled (system essentials)
export const ALWAYS_ON_MODULES: ModuleKey[] = ["dashboard", "settings"];

// Default module config — all modules enabled by default
const DEFAULT_ENABLED_MODULES: Record<ModuleKey, boolean> = {
  dashboard: true, students: true, teachers: true, staff: true,
  classes: true, timetable: true, attendance: true, salary: true,
  fees: true, defaulters: true, results: true, certificates: true,
  reports: true, analytics: true, users: true, settings: true,
  ledger: true, exam: true, library: true, transport: true,
  hostel: true, inventory: true, events: true, discipline: true,
  alumni: true, parent: true, sms: true, leave: true, concession: true,
};

function loadEnabledModules(): Record<ModuleKey, boolean> {
  if (typeof window === "undefined") return DEFAULT_ENABLED_MODULES;
  try {
    const raw = window.localStorage.getItem("edudesk_modules");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults to handle new modules added in updates
      return { ...DEFAULT_ENABLED_MODULES, ...parsed };
    }
  } catch {}
  return DEFAULT_ENABLED_MODULES;
}

function saveEnabledModules(modules: Record<ModuleKey, boolean>) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("edudesk_modules", JSON.stringify(modules)); } catch {}
}

function loadFeeStructure(): FeeStructureConfig {
  if (typeof window === "undefined") return DEFAULT_FEE_STRUCTURE;
  try {
    const raw = window.localStorage.getItem("edudesk_fees");
    if (raw) return { ...DEFAULT_FEE_STRUCTURE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_FEE_STRUCTURE;
}

function saveFeeStructure(fs: FeeStructureConfig) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("edudesk_fees", JSON.stringify(fs)); } catch {}
}

// Load persisted school info from localStorage (client-side only)
function loadSchool(): SchoolInfo {
  if (typeof window === "undefined") return DEFAULT_SCHOOL;
  try {
    const raw = window.localStorage.getItem("edudesk_school");
    if (raw) return { ...DEFAULT_SCHOOL, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SCHOOL;
}

function saveSchool(s: SchoolInfo) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("edudesk_school", JSON.stringify(s)); } catch {}
}

// Generic persistence helpers for collections
function loadCollection<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`edudesk_${key}`);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveCollection<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(`edudesk_${key}`, JSON.stringify(data)); } catch {}
}

const INITIAL_NOTIFICATIONS: Notification[] = [];

// === CRITICAL: Clear old seed data BEFORE store creation ===
// This runs once on page load — if version changed, wipe ALL old data
if (typeof window !== "undefined") {
  const CURRENT_VERSION = "3.0-clean";
  const storedVersion = window.localStorage.getItem("edudesk_version");
  if (storedVersion !== CURRENT_VERSION) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("edudesk_") && k !== "edudesk_version") {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => { try { window.localStorage.removeItem(k); } catch {} });
    window.localStorage.setItem("edudesk_version", CURRENT_VERSION);
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  role: "admin",
  setRole: (role) => set({ role, userName: ROLE_NAMES[role] }),
  userName: ROLE_NAMES.admin,

  activeModule: "dashboard",
  setActiveModule: (m) => set({ activeModule: m }),

  // Module visibility (on/off)
  enabledModules: loadEnabledModules(),
  toggleModule: (m) => set((state) => {
    if (ALWAYS_ON_MODULES.includes(m)) return state; // skip always-on
    const next = { ...state.enabledModules, [m]: !state.enabledModules[m] };
    saveEnabledModules(next);
    return { enabledModules: next };
  }),
  setModuleEnabled: (m, enabled) => set((state) => {
    if (ALWAYS_ON_MODULES.includes(m)) return state;
    const next = { ...state.enabledModules, [m]: enabled };
    saveEnabledModules(next);
    return { enabledModules: next };
  }),
  setAllModulesEnabled: (enabled) => set((state) => {
    const next = { ...state.enabledModules };
    (Object.keys(next) as ModuleKey[]).forEach(k => {
      if (!ALWAYS_ON_MODULES.includes(k)) next[k] = enabled;
    });
    saveEnabledModules(next);
    return { enabledModules: next };
  }),

  school: loadSchool(),
  updateSchool: (patch) => {
    const next = { ...get().school, ...patch };
    saveSchool(next);
    set({ school: next });
  },
  setLogo: (logo) => {
    const next = { ...get().school, logo };
    saveSchool(next);
    set({ school: next });
  },

  feeStructure: loadFeeStructure(),
  updateFeeStructure: (patch) => {
    const next = { ...get().feeStructure, ...patch };
    saveFeeStructure(next);
    set({ feeStructure: next });
  },
  setClassFee: (className, amount) => {
    const next = { ...get().feeStructure, classFees: { ...get().feeStructure.classFees, [className]: amount } };
    saveFeeStructure(next);
    set({ feeStructure: next });
  },

  classes: loadCollection("classes", []),
  subjects: loadCollection("subjects", []),
  addClass: (cls) => set((state) => ({ classes: [...state.classes, cls] })),
  updateClass: (name, patch) => set((state) => ({ classes: state.classes.map(c => c.name === name ? { ...c, ...patch } : c) })),
  deleteClass: (name) => set((state) => ({ classes: state.classes.filter(c => c.name !== name) })),
  addSubject: (subject) => set((state) => ({ subjects: [...state.subjects, subject] })),
  deleteSubject: (subject) => set((state) => ({ subjects: state.subjects.filter(s => s !== subject) })),

  students: loadCollection("students", STUDENTS),
  teachers: loadCollection("teachers", TEACHERS),
  staff: loadCollection("staff", STAFF),
  feeCollections: loadCollection("feeCollections", FEE_COLLECTIONS),
  activities: loadCollection("activities", ACTIVITIES),

  isDark: false,
  toggleTheme: () => set((s) => ({ isDark: !s.isDark })),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),

  notifications: INITIAL_NOTIFICATIONS,
  markNotificationRead: (id) => set((s) => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),
  markAllNotificationsRead: () => set((s) => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
  })),
  unreadCount: () => get().notifications.filter(n => !n.read).length,

  selectedStudentId: null,
  setSelectedStudent: (id) => set({ selectedStudentId: id }),

  addStudent: (s) => set((state) => ({ students: [s, ...state.students] })),

  updateStudent: (id, patch) => set((state) => ({
    students: state.students.map(s => s.id === id ? { ...s, ...patch } : s),
  })),

  deleteStudent: (id) => set((state) => ({
    students: state.students.filter(s => s.id !== id),
  })),

  promoteStudent: (id, newClass, newSection) => set((state) => ({
    students: state.students.map(s =>
      s.id === id ? { ...s, class: newClass, section: newSection, rollNo: String(Math.floor(Math.random() * 30) + 1).padStart(2, "0") } : s
    ),
  })),

  addTeacher: (t) => set((state) => ({ teachers: [t, ...state.teachers] })),

  updateTeacher: (id, patch) => set((state) => ({
    teachers: state.teachers.map(t => t.id === id ? { ...t, ...patch } : t),
  })),

  deleteTeacher: (id) => set((state) => ({
    teachers: state.teachers.filter(t => t.id !== id),
  })),

  addStaff: (s) => set((state) => ({ staff: [s, ...state.staff] })),

  updateStaff: (id, patch) => set((state) => ({
    staff: state.staff.map(s => s.id === id ? { ...s, ...patch } : s),
  })),

  deleteStaff: (id) => set((state) => ({
    staff: state.staff.filter(s => s.id !== id),
  })),

  collectFee: (studentId, amount, mode, feeType, breakdown) => {
    const state = get();
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
    const receiptNo = `RCPT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-6)}`;
    const newCollection: FeeCollection = {
      id: `FC-${Date.now()}`,
      receiptNo,
      studentId,
      studentName: student.name,
      class: student.class,
      date: new Date().toISOString().split("T")[0],
      amount,
      mode,
      tuition: breakdown?.tuition,
      admission: breakdown?.admission,
      hostel: breakdown?.hostel,
      feeType,
    };
    const newActivity: Activity = {
      id: `A${state.activities.length + 1}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      user: state.userName,
      action: "Fee Collected",
      description: `Rs. ${amount.toLocaleString()} from ${student.name} (${student.class}) — ${feeType}`,
      type: "fee",
    };
    set({
      feeCollections: [newCollection, ...state.feeCollections],
      students: state.students.map(s =>
        s.id === studentId
          ? { ...s, feePaidThisMonth: true, outstandingAmount: Math.max(0, s.outstandingAmount - amount) }
          : s
      ),
      activities: [newActivity, ...state.activities],
    });
  },

  markAttendance: (studentIds, status) => {
    const state = get();
    const newActivity: Activity = {
      id: `A${state.activities.length + 1}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      user: state.userName,
      action: "Attendance Marked",
      description: `${studentIds.length} students marked as ${status}`,
      type: "attendance",
    };
    set({ activities: [newActivity, ...state.activities] });
  },

  documents: [],
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  deleteDocument: (id) => set((state) => ({ documents: state.documents.filter(d => d.id !== id) })),

  commLogs: [],
  addCommLog: (log) => set((state) => ({ commLogs: [log, ...state.commLogs] })),
  deleteCommLog: (id) => set((state) => ({ commLogs: state.commLogs.filter(l => l.id !== id) })),

  transactions: [],
  addTransaction: (t) => set((state) => ({ transactions: [t, ...state.transactions] })),
  deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) })),

  // === Generic module data store ===
  moduleData: loadCollection("moduleData", {}),
  addModuleItem: (collection, item) => set((state) => {
    const current = state.moduleData[collection] || [];
    const next = { ...state.moduleData, [collection]: [item, ...current] };
    saveCollection("moduleData", next);
    return { moduleData: next };
  }),
  updateModuleItem: (collection, id, patch) => set((state) => {
    const current = state.moduleData[collection] || [];
    const next = { ...state.moduleData, [collection]: current.map((it: any) => it.id === id ? { ...it, ...patch } : it) };
    saveCollection("moduleData", next);
    return { moduleData: next };
  }),
  deleteModuleItem: (collection, id) => set((state) => {
    const current = state.moduleData[collection] || [];
    const next = { ...state.moduleData, [collection]: current.filter((it: any) => it.id !== id) };
    saveCollection("moduleData", next);
    return { moduleData: next };
  }),
  setModuleData: (collection, items) => set((state) => {
    const next = { ...state.moduleData, [collection]: items };
    saveCollection("moduleData", next);
    return { moduleData: next };
  }),

  // Attendance records (per-student, per-day)
  attendanceRecords: loadCollection("attendanceRecords", []),
  saveAttendance: (records) => set((state) => {
    // Merge: replace any existing record with same studentId+date
    const existing = state.attendanceRecords.filter(r =>
      !records.some(nr => nr.studentId === r.studentId && nr.date === r.date)
    );
    const next = [...records, ...existing];
    saveCollection("attendanceRecords", next);
    return { attendanceRecords: next };
  }),
}));

// Auto-persist key collections to localStorage on every change
useAppStore.subscribe((state) => {
  saveCollection("students", state.students);
  saveCollection("teachers", state.teachers);
  saveCollection("staff", state.staff);
  saveCollection("feeCollections", state.feeCollections);
  saveCollection("activities", state.activities);
  saveCollection("documents", state.documents);
  saveCollection("commLogs", state.commLogs);
  saveCollection("transactions", state.transactions);
  saveCollection("classes", state.classes);
  saveCollection("subjects", state.subjects);
});
