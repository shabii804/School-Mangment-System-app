// Body content — Functional Modules part 2 (sections 14–20)
const { Paragraph, TextRun, AlignmentType } = require("docx");
const {
  h1, h2, h3, p, bullet, numItem, mixedP, makeTable, tableCaption,
} = require("./prd_helpers.js");

// SECTION 14: Module 7 — Attendance
function moduleAttendance() {
  return [
    h1("12. Module 7: Attendance"),
    p("The Attendance module handles daily attendance marking for three groups: students, teachers, and staff. The student attendance is marked class-wise by the class teacher or the Admin; the teacher and staff attendance is marked once daily by the Admin or Accountant. All three attendance streams feed the salary fine calculation for the respective group — for teachers and staff, absences directly reduce their monthly salary; for students, absences affect their attendance percentage shown on the result card."),
    h2("12.1 Student Attendance"),
    p("The student attendance screen presents a class-section selector and, once a section is selected, a list of all enrolled students with their roll numbers and names. Each row has four radio buttons: Present (default), Absent, Late, and Leave. The class teacher marks attendance by changing the radio for absent, late, or leave students and leaving the rest as present, then clicks Save. The save action writes one row per student to the attendance_students table with the date, student ID, and status. Attendance can be edited later in the day by the Admin if a correction is needed; once the day ends, the attendance is locked and further edits require an explicit \"unlock\" action by the Admin with a reason recorded in the activity log."),
    h3("12.1.1 Daily Attendance Report"),
    p("After attendance is marked, the screen shows a summary: total students, present count, absent count, late count, leave count, and attendance percentage. This summary is printable as a daily attendance report for the class, with the date and class teacher's name. The summary is also visible on the dashboard's Today's Attendance KPI tile (aggregated across all classes)."),
    h3("12.1.2 Monthly Attendance Report"),
    p("The monthly attendance report shows, for a selected class-section and month, a matrix with students as rows and dates as columns, with each cell showing P / A / L / Lv. The matrix includes totals per student (days present, absent, late, leave) and an attendance percentage. The report is printable as a PDF on A4 landscape and is the source data for the attendance percentage printed on the result card."),
    h2("12.2 Teacher Attendance"),
    p("Teacher attendance is marked daily by the Admin or Accountant — teachers do not mark their own attendance. The teacher attendance screen lists all active teachers with five status options: Present, Late, Half-Day, Leave, and Absent. The distinction between these five statuses is critical because each has a different salary implication: Present and Leave (paid leave, if leave balance allows) have no deduction; Late has a fixed deduction configured in Settings; Half-Day deducts half a day's salary; Absent deducts a full day's salary. The detailed deduction rules are defined in Section 13 (Salary & Fine Management)."),
    h3("12.2.1 Monthly Summary"),
    p("The monthly teacher attendance summary shows, for each teacher, the count of each status across the month and the total deduction amount that will be applied to their salary. This summary is reviewed by the Accountant before processing monthly payroll, and is printable as a PDF for record-keeping."),
    h2("12.3 Staff Attendance"),
    p("Staff attendance mirrors teacher attendance in structure and status options (Present, Late, Half-Day, Leave, Absent), with the same salary implications. The staff attendance screen lists all active non-teaching staff. The monthly summary feeds directly into the staff salary processing. To streamline the daily workflow, the Admin can mark all teachers and all staff as Present with a single click on days with no absences, then individually adjust the few who are absent or late — this typically reduces the morning attendance task to under one minute."),
    h2("12.4 Attendance Locking"),
    p("To prevent backdated changes that could affect salary calculations, attendance for any past date is locked. The Admin can unlock a past date with an explicit action that records the unlock reason, the unlocking user, and the timestamp in the activity log. This ensures that any backdated attendance change — which would retroactively alter a salary calculation — is auditable. Once salary for a month has been processed and the salary slip has been generated, the attendance for that month is permanently locked and cannot be unlocked without a database-level intervention."),
  ];
}

