"use client";

import { useAppStore, localDateStr } from "@/lib/sms-store";
import { useNowTick } from "@/lib/use-now-tick";
import { TODAY_SCHEDULE } from "@/lib/sms-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  CalendarDays,
  Zap,
  Activity as ActivityIcon,
  ArrowRight,
  Receipt,
  CheckCircle2,
  UserPlus,
  FileText,
  BarChart3,
  CalendarClock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Consistent number formatting (full numbers everywhere; K only on chart axis) ───
const fmtRs = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
const fmtNum = (n: number) => Math.round(n).toLocaleString("en-PK");

// Activity icon + tone — single neutral palette, semantic only
const ACTIVITY_TONE: Record<string, { Icon: typeof ActivityIcon; tone: string }> = {
  fee:         { Icon: Receipt,       tone: "text-emerald-600" },
  attendance:  { Icon: CheckCircle2,  tone: "text-primary" },
  admission:   { Icon: UserPlus,      tone: "text-primary" },
  salary:      { Icon: FileText,      tone: "text-muted-foreground" },
  certificate: { Icon: FileText,      tone: "text-muted-foreground" },
  system:      { Icon: ActivityIcon,  tone: "text-muted-foreground" },
};

const SCHEDULE_STATUS: Record<string, { dot: string; label: string; tone: string }> = {
  completed:     { dot: "bg-emerald-500",          label: "Done",  tone: "text-emerald-600" },
  "in-progress":  { dot: "bg-primary animate-pulse", label: "Live",  tone: "text-primary" },
  upcoming:      { dot: "bg-muted-foreground/30",   label: "Next",  tone: "text-muted-foreground" },
  break:         { dot: "bg-accent",               label: "Break", tone: "text-accent" },
};

const QUICK_ACTIONS: { label: string; module: "fees" | "attendance" | "students" | "reports" }[] = [
  { label: "Collect Fee",     module: "fees" },
  { label: "Mark Attendance", module: "attendance" },
  { label: "Add Student",     module: "students" },
  { label: "View Reports",   module: "reports" },
];

type KPITone = "default" | "muted" | "danger";
interface KPI {
  label: string;
  value: string;
  meta: string;
  tone: KPITone;
  onClick: () => void;
  action?: string;
}

