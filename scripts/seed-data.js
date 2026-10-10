// ═══════════════════════════════════════════════════════════════
// SEED SCRIPT — Populate JSON database with test data
// 20 students, 5 classes, 5 teachers, 5 subjects
// Run: node scripts/seed-data.js
// ═══════════════════════════════════════════════════════════════

const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(process.cwd(), "school-data.json");

// ─── 5 Classes ───
const classes = [
  { name: "Grade 6", sections: ["A", "B"], monthlyFee: 2000, classTeacher: null },
  { name: "Grade 7", sections: ["A", "B"], monthlyFee: 2500, classTeacher: null },
  { name: "Grade 8", sections: ["A", "B"], monthlyFee: 3000, classTeacher: null },
  { name: "Grade 9", sections: ["A", "B"], monthlyFee: 3500, classTeacher: null },
  { name: "Grade 10", sections: ["A", "B"], monthlyFee: 4000, classTeacher: null },
];

// ─── 5 Subjects ───
const subjects = ["Mathematics", "English", "Urdu", "Islamiat", "Science"];

// ─── 5 Teachers ───
const teachers = [
  { id: "T-1001", name: "Mr. Ahmed Raza", cnic: "42101-1234567-1", designation: "Senior Teacher", qualification: "M.Sc Mathematics, B.Ed", subjects: ["Mathematics", "Science"], classes: ["Grade 6", "Grade 7", "Grade 8"], monthlySalary: 45000, joiningDate: "2023-03-15", phone: "0300-1234567", gender: "Male", attendance: { present: 20, late: 1, halfDay: 0, absent: 0, leave: 1 } },
  { id: "T-1002", name: "Mrs. Fatima Khan", cnic: "42101-2345678-2", designation: "English Teacher", qualification: "M.A English, B.Ed", subjects: ["English"], classes: ["Grade 9", "Grade 10"], monthlySalary: 42000, joiningDate: "2023-08-01", phone: "0333-2345678", gender: "Female", attendance: { present: 19, late: 2, halfDay: 0, absent: 1, leave: 0 } },
  { id: "T-1003", name: "Mr. Bilal Ahmed", cnic: "42101-3456789-3", designation: "Science Teacher", qualification: "M.Sc Physics, B.Ed", subjects: ["Science"], classes: ["Grade 6", "Grade 7", "Grade 8", "Grade 9"], monthlySalary: 40000, joiningDate: "2024-01-10", phone: "0345-3456789", gender: "Male", attendance: { present: 21, late: 0, halfDay: 1, absent: 0, leave: 0 } },
  { id: "T-1004", name: "Miss Ayesha Siddiqui", cnic: "42101-4567890-4", designation: "Urdu Teacher", qualification: "M.A Urdu, B.Ed", subjects: ["Urdu", "Islamiat"], classes: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"], monthlySalary: 38000, joiningDate: "2024-09-05", phone: "0321-4567890", gender: "Female", attendance: { present: 18, late: 1, halfDay: 0, absent: 2, leave: 1 } },
  { id: "T-1005", name: "Mr. Usman Ali", cnic: "42101-5678901-5", designation: "Islamiat Teacher", qualification: "M.A Islamic Studies, B.Ed", subjects: ["Islamiat"], classes: ["Grade 9", "Grade 10"], monthlySalary: 36000, joiningDate: "2025-02-20", phone: "0301-5678901", gender: "Male", attendance: { present: 20, late: 0, halfDay: 0, absent: 0, leave: 2 } },
];

// ─── 20 Students ───
const studentData = [
  { name: "Abdullah Khan", fatherName: "Imran Khan", fatherPhone: "0301-1111111", fatherCnic: "42101-1111111-1", fatherOccupation: "Engineer", motherName: "Sana Khan", motherPhone: "0333-1111111", dob: "2013-05-15", cnic: "42101-1111112-1", bloodGroup: "B+", class: "Grade 6", section: "A", gender: "Male" },
  { name: "Ayesha Ahmed", fatherName: "Rashid Ahmed", fatherPhone: "0302-2222222", fatherCnic: "42101-2222222-2", fatherOccupation: "Doctor", motherName: "Nadia Ahmed", motherPhone: "0334-2222222", dob: "2013-08-22", cnic: "42101-2222223-2", bloodGroup: "O+", class: "Grade 6", section: "A", gender: "Female" },
  { name: "Bilal Hussain", fatherName: "Tariq Hussain", fatherPhone: "0303-3333333", fatherCnic: "42101-3333333-3", fatherOccupation: "Businessman", motherName: "Hina Hussain", motherPhone: "0335-3333333", dob: "2013-03-10", cnic: "42101-3333334-3", bloodGroup: "A+", class: "Grade 6", section: "B", gender: "Male" },
  { name: "Fatima Zahra", fatherName: "Mohammad Ali", fatherPhone: "0304-4444444", fatherCnic: "42101-4444444-4", fatherOccupation: "Teacher", motherName: "Zainab Ali", motherPhone: "0336-4444444", dob: "2013-11-05", cnic: "42101-4444445-4", bloodGroup: "AB+", class: "Grade 6", section: "B", gender: "Female" },
  { name: "Hamza Sheikh", fatherName: "Kamran Sheikh", fatherPhone: "0305-5555555", fatherCnic: "42101-5555555-5", fatherOccupation: "Accountant", motherName: "Sadia Sheikh", motherPhone: "0337-5555555", dob: "2012-07-18", cnic: "42101-5555556-5", bloodGroup: "B-", class: "Grade 7", section: "A", gender: "Male" },
  { name: "Zainab Malik", fatherName: "Faisal Malik", fatherPhone: "0306-6666666", fatherCnic: "42101-6666666-6", fatherOccupation: "Banker", motherName: "Ayesha Malik", motherPhone: "0338-6666666", dob: "2012-09-25", cnic: "42101-6666667-6", bloodGroup: "O-", class: "Grade 7", section: "A", gender: "Female" },
  { name: "Ali Raza", fatherName: "Shahid Raza", fatherPhone: "0307-7777777", fatherCnic: "42101-7777777-7", fatherOccupation: "Engineer", motherName: "Maria Raza", motherPhone: "0339-7777777", dob: "2012-12-30", cnic: "42101-7777778-7", bloodGroup: "A-", class: "Grade 7", section: "B", gender: "Male" },
  { name: "Maryam Qureshi", fatherName: "Asad Qureshi", fatherPhone: "0308-8888888", fatherCnic: "42101-8888888-8", fatherOccupation: "Lawyer", motherName: "Hira Qureshi", motherPhone: "0340-8888888", dob: "2012-04-12", cnic: "42101-8888889-8", bloodGroup: "AB-", class: "Grade 7", section: "B", gender: "Female" },
  { name: "Hassan Abbasi", fatherName: "Naveed Abbasi", fatherPhone: "0309-9999999", fatherCnic: "42101-9999999-9", fatherOccupation: "Pharmacist", motherName: "Samina Abbasi", motherPhone: "0341-9999999", dob: "2011-06-08", cnic: "42101-9999990-9", bloodGroup: "O+", class: "Grade 8", section: "A", gender: "Male" },
  { name: "Khadija Noor", fatherName: "Imtiaz Noor", fatherPhone: "0311-1010101", fatherCnic: "42101-1010101-1", fatherOccupation: "Architect", motherName: "Farah Noor", motherPhone: "0342-1010101", dob: "2011-10-15", cnic: "42101-1010102-1", bloodGroup: "B+", class: "Grade 8", section: "A", gender: "Female" },
  { name: "Omar Farooq", fatherName: "Saleem Farooq", fatherPhone: "0312-1212121", fatherCnic: "42101-1212121-2", fatherOccupation: "Journalist", motherName: "Rabia Farooq", motherPhone: "0343-1212121", dob: "2011-02-28", cnic: "42101-1212122-2", bloodGroup: "A+", class: "Grade 8", section: "B", gender: "Male" },
  { name: "Sara Khan", fatherName: "Waseem Khan", fatherPhone: "0313-1313131", fatherCnic: "42101-1313131-3", fatherOccupation: "Pilot", motherName: "Amna Khan", motherPhone: "0344-1313131", dob: "2011-07-19", cnic: "42101-1313132-3", bloodGroup: "B+", class: "Grade 8", section: "B", gender: "Female" },
  { name: "Ibrahim Sheikh", fatherName: "Junaid Sheikh", fatherPhone: "0314-1414141", fatherCnic: "42101-1414141-4", fatherOccupation: "Doctor", motherName: "Saima Sheikh", motherPhone: "0345-1414141", dob: "2010-05-22", cnic: "42101-1414142-4", bloodGroup: "O+", class: "Grade 9", section: "A", gender: "Male" },
  { name: "Hooria Ahmed", fatherName: "Nadeem Ahmed", fatherPhone: "0315-1515151", fatherCnic: "42101-1515151-5", fatherOccupation: "Engineer", motherName: "Mahnoor Ahmed", motherPhone: "0346-1515151", dob: "2010-09-14", cnic: "42101-1515152-5", bloodGroup: "AB+", class: "Grade 9", section: "A", gender: "Female" },
  { name: "Daniyal Riaz", fatherName: "Adnan Riaz", fatherPhone: "0316-1616161", fatherCnic: "42101-1616161-6", fatherOccupation: "Businessman", motherName: "Sidra Riaz", motherPhone: "0347-1616161", dob: "2010-01-30", cnic: "42101-1616162-6", bloodGroup: "A-", class: "Grade 9", section: "B", gender: "Male" },
  { name: "Anya Fatima", fatherName: "Saad Fatima", fatherPhone: "0317-1717171", fatherCnic: "42101-1717171-7", fatherOccupation: "Software Developer", motherName: "Nimra Fatima", motherPhone: "0348-1717171", dob: "2010-11-11", cnic: "42101-1717172-7", bloodGroup: "B-", class: "Grade 9", section: "B", gender: "Female" },
  { name: "Muhammad Ali", fatherName: "Kashif Ali", fatherPhone: "0318-1818181", fatherCnic: "42101-1818181-8", fatherOccupation: "Professor", motherName: "Sana Ali", motherPhone: "0349-1818181", dob: "2009-08-03", cnic: "42101-1818182-8", bloodGroup: "O-", class: "Grade 10", section: "A", gender: "Male" },
  { name: "Aisha Siddiqui", fatherName: "Bilal Siddiqui", fatherPhone: "0319-1919191", fatherCnic: "42101-1919191-9", fatherOccupation: "Bank Manager", motherName: "Maryam Siddiqui", motherPhone: "0350-1919191", dob: "2009-03-17", cnic: "42101-1919192-9", bloodGroup: "AB-", class: "Grade 10", section: "A", gender: "Female" },
  { name: "Ahmed Hassan", fatherName: "Fahad Hassan", fatherPhone: "0320-2020202", fatherCnic: "42101-2020202-1", fatherOccupation: "Civil Engineer", motherName: "Ayesha Hassan", motherPhone: "0351-2020202", dob: "2009-06-25", cnic: "42101-2020203-1", bloodGroup: "A+", class: "Grade 10", section: "B", gender: "Male" },
  { name: "Zara Khan", fatherName: "Omar Khan", fatherPhone: "0321-2121212", fatherCnic: "42101-2121212-2", fatherOccupation: "Army Officer", motherName: "Fatima Khan", motherPhone: "0352-2121212", dob: "2009-12-08", cnic: "42101-2121213-2", bloodGroup: "B+", class: "Grade 10", section: "B", gender: "Female" },
];

// Build full student objects
const students = studentData.map((s, i) => {
  const cls = classes.find(c => c.name === s.class);
  const monthlyFee = cls ? cls.monthlyFee : 2000;
  return {
    id: `SCH-2026-${String(i + 1).padStart(4, "0")}`,
    rollNo: String(i + 1).padStart(2, "0"),
    name: s.name,
    class: s.class,
    section: s.section,
    gender: s.gender,
    dob: s.dob,
    cnic: s.cnic,
    bloodGroup: s.bloodGroup,
    religion: "Islam",
    nationality: "Pakistani",
    address: "House #, Street, Block, Karachi",
    fatherName: s.fatherName,
    fatherCnic: s.fatherCnic,
    fatherPhone: s.fatherPhone,
    fatherOccupation: s.fatherOccupation,
    motherName: s.motherName,
    motherPhone: s.motherPhone,
    motherOccupation: "Housewife",
    guardianName: s.fatherName,
    guardianPhone: s.fatherPhone,
    guardianRelation: "Father",
    primaryContact: "father",
    emergencyContact: s.fatherPhone,
    emergencyName: s.fatherName,
    medicalConditions: "None",
    allergies: "None",
    previousSchool: "—",
    admissionDate: "2026-04-01",
    monthlyFee,
    status: "Active",
    attendancePct: 100,
    feePaidThisMonth: false,
    isHosteller: false,
    transport: false,
    siblings: "",
    photo: undefined,
    outstandingAmount: 0,
  };
});

// ─── Fee structure ───
const feeStructure = {
  classFees: Object.fromEntries(classes.map(c => [c.name, c.monthlyFee])),
  hostelFee: 5000,
  admissionMultiplier: 3,
  lateFee: 500,
  dueDate: 10,
};

// ─── School info ───
const school = {
  name: "Greenwood Public School",
  tagline: "Knowledge • Character • Excellence",
  address: "123 Main Boulevard, Gulshan-e-Iqbal, Karachi",
  phone: "021-1234567",
  email: "info@greenwood.edu.pk",
  logo: null,
  session: "2026-2027",
};

// ─── Enabled modules ───
const enabledModules = {
  dashboard: true, students: true, teachers: true, staff: true,
  classes: true, timetable: true, attendance: true, salary: true,
  fees: true, defaulters: true, results: true, certificates: true,
  reports: true, analytics: true, users: true, settings: true,
  ledger: true, exam: true, library: true, transport: true,
  hostel: true, inventory: true, events: true, discipline: true,
  alumni: true, parent: true, sms: true, leave: true, concession: true, ai: true,
};

// ─── State object ───
const state = {
  students,
  teachers,
  staff: [],
  feeCollections: [],
  activities: [],
  documents: [],
  commLogs: [],
  transactions: [],
  classes,
  subjects,
  moduleData: {},
  attendanceRecords: [],
  school,
  feeStructure,
  enabledModules,
};

// ─── Write to JSON database file ───
fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf-8");

// ─── Report ───
const stats = fs.statSync(DB_PATH);
console.log("╔══════════════════════════════════════════════╗");
console.log("║  SEED DATA INSERTED INTO JSON DB            ║");
console.log("╠══════════════════════════════════════════════╣");
console.log(`║  Students:  ${String(students.length).padEnd(4)}                          ║`);
console.log(`║  Teachers:  ${String(teachers.length).padEnd(4)}                          ║`);
console.log(`║  Classes:   ${String(classes.length).padEnd(4)}                          ║`);
console.log(`║  Subjects:  ${String(subjects.length).padEnd(4)}                          ║`);
console.log(`║  File size: ${String((stats.size / 1024).toFixed(1) + "KB").padEnd(6)}                     ║`);
console.log("║  Database:  school-data.json                ║");
console.log("╚══════════════════════════════════════════════╝");
console.log("\nTo load this data in the app:");
console.log("  1. The app calls loadFromDatabase() on startup");
console.log("  2. This fetches GET /api/state which reads from the JSON file");
console.log("  3. The store updates with the seeded data");
console.log("  4. The auto-sync then keeps the JSON file updated on changes");
console.log("\n⚠️  IMPORTANT: Reload the browser tab to trigger loadFromDatabase()");
