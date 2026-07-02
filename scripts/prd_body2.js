// Body content — Functional Modules part 1 (sections 7–13)
const { Paragraph, TextRun, AlignmentType } = require("docx");
const {
  h1, h2, h3, p, bullet, numItem, mixedP, makeTable, tableCaption,
} = require("./prd_helpers.js");

// SECTION 7: Functional Modules — Overview
function sectionModulesOverview() {
  return [
    h1("5. Functional Modules — Overview"),
    p("The School Management System comprises sixteen functional modules, each addressing a distinct operational area of the school. The modules are designed to be independently usable — a school can begin by using only Fee Management and Attendance, then expand into Salary, Results, and Certificates as confidence grows. However, the modules are deeply integrated where it matters: attendance feeds the salary fine calculation, fee collection updates the defaulter list in real time, and the timetable drives conflict checks during teacher and class assignment."),
    p("The table below lists all sixteen modules with their primary user role and the key outcome each module delivers. Detailed specifications for each module follow in the subsequent sections."),
    tableCaption("Table 4: Module Summary"),
    makeTable(
      ["#", "Module", "Primary User", "Key Outcome"],
      [
        ["1", "Dashboard", "Admin", "One-screen view of school health"],
        ["2", "Student Management", "Admin", "Complete student lifecycle in one record"],
        ["3", "Teacher Management", "Admin", "Teacher profiles with subject & class assignment"],
        ["4", "Staff Management", "Admin", "Non-teaching staff records & salary"],
        ["5", "Class Management", "Admin", "Classes, sections, subjects, class teachers"],
        ["6", "Timetable", "Admin", "Weekly class & teacher timetables, conflict-free"],
        ["7", "Attendance", "Teacher / Admin", "Daily attendance for students, teachers, staff"],
        ["8", "Salary & Fine", "Accountant", "Auto salary with attendance-based deductions"],
        ["9", "Fee Management", "Accountant", "Fast fee collection with printable receipts"],
        ["10", "Fee Defaulter", "Accountant", "One-click defaulter list by class/month"],
        ["11", "Examination & Results", "Teacher / Admin", "Marks entry and printable result cards"],
        ["12", "Certificates", "Admin", "Bonafide, leaving, character, fee-paid certificates"],
        ["13", "Reports", "All roles", "Ten printable report types with filters"],
        ["14", "Analytics", "Admin", "Seven charts for trend and decision support"],
        ["15", "User Management", "Admin", "Role-based accounts and permissions"],
        ["16", "Settings", "Admin", "School info, fine rules, backup, theme"],
      ],
      [6, 28, 22, 44]
    ),
  ];
}

