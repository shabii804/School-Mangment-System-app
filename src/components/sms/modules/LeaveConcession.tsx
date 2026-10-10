"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, CheckCircle, XCircle, Clock, Calendar, TrendingUp, Users,
  Wallet, Award, Percent, Gift, Shield, ArrowRight,
} from "lucide-react";
import {
  LEAVE_REQUESTS, LEAVE_BALANCES, CONCESSIONS, ACADEMIC_SESSIONS,
  type LeaveRequest, type LeaveBalance, type Concession, type AcademicSession,
} from "@/lib/sms-data";
import { useAppStore } from "@/lib/sms-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// STAFF LEAVE MANAGEMENT MODULE
// ═══════════════════════════════════════════════════════════════
const LEAVE_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-500/10 text-yellow-600",
  Approved: "bg-emerald-500/10 text-emerald-600",
  Rejected: "bg-red-500/10 text-red-600",
  Cancelled: "bg-muted text-muted-foreground",
};

const LEAVE_TYPE_STYLES: Record<string, string> = {
  Casual: "bg-blue-500/10 text-blue-600",
  Sick: "bg-red-500/10 text-red-600",
  Earned: "bg-primary/10 text-primary",
  Maternity: "bg-pink-500/10 text-pink-600",
  "Without Pay": "bg-orange-500/10 text-orange-600",
  Emergency: "bg-purple-500/10 text-purple-600",
};

