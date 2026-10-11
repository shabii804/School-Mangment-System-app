// Global app store using Zustand
import { create } from "zustand";
import {
  STUDENTS, TEACHERS, STAFF, FEE_COLLECTIONS, ACTIVITIES,
  type Student, type Teacher, type Staff, type FeeCollection, type Activity, type Role,
} from "./sms-data";

// Re-export types so consumers can import them from sms-store if desired
export type {
  Role, Student, Teacher, Staff, FeeCollection, Activity,
  TimetableSlot, Book, BookIssue, BusRoute, HostelRoom,
  InventoryItem, SchoolEvent, Incident, Alumnus,
  LeaveRequest, LeaveBalance, Concession, AcademicSession, Exam,
} from "./sms-data";

// ─── Local date helper ───
// Returns YYYY-MM-DD in LOCAL time (not UTC).
// Using toISOString().split("T")[0] returns UTC date which can be off by 1 day
// in timezones east of GMT (e.g., Pakistan UTC+5 at 4am → previous day in UTC).
export function localDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Returns YYYY-MM (current local month)
export function localMonthStr(): string {
  return localDateStr().slice(0, 7);
}

// Auto-sync guard — prevents overwriting seeded data before loadFromDatabase() runs
let isInitialLoadComplete = false;

export type ModuleKey =
  | "dashboard" | "students" | "teachers" | "staff" | "classes" | "timetable"
  | "attendance" | "salary" | "fees" | "defaulters" | "results" | "certificates"
  | "reports" | "analytics" | "users" | "settings" | "ledger"
  | "exam" | "library" | "transport" | "hostel" | "inventory" | "events"
  | "discipline" | "alumni" | "parent" | "sms" | "leave" | "concession" | "ai";

export interface SchoolInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null; // base64 data URL
  session: string;
}

export type FeeType = "one-time" | "annual" | "monthly";

export interface FeeItem {
  name: string;
  amount: number;
  type: FeeType;        // one-time = charged once at admission; annual = once per year; monthly = every month
  enabled: boolean;
  description?: string;
}

export interface FeeStructureConfig {
  // Per-class tuition fees (class name → monthly tuition)
  classFees: Record<string, number>;
  // Global hostel fee (applied to all hostellers, monthly)
  hostelFee: number;
  // Late payment fine (flat, after due date)
  lateFee: number;
  // Fee due date (day of month, 1-28)
  dueDate: number;
  // Dynamic fee items — admin controls these
  feeItems: FeeItem[];
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

