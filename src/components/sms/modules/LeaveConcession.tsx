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
      id: `LV-${String(requests.length + 1).padStart(3, "0")}`,
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
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage staff leave requests, balances, and approvals.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Apply Leave</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-yellow-500/10 p-2"><Clock className="w-5 h-5 text-yellow-600" /></div><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold">{pending}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-emerald-500/10 p-2"><CheckCircle className="w-5 h-5 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Approved</p><p className="text-xl font-bold">{approved}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-red-500/10 p-2"><XCircle className="w-5 h-5 text-red-600" /></div><div><p className="text-xs text-muted-foreground">Rejected</p><p className="text-xl font-bold">{rejected}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><Calendar className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Leave Days</p><p className="text-xl font-bold">{totalDays}</p></div></CardContent></Card>
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
                      {req.status === "Approved" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : req.status === "Rejected" ? <XCircle className="w-5 h-5 text-red-600" /> : <Clock className="w-5 h-5 text-yellow-600" />}
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
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mx-auto mt-1"><div className="h-full bg-blue-500" style={{ width: `${(b.casual.used / b.casual.total) * 100}%` }} /></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("font-bold text-sm", b.sick.remaining < 3 && "text-red-600")}>{b.sick.remaining}</span>
                            <span className="text-[10px] text-muted-foreground">({b.sick.used} used)</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mx-auto mt-1"><div className="h-full bg-red-500" style={{ width: `${(b.sick.used / b.sick.total) * 100}%` }} /></div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("font-bold text-sm", b.earned.remaining < 3 && "text-red-600")}>{b.earned.remaining}</span>
                            <span className="text-[10px] text-muted-foreground">({b.earned.used} used)</span>
                          </div>
                          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden mx-auto mt-1"><div className="h-full bg-primary" style={{ width: `${(b.earned.used / b.earned.total) * 100}%` }} /></div>
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
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
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
      id: `CON-${String(concessions.length + 1).padStart(3, "0")}`,
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
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage fee discounts, scholarships, and financial aid for students.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Concession</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-emerald-500/10 p-2"><CheckCircle className="w-5 h-5 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Active Concessions</p><p className="text-xl font-bold">{activeCount}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><Users className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Students Benefited</p><p className="text-xl font-bold">{totalStudents}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-accent/10 p-2"><Wallet className="w-5 h-5 text-accent" /></div><div><p className="text-xs text-muted-foreground">Monthly Saving</p><p className="text-xl font-bold">Rs. {totalMonthlySaving.toLocaleString()}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Clock className="w-5 h-5 text-muted-foreground" /></div><div><p className="text-xs text-muted-foreground">Expired</p><p className="text-xl font-bold">{expiredCount}</p></div></CardContent></Card>
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
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add Fee Concession</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {/* Step 1: Select Class */}
            <div>
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudentId(""); setForm({...form, studentId: "", studentName: "", class: ""}); }}>
                <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Step 2: Select Student */}
            <div>
              <Label>Select Student *</Label>
              <Select value={selectedStudentId} onValueChange={handleStudentSelect}>
                <SelectTrigger><SelectValue placeholder="Choose student..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {studentOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.name} • {s.class}-{s.section} • Roll #{s.rollNo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Auto-filled student info */}
            {form.studentName && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Student:</span><span className="font-medium">{form.studentName}</span></div>
                <div className="flex justify-between mt-0.5"><span className="text-muted-foreground">ID:</span><span className="font-mono">{form.studentId}</span></div>
                <div className="flex justify-between mt-0.5"><span className="text-muted-foreground">Class:</span><span className="font-medium">{form.class}</span></div>
              </div>
            )}
            <div><Label>Concession Type</Label><Select value={form.type} onValueChange={v => setForm({...form, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Sibling Discount", "Staff Child", "Merit Scholarship", "Financial Aid", "Early Payment", "Full Scholarship", "Custom"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Percentage (%)</Label><Input type="number" value={form.percentage} onChange={e => setForm({...form, percentage: Number(e.target.value)})} min={0} max={100} /></div>
              <div><Label>Fixed Amount (Rs.)</Label><Input type="number" value={form.fixedAmount} onChange={e => setForm({...form, fixedAmount: Number(e.target.value)})} min={0} /></div>
            </div>
            <div><Label>Reason *</Label><Input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="e.g., 2 siblings in same school" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valid From</Label><Input type="date" value={form.validFrom} onChange={e => setForm({...form, validFrom: e.target.value})} /></div>
              <div><Label>Valid To</Label><Input type="date" value={form.validTo} onChange={e => setForm({...form, validTo: e.target.value})} /></div>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-2 text-xs text-muted-foreground">
              Use either percentage OR fixed amount. Percentage applies to monthly tuition fee.
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => { setAddOpen(false); setSelectedClass("all"); setSelectedStudentId(""); }}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.studentName || !form.reason}>Add Concession</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
