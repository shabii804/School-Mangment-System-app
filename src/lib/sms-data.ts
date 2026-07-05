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
// Classes & subjects
// ─────────────────────────────────────────────────────────────
export const CLASSES = [
  { name: "Playgroup", sections: ["A", "B"], monthlyFee: 1500 },
  { name: "Nursery", sections: ["A", "B"], monthlyFee: 1800 },
  { name: "KG", sections: ["A", "B"], monthlyFee: 2000 },
  { name: "Grade 1", sections: ["A", "B", "C"], monthlyFee: 2200 },
  { name: "Grade 2", sections: ["A", "B"], monthlyFee: 2400 },
  { name: "Grade 3", sections: ["A", "B"], monthlyFee: 2600 },
  { name: "Grade 4", sections: ["A", "B"], monthlyFee: 2800 },
  { name: "Grade 5", sections: ["A", "B"], monthlyFee: 3000 },
  { name: "Grade 6", sections: ["A", "B"], monthlyFee: 3200 },
  { name: "Grade 7", sections: ["A"], monthlyFee: 3500 },
  { name: "Grade 8", sections: ["A"], monthlyFee: 3800 },
  { name: "Grade 9", sections: ["A"], monthlyFee: 4200 },
  { name: "Grade 10", sections: ["A"], monthlyFee: 4500 },
];

export const SUBJECTS = [
  "English", "Urdu", "Mathematics", "Science", "Social Studies",
  "Islamiat", "Computer", "Physics", "Chemistry", "Biology",
];

