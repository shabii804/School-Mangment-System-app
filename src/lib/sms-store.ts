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

interface AppState {
  // Auth
  role: Role;
  setRole: (role: Role) => void;
  userName: string;

  // Navigation
  activeModule: ModuleKey;
  setActiveModule: (m: ModuleKey) => void;

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

  // Actions
  addStudent: (s: Student) => void;
  collectFee: (studentId: string, amount: number, mode: "Cash" | "Cheque" | "Bank Transfer", feeType: string) => void;
  markAttendance: (studentIds: string[], status: "Present" | "Absent" | "Late" | "Leave") => void;
}

const ROLE_NAMES: Record<Role, string> = {
  admin: "Mr. Principal (Admin)",
  accountant: "Ms. Nargis (Accountant)",
  teacher: "Ms. Sadia (Teacher)",
};

export const useAppStore = create<AppState>((set, get) => ({
  role: "admin",
  setRole: (role) => set({ role, userName: ROLE_NAMES[role] }),
  userName: ROLE_NAMES.admin,

  activeModule: "dashboard",
  setActiveModule: (m) => set({ activeModule: m }),

  students: STUDENTS,
  teachers: TEACHERS,
  staff: STAFF,
  feeCollections: FEE_COLLECTIONS,
  activities: ACTIVITIES,

  isDark: false,
  toggleTheme: () => set((s) => ({ isDark: !s.isDark })),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  addStudent: (s) => set((state) => ({ students: [s, ...state.students] })),

  collectFee: (studentId, amount, mode, feeType) => {
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
      feeType,
    };
    const newActivity: Activity = {
      id: `A${state.activities.length + 1}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      user: state.userName,
      action: "Fee Collected",
      description: `Rs. ${amount.toLocaleString()} from ${student.name} (${student.class})`,
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
