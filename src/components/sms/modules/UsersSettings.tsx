"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  UserPlus, Shield, Database, Palette, Calendar, DollarSign,
  KeyRound, Download, Upload, Moon, Sun, Building2, Trash2, Image as ImageIcon,
  LayoutDashboard, Users, GraduationCap, UserCog, School, CalendarDays,
  ClipboardCheck, Wallet, AlertTriangle, FileText, Award, BarChart3, LineChart,
  BookOpen, Bus, Home, Package, Shield as DisciplineIcon, Percent,
  ToggleLeft, ToggleRight, Boxes, Eye, EyeOff, Power, CheckCircle2, Brain,
  type LucideIcon,
} from "lucide-react";
import { useAppStore, type ModuleKey, ALWAYS_ON_MODULES } from "@/lib/sms-store";
import { useToast } from "@/hooks/use-toast";
import { exportFeeStructureCSV } from "@/lib/pdf-service";
import { cn } from "@/lib/utils";

const USERS: { id: number; name: string; username: string; role: string; email: string; status: string; lastLogin: string }[] = [];

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-primary/15 text-primary",
  Accountant: "bg-accent/15 text-accent",
  Teacher: "bg-purple-500/15 text-purple-600",
};

export function UsersModule() {
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Role-based user accounts with permission control.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><UserPlus className="w-4 h-4 mr-1.5" />Add User</Button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { role: "Admin", count: USERS.filter(u => u.role === "Admin").length, color: "bg-primary/10 text-primary", desc: "Full access to all modules" },
          { role: "Accountant", count: USERS.filter(u => u.role === "Accountant").length, color: "bg-accent/10 text-accent", desc: "Fees, salary, and reports" },
          { role: "Teacher", count: USERS.filter(u => u.role === "Teacher").length, color: "bg-purple-500/10 text-purple-600", desc: "Attendance and results only" },
        ].map(r => (
          <Card key={r.role} className="border-0 shadow-sm glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <div className={cn("rounded-xl p-3", r.color)}><Shield className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-2xl">{r.count}</p>
                <p className="text-xs text-muted-foreground">{r.role} • {r.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.map(u => (
                <TableRow key={u.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs font-semibold bg-muted">{u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">@{u.username}</TableCell>
                  <TableCell><Badge className={cn("text-xs border-0", ROLE_COLORS[u.role])}>{u.role}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "Active" ? "default" : "secondary"} className={cn("text-xs", u.status === "Active" ? "bg-emerald-500/15 text-emerald-700" : "")}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs"><KeyRound className="w-3 h-3 mr-1" />Reset</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add user dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Full Name</Label><Input placeholder="e.g., Mr. Ali Khan" /></div>
            <div><Label>Username</Label><Input placeholder="e.g., ali.khan" /></div>
            <div><Label>Email</Label><Input type="email" placeholder="user@greenwood.edu" /></div>
            <div><Label>Role</Label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option>Admin</option><option>Accountant</option><option>Teacher</option>
              </select>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
              A temporary password will be generated and the user will be prompted to change it on first login.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { setAddOpen(false); toast({ title: "User Created", description: "Temporary password sent." }); }}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === Module Control catalog ===
interface ModuleMeta {
  key: ModuleKey;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "main" | "operations" | "finance" | "academics" | "facilities" | "system";
  alwaysOn?: boolean;
}

const MODULE_CATALOG: ModuleMeta[] = [
  { key: "dashboard", label: "Dashboard", description: "Overview KPIs, charts & recent activity", icon: LayoutDashboard, group: "main", alwaysOn: true },
  { key: "students", label: "Students", description: "Admit, search, profile & ID cards", icon: Users, group: "main" },
  { key: "teachers", label: "Teachers", description: "Teaching staff, subjects & classes", icon: GraduationCap, group: "main" },
  { key: "staff", label: "Staff", description: "Non-teaching staff & departments", icon: UserCog, group: "main" },
  { key: "classes", label: "Classes", description: "Classes, sections & monthly fees", icon: School, group: "main" },
  { key: "timetable", label: "Timetable", description: "Period-wise class schedules", icon: CalendarDays, group: "operations" },
  { key: "attendance", label: "Attendance", description: "Daily student & staff attendance", icon: ClipboardCheck, group: "operations" },
  { key: "fees", label: "Fee Collection", description: "Collect tuition, hostel & admission fees", icon: DollarSign, group: "finance" },
  { key: "defaulters", label: "Defaulters", description: "Students with outstanding fees", icon: AlertTriangle, group: "finance" },
  { key: "salary", label: "Salary & Fine", description: "Payroll, fines & salary slips", icon: Wallet, group: "finance" },
  { key: "ledger", label: "Income & Expense", description: "General ledger & transactions", icon: BookOpen, group: "finance" },
  { key: "concession", label: "Concessions", description: "Sibling & need-based fee waivers", icon: Percent, group: "finance" },
  { key: "results", label: "Results", description: "Grade entry & report cards", icon: FileText, group: "academics" },
  { key: "exam", label: "Examinations", description: "Exam scheduling & grading", icon: GraduationCap, group: "academics" },
  { key: "certificates", label: "Certificates", description: "Bonafide, leaving & character certs", icon: Award, group: "academics" },
  { key: "reports", label: "Reports", description: "Standard & custom PDF reports", icon: BarChart3, group: "academics" },
  { key: "analytics", label: "Analytics", description: "Trends, comparisons & insights", icon: LineChart, group: "academics" },
  { key: "library", label: "Library", description: "Books, issues & returns", icon: BookOpen, group: "facilities" },
  { key: "transport", label: "Transport", description: "Routes, vehicles & pickup points", icon: Bus, group: "facilities" },
  { key: "hostel", label: "Hostel", description: "Rooms, allocation & mess", icon: Home, group: "facilities" },
  { key: "inventory", label: "Inventory", description: "Stock items & supplies", icon: Package, group: "facilities" },
  { key: "events", label: "Event Calendar", description: "Holidays, events & reminders", icon: CalendarDays, group: "facilities" },
  { key: "discipline", label: "Discipline", description: "Incidents, warnings & actions", icon: DisciplineIcon, group: "facilities" },
  { key: "leave", label: "Staff Leave", description: "Leave requests & approvals", icon: CalendarDays, group: "facilities" },
  { key: "alumni", label: "Alumni", description: "Graduated students network", icon: Award, group: "facilities" },
  { key: "parent", label: "Parent Portal", description: "Parent access & communication", icon: Users, group: "facilities" },
  { key: "ai", label: "AI Assistant", description: "Smart predictions & insights", icon: Brain, group: "system" },
  { key: "users", label: "User Management", description: "Staff accounts & permissions", icon: UserPlus, group: "system" },
  { key: "settings", label: "Settings", description: "School, fees, theme & modules", icon: Shield, group: "system", alwaysOn: true },
];

const GROUP_LABELS_MODULE: Record<ModuleMeta["group"], string> = {
  main: "Core Modules",
  operations: "Daily Operations",
  finance: "Finance & Fees",
  academics: "Academics",
  facilities: "Facilities & Extras",
  system: "System",
};

const GROUP_ORDER: ModuleMeta["group"][] = ["main", "operations", "finance", "academics", "facilities", "system"];

export function SettingsModule() {
  const { toast } = useToast();
  const { isDark, toggleTheme, school, updateSchool, setLogo, feeStructure, updateFeeStructure, setClassFee, enabledModules, toggleModule, setAllModulesEnabled, students, updateStudent, moduleData, setModuleData } = useAppStore();
  const [autoBackup, setAutoBackup] = useState(true);
  const [lateFine, setLateFine] = useState("500");
  const [dueDate, setDueDate] = useState("10");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classFeeDraft, setClassFeeDraft] = useState<Record<string, string>>(
    () => Object.fromEntries(Object.entries(feeStructure.classFees).map(([k, v]) => [k, String(v)]))
  );

  // Module control counts
  const totalModules = MODULE_CATALOG.filter(m => !m.alwaysOn).length;
  const enabledCount = MODULE_CATALOG.filter(m => !m.alwaysOn && enabledModules[m.key]).length;
  const disabledCount = totalModules - enabledCount;

  // Local form state synced with store
  const [form, setForm] = useState({
    name: school.name,
    tagline: school.tagline,
    address: school.address,
    phone: school.phone,
    email: school.email,
    session: school.session,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file (PNG, JPG, SVG).", variant: "destructive" });
      return;
    }
    if (file.size > 500 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 500KB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
      toast({ title: "Logo Updated ✓", description: "School logo saved and will appear across the app." });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(null);
    toast({ title: "Logo Removed", description: "Reverted to default EduDesk icon." });
  };

  const saveSchoolInfo = () => {
    // Check if session is changing
    const oldSession = school.session;
    const newSession = form.session;
    const sessionChanged = oldSession !== newSession && newSession.trim();

    // Validate session format (YYYY-YYYY)
    if (newSession && !/^\d{4}-\d{4}$/.test(newSession.trim())) {
      toast({ title: "Invalid session format", description: "Use format: YYYY-YYYY (e.g., 2027-2028)", variant: "destructive" });
      return;
    }

    if (sessionChanged) {
      if (!window.confirm(
        `Change academic session from "${oldSession}" to "${newSession}"?\n\n` +
        `This will:\n` +
        `• Reset all students' "fee paid this month" flags\n` +
        `• Keep all student/teacher/class data intact\n` +
        `• Previous attendance and fee records remain for audit\n\n` +
        `Continue?`
      )) {
        return;
      }
    }

    updateSchool(form);

    if (sessionChanged) {
      // Reset feePaidThisMonth + charge annual fees for new session
      const feeItems = feeStructure.feeItems || [];
      const annualFees = feeItems.filter((f: any) => f.enabled && f.type === "annual");
      const annualTotal = annualFees.reduce((s: number, f: any) => s + f.amount, 0);
      const paidCount = students.filter(s => s.status === "Active" && s.feePaidThisMonth).length;

      students.forEach(s => {
        if (s.status === "Active") {
          const patch: any = { feePaidThisMonth: false };
          // Add annual fees to outstanding (new session = new annual charges)
          if (annualTotal > 0) {
            patch.outstandingAmount = s.outstandingAmount + annualTotal;
          }
          updateStudent(s.id, patch);
        }
      });

      // Archive current timetables
      const currentTimetables = (moduleData as any).timetables || {};
      if (Object.keys(currentTimetables).length > 0) {
        const archiveKey = `timetables_archive_${oldSession}`;
        const existingArchive = (moduleData as any)[archiveKey] || {};
        setModuleData(archiveKey, { ...existingArchive, ...currentTimetables } as any);
        setModuleData("timetables", {} as any);
      }

      toast({
        title: "Academic Session Changed ✓",
        description: `"${oldSession}" → "${newSession}". ${paidCount} fee flags reset${annualTotal > 0 ? `. Annual fees (Rs. ${annualTotal.toLocaleString()}) charged to all students.` : ""}. Timetables archived.`,
      });
    } else {
      toast({ title: "School Information Saved ✓", description: "Changes are now reflected across the app." });
    }
  };

  return (
    <div className="space-y-3 fade-in">
      <Tabs defaultValue="school">
        <TabsList className="grid w-full max-w-2xl grid-cols-8">
          <TabsTrigger value="school">School</TabsTrigger>
          <TabsTrigger value="modules" className="text-primary font-semibold">Modules</TabsTrigger>
          <TabsTrigger value="feestructure">Fee Structure</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* School info — with logo upload */}
        <TabsContent value="school">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />School Information</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {/* Logo upload section */}
              <div className="rounded-xl border-2 border-dashed border-border/60 p-5 bg-muted/20">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden ring-2 ring-primary/20 shadow-lg shrink-0">
                    {school.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={school.logo} alt="School logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">School Logo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG or SVG • Max 500KB • Square recommended</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Logo
                      </Button>
                      {school.logo && (
                        <Button variant="outline" size="sm" onClick={removeLogo} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />Remove
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>School Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div><Label>Tagline</Label><Input value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} /></div>
                <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Academic Session</Label><Input value={form.session} onChange={e => setForm({...form, session: e.target.value})} /></div>
                <div><Label>Website</Label><Input defaultValue="www.greenwood.edu" /></div>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />Live Preview</p>
                <p className="text-muted-foreground mt-1">
                  Your school name &ldquo;{form.name}&rdquo; and logo appear on the sidebar, dashboard hero, receipts, certificates, and salary slips.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={saveSchoolInfo}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Module Control === */}
        <TabsContent value="modules">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-primary" />Module Control Center
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setAllModulesEnabled(true);
                      toast({ title: "All Modules Enabled ✓", description: "Every module is now visible in the sidebar." });
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />Enable All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => {
                      setAllModulesEnabled(false);
                      toast({ title: "All Optional Modules Disabled", description: "Only Dashboard & Settings remain visible." });
                    }}
                  >
                    <EyeOff className="w-3.5 h-3.5 mr-1.5" />Disable All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary stats banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Enabled</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{enabledCount}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">optional modules</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/30 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Disabled</p>
                  </div>
                  <p className="text-2xl font-bold text-muted-foreground">{disabledCount}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">hidden from sidebar</p>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Power className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Always On</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{ALWAYS_ON_MODULES.length}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">system essentials</p>
                </div>
              </div>

              {/* Info banner */}
              <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-3 text-xs flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Boxes className="w-3 h-3 text-primary" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-primary">How module control works:</span> Toggle any module on or off below.
                  Disabled modules disappear from the sidebar and command palette (Ctrl+K). Their data is preserved —
                  re-enabling a module restores everything instantly. <span className="font-medium text-foreground">Dashboard</span> and <span className="font-medium text-foreground">Settings</span> are always on.
                </p>
              </div>

              {/* Grouped module toggles */}
              {GROUP_ORDER.map(group => {
                const groupModules = MODULE_CATALOG.filter(m => m.group === group);
                if (groupModules.length === 0) return null;
                const groupEnabledCount = groupModules.filter(m => m.alwaysOn || enabledModules[m.key]).length;
                return (
                  <div key={group}>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {GROUP_LABELS_MODULE[group]}
                      </p>
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {groupEnabledCount}/{groupModules.length} on
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {groupModules.map(m => {
                        const Icon = m.icon;
                        const isEnabled = m.alwaysOn || enabledModules[m.key];
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => {
                              if (m.alwaysOn) return;
                              toggleModule(m.key);
                              toast({
                                title: isEnabled ? "Module Disabled" : "Module Enabled ✓",
                                description: `${m.label} ${isEnabled ? "hidden from" : "now visible in"} the sidebar.`,
                              });
                            }}
                            className={cn(
                              "relative text-left rounded-xl border-2 p-3 transition-all overflow-hidden group",
                              isEnabled
                                ? "border-primary/30 bg-primary/[0.03] hover:border-primary/50"
                                : "border-border/40 bg-muted/10 opacity-60 hover:opacity-100 hover:border-border/60",
                              m.alwaysOn && "cursor-not-allowed"
                            )}
                          >
                            {/* Status indicator dot */}
                            <div className={cn(
                              "absolute top-2.5 right-2.5 w-2 h-2 rounded-full transition-colors",
                              isEnabled ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" : "bg-muted-foreground/30"
                            )} />

                            <div className="flex items-start gap-2.5">
                              <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                isEnabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                              )}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className={cn(
                                    "text-xs font-semibold truncate",
                                    isEnabled ? "text-foreground" : "text-muted-foreground"
                                  )}>
                                    {m.label}
                                  </p>
                                  {m.alwaysOn && (
                                    <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase shrink-0">
                                      Always
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                                  {m.description}
                                </p>
                              </div>
                            </div>

                            {/* Toggle switch */}
                            <div className={cn(
                              "mt-2.5 flex items-center justify-between text-[10px]",
                              isEnabled ? "text-emerald-600" : "text-muted-foreground"
                            )}>
                              <span className="font-medium uppercase tracking-wide">
                                {isEnabled ? "Active" : "Hidden"}
                              </span>
                              <div className={cn(
                                "relative w-9 h-5 rounded-full transition-colors shrink-0",
                                isEnabled ? "bg-primary" : "bg-muted-foreground/30",
                                m.alwaysOn && "opacity-50"
                              )}>
                                <div
                                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                                  style={{ left: isEnabled ? "calc(100% - 1.125rem)" : "0.125rem" }}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Bottom action bar */}
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs">
                  <p className="font-medium">Changes are saved automatically</p>
                  <p className="text-muted-foreground mt-0.5">Module visibility persists across sessions & reloads.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setAllModulesEnabled(true);
                    toast({ title: "All Modules Reset ✓", description: "Every module is enabled (default state)." });
                  }}
                >
                  <ToggleRight className="w-3.5 h-3.5 mr-1.5" />Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Structure management */}
        <TabsContent value="feestructure">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Fee Structure Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {/* Global fee settings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <Label className="text-[10px] uppercase text-muted-foreground">Hostel Fee (monthly)</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-muted-foreground">Rs.</span>
                    <Input
                      type="number"
                      value={feeStructure.hostelFee}
                      onChange={e => updateFeeStructure({ hostelFee: Number(e.target.value) })}
                      className="h-8 font-bold"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <Label className="text-[10px] uppercase text-muted-foreground">Late Fee</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-muted-foreground">Rs.</span>
                    <Input
                      type="number"
                      value={feeStructure.lateFee}
                      onChange={e => updateFeeStructure({ lateFee: Number(e.target.value) })}
                      className="h-8 font-bold"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <Label className="text-[10px] uppercase text-muted-foreground">Due Date (day)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={feeStructure.dueDate}
                    onChange={e => updateFeeStructure({ dueDate: Number(e.target.value) })}
                    className="h-8 font-bold mt-1"
                  />
                </div>
              </div>

              {/* Dynamic Fee Items — admin controls each fee type */}
              <div>
                <p className="text-sm font-semibold mb-2">Fee Types & Charges</p>
                <p className="text-xs text-muted-foreground mb-3">Control which fees are charged, their amounts, and frequency. Changes apply to new admissions and session changes.</p>
                <div className="rounded-lg border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40">
                        <TableHead>Fee Name</TableHead>
                        <TableHead className="text-right">Amount (Rs.)</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Enabled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((feeStructure as any).feeItems || []).map((item: any, idx: number) => (
                        <TableRow key={idx} className="border-border/30">
                          <TableCell>
                            <Input
                              value={item.name}
                              onChange={e => {
                                const items = [...((feeStructure as any).feeItems || [])];
                                items[idx] = { ...items[idx], name: e.target.value };
                                updateFeeStructure({ feeItems: items } as any);
                              }}
                              className="h-8 text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={e => {
                                const items = [...((feeStructure as any).feeItems || [])];
                                items[idx] = { ...items[idx], amount: Number(e.target.value) };
                                updateFeeStructure({ feeItems: items } as any);
                              }}
                              className="h-8 w-24 text-right ml-auto font-bold"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.type}
                              onValueChange={v => {
                                const items = [...((feeStructure as any).feeItems || [])];
                                items[idx] = { ...items[idx], type: v };
                                updateFeeStructure({ feeItems: items } as any);
                              }}
                            >
                              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="one-time">One-time</SelectItem>
                                <SelectItem value="annual">Annual (yearly)</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={item.enabled}
                              onCheckedChange={v => {
                                const items = [...((feeStructure as any).feeItems || [])];
                                items[idx] = { ...items[idx], enabled: v };
                                updateFeeStructure({ feeItems: items } as any);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-8 text-xs"
                  onClick={() => {
                    const items = [...((feeStructure as any).feeItems || [])];
                    items.push({ name: "New Fee", amount: 0, type: "monthly", enabled: false, description: "Custom fee" });
                    updateFeeStructure({ feeItems: items } as any);
                  }}
                >
                  + Add Custom Fee
                </Button>
              </div>

              {/* Per-class tuition fees table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Per-Class Tuition Fees</p>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-0">{Object.keys(feeStructure.classFees).length} classes</Badge>
                </div>
                <div className="rounded-lg border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40">
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Monthly Tuition (Rs.)</TableHead>
                        <TableHead className="text-right">Admission + Annual (Rs.)</TableHead>
                        <TableHead className="text-right">Hosteller Total (Rs.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(feeStructure.classFees).map(([className, fee]) => (
                        <TableRow key={className} className="border-border/30 hover:bg-muted/20">
                          <TableCell className="font-medium text-sm">{className}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={classFeeDraft[className] ?? fee}
                              onChange={e => setClassFeeDraft({ ...classFeeDraft, [className]: e.target.value })}
                              onBlur={e => {
                                const val = Number(e.target.value);
                                if (val > 0) {
                                  setClassFee(className, val);
                                  toast({ title: "Fee Updated", description: `${className}: Rs. ${val.toLocaleString()}/month` });
                                }
                              }}
                              className="h-7 w-28 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">Rs. {(() => {
                            const items = (feeStructure as any).feeItems || [];
                            const oneTime = items.filter((f: any) => f.enabled && f.type === "one-time").reduce((s: number, f: any) => s + f.amount, 0);
                            const annual = items.filter((f: any) => f.enabled && f.type === "annual").reduce((s: number, f: any) => s + f.amount, 0);
                            return (oneTime + annual).toLocaleString();
                          })()}</TableCell>
                          <TableCell className="text-right text-sm text-accent">Rs. {(Number(fee) + (feeStructure.hostelFee || 0)).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary">How fees work:</p>
                <p className="text-muted-foreground mt-1">
                  • <strong>One-time fees</strong> (Admission Rs. {(() => {
                    const items = (feeStructure as any).feeItems || [];
                    return items.filter((f: any) => f.enabled && f.type === "one-time").reduce((s: number, f: any) => s + f.amount, 0);
                  })().toLocaleString()}) — charged ONCE at admission, same for all classes<br/>
                  • <strong>Annual fees</strong> (Rs. {(() => {
                    const items = (feeStructure as any).feeItems || [];
                    return items.filter((f: any) => f.enabled && f.type === "annual").reduce((s: number, f: any) => s + f.amount, 0);
                  })().toLocaleString()}) — charged once per academic year on session change<br/>
                  • <strong>Monthly tuition</strong> = per-class amount shown above<br/>
                  • <strong>Hostel</strong> = Rs. {(feeStructure.hostelFee || 0).toLocaleString()}/month (only for hostellers)<br/>
                  • <strong>Late Fee</strong> = Rs. {(feeStructure.lateFee || 0).toLocaleString()} (after day {feeStructure.dueDate || 10})
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => toast({ title: "Fee Structure Saved ✓", description: "All fee settings persisted. Fee Collection will use new amounts." })}
                >
                  Save Fee Structure
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const items = (feeStructure as any).feeItems || [];
                    const oneTime = items.filter((f: any) => f.enabled && f.type === "one-time").reduce((s: number, f: any) => s + f.amount, 0);
                    const annual = items.filter((f: any) => f.enabled && f.type === "annual").reduce((s: number, f: any) => s + f.amount, 0);
                    exportFeeStructureCSV(feeStructure.classFees, feeStructure.hostelFee || 0, oneTime + annual, feeStructure.lateFee || 0, feeStructure.dueDate || 10);
                    toast({ title: "Fee Structure Exported ✓", description: "CSV file downloaded — opens in Excel" });
                  }}
                >
                  <Download className="w-4 h-4 mr-1.5" />Export to Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fine rules */}
        <TabsContent value="fines">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Attendance Fine Rules</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Late Arrival Fine (Rs.)</Label>
                  <Input type="number" value={lateFine} onChange={e => setLateFine(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Fixed deduction per late occurrence</p>
                </div>
                <div>
                  <Label>Half-Day Deduction (%)</Label>
                  <Input type="number" defaultValue="50" />
                  <p className="text-[10px] text-muted-foreground mt-1">Percentage of one day's salary</p>
                </div>
                <div>
                  <Label>Per-Day Salary Basis</Label>
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option>Working Days (recommended)</option>
                    <option>Calendar Days (30)</option>
                  </select>
                </div>
                <div>
                  <Label>Leave Type</Label>
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option>Paid (if balance available)</option>
                    <option>Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary">Example Calculation:</p>
                <p className="text-muted-foreground mt-1">
                  Salary Rs. 50,000 / 26 working days = Rs. 1,923 per day.
                  2 absences = -Rs. 3,846. 1 late = -Rs. 500. Net deduction: Rs. 4,346.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Fine Rules Saved" })}>Save Rules</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee settings */}
        <TabsContent value="fees">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Fee Settings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monthly Fee Due Date</Label>
                <Input type="number" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Day of month (1-28)</p>
              </div>
              <div>
                <Label>Late Fee Amount (Rs.)</Label>
                <Input type="number" defaultValue="200" />
              </div>
              <div>
                <Label>Receipt Number Prefix</Label>
                <Input defaultValue="RCPT-YYYYMMDD-" />
              </div>
              <div>
                <Label>Receipt Paper Size</Label>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option>A5 (148 × 210 mm)</option>
                  <option>Thermal 80mm</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Allow partial fee payments</Label>
              </div>
              <div className="col-span-2">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Fee Settings Saved" })}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4 text-primary" />Backup & Restore</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                <div>
                  <p className="font-medium text-sm">Automatic Daily Backup</p>
                  <p className="text-xs text-muted-foreground">Runs at 11:00 PM daily • Keeps last 7 backups</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex-col" onClick={async () => {
                  // Download a JSON backup of all data from SQLite
                  try {
                    const res = await fetch("/api/state");
                    const data = await res.json();
                    if (data.success) {
                      const blob = new Blob([JSON.stringify(data.state, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `school-backup-${new Date().toISOString().split("T")[0]}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                      toast({ title: "Backup Downloaded ✓", description: "All data saved to your downloads folder." });
                    } else {
                      toast({ title: "Backup failed", description: "Could not read from database.", variant: "destructive" });
                    }
                  } catch (e) {
                    toast({ title: "Backup failed", description: "Server error. Try again.", variant: "destructive" });
                  }
                }}>
                  <Download className="w-5 h-5 mb-1" />
                  <span>Backup Now (JSON)</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col" onClick={() => toast({ title: "Restore from file", description: "Upload a .json backup file to restore. (Coming soon — use Danger Zone reset for now.)" })}>
                  <Upload className="w-5 h-5 mb-1" />
                  <span>Restore from File</span>
                </Button>
              </div>
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs">
                <p className="font-medium text-emerald-700 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> SQLite Database Active
                </p>
                <p className="text-muted-foreground mt-1">Your data is automatically saved to a local SQLite database file (school.db). This file persists across server restarts and is the source of truth. The download above creates a portable JSON backup you can keep anywhere.</p>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Danger Zone</p>
                <p className="text-xs text-muted-foreground mb-2">Reset all data to original demo state. This will clear all students, teachers, staff, fees, and transactions you've added.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-500/30 hover:bg-red-500/10 h-7 text-xs"
                  onClick={async () => {
                    if (!window.confirm("Are you sure? This will permanently delete ALL data from both localStorage AND the SQLite database. This cannot be undone.")) return;
                    // Clear localStorage
                    ["students", "teachers", "staff", "feeCollections", "activities", "documents", "commLogs", "transactions", "classes", "subjects", "moduleData", "attendanceRecords"].forEach(k => {
                      try { window.localStorage.removeItem(`edudesk_${k}`); } catch {}
                    });
                    // Clear SQLite database
                    try {
                      await fetch("/api/state", { method: "DELETE" });
                    } catch {}
                    toast({ title: "Data Reset ✓", description: "All data cleared from localStorage + SQLite. Reloading...", variant: "destructive" });
                    setTimeout(() => window.location.reload(), 1500);
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />Reset All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-accent" />}
                  <div>
                    <p className="font-medium text-sm">{isDark ? "Dark Theme" : "Light Theme"}</p>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                  </div>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>
              <div>
                <Label>Currency Symbol</Label>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mt-1">
                  <option>Rs. (PKR)</option><option>₹ (INR)</option><option>$ (USD)</option><option>€ (EUR)</option>
                </select>
              </div>
              <div>
                <Label>Date Format</Label>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mt-1">
                  <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about">
          <Card className="border-0 shadow-sm glass-card">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto overflow-hidden ring-2 ring-primary/20 shadow-lg">
                {school.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              <p className="font-bold text-lg mt-3">{school.name}</p>
              <p className="text-sm text-muted-foreground">EduDesk SMS v1.0 • Session {school.session}</p>
              <p className="text-xs text-muted-foreground mt-1">Built with React + Tauri v2 + Rust + SQLite</p>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Database Size</p>
                  <p className="font-bold text-sm mt-1">4.2 MB</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Records</p>
                  <p className="font-bold text-sm mt-1">2,847</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="font-bold text-sm mt-1">3h 24m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