// SECTION 8: Module 1 — Dashboard
function moduleDashboard() {
  return [
    h1("6. Module 1: Dashboard"),
    p("The Dashboard is the first screen every user sees after login. It provides a single-screen snapshot of the school's current operational state, with eight key performance indicator tiles at the top, a recent activities feed in the middle, and a row of quick action buttons at the bottom. The dashboard contents are role-aware: an Admin sees all eight KPIs, an Accountant sees a finance-focused subset (Today's Fee Collection, Monthly Income, Pending Fees, Fee Defaulters), and a Teacher sees only the tiles relevant to their classes (Today's Attendance for assigned classes, upcoming exams)."),
    h2("6.1 KPI Tiles"),
    p("The eight KPI tiles, displayed as a responsive grid of cards at the top of the dashboard, are:"),
    bullet("Total Students — count of all active students enrolled in the current academic session, with a small delta indicator showing net change (admissions minus leaves) versus last month."),
    bullet("Total Teachers — count of all active teaching staff."),
    bullet("Total Staff — count of all active non-teaching staff (admin, accounts, security, janitor, driver, etc.)."),
    bullet("Today's Attendance — percentage of students marked present today, with the count shown as \"present / total\". Updates live as teachers mark attendance."),
    bullet("Today's Fee Collection — sum of all fee payments received today, in the school's configured currency, with a count of receipts issued."),
    bullet("Monthly Income — sum of all income (fees + other charges) collected in the current calendar month, with a comparison to last month's total."),
    bullet("Pending Fees — total outstanding fee amount across all students for the current month, with the count of students who have not yet paid."),
    bullet("Fee Defaulters — count of students whose fee for the previous month remains unpaid past the configured due date, with a quick-link button to open the defaulter list."),
    h2("6.2 Recent Activities Feed"),
    p("Below the KPI tiles, a scrollable feed shows the most recent twenty activities in the system, newest first. Each entry includes a timestamp, the acting user's name, the action type (Fee Collected, Student Admitted, Attendance Marked, Salary Slip Generated, etc.), and a one-line description. The feed provides an audit trail of the day's activity and helps the Admin spot any unusual actions at a glance. The activity log is persisted in the database and is also available as a filterable report in the Reports module."),
    h2("6.3 Quick Action Buttons"),
    p("A row of large, clearly-labeled buttons at the bottom of the dashboard provides one-click access to the most common daily operations. The button set is role-aware: the Admin and Accountant see Collect Fee, Mark Attendance, Add Student, and Print Receipt; the Teacher sees Mark Attendance, Enter Marks, and Print Result Card. Each button navigates directly to the corresponding module with sensible defaults pre-filled (for example, Collect Fee opens with today's date and the cursor focused on the student search field)."),
    h2("6.4 Data Sources & Refresh"),
    p("All KPI tiles pull their data from a single dashboard_summary Tauri command that runs five lightweight SQL aggregate queries against the SQLite database. The command executes in under one hundred milliseconds for a school of up to one thousand students. The dashboard auto-refreshes every sixty seconds when the window is focused, and a manual refresh button is available in the top-right corner. To avoid unnecessary re-renders, the Zustand store uses a shallow equality check on the summary object, so unchanged KPIs do not trigger tile re-renders."),
  ];
}

// SECTION 9: Module 2 — Student Management
function moduleStudents() {
  return [
    h1("7. Module 2: Student Management"),
    p("The Student Management module is the canonical source of truth for every student in the school. It covers the complete student lifecycle from admission through promotion to leaving, and stores all personal, academic, and parent information in a single normalized record. Every other module — attendance, fees, results, certificates — references the student record by its system-generated student ID, so data integrity is enforced at the database level through foreign key constraints."),
    h2("7.1 Admission Form"),
    p("New students are added through a multi-section admission form. The form is organized into five collapsible sections to avoid overwhelming the user: Personal Information, Parent/Guardian Details, Previous Education, Class Assignment, and Photo & Documents. All fields use React Hook Form for state management and Zod for validation, so required fields are clearly marked and validation errors appear inline below each field. The form supports draft saving, so an Admin can begin an admission, attend to a parent at the counter, and return to complete it later."),
    h3("7.1.1 Personal Information Fields"),
    bullet("First Name, Last Name (required)"),
    bullet("Date of Birth (required, with age auto-calculated)"),
    bullet("Gender (Male / Female / Other)"),
    bullet("Blood Group (optional, for emergency use)"),
    bullet("Religion, Nationality, CNIC/B-Form Number (required for Pakistan region)"),
    bullet("Address (street, city, province, postal code)"),
    bullet("Student Phone (optional, for senior students)"),
    bullet("Student Email (optional)"),
    h3("7.1.2 Parent/Guardian Details"),
    bullet("Father's Name, Father's CNIC, Father's Phone (required), Father's Occupation"),
    bullet("Mother's Name, Mother's CNIC, Mother's Phone, Mother's Occupation"),
    bullet("Guardian Name, Guardian Phone, Guardian CNIC, Relationship to Student (used if parents are deceased or unavailable)"),
    bullet("Primary Contact — radio selection among Father / Mother / Guardian, used for all SMS and printed communications (field reserved for future SMS gateway integration)"),
    h3("7.1.3 Class Assignment"),
    bullet("Class (e.g., Grade 5), Section (e.g., A), Roll Number (auto-assigned within section, configurable to manual)"),
    bullet("Admission Date (defaults to today)"),
    bullet("Admission Fee Amount (auto-filled from class fee structure, editable)"),
    bullet("Student ID — system-generated, format configurable in Settings (default: SCH-YYYY-NNNN, e.g., SCH-2026-0001)"),
    h2("7.2 Student Profile View"),
    p("Clicking any student in the list opens a tabbed profile view. The first tab shows the personal and parent information; the second tab shows the student's current class, section, roll number, and subject list; the third tab shows fee history (a chronological list of all payments with receipt numbers and amounts); the fourth tab shows attendance summary for the current and previous months; the fifth tab shows examination history with marks and grades per subject; and the sixth tab shows issued certificates. The profile view is the launch point for all student-related actions: collect fee, mark attendance, print ID card, issue certificate, promote, or leave."),
    h2("7.3 Student Promotion"),
    p("At the end of each academic session, the Admin performs a bulk promotion of all eligible students to the next class. The promotion screen lists all students in the current session grouped by class, with checkboxes for selection. The Admin selects the destination class for each group (typically Grade 5 → Grade 6), reviews the preview, and confirms. Promotion creates new enrollment records for the next session while preserving the historical records in the current session. Students who failed or are repeating the year can be excluded from the bulk promotion and promoted individually."),
    h2("7.4 Student Transfer & Leaving"),
    p("When a student leaves the school — whether transferring to another school or simply discontinuing — the Admin marks the student as Left through the profile view. This action requires a leaving date, a leaving reason (Transfer / Completed / Withdrawal / Expelled), and optionally generates a School Leaving Certificate (printable from the Certificates module). Marking a student as Left excludes them from attendance marking, fee collection, and defaulter lists going forward, but all historical records are preserved. The student record is never deleted; it is only flagged as inactive, ensuring referential integrity for past payments and results."),
    h2("7.5 Search & Filter"),
    p("The student list supports a global search box (searches across name, student ID, roll number, father's name, and phone) and a set of filters (class, section, status Active/Left, admission date range). The list uses TanStack Table with virtualized rows for smooth scrolling through thousands of students. Columns are configurable — the user can hide, show, and reorder columns — and the configuration is persisted in the local settings table so it survives app restarts."),
    h2("7.6 Student ID Card with QR Code"),
    p("Each student's profile view includes a Print ID Card button that generates a printable student ID card. The card layout is configurable in Settings (single-sided or double-sided, photo position, fields shown) and includes a QR code encoding the student ID. The QR code can be scanned at the fee counter or attendance kiosk (future feature) to instantly pull up the student's record. The card is rendered as a PDF sized to standard ID card dimensions (CR80, 85.6 × 54 mm), printable on a standard ID card printer or on A4 sheets with cut marks for manual cutting."),
  ];
}

