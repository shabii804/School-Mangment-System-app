// Body content for the School Management System PRD — all sections
const { Paragraph, TextRun, PageBreak, AlignmentType } = require("docx");
const {
  h1, h2, h3, p, bullet, numItem, mixedP, makeTable, tableCaption,
} = require("./prd_helpers.js");

// Helper to push a PageBreak attached to a text-bearing paragraph
function pageBreakAfter(text) {
  return new Paragraph({
    children: [
      new TextRun({ text: text || "", size: 2 }),
      new PageBreak(),
    ],
  });
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: Executive Summary
// ─────────────────────────────────────────────────────────────
function sectionExecutiveSummary() {
  return [
    h1("1. Executive Summary"),
    p("The School Management System (SMS) is a fully offline desktop application designed for small-to-medium private schools that need a clean, fast, and reliable way to run their daily operations without the overhead of a complex enterprise ERP. The product consolidates sixteen core modules — covering students, teachers, staff, classes, timetables, attendance, salary with fine deductions, fees, defaulters, examinations, certificates, reports, analytics, user management, and settings — into a single installable package that runs on Windows, macOS, and Linux."),
    p("Built with React 18, TypeScript, and Tauri v2 on the frontend, backed by a Rust business-logic layer and a local SQLite database, the application delivers native-class performance with a modern web-style user interface. State is managed with Zustand, forms with React Hook Form and Zod, tables with TanStack Table, and charts with Recharts. The seven-layer architecture (React UI, Zustand state, services, Tauri commands, Rust business logic, repository layer, SQLite) keeps each concern cleanly separated and makes the codebase maintainable by a small team."),
    p("The three primary user roles — Admin, Accountant, and Teacher — each see a tailored view of the system with role-based permissions enforced at the command layer. The Admin owns the full system, the Accountant focuses on fee collection and financial reports, and the Teacher handles attendance and results for their assigned classes. This separation ensures that staff only see what they need, reducing training time and operational errors."),
    p("Key outcomes for the school include: fee collection completed in under thirty seconds per student, defaulter lists generated in one click, salary automatically adjusted for absenteeism, professional PDF receipts and result cards printed on demand, and a complete backup of all school data in a single file. The application is designed to be deployable by a non-technical school administrator in under one hour, including initial school setup and data import."),
    p("This document defines the complete product scope, functional and non-functional requirements, technology stack, architecture, data model, implementation roadmap, and acceptance criteria for version 1.0. It is intended for the product, engineering, and QA teams as the authoritative specification from which implementation will proceed."),
  ];
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: Project Vision & Objectives
// ─────────────────────────────────────────────────────────────
function sectionVision() {
  return [
    h1("2. Project Vision & Objectives"),
    h2("2.1 Vision Statement"),
    p("To become the default desktop software that a private school installs on its front-office computer — replacing spreadsheets, paper registers, and handwritten receipts with one fast, offline, and genuinely usable application that the school staff actually enjoy using. The product must feel as simple as a mobile app while delivering the depth of an enterprise system in the areas that matter most: fee collection, attendance, salary with fine deductions, and printable certificates and reports."),
    h2("2.2 Problem Statement"),
    p("Most small and medium private schools today manage their operations through a patchwork of paper registers, Excel files, and printed receipt books. This approach leads to four recurring problems. First, fee collection is slow and error-prone — receipts are handwritten, duplicates are lost, and the defaulter list is reconstructed manually each month by scanning registers. Second, salary calculation for teaching and non-teaching staff is manual, and absenteeism is rarely deducted accurately because there is no linkage between the attendance register and the payroll process. Third, student records, attendance, and results live in separate places, so generating a report card or a bonafide certificate becomes a half-day exercise of copying data between documents. Fourth, there is no analytical visibility — the principal cannot quickly answer questions like how much fee was collected this month versus last, or which class has the worst attendance trend."),
    p("The School Management System addresses these problems by consolidating all school data into one local database, automating the tedious workflows (fee receipts, defaulter lists, salary with attendance-based deductions, result cards), and providing a dashboard and analytics layer that surfaces the key metrics the principal needs to run the school."),
    h2("2.3 Measurable Objectives"),
    p("Version 1.0 will be considered successful if it meets the following measurable objectives within the first three months of deployment at a pilot school:"),
    bullet("Reduce average fee collection time per student from approximately three minutes (handwritten receipt) to under thirty seconds (digital receipt with one-click print)."),
    bullet("Generate the monthly fee defaulter list in under one second, with filters by class and month, replacing the current manual scan that takes one to two staff-hours per month."),
    bullet("Calculate monthly teacher and staff salaries with attendance-based fine deductions automatically, eliminating the current manual calculation that consumes one full day of the accountant's time each month."),
    bullet("Print a result card, certificate, or salary slip in under five seconds from the respective module, with the school logo and principal signature placeholder pre-applied."),
    bullet("Provide a complete database backup in a single file under fifty megabytes for a school of up to one thousand students, restorable on any machine in under two minutes."),
    h2("2.4 Scope Boundaries"),
    h3("2.4.1 In Scope (v1.0)"),
    p("The following are explicitly included in version 1.0 and are detailed in the functional modules section of this document:"),
    bullet("All sixteen functional modules listed in Section 7 (Dashboard through Settings)."),
    bullet("Three user roles: Admin, Accountant, Teacher, with role-based permissions."),
    bullet("Offline desktop deployment on Windows 10/11, macOS, and Linux."),
    bullet("Local SQLite database with manual and automatic daily backup."),
    bullet("PDF and Excel export for all reports; printable receipts, result cards, certificates, and salary slips."),
    bullet("Sample/demo school data preloaded for first-run exploration and training."),
    h3("2.4.2 Out of Scope (v1.0)"),
    p("The following are explicitly excluded from version 1.0 to keep the release focused and shippable. They may be considered for future versions based on user feedback:"),
    bullet("Cloud sync or multi-school / multi-branch support — v1.0 is strictly single-school, single-machine (or single-LAN with shared DB file)."),
    bullet("Parent portal or mobile app — v1.0 is desktop-only; parent communication happens through printed reports and receipts."),
    bullet("SMS and email gateway integration — the data model reserves fields for phone and email, but no gateway integration is built in v1.0."),
    bullet("Online fee payment, payment gateway, or bank integration — all fee collection in v1.0 is cash, cheque, or bank-transfer recorded manually."),
    bullet("Library, transport, inventory, hostel, and alumni modules — these are common school ERP features but are deferred to a future version to keep v1.0 shippable."),
    bullet("Biometric (fingerprint/face) attendance — v1.0 uses manual marking through the UI; biometric device integration is a possible v2.0 feature."),
  ];
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: Target Users & Roles
// ─────────────────────────────────────────────────────────────
function sectionUsers() {
  return [
    h1("3. Target Users & Roles"),
    p("The School Management System is designed for three primary user roles. Each role sees a tailored subset of modules and actions, enforced both in the user interface (menu visibility, button enablement) and at the Tauri command layer (every command checks the calling user's role before executing). The role assignment is made by the Admin when creating a user account and can be changed at any time."),
    h2("3.1 Role: Admin"),
    p("The Admin is the principal, vice-principal, or front-office manager who owns the system end-to-end. The Admin has full access to every module, can create and deactivate other user accounts, configures school-wide settings (school information, logo, academic session, fine rules, fee due dates), and performs backup and restore operations. The Admin is the only role that can promote students to the next academic session, archive the current session, and reset the database. Typical daily workflow for the Admin: open the dashboard in the morning to review yesterday's fee collection and today's pending tasks, spot-check attendance marking by teachers, generate the monthly defaulter list, and review salary slips before printing."),
    h2("3.2 Role: Accountant"),
    p("The Accountant is responsible for fee collection, fee structure configuration, salary processing, and all financial reports. The Accountant has full access to the Fee Management, Fee Defaulter, Salary & Fine Management, and Reports modules, read-only access to Student, Teacher, and Staff modules (needed to look up students and staff during collection and payroll), and no access to Results, Certificates, Timetable, or User Management. Typical daily workflow for the Accountant: open the Fee Collection screen at the start of the day, collect fees from arriving parents with one-click receipt printing, mark fee payments against pending dues, and at month-end generate the defaulter list and process salaries with attendance-based deductions."),
    h2("3.3 Role: Teacher"),
    p("The Teacher role is the most restricted and the most focused. A Teacher logs in to mark attendance for their assigned classes, enter marks for exams in their subjects, and view (but not edit) the timetable. Teachers cannot collect fees, manage salaries, configure settings, or access other teachers' data. The Teacher sees only the classes and subjects assigned to them by the Admin. Typical daily workflow for a Teacher: open the Attendance module, select today's class, mark present/absent/late in under one minute per class, then later in the week open the Results module to enter marks for an exam. Teachers also use the system to print their own class's result cards after marks entry is complete."),
    h2("3.4 Permission Matrix"),
    p("The table below summarizes the access level for each role across all sixteen modules. \"Full\" means create, read, update, and delete; \"Read\" means view-only; \"Own\" means access limited to the user's own assigned classes or subjects; and \"None\" means the module is not visible to that role."),
    tableCaption("Table 1: Role-Based Permission Matrix"),
    makeTable(
      ["Module", "Admin", "Accountant", "Teacher"],
      [
        ["1. Dashboard", "Full", "Full (finance focus)", "Limited (own classes)"],
        ["2. Student Management", "Full", "Read", "Read (own students)"],
        ["3. Teacher Management", "Full", "Read", "Read (own profile)"],
        ["4. Staff Management", "Full", "Read", "None"],
        ["5. Class Management", "Full", "Read", "Read (own classes)"],
        ["6. Timetable", "Full", "Read", "Read (own timetable)"],
        ["7. Attendance", "Full", "Read", "Own (mark + view)"],
        ["8. Salary & Fine", "Full", "Full", "Read (own slip)"],
        ["9. Fee Management", "Full", "Full", "None"],
        ["10. Fee Defaulter", "Full", "Full", "None"],
        ["11. Examination & Results", "Full", "Read", "Own (marks entry)"],
        ["12. Certificates", "Full", "Issue only", "None"],
        ["13. Reports", "Full", "Full (finance)", "Own class reports"],
        ["14. Analytics", "Full", "Full (finance)", "Limited"],
        ["15. User Management", "Full", "None", "None"],
        ["16. Settings", "Full", "Read", "None"],
      ],
      [34, 18, 26, 22]
    ),
  ];
}

// ─────────────────────────────────────────────────────────────
// SECTION 6: Technology Stack & Architecture
// ─────────────────────────────────────────────────────────────
function sectionTechStack() {
  return [
    h1("4. Technology Stack & Architecture"),
    h2("4.1 Technology Stack"),
    p("The application is built with a deliberate choice of mature, well-documented, and actively maintained technologies. Every choice is justified by either developer productivity, runtime performance, or the need to ship a single installable binary that runs offline on all three major desktop operating systems."),
    tableCaption("Table 2: Technology Stack Summary"),
    makeTable(
      ["Layer", "Technology", "Purpose"],
      [
        ["Frontend UI", "React 18 + TypeScript", "Component-based UI with type safety"],
        ["Build Tool", "Vite 5", "Fast dev server, optimized production build"],
        ["Desktop Shell", "Tauri v2", "Native desktop wrapper, Rust backend, small binary"],
        ["Database", "SQLite (via rusqlite)", "Embedded, file-based, zero-config local DB"],
        ["State Management", "Zustand", "Lightweight, no boilerplate, perfect for desktop"],
        ["Styling", "Tailwind CSS 4", "Utility-first, consistent design system"],
        ["UI Components", "shadcn/ui", "Accessible, customizable, copy-in components"],
        ["Forms", "React Hook Form + Zod", "Performant forms with schema validation"],
        ["Tables", "TanStack Table v8", "Headless, sortable, filterable data tables"],
        ["Charts", "Recharts", "Composable React charts for analytics"],
        ["Reports (PDF)", "jsPDF + jsPDF-autotable", "Client-side PDF generation"],
        ["Reports (Excel)", "ExcelJS", "Excel file generation with formatting"],
        ["Icons", "lucide-react", "Clean, consistent icon set"],
        ["Date Handling", "date-fns", "Lightweight date utilities"],
        ["Backend Language", "Rust", "Performance, safety, native Tauri integration"],
        ["DB Access (Rust)", "rusqlite + refinery", "SQLite driver + migrations"],
        ["Packaging", "Tauri bundler", "MSI/NSIS for Windows, DMG for macOS, AppImage for Linux"],
      ],
      [22, 28, 50]
    ),
    h2("4.2 Seven-Layer Architecture"),
    p("The application follows a strict seven-layer architecture that cleanly separates the user interface from the database. Each layer has a single responsibility and communicates only with the layer immediately below it. This separation is essential for maintainability — a UI change never touches database code, a schema change never reaches the React components, and business rules live in exactly one place (the Rust business logic layer) where they can be tested in isolation."),
    tableCaption("Table 3: Seven-Layer Architecture Responsibilities"),
    makeTable(
      ["Layer #", "Layer Name", "Technology", "Responsibility"],
      [
        ["1", "React UI", "React + Tailwind + shadcn/ui", "Renders screens, captures user input, displays data. Contains no business logic — only presentation and UI state (modals open/closed, selected row, etc.)."],
        ["2", "State (Zustand)", "Zustand stores", "Holds client-side application state (current user, cached lists, dashboard KPIs). Acts as a read-through cache: UI reads from store, store fetches from services on miss."],
        ["3", "Services", "TypeScript modules", "Frontend business orchestration — composes multiple Tauri commands into a single UI action (e.g., \"collect fee\" = create payment + update student balance + generate receipt number + return receipt PDF)."],
        ["4", "Tauri Commands", "@tauri-apps/api invoke", "The IPC bridge. Each command is a typed function call from TypeScript to Rust. Validates arguments with Zod before invoking, handles Rust errors as typed exceptions."],
        ["5", "Rust Business Logic", "Rust modules", "All domain rules live here: salary fine calculation, defaulter detection, grade computation, receipt number generation, permission checks. Pure functions, fully unit-testable."],
        ["6", "Repository Layer", "Rust structs + rusqlite", "Data access abstraction. Each entity (Student, Teacher, FeePayment, etc.) has a repository with CRUD methods. SQL lives only here — never in business logic."],
        ["7", "SQLite Database", "SQLite file on disk", "Single .db file stores all school data. Migrations managed by refinery. WAL mode enabled for concurrent read performance."],
      ],
      [8, 22, 22, 48]
    ),
    h2("4.3 Data Flow Example — Collecting a Fee"),
    p("To illustrate how the seven layers cooperate, consider the action of collecting a monthly fee from a student. The React UI renders a Collect Fee form; on submit, it calls the feeStore.collectFee() method in the Zustand store. The store calls the FeeService.collectFee() service function, which validates the input with a Zod schema, then invokes two Tauri commands in sequence: create_fee_payment and generate_receipt_number. Each command routes to the Rust business logic layer, where the fee amount is validated against the student's outstanding balance, the receipt number is generated using the school-configured prefix and a sequence counter, and a permission check confirms that the calling user has the Accountant or Admin role. The business logic then calls the repository layer to insert a row into the fee_payments table and update the student's balance. The repository executes parameterized SQL against SQLite. The result (the generated receipt number and updated balance) flows back up through the layers, and the UI displays a printable receipt preview."),
    h2("4.4 Project Structure"),
    p("The codebase is organized as a Tauri v2 project with the following top-level structure. The src/ directory contains the React frontend, the src-tauri/ directory contains the Rust backend, and shared type definitions live in a shared/ directory consumed by both sides to ensure end-to-end type safety."),
    bullet("src/ — React frontend (components, pages, stores, services, hooks, lib)."),
    bullet("src-tauri/src/ — Rust backend (commands, business logic, repositories, models, db)."),
    bullet("src-tauri/migrations/ — SQL migration files managed by refinery."),
    bullet("shared/ — TypeScript types mirrored from Rust structs (generated via ts-rs)."),
    bullet("src-tauri/resources/ — bundled static assets (default school logo, certificate templates, demo data SQL)."),
  ];
}

module.exports = {
  sectionExecutiveSummary,
  sectionVision,
  sectionUsers,
  sectionTechStack,
};