  // ─── Database sync state ───
  syncStatus: "idle" | "syncing" | "online" | "offline" | "error";
  lastSyncAt: string | null;
  dbStats: { size: number; collections: number; lastSync: string | null } | null;
  setSyncStatus: (s: AppState["syncStatus"]) => void;
  syncToDatabase: () => Promise<boolean>;
  loadFromDatabase: () => Promise<boolean>;

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
  // promoteStudent removed — use updateStudent() directly from the UI
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
  status: "Present" | "Absent" | "Late" | "Leave" | "Half-Day";
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
  hostelFee: 5000,
  lateFee: 500,
  dueDate: 10,
  feeItems: [
    { name: "Admission Fee", amount: 5000, type: "one-time", enabled: true, description: "One-time charge when student is admitted" },
    { name: "Annual Registration Fee", amount: 2000, type: "annual", enabled: true, description: "Charged once per academic year" },
    { name: "Tuition Fee", amount: 0, type: "monthly", enabled: true, description: "Monthly tuition — set per class" },
    { name: "Hostel Fee", amount: 5000, type: "monthly", enabled: false, description: "Monthly — only for hostellers" },
    { name: "Transport Fee", amount: 1500, type: "monthly", enabled: false, description: "Monthly — only for transport users" },
    { name: "Exam Fee", amount: 500, type: "annual", enabled: false, description: "Annual exam fee" },
    { name: "Library Security", amount: 1000, type: "one-time", enabled: false, description: "Refundable security deposit" },
    { name: "Lab Fee", amount: 800, type: "annual", enabled: false, description: "Annual science lab fee" },
  ],
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
  alumni: true, parent: true, sms: true, leave: true, concession: true, ai: true,
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
    if (raw) {
      const parsed = JSON.parse(raw);
      // Deep-merge feeItems so old data without feeItems gets the defaults
      const merged = { ...DEFAULT_FEE_STRUCTURE, ...parsed };
      if (!merged.feeItems || !Array.isArray(merged.feeItems) || merged.feeItems.length === 0) {
        merged.feeItems = DEFAULT_FEE_STRUCTURE.feeItems;
      }
      return merged;
    }
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
  const CURRENT_VERSION = "18.0-nan-perm-fix";
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
    // Reset the auto-sync guard so the new session doesn't overwrite seed data
    isInitialLoadComplete = false;
  }

  // ─── Auto-reset feePaidThisMonth on month boundary ───
  // On every page load, check if the current calendar month differs from
  // the students' lastPaidMonth. If so, reset feePaidThisMonth = false
  // and recharge outstandingAmount for the new month.
  // This prevents the "all students show Paid in January" bug.
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const lastResetMonth = window.localStorage.getItem("edudesk_lastFeeReset");
  if (lastResetMonth !== currentMonth) {
    // Month has changed (or first run) — reset fee flags for all students
    try {
      const rawStudents = window.localStorage.getItem("edudesk_students");
      if (rawStudents) {
        const studentsList = JSON.parse(rawStudents) as Student[];
        let changed = false;
        const updated = studentsList.map(s => {
          if (s.status === "Active" && s.feePaidThisMonth) {
            changed = true;
            return {
              ...s,
              feePaidThisMonth: false,
              // Add this month's fee to outstanding (since it hasn't been paid)
              outstandingAmount: s.outstandingAmount + s.monthlyFee,
              lastPaidMonth: s.lastPaidMonth || lastResetMonth || currentMonth,
            };
          }
          return s;
        });
        if (changed) {
          window.localStorage.setItem("edudesk_students", JSON.stringify(updated));
          console.log(`[Auto-Reset] Fee flags reset for new month: ${currentMonth} (was ${lastResetMonth || "never"})`);
        }
      }
      window.localStorage.setItem("edudesk_lastFeeReset", currentMonth);
    } catch {}
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

  // ─── Database sync ───
  syncStatus: "idle",
  lastSyncAt: null,
  dbStats: null,
  setSyncStatus: (s) => set({ syncStatus: s }),
  syncToDatabase: async () => {
    set({ syncStatus: "syncing" });
    try {
      const state = get();
      const stateToSave = {
        students: state.students,
        teachers: state.teachers,
        staff: state.staff,
        feeCollections: state.feeCollections,
        activities: state.activities,
        documents: state.documents,
        commLogs: state.commLogs,
        transactions: state.transactions,
        classes: state.classes,
        subjects: state.subjects,
        moduleData: state.moduleData,
        attendanceRecords: state.attendanceRecords,
        school: state.school,
        feeStructure: state.feeStructure,
        enabledModules: state.enabledModules,
      };
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateToSave }),
      });
      const data = await res.json();
      if (data.success) {
        set({ syncStatus: "online", lastSyncAt: new Date().toISOString(), dbStats: data.stats });
        return true;
      } else {
        set({ syncStatus: "error" });
        return false;
      }
    } catch (e) {
      // Network error — we're offline, data is still in localStorage
      set({ syncStatus: "offline" });
      return false;
    }
  },
  loadFromDatabase: async () => {
    // Set the flag IMMEDIATELY (synchronously, before any async work)
    // This prevents the subscribe block from syncing empty state to SQLite
    // before we've had a chance to load the real data
    isInitialLoadComplete = false;
    set({ syncStatus: "syncing" });
    try {
      const res = await fetch("/api/state", { method: "GET" });
      const data = await res.json();
      if (data.success && data.state) {
        const s = data.state;
        // Only update collections that exist in the database (don't overwrite with undefined)
        const patch: Partial<AppState> = { syncStatus: "online", dbStats: data.stats, lastSyncAt: new Date().toISOString() };
        if (s.students) patch.students = s.students;
        if (s.teachers) patch.teachers = s.teachers;
        if (s.staff) patch.staff = s.staff;
        if (s.feeCollections) patch.feeCollections = s.feeCollections;
        if (s.activities) patch.activities = s.activities;
        if (s.documents) patch.documents = s.documents;
        if (s.commLogs) patch.commLogs = s.commLogs;
        if (s.transactions) patch.transactions = s.transactions;
        if (s.classes) patch.classes = s.classes;
        if (s.subjects) patch.subjects = s.subjects;
        if (s.moduleData) patch.moduleData = s.moduleData;
        if (s.attendanceRecords) patch.attendanceRecords = s.attendanceRecords;
        if (s.school) patch.school = s.school;
        if (s.feeStructure) patch.feeStructure = s.feeStructure;
        if (s.enabledModules) patch.enabledModules = s.enabledModules;
        set(patch);
        // Also update localStorage as cache
        if (typeof window !== "undefined") {
          Object.entries(s).forEach(([key, value]) => {
            try { window.localStorage.setItem(`edudesk_${key}`, JSON.stringify(value)); } catch {}
          });
        }
        // Mark initial load complete AFTER state is set
        // Use setTimeout to ensure the set() above (which triggers subscribe) completes first
        // with isInitialLoadComplete still false, THEN enable auto-sync
        setTimeout(() => { isInitialLoadComplete = true; }, 500);
        return true;
      }
      // Even if SQLite was empty, enable auto-sync so future changes are saved
      setTimeout(() => { isInitialLoadComplete = true; }, 500);
      set({ syncStatus: "offline" });
      return false;
    } catch (e) {
      // On error, enable auto-sync so localStorage data gets saved to SQLite
      setTimeout(() => { isInitialLoadComplete = true; }, 500);
      set({ syncStatus: "offline" });
      return false;
    }
  },

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
    // Clean up PII: delete all documents belonging to this student
    documents: state.documents.filter(d => d.studentId !== id),
    // Clean up communication logs
    commLogs: state.commLogs.filter(l => l.studentId !== id),
    // NOTE: feeCollections and attendanceRecords are kept for audit trail
    // (the student's name is still embedded in feeCollections.studentName)
  })),

  // promoteStudent action removed — the UI uses updateStudent() directly
  // with proper roll-number computation, fee adjustment, and academicStatus.
  // The old action used Math.random() for roll numbers which caused collisions.

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
    const receiptNo = `RCPT-${localDateStr().replace(/-/g, "")}-${String(Date.now()).slice(-6)}`;
    const newCollection: FeeCollection = {
      id: `FC-${Date.now()}`,
      receiptNo,
      studentId,
      studentName: student.name,
      class: student.class,
      date: localDateStr(),
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
      students: state.students.map(s => {
        if (s.id !== studentId) return s;
        const newOutstanding = Math.max(0, s.outstandingAmount - amount);
        // Only mark feePaidThisMonth = true when outstanding reaches 0
        // Partial payments keep the flag false so the student still appears in Defaulters
        const fullyPaid = newOutstanding <= 0;
        return {
          ...s,
          feePaidThisMonth: fullyPaid,
          lastPaidMonth: fullyPaid ? new Date().toISOString().slice(0, 7) : s.lastPaidMonth,
          outstandingAmount: newOutstanding,
        };
      }),
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

// Auto-sync guard variables — declared early (before version-bump block uses them)
// These prevent the subscribe block from syncing empty state to the JSON DB
// before loadFromDatabase() has had a chance to load real data
let sqliteSyncTimer: ReturnType<typeof setTimeout> | null = null;
// isInitialLoadComplete is already declared at line 26 above

// Throttle localStorage writes to avoid memory pressure
let localStorageTimer: ReturnType<typeof setTimeout> | null = null;

useAppStore.subscribe((state) => {
  // 1. Throttled localStorage save (offline cache) — 500ms debounce
  // Writing 12 collections synchronously on every state change causes memory pressure
  if (localStorageTimer) clearTimeout(localStorageTimer);
  localStorageTimer = setTimeout(() => {
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
    saveCollection("moduleData", state.moduleData);
    saveCollection("attendanceRecords", state.attendanceRecords);
  }, 500);

  // 2. Debounced JSON DB sync (source of truth) — 5 second delay after last change
  // SKIP until initial load from DB has completed — prevents overwriting seeded data
  if (!isInitialLoadComplete) return;
  if (sqliteSyncTimer) clearTimeout(sqliteSyncTimer);
  sqliteSyncTimer = setTimeout(async () => {
    try {
      const stateToSave = {
        students: state.students,
        teachers: state.teachers,
        staff: state.staff,
        feeCollections: state.feeCollections,
        activities: state.activities,
        documents: state.documents,
        commLogs: state.commLogs,
        transactions: state.transactions,
        classes: state.classes,
        subjects: state.subjects,
        moduleData: state.moduleData,
        attendanceRecords: state.attendanceRecords,
        school: state.school,
        feeStructure: state.feeStructure,
        enabledModules: state.enabledModules,
      };
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateToSave }),
      });
      const data = await res.json();
      if (data.success) {
        useAppStore.setState({ syncStatus: "online", lastSyncAt: new Date().toISOString(), dbStats: data.stats });
      }
    } catch (e) {
      // Offline — data is safe in localStorage, will sync when back online
      useAppStore.setState({ syncStatus: "offline" });
    }
  }, 5000);
});

// ─── enableAutoSync is no longer needed ───
// loadFromDatabase() now sets isInitialLoadComplete = true via setTimeout
// after the state has been loaded, which automatically enables auto-sync.
// This prevents the race condition where the subscribe block would overwrite
// seeded data before loadFromDatabase() had a chance to run.
export function enableAutoSync() {
  isInitialLoadComplete = true;
}