// SECTION 10: Module 3 — Teacher Management
function moduleTeachers() {
  return [
    h1("8. Module 3: Teacher Management"),
    p("The Teacher Management module stores records for all teaching staff, manages their subject and class assignments, and links to the attendance and salary modules. A teacher record is the foundation for timetable generation (the system needs to know which subjects a teacher can teach), attendance marking (teachers mark attendance for their assigned classes), and salary processing (each teacher has a monthly salary and is subject to attendance-based fine deductions)."),
    h2("8.1 Add/Edit Teacher"),
    p("The teacher form captures personal information (name, CNIC, date of birth, gender, contact, address), professional information (qualification, years of experience, joining date, employment type: Full-time / Part-time / Visiting), and salary information (monthly salary, allowances, bank account number for payment). The form validates that the CNIC is unique across all teachers and staff, and that the joining date is not in the future. Employment type affects salary calculation: part-time teachers are paid a prorated monthly amount based on the number of classes taught, while full-time teachers receive the fixed monthly salary subject to attendance deductions."),
    h2("8.2 Subject & Class Assignment"),
    p("Each teacher is assigned one or more subjects and one or more class-sections. The assignment screen presents a matrix of classes (rows) and subjects (columns), with checkboxes at intersections; the Admin checks the cells where the teacher teaches that subject to that class. This assignment drives three downstream behaviors: the timetable generator uses it to know which teacher can fill each slot, the attendance module shows the teacher only their assigned classes, and the results module allows the teacher to enter marks only for their assigned subjects in their assigned classes. Assignments can be edited at any time during the session without affecting historical data."),
    h2("8.3 Teacher Profile View"),
    p("The teacher profile view is tabbed similarly to the student profile. The first tab shows personal and professional information; the second tab shows the current subject and class assignments in the matrix view; the third tab shows the teacher's personal weekly timetable (auto-generated from the Timetable module); the fourth tab shows attendance summary for the current and previous months; and the fifth tab shows salary history with month-by-month slips. The profile view is the launch point for printing a salary slip, editing assignments, or deactivating the teacher."),
    h2("8.4 Teacher Deactivation"),
    p("When a teacher leaves the school, the Admin marks them as Inactive with a leaving date and reason. Inactive teachers are excluded from timetable generation, attendance marking, and salary processing going forward, but their historical records (past attendance, past salary slips, past classes taught) are preserved. The system never deletes a teacher record, ensuring referential integrity for past salary payments and result entries."),
  ];
}

