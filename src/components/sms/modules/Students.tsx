"use client";

import { useState, useMemo, useRef } from "react";
import { useAppStore } from "@/lib/sms-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Plus, Phone, Eye, Filter, UserCheck, Users, UserPlus,
  QrCode, Printer, GraduationCap, Mail, Upload, Trash2, MapPin, Heart,
  AlertCircle, Bus, Home, Calendar, Droplet, Globe, Briefcase,
  User, UserCircle, Stethoscope, FileText, X, DollarSign, Edit, ArrowUpCircle,
} from "lucide-react";
import { type Student } from "@/lib/sms-data";
import { cn } from "@/lib/utils";
import { printStudentIDCard, printFeeReceipt } from "@/lib/pdf-service";
import { Receipt as ReceiptIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const RELIGIONS = ["Islam", "Christianity", "Hinduism", "Sikhism", "Other"];
const EMPTY_FORM = {
  name: "", fatherName: "", fatherPhone: "", fatherCnic: "", fatherOccupation: "",
  motherName: "", motherPhone: "", motherOccupation: "",
  guardianName: "", guardianPhone: "", guardianRelation: "",
  dob: "", cnic: "", bloodGroup: "A+", religion: "Islam", nationality: "Pakistani",
  address: "", previousSchool: "",
  emergencyName: "", emergencyContact: "",
  medicalConditions: "", allergies: "",
  class: "Grade 1", section: "A", gender: "Male" as "Male" | "Female",
  isHosteller: false, transport: false, transportRoute: "", siblings: "",
  photo: "" as string,
};

export function StudentsModule() {
  const { students, searchQuery, setSearchQuery, addStudent, updateStudent, deleteStudent, school, feeCollections, documents, addDocument, deleteDocument, commLogs, addCommLog, deleteCommLog, collectFee, classes: storeClasses } = useAppStore();
  const CLASSES = storeClasses.length > 0 ? storeClasses : [];
  const { toast } = useToast();
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Student | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formSection, setFormSection] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit / Delete / Promote state
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<Student | null>(null);
  const [promoteClass, setPromoteClass] = useState("");
  const [promoteSection, setPromoteSection] = useState("A");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPromoteOpen, setBulkPromoteOpen] = useState(false);
  const [bulkClass, setBulkClass] = useState("");
  const [bulkSection, setBulkSection] = useState("A");
  const [bulkFeeOpen, setBulkFeeOpen] = useState(false);
  const [bulkFeeAmount, setBulkFeeAmount] = useState(0);
  const [bulkFeeMode, setBulkFeeMode] = useState<"Cash" | "Cheque" | "Bank Transfer">("Cash");

  // Document upload
  const [docType, setDocType] = useState<string>("Birth Certificate");
  const docFileRef = useRef<HTMLInputElement>(null);

  // Communication log
  const [commForm, setCommForm] = useState({ type: "Phone Call", direction: "Outgoing", subject: "", notes: "" });

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      if (classFilter !== "all" && s.class !== classFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q && !(`${s.name} ${s.fatherName} ${s.id} ${s.fatherPhone} ${s.cnic}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  // Compute all stats in a single pass over `filtered`
  const stats = useMemo(() => {
    let active = 0, hostellers = 0, transport = 0, defaulters = 0;
    for (const s of filtered) {
      if (s.status === "Active") active++;
      if (s.isHosteller) hostellers++;
      if (s.transport) transport++;
      if (s.outstandingAmount > 0) defaulters++;
    }
    return { total: filtered.length, active, hostellers, transport, defaulters };
  }, [filtered]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload a PNG or JPG image.", variant: "destructive" });
      return;
    }
    if (file.size > 500 * 1024) {
      toast({ title: "File too large", description: "Photo must be under 500KB. Please compress it first.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, photo: reader.result as string });
      toast({ title: "Photo uploaded ✓", description: `${file.name} ready to save.` });
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    // Validation
    if (!form.name.trim()) { toast({ title: "Name required", description: "Please enter student's full name.", variant: "destructive" }); return; }
    if (!form.fatherName.trim()) { toast({ title: "Father's name required", description: "Please enter father's name.", variant: "destructive" }); return; }
    if (!form.fatherPhone.trim()) { toast({ title: "Phone required", description: "Please enter father's phone number.", variant: "destructive" }); return; }
    if (form.fatherPhone && !/^[\+]?[\d\s\-]{10,15}$/.test(form.fatherPhone)) { toast({ title: "Invalid phone", description: "Phone must be 10-15 digits.", variant: "destructive" }); return; }
    if (form.cnic && !/^[\d]{5}-?[\d]{7}-?[\d]$/.test(form.cnic)) { toast({ title: "Invalid CNIC", description: "CNIC format: 42101-1234567-1", variant: "destructive" }); return; }

    const cls = CLASSES.find(c => c.name === form.class);
    const monthlyFee = cls?.monthlyFee ?? 0;
    const feeStructure = useAppStore.getState().feeStructure;
    const hostelFee = form.isHosteller ? (feeStructure.hostelFee || 0) : 0;
    const transportFee = form.transport ? (feeStructure.feeItems?.find(f => f.name === "Transport Fee")?.amount || 0) : 0;

    // Calculate one-time + annual fees from the dynamic fee items
    const feeItems = feeStructure.feeItems || [];
    const oneTimeFees = feeItems.filter(f => f.enabled && f.type === "one-time");
    const annualFees = feeItems.filter(f => f.enabled && f.type === "annual");
    // Monthly fees: tuition + hostel (if hosteller) + transport (if transport user)
    const monthlyFees = monthlyFee + hostelFee + transportFee;

    // Total outstanding at admission = one-time fees + annual fees + first month's monthly fees
    const oneTimeTotal = oneTimeFees.reduce((s, f) => s + f.amount, 0);
    const annualTotal = annualFees.reduce((s, f) => s + f.amount, 0);
    const totalOutstanding = oneTimeTotal + annualTotal + monthlyFees;

    // Build fee breakdown string for the toast
    const feeBreakdown: string[] = [];
    if (oneTimeTotal > 0) feeBreakdown.push(`One-time: Rs. ${oneTimeTotal.toLocaleString()}`);
    if (annualTotal > 0) feeBreakdown.push(`Annual: Rs. ${annualTotal.toLocaleString()}`);
    feeBreakdown.push(`Monthly: Rs. ${monthlyFees.toLocaleString()}`);

    // Compute next available roll number for THIS class+section (not global)
    const sameClassStudents = students.filter(s => s.class === form.class && s.section === form.section);
    const maxRoll = sameClassStudents.reduce((max, s) => {
      const n = parseInt(s.rollNo) || 0;
      return n > max ? n : max;
    }, 0);
    const newStudent: Student = {
      id: `SCH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      rollNo: String(maxRoll + 1).padStart(2, "0"),
      name: form.name,
      class: form.class,
      section: form.section,
      gender: form.gender,
      dob: form.dob || "2015-01-01",
      cnic: form.cnic || "—",
      bloodGroup: form.bloodGroup,
      religion: form.religion,
      nationality: form.nationality,
      address: form.address || "—",
      fatherName: form.fatherName,
      fatherCnic: form.fatherCnic || "—",
      fatherPhone: form.fatherPhone,
      fatherOccupation: form.fatherOccupation || "—",
      motherName: form.motherName || "—",
      motherPhone: form.motherPhone || "—",
      motherOccupation: form.motherOccupation || "Housewife",
      guardianName: form.guardianName,
      guardianPhone: form.guardianPhone,
      guardianRelation: form.guardianRelation,
      primaryContact: "father",
      emergencyContact: form.emergencyContact || form.fatherPhone,
      emergencyName: form.emergencyName || form.fatherName,
      medicalConditions: form.medicalConditions || "None",
      allergies: form.allergies || "None",
      previousSchool: form.previousSchool || "—",
      admissionDate: new Date().toISOString().split("T")[0],
      monthlyFee,
      status: "Active",
      academicStatus: "New",
      attendancePct: 100,
      feePaidThisMonth: false,
      isHosteller: form.isHosteller,
      transport: form.transport,
      transportRoute: form.transport ? form.transportRoute : undefined,
      siblings: form.siblings,
      photo: form.photo || undefined,
      outstandingAmount: totalOutstanding,
    };
    addStudent(newStudent);
    toast({
      title: "Student Admitted ✓",
      description: `${newStudent.name} → ${newStudent.class}-${newStudent.section} • ID: ${newStudent.id}\n${feeBreakdown.join(" | ")} = Rs. ${totalOutstanding.toLocaleString()} outstanding`,
    });
    setAddOpen(false);
    setForm(EMPTY_FORM);
    setFormSection(0);
  };

  const printIDCard = async (s: Student) => {
    try { await printStudentIDCard(s, school); } catch {}
  };

  // Document upload handler
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Document must be under 2MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        id: `DOC-${Date.now()}`,
        studentId: selected.id,
        name: file.name,
        type: docType as any,
        uploadDate: new Date().toISOString().split("T")[0],
        dataUrl: reader.result as string,
        size: file.size,
      });
      toast({ title: "Document uploaded ✓", description: `${file.name} saved to ${selected.name}'s vault.` });
    };
    reader.readAsDataURL(file);
  };

  // Communication log handler
  const handleAddComm = () => {
    if (!selected || !commForm.subject) return;
    addCommLog({
      id: `COMM-${Date.now()}`,
      studentId: selected.id,
      type: commForm.type as any,
      date: new Date().toISOString().replace("T", " ").slice(0, 16),
      direction: commForm.direction as any,
      subject: commForm.subject,
      notes: commForm.notes,
      user: "Admin",
    });
    setCommForm({ type: "Phone Call", direction: "Outgoing", subject: "", notes: "" });
  };

  // Bulk selection helpers
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(s => s.id)));
  };
  const handleBulkPromote = () => {
    const targetCls = CLASSES.find(c => c.name === bulkClass);
    if (!targetCls) {
      toast({ title: "Invalid class", description: "Select a valid class first.", variant: "destructive" });
      return;
    }
    const newFee = targetCls.monthlyFee;
    let promotedCount = 0;
    selectedIds.forEach(id => {
      const student = students.find(s => s.id === id);
      if (!student) return;
      // Compute roll number per class+section (max+1)
      const sameClass = students.filter(s => s.class === bulkClass && s.section === bulkSection && s.id !== id);
      const maxRoll = sameClass.reduce((max, s) => {
        const n = parseInt(s.rollNo) || 0;
        return n > max ? n : max;
      }, 0);
      const newRollNo = String(maxRoll + 1).padStart(2, "0");

      const patch: Partial<Student> = {
        class: bulkClass,
        section: bulkSection,
        monthlyFee: newFee,
        rollNo: newRollNo,
        academicStatus: "Promoted" as any,
        attendancePct: 100,
      };

      // Fee adjustment — same logic as single promote
      const feeDiff = newFee - student.monthlyFee;
      if (feeDiff > 0) {
        patch.outstandingAmount = student.outstandingAmount + feeDiff;
        if (student.feePaidThisMonth) patch.feePaidThisMonth = false;
      } else if (feeDiff < 0 && student.outstandingAmount > 0) {
        patch.outstandingAmount = Math.max(0, student.outstandingAmount + feeDiff);
      }

      updateStudent(id, patch);
      promotedCount++;
    });
    toast({ title: "Bulk Promote Complete ✓", description: `${promotedCount} students promoted to ${bulkClass}-${bulkSection} with roll numbers, fees, and outstanding adjusted.` });
    setSelectedIds(new Set());
    setBulkPromoteOpen(false);
  };

  const handleBulkFee = () => {
    if (bulkFeeAmount <= 0) return;
    let count = 0;
    selectedIds.forEach(id => {
      const student = students.find(s => s.id === id);
      if (student) {
        collectFee(id, bulkFeeAmount, bulkFeeMode, "Bulk Tuition", { tuition: bulkFeeAmount });
        count++;
      }
    });
    toast({ title: "Bulk Fee Collected ✓", description: `${count} receipts generated • Rs. ${(bulkFeeAmount * count).toLocaleString()} total` });
    setSelectedIds(new Set());
    setBulkFeeOpen(false);
  };

  const formSections = [
    { title: "Personal Info", icon: User },
    { title: "Parents", icon: Users },
    { title: "Academic", icon: GraduationCap },
    { title: "Medical & Address", icon: Heart },
  ];

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, CNIC, father, phone..."
            className="pl-9 bg-background/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search students"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
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
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setForm(EMPTY_FORM); setFormSection(0); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" />Admit Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
            {/* Gradient hero header */}
            <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-primary via-primary to-accent/80 px-5 py-4 text-primary-foreground">
              <div className="absolute inset-0 opacity-10 pattern-grid" />
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold tracking-tight">New Student Admission</h2>
                  <p className="text-xs text-white/75 mt-0.5">Complete the form below to register a new student record.</p>
                </div>
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-[10px] uppercase tracking-wider text-white/60">Admission Date</span>
                  <span className="text-sm font-semibold mt-0.5">{new Date().toISOString().split("T")[0]}</span>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div className="px-5 py-4 space-y-3">
              {/* ─── Section 1: Personal Information ─── */}
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/15">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Personal Information</p>
                  <span className="ml-auto text-[10px] text-muted-foreground">Basic bio & identity</span>
                </div>
                <div className="p-3 grid grid-cols-12 gap-3">
                  {/* Photo upload — circular */}
                  <div className="col-span-12 md:col-span-3 flex flex-col items-center">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-28 h-28 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-all group overflow-hidden flex items-center justify-center"
                    >
                      {form.photo ? (
                        <>
                          <img src={form.photo} alt="Student" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setForm({ ...form, photo: "" }); }}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <User className="w-8 h-8 text-primary/40 mx-auto" />
                          <p className="text-[9px] text-muted-foreground mt-1 px-2">Click to upload</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handlePhotoUpload} className="hidden" />
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">Max 500KB • PNG/JPG</p>
                  </div>

                  {/* Personal fields */}
                  <div className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    <div className="col-span-2 md:col-span-2 space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Full Name <span className="text-red-500">*</span></Label>
                      <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Ahmed Ali Khan" className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Gender</Label>
                      <Select value={form.gender} onValueChange={(v: "Male" | "Female") => setForm({...form, gender: v})}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</Label>
                      <Input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">CNIC / B-Form</Label>
                      <Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} placeholder="42101-XXXXXXX-X" className="h-9" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Blood Group</Label>
                      <Select value={form.bloodGroup} onValueChange={v => setForm({...form, bloodGroup: v})}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{BLOOD_GROUPS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Religion</Label>
                      <Select value={form.religion} onValueChange={v => setForm({...form, religion: v})}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>{RELIGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Nationality</Label>
                      <Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} className="h-9" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Section 2: Academic & Logistics ─── */}
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border-b border-accent/15">
                  <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                    <GraduationCap className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-xs font-semibold text-accent uppercase tracking-wide">Academic & Logistics</p>
                  <span className="ml-auto text-[10px] text-muted-foreground">Class placement & facilities</span>
                </div>
                <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Class</Label>
                    <Select value={form.class} onValueChange={v => setForm({...form, class: v})}>
                      <SelectTrigger className="h-9"><SelectValue placeholder={CLASSES.length === 0 ? "Add a class first" : "Select class"} /></SelectTrigger>
                      <SelectContent>
                        {CLASSES.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground text-center">No classes yet. Go to Classes module to add one.</div>
                        ) : CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Section</Label>
                    <Select value={form.section} onValueChange={v => setForm({...form, section: v})}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Previous School</Label>
                    <Input value={form.previousSchool} onChange={e => setForm({...form, previousSchool: e.target.value})} placeholder="If transfer student" className="h-9" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({...form, isHosteller: !form.isHosteller})}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left", form.isHosteller ? "border-accent bg-accent/10" : "border-border/50 hover:border-accent/40")}
                  >
                    <Home className={cn("w-4 h-4", form.isHosteller ? "text-accent" : "text-muted-foreground")} />
                    <div>
                      <p className="text-xs font-semibold">Hosteller</p>
                      <p className="text-[9px] text-muted-foreground">{form.isHosteller ? "Enabled" : "Click to enable"}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, transport: !form.transport})}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left", form.transport ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/40")}
                  >
                    <Bus className={cn("w-4 h-4", form.transport ? "text-primary" : "text-muted-foreground")} />
                    <div>
                      <p className="text-xs font-semibold">Transport</p>
                      <p className="text-[9px] text-muted-foreground">{form.transport ? "Enabled" : "Click to enable"}</p>
                    </div>
                  </button>
                  {form.transport ? (
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Transport Route</Label>
                      <Input value={form.transportRoute} onChange={e => setForm({...form, transportRoute: e.target.value})} placeholder="e.g., Route A — Area Name" className="h-9" />
                    </div>
                  ) : (
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Siblings in School</Label>
                      <Input value={form.siblings} onChange={e => setForm({...form, siblings: e.target.value})} placeholder="e.g., Sara Khan (Grade 3)" className="h-9" />
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Section 3: Parents Information ─── */}
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/5 border-b border-purple-500/15">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Parents Information</p>
                  <span className="ml-auto text-[10px] text-muted-foreground">Father (primary) & mother details</span>
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Father */}
                  <div className="rounded-lg border border-primary/25 bg-primary/[0.03] p-3">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center"><User className="w-3 h-3 text-primary" /></div>
                      <p className="text-xs font-semibold text-primary">Father</p>
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Primary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Name <span className="text-red-500">*</span></Label>
                        <Input value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} placeholder="Father's full name" className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">CNIC</Label>
                        <Input value={form.fatherCnic} onChange={e => setForm({...form, fatherCnic: e.target.value})} placeholder="42101-XXX" className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Phone <span className="text-red-500">*</span></Label>
                        <Input value={form.fatherPhone} onChange={e => setForm({...form, fatherPhone: e.target.value})} placeholder="+92 3xx" className="h-8 text-xs" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Occupation</Label>
                        <Input value={form.fatherOccupation} onChange={e => setForm({...form, fatherOccupation: e.target.value})} placeholder="e.g., Engineer" className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                  {/* Mother */}
                  <div className="rounded-lg border border-pink-500/25 bg-pink-500/[0.03] p-3">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-md bg-pink-500/15 flex items-center justify-center"><Heart className="w-3 h-3 text-pink-600" /></div>
                      <p className="text-xs font-semibold text-pink-600">Mother</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Name</Label>
                        <Input value={form.motherName} onChange={e => setForm({...form, motherName: e.target.value})} placeholder="Mother's name" className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Phone</Label>
                        <Input value={form.motherPhone} onChange={e => setForm({...form, motherPhone: e.target.value})} placeholder="+92 3xx" className="h-8 text-xs" />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Occupation</Label>
                        <Input value={form.motherOccupation} onChange={e => setForm({...form, motherOccupation: e.target.value})} placeholder="e.g., Housewife" className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Section 4: Guardian & Emergency ─── */}
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/15">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Guardian & Emergency Contact</p>
                  <span className="ml-auto text-[10px] text-muted-foreground">Backup contact points</span>
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2.5 flex items-center gap-1.5">
                      <UserCircle className="w-3 h-3" />Guardian <span className="text-muted-foreground/60 normal-case">(if parents unavailable)</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Name</Label>
                        <Input value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Phone</Label>
                        <Input value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Relation</Label>
                        <Input value={form.guardianRelation} onChange={e => setForm({...form, guardianRelation: e.target.value})} placeholder="Uncle" className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-accent/25 bg-accent/[0.05] p-3">
                    <p className="text-[10px] font-semibold text-accent uppercase mb-2.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" />Emergency Contact
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Name</Label>
                        <Input value={form.emergencyName} onChange={e => setForm({...form, emergencyName: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Phone</Label>
                        <Input value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Section 5: Medical & Address ─── */}
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/5 border-b border-red-500/15">
                  <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Medical & Address</p>
                  <span className="ml-auto text-[10px] text-muted-foreground">Health info & residence</span>
                </div>
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-red-500/25 bg-red-500/[0.03] p-3">
                    <p className="text-[10px] font-semibold text-red-600 uppercase mb-2.5 flex items-center gap-1.5">
                      <Droplet className="w-3 h-3" />Medical History
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Conditions</Label>
                        <Input value={form.medicalConditions} onChange={e => setForm({...form, medicalConditions: e.target.value})} placeholder="e.g., Asthma" className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-muted-foreground uppercase">Allergies</Label>
                        <Input value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} placeholder="e.g., Peanuts" className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2.5 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />Home Address
                    </p>
                    <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="House #, Street, Block, City" className="h-8 text-xs" />
                  </div>
                </div>
              </div>

              {/* Auto-generated info banner */}
              <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-2.5 flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-3 h-3 text-primary" />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-primary">Auto-generated on save:</span> Student ID (SCH-YYYY-XXXX) • Roll Number • QR Code<br/>
                  <span className="font-semibold text-primary">Fee structure:</span> {(() => {
                    const fs = useAppStore.getState().feeStructure;
                    const items = fs.feeItems || [];
                    const oneTime = items.filter((f: any) => f.enabled && f.type === "one-time").reduce((s: number, f: any) => s + f.amount, 0);
                    const annual = items.filter((f: any) => f.enabled && f.type === "annual").reduce((s: number, f: any) => s + f.amount, 0);
                    const monthly = (CLASSES.find(c => c.name === form.class)?.monthlyFee ?? 0) + (form.isHosteller ? (fs.hostelFee || 0) : 0);
                    const total = oneTime + annual + monthly;
                    return `One-time Rs. ${oneTime.toLocaleString()} + Annual Rs. ${annual.toLocaleString()} + Monthly Rs. ${monthly.toLocaleString()} = Rs. ${total.toLocaleString()} outstanding`;
                  })()}
                </p>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/60 px-5 py-3 flex items-center justify-between gap-3">
              <p className="text-[10px] text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setAddOpen(false); setForm(EMPTY_FORM); }} className="h-9">Cancel</Button>
                <Button onClick={handleAdd} disabled={!form.name || !form.fatherName} className="bg-primary hover:bg-primary/90 h-9 px-5 shadow-md">
                  <Plus className="w-4 h-4 mr-1.5" />Save & Admit Student
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5"><Users className="w-4 h-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5"><UserCheck className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-bold">{stats.active}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-accent/10 p-1.5"><Home className="w-4 h-4 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Hostellers</p><p className="text-xl font-bold">{stats.hostellers}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5"><Bus className="w-4 h-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Transport</p><p className="text-xl font-bold">{stats.transport}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-red-500/10 p-1.5"><Filter className="w-4 h-4 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Defaulters</p><p className="text-xl font-bold">{stats.defaulters}</p></div>
        </CardContent></Card>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 fade-in flex-wrap">
          <Badge className="bg-primary text-primary-foreground">{selectedIds.size} selected</Badge>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setBulkClass(filtered[0]?.class || "Grade 1"); setBulkPromoteOpen(true); }}>
            <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />Bulk Promote
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setBulkFeeOpen(true); setBulkFeeAmount(0); }}>
            <DollarSign className="w-3.5 h-3.5 mr-1" />Bulk Collect Fee
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
        </div>
      )}

      {/* Table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-10">
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-primary cursor-pointer" />
                </TableHead>
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No students found. {searchQuery ? "Try a different search." : "Click \"Admit Student\" to add one."}
                  </TableCell>
                </TableRow>
              ) : filtered.slice(0, 30).map(s => (
                <TableRow key={s.id} className={cn("border-border/30 hover:bg-muted/30 cursor-pointer", selectedIds.has(s.id) && "bg-primary/5")} onClick={() => setSelected(s)}>
                  <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)} className="w-4 h-4 accent-primary cursor-pointer" />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className={cn("text-xs font-semibold", s.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                            {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          {s.name}
                          {s.isHosteller && <Home className="w-3 h-3 text-accent" />}
                          {s.transport && <Bus className="w-3 h-3 text-primary" />}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{s.gender} • {s.bloodGroup} • {s.attendancePct}% att.</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{s.class}-{s.section}</Badge></TableCell>
                  <TableCell className="text-sm">{s.fatherName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.fatherPhone}</TableCell>
                  <TableCell>
                    {s.outstandingAmount > 0 ? (
                      <Badge variant="destructive" className="text-[10px]">Rs. {s.outstandingAmount.toLocaleString()}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">Paid</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Active" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View" aria-label={`View ${s.name} profile`}
                        onClick={(e) => { e.stopPropagation(); setSelected(s); }}
                      ><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary" title="Edit" aria-label={`Edit ${s.name}`}
                        onClick={(e) => { e.stopPropagation(); setEditStudent(s); setEditForm(s); }}
                      ><Edit className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-600" title="Promote" aria-label={`Promote ${s.name}`}
                        onClick={(e) => { e.stopPropagation(); setPromoteTarget(s); setPromoteClass(s.class); setPromoteSection(s.section); }}
                      ><ArrowUpCircle className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-orange-600" title="Detain (repeat class)" aria-label={`Detain ${s.name}`}
                        onClick={(e) => { e.stopPropagation();
                          if (window.confirm(`Detain ${s.name} in ${s.class}-${s.section}?\n\nThis will:\n• Mark the student as "Detained" (repeating the class)\n• Keep the same class, section, and roll number\n• Reset attendance to 100%\n• Keep fee structure unchanged\n\nContinue?`)) {
                            updateStudent(s.id, { academicStatus: "Detained" as any, attendancePct: 100 });
                            toast({ title: "Student Detained", description: `${s.name} will repeat ${s.class}-${s.section}.`, variant: "destructive" });
                          }
                        }}
                      ><AlertCircle className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" title="Delete" aria-label={`Delete ${s.name}`}
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s); }}
                      ><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
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

      {/* Profile slide-in panel */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Student profile: ${selected.name}`}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          {/* Panel */}
          <div
            className="relative w-full max-w-2xl h-full bg-background shadow-2xl overflow-y-auto slide-in-right"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              aria-label="Close profile"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Gradient banner header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/70 p-4 text-primary-foreground overflow-hidden">
              <div className="absolute inset-0 opacity-10 pattern-grid" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
              <div className="relative flex items-start gap-5">
                <Avatar className="w-24 h-24 ring-4 ring-white/30 shadow-xl shrink-0">
                  {selected.photo ? (
                    <img src={selected.photo} alt={selected.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                      {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                    {selected.name}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    {selected.isHosteller && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">🏠 Hosteller</span>}
                    {selected.transport && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">🚌 Transport</span>}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-50 font-medium flex items-center gap-1">
                      <span className={cn("w-1.5 h-1.5 rounded-full", selected.status === "Active" ? "bg-emerald-300" : "bg-red-300")} />
                      {selected.status}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mt-2">
                    {selected.id} • Roll #{selected.rollNo} • {selected.class}-{selected.section} • 🩸 {selected.bloodGroup}
                  </p>
                </div>
              </div>
              {/* Quick stats */}
              <div className="relative grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
                <div>
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Attendance</p>
                  <p className="text-xl font-bold mt-0.5">{selected.attendancePct}%</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Monthly Fee</p>
                  <p className="text-xl font-bold mt-0.5">Rs. {selected.monthlyFee.toLocaleString()}</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Outstanding</p>
                  <p className="text-xl font-bold mt-0.5">{selected.outstandingAmount > 0 ? `Rs. ${selected.outstandingAmount.toLocaleString()}` : "✓ Clear"}</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Admitted</p>
                  <p className="text-xl font-bold mt-0.5">{selected.admissionDate.slice(0, 4)}</p>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/30 bg-muted/20">
              <Button size="sm" variant="outline" onClick={() => printIDCard(selected)}>
                <QrCode className="w-3.5 h-3.5 mr-1.5" />Print ID Card
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditStudent(selected); setEditForm(selected); }}>
                <Edit className="w-3.5 h-3.5 mr-1.5" />Edit Profile
              </Button>
              <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => { setPromoteTarget(selected); setPromoteClass(selected.class); setPromoteSection(selected.section); }}>
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />Promote
              </Button>
              <div className="flex-1" />
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => { setDeleteConfirm(selected); }}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
              </Button>
            </div>

            {/* Tabbed content */}
            <div className="p-6">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-5 md:grid-cols-9 h-10 mb-4">
                  <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                  <TabsTrigger value="parents" className="text-xs">Parents</TabsTrigger>
                  <TabsTrigger value="academic" className="text-xs">Academic</TabsTrigger>
                  <TabsTrigger value="medical" className="text-xs">Medical</TabsTrigger>
                  <TabsTrigger value="fees" className="text-xs">Fees</TabsTrigger>
                  <TabsTrigger value="attendance" className="text-xs">Attend.</TabsTrigger>
                  <TabsTrigger value="results" className="text-xs">Results</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs">Docs</TabsTrigger>
                  <TabsTrigger value="communication" className="text-xs">Comm.</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <ProfileCard icon={Calendar} label="Date of Birth" value={selected.dob} color="text-primary" bg="bg-primary/5" />
                    <ProfileCard icon={Droplet} label="Blood Group" value={selected.bloodGroup} color="text-red-600" bg="bg-red-500/5" />
                    <ProfileCard icon={Globe} label="Nationality" value={selected.nationality} color="text-primary" bg="bg-primary/5" />
                    <ProfileCard icon={User} label="Religion" value={selected.religion} color="text-purple-600" bg="bg-purple-500/5" />
                    <ProfileCard icon={FileText} label="CNIC / B-Form" value={selected.cnic} color="text-foreground" bg="bg-muted/30" />
                    <ProfileCard icon={Calendar} label="Admission Date" value={selected.admissionDate} color="text-foreground" bg="bg-muted/30" />
                    <ProfileCard icon={DollarSign} label="Monthly Fee" value={`Rs. ${selected.monthlyFee.toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-500/5" />
                    <ProfileCard icon={Home} label="Hosteller" value={selected.isHosteller ? "Yes" : "No"} color="text-accent" bg="bg-accent/5" />
                    <ProfileCard icon={Bus} label="Transport" value={selected.transport ? "Yes" : "No"} color="text-primary" bg="bg-primary/5" />
                  </div>
                  {selected.address && selected.address !== "—" && (
                    <div className="rounded-xl border border-border/40 p-3 bg-muted/20">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3" />Home Address</p>
                      <p className="text-sm font-medium">{selected.address}</p>
                    </div>
                  )}
                  {selected.siblings && (
                    <div className="rounded-xl border border-border/40 p-3 bg-muted/20">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Siblings in School</p>
                      <p className="text-sm font-medium">{selected.siblings}</p>
                    </div>
                  )}
                  {selected.transport && selected.transportRoute && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                      <p className="text-[10px] text-primary uppercase tracking-wide flex items-center gap-1.5 mb-1"><Bus className="w-3 h-3" />Transport Route</p>
                      <p className="text-sm font-medium">{selected.transportRoute}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Parents */}
                <TabsContent value="parents" className="space-y-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                      <p className="text-sm font-semibold text-primary">Father</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ProfileField label="Name" value={selected.fatherName} />
                      <ProfileField label="CNIC" value={selected.fatherCnic} />
                      <ProfileField label="Phone" value={selected.fatherPhone} icon={Phone} />
                      <ProfileField label="Occupation" value={selected.fatherOccupation} icon={Briefcase} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center"><UserCircle className="w-4 h-4 text-purple-600" /></div>
                      <p className="text-sm font-semibold text-purple-600">Mother</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ProfileField label="Name" value={selected.motherName} />
                      <ProfileField label="Phone" value={selected.motherPhone} icon={Phone} />
                      <ProfileField label="Occupation" value={selected.motherOccupation} icon={Briefcase} />
                    </div>
                  </div>
                  {selected.guardianName && (
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Users className="w-4 h-4 text-muted-foreground" /></div>
                        <p className="text-sm font-semibold">Guardian</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <ProfileField label="Name" value={selected.guardianName} />
                        <ProfileField label="Phone" value={selected.guardianPhone} icon={Phone} />
                        <ProfileField label="Relation" value={selected.guardianRelation} />
                      </div>
                    </div>
                  )}
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-accent" /></div>
                      <p className="text-sm font-semibold text-accent">Emergency Contact</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ProfileField label="Name" value={selected.emergencyName} />
                      <ProfileField label="Phone" value={selected.emergencyContact} icon={Phone} />
                    </div>
                  </div>
                </TabsContent>

                {/* Academic */}
                <TabsContent value="academic" className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <ProfileCard icon={GraduationCap} label="Current Class" value={`${selected.class}-${selected.section}`} color="text-primary" bg="bg-primary/5" />
                    <ProfileCard icon={User} label="Roll Number" value={selected.rollNo} color="text-foreground" bg="bg-muted/30" />
                    <ProfileCard icon={Calendar} label="Admission Date" value={selected.admissionDate} color="text-foreground" bg="bg-muted/30" />
                    <ProfileCard icon={FileText} label="Previous School" value={selected.previousSchool} color="text-foreground" bg="bg-muted/30" />
                  </div>
                </TabsContent>

                {/* Medical */}
                <TabsContent value="medical" className="space-y-3">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center"><Stethoscope className="w-4 h-4 text-red-600" /></div>
                      <p className="text-sm font-semibold text-red-600">Medical Information</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <ProfileCard icon={Droplet} label="Blood Group" value={selected.bloodGroup} color="text-red-600" bg="bg-red-500/5" />
                      <ProfileCard icon={AlertCircle} label="Conditions" value={selected.medicalConditions} color="text-foreground" bg="bg-muted/30" />
                      <ProfileCard icon={AlertCircle} label="Allergies" value={selected.allergies} color="text-foreground" bg="bg-muted/30" />
                      <ProfileCard icon={Phone} label="Emergency Phone" value={selected.emergencyContact} color="text-foreground" bg="bg-muted/30" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">⚠️ Important:</p>
                    <p className="mt-1">This information is used during medical emergencies and field trips. Please keep the school office updated on any changes.</p>
                  </div>
                </TabsContent>

                {/* Fees */}
                <TabsContent value="fees" className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-muted/30 p-3 border border-border/30">
                      <p className="text-[10px] text-muted-foreground uppercase">Monthly Fee</p>
                      <p className="text-xl font-bold mt-1">Rs. {selected.monthlyFee.toLocaleString()}</p>
                      {selected.isHosteller && <p className="text-[10px] text-accent mt-0.5">Hostel fee applies</p>}
                    </div>
                    <div className="rounded-xl bg-red-500/5 p-3 border border-red-500/20">
                      <p className="text-[10px] text-muted-foreground uppercase">Outstanding</p>
                      <p className="text-xl font-bold text-red-600 mt-1">Rs. {selected.outstandingAmount.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/5 p-3 border border-emerald-500/20">
                      <p className="text-[10px] text-muted-foreground uppercase">This Month</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">{selected.feePaidThisMonth ? "Paid ✓" : "Pending"}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 overflow-hidden">
                    <div className="px-3 py-2 bg-muted/40 border-b border-border/30 flex items-center justify-between">
                      <p className="text-xs font-semibold flex items-center gap-1.5"><ReceiptIcon className="w-3.5 h-3.5 text-primary" /> Fee Payment History</p>
                      <p className="text-[10px] text-muted-foreground">{feeCollections.filter(f => f.studentId === selected.id).length} receipts</p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {feeCollections.filter(f => f.studentId === selected.id).length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground">No fee payments recorded yet.</div>
                      ) : (
                        feeCollections.filter(f => f.studentId === selected.id).map(f => (
                          <div key={f.id} className="flex items-center gap-3 p-2 border-b border-border/20 hover:bg-muted/30 last:border-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0"><ReceiptIcon className="w-3.5 h-3.5 text-emerald-600" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono text-muted-foreground">{f.receiptNo}</p>
                              <p className="text-[10px] text-muted-foreground">{f.date} • {f.feeType} • {f.mode}</p>
                            </div>
                            <p className="font-bold text-sm text-emerald-600">Rs. {f.amount.toLocaleString()}</p>
                            <button onClick={() => printFeeReceipt(f, selected, school)} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Reprint Receipt"><Printer className="w-3.5 h-3.5" /></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Attendance */}
                <TabsContent value="attendance">
                  <div className="rounded-xl border border-border/40 p-6 text-center">
                    <div className="relative w-36 h-36 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="64" fill="none" stroke="oklch(0.92 0.012 95)" strokeWidth="14" />
                        <circle cx="72" cy="72" r="64" fill="none" stroke="#15857A" strokeWidth="14"
                          strokeDasharray={`${2 * Math.PI * 64 * selected.attendancePct / 100} ${2 * Math.PI * 64}`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-xl font-bold text-primary">{selected.attendancePct}%</p>
                        <p className="text-[10px] text-muted-foreground">Attendance</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Current month attendance rate</p>
                  </div>
                  {/* Quick mark today */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mt-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Mark Today's Attendance</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(["Present", "Late", "Absent", "Leave"] as const).map(status => {
                        const colors: Record<string, string> = {
                          Present: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20",
                          Late: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20",
                          Absent: "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20",
                          Leave: "bg-muted text-muted-foreground border-border/40 hover:bg-muted/70",
                        };
                        return (
                          <button
                            key={status}
                            onClick={() => {
                              updateStudent(selected.id, {
                                attendancePct: status === "Present" ? Math.min(100, selected.attendancePct + 1) : Math.max(0, selected.attendancePct - 1),
                              });
                            }}
                            className={cn("px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all", colors[status])}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Results */}
                <TabsContent value="results">
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No exam results published yet</p>
                    <p className="text-xs mt-1">Results will appear here after the next exam is graded.</p>
                  </div>
                </TabsContent>

                {/* Documents */}
                <TabsContent value="documents" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Birth Certificate", "Photo", "Transfer Certificate", "Report Card", "Medical Record", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <input ref={docFileRef} type="file" accept="image/*,application/pdf" onChange={handleDocUpload} className="hidden" />
                    <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => docFileRef.current?.click()}>
                      <Upload className="w-3.5 h-3.5 mr-1" />Upload Document
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {documents.filter(d => d.studentId === selected.id).length === 0 ? (
                      <div className="text-center py-10 text-sm text-muted-foreground">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>No documents uploaded yet.</p>
                        <p className="text-xs mt-1">Upload birth certificates, photos, transfer certificates, etc.</p>
                      </div>
                    ) : (
                      documents.filter(d => d.studentId === selected.id).map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-2 rounded-xl border border-border/30 hover:bg-muted/30">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground">{doc.type} • {doc.uploadDate} • {(doc.size / 1024).toFixed(0)} KB</p>
                          </div>
                          <a href={doc.dataUrl} download={doc.name} className="text-primary hover:text-primary/70 text-xs">Download</a>
                          <button onClick={() => deleteDocument(doc.id)} className="text-red-600 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Communication Log */}
                <TabsContent value="communication" className="space-y-3">
                  {/* Add new entry */}
                  <div className="rounded-xl border border-border/40 p-3 space-y-2 bg-muted/20">
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={commForm.type} onValueChange={v => setCommForm({...commForm, type: v})}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{["Phone Call", "Meeting", "SMS", "Email", "Note"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={commForm.direction} onValueChange={v => setCommForm({...commForm, direction: v})}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Outgoing">Outgoing</SelectItem><SelectItem value="Incoming">Incoming</SelectItem></SelectContent>
                      </Select>
                      <Input value={commForm.subject} onChange={e => setCommForm({...commForm, subject: e.target.value})} placeholder="Subject" className="h-8 text-xs" />
                    </div>
                    <Input value={commForm.notes} onChange={e => setCommForm({...commForm, notes: e.target.value})} placeholder="Notes / details..." className="h-8 text-xs" />
                    <Button size="sm" className="bg-primary hover:bg-primary/90 h-7 text-xs" onClick={handleAddComm} disabled={!commForm.subject}>
                      <Plus className="w-3 h-3 mr-1" />Add Entry
                    </Button>
                  </div>
                  {/* Log entries */}
                  <div className="space-y-2">
                    {commLogs.filter(l => l.studentId === selected.id).length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>No communication logged yet.</p>
                      </div>
                    ) : (
                      commLogs.filter(l => l.studentId === selected.id).map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-2 rounded-xl border border-border/30 hover:bg-muted/30">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            log.type === "Phone Call" ? "bg-primary/10" : log.type === "Meeting" ? "bg-purple-500/10" : log.type === "SMS" ? "bg-emerald-500/10" : "bg-accent/10")}>
                            {log.type === "Phone Call" ? <Phone className="w-4 h-4 text-primary" /> : log.type === "Meeting" ? <Users className="w-4 h-4 text-purple-600" /> : log.type === "SMS" ? <Mail className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-accent" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{log.subject}</p>
                              <Badge variant="outline" className="text-[9px]">{log.type}</Badge>
                              <Badge variant="outline" className={cn("text-[9px]", log.direction === "Incoming" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary")}>{log.direction}</Badge>
                            </div>
                            {log.notes && <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>}
                            <p className="text-[10px] text-muted-foreground mt-0.5">{log.date} • by {log.user}</p>
                          </div>
                          <button onClick={() => deleteCommLog(log.id)} className="text-red-600 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editStudent} onOpenChange={(o) => !o && setEditStudent(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="w-4 h-4 text-primary" />Edit Student</DialogTitle>
          </DialogHeader>
          {editStudent && (
            <div className="space-y-2 py-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Name</Label><Input value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                <div><Label>Class</Label>
                  <Select value={editForm.class || ""} onValueChange={v => setEditForm({...editForm, class: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Section</Label>
                  <Select value={editForm.section || "A"} onValueChange={v => setEditForm({...editForm, section: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Father's Name</Label><Input value={editForm.fatherName || ""} onChange={e => setEditForm({...editForm, fatherName: e.target.value})} /></div>
                <div><Label>Father's Phone</Label><Input value={editForm.fatherPhone || ""} onChange={e => setEditForm({...editForm, fatherPhone: e.target.value})} /></div>
                <div><Label>Monthly Fee</Label><Input type="number" value={editForm.monthlyFee || 0} onChange={e => setEditForm({...editForm, monthlyFee: Number(e.target.value)})} /></div>
                <div><Label>Blood Group</Label>
                  <Select value={editForm.bloodGroup || "A+"} onValueChange={v => setEditForm({...editForm, bloodGroup: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BLOOD_GROUPS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Address</Label><Input value={editForm.address || ""} onChange={e => setEditForm({...editForm, address: e.target.value})} /></div>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.isHosteller || false} onChange={e => setEditForm({...editForm, isHosteller: e.target.checked})} className="w-4 h-4 accent-accent" /> Hosteller</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editForm.transport || false} onChange={e => setEditForm({...editForm, transport: e.target.checked})} className="w-4 h-4 accent-primary" /> Transport</label>
                </div>
                <div><Label>Status</Label>
                  <Select value={editForm.status || "Active"} onValueChange={(v: any) => setEditForm({...editForm, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Left">Left</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudent(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              if (editStudent) {
                updateStudent(editStudent.id, editForm);
                toast({ title: "Student Updated ✓", description: `${editForm.name || editStudent.name}'s profile has been updated.` });
                setEditStudent(null);
              }
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" />Delete Student?</DialogTitle>
          </DialogHeader>
          {deleteConfirm && (
            <div className="py-2">
              <p className="text-sm text-muted-foreground">Are you sure you want to permanently delete:</p>
              <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="font-semibold text-sm">{deleteConfirm.name}</p>
                <p className="text-xs text-muted-foreground">{deleteConfirm.id} • {deleteConfirm.class}-{deleteConfirm.section}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">⚠️ This action cannot be undone. All fee receipts and attendance records for this student will remain in the system for audit purposes.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteConfirm) {
                deleteStudent(deleteConfirm.id);
                toast({ title: "Student Deleted", description: `${deleteConfirm.name} has been removed from the system.`, variant: "destructive" });
                setDeleteConfirm(null);
              }
            }}><Trash2 className="w-4 h-4 mr-1.5" />Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote dialog */}
      <Dialog open={!!promoteTarget} onOpenChange={(o) => !o && setPromoteTarget(null)}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowUpCircle className="w-4 h-4 text-emerald-600" />Promote Student</DialogTitle>
          </DialogHeader>
          {promoteTarget && (
            <div className="space-y-2 py-1">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <p className="font-semibold text-sm">{promoteTarget.name}</p>
                <p className="text-xs text-muted-foreground">Current: {promoteTarget.class}-{promoteTarget.section} • Roll #{promoteTarget.rollNo}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Promote to Class</Label>
                  <Select value={promoteClass} onValueChange={(v) => {
                    setPromoteClass(v);
                    // Reset section to first available section of the new class
                    const cls = CLASSES.find(c => c.name === v);
                    setPromoteSection(cls?.sections?.[0] || "A");
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Section</Label>
                  <Select value={promoteSection} onValueChange={setPromoteSection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(CLASSES.find(c => c.name === promoteClass)?.sections || ["A", "B"]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary">What happens on promote:</p>
                <p className="text-muted-foreground mt-1">• Student moves to new class & section<br/>• New roll number auto-assigned (next available)<br/>• Monthly fee updated to new class rate<br/>• If fee increases, outstanding adjusted & fee-paid flag reset<br/>• All historical records preserved</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteTarget(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={CLASSES.length === 0} onClick={() => {
              if (!promoteTarget) return;
              const targetCls = CLASSES.find(c => c.name === promoteClass);
              if (!targetCls) {
                toast({ title: "Invalid class", description: "Please select a valid class.", variant: "destructive" });
                return;
              }
              const newFee = targetCls.monthlyFee;
              const oldFee = promoteTarget.monthlyFee;

              // Compute next available roll number in the target class+section
              const sameClassStudents = students.filter(s =>
                s.class === promoteClass && s.section === promoteSection && s.id !== promoteTarget.id
              );
              const maxRoll = sameClassStudents.reduce((max, s) => {
                const n = parseInt(s.rollNo) || 0;
                return n > max ? n : max;
              }, 0);
              const newRollNo = String(maxRoll + 1).padStart(2, "0");

              // Build the update patch
              const patch: Partial<Student> = {
                class: promoteClass,
                section: promoteSection,
                monthlyFee: newFee,
                rollNo: newRollNo,
                academicStatus: "Promoted" as any,
                attendancePct: 100, // Reset attendance for new class/session
              };

              // Fee adjustment logic:
              // - If fee INCREASES: student owes the difference (whether paid or not)
              //   - If already paid: reset feePaidThisMonth + add difference to outstanding
              //   - If not paid: add difference to outstanding (they owe old + new difference)
              // - If fee DECREASES: student gets credit (reduce outstanding if they had any)
              // - If same fee: no adjustment needed
              const feeDiff = newFee - oldFee;
              if (feeDiff > 0) {
                // Fee increased — student owes the difference
                patch.outstandingAmount = promoteTarget.outstandingAmount + feeDiff;
                if (promoteTarget.feePaidThisMonth) {
                  patch.feePaidThisMonth = false;
                }
              } else if (feeDiff < 0 && promoteTarget.outstandingAmount > 0) {
                // Fee decreased — reduce outstanding by the credit
                patch.outstandingAmount = Math.max(0, promoteTarget.outstandingAmount + feeDiff);
              }

              updateStudent(promoteTarget.id, patch);
              toast({
                title: "Student Promoted ✓",
                description: `${promoteTarget.name} → ${promoteClass}-${promoteSection} • Roll #${newRollNo} • Fee: Rs. ${newFee.toLocaleString()}/month${feeDiff !== 0 ? ` • Outstanding adjusted by Rs. ${Math.abs(feeDiff).toLocaleString()}` : ""}`,
              });
              setPromoteTarget(null);
            }}><ArrowUpCircle className="w-4 h-4 mr-1.5" />Promote Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Promote dialog */}
      <Dialog open={bulkPromoteOpen} onOpenChange={setBulkPromoteOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowUpCircle className="w-4 h-4 text-emerald-600" />Bulk Promote Students</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm font-semibold">{selectedIds.size} students selected for promotion</p>
              <p className="text-xs text-muted-foreground mt-1">All selected students will be moved to the new class & section. Monthly fee will be auto-updated.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Promote to Class</Label>
                <Select value={bulkClass} onValueChange={setBulkClass}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Section</Label>
                <Select value={bulkSection} onValueChange={setBulkSection}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPromoteOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkPromote}>
              <ArrowUpCircle className="w-4 h-4 mr-1.5" />Promote {selectedIds.size} Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Fee Collection dialog */}
      <Dialog open={bulkFeeOpen} onOpenChange={setBulkFeeOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600" />Bulk Fee Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm font-semibold">{selectedIds.size} students selected</p>
              <p className="text-xs text-muted-foreground mt-1">The same amount will be collected from each student. Individual receipts will be generated.</p>
            </div>
            <div>
              <Label>Amount per Student (Rs.)</Label>
              <Input type="number" value={bulkFeeAmount} onChange={e => setBulkFeeAmount(Number(e.target.value))} placeholder="0" className="text-lg font-bold h-10" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[500, 1000, 1500, 2000, 3000, 5000].map(amt => (
                <button key={amt} onClick={() => setBulkFeeAmount(amt)} className="px-2 py-1 text-[10px] rounded-md border border-border/40 bg-background hover:bg-primary/10 hover:border-primary/30 transition-colors">
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select value={bulkFeeMode} onValueChange={(v: any) => setBulkFeeMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
              <p className="font-medium text-primary">Summary:</p>
              <p className="text-muted-foreground mt-1">{selectedIds.size} students × Rs. {bulkFeeAmount.toLocaleString()} = <strong className="text-foreground">Rs. {(bulkFeeAmount * selectedIds.size).toLocaleString()} total</strong></p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkFeeOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkFee} disabled={bulkFeeAmount <= 0}>
              <DollarSign className="w-4 h-4 mr-1.5" />Collect from {selectedIds.size} Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Icon className={cn("w-3 h-3", color)} />{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}

function ProfileCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string; color?: string; bg?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/30 p-3 flex items-center gap-3", bg)}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg?.replace("/5", "/15").replace("/30", "/40"))}>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

function ProfileField({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium flex items-center gap-1.5 mt-0.5">
        {Icon && <Icon className="w-3 h-3 text-muted-foreground" />}
        {value || "—"}
      </p>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="font-medium flex items-center gap-1.5 mt-0.5">{Icon && <Icon className="w-3 h-3 text-muted-foreground" />}{value}</p>
    </div>
  );
}
