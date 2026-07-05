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
  AlertCircle, Bus, Siblings, Home, Calendar, Droplet, Globe, Briefcase,
  User, UserCircle, Stethoscope, FileText, X, DollarSign,
} from "lucide-react";
import { CLASSES, type Student } from "@/lib/sms-data";
import { cn } from "@/lib/utils";
import { printStudentIDCard, printFeeReceipt } from "@/lib/pdf-service";
import { Receipt as ReceiptIcon } from "lucide-react";

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
  const { students, searchQuery, addStudent, school, feeCollections } = useAppStore();
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Student | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formSection, setFormSection] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      if (classFilter !== "all" && s.class !== classFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q && !(`${s.name} ${s.fatherName} ${s.id} ${s.fatherPhone} ${s.cnic}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 500 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    const cls = CLASSES.find(c => c.name === form.class);
    const monthlyFee = cls?.monthlyFee ?? 2000;
    const hostelFee = form.isHosteller ? 3500 : 0;
    const newStudent: Student = {
      id: `SCH-2026-${String(students.length + 1).padStart(4, "0")}`,
      rollNo: String(filtered.length + 1).padStart(2, "0"),
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
      attendancePct: 100,
      feePaidThisMonth: false,
      isHosteller: form.isHosteller,
      transport: form.transport,
      transportRoute: form.transport ? form.transportRoute : undefined,
      siblings: form.siblings,
      photo: form.photo || undefined,
      outstandingAmount: monthlyFee + hostelFee,
    };
    addStudent(newStudent);
    setAddOpen(false);
    setForm(EMPTY_FORM);
    setFormSection(0);
  };

  const printIDCard = async (s: Student) => {
    try { await printStudentIDCard(s, school); } catch {}
  };

  const formSections = [
    { title: "Personal Info", icon: User },
    { title: "Parents", icon: Users },
    { title: "Academic", icon: GraduationCap },
    { title: "Medical & Address", icon: Heart },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, CNIC, father, phone..." className="pl-9 bg-background/60" />
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />New Student Admission</DialogTitle>
            </DialogHeader>

            {/* Section tabs */}
            <div className="flex items-center gap-2 border-b border-border/30 pb-3">
              {formSections.map((sec, i) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.title}
                    onClick={() => setFormSection(i)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      formSection === i ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                      formSection === i ? "bg-white/20" : "bg-muted-foreground/20")}>
                      {i + 1}
                    </span>
                    <Icon className="w-3.5 h-3.5" />
                    {sec.title}
                  </button>
                );
              })}
            </div>

            {/* Section 0: Personal Info + Photo */}
            {formSection === 0 && (
              <div className="space-y-4 py-2">
                {/* Photo upload */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 flex items-center justify-center overflow-hidden shrink-0">
                    {form.photo ? (
                      <>
                        <img src={form.photo} alt="Student" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setForm({ ...form, photo: "" })}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label>Student Photo</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Optional • PNG/JPG • Max 500KB • Used on ID card</p>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handlePhotoUpload} className="hidden" />
                    <div className="flex gap-2 mt-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Photo
                      </Button>
                      {form.photo && (
                        <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, photo: "" })} className="text-red-600">
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Student's full name" /></div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v: "Male" | "Female") => setForm({...form, gender: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} /></div>
                  <div><Label>CNIC / B-Form No.</Label><Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} placeholder="42101-XXXXXXX-X" /></div>
                  <div>
                    <Label>Blood Group</Label>
                    <Select value={form.bloodGroup} onValueChange={v => setForm({...form, bloodGroup: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{BLOOD_GROUPS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Religion</Label>
                    <Select value={form.religion} onValueChange={v => setForm({...form, religion: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{RELIGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Nationality</Label><Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} /></div>
                </div>
              </div>
            )}

            {/* Section 1: Parents */}
            {formSection === 1 && (
              <div className="space-y-4 py-2">
                {/* Father */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-3"><User className="w-3.5 h-3.5" />Father Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><Label>Father's Name *</Label><Input value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} placeholder="Father's full name" /></div>
                    <div><Label>Father's CNIC</Label><Input value={form.fatherCnic} onChange={e => setForm({...form, fatherCnic: e.target.value})} placeholder="42101-XXXXXXX-X" /></div>
                    <div><Label>Father's Phone *</Label><Input value={form.fatherPhone} onChange={e => setForm({...form, fatherPhone: e.target.value})} placeholder="+92 3xx xxxxxxx" /></div>
                    <div className="col-span-2"><Label>Father's Occupation</Label><Input value={form.fatherOccupation} onChange={e => setForm({...form, fatherOccupation: e.target.value})} placeholder="e.g., Engineer, Businessman" /></div>
                  </div>
                </div>
                {/* Mother */}
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                  <p className="text-xs font-semibold text-purple-600 flex items-center gap-1.5 mb-3"><UserCircle className="w-3.5 h-3.5" />Mother Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Mother's Name</Label><Input value={form.motherName} onChange={e => setForm({...form, motherName: e.target.value})} /></div>
                    <div><Label>Mother's Phone</Label><Input value={form.motherPhone} onChange={e => setForm({...form, motherPhone: e.target.value})} /></div>
                    <div className="col-span-2"><Label>Mother's Occupation</Label><Input value={form.motherOccupation} onChange={e => setForm({...form, motherOccupation: e.target.value})} placeholder="Housewife / Occupation" /></div>
                  </div>
                </div>
                {/* Guardian */}
                <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3"><Users className="w-3.5 h-3.5" />Guardian (if parents unavailable)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Guardian Name</Label><Input value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} /></div>
                    <div><Label>Guardian Phone</Label><Input value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} /></div>
                    <div><Label>Relation</Label><Input value={form.guardianRelation} onChange={e => setForm({...form, guardianRelation: e.target.value})} placeholder="Uncle, Aunt, etc." /></div>
                  </div>
                </div>
                {/* Emergency contact */}
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <p className="text-xs font-semibold text-accent flex items-center gap-1.5 mb-3"><AlertCircle className="w-3.5 h-3.5" />Emergency Contact</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Emergency Contact Name</Label><Input value={form.emergencyName} onChange={e => setForm({...form, emergencyName: e.target.value})} /></div>
                    <div><Label>Emergency Phone</Label><Input value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} /></div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Academic */}
            {formSection === 2 && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Class</Label>
                    <Select value={form.class} onValueChange={v => setForm({...form, class: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Section</Label>
                    <Select value={form.section} onValueChange={v => setForm({...form, section: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2"><Label>Previous School</Label><Input value={form.previousSchool} onChange={e => setForm({...form, previousSchool: e.target.value})} placeholder="School name (if transfer)" /></div>
                </div>

                {/* Hosteller + Transport */}
                <div className="grid grid-cols-2 gap-3">
                  <label className={cn("flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    form.isHosteller ? "border-accent bg-accent/5" : "border-border/40")}>
                    <input type="checkbox" checked={form.isHosteller} onChange={e => setForm({...form, isHosteller: e.target.checked})} className="w-4 h-4 accent-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-accent" />Hosteller</p>
                      <p className="text-[10px] text-muted-foreground">Boarding student (+ Rs. 3,500/month)</p>
                    </div>
                  </label>
                  <label className={cn("flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    form.transport ? "border-primary bg-primary/5" : "border-border/40")}>
                    <input type="checkbox" checked={form.transport} onChange={e => setForm({...form, transport: e.target.checked})} className="w-4 h-4 accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium flex items-center gap-1.5"><Bus className="w-3.5 h-3.5 text-primary" />Uses Transport</p>
                      <p className="text-[10px] text-muted-foreground">School bus service</p>
                    </div>
                  </label>
                </div>
                {form.transport && (
                  <div><Label>Transport Route</Label><Input value={form.transportRoute} onChange={e => setForm({...form, transportRoute: e.target.value})} placeholder="e.g., Route A — Gulshan" /></div>
                )}
                <div><Label>Siblings in this School</Label><Input value={form.siblings} onChange={e => setForm({...form, siblings: e.target.value})} placeholder="e.g., Sara Khan (Grade 3)" /></div>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                  <p className="font-medium text-primary">Auto-generated on save:</p>
                  <p className="text-muted-foreground mt-1">Student ID (SCH-2026-XXXX) • Roll Number • QR Code for ID Card • Monthly Fee: Rs. {(CLASSES.find(c => c.name === form.class)?.monthlyFee ?? 0).toLocaleString()}{form.isHosteller ? " + Rs. 3,500 hostel" : ""}</p>
                </div>
              </div>
            )}

            {/* Section 3: Medical & Address */}
            {formSection === 3 && (
              <div className="space-y-4 py-2">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mb-3"><Stethoscope className="w-3.5 h-3.5" />Medical Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Medical Conditions</Label><Input value={form.medicalConditions} onChange={e => setForm({...form, medicalConditions: e.target.value})} placeholder="e.g., Asthma, Diabetes, None" /></div>
                    <div><Label>Allergies</Label><Input value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} placeholder="e.g., Peanuts, Dust, None" /></div>
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3"><MapPin className="w-3.5 h-3.5" />Home Address</p>
                  <div><Label>Complete Address</Label><textarea
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="House #, Street, Block, City, Province"
                    className="w-full min-h-[70px] rounded-md border border-border bg-background px-3 py-2 text-sm mt-1"
                  /></div>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-between">
              <div className="flex gap-2">
                {formSection > 0 && (
                  <Button variant="outline" onClick={() => setFormSection(formSection - 1)}>← Previous</Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setAddOpen(false); setForm(EMPTY_FORM); setFormSection(0); }}>Cancel</Button>
                {formSection < 3 ? (
                  <Button onClick={() => setFormSection(formSection + 1)} disabled={formSection === 0 && (!form.name || !form.fatherName)}>Next →</Button>
                ) : (
                  <Button onClick={handleAdd} disabled={!form.name || !form.fatherName} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-1.5" />Save & Admit Student
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Users className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{filtered.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><UserCheck className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Active</p><p className="text-xl font-bold">{filtered.filter(s => s.status === "Active").length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><Home className="w-5 h-5 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Hostellers</p><p className="text-xl font-bold">{filtered.filter(s => s.isHosteller).length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Bus className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Transport</p><p className="text-xl font-bold">{filtered.filter(s => s.transport).length}</p></div>
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
        <DrawerContent className="max-h-[92vh]">
          {selected && (
            <>
              <DrawerHeader className="border-b border-border/30 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                    {selected.photo ? (
                      <img src={selected.photo} alt={selected.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className={cn("text-xl font-semibold", selected.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                        {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <DrawerTitle className="text-2xl flex items-center gap-2">
                      {selected.name}
                      {selected.isHosteller && <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-0"><Home className="w-2.5 h-2.5 mr-0.5" />Hosteller</Badge>}
                      {selected.transport && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-0"><Bus className="w-2.5 h-2.5 mr-0.5" />Transport</Badge>}
                    </DrawerTitle>
                    <DrawerDescription className="flex items-center gap-2 flex-wrap mt-1.5">
                      <Badge variant="outline">{selected.id}</Badge>
                      <Badge variant="outline">Roll #{selected.rollNo}</Badge>
                      <Badge variant="outline">{selected.class}-{selected.section}</Badge>
                      <Badge variant="outline" className="bg-red-500/5">{selected.bloodGroup}</Badge>
                      <Badge variant={selected.status === "Active" ? "default" : "secondary"}>{selected.status}</Badge>
                    </DrawerDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => printIDCard(selected)}>
                      <QrCode className="w-4 h-4 mr-1.5" />ID Card
                    </Button>
                    <Button size="sm" variant="outline"><Printer className="w-4 h-4 mr-1.5" />Profile</Button>
                  </div>
                </div>
              </DrawerHeader>
              <div className="p-4 overflow-y-auto">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-7 max-w-3xl">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="parents">Parents</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="medical">Medical</TabsTrigger>
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>

                  {/* Overview */}
                  <TabsContent value="overview" className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <InfoTile icon={Calendar} label="Date of Birth" value={selected.dob} color="text-primary" />
                      <InfoTile icon={Droplet} label="Blood Group" value={selected.bloodGroup} color="text-red-600" />
                      <InfoTile icon={Globe} label="Nationality" value={selected.nationality} color="text-primary" />
                      <InfoTile icon={User} label="Religion" value={selected.religion} color="text-purple-600" />
                      <InfoTile icon={User} label="CNIC / B-Form" value={selected.cnic} color="text-foreground" />
                      <InfoTile icon={Calendar} label="Admission Date" value={selected.admissionDate} color="text-foreground" />
                      <InfoTile icon={DollarSign} label="Monthly Fee" value={`Rs. ${selected.monthlyFee.toLocaleString()}`} color="text-emerald-600" />
                      <InfoTile icon={Home} label="Hosteller" value={selected.isHosteller ? "Yes" : "No"} color="text-accent" />
                    </div>
                    {selected.address && selected.address !== "—" && (
                      <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3" />Home Address</p>
                        <p className="text-sm font-medium">{selected.address}</p>
                      </div>
                    )}
                    {selected.siblings && (
                      <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Siblings in School</p>
                        <p className="text-sm font-medium">{selected.siblings}</p>
                      </div>
                    )}
                    {selected.transport && selected.transportRoute && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs text-primary uppercase tracking-wide flex items-center gap-1.5 mb-1"><Bus className="w-3 h-3" />Transport</p>
                        <p className="text-sm font-medium">{selected.transportRoute}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Parents */}
                  <TabsContent value="parents" className="mt-4 space-y-3">
                    {/* Father */}
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Father</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoRow label="Name" value={selected.fatherName} />
                        <InfoRow label="CNIC" value={selected.fatherCnic} />
                        <InfoRow label="Phone" value={selected.fatherPhone} icon={Phone} />
                        <InfoRow label="Occupation" value={selected.fatherOccupation} icon={Briefcase} />
                      </div>
                    </div>
                    {/* Mother */}
                    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3 flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5" />Mother</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoRow label="Name" value={selected.motherName} />
                        <InfoRow label="Phone" value={selected.motherPhone} icon={Phone} />
                        <InfoRow label="Occupation" value={selected.motherOccupation} icon={Briefcase} />
                      </div>
                    </div>
                    {/* Guardian */}
                    {selected.guardianName && (
                      <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Guardian</p>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <InfoRow label="Name" value={selected.guardianName} />
                          <InfoRow label="Phone" value={selected.guardianPhone} icon={Phone} />
                          <InfoRow label="Relation" value={selected.guardianRelation} />
                        </div>
                      </div>
                    )}
                    {/* Emergency */}
                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                      <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-3 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />Emergency Contact</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoRow label="Contact Name" value={selected.emergencyName} />
                        <InfoRow label="Phone" value={selected.emergencyContact} icon={Phone} />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Academic */}
                  <TabsContent value="academic" className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoTile icon={GraduationCap} label="Current Class" value={`${selected.class}-${selected.section}`} color="text-primary" />
                      <InfoTile icon={User} label="Roll Number" value={selected.rollNo} color="text-foreground" />
                      <InfoTile icon={Calendar} label="Admission Date" value={selected.admissionDate} color="text-foreground" />
                      <InfoTile icon={FileText} label="Previous School" value={selected.previousSchool} color="text-foreground" />
                    </div>
                  </TabsContent>

                  {/* Medical */}
                  <TabsContent value="medical" className="mt-4 space-y-3">
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                      <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" />Medical Information</p>
                      <div className="grid grid-cols-2 gap-3">
                        <InfoTile icon={Droplet} label="Blood Group" value={selected.bloodGroup} color="text-red-600" />
                        <InfoTile icon={AlertCircle} label="Medical Conditions" value={selected.medicalConditions} color="text-foreground" />
                        <InfoTile icon={AlertCircle} label="Allergies" value={selected.allergies} color="text-foreground" />
                        <InfoTile icon={Phone} label="Emergency Phone" value={selected.emergencyContact} color="text-foreground" />
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/40 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">⚠️ Important:</p>
                      <p className="mt-1">This information is used during medical emergencies and field trips. Please keep the school office updated on any changes.</p>
                    </div>
                  </TabsContent>

                  {/* Fees */}
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
                        <p className="text-xs font-semibold flex items-center gap-1.5"><ReceiptIcon className="w-3.5 h-3.5 text-primary" /> Fee Payment History</p>
                        <p className="text-[10px] text-muted-foreground">{feeCollections.filter(f => f.studentId === selected.id).length} receipts</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {feeCollections.filter(f => f.studentId === selected.id).length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground">No fee payments recorded yet.</div>
                        ) : (
                          feeCollections.filter(f => f.studentId === selected.id).map(f => (
                            <div key={f.id} className="flex items-center gap-3 p-2.5 border-b border-border/20 hover:bg-muted/30 last:border-0">
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

                  {/* Results */}
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

function InfoTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Icon className={cn("w-3 h-3", color)} />{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
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