// SECTION 11: Module 4 — Staff Management
function moduleStaff() {
  return [
    h1("9. Module 4: Staff Management"),
    p("The Staff Management module handles all non-teaching employees of the school: administrative staff, accounts staff, librarians, lab assistants, IT staff, security guards, janitors, drivers, and any other support role. The module mirrors the Teacher Management module in structure — same personal information fields, same attendance tracking, same salary processing with attendance-based deductions — but excludes subject and class assignment since staff do not teach."),
    h2("9.1 Add/Edit Staff"),
    p("The staff form captures personal information (name, CNIC, date of birth, gender, contact, address), employment information (department, designation, joining date, employment type: Full-time / Part-time / Contract), and salary information (monthly salary, allowances, bank account number). The department is a free-text field with autocomplete from previously entered departments, so common values (Administration, Accounts, Security, Housekeeping, Transport) become quick-pick options over time."),
    h2("9.2 Staff Profile View"),
    p("The staff profile view has four tabs: personal information, attendance summary (current and previous months with present/absent/late counts), salary history (month-by-month slips with the breakdown of earnings, deductions, and net pay), and documents (a future feature placeholder for uploading scanned appointment letters and CNIC copies; v1.0 leaves this tab as a placeholder with a \"coming soon\" message)."),
    h2("9.3 Department List"),
    p("A side panel lists all departments with staff counts, allowing the Admin to quickly filter the staff list by department. This is useful during salary processing — the Accountant can pull up all Security staff at once to verify their attendance before processing payroll."),
  ];
}

// SECTION 12: Module 5 — Class Management
function moduleClasses() {
  return [
    h1("10. Module 5: Class Management"),
    p("The Class Management module defines the academic structure of the school: which classes exist, how each class is divided into sections, which subjects are taught in each class, and which teacher is the class teacher for each section. This structure underpins almost every other module — student enrollment, timetable generation, attendance marking, fee structure definition, and result entry all reference classes and sections."),
    h2("10.1 Classes & Sections"),
    p("A class represents an academic grade (e.g., Grade 1, Grade 2, ... Grade 10, Grade 11, Grade 12). Each class can have one or more sections (typically A, B, C, depending on student count). The class creation form captures the class name, the order in the academic ladder (used for promotion), and the default monthly fee for the class (editable per-student during admission). Sections are created within a class and capture the section name and the maximum student capacity (used to warn when a section is full during student assignment)."),
    h2("10.2 Subjects per Class"),
    p("Each class has a defined set of subjects. The subject assignment screen for a class lists all available subjects (defined once in Settings) with checkboxes; the Admin checks the subjects taught in that class. Each subject-class combination can have a default full marks and pass marks value (e.g., 100/33 for core subjects, 50/20 for supplementary subjects), which is used during marks entry and result generation."),
    h2("10.3 Class Teacher Assignment"),
    p("Each section has one assigned class teacher who is responsible for daily attendance marking and is the primary point of contact for parents of students in that section. The assignment screen presents a dropdown of available teachers for each section; only teachers not already assigned as class teacher to another section in the same academic session are shown. The class teacher assignment can be changed mid-session if needed, with the change taking effect immediately for attendance marking (the new teacher sees the section in their list the next time they open the Attendance module)."),
    h2("10.4 Student Roster per Class-Section"),
    p("Clicking a class-section in the list opens the student roster — a sortable, searchable table of all students currently enrolled in that section. The roster shows roll number, name, parent contact, and a quick-action menu (view profile, collect fee, mark attendance, print ID card). The roster is the daily working view for class teachers and is the default screen when a Teacher logs in and selects their class."),
  ];
}