// ─────────────────────────────────────────────────────────────
// Sample students (40 students across classes)
// ─────────────────────────────────────────────────────────────
const FIRST_NAMES_M = ["Ahmed", "Bilal", "Hamza", "Usman", "Ali", "Hassan", "Zain", "Omar", "Bilal", "Farhan"];
const FIRST_NAMES_F = ["Ayesha", "Fatima", "Zainab", "Maryam", "Hira", "Sana", "Aisha", "Iqra", "Noor", "Sidra"];
const LAST_NAMES = ["Khan", "Ahmed", "Malik", "Sheikh", "Qureshi", "Butt", "Raza", "Ali", "Hussain", "Akram"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

const STUDENT_SEED: Student[] = Array.from({ length: 48 }, (_, i) => {
  const cls = CLASSES[i % CLASSES.length];
  const section = cls.sections[i % cls.sections.length];
  const isMale = i % 2 === 0;
  const name = `${isMale ? pick(FIRST_NAMES_M, i) : pick(FIRST_NAMES_F, i)} ${pick(LAST_NAMES, i)}`;
  const fatherName = `${pick(FIRST_NAMES_M, i + 3)} ${pick(LAST_NAMES, i)}`;
  const motherName = `${pick(FIRST_NAMES_F, i + 5)} ${pick(LAST_NAMES, i)}`;
  const feePaid = (i % 5) !== 0; // 80% have paid
  const isHosteller = i % 4 === 0; // 25% are hostellers
  const hasTransport = i % 3 === 0; // 33% use transport
  const tuition = cls.monthlyFee;
  const hostel = isHosteller ? 3500 : 0;
  const totalMonthly = tuition + hostel;
  const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
  const occupations = ["Engineer", "Doctor", "Teacher", "Businessman", "Government Officer", "Shopkeeper", "Carpenter", "Driver", "Accountant", "Lawyer"];
  const religions = ["Islam", "Christianity", "Hinduism"];
  const cities = ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi"];
  const streets = ["Block 4", "Block 7", "Main Blvd", "Street 12", "House #45", "Sector A"];
  const prevSchools = ["Bright Future School", "Al-Noor Academy", "The City School", "Beaconhouse", "Government Primary", "—"];
  return {
    id: `SCH-2026-${String(i + 1).padStart(4, "0")}`,
    rollNo: String((i % 30) + 1).padStart(2, "0"),
    name,
    class: cls.name,
    section,
    gender: isMale ? "Male" : "Female",
    dob: `${2014 + (i % 6)}-0${(i % 9) + 1}-1${i % 9}`,
    cnic: `42101-${String(100000000 + i * 1234567).slice(0, 6)}-${String((i * 3) % 10)}`,
    bloodGroup: bloodGroups[i % bloodGroups.length],
    religion: religions[i % religions.length],
    nationality: "Pakistani",
    address: `${streets[i % streets.length]}, ${cities[i % cities.length]}`,
    fatherName,
    fatherCnic: `42101-${String(200000000 + i * 7654321).slice(0, 6)}-${String((i * 5) % 10)}`,
    fatherPhone: `+92 3${String(10000000 + i * 12345).slice(0, 8)}`,
    fatherOccupation: occupations[i % occupations.length],
    motherName,
    motherPhone: i % 3 === 0 ? `+92 3${String(20000000 + i * 54321).slice(0, 8)}` : "",
    motherOccupation: i % 4 === 0 ? occupations[(i + 2) % occupations.length] : "Housewife",
    guardianName: i % 10 === 0 ? `${pick(FIRST_NAMES_M, i + 7)} ${pick(LAST_NAMES, i)}` : "",
    guardianPhone: i % 10 === 0 ? `+92 3${String(30000000 + i * 98765).slice(0, 8)}` : "",
    guardianRelation: i % 10 === 0 ? "Uncle" : "",
    primaryContact: i % 10 === 0 ? "guardian" : "father",
    emergencyContact: `+92 3${String(40000000 + i * 11111).slice(0, 8)}`,
    emergencyName: i % 2 === 0 ? fatherName : motherName,
    medicalConditions: i % 12 === 0 ? "Asthma" : i % 15 === 0 ? "Diabetes" : "None",
    allergies: i % 8 === 0 ? "Peanuts" : i % 11 === 0 ? "Dust" : "None",
    previousSchool: prevSchools[i % prevSchools.length],
    admissionDate: `${2024 + (i % 2)}-0${(i % 9) + 1}-1${i % 9}`,
    monthlyFee: cls.monthlyFee,
    status: i < 45 ? "Active" : "Left",
    attendancePct: 78 + (i % 22),
    feePaidThisMonth: feePaid,
    isHosteller,
    transport: hasTransport,
    transportRoute: hasTransport ? `Route ${String.fromCharCode(65 + (i % 5))} — ${["Gulshan", "Malir", "Korangi", "Nazimabad", "Saddar"][i % 5]}` : undefined,
    siblings: i % 5 === 0 ? `${pick(FIRST_NAMES_F, i + 2)} ${pick(LAST_NAMES, i)} (Grade 3)` : "",
    outstandingAmount: feePaid ? 0 : totalMonthly + (i % 3 === 0 ? totalMonthly : 0),
  };
});

export const STUDENTS: Student[] = STUDENT_SEED;

// ─────────────────────────────────────────────────────────────
// Teachers
// ─────────────────────────────────────────────────────────────
export const TEACHERS: Teacher[] = [
  { id: "T-001", name: "Ms. Sadia Rahman", cnic: "42101-1234567-8", designation: "Senior Teacher", qualification: "M.Sc Mathematics", subjects: ["Mathematics", "Physics"], classes: ["Grade 9", "Grade 10"], monthlySalary: 55000, joiningDate: "2019-03-15", phone: "+92 300 1234567", gender: "Female", attendance: { present: 22, late: 1, halfDay: 0, absent: 2, leave: 1 } },
  { id: "T-002", name: "Mr. Imran Yousuf", cnic: "42101-2345678-9", designation: "Science Teacher", qualification: "M.Sc Chemistry", subjects: ["Chemistry", "Physics"], classes: ["Grade 8", "Grade 9"], monthlySalary: 50000, joiningDate: "2020-08-01", phone: "+92 301 2345678", gender: "Male", attendance: { present: 24, late: 0, halfDay: 1, absent: 0, leave: 1 } },
  { id: "T-003", name: "Ms. Ayesha Khan", cnic: "42101-3456789-0", designation: "English Teacher", qualification: "M.A English", subjects: ["English"], classes: ["Grade 6", "Grade 7", "Grade 8"], monthlySalary: 48000, joiningDate: "2021-01-10", phone: "+92 302 3456789", gender: "Female", attendance: { present: 23, late: 2, halfDay: 0, absent: 1, leave: 0 } },
  { id: "T-004", name: "Mr. Kamran Akhtar", cnic: "42101-4567890-1", designation: "Computer Teacher", qualification: "BSCS", subjects: ["Computer"], classes: ["Grade 5", "Grade 6", "Grade 7"], monthlySalary: 45000, joiningDate: "2022-04-20", phone: "+92 303 4567890", gender: "Male", attendance: { present: 26, late: 0, halfDay: 0, absent: 0, leave: 0 } },
  { id: "T-005", name: "Ms. Hina Aslam", cnic: "42101-5678901-2", designation: "Urdu Teacher", qualification: "M.A Urdu", subjects: ["Urdu", "Islamiat"], classes: ["Grade 3", "Grade 4", "Grade 5"], monthlySalary: 42000, joiningDate: "2020-09-12", phone: "+92 304 5678901", gender: "Female", attendance: { present: 21, late: 1, halfDay: 0, absent: 3, leave: 1 } },
  { id: "T-006", name: "Mr. Faisal Mahmood", cnic: "42101-6789012-3", designation: "Class Teacher", qualification: "B.Ed", subjects: ["Science", "Social Studies"], classes: ["Grade 1", "Grade 2"], monthlySalary: 38000, joiningDate: "2023-03-01", phone: "+92 305 6789012", gender: "Male", attendance: { present: 25, late: 0, halfDay: 1, absent: 0, leave: 0 } },
  { id: "T-007", name: "Ms. Rabia Noor", cnic: "42101-7890123-4", designation: "Primary Teacher", qualification: "B.Ed", subjects: ["English", "Mathematics"], classes: ["Playgroup", "Nursery", "KG"], monthlySalary: 35000, joiningDate: "2021-08-15", phone: "+92 306 7890123", gender: "Female", attendance: { present: 24, late: 0, halfDay: 0, absent: 1, leave: 1 } },
];

// ─────────────────────────────────────────────────────────────
// Staff
// ─────────────────────────────────────────────────────────────
export const STAFF: Staff[] = [
  { id: "ST-001", name: "Mr. Tariq Mehmood", cnic: "42101-1111111-1", department: "Administration", designation: "Office Manager", monthlySalary: 40000, joiningDate: "2018-06-01", phone: "+92 310 1111111", attendance: { present: 25, late: 0, halfDay: 0, absent: 1, leave: 0 } },
  { id: "ST-002", name: "Ms. Nargis Bibi", cnic: "42101-2222222-2", department: "Accounts", designation: "Accountant", monthlySalary: 38000, joiningDate: "2019-02-10", phone: "+92 311 2222222", attendance: { present: 26, late: 0, halfDay: 0, absent: 0, leave: 0 } },
  { id: "ST-003", name: "Mr. Akram Khan", cnic: "42101-3333333-3", department: "Security", designation: "Security Guard", monthlySalary: 25000, joiningDate: "2020-01-05", phone: "+92 312 3333333", attendance: { present: 26, late: 0, halfDay: 0, absent: 0, leave: 0 } },
  { id: "ST-004", name: "Mr. Salim Shah", cnic: "42101-4444444-4", department: "Transport", designation: "Driver", monthlySalary: 28000, joiningDate: "2021-07-20", phone: "+92 313 4444444", attendance: { present: 22, late: 2, halfDay: 0, absent: 2, leave: 0 } },
  { id: "ST-005", name: "Ms. Farzana Begum", cnic: "42101-5555555-5", department: "Housekeeping", designation: "Janitor", monthlySalary: 22000, joiningDate: "2022-03-15", phone: "+92 314 5555555", attendance: { present: 25, late: 1, halfDay: 0, absent: 0, leave: 0 } },
];

// ─────────────────────────────────────────────────────────────
// Fee Collections (last 30 days)
// ─────────────────────────────────────────────────────────────
export const FEE_COLLECTIONS: FeeCollection[] = Array.from({ length: 38 }, (_, i) => {
  const student = STUDENTS[i % STUDENTS.length];
  const daysAgo = i % 30;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Only 3 fee types: Tuition, Admission, Hostel
  const isAdmission = i % 11 === 0; // ~9% admissions
  const tuition = isAdmission ? 0 : student.monthlyFee;
  const admission = isAdmission ? student.monthlyFee * 3 : 0; // admission = 3x monthly
  const hostel = student.isHosteller && !isAdmission ? 3500 : 0;
  const total = tuition + admission + hostel;
  const feeTypeLabel = isAdmission ? "Admission Fee" : student.isHosteller ? "Tuition + Hostel" : "Tuition";
  return {
    id: `FC-${String(i + 1).padStart(4, "0")}`,
    receiptNo: `RCPT-202607${String(daysAgo).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`,
    studentId: student.id,
    studentName: student.name,
    class: student.class,
    date: date.toISOString().split("T")[0],
    amount: total,
    mode: i % 4 === 0 ? "Cheque" : i % 7 === 0 ? "Bank Transfer" : "Cash",
    tuition,
    admission,
    hostel,
    feeType: feeTypeLabel,
  };
});

// ─────────────────────────────────────────────────────────────
// Activities
// ─────────────────────────────────────────────────────────────
export const ACTIVITIES: Activity[] = [
  { id: "A1", timestamp: "2026-07-02 09:42", user: "Nargis Bibi", action: "Fee Collected", description: "Rs. 3,000 from Ahmed Khan (Grade 5-A)", type: "fee" },
  { id: "A2", timestamp: "2026-07-02 09:15", user: "Ms. Sadia", action: "Attendance Marked", description: "Grade 10-A — 28 present, 2 absent", type: "attendance" },
  { id: "A3", timestamp: "2026-07-02 08:50", user: "Admin", action: "Student Admitted", description: "New admission: Zara Sheikh (Nursery-A)", type: "admission" },
  { id: "A4", timestamp: "2026-07-01 16:30", user: "Nargis Bibi", action: "Salary Slip Generated", description: "July 2026 — Mr. Imran Yousuf", type: "salary" },
  { id: "A5", timestamp: "2026-07-01 14:20", user: "Admin", action: "Certificate Issued", description: "Bonafide — Ayesha Khan (Grade 8-A)", type: "certificate" },
  { id: "A6", timestamp: "2026-07-01 11:05", user: "Ms. Ayesha", action: "Marks Entered", description: "Mid-Term English — Grade 7-A", type: "system" },
  { id: "A7", timestamp: "2026-06-30 17:45", user: "Admin", action: "Backup Created", description: "Automatic daily backup — 4.2 MB", type: "system" },
];

// ─────────────────────────────────────────────────────────────
// Timetable (Grade 9-A sample)
// ─────────────────────────────────────────────────────────────
export const TIMETABLE: Record<string, TimetableSlot[]> = {
  "Grade 9-A": [
    { day: "Monday", period: 1, subject: "Mathematics", teacher: "Ms. Sadia", room: "R-201" },
    { day: "Monday", period: 2, subject: "Physics", teacher: "Ms. Sadia", room: "Lab-1" },
    { day: "Monday", period: 3, subject: "English", teacher: "Ms. Ayesha", room: "R-201" },
    { day: "Monday", period: 4, subject: "Chemistry", teacher: "Mr. Imran", room: "Lab-2" },
    { day: "Monday", period: 5, subject: "Urdu", teacher: "Ms. Hina", room: "R-201" },
    { day: "Monday", period: 6, subject: "Computer", teacher: "Mr. Kamran", room: "Lab-3" },
    { day: "Tuesday", period: 1, subject: "English", teacher: "Ms. Ayesha", room: "R-201" },
    { day: "Tuesday", period: 2, subject: "Mathematics", teacher: "Ms. Sadia", room: "R-201" },
    { day: "Tuesday", period: 3, subject: "Islamiat", teacher: "Ms. Hina", room: "R-201" },
    { day: "Tuesday", period: 4, subject: "Physics", teacher: "Ms. Sadia", room: "Lab-1" },
    { day: "Tuesday", period: 5, subject: "Chemistry", teacher: "Mr. Imran", room: "Lab-2" },
    { day: "Tuesday", period: 6, subject: "Computer", teacher: "Mr. Kamran", room: "Lab-3" },
    { day: "Wednesday", period: 1, subject: "Mathematics", teacher: "Ms. Sadia", room: "R-201" },
    { day: "Wednesday", period: 2, subject: "Chemistry", teacher: "Mr. Imran", room: "Lab-2" },
    { day: "Wednesday", period: 3, subject: "English", teacher: "Ms. Ayesha", room: "R-201" },
    { day: "Wednesday", period: 4, subject: "Physics", teacher: "Ms. Sadia", room: "Lab-1" },
    { day: "Wednesday", period: 5, subject: "Urdu", teacher: "Ms. Hina", room: "R-201" },
    { day: "Wednesday", period: 6, subject: "Computer", teacher: "Mr. Kamran", room: "Lab-3" },
    { day: "Thursday", period: 1, subject: "English", teacher: "Ms. Ayesha", room: "R-201" },
    { day: "Thursday", period: 2, subject: "Mathematics", teacher: "Ms. Sadia", room: "R-201" },
    { day: "Thursday", period: 3, subject: "Physics", teacher: "Ms. Sadia", room: "Lab-1" },
    { day: "Thursday", period: 4, subject: "Chemistry", teacher: "Mr. Imran", room: "Lab-2" },
    { day: "Thursday", period: 5, subject: "Islamiat", teacher: "Ms. Hina", room: "R-201" },
    { day: "Thursday", period: 6, subject: "Computer", teacher: "Mr. Kamran", room: "Lab-3" },
    { day: "Friday", period: 1, subject: "Mathematics", teacher: "Ms. Sadia", room: "R-201" },
    { day: "Friday", period: 2, subject: "English", teacher: "Ms. Ayesha", room: "R-201" },
    { day: "Friday", period: 3, subject: "Chemistry", teacher: "Mr. Imran", room: "Lab-2" },
    { day: "Friday", period: 4, subject: "Urdu", teacher: "Ms. Hina", room: "R-201" },
    { day: "Saturday", period: 1, subject: "Physics", teacher: "Ms. Sadia", room: "Lab-1" },
    { day: "Saturday", period: 2, subject: "Mathematics", teacher: "Ms. Sadia", room: "R-201" },
    { day: "Saturday", period: 3, subject: "English", teacher: "Ms. Ayesha", room: "R-201" },
  ],
};

// ─────────────────────────────────────────────────────────────
// Exams
// ─────────────────────────────────────────────────────────────
export const EXAMS: Exam[] = [
  { id: "E1", name: "Monthly Test - July 2026", type: "Monthly", startDate: "2026-07-15", endDate: "2026-07-18", classes: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
  { id: "E2", name: "Mid-Term Examination 2026", type: "Mid-Term", startDate: "2026-09-10", endDate: "2026-09-20", classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
  { id: "E3", name: "Final Examination 2026", type: "Final", startDate: "2026-12-01", endDate: "2026-12-15", classes: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"] },
];

// ─────────────────────────────────────────────────────────────
// Derived stats
// ─────────────────────────────────────────────────────────────
export const STATS = {
  totalStudents: STUDENTS.filter(s => s.status === "Active").length,
  totalTeachers: TEACHERS.length,
  totalStaff: STAFF.length,
  todayAttendancePct: 92,
  todayFeeCollection: 18500,
  monthlyIncome: FEE_COLLECTIONS.reduce((s, f) => s + f.amount, 0),
  pendingFees: STUDENTS.reduce((s, st) => s + st.outstandingAmount, 0),
  defaultersCount: STUDENTS.filter(s => s.outstandingAmount > 0).length,
};

// Monthly trend data for charts
export const FEE_TREND = [
  { month: "Feb", collected: 142000, pending: 18000 },
  { month: "Mar", collected: 138000, pending: 22000 },
  { month: "Apr", collected: 155000, pending: 15000 },
  { month: "May", collected: 148000, pending: 19000 },
  { month: "Jun", collected: 162000, pending: 12000 },
  { month: "Jul", collected: STATS.monthlyIncome, pending: STATS.pendingFees },
];

export const STUDENT_GROWTH = [
  { month: "Aug", students: 412 },
  { month: "Sep", students: 418 },
  { month: "Oct", students: 425 },
  { month: "Nov", students: 431 },
  { month: "Dec", students: 428 },
  { month: "Jan", students: 442 },
  { month: "Feb", students: 448 },
  { month: "Mar", students: 451 },
  { month: "Apr", students: 455 },
  { month: "May", students: 460 },
  { month: "Jun", students: 462 },
  { month: "Jul", students: STATS.totalStudents },
];

export const EXPENSE_BREAKDOWN = [
  { name: "Teaching", value: TEACHERS.reduce((s, t) => s + t.monthlySalary, 0), color: "#15857A" },
  { name: "Administration", value: STAFF.filter(s => s.department === "Administration").reduce((s, t) => s + t.monthlySalary, 0), color: "#FF6A3B" },
  { name: "Accounts", value: STAFF.filter(s => s.department === "Accounts").reduce((s, t) => s + t.monthlySalary, 0), color: "#6366F1" },
  { name: "Security", value: STAFF.filter(s => s.department === "Security").reduce((s, t) => s + t.monthlySalary, 0), color: "#EAB308" },
  { name: "Transport", value: STAFF.filter(s => s.department === "Transport").reduce((s, t) => s + t.monthlySalary, 0), color: "#EC4899" },
  { name: "Housekeeping", value: STAFF.filter(s => s.department === "Housekeeping").reduce((s, t) => s + t.monthlySalary, 0), color: "#14B8A6" },
];

// ─────────────────────────────────────────────────────────────
// Today's schedule (timetable for currently-running period)
// ─────────────────────────────────────────────────────────────
export const TODAY_SCHEDULE = [
  { time: "08:00", period: "P1", subject: "Mathematics", teacher: "Ms. Sadia", class: "Grade 9-A", room: "R-201", status: "completed" },
  { time: "08:45", period: "P2", subject: "Physics", teacher: "Ms. Sadia", class: "Grade 9-A", room: "Lab-1", status: "completed" },
  { time: "09:30", period: "P3", subject: "English", teacher: "Ms. Ayesha", class: "Grade 7-A", room: "R-105", status: "in-progress" },
  { time: "10:30", period: "Break", subject: "Morning Break", teacher: "—", class: "—", room: "—", status: "break" },
  { time: "10:45", period: "P4", subject: "Chemistry", teacher: "Mr. Imran", class: "Grade 9-A", room: "Lab-2", status: "upcoming" },
  { time: "11:30", period: "P5", subject: "Urdu", teacher: "Ms. Hina", class: "Grade 5-A", room: "R-103", status: "upcoming" },
  { time: "12:15", period: "P6", subject: "Computer", teacher: "Mr. Kamran", class: "Grade 7-A", room: "Lab-3", status: "upcoming" },
];

// ─────────────────────────────────────────────────────────────
// Upcoming birthdays (next 7 days)
// ─────────────────────────────────────────────────────────────
export const UPCOMING_BIRTHDAYS = [
  { name: "Ahmed Khan", class: "Grade 5-A", date: "Today", age: 11, avatar: "AK" },
  { name: "Fatima Ali", class: "Grade 3-B", date: "Tomorrow", age: 9, avatar: "FA" },
  { name: "Hamza Sheikh", class: "Grade 8-A", date: "Fri, Jul 4", age: 13, avatar: "HS" },
  { name: "Zainab Malik", class: "Grade 1-A", date: "Sat, Jul 5", age: 7, avatar: "ZM" },
  { name: "Bilal Ahmed", class: "Grade 6-B", date: "Mon, Jul 7", age: 12, avatar: "BA" },
];

// ─────────────────────────────────────────────────────────────
// Pending tasks for today
// ─────────────────────────────────────────────────────────────
export const PENDING_TASKS = [
  { id: "T1", title: "Mark attendance for Grade 10-A", module: "attendance" as const, priority: "high" as const, dueIn: "30 min" },
  { id: "T2", title: "Collect fee from 3 defaulters", module: "defaulters" as const, priority: "high" as const, dueIn: "2 hours" },
  { id: "T3", title: "Generate July salary slips", module: "salary" as const, priority: "medium" as const, dueIn: "Today" },
  { id: "T4", title: "Issue bonafide certificate for Ayesha", module: "certificates" as const, priority: "medium" as const, dueIn: "Today" },
  { id: "T5", title: "Enter mid-term English marks", module: "results" as const, priority: "low" as const, dueIn: "Tomorrow" },
];

// ─────────────────────────────────────────────────────────────
// LIBRARY DATA
// ─────────────────────────────────────────────────────────────
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  shelf: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  class: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  status: "Issued" | "Returned" | "Overdue";
}

export const BOOKS: Book[] = [
  { id: "BK-001", title: "Mathematics for Class 9", author: "Dr. R. Sharma", category: "Mathematics", isbn: "978-0123456789", totalCopies: 10, availableCopies: 7, shelf: "A-12" },
  { id: "BK-002", title: "English Grammar in Use", author: "Raymond Murphy", category: "English", isbn: "978-0521537629", totalCopies: 8, availableCopies: 5, shelf: "B-03" },
  { id: "BK-003", title: "Physics Fundamentals", author: "Halliday & Resnick", category: "Science", isbn: "978-0471320579", totalCopies: 6, availableCopies: 4, shelf: "C-08" },
  { id: "BK-004", title: "Urdu Adab Ki Mukhtasir Tareekh", author: "Dr. Jameel Jalibi", category: "Urdu", isbn: "978-9693512345", totalCopies: 5, availableCopies: 3, shelf: "D-01" },
  { id: "BK-005", title: "Pakistan Studies", author: "Iftikhar Ahmad", category: "Social Studies", isbn: "978-9695320112", totalCopies: 12, availableCopies: 10, shelf: "A-05" },
  { id: "BK-006", title: "Islamiat for Secondary", author: "Maulana Minhaj", category: "Islamiat", isbn: "978-9695320987", totalCopies: 8, availableCopies: 6, shelf: "E-02" },
  { id: "BK-007", title: "Computer Science Basics", author: "Sumita Arora", category: "Computer", isbn: "978-8174500123", totalCopies: 6, availableCopies: 2, shelf: "F-10" },
  { id: "BK-008", title: "Chemistry: The Central Science", author: "Brown & LeMay", category: "Science", isbn: "978-0134414232", totalCopies: 5, availableCopies: 4, shelf: "C-15" },
];

export const BOOK_ISSUES: BookIssue[] = [
  { id: "IS-001", bookId: "BK-001", bookTitle: "Mathematics for Class 9", studentId: "SCH-2026-0001", studentName: "Ahmed Khan", class: "Playgroup", issueDate: "2026-06-15", dueDate: "2026-06-29", fine: 0, status: "Issued" },
  { id: "IS-002", bookId: "BK-007", bookTitle: "Computer Science Basics", studentId: "SCH-2026-0005", studentName: "Maryam Sheikh", class: "Grade 1", issueDate: "2026-06-10", dueDate: "2026-06-24", fine: 50, status: "Overdue" },
  { id: "IS-003", bookId: "BK-003", bookTitle: "Physics Fundamentals", studentId: "SCH-2026-0014", studentName: "Omar Khan", class: "Grade 3", issueDate: "2026-06-20", dueDate: "2026-07-04", fine: 0, status: "Issued" },
  { id: "IS-004", bookId: "BK-002", bookTitle: "English Grammar in Use", studentId: "SCH-2026-0027", studentName: "Aisha Malik", class: "Grade 5", issueDate: "2026-06-05", dueDate: "2026-06-19", returnDate: "2026-06-18", fine: 0, status: "Returned" },
];

// ─────────────────────────────────────────────────────────────
// TRANSPORT DATA
// ─────────────────────────────────────────────────────────────
export interface BusRoute {
  id: string;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  occupied: number;
  stops: string[];
  morningTime: string;
  eveningTime: string;
}

export const BUS_ROUTES: BusRoute[] = [
  { id: "RT-A", routeName: "Route A — Gulshan", vehicleNo: "KHI-1234", driverName: "Mr. Salim Shah", driverPhone: "+92 313 4444444", capacity: 30, occupied: 24, stops: ["Gulshan Chowrangi", "NIPA", " Hassan Square", "University Road"], morningTime: "07:00 AM", eveningTime: "02:30 PM" },
  { id: "RT-B", routeName: "Route B — Malir", vehicleNo: "KHI-5678", driverName: "Mr. Akram Khan", driverPhone: "+92 312 3333333", capacity: 25, occupied: 18, stops: ["Malir Halt", "Jinnah Square", "Kalaboard", "Faisal Cantt"], morningTime: "06:45 AM", eveningTime: "02:30 PM" },
  { id: "RT-C", routeName: "Route C — Korangi", vehicleNo: "KHI-9012", driverName: "Mr. Yousuf", driverPhone: "+92 315 5555555", capacity: 28, occupied: 15, stops: ["Korangi 1½", "Nasir Jump", "Kalaboard", "Com311"], morningTime: "06:50 AM", eveningTime: "02:30 PM" },
  { id: "RT-D", routeName: "Route D — Nazimabad", vehicleNo: "KHI-3456", driverName: "Mr. Tanveer", driverPhone: "+92 318 6666666", capacity: 22, occupied: 20, stops: ["Nazimabad Block 4", "Liaquatabad", "Golimar", "Lasbela"], morningTime: "07:00 AM", eveningTime: "02:30 PM" },
  { id: "RT-E", routeName: "Route E — Saddar", vehicleNo: "KHI-7890", driverName: "Mr. Faisal", driverPhone: "+92 321 7777777", capacity: 20, occupied: 12, stops: ["Saddar", "Empress Market", "Preedy Street", "Regal"], morningTime: "07:15 AM", eveningTime: "02:45 PM" },
];

// ─────────────────────────────────────────────────────────────
// HOSTEL DATA
// ─────────────────────────────────────────────────────────────
export interface HostelRoom {
  id: string;
  roomNo: string;
  block: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: "Single" | "Double" | "Dormitory";
  monthlyRent: number;
}

export const HOSTEL_ROOMS: HostelRoom[] = [
  { id: "HR-001", roomNo: "A-101", block: "Block A (Boys)", floor: "Ground", capacity: 4, occupied: 3, type: "Dormitory", monthlyRent: 3500 },
  { id: "HR-002", roomNo: "A-102", block: "Block A (Boys)", floor: "Ground", capacity: 4, occupied: 4, type: "Dormitory", monthlyRent: 3500 },
  { id: "HR-003", roomNo: "A-201", block: "Block A (Boys)", floor: "First", capacity: 2, occupied: 1, type: "Double", monthlyRent: 5000 },
  { id: "HR-004", roomNo: "B-101", block: "Block B (Girls)", floor: "Ground", capacity: 4, occupied: 2, type: "Dormitory", monthlyRent: 3500 },
  { id: "HR-005", roomNo: "B-102", block: "Block B (Girls)", floor: "Ground", capacity: 4, occupied: 4, type: "Dormitory", monthlyRent: 3500 },
  { id: "HR-006", roomNo: "B-201", block: "Block B (Girls)", floor: "First", capacity: 1, occupied: 0, type: "Single", monthlyRent: 7000 },
];

// ─────────────────────────────────────────────────────────────
// INVENTORY DATA
// ─────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  location: string;
  condition: "Good" | "Needs Repair" | "Damaged";
  purchaseDate: string;
}

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: "INV-001", name: "Student Desks", category: "Furniture", quantity: 120, unit: "pcs", minStock: 100, location: "All Classrooms", condition: "Good", purchaseDate: "2023-08-15" },
  { id: "INV-002", name: "Whiteboards", category: "Furniture", quantity: 15, unit: "pcs", minStock: 13, location: "All Classrooms", condition: "Good", purchaseDate: "2023-08-15" },
  { id: "INV-003", name: "Computers (Lab)", category: "Electronics", quantity: 20, unit: "pcs", minStock: 15, location: "Computer Lab", condition: "Good", purchaseDate: "2024-01-10" },
  { id: "INV-004", name: "Projector", category: "Electronics", quantity: 3, unit: "pcs", minStock: 2, location: "AV Room", condition: "Needs Repair", purchaseDate: "2022-06-20" },
  { id: "INV-005", name: "Lab Microscopes", category: "Lab Equipment", quantity: 12, unit: "pcs", minStock: 10, location: "Science Lab", condition: "Good", purchaseDate: "2023-03-05" },
  { id: "INV-006", name: "Exam Paper (A4)", category: "Stationery", quantity: 45, unit: "reams", minStock: 20, location: "Store Room", condition: "Good", purchaseDate: "2026-06-01" },
  { id: "INV-007", name: "Chairs (Office)", category: "Furniture", quantity: 25, unit: "pcs", minStock: 20, location: "Admin Office", condition: "Good", purchaseDate: "2023-08-15" },
  { id: "INV-008", name: "AC Units", category: "Electronics", quantity: 8, unit: "pcs", minStock: 6, location: "Various", condition: "Needs Repair", purchaseDate: "2021-05-10" },
  { id: "INV-009", name: "First Aid Kits", category: "Medical", quantity: 5, unit: "kits", minStock: 3, location: "Medical Room", condition: "Good", purchaseDate: "2026-01-15" },
  { id: "INV-010", name: "Sports Equipment", category: "Sports", quantity: 1, unit: "set", minStock: 1, location: "Sports Room", condition: "Good", purchaseDate: "2024-09-01" },
];

