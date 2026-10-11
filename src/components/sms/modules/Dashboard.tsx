"use client";

import { useAppStore, localDateStr } from "@/lib/sms-store";
import { useNowTick } from "@/lib/use-now-tick";
import { STATS, FEE_TREND, STUDENT_GROWTH, ACTIVITIES, TODAY_SCHEDULE, UPCOMING_BIRTHDAYS, PENDING_TASKS, CONCESSIONS } from "@/lib/sms-data";
import { KpiCard } from "../KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, GraduationCap, UserCog, ClipboardCheck, DollarSign,
  TrendingUp, AlertTriangle, Wallet, Plus, Receipt, ClipboardList,
  FileText, Activity as ActivityIcon, Cake, Calendar, Clock,
  CheckCircle2, Circle, ArrowRight, Sparkles, School, ArrowUpRight,
  ArrowDownRight, Bus, Home, BookOpen, Shield, Zap, Award,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Line, LineChart, RadialBarChart,
  RadialBar, PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const ACTIVITY_COLORS: Record<string, string> = {
  fee: "bg-emerald-500",
  attendance: "bg-primary",
  admission: "bg-purple-500",
  salary: "bg-accent",
  certificate: "bg-yellow-500",
  system: "bg-muted-foreground",
};

const ACTIVITY_ICONS: Record<string, any> = {
  fee: DollarSign, attendance: ClipboardCheck, admission: UserCog,
  salary: Wallet, certificate: FileText, system: ActivityIcon,
};

