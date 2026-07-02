// Body content — Functional Modules part 3 + final sections (sections 20–29)
const { Paragraph, TextRun, AlignmentType } = require("docx");
const {
  h1, h2, h3, p, bullet, numItem, mixedP, makeTable, tableCaption,
} = require("./prd_helpers.js");

// SECTION 20: Module 13 — Reports
function moduleReports() {
  return [
    h1("18. Module 13: Reports"),
    p("The Reports module consolidates ten printable report types covering every operational area of the school. Each report has a filter screen (date range, class, status, etc.), a preview pane, and three output options: print directly, export to PDF, or export to Excel. All reports use the school's letterhead and accent color for consistency. The reports are designed to be self-explanatory — a person reading the report without prior context should understand what it shows and what action it implies."),
    tableCaption("Table 8: Report Catalog"),
    makeTable(
      ["#", "Report Name", "Filters", "Output"],
      [
        ["1", "Student Report", "Class, section, status, date range", "PDF, Excel"],
        ["2", "Teacher Report", "Status, joining date range", "PDF, Excel"],
        ["3", "Staff Report", "Department, status", "PDF, Excel"],
        ["4", "Attendance Report", "Group (student/teacher/staff), class, month", "PDF, Excel"],
        ["5", "Fee Collection Report", "Date range, class, payment mode", "PDF, Excel"],
        ["6", "Fee Defaulter Report", "Month, class, min outstanding", "PDF, Excel"],
        ["7", "Salary Report", "Month, employee, department", "PDF, Excel"],
        ["8", "Fine / Deduction Report", "Month, deduction type, employee", "PDF, Excel"],
        ["9", "Result Report", "Exam, class, pass/fail filter", "PDF, Excel"],
        ["10", "Monthly Summary Report", "Month (one-page KPI snapshot)", "PDF"],
      ],
      [6, 32, 38, 24]
    ),
    h2("18.1 Report Generation Architecture"),
    p("All reports are generated client-side in the React frontend using jsPDF for PDF output and ExcelJS for Excel output. The data is fetched from the backend via a single Tauri command per report that returns a typed array of rows. This approach keeps the backend simple (no PDF rendering on the Rust side) and allows the frontend to apply user-specific formatting (currency symbol, date format) without backend changes. PDF generation for a report with one thousand rows completes in under three seconds."),
    h2("18.2 Monthly Summary Report"),
    p("The Monthly Summary Report deserves special mention — it is a one-page snapshot of the school's operational and financial health for a given month, designed to be printed and reviewed by the principal at month-end. It includes: total students at month start and end, admissions and leaves during the month, fee collected vs. fee pending, salary paid with total deductions, attendance percentages for students and staff, and a small chart showing fee collection trend for the last six months. This single-page report is the most-printed report in the system and is often the principal's primary monthly review document."),
  ];
}

// SECTION 21: Module 14 — Analytics
function moduleAnalytics() {
  return [
    h1("19. Module 14: Analytics"),
    p("The Analytics module provides seven visual charts that surface trends and patterns not visible in the day-to-day operational screens. The charts use Recharts and are interactive — hovering over a data point shows a tooltip with the exact value, and most charts support clicking a bar or segment to drill down into the underlying records. The analytics are read-only and refresh automatically when the underlying data changes (no manual refresh needed)."),
    h2("19.1 Student Growth Trend"),
    p("A line chart showing the total active student count at the end of each month for the last twenty-four months. The chart helps the principal see whether the school is growing, stable, or declining — and whether growth is accelerating or decelerating. A second line on the same chart shows the cumulative admissions for the year, providing a leading indicator for next year's enrollment."),
    h2("19.2 Fee Collection Trend"),
    p("A combined bar-and-line chart showing, for each of the last twelve months, the total fee collected (bar) and the fee pending at month-end (line). This chart reveals seasonal patterns (e.g., a dip in collection during summer vacation) and highlights months where defaulter follow-up is needed. Clicking a bar opens the Fee Collection Report for that month."),
    h2("19.3 Monthly Income"),
    p("A bar chart showing total monthly income (all fee types plus any other income recorded) for the last twelve months, with a horizontal line showing the twelve-month average. This is the simplest financial trend chart and is often the first chart the principal checks each morning."),
    h2("19.4 Teacher Attendance Statistics"),
    p("A stacked bar chart showing, for each of the last six months, the count of Present, Late, Half-Day, Leave, and Absent days across all teachers. The chart identifies patterns of absenteeism — for example, a teacher who is consistently late on Mondays — and supports decisions on attendance policy enforcement."),
    h2("19.5 Student Attendance Statistics"),
    p("A stacked bar chart similar to the teacher attendance statistics but aggregated across all students, with a class filter. The principal can select a specific class to see its attendance trend, helping identify classes with chronic absenteeism that may need parent outreach."),
    h2("19.6 Salary Expense Breakdown"),
    p("A pie chart showing the current month's salary expense broken down by department (Teaching, Administration, Security, Housekeeping, Transport, Other). A second donut chart shows the breakdown of deductions (absenteeism, late, provident fund, other) for the same month. Together these charts show where the salary budget goes and how much is being lost to absenteeism."),
    h2("19.7 Monthly Profit & Loss Summary"),
    p("A combined chart showing monthly income (green bars), monthly expenses (red bars), and the resulting profit or loss (line) for the last twelve months. This is the closest the system comes to a full P&L statement — income includes all fee collections and other income; expenses include all salary payments and any other recorded expenses. The chart provides a quick visual answer to the question \"is the school profitable this month?\" and supports longer-term financial planning."),
  ];
}

