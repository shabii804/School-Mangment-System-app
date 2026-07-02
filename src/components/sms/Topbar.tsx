"use client";

import { useAppStore, type Role } from "@/lib/sms-store";
import { Bell, Search, Moon, Sun, ChevronDown } from "lucide-react";
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

const MODULE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  students: "Student Management",
  teachers: "Teacher Management",
  staff: "Staff Management",
  classes: "Class Management",
  timetable: "Timetable",
  attendance: "Attendance",
  salary: "Salary & Fine Management",
  fees: "Fee Collection",
  defaulters: "Fee Defaulters",
  results: "Examination & Results",
  certificates: "Certificates",
  reports: "Reports",
  analytics: "Analytics",
  users: "User Management",
  settings: "Settings",
};

export function Topbar() {
  const { role, setRole, userName, activeModule, isDark, toggleTheme, setSearchQuery } = useAppStore();
  const roleInfo = ROLE_LABELS[role];
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-border/40">
      <div className="px-6 py-3 flex items-center gap-4">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground leading-tight">{MODULE_TITLES[activeModule]}</h2>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>

        {/* Search */}
        <div className="relative w-72 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students, receipts, IDs... (Ctrl+K)"
            className="pl-9 bg-background/60 border-border/50 h-9 text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        </Button>

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
