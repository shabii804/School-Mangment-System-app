"use client";

import { useAppStore, type ModuleKey } from "@/lib/sms-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, UserCog, School, CalendarDays,
  ClipboardCheck, Wallet, DollarSign, AlertTriangle, FileText, Award,
  BarChart3, LineChart, UserPlus, Settings, GraduationCap as Logo,
  type LucideIcon,
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
  { key: "results", label: "Results", icon: FileText, group: "academics" },
  { key: "certificates", label: "Certificates", icon: Award, group: "academics" },
  { key: "reports", label: "Reports", icon: BarChart3, group: "academics" },
  { key: "analytics", label: "Analytics", icon: LineChart, group: "academics" },
  { key: "users", label: "User Management", icon: UserPlus, group: "system" },
  { key: "settings", label: "Settings", icon: Settings, group: "system" },
];

const GROUP_LABELS: Record<NavItem["group"], string> = {
  main: "Overview",
  operations: "Daily Operations",
  finance: "Finance",
  academics: "Academics",
  system: "System",
};

export function Sidebar() {
  const activeModule = useAppStore((s) => s.activeModule);
  const setActiveModule = useAppStore((s) => s.setActiveModule);
  const role = useAppStore((s) => s.role);

  // Filter nav items by role
  const visibleItems = NAV_ITEMS.filter(item => {
    if (role === "admin") return true;
    if (role === "accountant") return ["dashboard", "students", "teachers", "staff", "classes", "attendance", "fees", "defaulters", "salary", "reports", "settings"].includes(item.key);
    if (role === "teacher") return ["dashboard", "students", "classes", "timetable", "attendance", "results", "reports"].includes(item.key);
    return true;
  });

  const groups: NavItem["group"][] = ["main", "operations", "finance", "academics", "system"];

  return (
    <aside className="sidebar-bg w-64 shrink-0 h-screen sticky top-0 overflow-y-auto flex flex-col">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <Logo className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base leading-tight text-foreground">EduDesk</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">School Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-4">
        {groups.map(group => {
          const items = visibleItems.filter(i => i.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {GROUP_LABELS[group]}
              </p>
              <div className="space-y-0.5">
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveModule(item.key)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-all",
                        isActive
                          ? "nav-item-active"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "")} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/40 mt-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>v1.0 • Offline Ready</span>
        </div>
      </div>
    </aside>
  );
}