// SECTION 22: Module 15 — User Management & Permissions
function moduleUsers() {
  return [
    h1("20. Module 15: User Management & Permissions"),
    p("The User Management module allows the Admin to create and manage user accounts for staff who will log into the system, and to assign each user one of the three roles defined in Section 3. Every action in the system — every Tauri command — is gated by a permission check that verifies the calling user's role has the required access level. This defense-in-depth approach ensures that even if a UI bug accidentally shows a button to an unauthorized user, the backend rejects the action."),
    h2("20.1 User Account CRUD"),
    p("The Admin can create, edit, deactivate, and reset passwords for user accounts. Each account has: username (unique), full name, email (optional), role (Admin / Accountant / Teacher), assigned teacher or staff record (if the user is a Teacher or Staff), status (Active / Inactive), last login timestamp, and password hash. Passwords are hashed with bcrypt at ten rounds and never stored in plaintext. The Admin can force a password reset on next login, useful for new accounts and after a password reset request."),
    h2("20.2 Password Policy"),
    p("The system enforces a configurable password policy: minimum eight characters, at least one letter and one number (default), with options to require uppercase and special characters. Passwords expire after ninety days (configurable), and the last five passwords cannot be reused. Failed login attempts are tracked; after five consecutive failures, the account is locked for fifteen minutes, after which it auto-unlocks. The Admin can manually unlock an account at any time."),
    h2("20.3 Session Management"),
    p("After a successful login, the user's session is maintained with a JWT token signed by the backend and stored in the frontend's secure storage. The token expires after eight hours of inactivity (configurable), requiring re-login. On the backend, every Tauri command validates the token and checks the user's role before executing. A \"log out of all devices\" action is available in the user's profile, invalidating all outstanding tokens for that user."),
    h2("20.4 Activity Log"),
    p("Every meaningful action — login, fee collection, salary finalization, certificate issuance, settings change, user creation — is recorded in the activity_log table with the acting user's ID, timestamp, action type, and a JSON payload of action details. The activity log is viewable in the Reports module (filtered by user, action type, and date range) and provides a complete audit trail. The log is retained indefinitely — it is never automatically purged — and the Admin can export it to Excel for external audit purposes."),
  ];
}

