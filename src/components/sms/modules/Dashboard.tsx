"use client";

import { useAppStore, localDateStr } from "@/lib/sms-store";
import { useNowTick } from "@/lib/use-now-tick";
import { TODAY_SCHEDULE } from "@/lib/sms-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, GraduationCap, ClipboardCheck, DollarSign,
  TrendingUp, AlertTriangle, Wallet, Receipt, ClipboardList,
  FileText, Activity as ActivityIcon, Calendar,
  CheckCircle2, ArrowRight, Sparkles, School,
  BookOpen, Zap,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, any> = {
  fee: DollarSign, attendance: ClipboardCheck, admission: GraduationCap,
  salary: Wallet, certificate: FileText, system: ActivityIcon,
};

const SCHEDULE_STATUS: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  completed: { color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Done", dot: "bg-emerald-500" },
  "in-progress": { color: "text-primary", bg: "bg-primary/10", label: "LIVE", dot: "bg-primary animate-pulse" },
  upcoming: { color: "text-muted-foreground", bg: "bg-muted", label: "Next", dot: "bg-muted-foreground/30" },
  break: { color: "text-accent", bg: "bg-accent/10", label: "Break", dot: "bg-accent" },
};

const quickActions = [
  { label: "Collect Fee", icon: Receipt, module: "fees" as const, color: "bg-emerald-500/10 text-emerald-600" },
  { label: "Attendance", icon: ClipboardList, module: "attendance" as const, color: "bg-yellow-500/10 text-yellow-600" },
  { label: "Add Student", icon: Users, module: "students" as const, color: "bg-purple-500/10 text-purple-600" },
  { label: "Reports", icon: FileText, module: "reports" as const, color: "bg-accent/10 text-accent" },
];

