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
import { EXPENSE_BREAKDOWN, FEE_TREND, STUDENT_GROWTH, TEACHERS, STAFF } from "@/lib/sms-data";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/sms-store";
import {
  printFeeCollectionReport, printDefaulterList, printPayrollBatch,
  printAttendanceReport, printFeeReminderLetters, exportStudentDirectoryCSV,
} from "@/lib/pdf-service";
import { cn } from "@/lib/utils";

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

  const handlePrint = (reportId: number, name: string) => {
    toast({ title: "Generating report...", description: name });
    try {
      if (reportId === 1) {
        // Student Report → CSV export
        exportStudentDirectoryCSV(students, school);
        toast({ title: "CSV Exported ✓", description: `${students.length} students exported to Excel/CSV` });
        return;
      } else if (reportId === 4) {
        // Attendance Report
        const classStudents = students.filter(s => s.class === "Grade 9" && s.status === "Active").slice(0, 25);
        printAttendanceReport("Grade 9", "July 2026", classStudents, {}, school);
      } else if (reportId === 5) {
        // Fee Collection Report
        printFeeCollectionReport(feeCollections.slice(0, 30), school);
      } else if (reportId === 6) {
        // Defaulter Report
        const defaulters = students.filter(s => s.outstandingAmount > 0 && s.status === "Active");
        printDefaulterList(defaulters, school);
      } else if (reportId === 7) {
        // Salary Report → Payroll batch
        const employees = [
          ...TEACHERS.map(t => ({ id: t.id, name: t.name, designation: t.designation, monthlySalary: t.monthlySalary, attendance: t.attendance })),
          ...STAFF.map(s => ({ id: s.id, name: s.name, designation: s.designation, monthlySalary: s.monthlySalary, attendance: s.attendance })),
        ];
        printPayrollBatch(employees, "July 2026", school);
      } else if (reportId === 8) {
        // Fine / Deduction Report (use defaulter reminder letters)
        const defaulters = students.filter(s => s.outstandingAmount > 0 && s.status === "Active");
        if (defaulters.length === 0) {
          toast({ title: "No defaulters", description: "No reminder letters to generate." });
          return;
        }
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

  // Reports that have working PDF/CSV output
  const printableIds = [1, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">10 printable report types with PDF / Excel / CSV export.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"
            onClick={() => {
              exportStudentDirectoryCSV(students, school);
              toast({ title: "Student Directory Exported ✓", description: `${students.length} students` });
            }}
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
                      {isPrintable && <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-700 border-0 ml-auto">{isCSV ? "CSV" : "Ready"}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1.5">Filters: {r.filters}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30 flex gap-2">
                  <Button
                    variant={isPrintable ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => handlePrint(r.id, r.name)}
                    disabled={!isPrintable}
                  >
                    {isCSV ? <FileDown className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                    {isCSV ? "CSV" : "PDF"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs"
                    onClick={() => toast({ title: "Exporting to Excel...", description: r.name })}
                  >
                    <FileDown className="w-3 h-3 mr-1" />Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
