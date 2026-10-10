"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/sms-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, AlertTriangle, Shield, CheckCircle, Bell, Phone, Mail,
  Users, TrendingUp, GraduationCap, Award, Briefcase, Search,
  Calendar, User, Zap,
} from "lucide-react";
import { INCIDENTS, ALUMNI, type Incident, type Alumnus } from "@/lib/sms-data";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// DISCIPLINE MODULE
// ═══════════════════════════════════════════════════════════════
const SEVERITY_STYLES: Record<string, string> = {
  Low: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Medium: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  High: "bg-red-500/10 text-red-600 border-red-500/20",
};

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-red-500/10 text-red-600",
  Resolved: "bg-emerald-500/10 text-emerald-600",
  Escalated: "bg-purple-500/10 text-purple-600",
};

const INCIDENT_TYPES = ["Late Arrival", "Absence", "Misbehavior", "Bullying", "Academic", "Uniform Violation", "Other"];

export function DisciplineModule() {
  const [addOpen, setAddOpen] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({ studentId: "", studentName: "", class: "", type: "Late Arrival", severity: "Low", description: "", action: "", reportedBy: "" });

  const filtered = filter === "all" ? incidents : incidents.filter(i => i.status === filter);
  const openCount = incidents.filter(i => i.status === "Open").length;
  const escalatedCount = incidents.filter(i => i.status === "Escalated").length;
  const resolvedCount = incidents.filter(i => i.status === "Resolved").length;
  const highSeverity = incidents.filter(i => i.severity === "High").length;

  const handleAdd = () => {
    if (!form.studentName || !form.description) return;
    const newIncident: Incident = {
      id: `INC-${String(Date.now()).slice(-6)}`,
      studentId: form.studentId || "—",
      studentName: form.studentName,
      class: form.class || "—",
      date: new Date().toISOString().split("T")[0],
      type: form.type as any,
      severity: form.severity as any,
      description: form.description,
      action: form.action || "Pending review",
      reportedBy: form.reportedBy || "Admin",
      status: "Open",
      parentNotified: false,
    };
    setIncidents([newIncident, ...incidents]);
    setAddOpen(false);
    setForm({ studentId: "", studentName: "", class: "", type: "Late Arrival", severity: "Low", description: "", action: "", reportedBy: "" });
  };

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Track behavioral incidents, warnings, and parent notifications.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Log Incident</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-red-500/10 p-1.5"><AlertTriangle className="w-4 h-4 text-red-600" /></div><div><p className="text-xs text-muted-foreground">Open Cases</p><p className="text-xl font-bold">{openCount}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-purple-500/10 p-1.5"><Shield className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">Escalated</p><p className="text-xl font-bold">{escalatedCount}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Resolved</p><p className="text-xl font-bold">{resolvedCount}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-orange-500/10 p-1.5"><AlertTriangle className="w-5 h-5 text-orange-600" /></div><div><p className="text-xs text-muted-foreground">High Severity</p><p className="text-xl font-bold">{highSeverity}</p></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {["all", "Open", "Escalated", "Resolved"].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === t ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted")}>
            {t === "all" ? "All Incidents" : t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(inc => (
          <Card key={inc.id} className="border-0 shadow-sm glass-card card-hover">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  inc.severity === "High" ? "bg-red-500/15" : inc.severity === "Medium" ? "bg-orange-500/15" : "bg-yellow-500/15")}>
                  <AlertTriangle className={cn("w-5 h-5", inc.severity === "High" ? "text-red-600" : inc.severity === "Medium" ? "text-orange-600" : "text-yellow-600")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{inc.studentName}</p>
                    <span className="text-[10px] text-muted-foreground">{inc.class}</span>
                    <Badge variant="outline" className={cn("text-[9px] border", SEVERITY_STYLES[inc.severity])}>{inc.severity}</Badge>
                    <Badge variant="outline" className="text-[9px]">{inc.type}</Badge>
                    <Badge variant="outline" className={cn("text-[9px] border-0", STATUS_STYLES[inc.status])}>{inc.status}</Badge>
                    {inc.parentNotified && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-0"><Bell className="w-2 h-2 mr-0.5 inline" />Parent Notified</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{inc.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{inc.date}</span>
                    <span className="text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />Reported by {inc.reportedBy}</span>
                    <span className="text-primary font-medium flex items-center gap-1"><Zap className="w-3 h-3" />{inc.action}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-600" />Log Discipline Incident</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Student Name *</Label><Input value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} /></div>
              <div><Label>Class</Label><Input value={form.class} onChange={e => setForm({...form, class: e.target.value})} placeholder="Grade 9-A" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({...form, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{INCIDENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Severity</Label><Select value={form.severity} onValueChange={v => setForm({...form, severity: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Description *</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What happened?" /></div>
            <div><Label>Action Taken</Label><Input value={form.action} onChange={e => setForm({...form, action: e.target.value})} placeholder="e.g., Verbal warning, Detention" /></div>
            <div><Label>Reported By</Label><Input value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})} placeholder="Teacher name" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.studentName || !form.description}>Log Incident</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ALUMNI MODULE
// ═══════════════════════════════════════════════════════════════
const STATUS_ICONS: Record<string, any> = {
  Studying: GraduationCap, Employed: Briefcase, Business: TrendingUp, Unknown: Users,
};
const STATUS_COLORS: Record<string, string> = {
  Studying: "bg-primary/10 text-primary", Employed: "bg-emerald-500/10 text-emerald-600", Business: "bg-accent/10 text-accent", Unknown: "bg-muted text-muted-foreground",
};

export function AlumniModule() {
  const [addOpen, setAddOpen] = useState(false);
  const [alumni, setAlumni] = useState<Alumnus[]>(ALUMNI);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const years = Array.from(new Set(alumni.map(a => a.graduationYear))).sort((a, b) => b.localeCompare(a));
  const filtered = alumni
    .filter(a => yearFilter === "all" || a.graduationYear === yearFilter)
    .filter(a => !search || `${a.name} ${a.profession} ${a.institution}`.toLowerCase().includes(search.toLowerCase()));

  const totalDonations = alumni.reduce((s, a) => s + a.donationAmount, 0);
  const employedCount = alumni.filter(a => a.currentStatus === "Employed").length;
  const studyingCount = alumni.filter(a => a.currentStatus === "Studying").length;

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Track graduated students, their careers, and donations.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Alumnus</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><Users className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Alumni</p><p className="text-xl font-bold">{alumni.length}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><Briefcase className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Employed</p><p className="text-xl font-bold">{employedCount}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-purple-500/10 p-1.5"><GraduationCap className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">Studying</p><p className="text-xl font-bold">{studyingCount}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-accent/10 p-1.5"><Award className="w-4 h-4 text-accent" /></div><div><p className="text-xs text-muted-foreground">Donations</p><p className="text-lg font-bold">Rs. {totalDonations.toLocaleString()}</p></div></CardContent></Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search alumni by name, profession, institution..." className="pl-9 bg-background/60" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-32 bg-background/60"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(a => {
          const Icon = STATUS_ICONS[a.currentStatus] || Users;
          return (
            <Card key={a.id} className="border-0 shadow-sm glass-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{a.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Class of {a.graduationYear} • {a.lastClass}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Icon className={cn("w-3 h-3", STATUS_COLORS[a.currentStatus].split(" ")[1])} />
                      <Badge variant="outline" className={cn("text-[9px] border-0", STATUS_COLORS[a.currentStatus])}>{a.currentStatus}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> {a.profession}</p>
                  <p className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> {a.institution}</p>
                  <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {a.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {a.phone}</p>
                </div>
                {a.donationAmount > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-accent" /><span className="text-xs font-medium text-accent">Donated</span></div>
                    <span className="font-bold text-sm text-accent">Rs. {a.donationAmount.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add Alumnus</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Name *</Label><Input placeholder="Full name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Graduation Year</Label><Input type="number" placeholder="2024" /></div>
              <div><Label>Last Class</Label><Input placeholder="Grade 10" /></div>
            </div>
            <div><Label>Current Status</Label><Select defaultValue="Studying"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Studying">Studying</SelectItem><SelectItem value="Employed">Employed</SelectItem><SelectItem value="Business">Business</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></div>
            <div><Label>Institution / Company</Label><Input placeholder="University or company name" /></div>
            <div><Label>Profession</Label><Input placeholder="e.g., Software Developer" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Email</Label><Input type="email" /></div><div><Label>Phone</Label><Input placeholder="+92 3xx" /></div></div>
            <div><Label>Donation Amount (Rs.)</Label><Input type="number" defaultValue={0} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(false)}>Add Alumnus</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PARENT PORTAL MODULE (Read-only view)
// ═══════════════════════════════════════════════════════════════
export function ParentModule() {
  const [searchId, setSearchId] = useState("");
  const [foundStudent, setFoundStudent] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (students: any[]) => {
    const s = students.find(st => st.id.toLowerCase() === searchId.toLowerCase() || st.name.toLowerCase().includes(searchId.toLowerCase()));
    setFoundStudent(s || null);
    setSearched(true);
  };

  return (
    <ParentPortal searchId={searchId} setSearchId={setSearchId} foundStudent={foundStudent} searched={searched} onSearch={handleSearch} />
  );
}

function ParentPortal({ searchId, setSearchId, foundStudent, searched, onSearch }: any) {
  const { students, feeCollections, school } = useAppStore();

  return (
    <div className="space-y-3 fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground shadow-lg">
        <div className="absolute inset-0 opacity-10 pattern-grid" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative">
          <h2 className="text-2xl font-bold">{school.name} — Parent Portal</h2>
          <p className="text-sm opacity-80 mt-1">Enter your child's Student ID or name to view their information.</p>
          <div className="flex gap-2 mt-4 max-w-md">
            <Input placeholder="Enter Student ID (e.g., SCH-2026-0001) or name..." value={searchId} onChange={e => setSearchId(e.target.value)} className="bg-white/15 border-white/20 text-white placeholder:text-white/50" onKeyDown={e => e.key === "Enter" && onSearch(students)} />
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => onSearch(students)}><Search className="w-4 h-4 mr-1" />Search</Button>
          </div>
        </div>
      </div>

      {searched && !foundStudent && (
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium text-sm">No student found</p>
          <p className="text-xs text-muted-foreground mt-1">Please check the Student ID and try again.</p>
        </CardContent></Card>
      )}

      {foundStudent && (
        <div className="space-y-3">
          {/* Student header */}
          <Card className="border-0 shadow-sm glass-card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-accent/5 p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/20">
                <span className="text-xl font-bold text-primary">{foundStudent.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{foundStudent.name}</h3>
                <p className="text-sm text-muted-foreground">{foundStudent.id} • {foundStudent.class}-{foundStudent.section} • Roll #{foundStudent.rollNo}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">🩸 {foundStudent.bloodGroup}</Badge>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-0">Attendance: {foundStudent.attendancePct}%</Badge>
                  {foundStudent.isHosteller && <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-0">🏠 Hosteller</Badge>}
                </div>
              </div>
            </div>
          </Card>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm glass-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Parent Information</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Father:</span><span className="font-medium">{foundStudent.fatherName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Father's Phone:</span><span className="font-medium">{foundStudent.fatherPhone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Father's Occupation:</span><span className="font-medium">{foundStudent.fatherOccupation}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mother:</span><span className="font-medium">{foundStudent.motherName}</span></div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm glass-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Fee Status</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly Fee:</span><span className="font-medium">Rs. {foundStudent.monthlyFee.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Outstanding:</span><span className={cn("font-bold", foundStudent.outstandingAmount > 0 ? "text-red-600" : "text-emerald-600")}>{foundStudent.outstandingAmount > 0 ? `Rs. ${foundStudent.outstandingAmount.toLocaleString()}` : "✓ Clear"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">This Month:</span><Badge variant="outline" className={cn("text-xs border-0", foundStudent.feePaidThisMonth ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>{foundStudent.feePaidThisMonth ? "Paid ✓" : "Pending"}</Badge></div>
              </CardContent>
            </Card>
          </div>

          {/* Recent fee receipts */}
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Fee Payments</CardTitle></CardHeader>
            <CardContent>
              {feeCollections.filter((f: any) => f.studentId === foundStudent.id).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No fee payments recorded.</p>
              ) : (
                <div className="space-y-1.5">
                  {feeCollections.filter((f: any) => f.studentId === foundStudent.id).slice(0, 5).map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{f.receiptNo}</span>
                      <span className="flex-1 text-muted-foreground">{f.date} • {f.feeType}</span>
                      <span className="font-bold text-emerald-600">Rs. {f.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