const SCHEDULE_STATUS: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  completed: { color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Done", dot: "bg-emerald-500" },
  "in-progress": { color: "text-primary", bg: "bg-primary/10", label: "LIVE", dot: "bg-primary animate-pulse" },
  upcoming: { color: "text-muted-foreground", bg: "bg-muted", label: "Next", dot: "bg-muted-foreground/30" },
  break: { color: "text-accent", bg: "bg-accent/10", label: "Break", dot: "bg-accent" },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function DashboardModule() {
  useNowTick(); // Force re-render every 60s so date-based KPIs update at midnight
  const { setActiveModule, school, feeCollections, students, teachers, staff, transactions, attendanceRecords, classes, feeStructure } = useAppStore();

  // ─── Compute ALL KPIs from real store data ───
  const todayStr = localDateStr();
  const activeStudents = students.filter(s => s.status === "Active");
  const defaulters = students.filter(s => (s.outstandingAmount || 0) > 0 && s.status === "Active");
  const todayCollections = feeCollections.filter(f => f.date === todayStr);
  const todayFeeCollection = todayCollections.reduce((s, f) => s + f.amount, 0);

  // Today's attendance: from attendanceRecords for today
  const todayAtt = attendanceRecords.filter(r => r.date === todayStr);
  const presentToday = todayAtt.filter(r => r.status === "Present" || r.status === "Late").length;
  const todayAttendancePct = todayAtt.length > 0 ? Math.round((presentToday / todayAtt.length) * 100) : 0;

  // Monthly income: sum of this month's fee collections + income transactions
  const monthStr = todayStr.slice(0, 7); // YYYY-MM
  const monthlyFeeIncome = feeCollections.filter(f => f.date.startsWith(monthStr)).reduce((s, f) => s + f.amount, 0);
  const monthlyOtherIncome = transactions.filter(t => t.type === "Income" && t.date.startsWith(monthStr)).reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = monthlyFeeIncome + monthlyOtherIncome;

  // Pending fees: total outstanding across active students
  const pendingFees = defaulters.reduce((s, d) => s + (d.outstandingAmount || 0), 0);

  const KPI = {
    totalStudents: activeStudents.length,
    totalTeachers: teachers.length,
    totalStaff: staff.length,
    todayAttendancePct,
    todayFeeCollection,
    monthlyIncome,
    pendingFees,
    defaultersCount: defaulters.length,
  };

  // ─── Real fee trend — last 6 months from store ───
  const feeTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const ms = d.toISOString().slice(0, 7);
    const collected = feeCollections.filter(f => f.date.startsWith(ms)).reduce((s, f) => s + f.amount, 0);
    return {
      month: d.toLocaleDateString("en-GB", { month: "short" }),
      collected: Math.round(collected / 1000), // in thousands
      pending: Math.round(pendingFees / 1000),
    };
  });

  // ─── Real student growth — last 6 months from admissionDate ───
  const studentGrowth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const ms = d.toISOString().slice(0, 7);
    const count = students.filter(s => s.admissionDate && s.admissionDate.startsWith(ms)).length;
    const cumulative = students.filter(s => s.admissionDate && s.admissionDate <= ms + "-31").length;
    return { month: d.toLocaleDateString("en-GB", { month: "short" }), students: count, total: cumulative };
  });

  const quickActions = [
    { label: "Collect Fee", desc: "New receipt", icon: Receipt, module: "fees" as const, color: "bg-emerald-500/10 text-emerald-600", border: "hover:border-emerald-500/30" },
    { label: "Attendance", desc: "Mark today", icon: ClipboardList, module: "attendance" as const, color: "bg-primary/10 text-primary", border: "hover:border-primary/30" },
    { label: "Add Student", desc: "New admission", icon: Plus, module: "students" as const, color: "bg-purple-500/10 text-purple-600", border: "hover:border-purple-500/30" },
    { label: "Reports", desc: "Print PDF", icon: FileText, module: "reports" as const, color: "bg-accent/10 text-accent", border: "hover:border-accent/30" },
    { label: "Library", desc: "Issue book", icon: BookOpen, module: "library" as const, color: "bg-blue-500/10 text-blue-600", border: "hover:border-blue-500/30" },
    { label: "Events", desc: "View calendar", icon: Calendar, module: "events" as const, color: "bg-pink-500/10 text-pink-600", border: "hover:border-pink-500/30" },
  ];

  const kpiClick = (module: "defaulters" | "fees" | "students" | "attendance") => () => setActiveModule(module);

  // Mini data for sparkline
  const attendanceSpark = [
    { day: "M", val: 92 }, { day: "T", val: 88 }, { day: "W", val: 95 },
    { day: "T", val: 90 }, { day: "F", val: 93 }, { day: "S", val: 87 },
  ];

  const feeSpark = [
    { day: "M", val: 12 }, { day: "T", val: 18 }, { day: "W", val: 8 },
    { day: "T", val: 15 }, { day: "F", val: 22 }, { day: "S", val: 18 },
  ];

  return (
    <div className="space-y-3 fade-in">
      {/* ═══ Hero Banner ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 p-4 text-primary-foreground shadow-lg">
        <div className="absolute inset-0 opacity-10 pattern-grid" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/25 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2" />
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />
        <div className="relative flex items-start gap-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center overflow-hidden ring-4 ring-white/20 shadow-2xl shrink-0">
            {school.logo ? (
              <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <School className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs opacity-90">Assalam-o-Alaikum, welcome back 👋</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 font-medium backdrop-blur-sm">
                <Sparkles className="w-2.5 h-2.5 inline mr-1" />Session {school.session}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 font-medium flex items-center gap-1 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-1 tracking-tight">{school.name}</h2>
            <p className="text-sm opacity-80 mt-0.5">{school.tagline}</p>
            {/* Inline mini stats */}
            <div className="flex gap-4 mt-3">
              <div>
                <p className="text-2xl font-bold tabular-nums">{KPI.totalStudents}</p>
                <p className="text-[10px] uppercase opacity-60 tracking-wider">Students</p>
              </div>
              <div className="border-l border-white/15 pl-5">
                <p className="text-2xl font-bold tabular-nums">{KPI.totalTeachers + KPI.totalStaff}</p>
                <p className="text-[10px] uppercase opacity-60 tracking-wider">Staff</p>
              </div>
              <div className="border-l border-white/15 pl-5">
                <p className="text-2xl font-bold tabular-nums">{KPI.todayAttendancePct}%</p>
                <p className="text-[10px] uppercase opacity-60 tracking-wider">Today Att.</p>
              </div>
              <div className="border-l border-white/15 pl-5">
                <p className="text-2xl font-bold tabular-nums">Rs. {(KPI.todayFeeCollection / 1000).toFixed(0)}K</p>
                <p className="text-[10px] uppercase opacity-60 tracking-wider">Today Coll.</p>
              </div>
            </div>
            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => setActiveModule("fees")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold transition-all hover:scale-105 backdrop-blur-sm shadow-sm">
                <Receipt className="w-3.5 h-3.5" /> Collect Fee
              </button>
              <button onClick={() => setActiveModule("attendance")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all hover:scale-105 border border-white/20 backdrop-blur-sm">
                <ClipboardList className="w-3.5 h-3.5" /> Mark Attendance
              </button>
              <button onClick={() => setActiveModule("students")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all hover:scale-105 border border-white/20 backdrop-blur-sm">
                <Plus className="w-3.5 h-3.5" /> New Admission
              </button>
              <button onClick={() => setActiveModule("defaulters")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/25 hover:bg-accent/35 text-xs font-semibold transition-all hover:scale-105 border border-accent/30 backdrop-blur-sm">
                <AlertTriangle className="w-3.5 h-3.5" /> {KPI.defaultersCount} Defaulters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ KPI Row 1 — Primary Stats ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={kpiClick("students")} className="text-left">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Students</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{KPI.totalStudents}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active enrollment</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            {/* Mini sparkline */}
            <div className="mt-2 h-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentGrowth}>
                  <defs><linearGradient id="sparkStudents" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#15857A" stopOpacity={0.4} /><stop offset="95%" stopColor="#15857A" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="students" stroke="#15857A" strokeWidth={1.5} fill="url(#sparkStudents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </button>

        <button onClick={kpiClick("attendance")} className="text-left group">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-3 shadow-sm ">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Attendance</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">{KPI.todayAttendancePct}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mark today's attendance</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/10 transition-colors">
                <ClipboardCheck className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="mt-2 h-6 flex items-end gap-1">
              {attendanceSpark.map((d, i) => (
                <div key={i} className="flex-1 rounded-sm bg-yellow-500/30 hover:bg-yellow-500/50 transition-colors" style={{ height: `${d.val}%` }} title={`${d.day}: ${d.val}%`} />
              ))}
            </div>
          </div>
        </button>

        <button onClick={kpiClick("fees")} className="text-left group">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-3 shadow-sm ">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Collection</p>
                <p className="text-2xl font-bold mt-1 tabular-nums">Rs. {KPI.todayFeeCollection.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{todayCollections.length} receipts today</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <DollarSign className="w-4 h-4 text-accent" />
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="mt-2 h-6 flex items-end gap-1">
              {feeSpark.map((d, i) => (
                <div key={i} className="flex-1 rounded-sm bg-accent/30 hover:bg-accent/50 transition-colors" style={{ height: `${(d.val / 22) * 100}%` }} title={`${d.day}: Rs. ${d.val}K`} />
              ))}
            </div>
          </div>
        </button>

        <button onClick={kpiClick("defaulters")} className="text-left group">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-3 shadow-sm ">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fee Defaulters</p>
                <p className="text-2xl font-bold mt-1 tabular-nums text-red-600">{KPI.defaultersCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Past due date</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-red-600 font-medium">
                  <AlertTriangle className="w-3 h-3" /> Needs follow-up
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
            {/* Progress bar showing collection rate */}
            <div className="mt-2">
              <div className="flex justify-between text-[9px] text-muted-foreground mb-1"><span>Collection Rate</span><span>{KPI.totalStudents > 0 ? Math.round((1 - KPI.defaultersCount / KPI.totalStudents) * 100) : 0}%</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full" style={{ width: `${KPI.totalStudents > 0 ? Math.round(Math.max(0, 1 - KPI.defaultersCount / KPI.totalStudents) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* ═══ KPI Row 2 — Secondary Stats ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-purple-600" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Teaching Staff</p><p className="text-lg font-bold">{KPI.totalTeachers}</p></div>
        </div>
        <button onClick={() => setActiveModule("classes")} className="rounded-xl border border-border/40 bg-card p-3 shadow-sm flex items-center gap-3 text-left hover:bg-muted/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><School className="w-4 h-4 text-primary" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Classes</p><p className="text-lg font-bold">{classes.length}</p></div>
        </button>
        <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Monthly Income</p><p className="text-lg font-bold">Rs. {(KPI.monthlyIncome / 1000).toFixed(0)}K</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center"><Wallet className="w-4 h-4 text-pink-600" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Pending Fees</p><p className="text-lg font-bold text-red-600">Rs. {(KPI.pendingFees / 1000).toFixed(1)}K</p></div>
        </div>
      </div>

      {/* ═══ Fee Breakdown Card ═══ */}
      {defaulters.length > 0 && (
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                Fee Collection Status
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveModule("defaulters")}>
                View Defaulters <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Outstanding */}
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Total Outstanding</p>
                <p className="text-lg font-bold text-red-600 mt-1">Rs. {KPI.pendingFees.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{defaulters.length} students owe fees</p>
              </div>
              {/* Expected Monthly Revenue */}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Expected Monthly</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">Rs. {activeStudents.reduce((s, st) => s + st.monthlyFee, 0).toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{activeStudents.length} × monthly tuition</p>
              </div>
              {/* Collected This Month */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Collected This Month</p>
                <p className="text-lg font-bold text-primary mt-1">Rs. {monthlyFeeIncome.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{feeCollections.filter(f => f.date.startsWith(todayStr.slice(0, 7))).length} receipts</p>
              </div>
              {/* Collection Rate */}
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                <p className="text-[10px] uppercase text-muted-foreground font-semibold">Collection Rate</p>
                <p className="text-lg font-bold text-accent mt-1">{KPI.totalStudents > 0 ? Math.round(Math.max(0, (1 - defaulters.length / KPI.totalStudents) * 100)) : 0}%</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{KPI.totalStudents - defaulters.length} of {KPI.totalStudents} paid</p>
              </div>
            </div>

            {/* Fee breakdown by type */}
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Fee Breakdown by Type</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-muted/20 p-2 text-center">
                  <p className="text-[9px] text-muted-foreground">One-Time Fees</p>
                  <p className="font-bold text-sm mt-0.5">Rs. {(() => {
                    const items = (feeStructure as any).feeItems || [];
                    return items.filter((f: any) => f.enabled && f.type === "one-time").reduce((s: number, f: any) => s + f.amount * activeStudents.length, 0);
                  })().toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">admission + security</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-2 text-center">
                  <p className="text-[9px] text-muted-foreground">Annual Fees</p>
                  <p className="font-bold text-sm mt-0.5">Rs. {(() => {
                    const items = (feeStructure as any).feeItems || [];
                    return items.filter((f: any) => f.enabled && f.type === "annual").reduce((s: number, f: any) => s + f.amount * activeStudents.length, 0);
                  })().toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">registration + exam</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-2 text-center">
                  <p className="text-[9px] text-muted-foreground">Monthly Fees</p>
                  <p className="font-bold text-sm mt-0.5">Rs. {activeStudents.reduce((s, st) => s + st.monthlyFee, 0).toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">tuition per month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Concession / Scholarship Summary ═══ */}
      {(() => {
        const activeConcessions = CONCESSIONS.filter(c => c.status === "Active");
        const totalSaving = activeConcessions.reduce((s, c) => s + c.monthlySaving, 0);
        const studentsBenefited = new Set(activeConcessions.map(c => c.studentId)).size;
        if (activeConcessions.length === 0) return null;
        return (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Active Concessions</p>
                <p className="text-lg font-bold">{activeConcessions.length} scholarships & discounts</p>
              </div>
              <div className="border-l border-border/30 pl-4">
                <p className="text-xs text-muted-foreground">Students Benefited</p>
                <p className="text-lg font-bold">{studentsBenefited}</p>
              </div>
              <div className="border-l border-border/30 pl-4">
                <p className="text-xs text-muted-foreground">Monthly Saving</p>
                <p className="text-lg font-bold text-emerald-600">Rs. {totalSaving.toLocaleString()}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7 shrink-0" onClick={() => setActiveModule("concession")}>
              View Details <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        );
      })()}

      {/* ═══ Charts Row ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fee Collection Trend — 2/3 width */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Fee Collection Trend
              </CardTitle>
              <p className="text-xs text-muted-foreground">Collected vs pending — last 6 months</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveModule("analytics")}>
              View Analytics <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={feeTrend}>
                <defs>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15857A" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#15857A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6A3B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF6A3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="collected" stroke="#15857A" strokeWidth={2.5} fill="url(#collectedGrad)" name="Collected" />
                <Area type="monotone" dataKey="pending" stroke="#FF6A3B" strokeWidth={2.5} fill="url(#pendingGrad)" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Schedule — 1/3 width */}
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Today's Schedule</CardTitle>
              <p className="text-xs text-muted-foreground">Grade 9-A • Live</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveModule("timetable")}>
              Full <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {TODAY_SCHEDULE.map((s, i) => {
              const style = SCHEDULE_STATUS[s.status];
              return (
                <div key={i} className={cn("flex items-center gap-3 p-2 rounded-xl border transition-all hover:scale-[1.02]", style.bg, s.status === "in-progress" ? "border-primary/30 ring-1 ring-primary/20" : "border-border/40")}>
                  <div className={cn("w-1 h-8 rounded-full shrink-0", style.dot)} />
                  <div className="text-center shrink-0 w-10">
                    <p className="text-[9px] text-muted-foreground">{s.time}</p>
                    <p className={cn("text-xs font-bold", style.color)}>{s.period}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.subject}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.teacher} • {s.room}</p>
                  </div>
                  {s.status === "in-progress" ? (
                    <Badge className="text-[9px] bg-primary text-primary-foreground border-0 animate-pulse">LIVE</Badge>
                  ) : s.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Badge variant="outline" className={cn("text-[9px] border-0", style.color, style.bg)}>{style.label}</Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Quick Actions + Recent Activity ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-accent" />Quick Actions</CardTitle>
            <p className="text-xs text-muted-foreground">One-click access</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => setActiveModule(action.module)}
                  className={cn("flex flex-col items-start gap-2 p-3 rounded-xl border border-border/40 transition-all card-hover text-left", action.border)}
                >
                  <div className={cn("rounded-lg p-2", action.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent activity — 2/3 width */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-primary" /> Recent Activities
              </CardTitle>
              <p className="text-xs text-muted-foreground">Latest 7 events in the system</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => setActiveModule("reports")}>View all</Button>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[220px] overflow-y-auto">
            {ACTIVITIES.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <ActivityIcon className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                No recent activity yet. Actions you take will appear here.
              </div>
            ) : ACTIVITIES.map(act => {
              const Icon = ACTIVITY_ICONS[act.type] || ActivityIcon;
              return (
                <div key={act.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", ACTIVITY_COLORS[act.type], "bg-opacity-10")} style={{ background: act.type === "fee" ? "oklch(0.95 0.05 150)" : act.type === "attendance" ? "oklch(0.95 0.05 175)" : act.type === "admission" ? "oklch(0.95 0.05 280)" : act.type === "salary" ? "oklch(0.95 0.08 45)" : act.type === "certificate" ? "oklch(0.95 0.08 95)" : "oklch(0.95 0 0)" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: act.type === "fee" ? "#059669" : act.type === "attendance" ? "#15857A" : act.type === "admission" ? "#7C3AED" : act.type === "salary" ? "#FF6A3B" : act.type === "certificate" ? "#CA8A04" : "#6B7280" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{act.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{act.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">{act.timestamp.split(" ")[1]}</p>
                    <p className="text-[10px] text-muted-foreground/70">{act.user.split(" ")[0]}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Pending Tasks + Birthdays ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending tasks */}
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Pending Tasks Today
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-0">{PENDING_TASKS.length} tasks</Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            {PENDING_TASKS.map(task => (
              <button
                key={task.id}
                onClick={() => setActiveModule(task.module)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors text-left group"
              >
                <Circle className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground">Due in {task.dueIn}</p>
                </div>
                <Badge variant="outline" className={cn("text-[9px] capitalize", PRIORITY_STYLES[task.priority])}>
                  {task.priority}
                </Badge>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Birthdays */}
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Cake className="w-4 h-4 text-pink-500" /> Upcoming Birthdays
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveModule("students")}>
              All students <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {UPCOMING_BIRTHDAYS.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="relative">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold", b.date === "Today" ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white" : "bg-gradient-to-br from-pink-500/15 to-purple-500/15 text-pink-600")}>
                    {b.avatar}
                  </div>
                  {b.date === "Today" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-card animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.class} • Turning {b.age}</p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] border-0", b.date === "Today" ? "bg-accent/15 text-accent font-semibold" : "bg-muted text-muted-foreground")}>
                  {b.date === "Today" && "🎂 "}{b.date}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Student Growth — Full Width ═══ */}
      <Card className="border-0 shadow-sm glass-card card-hover">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Student Growth Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Last 12 months enrollment</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveModule("analytics")}>
            View Analytics <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={studentGrowth}>
              <defs>
                <linearGradient id="studentsGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15857A" />
                  <stop offset="100%" stopColor="#15857A" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.50 0.015 200)" fontSize={10} tickLine={false} axisLine={false} interval={1} />
              <YAxis stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} domain={[400, 480]} />
              <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => `${v} students`} />
              <Bar dataKey="students" fill="url(#studentsGrad2)" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