// SECTION 15: Module 8 — Salary & Fine Management
function moduleSalary() {
  return [
    h1("13. Module 8: Salary & Fine Management"),
    p("The Salary & Fine Management module is one of the most operationally valuable modules in the system. It automatically calculates monthly salaries for teachers and staff, applying attendance-based fine deductions according to configurable rules. Before this module, schools typically calculated salaries manually in Excel at month-end — a process that consumed one to two days of the accountant's time and was prone to errors, especially when adjusting for absenteeism. This module reduces that process to under one hour, with full auditability and printable salary slips."),
    h2("13.1 Salary Components"),
    p("Each teacher and staff record has a monthly salary configuration consisting of: basic salary, allowances (house rent, conveyance, medical, etc. — configurable as a list of name-amount pairs), and any recurring deductions (e.g., provident fund, loan installment). The gross monthly salary is the sum of basic salary and all allowances. The net payable salary is gross minus recurring deductions minus attendance-based fines (calculated separately)."),
    h2("13.2 Attendance-Based Fine Rules"),
    p("The fine rules are configured in Settings and apply uniformly to all teachers and staff (with per-person overrides available if needed). The five rule types and their default values for the Pakistan region are:"),
    tableCaption("Table 6: Default Fine Rules"),
    makeTable(
      ["Status", "Description", "Default Deduction", "Editable"],
      [
        ["Present", "Full working day", "No deduction", "No"],
        ["Late", "Arrived after configured grace time", "Rs. 500 per occurrence (fixed)", "Yes"],
        ["Half-Day", "Worked half the day", "50% of one day's salary", "Yes (percentage)"],
        ["Leave", "On approved paid leave (if balance available)", "No deduction", "Yes (paid/unpaid toggle)"],
        ["Absent", "Did not report, no leave approved", "100% of one day's salary", "No"],
      ],
      [16, 36, 30, 18]
    ),
    p("The per-day salary is calculated as gross monthly salary divided by the number of working days in the month (not calendar days). Working days exclude Sundays and configured school holidays. This ensures that the deduction for an absence is fair — it deducts the salary for one working day, not one thirtieth of the monthly salary."),
    h2("13.3 Salary Calculation Workflow"),
    p("At month-end, the Accountant opens the Salary Processing screen, selects the month, and clicks Calculate All. The system runs the following calculation for each active teacher and staff member:"),
    bullet("Retrieve the gross monthly salary (basic + allowances) from the employee record."),
    bullet("Count the working days in the month (calendar days minus Sundays minus school holidays)."),
    bullet("Compute per-day salary = gross monthly salary / working days."),
    bullet("Retrieve the employee's attendance for the month from the attendance_staff table."),
    bullet("For each attendance entry, apply the corresponding fine rule: absent days × per-day salary, late occurrences × fixed late fine, half-days × 50% of per-day salary."),
    bullet("Sum all attendance-based deductions."),
    bullet("Add any recurring deductions (provident fund, loan installments) from the employee record."),
    bullet("Add any one-time bonuses or deductions entered by the Accountant for this month (e.g., Diwali bonus, performance incentive)."),
    bullet("Compute net payable = gross monthly salary - attendance deductions - recurring deductions - one-time deductions + one-time bonuses."),
    bullet("Generate a salary slip record in the salary_slips table with all components broken down."),
    p("The entire calculation for a school with one hundred employees completes in under three seconds. The Accountant reviews the generated slips on screen, makes any manual adjustments (rare), and clicks Finalize to lock the slips for the month. Finalized slips cannot be edited; corrections require a separate adjustment slip in the next month."),
    h2("13.4 Worked Example"),
    p("Consider a teacher with a gross monthly salary of Rs. 50,000 in a month with 26 working days. The per-day salary is Rs. 50,000 / 26 = Rs. 1,923 (rounded). Suppose the teacher's attendance for the month shows: 2 absences and 1 late arrival, with a late fine configured at Rs. 500. The deduction calculation is: 2 absences × Rs. 1,923 = Rs. 3,846; 1 late × Rs. 500 = Rs. 500; total deductions = Rs. 4,346. The net payable salary is Rs. 50,000 - Rs. 4,346 = Rs. 45,654. The salary slip shows each component as a line item so the teacher can verify the calculation."),
    h2("13.5 Salary Slip"),
    p("Each finalized salary slip is printable as a PDF on A4 portrait. The slip layout includes: school name and logo (from Settings), slip number (auto-generated, format SLIP-YYYYMM-NNN), employee name, designation, department, month, working days, days present, days absent, days late, half-days, per-day salary, gross salary, itemized deductions (attendance breakdown with amounts, recurring deductions, one-time deductions), itemized bonuses, and net payable in figures and words. The slip has a signature line for the employee and for the authorized signatory (principal or accountant)."),
    tableCaption("Table 7: Salary Slip Example Breakdown"),
    makeTable(
      ["Component", "Calculation", "Amount (Rs.)"],
      [
        ["Gross Monthly Salary", "Basic + Allowances", "50,000"],
        ["Working Days", "Calendar - Sundays - Holidays", "26"],
        ["Per-Day Salary", "50,000 / 26", "1,923"],
        ["Absence Deduction", "2 days × 1,923", "-3,846"],
        ["Late Deduction", "1 occurrence × 500", "-500"],
        ["Provident Fund", "Recurring deduction", "-2,000"],
        ["Performance Bonus", "One-time", "+1,000"],
        ["Net Payable", "50,000 - 3,846 - 500 - 2,000 + 1,000", "44,654"],
      ],
      [30, 40, 30]
    ),
    h2("13.6 Salary Reports"),
    p("The module provides three reports: a monthly salary summary (all employees with gross, deductions, and net in one table), a per-employee salary history (all slips for one employee across months), and a fine/deduction report (total deductions grouped by type and employee, useful for analyzing absenteeism patterns). All three reports are printable as PDF and exportable as Excel."),
  ];
}

