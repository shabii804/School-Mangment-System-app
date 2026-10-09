// Demo data store for the School Management System
// All data is in-memory mock data for the desktop app simulation

export type Role = "admin" | "accountant" | "teacher";

export type StudentStatus = "Active" | "Left";
export interface Student {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  gender: "Male" | "Female";
  dob: string;
  // Personal
  cnic: string; // B-Form number for students
  bloodGroup: string;
  religion: string;
  nationality: string;
  address: string;
  // Father
  fatherName: string;
  fatherCnic: string;
  fatherPhone: string;
  fatherOccupation: string;
  // Mother
  motherName: string;
  motherPhone: string;
  motherOccupation: string;
  // Guardian (if parents unavailable)
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  primaryContact: "father" | "mother" | "guardian";
  // Emergency
  emergencyContact: string;
  emergencyName: string;
  // Medical
  medicalConditions: string;
  allergies: string;
  // Academic
  previousSchool: string;
  admissionDate: string;
  monthlyFee: number;
  // Photo
  photo?: string; // base64 data URL
  // Status
  status: StudentStatus;
  attendancePct: number;
  feePaidThisMonth: boolean;
  outstandingAmount: number;
  isHosteller: boolean;
  transport: boolean;
  transportRoute?: string;
  siblings?: string; // names of siblings in same school
  // Backwards compat
  fatherPhone2?: string;
}

export interface Teacher {
  id: string;
  name: string;
  cnic: string;
  designation: string;
  qualification: string;
  subjects: string[];
  classes: string[];
  monthlySalary: number;
  joiningDate: string;
  phone: string;
  gender: "Male" | "Female";
  attendance: { present: number; late: number; halfDay: number; absent: number; leave: number };
}

export interface Staff {
  id: string;
  name: string;
  cnic: string;
  department: string;
  designation: string;
  monthlySalary: number;
  joiningDate: string;
  phone: string;
  attendance: { present: number; late: number; halfDay: number; absent: number; leave: number };
}

export interface FeeCollection {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  amount: number;
  mode: "Cash" | "Cheque" | "Bank Transfer";
  // Breakdown by fee type (only 3 types now)
  tuition?: number;
  admission?: number;
  hostel?: number;
  feeType: string; // legacy label, derived from breakdown
}

export interface TimetableSlot {
  day: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
}

export interface Exam {
  id: string;
  name: string;
  type: "Monthly" | "Mid-Term" | "Final";
  startDate: string;
  endDate: string;
  classes: string[];
}

export interface Activity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  description: string;
  type: "fee" | "attendance" | "admission" | "salary" | "certificate" | "system";
}

// ─────────────────────────────────────────────────────────────
// Classes & subjects — EMPTY (admin adds via Classes module)
// ─────────────────────────────────────────────────────────────
export const CLASSES: { name: string; sections: string[]; monthlyFee: number }[] = [];

export const SUBJECTS: string[] = [];

// ─────────────────────────────────────────────────────────────
// Sample students (40 students across classes)
// ─────────────────────────────────────────────────────────────


export const STUDENTS: Student[] = [];

// ─────────────────────────────────────────────────────────────
// Teachers
// ─────────────────────────────────────────────────────────────
export const TEACHERS: Teacher[] = [];

// ─────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────
export const STAFF: Staff[] = [];

// ─────────────────────────────────────────────────────────────
// Fee Collections (last 30 days)
// ─────────────────────────────────────────────────────────────
export const FEE_COLLECTIONS: FeeCollection[] = [];

// ─────────────────────────────────────────────────────────────
// Activities
// ─────────────────────────────────────────────────────────────
export const ACTIVITIES: Activity[] = [];

// ─────────────────────────────────────────────────────────────
// Timetable (Grade 9-A sample)
// ─────────────────────────────────────────────────────────────
export const TIMETABLE: Record<string, TimetableSlot[]> = {};

// ─────────────────────────────────────────────────────────────
// Exams
// ─────────────────────────────────────────────────────────────
export const EXAMS: Exam[] = [];

// ─────────────────────────────────────────────────────────────
// Derived stats
// ─────────────────────────────────────────────────────────────
export const STATS = {
  totalStudents: 0,
  totalTeachers: 0,
  totalStaff: 0,
  todayAttendancePct: 0,
  todayFeeCollection: 0,
  monthlyIncome: 0,
  pendingFees: 0,
  defaultersCount: 0,
};

// Monthly trend data for charts
export const FEE_TREND: any[] = [];

export const STUDENT_GROWTH: any[] = [];

export const EXPENSE_BREAKDOWN: any[] = [];

// ─────────────────────────────────────────────────────────────
// Today's schedule (timetable for currently-running period)
// ─────────────────────────────────────────────────────────────
export const TODAY_SCHEDULE: any[] = [];

// ─────────────────────────────────────────────────────────────
// Upcoming birthdays (next 7 days)
// ─────────────────────────────────────────────────────────────
export const UPCOMING_BIRTHDAYS: any[] = [];

// ─────────────────────────────────────────────────────────────
// Pending tasks for today
// ─────────────────────────────────────────────────────────────
export const PENDING_TASKS: any[] = [];

// Empty data arrays (clean start — no dummy data)
export const BOOKS: Book[] = [];
export const BOOK_ISSUES: BookIssue[] = [];
export const BUS_ROUTES: BusRoute[] = [];
export const HOSTEL_ROOMS: HostelRoom[] = [];
export const INVENTORY_ITEMS: InventoryItem[] = [];
export const SCHOOL_EVENTS: SchoolEvent[] = [];
export const INCIDENTS: Incident[] = [];
export const ALUMNI: Alumnus[] = [];
export const LEAVE_REQUESTS: LeaveRequest[] = [];
export const LEAVE_BALANCES: LeaveBalance[] = [];
export const CONCESSIONS: Concession[] = [];
export const ACADEMIC_SESSIONS: AcademicSession[] = [];