// SECTION 13: Module 6 — Timetable
function moduleTimetable() {
  return [
    h1("11. Module 6: Timetable"),
    p("The Timetable module generates and manages the weekly class timetable, assigning a subject, teacher, and classroom to each period in each day for each class-section. The module includes a conflict detection engine that prevents double-booking a teacher or a classroom, and provides both class-wise and teacher-wise timetable views that are printable. This module is new in the v1.0 scope — added based on user feedback that schools currently maintain timetables on paper or in Excel, leading to frequent conflicts when a teacher is reassigned."),
    h2("11.1 Period & Day Structure"),
    p("Before creating timetables, the Admin defines the period structure in Settings: how many periods per day (typically 8 for primary, 7 for secondary), the start and end time of each period, the break times (morning break, lunch break), and the working days (Monday to Saturday, with Friday having a shorter schedule for prayers in the Pakistan region). This period structure is shared across all classes; individual timetables reference it."),
    h2("11.2 Timetable Grid"),
    p("The timetable editor presents a grid with days as rows and periods as columns for a selected class-section. Each cell in the grid is a dropdown that, when clicked, shows all available (subject, teacher, room) combinations for that period. A combination is available if: the subject is taught in that class, the teacher is assigned to teach that subject to that class, the teacher is not already assigned to another class in that period, and the selected room is not already occupied. The dropdown filters out unavailable combinations, so the Admin can only select conflict-free slots."),
    h2("11.3 Conflict Detection"),
    p("The conflict detection engine runs both interactively (when the Admin selects a combination in a cell, the engine immediately checks for conflicts and shows a red border with a tooltip if any are found) and on save (a final validation pass rejects the save with a clear error message listing all conflicts). The three conflict types checked are: teacher double-booking (same teacher assigned to two classes in the same period), room clash (same room assigned to two classes in the same period), and subject overload (a subject assigned more periods in a week than its configured weekly quota)."),
    h2("11.4 Data Model"),
    p("The timetable is stored in a single timetable_slots table with columns: class_section_id, day_of_week, period_number, subject_id, teacher_id, room, and an optional note (e.g., \"Lab session\"). Each row represents one slot in one class-section's weekly timetable. A composite unique index on (class_section_id, day_of_week, period_number) ensures one entry per slot, and the application-level conflict detection adds the teacher and room uniqueness constraints."),
    tableCaption("Table 5: Timetable Slot Fields"),
    makeTable(
      ["Field", "Type", "Description"],
      [
        ["class_section_id", "integer (FK)", "Which class-section this slot belongs to"],
        ["day_of_week", "integer (1–7)", "Monday = 1, Sunday = 7"],
        ["period_number", "integer (1–8)", "Period index within the day"],
        ["subject_id", "integer (FK)", "Subject being taught in this slot"],
        ["teacher_id", "integer (FK, nullable)", "Teacher assigned; nullable for free periods"],
        ["room", "text (nullable)", "Classroom or lab location"],
        ["note", "text (nullable)", "Optional free-text note"],
      ],
      [24, 22, 54]
    ),
    h2("11.5 Teacher Timetable View"),
    p("In addition to the class-wise timetable, the module provides a teacher-wise view: selecting a teacher shows their personal weekly schedule, with each cell showing the class-section and subject they teach in that period. This view is what a Teacher sees when they open the Timetable module — they see only their own schedule, with no edit rights. The teacher timetable is also printable, useful for handing out at the start of the session."),
    h2("11.6 Print Timetable"),
    p("Both the class timetable and the teacher timetable can be printed as PDF. The printed layout includes the school name and logo (from Settings), the class or teacher name as the title, the period times as column headers, the days as row headers, and the subject-teacher-room combination in each cell. The PDF is sized to A4 landscape for readability and uses a clean grid layout with the school's accent color for headers."),
  ];
}

module.exports = {
  sectionModulesOverview,
  moduleDashboard,
  moduleStudents,
  moduleTeachers,
  moduleStaff,
  moduleClasses,
  moduleTimetable,
};