// SECTION 16: Module 9 — Fee Management
function moduleFees() {
  return [
    h1("14. Module 9: Fee Management"),
    p("The Fee Management module handles the definition of fee structures and the daily collection of fees from students. It is the most frequently used module after the Dashboard — the Accountant uses it dozens of times per day during peak fee collection periods. The module is optimized for speed: from the moment the Accountant opens the Fee Collection screen to the moment the receipt is printed, the entire workflow is designed to take under thirty seconds per student."),
    h2("14.1 Fee Structure"),
    p("The fee structure is defined per class in Settings and consists of multiple fee types, each with its own amount. The default fee types are: Admission Fee (one-time, collected at admission), Monthly Tuition Fee (recurring, collected each month), Exam Fee (collected per term before exams), Transport Fee (optional, for students using school transport), and Other Charges (configurable — for library security deposit, sports fee, etc.). Each fee type has an amount and a frequency (one-time, monthly, per-term, annual). The fee structure can be overridden per student during admission (e.g., a sibling discount or a scholarship waiver)."),
    h2("14.2 Fee Collection Workflow"),
    p("The Fee Collection screen is the Accountant's primary working screen. It opens with the cursor focused on a student search box; the Accountant types a roll number, name, or phone number, selects the matching student from the dropdown, and the screen displays the student's outstanding fees for the current month (and any previous unpaid months). The Accountant checks the fees being paid (one or more), enters the amount received (defaulting to the full outstanding amount, editable for partial payments), selects the payment mode (Cash, Cheque, Bank Transfer, Other), and clicks Collect. The system generates a receipt number (format RCPT-YYYYMMDD-NNN, sequential per day), writes a row to the fee_collections table, updates the student's outstanding balance, and immediately displays a printable receipt preview."),
    h2("14.3 Fee Receipt"),
    p("The fee receipt is printable as a PDF on A5 (half A4) paper, suitable for both laser and thermal receipt printers. The receipt layout includes: school name and logo, receipt number, receipt date, student name, class-section, roll number, parent name, itemized fees paid with amounts, payment mode, total amount in figures and words, received-by (accountant name), and a signature line. The receipt uses the school's accent color for the header band and includes a small QR code encoding the receipt number (for future scanning to verify authenticity)."),
    h2("14.4 Discounts & Waivers"),
    p("The Accountant can apply a discount or waiver to a student's fee at collection time. Discounts can be a fixed amount or a percentage, and require a reason (sibling discount, scholarship, staff child, financial hardship). Waivers set the fee amount to zero with the same reason field. All discounts and waivers are recorded against the payment and are visible in the fee history report, ensuring transparency. Recurring discounts (e.g., staff child discount) can be configured at the student level so they apply automatically each month."),
    h2("14.5 Payment History"),
    p("Each student's profile view shows a complete payment history — a chronological list of every fee payment made, with receipt number, date, fees paid, amount, payment mode, and a Print Receipt button to reprint any past receipt. The history is also filterable by date range and fee type, and exportable to Excel for accounting reconciliation."),
    h2("14.6 Fee Settings"),
    p("The fee-related settings, configured by the Admin in the Settings module, include: the fee due date each month (e.g., the 10th of the month), the late fee amount applied after the due date (fixed or percentage of outstanding), the receipt number prefix and starting sequence, the receipt paper size (A5 or thermal 80mm), and whether partial payments are allowed (some schools require full-month payment only)."),
  ];
}