export function DashboardModule() {
  useNowTick();
  const {
    setActiveModule,
    feeCollections,
    students,
    teachers,
    attendanceRecords,
    classes,
    activities,
  } = useAppStore();

  // ─── KPIs computed from real store data ───
  const todayStr = localDateStr();
  const monthStr = todayStr.slice(0, 7);

  const activeStudents = students.filter((s) => s.status === "Active");
  const defaulters = students.filter(
    (s) => (s.outstandingAmount || 0) > 0 && s.status === "Active"
  );
  const pendingFees = defaulters.reduce((s, d) => s + (d.outstandingAmount || 0), 0);

  const todayReceipts = feeCollections.filter((f) => f.date === todayStr);
  const todayFeeCollection = todayReceipts.reduce((s, f) => s + f.amount, 0);

  const todayAtt = attendanceRecords.filter((r) => r.date === todayStr);
  const presentToday = todayAtt.reduce((sum, r) => {
    if (r.status === "Present" || r.status === "Late") return sum + 1;
    if (r.status === "Half-Day") return sum + 0.5;
    return sum;
  }, 0);
  const todayAttEligible = todayAtt.filter((r) => r.status !== "Leave").length;
  const todayAttendancePct =
    todayAttEligible > 0 ? Math.round((presentToday / todayAttEligible) * 100) : 0;
  const attendanceMarked = todayAtt.length > 0;

  // ─── Fee trend — last 6 months, full rupee amounts (no K division) ───
  const feeTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const ms = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const collected = feeCollections
      .filter((f) => f.date.startsWith(ms))
      .reduce((s, f) => s + f.amount, 0);
    return {
      month: d.toLocaleDateString("en-GB", { month: "short" }),
      collected,
      isCurrent: i === 5,
    };
  });

  const hasAnyCollection = feeCollections.length > 0;
  const maxCollected = Math.max(...feeTrend.map((d) => d.collected), 0);
  // Pick a "nice" upper bound for the Y-axis in 25K/50K/100K/250K steps
  const stepK =
    maxCollected > 500000 ? 250
    : maxCollected > 200000 ? 100
    : maxCollected > 100000 ? 50
    : 25;
  const niceMax = maxCollected > 0
    ? Math.ceil(maxCollected / (stepK * 1000)) * stepK * 1000
    : stepK * 1000 * 2; // when empty, show 0..50K range so axis doesn't look broken
  const yTicks = [0, Math.round(niceMax / 2), niceMax];

  // ─── KPI tile definitions ───
  const kpis: KPI[] = [
    {
      label: "Total Students",
      value: fmtNum(activeStudents.length),
      meta: `${classes.length} classes · ${teachers.length} teachers`,
      tone: "default",
      onClick: () => setActiveModule("students"),
    },
    {
      label: "Today's Collection",
      value: fmtRs(todayFeeCollection),
      meta: `${todayReceipts.length} receipt${todayReceipts.length === 1 ? "" : "s"} today`,
      tone: "default",
      onClick: () => setActiveModule("fees"),
    },
    {
      label: "Today's Attendance",
      value: attendanceMarked ? `${todayAttendancePct}%` : "—",
      meta: attendanceMarked
        ? `${presentToday} of ${todayAttEligible} present`
        : "Not marked today",
      tone: attendanceMarked ? "default" : "muted",
      onClick: () => setActiveModule("attendance"),
    },
    {
      label: "Outstanding Fees",
      value: fmtRs(pendingFees),
      meta: `${defaulters.length} defaulters`,
      tone: "danger",
      onClick: () => setActiveModule("defaulters"),
      action: "Review defaulters",
    },
  ];

  return (
    <div className="space-y-4 fade-in">
      {/* ═══════════════════════════════════════════════════════════
          Row 1 — KPI Strip
          Big confident numerals (28px), tiny supporting metadata,
          no per-card icons, color reserved for the danger tile.
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const isDanger = kpi.tone === "danger";
          const isMuted = kpi.tone === "muted";
          return (
            <button
              key={kpi.label}
              onClick={kpi.onClick}
              className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-xl"
            >
              <div
                className={cn(
                  "rounded-xl bg-card p-5 shadow-sm transition-all duration-200",
                  "hover:shadow-md group-hover:-translate-y-0.5",
                  isDanger && "ring-1 ring-destructive/15"
                )}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <p
                  className={cn(
                    "mt-2 font-bold tabular-nums leading-none text-[32px] tracking-tight",
                    isDanger
                      ? "text-destructive"
                      : isMuted
                        ? "text-muted-foreground/45"
                        : "text-foreground"
                  )}
                >
                  {kpi.value}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground truncate">{kpi.meta}</p>
                  {isDanger && kpi.action && (
                    <span className="text-[11px] font-semibold text-destructive shrink-0 inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      {kpi.action}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Row 2 — Fee Collection chart (2/3) + Today's Schedule (1/3)
          Both cards use elevation only (no borders), with clean empty
          states so the layout never looks broken on a fresh install.
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fee Collection — bar chart with graceful empty state */}
        <Card className="lg:col-span-2 border-0 shadow-sm py-0 gap-0 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Fee Collection</h3>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Last 6 months
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
                onClick={() => setActiveModule("analytics")}
              >
                Analytics
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="relative h-[200px] mt-4">
              {hasAnyCollection ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={feeTrend}
                    barCategoryGap="34%"
                    margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.92 0.012 95)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "oklch(0.55 0.015 200)" }}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "oklch(0.55 0.015 200)" }}
                      tickLine={false}
                      axisLine={false}
                      width={42}
                      ticks={yTicks}
                      tickFormatter={(v: number) => (v === 0 ? "0" : `${v / 1000}K`)}
                    />
                    <Tooltip
                      cursor={{ fill: "oklch(0.50 0.09 175 / 0.06)" }}
                      contentStyle={{
                        background: "oklch(0.99 0.005 95)",
                        border: "1px solid oklch(0.88 0.015 95)",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                        padding: "6px 10px",
                      }}
                      formatter={(v: number) => [fmtRs(v), "Collected"]}
                      labelFormatter={(l) => `${l}`}
                    />
                    <Bar dataKey="collected" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {feeTrend.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            d.collected > 0
                              ? d.isCurrent
                                ? "oklch(0.50 0.09 175)"
                                : "oklch(0.50 0.09 175 / 0.55)"
                              : "oklch(0.50 0.09 175 / 0.10)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">No collections recorded yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Fee collections will appear here as receipts are added.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 h-8"
                    onClick={() => setActiveModule("fees")}
                  >
                    <Receipt className="w-3.5 h-3.5 mr-1.5" />
                    Collect first fee
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule — empty state when no timetable is set up */}
        <Card className="border-0 shadow-sm py-0 gap-0">
          <CardContent className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Today's Schedule</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
                onClick={() => setActiveModule("timetable")}
              >
                Full
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {TODAY_SCHEDULE.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CalendarClock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">No classes scheduled today</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Set up your weekly timetable to see today&rsquo;s periods here.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8"
                  onClick={() => setActiveModule("timetable")}
                >
                  Set up timetable
                  <ArrowRight className="w-3 h-3 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[220px] pr-1 mt-3">
                {TODAY_SCHEDULE.map((s, i) => {
                  const st = SCHEDULE_STATUS[s.status] || SCHEDULE_STATUS.upcoming;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        s.status === "in-progress" ? "bg-primary/5" : "hover:bg-muted/40"
                      )}
                    >
                      <div className={cn("w-1 h-9 rounded-full shrink-0", st.dot)} />
                      <div className="text-center shrink-0 w-11">
                        <p className="text-[10px] text-muted-foreground tabular-nums">{s.time}</p>
                        <p className={cn("text-[11px] font-bold", st.tone)}>{s.period}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{s.subject}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {s.teacher} · {s.room}
                        </p>
                      </div>
                      <span className={cn("text-[10px] font-semibold shrink-0", st.tone)}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Row 3 — Quick Actions (1/3) + Recent Activity (2/3)
          Single shared header icon per section. Actions are plain text
          links with arrow affordance (no pastel chips).
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm py-0 gap-0">
          <CardContent className="p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Quick Actions</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {QUICK_ACTIONS.map((a, i) => (
                <button
                  key={a.label}
                  onClick={() => setActiveModule(a.module)}
                  className={cn(
                    "group flex items-center justify-between py-3 text-left transition-colors",
                    i !== QUICK_ACTIONS.length - 1 && "border-b border-border/40"
                  )}
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {a.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-sm py-0 gap-0">
          <CardContent className="p-5 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Recent Activity</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
                onClick={() => setActiveModule("reports")}
              >
                View all
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {activities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ActivityIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Fee collections, attendance marks, and admissions will appear here as they happen.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8"
                  onClick={() => setActiveModule("fees")}
                >
                  <Receipt className="w-3.5 h-3.5 mr-1.5" />
                  Record first action
                </Button>
              </div>
            ) : (
              <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[200px] pr-1 mt-2">
                {activities.slice(0, 6).map((act) => {
                  const { Icon, tone } = ACTIVITY_TONE[act.type] || ACTIVITY_TONE.system;
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Icon className={cn("w-3.5 h-3.5", tone)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{act.action}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {act.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          {act.timestamp.split(" ")[1] ?? ""}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70">
                          {act.user.split(" ")[0]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