// ─────────────────────────────────────────────────────────────
// EVENT CALENDAR DATA
// ─────────────────────────────────────────────────────────────
export interface SchoolEvent {
  id: string;
  title: string;
  type: "Exam" | "Holiday" | "PTM" | "Sports" | "Cultural" | "Meeting" | "Deadline";
  date: string;
  description: string;
  color: string;
}

export const SCHOOL_EVENTS: SchoolEvent[] = [
  { id: "EV-001", title: "Monthly Test - July", type: "Exam", date: "2026-07-15", description: "Monthly tests for all classes Grade 6-10", color: "bg-red-500" },
  { id: "EV-002", title: "Parent-Teacher Meeting", type: "PTM", date: "2026-07-20", description: "Quarterly PTM for all parents", color: "bg-primary" },
  { id: "EV-003", title: "Independence Day", type: "Holiday", date: "2026-08-14", description: "National holiday — school closed", color: "bg-emerald-500" },
  { id: "EV-004", title: "Sports Day", type: "Sports", date: "2026-08-25", description: "Annual sports day with track events", color: "bg-accent" },
  { id: "EV-005", title: "Fee Submission Deadline", type: "Deadline", date: "2026-07-10", description: "Last date to submit July fees", color: "bg-yellow-500" },
  { id: "EV-006", title: "Mid-Term Examinations", type: "Exam", date: "2026-09-10", description: "Mid-term exams for all classes", color: "bg-red-500" },
  { id: "EV-007", title: "Staff Meeting", type: "Meeting", date: "2026-07-05", description: "Monthly staff meeting at 2 PM", color: "bg-purple-500" },
  { id: "EV-008", title: "Annual Cultural Day", type: "Cultural", date: "2026-10-15", description: "Annual cultural show and performances", color: "bg-pink-500" },
  { id: "EV-009", title: "Eid-ul-Adha Holiday", type: "Holiday", date: "2026-07-18", description: "Eid holidays — school closed for 3 days", color: "bg-emerald-500" },
  { id: "EV-010", title: "Final Examinations", type: "Exam", date: "2026-12-01", description: "Final exams for all classes", color: "bg-red-500" },
];