// SECTION 23: Module 16 — Settings
function moduleSettings() {
  return [
    h1("21. Module 16: Settings"),
    p("The Settings module consolidates all school-wide configuration into one screen, organized into six tabs. Settings are stored in a single key-value table (settings) in the database, with the exception of fine rules and fee structures which have their own normalized tables. All settings changes are logged in the activity log with the previous and new values, providing a complete audit trail of configuration changes."),
    h2("21.1 School Information"),
    p("Captures the school's name, address, phone, email, website, logo (uploaded as a PNG/JPG, stored in the database as a base64 blob), academic session start and end dates, and the school's fiscal year (calendar or July–June). This information appears on every printed document (receipts, certificates, result cards, salary slips) and on the dashboard header."),
    h2("21.2 Fine Rules"),
    p("Configures the attendance-based fine rules described in Section 13.2: late fine amount, half-day deduction percentage, leave paid/unpaid toggle, and per-day salary calculation basis (working days vs. calendar days). The rules apply uniformly to all teachers and staff; per-person overrides are configured on the individual employee record."),
    h2("21.3 Fee Settings"),
    p("Configures the fee due date each month, the late fee calculation method (fixed amount or percentage), the late fee amount, whether partial payments are allowed, the receipt number prefix and starting sequence, and the receipt paper size (A5 or thermal 80mm). Changes to these settings take effect from the next fee collection; existing receipts are not retroactively affected."),
    h2("21.4 User Accounts"),
    p("A shortcut to the User Management module, allowing the Admin to create and manage user accounts without leaving the Settings screen."),
    h2("21.5 Backup & Restore"),
    p("Provides manual backup (one-click, saves a timestamped .db backup file to a user-selected location) and restore (selects a .db backup file and restores the database to that state). Automatic daily backup can be enabled, with a configurable backup time and retention count (default: keep last seven backups). Backup files are full copies of the SQLite database — there is no incremental backup — so a restore fully replaces the current database. The restore action requires the Admin password to be re-entered as a safety measure."),
    h2("21.6 Appearance & Localization"),
    p("Toggles between light and dark theme (the choice is persisted per user), selects the display language (English only in v1.0, with Urdu and Arabic reserved for v2.0), and configures the currency symbol and date format used throughout the application. The default currency is PKR (Rs.) and the default date format is DD/MM/YYYY for the Pakistan region."),
  ];
}

// SECTION 24: Extra Features
function sectionExtras() {
  return [
    h1("22. Extra Features"),
    p("Beyond the sixteen modules, the application includes a set of cross-cutting features that improve usability, reduce manual work, and enhance the professional appearance of the school's printed outputs. These features are not modules in themselves but are woven throughout the application."),
    bullet("Automatic receipt numbering — every fee receipt gets a unique, sequential, never-reused number with a configurable prefix, generated atomically by the backend to prevent duplicates even under concurrent collection."),
    bullet("Automatic student ID and roll number — student IDs are generated at admission with a configurable format (default SCH-YYYY-NNNN); roll numbers are auto-assigned within a section based on admission order, with manual override available."),
    bullet("QR code on student ID card — each printed ID card includes a QR code encoding the student ID, scannable by any standard QR reader for quick student lookup (future v2.0 will add scanner integration at the fee counter and attendance kiosk)."),
    bullet("Professional receipt printing — receipts use the school's letterhead, accent color, and a clean layout suitable for both A5 laser and 80mm thermal printers, with the amount in words and a signature line."),
    bullet("PDF and Excel export — every report and every printable document is available as both PDF (for printing and archival) and Excel (for further analysis), generated client-side for instant output."),
    bullet("Global search — a single search box accessible from any screen via Ctrl+K, searching across students, teachers, staff, receipts, and certificates; selecting a result navigates directly to the corresponding record."),
    bullet("Dark and light theme — both themes are fully supported with the same color palette; the choice is per-user and persisted across sessions."),
    bullet("Automatic database backup — a daily backup runs at a configurable time, keeping the last seven backups by default; backups are full SQLite database files stored on the local disk."),
    bullet("Fully offline operation — no internet connection is required at any point; the application runs entirely on the local machine with the local SQLite database."),
    bullet("Fast SQLite database — SQLite in WAL mode delivers sub-100ms query times for all common operations, even with one thousand students and ten years of historical data."),
    bullet("Clean, modern desktop UI — Tailwind CSS and shadcn/ui provide a consistent, accessible, modern interface that requires minimal training for non-technical school staff."),
    bullet("One-click reports — the most-used reports (daily attendance, monthly defaulter, monthly salary summary) are accessible from the dashboard with sensible defaults pre-filled, reducing the path from question to answer to a single click."),
  ];
}