export function LeaveModule() {
  const { toast } = useToast();
  const [tab, setTab] = useState("requests");
  const [addOpen, setAddOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS);
  const [form, setForm] = useState({ employeeId: "", employeeName: "", type: "Casual", fromDate: "", toDate: "", days: 1, reason: "" });

  const pending = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;
  const rejected = requests.filter(r => r.status === "Rejected").length;
  const totalDays = requests.filter(r => r.status === "Approved").reduce((s, r) => s + r.days, 0);

  const handleAdd = () => {
    if (!form.employeeName || !form.fromDate) return;
    const newReq: LeaveRequest = {
      id: `LV-${String(Date.now()).slice(-6)}`,
      employeeId: form.employeeId || "—",
      employeeName: form.employeeName,
      type: form.type as any,
      fromDate: form.fromDate,
      toDate: form.toDate || form.fromDate,
      days: form.days,
      reason: form.reason,
      status: "Pending",
      appliedDate: new Date().toISOString().split("T")[0],
    };
    setRequests([newReq, ...requests]);
    toast({ title: "Leave Request Submitted ✓", description: `${form.employeeName} — ${form.days} day(s) ${form.type} leave` });
    setAddOpen(false);
    setForm({ employeeId: "", employeeName: "", type: "Casual", fromDate: "", toDate: "", days: 1, reason: "" });
  };

  const handleAction = (id: string, action: "Approved" | "Rejected") => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: action, approvedBy: "Admin", comments: action === "Approved" ? "Approved by Admin" : "Rejected by Admin" } : r));
    const req = requests.find(r => r.id === id);
    toast({ title: `Leave ${action} ✓`, description: `${req?.employeeName} — ${action}`, variant: action === "Rejected" ? "destructive" : "default" });
  };

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage staff leave requests, balances, and approvals.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Apply Leave</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-yellow-500/10 p-1.5"><Clock className="w-4 h-4 text-yellow-600" /></div><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold">{pending}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Approved</p><p className="text-xl font-bold">{approved}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-red-500/10 p-1.5"><XCircle className="w-4 h-4 text-red-600" /></div><div><p className="text-xs text-muted-foreground">Rejected</p><p className="text-xl font-bold">{rejected}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><Calendar className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Leave Days</p><p className="text-xl font-bold">{totalDays}</p></div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
        </TabsList>

        {/* Leave Requests */}
        <TabsContent value="requests" className="space-y-3">
          <div className="space-y-2">
            {requests.map(req => (
              <Card key={req.id} className="border-0 shadow-sm glass-card card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      req.status === "Approved" ? "bg-emerald-500/15" : req.status === "Rejected" ? "bg-red-500/15" : "bg-yellow-500/15")}>
                      {req.status === "Approved" ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : req.status === "Rejected" ? <XCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{req.employeeName}</p>
                        <Badge variant="outline" className={cn("text-[9px] border-0", LEAVE_TYPE_STYLES[req.type])}>{req.type}</Badge>
                        <Badge variant="outline" className={cn("text-[9px] border-0", LEAVE_STATUS_STYLES[req.status])}>{req.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{req.reason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>📅 {req.fromDate} → {req.toDate}</span>
                        <span>⏱️ {req.days} day(s)</span>
                        <span>👤 Applied: {req.appliedDate}</span>
                        {req.approvedBy && <span>✓ By: {req.approvedBy}</span>}
                      </div>
                      {req.comments && <p className="text-xs text-muted-foreground mt-1 italic">💬 {req.comments}</p>}
                    </div>
                    {req.status === "Pending" && (
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => handleAction(req.id, "Approved")}><CheckCircle className="w-3 h-3 mr-1" />Approve</Button>
                        <Button size="sm" variant="outline" className="h-7 text-red-600 text-xs" onClick={() => handleAction(req.id, "Rejected")}><XCircle className="w-3 h-3 mr-1" />Reject</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leave Balances */}
        <TabsContent value="balances">
          <Card className="border-0 shadow-sm glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-border/40">
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-center">Casual (10)</TableHead>
                  <TableHead className="text-center">Sick (15)</TableHead>
                  <TableHead className="text-center">Earned (20)</TableHead>
                  <TableHead className="text-center">Total Used</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {LEAVE_BALANCES.map(b => {
                    const totalUsed = b.casual.used + b.sick.used + b.earned.used;
                    return (
                      <TableRow key={b.employeeId} className="border-border/30 hover:bg-muted/30">
                        <TableCell className="font-medium text-sm">{b.employeeName}<p className="text-[10px] text-muted-foreground">{b.employeeId}</p></TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("font-bold text-sm", b.casual.remaining < 3 && "text-red-600")}>{b.casual.remaining}</span>
                            <span className="text-[10px] text-muted-foreground">({b.casual.used} used)</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mx-auto mt-1"><div className="h-full bg-blue-500" style={{ width: `${b.casual.total > 0 ? (b.casual.used / b.casual.total) * 100 : 0}%` }} /></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("font-bold text-sm", b.sick.remaining < 3 && "text-red-600")}>{b.sick.remaining}</span>
                            <span className="text-[10px] text-muted-foreground">({b.sick.used} used)</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mx-auto mt-1"><div className="h-full bg-red-500" style={{ width: `${b.sick.total > 0 ? (b.sick.used / b.sick.total) * 100 : 0}%` }} /></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("font-bold text-sm", b.earned.remaining < 3 && "text-red-600")}>{b.earned.remaining}</span>
                            <span className="text-[10px] text-muted-foreground">({b.earned.used} used)</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mx-auto mt-1"><div className="h-full bg-primary" style={{ width: `${b.earned.total > 0 ? (b.earned.used / b.earned.total) * 100 : 0}%` }} /></div>
                        </TableCell>
                        <TableCell className="text-center"><span className="font-bold text-sm">{totalUsed}</span><span className="text-[10px] text-muted-foreground">/45</span></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Apply Leave Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Employee Name *</Label><Input value={form.employeeName} onChange={e => setForm({...form, employeeName: e.target.value})} /></div>
              <div><Label>Employee ID</Label><Input value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="T-001" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Leave Type</Label><Select value={form.type} onValueChange={v => setForm({...form, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Casual", "Sick", "Earned", "Maternity", "Without Pay", "Emergency"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Days</Label><Input type="number" value={form.days} onChange={e => setForm({...form, days: Number(e.target.value)})} min={1} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From Date *</Label><Input type="date" value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})} /></div>
              <div><Label>To Date</Label><Input type="date" value={form.toDate} onChange={e => setForm({...form, toDate: e.target.value})} /></div>
            </div>
            <div><Label>Reason</Label><Input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Brief reason for leave" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.employeeName || !form.fromDate}>Submit Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEE CONCESSION / SCHOLARSHIP MODULE
// ═══════════════════════════════════════════════════════════════
const CONCESSION_TYPE_ICONS: Record<string, any> = {
  "Sibling Discount": Users, "Staff Child": Shield, "Merit Scholarship": Award,
  "Financial Aid": Gift, "Early Payment": Percent, "Full Scholarship": Award, "Custom": Wallet,
};
const CONCESSION_TYPE_COLORS: Record<string, string> = {
  "Sibling Discount": "bg-blue-500/10 text-blue-600", "Staff Child": "bg-purple-500/10 text-purple-600",
  "Merit Scholarship": "bg-emerald-500/10 text-emerald-600", "Financial Aid": "bg-accent/10 text-accent",
  "Early Payment": "bg-yellow-500/10 text-yellow-600", "Full Scholarship": "bg-primary/10 text-primary", "Custom": "bg-muted text-muted-foreground",
};
const CONCESSION_STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-600", Expired: "bg-muted text-muted-foreground", Revoked: "bg-red-500/10 text-red-600",
};

export function ConcessionModule() {
  const { toast } = useToast();
  const { students } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [concessions, setConcessions] = useState<Concession[]>(CONCESSIONS);
  const [form, setForm] = useState({ studentId: "", studentName: "", class: "", type: "Sibling Discount", percentage: 0, fixedAmount: 0, reason: "", validFrom: "", validTo: "" });
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Filter students by selected class
  const classOptions = Array.from(new Set(students.filter(s => s.status === "Active").map(s => s.class))).sort();
  const studentOptions = selectedClass === "all"
    ? students.filter(s => s.status === "Active")
    : students.filter(s => s.status === "Active" && s.class === selectedClass);

  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find(s => s.id === id);
    if (student) {
      setForm({ ...form, studentId: student.id, studentName: student.name, class: `${student.class}-${student.section}` });
    }
  };

  const activeCount = concessions.filter(c => c.status === "Active").length;
  const expiredCount = concessions.filter(c => c.status === "Expired").length;
  const totalMonthlySaving = concessions.filter(c => c.status === "Active").reduce((s, c) => s + c.monthlySaving, 0);
  const totalStudents = new Set(concessions.filter(c => c.status === "Active").map(c => c.studentId)).size;

  const handleAdd = () => {
    if (!form.studentName || !form.reason) return;
    const newConc: Concession = {
      id: `CON-${String(Date.now()).slice(-6)}`,
      studentId: form.studentId || "—",
      studentName: form.studentName,
      class: form.class || "—",
      type: form.type as any,
      percentage: form.percentage,
      fixedAmount: form.fixedAmount,
      reason: form.reason,
      approvedBy: "Admin",
      status: "Active",
      validFrom: form.validFrom || new Date().toISOString().split("T")[0],
      validTo: form.validTo || "2027-03-31",
      monthlySaving: form.fixedAmount || (form.percentage * 20),
    };
    setConcessions([newConc, ...concessions]);
    toast({ title: "Concession Added ✓", description: `${form.studentName} — ${form.type} (${form.percentage > 0 ? form.percentage + "%" : "Rs. " + form.fixedAmount})` });
    setAddOpen(false);
    setForm({ studentId: "", studentName: "", class: "", type: "Sibling Discount", percentage: 0, fixedAmount: 0, reason: "", validFrom: "", validTo: "" });
  };

  const handleRevoke = (id: string) => {
    setConcessions(concessions.map(c => c.id === id ? { ...c, status: "Revoked" } : c));
    toast({ title: "Concession Revoked", description: "The concession has been revoked.", variant: "destructive" });
  };

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage fee discounts, scholarships, and financial aid for students.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Concession</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Active Concessions</p><p className="text-xl font-bold">{activeCount}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><Users className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Students Benefited</p><p className="text-xl font-bold">{totalStudents}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-accent/10 p-1.5"><Wallet className="w-4 h-4 text-accent" /></div><div><p className="text-xs text-muted-foreground">Monthly Saving</p><p className="text-lg font-bold">Rs. {totalMonthlySaving.toLocaleString()}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-muted p-2"><Clock className="w-4 h-4 text-muted-foreground" /></div><div><p className="text-xs text-muted-foreground">Expired</p><p className="text-xl font-bold">{expiredCount}</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concessions.map(c => {
          const Icon = CONCESSION_TYPE_ICONS[c.type] || Gift;
          return (
            <Card key={c.id} className={cn("border-0 shadow-sm glass-card card-hover", c.status === "Revoked" && "opacity-60", c.status === "Expired" && "opacity-70")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", CONCESSION_TYPE_COLORS[c.type])}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.studentName}</p>
                      <p className="text-[10px] text-muted-foreground">{c.class} • {c.studentId}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] border-0", CONCESSION_STATUS_STYLES[c.status])}>{c.status}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs border-0", CONCESSION_TYPE_COLORS[c.type])}>{c.type}</Badge>
                  {c.percentage > 0 && <Badge className="text-xs bg-primary/10 text-primary border-0">{c.percentage}% off</Badge>}
                  {c.fixedAmount > 0 && <Badge className="text-xs bg-accent/10 text-accent border-0">Rs. {c.fixedAmount} off</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{c.reason}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>📅 {c.validFrom} → {c.validTo}</span>
                  <span>👤 {c.approvedBy}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Monthly Saving</p>
                    <p className="font-bold text-sm text-emerald-600">Rs. {c.monthlySaving.toLocaleString()}</p>
                  </div>
                  {c.status === "Active" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => handleRevoke(c.id)}>Revoke</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
          {/* Gradient hero header */}
          <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-accent via-accent to-primary/70 px-5 py-4 text-accent-foreground">
            <div className="absolute inset-0 opacity-10 pattern-grid" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                <Percent className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">Add Fee Concession</h2>
                <p className="text-xs text-white/75 mt-0.5">Apply a discount or scholarship to a student's tuition fee.</p>
              </div>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase tracking-wider text-white/60">Active Concessions</span>
                <span className="text-sm font-semibold mt-0.5">{concessions.filter(c => c.status === "Active").length}</span>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-5 py-4 space-y-3">
            {/* ─── Section 1: Student Selection ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/15">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Student Selection</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Pick class then student</span>
              </div>
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Class</Label>
                  <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudentId(""); setForm({...form, studentId: "", studentName: "", class: ""}); }}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="All Classes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Student <span className="text-red-500">*</span></Label>
                  <Select value={selectedStudentId} onValueChange={handleStudentSelect}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Choose student..." /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {studentOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.name} • {s.class}-{s.section} • Roll #{s.rollNo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Auto-filled student info */}
              {form.studentName && (
                <div className="mx-3 mb-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-primary">{form.studentName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] pl-9">
                    <div><span className="text-muted-foreground">ID:</span> <span className="font-mono font-medium text-foreground">{form.studentId}</span></div>
                    <div><span className="text-muted-foreground">Class:</span> <span className="font-medium text-foreground">{form.class}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Section 2: Concession Type ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border-b border-accent/15">
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Gift className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">Concession Type</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Choose discount category</span>
              </div>
              <div className="p-3 space-y-2">
                <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Sibling Discount", "Staff Child", "Merit Scholarship", "Financial Aid", "Early Payment", "Full Scholarship", "Custom"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ─── Section 3: Discount Value ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/15">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Discount Value</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Percentage OR fixed</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Percentage (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
                    <Input type="number" value={form.percentage} onChange={e => setForm({...form, percentage: Number(e.target.value)})} min={0} max={100} placeholder="0-100" className="h-9 pl-8" />
                  </div>
                  {/* Quick percentage buttons */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[10, 25, 50, 75, 100].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({...form, percentage: p, fixedAmount: 0})}
                        className={cn(
                          "px-1.5 py-0.5 text-[9px] rounded border transition-colors font-medium",
                          form.percentage === p && form.fixedAmount === 0
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-700"
                            : "border-border/40 bg-background hover:bg-emerald-500/5"
                        )}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Fixed Amount (Rs.)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
                    <Input type="number" value={form.fixedAmount} onChange={e => setForm({...form, fixedAmount: Number(e.target.value)})} min={0} placeholder="0" className="h-9 pl-8" />
                  </div>
                  <p className="text-[9px] text-muted-foreground">Use either % or fixed</p>
                </div>
              </div>
            </div>

            {/* ─── Section 4: Reason & Validity ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/5 border-b border-purple-500/15">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Reason & Validity</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Justification & dates</span>
              </div>
              <div className="p-3 space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Reason <span className="text-red-500">*</span></Label>
                  <Input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="e.g., 2 siblings in same school" className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Valid From</Label>
                    <Input type="date" value={form.validFrom} onChange={e => setForm({...form, validFrom: e.target.value})} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Valid To</Label>
                    <Input type="date" value={form.validTo} onChange={e => setForm({...form, validTo: e.target.value})} className="h-9" />
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-generated info */}
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-2.5 flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Percent className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">How it works:</span> Use either percentage (applied to monthly tuition) OR a fixed amount (Rs.). The concession will be auto-applied to the next fee collection for this student.
              </p>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/60 px-5 py-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setAddOpen(false); setSelectedClass("all"); setSelectedStudentId(""); }} className="h-9">Cancel</Button>
              <Button className="bg-accent hover:bg-accent/90 h-9 px-5 shadow-md" onClick={handleAdd} disabled={!form.studentName || !form.reason}>
                <Plus className="w-4 h-4 mr-1.5" />Add Concession
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
