// Global app store using Zustand
import { create } from "zustand";
import {
  STUDENTS, TEACHERS, STAFF, FEE_COLLECTIONS, ACTIVITIES,
  type Student, type Teacher, type Staff, type FeeCollection, type Activity, type Role,
} from "./sms-data";

export type ModuleKey =
  | "dashboard" | "students" | "teachers" | "staff" | "classes" | "timetable"
  | "attendance" | "salary" | "fees" | "defaulters" | "results" | "certificates"
  | "reports" | "analytics" | "users" | "settings";

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

  // School branding
  school: SchoolInfo;
  updateSchool: (patch: Partial<SchoolInfo>) => void;
  setLogo: (logo: string | null) => void;

  // Fee structure config
  feeStructure: FeeStructureConfig;
  updateFeeStructure: (patch: Partial<FeeStructureConfig>) => void;
  setClassFee: (className: string, amount: number) => void;

  // Data
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  feeCollections: FeeCollection[];
  activities: Activity[];

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
  collectFee: (studentId: string, amount: number, mode: "Cash" | "Cheque" | "Bank Transfer", feeType: string, breakdown?: { tuition?: number; admission?: number; hostel?: number }) => void;
  markAttendance: (studentIds: string[], status: "Present" | "Absent" | "Late" | "Leave") => void;
}

const ROLE_NAMES: Record<Role, string> = {
  admin: "Mr. Principal (Admin)",
  accountant: "Ms. Nargis (Accountant)",
  teacher: "Ms. Sadia (Teacher)",
};

const DEFAULT_SCHOOL: SchoolInfo = {
  name: "Greenwood Public School",
  tagline: "Knowledge • Character • Excellence",
  address: "123 Education Road, Karachi, Pakistan",
  phone: "+92 21 1234567",
  email: "info@greenwood.edu",
  logo: null,
  session: "2026–27",
};

const DEFAULT_FEE_STRUCTURE: FeeStructureConfig = {
  classFees: {
    "Playgroup": 1500, "Nursery": 1800, "KG": 2000,
    "Grade 1": 2200, "Grade 2": 2400, "Grade 3": 2600,
    "Grade 4": 2800, "Grade 5": 3000, "Grade 6": 3200,
    "Grade 7": 3500, "Grade 8": 3800, "Grade 9": 4200, "Grade 10": 4500,
  },
  hostelFee: 3500,
  admissionMultiplier: 3,
  lateFee: 200,
  dueDate: 10,
};

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

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "N1", title: "3 Fee Defaulters Today", description: "Rs. 9,000 outstanding across 3 students", time: "5 min ago", type: "fee", read: false, action: { module: "defaulters", label: "View List" } },
  { id: "N2", title: "Attendance Pending", description: "Grade 10-A attendance not marked yet", time: "1 hour ago", type: "attendance", read: false, action: { module: "attendance", label: "Mark Now" } },
  { id: "N3", title: "Salary Slips Due", description: "July 2026 payroll needs to be finalized", time: "2 hours ago", type: "salary", read: false, action: { module: "salary", label: "Process" } },
  { id: "N4", title: "New Admission", description: "Zara Sheikh joined Nursery-A", time: "Yesterday", type: "admission", read: true, action: { module: "students", label: "View Profile" } },
  { id: "N5", title: "Backup Completed", description: "Automatic daily backup saved (4.2 MB)", time: "Yesterday", type: "system", read: true },
  { id: "N6", title: "Birthday Today 🎂", description: "Ahmed Khan (Grade 5-A) celebrates today", time: "Today", type: "birthday", read: false, action: { module: "students", label: "Greet" } },
];

export const useAppStore = create<AppState>((set, get) => ({
  role: "admin",
  setRole: (role) => set({ role, userName: ROLE_NAMES[role] }),
  userName: ROLE_NAMES.admin,

  activeModule: "dashboard",
  setActiveModule: (m) => set({ activeModule: m }),

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

  students: STUDENTS,
  teachers: TEACHERS,
  staff: STAFF,
  feeCollections: FEE_COLLECTIONS,
  activities: ACTIVITIES,

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

  collectFee: (studentId, amount, mode, feeType, breakdown) => {
    const state = get();
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;
    const receiptNo = `RCPT-20260702-${String(state.feeCollections.length + 1).padStart(3, "0")}`;
    const newCollection: FeeCollection = {
      id: `FC-${String(state.feeCollections.length + 1).padStart(4, "0")}`,
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
}));