// SECTION 25: Non-Functional Requirements
function sectionNonFunctional() {
  return [
    h1("23. Non-Functional Requirements"),
    p("The non-functional requirements define the quality attributes the system must satisfy alongside the functional features. These requirements are testable and are validated during the QA phase before release."),
    h2("23.1 Performance"),
    p("The application must launch to a usable dashboard in under two seconds on a mid-range laptop (Intel i5, 8GB RAM, SSD). All list views (students, teachers, fee collections) must render one hundred rows in under five hundred milliseconds. All reports must generate and display a print preview in under three seconds for a school with one thousand students. The fee collection workflow (from student search to receipt preview) must complete in under thirty seconds. Salary calculation for one hundred employees must complete in under three seconds. These targets are validated with automated performance tests run on each release build."),
    h2("23.2 Reliability"),
    p("The system must never lose committed data — even in the event of a power failure or operating system crash mid-operation. SQLite's ACID compliance guarantees this at the database level; the Rust business logic layer wraps each multi-step operation (e.g., fee collection with receipt generation) in a single database transaction so that either all changes are committed or none are. The application must handle network and file system errors gracefully, with clear error messages and no data corruption. Automatic backups provide a second layer of data protection, allowing recovery to any point in the last seven days."),
    h2("23.3 Security"),
    p("Although the application is offline and local, security is still important — school data is sensitive. The SQLite database file is stored in the user's app data directory with file system permissions restricting access to the current user. User passwords are hashed with bcrypt at ten rounds; the JWT session tokens are signed with a secret generated at first run and stored in the app data directory. Every Tauri command validates the calling user's role before executing, providing defense in depth. The activity log records every meaningful action for audit purposes."),
    h2("23.4 Usability"),
    p("The application must be learnable by non-technical school staff (typical user: a 40-year-old school accountant with basic computer literacy) in under two hours of guided training. The dashboard must be self-explanatory — every tile and button must have a clear label and an optional tooltip. Common workflows (collect fee, mark attendance, print result card) must be completable in five or fewer clicks from the dashboard. The application ships with sample demo data (a fictional school with twenty students, five teachers, and three months of historical data) that allows new users to explore every feature without entering real data."),
    h2("23.5 Portability"),
    p("The application must run on Windows 10 and 11 (64-bit), macOS 12 Monterey and later, and Ubuntu 22.04 LTS and later. The same binary build is packaged for each operating system using Tauri's bundler (MSI and NSIS installers for Windows, DMG for macOS, AppImage and .deb for Linux). The application does not require administrative privileges to install or run. The database file, settings, and logs are stored in the user's app data directory, ensuring per-user isolation on multi-user machines."),
    h2("23.6 Maintainability"),
    p("The codebase must be maintainable by a single developer after the original team has moved on. The seven-layer architecture enforces separation of concerns; every module has a single responsibility; functions are documented with doc comments; and the README in each directory explains its purpose. Database migrations are version-controlled and forward-only, allowing the schema to evolve without manual SQL intervention. The CI pipeline runs TypeScript type checks, Rust clippy lint, and unit tests on every commit, preventing regressions from being merged."),
  ];
}

// SECTION 26: Data Model Overview
function sectionDataModel() {
  return [
    h1("24. Data Model Overview"),
    p("The database schema consists of twenty-one core tables organized by domain. The tables are created by versioned SQL migrations managed by the refinery library, applied automatically at application startup. All foreign keys have ON DELETE RESTRICT by default (preventing deletion of referenced records) except for student-related tables which use ON DELETE CASCADE for child records like attendance and marks. The full schema is documented in the migrations directory; the table below summarizes the core entities."),
    tableCaption("Table 9: Core Database Tables"),
    makeTable(
      ["Table", "Domain", "Key Fields", "Relationships"],
      [
        ["students", "Student", "id, name, dob, class_section_id, status", "Has many: attendance, fee_collections, marks, certificates"],
        ["parents", "Student", "id, father_name, father_phone, mother_name", "Belongs to: student"],
        ["teachers", "Teacher", "id, name, cnic, qualification, monthly_salary", "Has many: assignments, attendance, salary_slips"],
        ["staff", "Staff", "id, name, cnic, department, designation, monthly_salary", "Has many: attendance, salary_slips"],
        ["classes", "Class", "id, name, grade_level, default_monthly_fee", "Has many: sections"],
        ["sections", "Class", "id, class_id, name, capacity, class_teacher_id", "Belongs to: class; has many: students"],
        ["subjects", "Class", "id, name, code", "Has many: class_subjects"],
        ["class_subjects", "Class", "class_id, subject_id, full_marks, pass_marks", "Junction: class + subject"],
        ["teacher_assignments", "Teacher", "teacher_id, class_section_id, subject_id", "Junction: teacher + class-section + subject"],
        ["timetable_slots", "Timetable", "class_section_id, day, period, subject_id, teacher_id, room", "Belongs to: class_section"],
        ["attendance_students", "Attendance", "student_id, date, status", "Belongs to: student"],
        ["attendance_staff", "Attendance", "employee_id, employee_type, date, status", "Belongs to: teacher or staff"],
        ["fee_structures", "Fee", "class_id, fee_type, amount, frequency", "Belongs to: class"],
        ["fee_collections", "Fee", "id, student_id, receipt_no, date, amount, mode", "Belongs to: student"],
        ["salary_rules", "Salary", "rule_type, amount, percentage, effective_date", "Standalone config"],
        ["salary_slips", "Salary", "id, employee_id, month, gross, deductions, net", "Belongs to: teacher or staff"],
        ["fines", "Salary", "slip_id, fine_type, days, amount", "Belongs to: salary_slip"],
        ["exams", "Exam", "id, name, type, start_date, end_date, class_ids", "Has many: marks"],
        ["marks", "Exam", "exam_id, student_id, subject_id, obtained, total", "Belongs to: exam + student + subject"],
        ["certificates", "Certificate", "id, type, student_id, issue_date, cert_no", "Belongs to: student"],
        ["users", "User", "id, username, password_hash, role, status", "Standalone (links to teacher/staff)"],
        ["activity_log", "System", "id, user_id, action, timestamp, details_json", "Belongs to: user"],
        ["settings", "System", "key, value, updated_at, updated_by", "Standalone key-value"],
      ],
      [18, 14, 36, 32]
    ),
    p("The schema is designed for clarity and query performance rather than normalization purity. A few denormalizations are intentional — for example, the student record stores the current class_section_id directly rather than requiring a join through an enrollments table — because the resulting query simplification significantly improves read performance and code maintainability for the common case (a student is in one class-section for the duration of a session)."),
  ];
}

