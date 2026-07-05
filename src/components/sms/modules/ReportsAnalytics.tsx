"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, FileText, FileDown, Printer, Users, GraduationCap, UserCog,
  ClipboardCheck, DollarSign, AlertTriangle, Wallet, TrendingDown,
  BookOpen, CalendarDays,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart,
} from "recharts";
import { EXPENSE_BREAKDOWN, FEE_TREND, STUDENT_GROWTH, TEACHERS, STAFF, CLASSES, STUDENTS, EXAMS, SUBJECTS } from "@/lib/sms-data";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/sms-store";
import {
  printFeeCollectionReport, printDefaulterList, printPayrollBatch,
  printAttendanceReport, printFeeReminderLetters, exportStudentDirectoryCSV,
  printResultCard, printExamSeatingPlan,
} from "@/lib/pdf-service";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const REPORTS = [
  { id: 1, name: "Student Report", desc: "Complete student directory with contact info", icon: Users, color: "bg-primary/10 text-primary", filters: "Class, Status, Date" },
  { id: 2, name: "Teacher Report", desc: "Teacher profiles with subjects and classes", icon: GraduationCap, color: "bg-purple-500/10 text-purple-600", filters: "Status, Joining Date" },
  { id: 3, name: "Staff Report", desc: "Non-teaching staff directory", icon: UserCog, color: "bg-accent/10 text-accent", filters: "Department" },
  { id: 4, name: "Attendance Report", desc: "Daily/monthly attendance summary", icon: ClipboardCheck, color: "bg-emerald-500/10 text-emerald-600", filters: "Group, Class, Month" },
  { id: 5, name: "Fee Collection Report", desc: "All fee collections with breakdown", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-600", filters: "Date, Class, Mode" },
  { id: 6, name: "Fee Defaulter Report", desc: "Students with outstanding fees", icon: AlertTriangle, color: "bg-red-500/10 text-red-600", filters: "Month, Class" },
  { id: 7, name: "Salary Report", desc: "Monthly payroll summary", icon: Wallet, color: "bg-primary/10 text-primary", filters: "Month, Department" },
  { id: 8, name: "Fine / Deduction Report", desc: "All salary deductions by type", icon: TrendingDown, color: "bg-orange-500/10 text-orange-700", filters: "Month, Type" },
  { id: 9, name: "Result Report", desc: "Exam results with grades and positions", icon: BookOpen, color: "bg-blue-500/10 text-blue-700", filters: "Exam, Class" },
  { id: 10, name: "Monthly Summary", desc: "One-page KPI snapshot for principal", icon: CalendarDays, color: "bg-accent/10 text-accent", filters: "Month" },
];

export function ReportsModule() {
  const { toast } = useToast();
  const { feeCollections, students, school } = useAppStore();
  const [filterOpen, setFilterOpen] = useState<number | null>(null);

  // Filter state
  const [attClass, setAttClass] = useState("Grade 9");
  const [attMonth, setAttMonth] = useState("July 2026");
  const [resultClass, setResultClass] = useState("Grade 9");
  const [resultStudent, setResultStudent] = useState("");
  const [resultExam, setResultExam] = useState(EXAMS[0].id);

  const handlePrint = (reportId: number, name: string) => {
    // Reports with filters need the filter dialog
    if (reportId === 4 || reportId === 9) {
      setFilterOpen(reportId);
      return;
    }
    toast({ title: "Generating report...", description: name });
    try {
      if (reportId === 1) {
        exportStudentDirectoryCSV(students, school);
        toast({ title: "CSV Exported ✓", description: `${students.length} students exported to Excel/CSV` });
        return;
      } else if (reportId === 5) {
        printFeeCollectionReport(feeCollections.slice(0, 30), school);
      } else if (reportId === 6) {
        const defaulters = students.filter(s => s.outstandingAmount > 0 && s.status === "Active");
        printDefaulterList(defaulters, school);
      } else if (reportId === 7) {
        const employees = [
          ...TEACHERS.map(t => ({ id: t.id, name: t.name, designation: t.designation, monthlySalary: t.monthlySalary, attendance: t.attendance })),
          ...STAFF.map(s => ({ id: s.id, name: s.name, designation: s.designation, monthlySalary: s.monthlySalary, attendance: s.attendance })),
        ];
        printPayrollBatch(employees, "July 2026", school);
      } else if (reportId === 8) {
        const defaulters = students.filter(s => s.outstandingAmount > 0 && s.status === "Active");
        if (defaulters.length === 0) { toast({ title: "No defaulters", description: "No reminder letters to generate." }); return; }
        printFeeReminderLetters(defaulters, school, "July 2026");
        toast({ title: "Reminder letters generated ✓", description: `${defaulters.length} letters` });
        return;
      } else {
        toast({ title: "PDF ready ✓", description: `${name} — demo` });
      }
    } catch (e) {
      toast({ title: "Print failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  const generateAttendanceReport = () => {
    const classStudents = students.filter(s => s.class === attClass && s.status === "Active").slice(0, 30)
      .map(s => ({ rollNo: s.rollNo, name: s.name }));
    toast({ title: "Generating attendance report...", description: `${attClass} • ${attMonth}` });
    printAttendanceReport(attClass, attMonth, classStudents, {}, school);
    setFilterOpen(null);
  };

  const generateResultCard = () => {
    const targetStudent = resultStudent
      ? students.find(s => s.id === resultStudent)
      : students.find(s => s.class === resultClass && s.status === "Active");
    if (!targetStudent) { toast({ title: "No student found", variant: "destructive" }); return; }

    const exam = EXAMS.find(e => e.id === resultExam);
    const examName = exam?.name || "Exam";
    // Generate mock marks
    const subjects = SUBJECTS.slice(0, 6).map(subj => {
      const obtained = 55 + (targetStudent.name.length + subj.length * 3) % 45;
      return { subject: subj, obtained, total: 100 };
    });
    const total = subjects.reduce((s, sub) => s + sub.obtained, 0);
    const maxTotal = subjects.reduce((s, sub) => s + sub.total, 0);
    const pct = Math.round((total / maxTotal) * 100);
    const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";

    toast({ title: "Generating result card...", description: `${targetStudent.name} • ${examName}` });
    printResultCard(targetStudent, examName, subjects, total, maxTotal, pct, grade, 1, school);
    setFilterOpen(null);
  };

  const printableIds = [1, 4, 5, 6, 7, 8, 9];

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">10 printable report types with PDF / Excel / CSV export. Filter by class or student.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"
            onClick={() => { exportStudentDirectoryCSV(students, school); toast({ title: "Student Directory Exported ✓", description: `${students.length} students` }); }}
          >
            <FileDown className="w-4 h-4 mr-1.5" />Export All Students
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(r => {
          const Icon = r.icon;
          const isPrintable = printableIds.includes(r.id);
          const isCSV = r.id === 1;
          const hasFilter = r.id === 4 || r.id === 9;
          return (
            <Card key={r.id} className={cn("border-0 shadow-sm glass-card transition-shadow", isPrintable ? "card-hover hover:shadow-md ring-1 ring-primary/10" : "")}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("rounded-xl p-2.5", r.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">#{r.id}</span>
                      <p className="font-semibold text-sm">{r.name}</p>
                      {isPrintable && <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-700 border-0 ml-auto">{isCSV ? "CSV" : hasFilter ? "Filter" : "Ready"}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1.5">Filters: {r.filters}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30 flex gap-2">
                  <Button variant={isPrintable ? "default" : "outline"} size="sm" className="flex-1 h-7 text-xs" onClick={() => handlePrint(r.id, r.name)} disabled={!isPrintable}>
                    {isCSV ? <FileDown className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                    {isCSV ? "CSV" : hasFilter ? "Filter & Print" : "PDF"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => toast({ title: "Exporting to Excel...", description: r.name })}>
                    <FileDown className="w-3 h-3 mr-1" />Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attendance Report Filter Dialog */}
      <Dialog open={filterOpen === 4} onOpenChange={(o) => !o && setFilterOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" />Attendance Report — Filter</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Class</Label>
              <Select value={attClass} onValueChange={setAttClass}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month</Label>
              <Select value={attMonth} onValueChange={setAttMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="July 2026">July 2026</SelectItem>
                  <SelectItem value="June 2026">June 2026</SelectItem>
                  <SelectItem value="May 2026">May 2026</SelectItem>
                  <SelectItem value="April 2026">April 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
              <p className="font-medium text-primary">Report includes:</p>
              <p className="text-muted-foreground mt-1">• 30-day grid (P/A/L/Lv per day)<br/>• Present/Absent counts per student<br/>• Attendance percentage<br/>• Color-coded status cells</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterOpen(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={generateAttendanceReport}>
              <Printer className="w-4 h-4 mr-1.5" />Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Card Filter Dialog */}
      <Dialog open={filterOpen === 9} onOpenChange={(o) => !o && setFilterOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Result Card — Filter</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Exam</Label>
              <Select value={resultExam} onValueChange={setResultExam}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXAMS.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={resultClass} onValueChange={(v) => { setResultClass(v); setResultStudent(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Specific Student (optional — leave empty for first in class)</Label>
              <Select value={resultStudent} onValueChange={setResultStudent}>
                <SelectTrigger><SelectValue placeholder="Any student in class..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {students.filter(s => s.class === resultClass && s.status === "Active").map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} • Roll #{s.rollNo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
              <p className="font-medium text-primary">Result card includes:</p>
              <p className="text-muted-foreground mt-1">• Student name, class, roll, ID<br/>• Subject-wise marks with grades<br/>• Total, percentage, overall grade<br/>• Class position + attendance %<br/>• Remarks + triple signatures</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterOpen(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={generateResultCard}>
              <Printer className="w-4 h-4 mr-1.5" />Generate Result Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS MODULE
// ─────────────────────────────────────────────────────────────

const ATTENDANCE_DATA = [
  { name: "Present", value: 580, color: "#15857A" },
  { name: "Late", value: 32, color: "#EAB308" },
  { name: "Half-Day", value: 8, color: "#FF6A3B" },
  { name: "Absent", value: 18, color: "#EF4444" },
  { name: "Leave", value: 12, color: "#94A3B8" },
];

const PNL_DATA = [
  { month: "Feb", income: 142000, expense: 280000, profit: -138000 },
  { month: "Mar", income: 138000, expense: 280000, profit: -142000 },
  { month: "Apr", income: 155000, expense: 295000, profit: -140000 },
  { month: "May", income: 148000, expense: 280000, profit: -132000 },
  { month: "Jun", income: 162000, expense: 285000, profit: -123000 },
  { month: "Jul", income: 185000, expense: 290000, profit: -105000 },
];

export function AnalyticsModule() {
  return (
    <div className="space-y-4">
      {/* Hero stats */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <p className="font-semibold">School Performance Analytics</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-xs text-muted-foreground">Avg Daily Attendance</p><p className="text-2xl font-bold text-primary">94.2%</p></div>
            <div><p className="text-xs text-muted-foreground">Fee Collection Rate</p><p className="text-2xl font-bold text-emerald-600">87%</p></div>
            <div><p className="text-xs text-muted-foreground">Avg Class Size</p><p className="text-2xl font-bold">28.5</p></div>
            <div><p className="text-xs text-muted-foreground">Monthly Profit/Loss</p><p className="text-2xl font-bold text-red-600">-Rs. 105K</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee collection trend */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Fee Collection vs Pending</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={FEE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.5 0.015 200)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.015 200)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="collected" fill="#15857A" radius={[4, 4, 0, 0]} name="Collected" />
                <Bar dataKey="pending" fill="#FF6A3B" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense breakdown pie */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Salary Expense by Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={EXPENSE_BREAKDOWN} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                  {EXPENSE_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student growth */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Student Growth Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={STUDENT_GROWTH}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15857A" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#15857A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.5 0.015 200)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.015 200)" fontSize={11} tickLine={false} axisLine={false} domain={[400, 480]} />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="students" stroke="#15857A" strokeWidth={2} fill="url(#growthGrad)" name="Students" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance distribution */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Attendance Distribution (July)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ATTENDANCE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {ATTENDANCE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* P&L chart full width */}
      <Card className="border-0 shadow-sm glass-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Profit & Loss Summary</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PNL_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.5 0.015 200)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.5 0.015 200)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="income" stroke="#15857A" strokeWidth={2} name="Income" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="expense" stroke="#FF6A3B" strokeWidth={2} name="Expense" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="profit" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Profit/Loss" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