export function DashboardModule() {
  useNowTick();
  const { setActiveModule, school, feeCollections, students, teachers, staff, transactions, attendanceRecords, classes, activities } = useAppStore();

  // ─── Compute ALL KPIs from real store data ───
  const todayStr = localDateStr();
  const activeStudents = students.filter(s => s.status === "Active");
  const defaulters = students.filter(s => (s.outstandingAmount || 0) > 0 && s.status === "Active");
  const todayCollections = feeCollections.filter(f => f.date === todayStr);
  const todayFeeCollection = todayCollections.reduce((s, f) => s + f.amount, 0);

  const todayAtt = attendanceRecords.filter(r => r.date === todayStr);
  const presentToday = todayAtt.reduce((sum, r) => {
    if (r.status === "Present" || r.status === "Late") return sum + 1;
    if (r.status === "Half-Day") return sum + 0.5;
    return sum;
  }, 0);
  const todayAttEligible = todayAtt.filter(r => r.status !== "Leave").length;
  const todayAttendancePct = todayAttEligible > 0 ? Math.round((presentToday / todayAttEligible) * 100) : 0;

  const monthStr = todayStr.slice(0, 7);
  const monthlyFeeIncome = feeCollections.filter(f => f.date.startsWith(monthStr)).reduce((s, f) => s + f.amount, 0);
  const monthlyOtherIncome = transactions.filter(t => t.type === "Income" && t.date.startsWith(monthStr)).reduce((s, t) => s + t.amount, 0);
  const monthlyIncome = monthlyFeeIncome + monthlyOtherIncome;
  const pendingFees = defaulters.reduce((s, d) => s + (d.outstandingAmount || 0), 0);

  // ─── Real fee trend — last 6 months from store ───
  const feeTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const collected = feeCollections.filter(f => f.date.startsWith(ms)).reduce((s, f) => s + f.amount, 0);
    return {
      month: d.toLocaleDateString("en-GB", { month: "short" }),
      collected: Math.round(collected / 1000),
      pending: Math.round(pendingFees / 1000),
    };
  });

  const kpiClick = (module: "defaulters" | "fees" | "students" | "attendance") => () => setActiveModule(module);

  return (
    <div className="space-y-2 fade-in">
      {/* ═══ Hero — compact single row ═══ */}
      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary to-primary/90 p-3.5 text-primary-foreground shadow-md">
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center overflow-hidden ring-2 ring-white/20 shrink-0">
          {school.logo ? (
            <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
          ) : (
            <School className="w-6 h-6 text-primary-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold tracking-tight truncate">{school.name || "School Management"}</h2>
          <p className="text-xs opacity-80 truncate">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[10px] px-2.5 py-1 rounded-full bg-white/15 font-medium shrink-0">
          <Sparkles className="w-3 h-3 inline mr-1" />Session {school.session || "2026-27"}
        </span>
      </div>

      {/* ═══ Primary KPIs — 4 cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={kpiClick("students")} aria-label="View Students module" className="text-left group">
          <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Students</p>
              <p className="text-xl font-bold tabular-nums">{activeStudents.length}</p>
            </div>
          </div>
        </button>

        <button onClick={kpiClick("attendance")} aria-label="View Attendance module" className="text-left group">
          <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Attendance</p>
              <p className="text-xl font-bold tabular-nums">{todayAttendancePct}%</p>
            </div>
          </div>
        </button>

        <button onClick={kpiClick("fees")} aria-label="View Fee Collection module" className="text-left group">
          <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's Collection</p>
              <p className="text-xl font-bold tabular-nums">Rs. {todayFeeCollection.toLocaleString()}</p>
            </div>
          </div>
        </button>

        <button onClick={kpiClick("defaulters")} aria-label="View Defaulters module" className="text-left group">
          <div className="rounded-xl border border-border/40 bg-card p-3 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Fee Defaulters</p>
              <p className="text-xl font-bold tabular-nums text-red-600">{defaulters.length}</p>
            </div>
          </div>
        </button>
      </div>

      {/* ═══ Secondary stats — compact inline cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/40 bg-card p-2.5 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0"><GraduationCap className="w-4 h-4 text-purple-600" /></div>
          <div><p className="text-[9px] text-muted-foreground uppercase">Teaching Staff</p><p className="text-base font-bold">{teachers.length}</p></div>
        </div>
        <button onClick={() => setActiveModule("classes")} className="rounded-xl border border-border/40 bg-card p-2.5 shadow-sm flex items-center gap-2.5 text-left hover:bg-muted/30 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><School className="w-4 h-4 text-primary" /></div>
          <div><p className="text-[9px] text-muted-foreground uppercase">Classes</p><p className="text-base font-bold">{classes.length}</p></div>
        </button>
        <div className="rounded-xl border border-border/40 bg-card p-2.5 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-[9px] text-muted-foreground uppercase">Monthly Income</p><p className="text-base font-bold">Rs. {(monthlyIncome / 1000).toFixed(0)}K</p></div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-2.5 shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0"><Wallet className="w-4 h-4 text-pink-600" /></div>
          <div><p className="text-[9px] text-muted-foreground uppercase">Pending Fees</p><p className="text-base font-bold text-red-600">Rs. {(pendingFees / 1000).toFixed(1)}K</p></div>
        </div>
      </div>

      {/* ═══ Fee Summary — 2 tiles (only when defaulters exist) ═══ */}
      {defaulters.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Outstanding</p>
              <p className="text-lg font-bold text-red-600 tabular-nums">Rs. {pendingFees.toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground">{defaulters.length} students owe fees</p>
            </div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Collected This Month</p>
              <p className="text-lg font-bold text-primary tabular-nums">Rs. {monthlyFeeIncome.toLocaleString()}</p>
              <p className="text-[9px] text-muted-foreground">{feeCollections.filter(f => f.date.startsWith(monthStr)).length} receipts</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Main content row — Fee Trend (2/3) + Today's Schedule (1/3) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Fee Collection Trend */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card">
          <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Fee Collection Trend
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveModule("analytics")}>
              Analytics <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={135}>
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
                <YAxis stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}K`} />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(v: number) => `Rs. ${v.toLocaleString()}K`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="collected" stroke="#15857A" strokeWidth={2.5} fill="url(#collectedGrad)" name="Collected" />
                <Area type="monotone" dataKey="pending" stroke="#FF6A3B" strokeWidth={2.5} fill="url(#pendingGrad)" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Today's Schedule</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setActiveModule("timetable")}>
              Full <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[145px] overflow-y-auto pr-1">
            {TODAY_SCHEDULE.map((s, i) => {
              const style = SCHEDULE_STATUS[s.status];
              return (
                <div key={i} className={cn("flex items-center gap-2 p-1.5 rounded-lg border transition-all hover:scale-[1.02]", style.bg, s.status === "in-progress" ? "border-primary/30 ring-1 ring-primary/20" : "border-border/40")}>
                  <div className={cn("w-1 h-7 rounded-full shrink-0", style.dot)} />
                  <div className="text-center shrink-0 w-9">
                    <p className="text-[8px] text-muted-foreground">{s.time}</p>
                    <p className={cn("text-[11px] font-bold", style.color)}>{s.period}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{s.subject}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{s.teacher} • {s.room}</p>
                  </div>
                  {s.status === "in-progress" ? (
                    <Badge className="text-[8px] bg-primary text-primary-foreground border-0 animate-pulse">LIVE</Badge>
                  ) : s.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Badge variant="outline" className={cn("text-[8px] border-0", style.color, style.bg)}>{style.label}</Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Quick Actions (1/3) + Recent Activities (2/3) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-accent" />Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => setActiveModule(action.module)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors text-center"
                >
                  <div className={cn("rounded-lg p-1.5", action.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-semibold">{action.label}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card">
          <CardHeader className="pb-1.5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-primary" /> Recent Activities
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => setActiveModule("reports")}>View all</Button>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[145px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                <ActivityIcon className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                No recent activity yet. Actions you take will appear here.
              </div>
            ) : activities.slice(0, 6).map(act => {
              const Icon = ACTIVITY_ICONS[act.type] || ActivityIcon;
              const iconBg = act.type === "fee" ? "bg-emerald-500/10" : act.type === "attendance" ? "bg-primary/10" : act.type === "admission" ? "bg-purple-500/10" : act.type === "salary" ? "bg-accent/10" : act.type === "certificate" ? "bg-yellow-500/10" : "bg-muted-foreground/10";
              const iconColor = act.type === "fee" ? "text-emerald-600" : act.type === "attendance" ? "text-primary" : act.type === "admission" ? "text-purple-600" : act.type === "salary" ? "text-accent" : act.type === "certificate" ? "text-yellow-600" : "text-muted-foreground";
              return (
                <div key={act.id} className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", iconBg)}>
                    <Icon className={cn("w-3.5 h-3.5", iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{act.action}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{act.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-muted-foreground">{act.timestamp.split(" ")[1]}</p>
                    <p className="text-[9px] text-muted-foreground/70">{act.user.split(" ")[0]}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