// SECTION 27: Implementation Roadmap
function sectionRoadmap() {
  return [
    h1("25. Implementation Roadmap"),
    p("The implementation is organized into five phases over approximately twenty-two weeks. Each phase has a clear deliverable and a demo milestone where the work-in-progress is reviewed with stakeholders. The phases are sequenced to deliver value early — the foundational CRUD modules come first, followed by the operational modules that depend on them, then the financial modules that depend on attendance, and finally the analytics and polish phase."),
    tableCaption("Table 10: Implementation Phases"),
    makeTable(
      ["Phase", "Duration", "Modules", "Milestone"],
      [
        ["Phase 1: Foundation", "4 weeks", "Project setup, DB schema, auth, Settings, User Management", "Working login + school setup"],
        ["Phase 2: Core CRUD", "6 weeks", "Students, Teachers, Staff, Classes, Sections, Subjects", "Full student admission flow"],
        ["Phase 3: Operations", "5 weeks", "Attendance, Fee Management, Fee Defaulter, Timetable", "Daily operations usable"],
        ["Phase 4: Finance & Academics", "4 weeks", "Salary & Fine, Exams & Results, Certificates", "Month-end payroll + result cards"],
        ["Phase 5: Polish & Release", "3 weeks", "Reports, Analytics, Dashboard, packaging, demo data", "v1.0 release candidate"],
      ],
      [22, 12, 38, 28]
    ),
    h2("25.1 Phase 1: Foundation (Weeks 1–4)"),
    p("Phase 1 establishes the project skeleton, the database schema, the authentication system, and the school setup wizard. By the end of Phase 1, a user can install the application, create an Admin account, configure the school's basic information, and log in to an empty dashboard. The database migrations for all twenty-one tables are written and tested. The Tauri command bridge is set up with the first command (get_school_info). The CI pipeline is configured with TypeScript checks, Rust clippy, and unit tests for the first command. Deliverable: installable v0.1 binary with login and school setup."),
    h2("25.2 Phase 2: Core CRUD (Weeks 5–10)"),
    p("Phase 2 builds the four core CRUD modules: Students, Teachers, Staff, and Classes/Sections/Subjects. This is the longest phase because these modules establish the patterns (form layout, list view, profile view, search/filter, validation) that all subsequent modules reuse. By the end of Phase 2, the school can fully populate its student, teacher, staff, and class records. Deliverable: installable v0.2 binary with full master data management."),
    h2("25.3 Phase 3: Operations (Weeks 11–15)"),
    p("Phase 3 builds the three modules that the school uses daily: Attendance, Fee Management (with Defaulter), and Timetable. These modules depend on the master data from Phase 2 and are the first to deliver measurable operational value. By the end of Phase 3, the school can run its daily operations in the application — mark attendance, collect fees with printable receipts, generate defaulter lists, and create class timetables. Deliverable: installable v0.3 binary usable for daily operations in a pilot school."),
    h2("25.4 Phase 4: Finance & Academics (Weeks 16–19)"),
    p("Phase 4 builds the four modules that operate on a monthly or term cycle: Salary & Fine, Exams & Results, and Certificates. These modules have the most complex business logic (especially the salary fine calculation) and the most demanding print output requirements (result cards, salary slips, certificates). By the end of Phase 4, the school can process month-end payroll, generate result cards after exams, and issue all four certificate types. Deliverable: installable v0.4 binary with full operational feature set."),
    h2("25.5 Phase 5: Polish & Release (Weeks 20–22)"),
    p("Phase 5 builds the dashboard, the analytics module, the reports module, and completes the cross-cutting extras (global search, dark theme, demo data, packaging). The phase ends with a release candidate tested at two pilot schools for two weeks, followed by the v1.0 release. Deliverable: signed v1.0 installers for Windows, macOS, and Linux, with documentation and demo data."),
  ];
}