// SECTION 17: Module 10 — Fee Defaulter
function moduleDefaulters() {
  return [
    h1("15. Module 10: Fee Defaulter Module"),
    p("The Fee Defaulter module automatically identifies students whose fees are unpaid past the configured due date and presents them in a filterable, printable list. This module directly addresses one of the most painful manual tasks in school administration — the month-end defaulter list that previously required scanning every register and was often outdated by the time it was compiled. With this module, the defaulter list is generated in real time, accurate to the second, and printable in one click."),
    h2("15.1 Defaulter Detection Logic"),
    p("A student is considered a defaulter for a given month if: the monthly tuition fee for that month is unpaid, the current date is past the configured due date for that month, and the student is still Active (not Left). The detection runs as a SQL query against the fee_collections and fee_structures tables, joining with the students table to filter by status. The query is fast (under 200ms for one thousand students) and is executed on every open of the Defaulter List screen, ensuring the list always reflects the latest payment state."),
    h2("15.2 Defaulter List View"),
    p("The defaulter list view presents a table with columns: student name, roll number, class-section, parent name, parent phone, unpaid month(s), outstanding amount, and days overdue. The table supports filtering by class (one or multiple), by month (single month or range), and by minimum outstanding amount (to filter out trivial amounts). Sorting is available on every column. The default sort is by outstanding amount descending, so the largest defaulters appear at the top. A summary bar at the top shows the total count of defaulters and the total outstanding amount."),
    h2("15.3 Print & Export"),
    p("The defaulter list is printable as a PDF on A4 portrait, with the school header, the filter criteria shown at the top (e.g., \"Defaulters for June 2026, All Classes\"), the table of defaulters, and the total outstanding at the bottom. The PDF is suitable for posting on the school notice board or sharing with the principal. The list is also exportable to Excel for further analysis or for sharing with collection agents. A future v2.0 enhancement will add one-click SMS reminders to all defaulters (the phone numbers are already in the data)."),
    h2("15.4 Dashboard Integration"),
    p("The Dashboard's Fee Defaulters KPI tile shows the count of defaulters for the immediately previous month (the current month is not yet past due). Clicking the tile navigates directly to the Defaulter List screen with the previous month pre-selected, providing a one-click path from the morning dashboard view to the actionable defaulter list."),
  ];
}

