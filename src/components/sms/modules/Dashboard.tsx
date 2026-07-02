"use client";

import { useAppStore } from "@/lib/sms-store";
import { STATS, FEE_TREND, STUDENT_GROWTH, ACTIVITIES, TODAY_SCHEDULE, UPCOMING_BIRTHDAYS, PENDING_TASKS } from "@/lib/sms-data";
import { KpiCard } from "../KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, GraduationCap, UserCog, ClipboardCheck, DollarSign,
  TrendingUp, AlertTriangle, Wallet, Plus, Receipt, ClipboardList,
  FileText, Activity as ActivityIcon, Cake, Calendar, Clock,
  CheckCircle2, Circle, ArrowRight, Sparkles, School,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
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

const SCHEDULE_STATUS: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Done" },
  "in-progress": { color: "text-primary", bg: "bg-primary/10", label: "Now" },
  upcoming: { color: "text-muted-foreground", bg: "bg-muted", label: "Next" },
  break: { color: "text-accent", bg: "bg-accent/10", label: "Break" },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function DashboardModule() {
  const { setActiveModule, school } = useAppStore();

  const quickActions = [
    { label: "Collect Fee", icon: Receipt, module: "fees" as const, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Mark Attendance", icon: ClipboardList, module: "attendance" as const, color: "bg-primary/10 text-primary" },
    { label: "Add Student", icon: Plus, module: "students" as const, color: "bg-purple-500/10 text-purple-600" },
    { label: "Print Receipt", icon: FileText, module: "reports" as const, color: "bg-accent/10 text-accent" },
  ];

  // KPI click handlers — connect dashboard to modules
  const kpiClick = (module: "defaulters" | "fees" | "students" | "attendance") => () => setActiveModule(module);

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome hero with school logo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground animated-gradient">
        <div className="absolute inset-0 opacity-20 pattern-grid" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative flex items-start gap-5">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center overflow-hidden ring-2 ring-white/30 shrink-0">
            {school.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <School className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs opacity-90">Assalam-o-Alaikum, welcome back 👋</p>
              <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> Session {school.session}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold mt-1">{school.name}</h2>
            <p className="text-sm opacity-80 mt-1">{school.tagline} • 13 Classes • 48 Active Students</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
                onClick={() => setActiveModule("fees")}
              >
                <Receipt className="w-4 h-4 mr-1.5" /> Collect Fee
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-primary-foreground border border-white/30"
                onClick={() => setActiveModule("attendance")}
              >
                <ClipboardList className="w-4 h-4 mr-1.5" /> Mark Attendance
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-primary-foreground border border-white/30"
                onClick={() => setActiveModule("students")}
              >
                <Plus className="w-4 h-4 mr-1.5" /> New Admission
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={kpiClick("students")} className="text-left">
          <KpiCard title="Total Students" value={STATS.totalStudents} subtitle="Active enrollment" icon={Users} trend={{ value: "+3 this month", up: true }} variant="teal" />
        </button>
        <KpiCard title="Teaching Staff" value={STATS.totalTeachers} subtitle="Plus 5 support staff" icon={GraduationCap} variant="purple" />
        <button onClick={kpiClick("attendance")} className="text-left">
          <KpiCard title="Today's Attendance" value={`${STATS.todayAttendancePct}%`} subtitle="28 present / 30 expected" icon={ClipboardCheck} trend={{ value: "+2% vs yesterday", up: true }} variant="yellow" />
        </button>
        <button onClick={kpiClick("fees")} className="text-left">
          <KpiCard title="Today's Collection" value={`Rs. ${STATS.todayFeeCollection.toLocaleString()}`} subtitle="6 receipts issued" icon={DollarSign} trend={{ value: "+18% vs avg", up: true }} variant="orange" />
        </button>
        <KpiCard title="Monthly Income" value={`Rs. ${(STATS.monthlyIncome / 1000).toFixed(0)}K`} subtitle="July 2026 so far" icon={TrendingUp} trend={{ value: "+8% vs June", up: true }} variant="teal" />
        <button onClick={kpiClick("fees")} className="text-left">
          <KpiCard title="Pending Fees" value={`Rs. ${(STATS.pendingFees / 1000).toFixed(1)}K`} subtitle="Across all students" icon={Wallet} variant="pink" />
        </button>
        <button onClick={kpiClick("defaulters")} className="text-left">
          <KpiCard title="Fee Defaulters" value={STATS.defaultersCount} subtitle="Past due date" icon={AlertTriangle} trend={{ value: "Needs follow-up", up: false }} variant="red" />
        </button>
        <KpiCard title="Total Staff" value={STATS.totalStaff} subtitle="Non-teaching" icon={UserCog} variant="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Fee Collection Trend</CardTitle>
              <p className="text-xs text-muted-foreground">Collected vs pending — last 6 months</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveModule("analytics")}>
              View Analytics <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={FEE_TREND}>
                <defs>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15857A" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#15857A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6A3B" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#FF6A3B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="collected" stroke="#15857A" strokeWidth={2} fill="url(#collectedGrad)" name="Collected" />
                <Area type="monotone" dataKey="pending" stroke="#FF6A3B" strokeWidth={2} fill="url(#pendingGrad)" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Today's Schedule</CardTitle>
              <p className="text-xs text-muted-foreground">Grade 9-A • Live</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveModule("timetable")}>
              Full <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {TODAY_SCHEDULE.map((s, i) => {
              const style = SCHEDULE_STATUS[s.status];
              return (
                <div key={i} className={cn("flex items-center gap-3 p-2 rounded-lg border border-border/40 transition-all hover:border-primary/30", style.bg)}>
                  <div className="text-center shrink-0 w-12">
                    <p className="text-[10px] text-muted-foreground">{s.time}</p>
                    <p className={cn("text-xs font-bold", style.color)}>{s.period}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.subject}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.teacher} • {s.class} • {s.room}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] border-0", style.color, style.bg)}>{style.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions + activity + birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <p className="text-xs text-muted-foreground">One-click access</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => setActiveModule(action.module)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all card-hover"
                >
                  <div className={cn("rounded-xl p-2.5", action.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-primary" />
                Recent Activities
              </CardTitle>
              <p className="text-xs text-muted-foreground">Latest 7 events in the system</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-72 overflow-y-auto">
            {ACTIVITIES.map(act => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", ACTIVITY_COLORS[act.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{act.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{act.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground">{act.timestamp.split(" ")[1]}</p>
                  <p className="text-[10px] text-muted-foreground/70">{act.user.split(" ")[0]}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pending tasks + Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending tasks */}
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Pending Tasks Today
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-0">{PENDING_TASKS.length} tasks</Badge>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {PENDING_TASKS.map(task => (
              <button
                key={task.id}
                onClick={() => setActiveModule(task.module)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors text-left group"
              >
                <Circle className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
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
              <Cake className="w-4 h-4 text-pink-500" />
              Upcoming Birthdays
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveModule("students")}>
              All students <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {UPCOMING_BIRTHDAYS.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-xs font-semibold text-pink-600">
                    {b.avatar}
                  </div>
                  {b.date === "Today" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.class} • Turning {b.age}</p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] border-0", b.date === "Today" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground")}>
                  {b.date === "Today" && "🎂 "}{b.date}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Student growth chart */}
      <Card className="border-0 shadow-sm glass-card card-hover">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Student Growth Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Last 12 months enrollment</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveModule("analytics")}>
            View Analytics <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={STUDENT_GROWTH}>
              <defs>
                <linearGradient id="studentsGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15857A" />
                  <stop offset="100%" stopColor="#15857A" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.50 0.015 200)" fontSize={10} tickLine={false} axisLine={false} interval={1} />
              <YAxis stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} domain={[400, 480]} />
              <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v} students`} />
              <Bar dataKey="students" fill="url(#studentsGrad2)" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