// SECTION 28: Risk & Mitigation
function sectionRisks() {
  return [
    h1("26. Risk & Mitigation"),
    p("The following five risks have been identified as the most significant threats to the v1.0 release. Each risk is assessed for likelihood and impact, and a concrete mitigation strategy is defined. The risks are reviewed at each phase demo and updated as the project progresses."),
    tableCaption("Table 11: Risk Register"),
    makeTable(
      ["Risk", "Likelihood", "Impact", "Mitigation"],
      [
        ["Database corruption from power failure or improper shutdown", "Medium", "High", "SQLite WAL mode + automatic daily backup; restore workflow tested in Phase 1"],
        ["Staff training gap blocking adoption", "Medium", "Medium", "Demo data preloaded; in-app help tooltips; printable quick-start guide; two pilot schools before release"],
        ["Printer compatibility (thermal + laser + A4)", "High", "Low", "Use standard PDF rendering; test with three printer models in Phase 5; provide thermal 80mm and A5 paper size options"],
        ["Tauri v2 API changes during development", "Low", "Medium", "Pin to Tauri v2.0.x stable; subscribe to Tauri changelog; CI runs against the pinned version"],
        ["Feature creep beyond v1.0 scope", "High", "Medium", "Strict scope document (this PRD); all new feature requests logged to v1.1 backlog, not added to v1.0"],
        ["Salary fine calculation errors", "Medium", "High", "Comprehensive unit tests for all fine rule combinations; manual reconciliation with Excel for first three months at pilot school"],
      ],
      [30, 14, 14, 42]
    ),
  ];
}

// SECTION 29: Acceptance Criteria
function sectionAcceptance() {
  return [
    h1("27. Acceptance Criteria"),
    p("Version 1.0 will be considered complete and ready for release when all of the following acceptance criteria have been verified by the QA team and confirmed by at least one pilot school. Each criterion is testable and has a clear pass/fail definition."),
    bullet("All sixteen functional modules are implemented, accessible to the appropriate roles, and pass their module-level test cases."),
    bullet("All three user roles (Admin, Accountant, Teacher) can log in, see their role-appropriate dashboard and menu, and perform their primary workflows without errors."),
    bullet("Fee collection completes in under thirty seconds per student, with a printable receipt containing the school letterhead, itemized fees, and amount in words."),
    bullet("Salary calculation for a school with one hundred employees completes in under three seconds, with each salary slip showing the correct attendance-based deductions as verified against a manual Excel calculation."),
    bullet("Fee defaulter list generates in under one second, with filters by class and month working correctly, and is printable as a PDF with the school letterhead."),
    bullet("Result card generation for a class of forty students produces a single PDF with forty pages in under ten seconds, with correct grades and positions."),
    bullet("All four certificate types (Leaving, Character, Bonafide, Fee Paid) generate correctly with the school letterhead and are printable on A4."),
    bullet("Backup and restore are tested: a backup file can be created, the database can be restored from it on a fresh installation, and all data is intact."),
    bullet("The application installs and runs on Windows 10, Windows 11, macOS 13, and Ubuntu 22.04 without errors, with no administrative privileges required for installation."),
    bullet("Demo school data (twenty students, five teachers, three staff, three months of attendance and fee history) is preloaded on first run, allowing a new user to explore every feature within five minutes of installation."),
    bullet("A printable user manual (PDF, approximately twenty pages) is included in the installation, covering installation, initial setup, and each module's primary workflow."),
    bullet("The application launches to a usable dashboard in under two seconds on the reference hardware (Intel i5, 8GB RAM, SSD)."),
  ];
}

module.exports = {
  moduleReports,
  moduleAnalytics,
  moduleUsers,
  moduleSettings,
  sectionExtras,
  sectionNonFunctional,
  sectionDataModel,
  sectionRoadmap,
  sectionRisks,
  sectionAcceptance,
};