// SECTION 18: Module 11 — Examination & Results
function moduleResults() {
  return [
    h1("16. Module 11: Examination & Results"),
    p("The Examination & Results module manages the creation of exams, the entry of marks by teachers, the calculation of grades and positions, and the generation of printable result cards. The module supports the typical Pakistani school exam structure — monthly tests, mid-term, and final exams — but is flexible enough to accommodate any exam naming and weighting scheme configured by the Admin."),
    h2("16.1 Create Exam"),
    p("The Admin creates an exam by specifying: exam name (e.g., Mid-Term Examination 2026), exam type (Monthly / Mid-Term / Final), academic session, start and end dates, and the classes to which the exam applies. Each exam has a result publication date, before which marks are hidden from the result card view (teachers can still enter marks; they just cannot print result cards until the publication date)."),
    h2("16.2 Marks Entry"),
    p("Teachers enter marks through a dedicated screen that shows their assigned classes and subjects. Selecting a class-subject-exam combination opens a grid with one row per student and columns for obtained marks, total marks (pre-filled from the subject-class configuration), and remarks. The teacher enters the obtained marks for each student, with validation that the value is between zero and the total marks. The grid supports keyboard-only navigation (Enter to move to next row, Tab to move to remarks), allowing fast entry of marks for a class of forty students in under five minutes. Marks can be saved as draft and finalized later; once finalized, edits require an unlock action by the Admin."),
    h2("16.3 Grade & Position Calculation"),
    p("After all marks for an exam are entered, the Admin (or a designated teacher) triggers grade and position calculation. The system computes, for each student: total obtained marks, total maximum marks, percentage, grade (per the configured grade bands), subject-wise pass/fail status, and class position (rank by total, with tie-breaking by subject marks if configured). The default grade bands for the percentage system are: A+ (90% and above), A (80–89%), B (70–79%), C (60–69%), D (50–59%), E (40–49%), F (below 40%, fail). These bands are configurable in Settings."),
    h2("16.4 Result Card"),
    p("The result card is printable as a PDF on A4 portrait, one card per student. The card layout includes: school name and logo, exam name and date, student name, class-section, roll number, a table of subjects with obtained marks / total marks / grade / pass-fail, total marks, percentage, overall grade, class position, attendance percentage for the term, and a remarks section. The card has signature lines for the class teacher and the principal. The result card generation for an entire class (forty students) completes in under ten seconds and produces a single PDF with one page per student."),
  ];
}

// SECTION 19: Module 12 — Certificates
function moduleCertificates() {
  return [
    h1("17. Module 12: Certificate Module"),
    p("The Certificate module generates the four most commonly issued school certificates: School Leaving Certificate, Character Certificate, Bonafide Student Certificate, and Fee Paid Certificate. Each certificate is generated from a template with the school's letterhead, auto-filled with the student's data, and printable on A4. The module eliminates the manual typing of certificates — which previously took five to ten minutes each — and reduces it to under thirty seconds."),
    h2("17.1 Certificate Templates"),
    p("Each certificate type has a built-in template that includes the school letterhead (logo, name, address, phone), a title (e.g., \"School Leaving Certificate\"), a body paragraph with placeholders for student name, father's name, class, roll number, dates, and a signature block with the principal's name and a signature line. The templates use formal, standard wording appropriate to each certificate type. A future v2.0 enhancement will add a template editor allowing the school to customize the wording."),
    h2("17.2 School Leaving Certificate"),
    p("The School Leaving Certificate (also called Transfer Certificate) is issued when a student leaves the school. It certifies the student's name, father's name, date of birth, class last studied, academic session, date of leaving, character during the stay, and any fees due. The certificate can only be generated for students who have been marked as Left in the Student Management module; this prevents issuing a leaving certificate to a current student."),
    h2("17.3 Character Certificate"),
    p("The Character Certificate certifies that the named student is of good moral character, to the best of the school's knowledge, during their period of study. It is typically issued to students applying for higher education or jobs. The certificate includes the student's name, father's name, class, academic session, and date of issue."),
    h2("17.4 Bonafide Certificate"),
    p("The Bonafide Certificate certifies that the named student is a bona fide (genuine) student of the school, currently enrolled in a specified class. It is typically issued for opening a bank account, applying for a passport, or participating in external competitions. The certificate includes the student's name, father's name, class-section, roll number, academic session, and date of issue."),
    h2("17.5 Fee Paid Certificate"),
    p("The Fee Paid Certificate certifies that the named student has paid all fees up to a specified month. It is typically required for visa applications or for transferring to another school. The certificate pulls the student's payment history from the Fee Management module and verifies that all dues are cleared before allowing generation. If any dues are outstanding, the system blocks generation with a clear message indicating the outstanding amount."),
    h2("17.6 Certificate Numbering"),
    p("Each issued certificate is assigned a sequential certificate number with a configurable prefix (e.g., CERT-2026-001). The number is stored in the certificates table along with the certificate type, student ID, issue date, and issuing user. This provides a complete audit trail of every certificate ever issued, searchable in the Reports module."),
  ];
}

module.exports = {
  moduleAttendance,
  moduleSalary,
  moduleFees,
  moduleDefaulters,
  moduleResults,
  moduleCertificates,
};
