"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/sms-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Plus, Phone, Eye, Filter, UserCheck, Users, UserPlus, IdCard,
  QrCode, Printer, GraduationCap, Mail, Receipt as ReceiptIcon,
} from "lucide-react";
import { CLASSES, type Student } from "@/lib/sms-data";
import { cn } from "@/lib/utils";
import { printStudentIDCard, printFeeReceipt } from "@/lib/pdf-service";

export function StudentsModule() {
  const { students, searchQuery, addStudent, school, feeCollections } = useAppStore();
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Student | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const printIDCard = async (s: Student) => {
    try {
      await printStudentIDCard(s, school);
    } catch {
      // silent fail
    }
  };

  // Add form state
  const [form, setForm] = useState({ name: "", fatherName: "", fatherPhone: "", class: "Grade 1", section: "A", gender: "Male" as "Male" | "Female", isHosteller: false });

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      if (classFilter !== "all" && s.class !== classFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q && !(`${s.name} ${s.fatherName} ${s.id} ${s.fatherPhone}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  const handleAdd = () => {
    const newStudent: Student = {
      id: `SCH-2026-${String(students.length + 1).padStart(4, "0")}`,
      rollNo: String(filtered.length + 1).padStart(2, "0"),
      name: form.name,
      fatherName: form.fatherName,
      fatherPhone: form.fatherPhone,
      class: form.class,
      section: form.section,
      gender: form.gender,
      dob: "2015-01-01",
      admissionDate: new Date().toISOString().split("T")[0],
      monthlyFee: CLASSES.find(c => c.name === form.class)?.monthlyFee ?? 2000,
      status: "Active",
      attendancePct: 100,
      feePaidThisMonth: false,
      isHosteller: form.isHosteller,
      outstandingAmount: (CLASSES.find(c => c.name === form.class)?.monthlyFee ?? 2000) + (form.isHosteller ? 3500 : 0),
    };
    addStudent(newStudent);
    setAddOpen(false);
    setForm({ name: "", fatherName: "", fatherPhone: "", class: "Grade 1", section: "A", gender: "Male", isHosteller: false });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, father, phone..." className="pl-9 bg-background/60" />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-40 bg-background/60"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 bg-background/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Left">Left</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" />Admit Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />New Student Admission</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5">
                <Label>Student Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v: "Male" | "Female") => setForm({...form, gender: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Father's Name *</Label>
                <Input value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} placeholder="Father/guardian name" />
              </div>
              <div className="space-y-1.5">
                <Label>Father's Phone *</Label>
                <Input value={form.fatherPhone} onChange={e => setForm({...form, fatherPhone: e.target.value})} placeholder="+92 3xx xxxxxxx" />
              </div>
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={form.class} onValueChange={v => setForm({...form, class: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select value={form.section} onValueChange={v => setForm({...form, section: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center gap-3 rounded-lg border border-border/40 p-3">
                <input
                  type="checkbox"
                  id="isHosteller"
                  checked={form.isHosteller}
                  onChange={e => setForm({...form, isHosteller: e.target.checked})}
                  className="w-4 h-4 rounded accent-primary"
                />
                <Label htmlFor="isHosteller" className="cursor-pointer flex-1">
                  <span className="font-medium">Hosteller (boarding student)</span>
                  <p className="text-[10px] text-muted-foreground">Adds Rs. 3,500/month hostel fee to outstanding</p>
                </Label>
              </div>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
              <p className="font-medium text-primary">Auto-generated on save:</p>
              <p className="text-muted-foreground mt-1">Student ID (SCH-2026-XXXX) • Roll Number • QR Code for ID Card</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!form.name || !form.fatherName}>Save & Admit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Users className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{filtered.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><UserCheck className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-bold">{filtered.filter(s => s.status === "Active").length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><IdCard className="w-5 h-5 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Fee Paid</p><p className="text-xl font-bold">{filtered.filter(s => s.feePaidThisMonth).length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2"><Filter className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Defaulters</p><p className="text-xl font-bold">{filtered.filter(s => s.outstandingAmount > 0).length}</p></div>
        </CardContent></Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-12">Roll</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Father</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 30).map(s => (
                <TableRow key={s.id} className="border-border/30 hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(s)}>
                  <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={cn("text-xs font-semibold", s.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                          {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.gender} • {s.attendancePct}% att.</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{s.class}-{s.section}</Badge></TableCell>
                  <TableCell className="text-sm">{s.fatherName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.fatherPhone}</TableCell>
                  <TableCell>
                    {s.outstandingAmount > 0 ? (
                      <Badge variant="destructive" className="text-[10px]">Rs. {s.outstandingAmount}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">Paid</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Active" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filtered.length > 30 && (
          <div className="px-4 py-3 border-t border-border/30 text-xs text-muted-foreground text-center">
            Showing 30 of {filtered.length} students. Use search/filters to narrow down.
          </div>
        )}
      </Card>

      {/* Profile drawer */}
      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent className="max-h-[90vh]">
          {selected && (
            <>
              <DrawerHeader className="border-b border-border/30 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className={cn("text-lg font-semibold", selected.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                      {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DrawerTitle className="text-xl">{selected.name}</DrawerTitle>
                    <DrawerDescription className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="outline">{selected.id}</Badge>
                      <Badge variant="outline">Roll #{selected.rollNo}</Badge>
                      <Badge variant="outline">{selected.class}-{selected.section}</Badge>
                      <Badge variant={selected.status === "Active" ? "default" : "secondary"}>{selected.status}</Badge>
                    </DrawerDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => printIDCard(selected)}>
                      <QrCode className="w-4 h-4 mr-1.5" />Print ID Card
                    </Button>
                    <Button size="sm" variant="outline"><Printer className="w-4 h-4 mr-1.5" />Profile</Button>
                  </div>
                </div>
              </DrawerHeader>
              <div className="p-4 overflow-y-auto">
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="parents">Parents</TabsTrigger>
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Date of Birth" value={selected.dob} />
                      <InfoRow label="Gender" value={selected.gender} />
                      <InfoRow label="Admission Date" value={selected.admissionDate} />
                      <InfoRow label="Monthly Fee" value={`Rs. ${selected.monthlyFee.toLocaleString()}`} />
                      <InfoRow label="Attendance %" value={`${selected.attendancePct}%`} />
                      <InfoRow label="Status" value={selected.status} />
                    </div>
                  </TabsContent>
                  <TabsContent value="parents" className="mt-4 space-y-3">
                    <div className="rounded-lg border border-border/40 p-4 space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Father / Guardian</p>
                      <p className="font-medium">{selected.fatherName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" /> {selected.fatherPhone}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="fees" className="mt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="border-0 shadow-sm bg-muted/30"><CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Monthly Fee</p>
                        <p className="text-lg font-bold">Rs. {selected.monthlyFee.toLocaleString()}</p>
                        {selected.isHosteller && <p className="text-[10px] text-accent mt-0.5">+ Rs. 3,500 hostel</p>}
                      </CardContent></Card>
                      <Card className="border-0 shadow-sm bg-muted/30"><CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                        <p className="text-lg font-bold text-red-600">Rs. {selected.outstandingAmount.toLocaleString()}</p>
                      </CardContent></Card>
                      <Card className="border-0 shadow-sm bg-muted/30"><CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">This Month</p>
                        <p className="text-lg font-bold text-emerald-600">{selected.feePaidThisMonth ? "Paid" : "Pending"}</p>
                      </CardContent></Card>
                    </div>
                    {/* Fee History */}
                    <div className="rounded-lg border border-border/40 overflow-hidden">
                      <div className="px-3 py-2 bg-muted/40 border-b border-border/30 flex items-center justify-between">
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          <ReceiptIcon className="w-3.5 h-3.5 text-primary" /> Fee Payment History
                        </p>
                        <p className="text-[10px] text-muted-foreground">{feeCollections.filter(f => f.studentId === selected.id).length} receipts</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {feeCollections.filter(f => f.studentId === selected.id).length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground">
                            No fee payments recorded yet.
                          </div>
                        ) : (
                          feeCollections.filter(f => f.studentId === selected.id).map(f => (
                            <div key={f.id} className="flex items-center gap-3 p-2.5 border-b border-border/20 hover:bg-muted/30 last:border-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <ReceiptIcon className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono text-muted-foreground">{f.receiptNo}</p>
                                <p className="text-[10px] text-muted-foreground">{f.date} • {f.feeType} • {f.mode}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm text-emerald-600">Rs. {f.amount.toLocaleString()}</p>
                              </div>
                              <button
                                onClick={() => printFeeReceipt(f, selected, school)}
                                className="text-muted-foreground hover:text-primary transition-colors p-1"
                                title="Reprint Receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="attendance" className="mt-4">
                    <div className="rounded-lg border border-border/40 p-4 text-center">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="oklch(0.92 0.012 95)" strokeWidth="12" />
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#15857A" strokeWidth="12"
                            strokeDasharray={`${2 * Math.PI * 56 * selected.attendancePct / 100} ${2 * Math.PI * 56}`}
                            strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-2xl font-bold">{selected.attendancePct}%</p>
                          <p className="text-[10px] text-muted-foreground">Attendance</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Current month attendance</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="results" className="mt-4">
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      No exam results published yet for this term.
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
