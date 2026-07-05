"use client";

import { useAppStore, type Role } from "@/lib/sms-store";
import { Bell, Search, Moon, Sun, ChevronDown, Command, X, Check, Calendar, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<Role, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-primary/15 text-primary" },
  accountant: { label: "Accountant", color: "bg-accent/15 text-accent" },
  teacher: { label: "Teacher", color: "bg-purple-500/15 text-purple-600" },
};

const MODULE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "School overview at a glance" },
  students: { title: "Student Management", subtitle: "Admissions, profiles, and enrollment" },
  teachers: { title: "Teacher Management", subtitle: "Teaching staff and assignments" },
  staff: { title: "Staff Management", subtitle: "Non-teaching employees" },
  classes: { title: "Class Management", subtitle: "Classes, sections, and subjects" },
  timetable: { title: "Timetable", subtitle: "Weekly class schedules" },
  attendance: { title: "Attendance", subtitle: "Students, teachers, and staff" },
  salary: { title: "Salary & Fine Management", subtitle: "Payroll with attendance deductions" },
  fees: { title: "Fee Collection", subtitle: "Collect fees and print receipts" },
  defaulters: { title: "Fee Defaulters", subtitle: "Students with outstanding fees" },
  results: { title: "Examination & Results", subtitle: "Marks, grades, and result cards" },
  certificates: { title: "Certificates", subtitle: "Issue official school documents" },
  reports: { title: "Reports", subtitle: "Printable reports and exports" },
  analytics: { title: "Analytics", subtitle: "Trends and performance insights" },
  users: { title: "User Management", subtitle: "Accounts and role permissions" },
  settings: { title: "Settings", subtitle: "School configuration" },
  ledger: { title: "Income & Expense Ledger", subtitle: "Financial transactions and P&L" },
  exam: { title: "Examinations", subtitle: "Exam schedules, grades, and result compilation" },
  library: { title: "Library", subtitle: "Book catalog, issue/return, and fines" },
  transport: { title: "Transport", subtitle: "Bus routes, vehicles, and driver management" },
  hostel: { title: "Hostel", subtitle: "Room allocation and mess management" },
  inventory: { title: "Inventory", subtitle: "Assets, equipment, and supplies" },
  events: { title: "Event Calendar", subtitle: "Events, holidays, and important dates" },
  discipline: { title: "Discipline & Behavior", subtitle: "Incident logs, warnings, and parent notifications" },
  alumni: { title: "Alumni Network", subtitle: "Graduated students, careers, and donations" },
  parent: { title: "Parent Portal", subtitle: "Read-only student information for parents" },
  leave: { title: "Staff Leave Management", subtitle: "Leave requests, balances, and approvals" },
  concession: { title: "Fee Concessions & Scholarships", subtitle: "Discounts, financial aid, and merit awards" },
};

const NOTIF_COLORS: Record<string, string> = {
  fee: "bg-emerald-500",
  attendance: "bg-primary",
  admission: "bg-purple-500",
  salary: "bg-accent",
  system: "bg-muted-foreground",
  birthday: "bg-pink-500",
};

export function Topbar() {
  const {
    role, setRole, userName, activeModule, isDark, toggleTheme,
    setCommandOpen, notifications, markNotificationRead, markAllNotificationsRead, unreadCount,
    school,
  } = useAppStore();

  const roleInfo = ROLE_LABELS[role];
  const meta = MODULE_TITLES[activeModule] || { title: "Dashboard", subtitle: "" };
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const unread = unreadCount();

  return (
    <header className="shrink-0 z-30 glass-card border-b border-border/40">
      <div className="px-6 py-3 flex items-center gap-4">
        {/* Title block */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground leading-tight">{meta.title}</h2>
          <p className="text-xs text-muted-foreground truncate">{meta.subtitle} • {today}</p>
        </div>

        {/* Session Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 bg-primary/5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-primary">{school.session}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuLabel>Academic Sessions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer bg-primary/5">
              <div className="flex items-center gap-2 w-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{school.session}</p>
                  <p className="text-[10px] text-muted-foreground">Active Session</p>
                </div>
                <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-0">Current</Badge>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm">2025–26</p>
                <p className="text-[10px] text-muted-foreground">Archived • 42 students</p>
              </div>
              <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground border-0">Archive</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm">2024–25</p>
                <p className="text-[10px] text-muted-foreground">Archived • 38 students</p>
              </div>
              <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground border-0">Archive</Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-primary">
              <Plus className="w-3.5 h-3.5" />
              <span className="text-sm">Start New Session...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Command palette trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex items-center gap-2 w-72 h-9 px-3 rounded-md border border-border/50 bg-background/60 hover:bg-background hover:border-primary/30 transition-colors text-sm text-muted-foreground"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/60 bg-muted/40 text-[10px] font-mono">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9" aria-label="Toggle theme">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
              <span className="text-sm font-semibold">Notifications</span>
              <button onClick={markAllNotificationsRead} className="text-[10px] text-primary hover:underline">
                Mark all read
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 border-b border-border/30 hover:bg-muted/40 text-left transition-colors",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", NOTIF_COLORS[n.type])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-muted-foreground/70">{n.time}</p>
                      {n.action && (
                        <span className="text-[10px] text-primary font-medium">{n.action.label} →</span>
                      )}
                    </div>
                  </div>
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Role switcher + user */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 px-2 hover:bg-muted/60 gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-semibold">
                {userName.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold leading-tight">{userName}</p>
                <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5 mt-0.5 border-0", roleInfo.color)}>
                  {roleInfo.label}
                </Badge>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRole("admin")} className="cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-primary" /> Admin — Full Access
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("accountant")} className="cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-accent" /> Accountant — Fees & Salary
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("teacher")} className="cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-purple-500" /> Teacher — Attendance & Results
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground text-xs">Backup database…</DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground text-xs">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
