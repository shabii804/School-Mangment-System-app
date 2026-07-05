"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore, type ModuleKey } from "@/lib/sms-store";
import {
  LayoutDashboard, Users, GraduationCap, UserCog, School, CalendarDays,
  ClipboardCheck, Wallet, DollarSign, AlertTriangle, FileText, Award,
  BarChart3, LineChart, UserPlus, Settings, Search, ArrowRight,
  Receipt, BookOpen, Bus, Home, Package, Calendar, Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Navigation" | "Students" | "Quick Actions" | "Receipts";
  action: () => void;
  keywords?: string;
}

const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  students: Users,
  teachers: GraduationCap,
  staff: UserCog,
  classes: School,
  timetable: CalendarDays,
  attendance: ClipboardCheck,
  salary: Wallet,
  fees: DollarSign,
  defaulters: AlertTriangle,
  results: FileText,
  certificates: Award,
  reports: BarChart3,
  analytics: LineChart,
  users: UserPlus,
  settings: Settings,
  ledger: BookOpen,
  exam: GraduationCap,
  library: BookOpen,
  transport: Bus,
  hostel: Home,
  inventory: Package,
  events: Calendar,
  discipline: Shield,
  alumni: Award,
  parent: Users,
};

const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  students: "Students",
  teachers: "Teachers",
  staff: "Staff",
  classes: "Classes",
  timetable: "Timetable",
  attendance: "Attendance",
  salary: "Salary & Fine",
  fees: "Fee Collection",
  defaulters: "Defaulters",
  results: "Results",
  certificates: "Certificates",
  reports: "Reports",
  analytics: "Analytics",
  users: "User Management",
  settings: "Settings",
  ledger: "Income & Expense",
  exam: "Examinations",
  library: "Library",
  transport: "Transport",
  hostel: "Hostel",
  inventory: "Inventory",
  events: "Event Calendar",
  discipline: "Discipline",
  alumni: "Alumni",
  parent: "Parent Portal",
};

export function CommandPalette() {
  const {
    commandOpen, setCommandOpen, setActiveModule, students, feeCollections,
    setSelectedStudent, role,
  } = useAppStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query and focus when opened
  useEffect(() => {
    if (commandOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  // Build command items
  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = (Object.keys(MODULE_LABELS) as ModuleKey[])
      .filter(m => {
        if (role === "admin") return true;
        if (role === "accountant") return ["dashboard", "students", "teachers", "staff", "classes", "attendance", "fees", "defaulters", "salary", "reports", "settings"].includes(m);
        if (role === "teacher") return ["dashboard", "students", "classes", "timetable", "attendance", "results", "reports"].includes(m);
        return true;
      })
      .map(m => ({
        id: `nav-${m}`,
        label: MODULE_LABELS[m],
        description: "Navigate to module",
        icon: MODULE_ICONS[m],
        group: "Navigation" as const,
        action: () => { setActiveModule(m); setCommandOpen(false); },
      }));

    const studentItems: CommandItem[] = students.slice(0, 20).map(s => ({
      id: `stu-${s.id}`,
      label: s.name,
      description: `${s.id} • ${s.class}-${s.section} • Roll #${s.rollNo}`,
      icon: Users,
      group: "Students" as const,
      action: () => {
        setSelectedStudent(s.id);
        setActiveModule("students");
        setCommandOpen(false);
      },
      keywords: `${s.fatherName} ${s.fatherPhone} ${s.id}`,
    }));

    const receiptItems: CommandItem[] = feeCollections.slice(0, 10).map(f => ({
      id: `rec-${f.id}`,
      label: f.receiptNo,
      description: `${f.studentName} • Rs. ${f.amount.toLocaleString()} • ${f.date}`,
      icon: Receipt,
      group: "Receipts" as const,
      action: () => { setActiveModule("fees"); setCommandOpen(false); },
    }));

    const quickActions: CommandItem[] = [
      { id: "qa-1", label: "Collect Fee", description: "Open fee collection screen", icon: DollarSign, group: "Quick Actions", action: () => { setActiveModule("fees"); setCommandOpen(false); } },
      { id: "qa-2", label: "Mark Attendance", description: "Mark today's attendance", icon: ClipboardCheck, group: "Quick Actions", action: () => { setActiveModule("attendance"); setCommandOpen(false); } },
      { id: "qa-3", label: "View Defaulters", description: "See students with outstanding fees", icon: AlertTriangle, group: "Quick Actions", action: () => { setActiveModule("defaulters"); setCommandOpen(false); } },
      { id: "qa-4", label: "Generate Salary Slips", description: "Process monthly payroll", icon: Wallet, group: "Quick Actions", action: () => { setActiveModule("salary"); setCommandOpen(false); } },
      { id: "qa-5", label: "Issue Certificate", description: "Generate bonafide / leaving certificate", icon: Award, group: "Quick Actions", action: () => { setActiveModule("certificates"); setCommandOpen(false); } },
      { id: "qa-6", label: "School Settings", description: "Edit school info, logo, and rules", icon: Settings, group: "Quick Actions", action: () => { setActiveModule("settings"); setCommandOpen(false); } },
    ];

    return [...navItems, ...quickActions, ...studentItems, ...receiptItems];
  }, [students, feeCollections, role, setActiveModule, setCommandOpen, setSelectedStudent]);

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(it =>
      `${it.label} ${it.description} ${it.keywords || ""}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Group filtered items
  const grouped = useMemo(() => {
    const g: Record<string, CommandItem[]> = {};
    filtered.forEach(it => {
      if (!g[it.group]) g[it.group] = [];
      g[it.group].push(it);
    });
    return g;
  }, [filtered]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!commandOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].action();
      } else if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandOpen, filtered, activeIndex, setCommandOpen]);

  // Reset active index when query changes
  useEffect(() => { setActiveIndex(0); }, [query]);

  let flatIndex = -1;

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="p-0 gap-0 max-w-2xl top-[15%] translate-y-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search students, receipts, modules, or quick actions..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group} className="mb-2">
              <p className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{group}</p>
              {groupItems.map(item => {
                flatIndex++;
                const idx = flatIndex;
                const Icon = item.icon;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={item.action}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      isActive ? "bg-primary/10" : "hover:bg-muted/40"
                    )}
                  >
                    <div className={cn("rounded-md p-1.5", isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", isActive && "text-primary")}>{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    {isActive && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="font-mono border border-border/60 rounded px-1">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="font-mono border border-border/60 rounded px-1">↵</kbd> select</span>
            <span className="flex items-center gap-1"><kbd className="font-mono border border-border/60 rounded px-1">ESC</kbd> close</span>
          </div>
          <span>{filtered.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
