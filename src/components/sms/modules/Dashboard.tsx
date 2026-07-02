"use client";

import { useAppStore } from "@/lib/sms-store";
import { STATS, FEE_TREND, STUDENT_GROWTH, ACTIVITIES } from "@/lib/sms-data";
import { KpiCard } from "../KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, GraduationCap, UserCog, ClipboardCheck, DollarSign,
  TrendingUp, AlertTriangle, Wallet, Plus, Receipt, ClipboardList,
  FileText, Activity as ActivityIcon,
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

export function DashboardModule() {
  const { setActiveModule, collectFee, students } = useAppStore();

  const quickActions = [
    { label: "Collect Fee", icon: Receipt, module: "fees" as const, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Mark Attendance", icon: ClipboardList, module: "attendance" as const, color: "bg-primary/10 text-primary" },
    { label: "Add Student", icon: Plus, module: "students" as const, color: "bg-purple-500/10 text-purple-600" },
    { label: "Print Receipt", icon: FileText, module: "reports" as const, color: "bg-accent/10 text-accent" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground animated-gradient">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3C/svg%3E\")",
        }} />
        <div className="relative">
          <p className="text-sm opacity-90">Assalam-o-Alaikum, welcome back 👋</p>
          <h2 className="text-2xl font-bold mt-1">Greenwood Public School</h2>
          <p className="text-sm opacity-80 mt-1">Academic Session 2026–27 • 13 Classes • 48 Active Students</p>
          <div className="flex flex-wrap gap-3 mt-4">
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
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Students"
          value={STATS.totalStudents}
          subtitle="Active enrollment"
          icon={Users}
          trend={{ value: "+3 this month", up: true }}
          variant="teal"
        />
        <KpiCard
          title="Teaching Staff"
          value={STATS.totalTeachers}
          subtitle="Plus 5 support staff"
          icon={GraduationCap}
          variant="purple"
        />
        <KpiCard
          title="Today's Attendance"
          value={`${STATS.todayAttendancePct}%`}
          subtitle="28 present / 30 expected"
          icon={ClipboardCheck}
          trend={{ value: "+2% vs yesterday", up: true }}
          variant="yellow"
        />
        <KpiCard
          title="Today's Collection"
          value={`Rs. ${STATS.todayFeeCollection.toLocaleString()}`}
          subtitle="6 receipts issued"
          icon={DollarSign}
          trend={{ value: "+18% vs avg", up: true }}
          variant="orange"
        />
        <KpiCard
          title="Monthly Income"
          value={`Rs. ${(STATS.monthlyIncome / 1000).toFixed(0)}K`}
          subtitle="July 2026 so far"
          icon={TrendingUp}
          trend={{ value: "+8% vs June", up: true }}
          variant="teal"
        />
        <KpiCard
          title="Pending Fees"
          value={`Rs. ${(STATS.pendingFees / 1000).toFixed(1)}K`}
          subtitle="Across all students"
          icon={Wallet}
          variant="pink"
        />
        <KpiCard
          title="Fee Defaulters"
          value={STATS.defaultersCount}
          subtitle="Past due date"
          icon={AlertTriangle}
          trend={{ value: "Needs follow-up", up: false }}
          variant="red"
        />
        <KpiCard
          title="Total Staff"
          value={STATS.totalStaff}
          subtitle="Non-teaching"
          icon={UserCog}
          variant="purple"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fee trend */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee Collection Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Collected vs pending — last 6 months</p>
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
                <Tooltip
                  contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => `Rs. ${v.toLocaleString()}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="collected" stroke="#15857A" strokeWidth={2} fill="url(#collectedGrad)" name="Collected" />
                <Area type="monotone" dataKey="pending" stroke="#FF6A3B" strokeWidth={2} fill="url(#pendingGrad)" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student growth */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Student Growth</CardTitle>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={STUDENT_GROWTH}>
                <defs>
                  <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#15857A" />
                    <stop offset="100%" stopColor="#15857A" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.50 0.015 200)" fontSize={10} tickLine={false} axisLine={false} interval={1} />
                <YAxis stroke="oklch(0.50 0.015 200)" fontSize={11} tickLine={false} axisLine={false} domain={[400, 480]} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => `${v} students`}
                />
                <Bar dataKey="students" fill="url(#studentsGrad)" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <Card className="border-0 shadow-sm glass-card">
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
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-muted/30 transition-all"
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
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card">
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
    </div>
  );
}
