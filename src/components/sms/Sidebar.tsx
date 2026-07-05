"use client";

import { useState } from "react";
import { useAppStore, type ModuleKey } from "@/lib/sms-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, UserCog, School, CalendarDays,
  ClipboardCheck, Wallet, DollarSign, AlertTriangle, FileText, Award,
  BarChart3, LineChart, UserPlus, Settings, GraduationCap as Logo,
  ChevronLeft, ChevronRight, BookOpen, Bus, Home, Package, Calendar,
  Shield, Percent, type LucideIcon,
} from "lucide-react";

interface NavItem {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
  group: "main" | "operations" | "finance" | "academics" | "system";
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { key: "students", label: "Students", icon: Users, group: "main" },
  { key: "teachers", label: "Teachers", icon: GraduationCap, group: "main" },
  { key: "staff", label: "Staff", icon: UserCog, group: "main" },
  { key: "classes", label: "Classes", icon: School, group: "main" },
  { key: "timetable", label: "Timetable", icon: CalendarDays, group: "operations" },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck, group: "operations" },
  { key: "fees", label: "Fee Collection", icon: DollarSign, group: "finance" },
  { key: "defaulters", label: "Defaulters", icon: AlertTriangle, group: "finance" },
  { key: "salary", label: "Salary & Fine", icon: Wallet, group: "finance" },
  { key: "ledger", label: "Income & Expense", icon: BookOpen, group: "finance" },
  { key: "concession", label: "Concessions", icon: Percent, group: "finance" },
  { key: "results", label: "Results", icon: FileText, group: "academics" },
  { key: "exam", label: "Examinations", icon: GraduationCap, group: "academics" },
  { key: "certificates", label: "Certificates", icon: Award, group: "academics" },
  { key: "reports", label: "Reports", icon: BarChart3, group: "academics" },
  { key: "analytics", label: "Analytics", icon: LineChart, group: "academics" },
  { key: "library", label: "Library", icon: BookOpen, group: "facilities" },
  { key: "transport", label: "Transport", icon: Bus, group: "facilities" },
  { key: "hostel", label: "Hostel", icon: Home, group: "facilities" },
  { key: "inventory", label: "Inventory", icon: Package, group: "facilities" },
  { key: "events", label: "Event Calendar", icon: Calendar, group: "facilities" },
  { key: "discipline", label: "Discipline", icon: Shield, group: "facilities" },
  { key: "leave", label: "Staff Leave", icon: Calendar, group: "facilities" },
  { key: "alumni", label: "Alumni", icon: Award, group: "facilities" },
  { key: "parent", label: "Parent Portal", icon: Users, group: "facilities" },
  { key: "users", label: "User Management", icon: UserPlus, group: "system" },
  { key: "settings", label: "Settings", icon: Settings, group: "system" },
];

const GROUP_LABELS: Record<NavItem["group"], string> = {
  main: "Overview",
  operations: "Daily Operations",
  finance: "Finance",
  academics: "Academics",
  facilities: "Facilities",
  system: "System",
};

export function Sidebar() {
  const { activeModule, setActiveModule, role, school } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  // Filter nav items by role
  const visibleItems = NAV_ITEMS.filter(item => {
    if (role === "admin") return true;
    if (role === "accountant") return ["dashboard", "students", "teachers", "staff", "classes", "attendance", "fees", "defaulters", "salary", "ledger", "reports", "settings"].includes(item.key);
    if (role === "teacher") return ["dashboard", "students", "classes", "timetable", "attendance", "results", "reports"].includes(item.key);
    return true;
  });

  const groups: NavItem["group"][] = ["main", "operations", "finance", "academics", "facilities", "system"];

  return (
    <aside className={cn(
      "h-screen overflow-y-auto overflow-x-hidden flex flex-col transition-all duration-200 shrink-0 z-40",
      "bg-[oklch(0.18_0.02_200)] text-white border-r border-white/5",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Brand header */}
      <div className="px-3 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shrink-0 overflow-hidden ring-1 ring-white/10">
            {school.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <Logo className="w-5 h-5 text-white" />
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 fade-in">
              <h1 className="font-bold text-sm leading-tight text-white truncate">{school.name}</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">SMS v1.0</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/50 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Collapse sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-4">
        {groups.map(group => {
          const items = visibleItems.filter(i => i.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                  {GROUP_LABELS[group]}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveModule(item.key)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-left transition-all",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-white/60 hover:bg-white/10 hover:text-white",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-white" : "text-white/50")} strokeWidth={2.2} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="px-3 py-3 border-t border-white/10 mt-auto">
        {!collapsed ? (
          <div className="flex items-center gap-2 text-xs">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <span className="text-white/50 font-medium">Online • Offline-ready</span>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto" />
        )}
      </div>
    </aside>
  );
}
