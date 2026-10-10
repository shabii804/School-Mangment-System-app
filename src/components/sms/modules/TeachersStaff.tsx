"use client";

import { useState } from "react";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Phone, Mail, Wallet, GraduationCap, UserCog, BookOpen,
  CalendarDays, Briefcase, IdCard, Edit, Trash2, Eye, X,
  Building2, Award, Users as UsersIcon, User, UserCircle, DollarSign,
} from "lucide-react";
import { type Teacher, type Staff } from "@/lib/sms-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ─────────────────────────────────────────────────────────────
// TEACHERS MODULE
// ─────────────────────────────────────────────────────────────
const EMPTY_TEACHER: Teacher = {
  id: "", name: "", cnic: "", designation: "Teacher", qualification: "",
  subjects: [], classes: [], monthlySalary: 0, joiningDate: new Date().toISOString().split("T")[0],
  phone: "", gender: "Male", attendance: { present: 0, late: 0, halfDay: 0, absent: 0, leave: 0 },
};

export function TeachersModule() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, classes: storeClasses, subjects: storeSubjects } = useAppStore();
  const CLASSES = storeClasses;
  const SUBJECTS = storeSubjects;
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Teacher | null>(null);
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [form, setForm] = useState<Teacher>(EMPTY_TEACHER);
  const [editForm, setEditForm] = useState<Partial<Teacher>>({});

  const openAdd = () => {
    setForm({ ...EMPTY_TEACHER, id: `T-${String(teachers.length + 1).padStart(3, "0")}` });
    setAddOpen(true);
  };

  const handleAdd = () => {
    if (!form.name.trim()) { toast({ title: "Name required", description: "Please enter teacher's name.", variant: "destructive" }); return; }
    if (!form.phone.trim()) { toast({ title: "Phone required", description: "Please enter phone number.", variant: "destructive" }); return; }
    if (form.monthlySalary <= 0) { toast({ title: "Salary required", description: "Please enter monthly salary.", variant: "destructive" }); return; }
    addTeacher(form);
    toast({ title: "Teacher Added ✓", description: `${form.name} added as ${form.designation} • ID: ${form.id}` });
    setAddOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage teaching staff, subjects, classes, and salary.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />Add Teacher</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5"><GraduationCap className="w-4 h-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Teachers</p><p className="text-xl font-bold">{teachers.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-purple-500/10 p-1.5"><UserCog className="w-4 h-4 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Salary</p><p className="text-lg font-bold">Rs. {(teachers.reduce((s, t) => s + t.monthlySalary, 0) / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-accent/10 p-1.5"><BookOpen className="w-4 h-4 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Subjects</p><p className="text-xl font-bold">{new Set(teachers.flatMap(t => t.subjects)).size}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5"><CalendarDays className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Avg Attendance</p><p className="text-xl font-bold">{teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => { const total = t.attendance.present + t.attendance.late + t.attendance.halfDay + t.attendance.absent + t.attendance.leave; return sum + (total > 0 ? (t.attendance.present + t.attendance.late * 0.75 + t.attendance.halfDay * 0.5) / total * 100 : 100); }, 0) / teachers.length) : 0}%</p></div>
        </CardContent></Card>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map(t => {
          const totalDays = t.attendance.present + t.attendance.late + t.attendance.halfDay + t.attendance.absent + t.attendance.leave;
          const attPct = totalDays > 0 ? Math.round((t.attendance.present + t.attendance.late * 0.75 + t.attendance.halfDay * 0.5) / totalDays * 100) : 100;
          return (
            <Card key={t.id} className="border-0 shadow-sm glass-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 cursor-pointer" onClick={() => setSelected(t)}>
                    <AvatarFallback className={cn("font-semibold", t.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                      {t.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate cursor-pointer hover:text-primary" onClick={() => setSelected(t)}>{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.designation}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{t.id}</Badge>
                      <Badge variant="outline" className="text-[10px] bg-primary/5">{attPct}% att.</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{t.subjects.join(", ")}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{t.classes.join(", ")}</span></div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5 shrink-0" /><span>{t.phone}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Monthly Salary</p>
                    <p className="font-bold text-sm">Rs. {t.monthlySalary.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View" onClick={() => setSelected(t)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary" title="Edit" onClick={() => { setEditTeacher(t); setEditForm(t); }}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" title="Delete" onClick={() => setDeleteConfirm(t)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                {/* Attendance mini-bar */}
                <div className="mt-2 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500" style={{ width: `${(t.attendance.present / totalDays) * 100}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${(t.attendance.late / totalDays) * 100}%` }} />
                  <div className="bg-orange-500" style={{ width: `${(t.attendance.halfDay / totalDays) * 100}%` }} />
                  <div className="bg-red-500" style={{ width: `${(t.attendance.absent / totalDays) * 100}%` }} />
                  <div className="bg-muted-foreground/40" style={{ width: `${(t.attendance.leave / totalDays) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
          {/* Gradient hero header */}
          <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-primary via-primary to-purple-600/80 px-5 py-4 text-primary-foreground">
            <div className="absolute inset-0 opacity-10 pattern-grid" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">Add New Teacher</h2>
                <p className="text-xs text-white/75 mt-0.5">Register a teaching staff member with subject & class assignments.</p>
              </div>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase tracking-wider text-white/60">Teacher ID</span>
                <span className="text-sm font-semibold mt-0.5 font-mono">{form.id}</span>
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
                <span className="ml-auto text-[10px] text-muted-foreground">Identity & contact</span>
              </div>
              <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Full Name <span className="text-red-500">*</span></Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Mr. Ahmed Khan" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Gender</Label>
                  <Select value={form.gender} onValueChange={(v: "Male" | "Female") => setForm({...form, gender: v})}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">CNIC</Label>
                  <Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} placeholder="42101-XXX-X" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Phone <span className="text-red-500">*</span></Label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+92 3xx" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Qualification</Label>
                  <Input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} placeholder="M.Sc, B.Ed" className="h-9" />
                </div>
              </div>
            </div>

            {/* ─── Section 2: Professional & Salary ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/15">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Professional & Salary</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Designation & compensation</span>
              </div>
              <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Designation</Label>
                  <Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="e.g., Senior Teacher" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Joining Date</Label>
                  <Input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} className="h-9" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Monthly Salary (Rs.) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
                    <Input type="number" value={form.monthlySalary} onChange={e => setForm({...form, monthlySalary: Number(e.target.value)})} placeholder="e.g., 45000" className="h-9 pl-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Section 3: Subject Assignment ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border-b border-accent/15">
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">Assign Subjects</p>
                <span className="ml-auto text-[10px] text-muted-foreground">{form.subjects.length} selected</span>
              </div>
              <div className="p-3">
                {SUBJECTS.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">No subjects added. Go to Classes → Subjects tab to add.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
                    {SUBJECTS.map(subj => {
                      const checked = form.subjects.includes(subj);
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setForm({...form, subjects: checked ? form.subjects.filter(s => s !== subj) : [...form.subjects, subj]})}
                          className={cn("px-2 py-1.5 rounded-md text-[11px] font-medium border-2 transition-all text-left flex items-center gap-1",
                            checked ? "bg-accent text-accent-foreground border-accent shadow-sm" : "bg-background border-border/40 hover:border-accent/40 hover:bg-accent/5")}
                        >
                          <BookOpen className={cn("w-2.5 h-2.5 shrink-0", checked ? "text-accent-foreground" : "text-muted-foreground")} />
                          <span className="truncate">{subj}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Section 4: Class Assignment ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/15">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Assign Classes</p>
                <span className="ml-auto text-[10px] text-muted-foreground">{form.classes.length} selected</span>
              </div>
              <div className="p-3">
                {CLASSES.length === 0 ? (
                  <div className="text-center py-4">
                    <GraduationCap className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">No classes added. Go to Classes module to add.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
                    {CLASSES.map(cls => {
                      const checked = form.classes.includes(cls.name);
                      return (
                        <button
                          key={cls.name}
                          type="button"
                          onClick={() => setForm({...form, classes: checked ? form.classes.filter(c => c !== cls.name) : [...form.classes, cls.name]})}
                          className={cn("px-2 py-1.5 rounded-md text-[11px] font-medium border-2 transition-all text-left flex items-center gap-1",
                            checked ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border/40 hover:border-primary/40 hover:bg-primary/5")}
                        >
                          <GraduationCap className={cn("w-2.5 h-2.5 shrink-0", checked ? "text-primary-foreground" : "text-muted-foreground")} />
                          <span className="truncate">{cls.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Summary banner */}
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-2.5 flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Assignment summary:</span> {form.subjects.length} subject{form.subjects.length !== 1 ? "s" : ""} • {form.classes.length} class{form.classes.length !== 1 ? "es" : ""} • Monthly salary: <span className="font-semibold text-foreground">Rs. {form.monthlySalary.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/60 px-5 py-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="h-9">Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90 h-9 px-5 shadow-md" onClick={handleAdd} disabled={!form.name}>
                <Plus className="w-4 h-4 mr-1.5" />Add Teacher
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTeacher} onOpenChange={(o) => !o && setEditTeacher(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="w-4 h-4 text-primary" />Edit Teacher</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Name</Label><Input value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
            <div><Label>Designation</Label><Input value={editForm.designation || ""} onChange={e => setEditForm({...editForm, designation: e.target.value})} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
            <div><Label>Monthly Salary</Label><Input type="number" value={editForm.monthlySalary || 0} onChange={e => setEditForm({...editForm, monthlySalary: Number(e.target.value)})} /></div>
            <div><Label>Qualification</Label><Input value={editForm.qualification || ""} onChange={e => setEditForm({...editForm, qualification: e.target.value})} /></div>
            <div className="col-span-2"><Label>Subjects</Label><Input value={(editForm.subjects || []).join(", ")} onChange={e => setEditForm({...editForm, subjects: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} /></div>
            <div className="col-span-2"><Label>Classes</Label><Input value={(editForm.classes || []).join(", ")} onChange={e => setEditForm({...editForm, classes: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeacher(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => { if (editTeacher) { updateTeacher(editTeacher.id, editForm); toast({ title: "Teacher Updated ✓", description: `${editForm.name || editTeacher.name}'s profile updated.` }); setEditTeacher(null); } }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" />Delete Teacher?</DialogTitle></DialogHeader>
          {deleteConfirm && (
            <div className="py-2">
              <p className="text-sm text-muted-foreground">Permanently delete:</p>
              <div className="mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="font-semibold text-sm">{deleteConfirm.name}</p>
                <p className="text-xs text-muted-foreground">{deleteConfirm.id} • {deleteConfirm.designation}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteTeacher(deleteConfirm.id); toast({ title: "Teacher Deleted", description: `${deleteConfirm.name} removed.`, variant: "destructive" }); setDeleteConfirm(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile slide-in panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl h-full bg-background shadow-2xl overflow-y-auto slide-in-right" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Gradient banner header */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/70 p-4 text-primary-foreground overflow-hidden">
              <div className="absolute inset-0 opacity-10 pattern-grid" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
              <div className="relative flex items-start gap-5">
                <Avatar className="w-16 h-16 ring-2 ring-white/30 shadow-xl shrink-0">
                  <AvatarFallback className={cn("text-2xl font-bold bg-white/20 text-white")}>
                    {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">{selected.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">{selected.designation}</span>
                  </div>
                  <p className="text-white/70 text-xs mt-2">{selected.qualification} • Joined {selected.joiningDate}</p>
                </div>
              </div>
              {/* Quick stats */}
              <div className="relative grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
                <div>
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Salary</p>
                  <p className="text-xl font-bold mt-0.5">Rs. {(selected.monthlySalary / 1000).toFixed(0)}K</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Subjects</p>
                  <p className="text-xl font-bold mt-0.5">{selected.subjects.length}</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Classes</p>
                  <p className="text-xl font-bold mt-0.5">{selected.classes.length}</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Attendance</p>
                  <p className="text-xl font-bold mt-0.5">
                    {(() => {
                      const total = selected.attendance.present + selected.attendance.late + selected.attendance.halfDay + selected.attendance.absent + selected.attendance.leave;
                      return total > 0 ? Math.round((selected.attendance.present + selected.attendance.late * 0.75 + selected.attendance.halfDay * 0.5) / total * 100) : 100;
                    })()}%
                  </p>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/30 bg-muted/20">
              <Button size="sm" variant="outline" onClick={() => { setEditTeacher(selected); setEditForm(selected); }}>
                <Edit className="w-3.5 h-3.5 mr-1.5" />Edit Profile
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => { setDeleteConfirm(selected); }}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              {/* Personal info */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Personal Information</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><IdCard className="w-4 h-4 text-muted-foreground" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">CNIC</p><p className="text-sm font-semibold">{selected.cnic}</p></div>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3 bg-primary/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Phone className="w-4 h-4 text-primary" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Phone</p><p className="text-sm font-semibold">{selected.phone}</p></div>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><CalendarDays className="w-4 h-4 text-muted-foreground" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Joining Date</p><p className="text-sm font-semibold">{selected.joiningDate}</p></div>
                  </div>
                </div>
              </div>

              {/* Subjects & Classes */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assignments</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <p className="text-[10px] text-primary font-semibold uppercase mb-2 flex items-center gap-1.5"><BookOpen className="w-3 h-3" />Subjects ({selected.subjects.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.subjects.map(s => <Badge key={s} variant="outline" className="text-xs bg-primary/10 text-primary border-0">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                    <p className="text-[10px] text-accent font-semibold uppercase mb-2 flex items-center gap-1.5"><GraduationCap className="w-3 h-3" />Classes ({selected.classes.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.classes.map(c => <Badge key={c} variant="outline" className="text-xs bg-accent/10 text-accent border-0">{c}</Badge>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Salary Information</p>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><DollarSign className="w-4 h-4 text-emerald-600" /></div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Monthly Salary</p>
                    <p className="text-xl font-bold text-emerald-600">Rs. {selected.monthlySalary.toLocaleString()}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">Per Day (26 days)</p>
                    <p className="text-sm font-semibold">Rs. {Math.round(selected.monthlySalary / 26).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Attendance summary */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attendance Summary (Current Month)</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3"><p className="text-2xl font-bold text-emerald-600">{selected.attendance.present}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Present</p></div>
                  <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3"><p className="text-2xl font-bold text-yellow-600">{selected.attendance.late}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Late</p></div>
                  <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-3"><p className="text-2xl font-bold text-orange-600">{selected.attendance.halfDay}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Half-Day</p></div>
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3"><p className="text-2xl font-bold text-red-600">{selected.attendance.absent}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Absent</p></div>
                  <div className="rounded-xl bg-muted border border-border/30 p-3"><p className="text-2xl font-bold text-muted-foreground">{selected.attendance.leave}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Leave</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAFF MODULE
// ─────────────────────────────────────────────────────────────
const EMPTY_STAFF: Staff = {
  id: "", name: "", cnic: "", department: "Administration", designation: "Staff",
  monthlySalary: 0, joiningDate: new Date().toISOString().split("T")[0], phone: "",
  attendance: { present: 0, late: 0, halfDay: 0, absent: 0, leave: 0 },
};

export function StaffModule() {
  const { staff, addStaff, updateStaff, deleteStaff } = useAppStore();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Staff | null>(null);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [form, setForm] = useState<Staff>(EMPTY_STAFF);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});

  const openAdd = () => {
    setForm({ ...EMPTY_STAFF, id: `ST-${String(staff.length + 1).padStart(3, "0")}` });
    setAddOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Non-teaching staff: administration, accounts, security, transport, housekeeping.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />Add Staff</Button>
      </div>

      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(s => {
                const total = s.attendance.present + s.attendance.late + s.attendance.halfDay + s.attendance.absent + s.attendance.leave;
                const pct = total > 0 ? Math.round((s.attendance.present + s.attendance.late * 0.75 + s.attendance.halfDay * 0.5) / total * 100) : 100;
                return (
                  <TableRow key={s.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8"><AvatarFallback className="text-xs font-semibold bg-accent/15 text-accent">{s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                        <div><p className="font-medium text-sm">{s.name}</p><p className="text-[10px] text-muted-foreground">Since {s.joiningDate.slice(0, 4)}</p></div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{s.department}</Badge></TableCell>
                    <TableCell className="text-sm">{s.designation}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.phone}</TableCell>
                    <TableCell className="font-semibold text-sm">Rs. {s.monthlySalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                        <span className="text-xs font-medium">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View" onClick={() => setSelected(s)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary" title="Edit" onClick={() => { setEditStaff(s); setEditForm(s); }}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" title="Delete" onClick={() => setDeleteConfirm(s)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Department breakdown */}
      <Card className="border-0 shadow-sm glass-card">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-3">Department Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from(new Set(staff.map(s => s.department))).map(dept => {
              const members = staff.filter(s => s.department === dept);
              const totalSal = members.reduce((sum, m) => sum + m.monthlySalary, 0);
              return (
                <div key={dept} className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <p className="text-xs font-medium text-muted-foreground uppercase">{dept}</p>
                  <p className="text-lg font-bold mt-1">{members.length}</p>
                  <p className="text-[10px] text-muted-foreground">Rs. {totalSal.toLocaleString()}/mo</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
          {/* Gradient hero header */}
          <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-accent via-accent to-primary/80 px-5 py-4 text-accent-foreground">
            <div className="absolute inset-0 opacity-10 pattern-grid" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                <UserCog className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">Add New Staff Member</h2>
                <p className="text-xs text-white/75 mt-0.5">Register a non-teaching staff member to the school team.</p>
              </div>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase tracking-wider text-white/60">Staff ID</span>
                <span className="text-sm font-semibold mt-0.5 font-mono">{form.id}</span>
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
                <span className="ml-auto text-[10px] text-muted-foreground">Identity & contact</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Full Name <span className="text-red-500">*</span></Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Mr. Imran Sheikh" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">CNIC</Label>
                  <Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} placeholder="42101-XXXXXXX-X" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Phone</Label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+92 3xx" className="h-9" />
                </div>
              </div>
            </div>

            {/* ─── Section 2: Department & Designation ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border-b border-accent/15">
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">Department & Designation</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Workplace assignment</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Department</Label>
                  <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Administration", "Accounts", "Security", "Transport", "Housekeeping", "IT", "Library", "Lab"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Designation</Label>
                  <Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="e.g., Accountant" className="h-9" />
                </div>
              </div>
            </div>

            {/* ─── Section 3: Salary & Joining ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/15">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Salary & Joining</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Compensation details</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Monthly Salary (Rs.)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
                    <Input type="number" value={form.monthlySalary} onChange={e => setForm({...form, monthlySalary: Number(e.target.value)})} placeholder="e.g., 35000" className="h-9 pl-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Joining Date</Label>
                  <Input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} className="h-9" />
                </div>
              </div>
            </div>

            {/* Auto-generated info banner */}
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-2.5 flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <IdCard className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Auto-generated on save:</span> Staff ID (<span className="font-mono">ST-XXX</span>) • Attendance tracking enabled • Salary slip ready for monthly processing.
              </p>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/60 px-5 py-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="h-9">Cancel</Button>
              <Button className="bg-accent hover:bg-accent/90 h-9 px-5 shadow-md" onClick={() => { addStaff(form); toast({ title: "Staff Added ✓", description: `${form.name} added to ${form.department}` }); setAddOpen(false); }} disabled={!form.name}>
                <Plus className="w-4 h-4 mr-1.5" />Add Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStaff} onOpenChange={(o) => !o && setEditStaff(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="w-4 h-4 text-primary" />Edit Staff</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Name</Label><Input value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
            <div><Label>Department</Label><Input value={editForm.department || ""} onChange={e => setEditForm({...editForm, department: e.target.value})} /></div>
            <div><Label>Designation</Label><Input value={editForm.designation || ""} onChange={e => setEditForm({...editForm, designation: e.target.value})} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
            <div><Label>Monthly Salary</Label><Input type="number" value={editForm.monthlySalary || 0} onChange={e => setEditForm({...editForm, monthlySalary: Number(e.target.value)})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaff(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => { if (editStaff) { updateStaff(editStaff.id, editForm); toast({ title: "Staff Updated ✓", description: `${editForm.name || editStaff.name}'s profile updated.` }); setEditStaff(null); } }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" />Delete Staff?</DialogTitle></DialogHeader>
          {deleteConfirm && (
            <div className="py-2">
              <p className="text-sm text-muted-foreground">Permanently delete:</p>
              <div className="mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <p className="font-semibold text-sm">{deleteConfirm.name}</p>
                <p className="text-xs text-muted-foreground">{deleteConfirm.id} • {deleteConfirm.department}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteStaff(deleteConfirm.id); toast({ title: "Staff Deleted", description: `${deleteConfirm.name} removed.`, variant: "destructive" }); setDeleteConfirm(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff Profile slide-in panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl h-full bg-background shadow-2xl overflow-y-auto slide-in-right" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Gradient banner header */}
            <div className="relative bg-gradient-to-br from-accent via-accent to-accent/70 p-4 text-primary-foreground overflow-hidden">
              <div className="absolute inset-0 opacity-10 pattern-grid" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
              <div className="relative flex items-start gap-5">
                <Avatar className="w-20 h-20 ring-4 ring-white/30 shadow-xl shrink-0">
                  <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                    {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">{selected.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">{selected.designation}</span>
                  </div>
                  <p className="text-white/70 text-xs mt-2">{selected.department} Department • Joined {selected.joiningDate}</p>
                </div>
              </div>
              {/* Quick stats */}
              <div className="relative grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
                <div>
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Salary</p>
                  <p className="text-xl font-bold mt-0.5">Rs. {(selected.monthlySalary / 1000).toFixed(0)}K</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Per Day</p>
                  <p className="text-xl font-bold mt-0.5">Rs. {Math.round(selected.monthlySalary / 26).toLocaleString()}</p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Attendance</p>
                  <p className="text-xl font-bold mt-0.5">
                    {(() => {
                      const total = selected.attendance.present + selected.attendance.late + selected.attendance.halfDay + selected.attendance.absent + selected.attendance.leave;
                      return total > 0 ? Math.round((selected.attendance.present + selected.attendance.late * 0.75 + selected.attendance.halfDay * 0.5) / total * 100) : 0;
                    })()}%
                  </p>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-[10px] uppercase text-white/60 tracking-wider">Deductions</p>
                  <p className="text-xl font-bold mt-0.5">
                    {(() => {
                      const perDay = Math.round(selected.monthlySalary / 26);
                      const ded = selected.attendance.absent * perDay + selected.attendance.late * 500 + Math.round(selected.attendance.halfDay * perDay * 0.5);
                      return ded > 0 ? `Rs. ${ded.toLocaleString()}` : "None";
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-border/30 bg-muted/20">
              <Button size="sm" variant="outline" onClick={() => { setEditStaff(selected); setEditForm(selected); setSelected(null); }}>
                <Edit className="w-3.5 h-3.5 mr-1.5" />Edit Profile
              </Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => { setDeleteConfirm(selected); setSelected(null); }}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              {/* Personal info */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Personal Information</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><IdCard className="w-4 h-4 text-muted-foreground" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">CNIC</p><p className="text-sm font-semibold">{selected.cnic || "—"}</p></div>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3 bg-primary/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Phone className="w-4 h-4 text-primary" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Phone</p><p className="text-sm font-semibold">{selected.phone || "—"}</p></div>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><CalendarDays className="w-4 h-4 text-muted-foreground" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Joining Date</p><p className="text-sm font-semibold">{selected.joiningDate}</p></div>
                  </div>
                </div>
              </div>

              {/* Department & Salary */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Department & Salary</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center"><Briefcase className="w-4 h-4 text-accent" /></div>
                      <p className="text-sm font-semibold text-accent">Department</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-[10px] text-muted-foreground uppercase">Department</p><p className="text-sm font-semibold">{selected.department}</p></div>
                      <div><p className="text-[10px] text-muted-foreground uppercase">Designation</p><p className="text-sm font-semibold">{selected.designation}</p></div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><DollarSign className="w-4 h-4 text-emerald-600" /></div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Monthly Salary</p>
                      <p className="text-xl font-bold text-emerald-600">Rs. {selected.monthlySalary.toLocaleString()}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-muted-foreground uppercase">Per Day (26 days)</p>
                      <p className="text-sm font-semibold">Rs. {Math.round(selected.monthlySalary / 26).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance summary */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attendance Summary (Current Month)</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3"><p className="text-2xl font-bold text-emerald-600">{selected.attendance.present}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Present</p></div>
                  <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3"><p className="text-2xl font-bold text-yellow-600">{selected.attendance.late}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Late</p></div>
                  <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-3"><p className="text-2xl font-bold text-orange-600">{selected.attendance.halfDay}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Half-Day</p></div>
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3"><p className="text-2xl font-bold text-red-600">{selected.attendance.absent}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Absent</p></div>
                  <div className="rounded-xl bg-muted border border-border/30 p-3"><p className="text-2xl font-bold text-muted-foreground">{selected.attendance.leave}</p><p className="text-[10px] text-muted-foreground uppercase mt-0.5">Leave</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
