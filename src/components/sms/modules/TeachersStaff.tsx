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
import { TEACHERS, STAFF, SUBJECTS, CLASSES, type Teacher, type Staff } from "@/lib/sms-data";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// TEACHERS MODULE
// ─────────────────────────────────────────────────────────────
const EMPTY_TEACHER: Teacher = {
  id: "", name: "", cnic: "", designation: "Teacher", qualification: "",
  subjects: [], classes: [], monthlySalary: 0, joiningDate: new Date().toISOString().split("T")[0],
  phone: "", gender: "Male", attendance: { present: 0, late: 0, halfDay: 0, absent: 0, leave: 0 },
};

export function TeachersModule() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useAppStore();
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
    addTeacher(form);
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage teaching staff, subjects, classes, and salary.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={openAdd}><Plus className="w-4 h-4 mr-1.5" />Add Teacher</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><GraduationCap className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Teachers</p><p className="text-xl font-bold">{teachers.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2"><UserCog className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Salary</p><p className="text-xl font-bold">Rs. {(teachers.reduce((s, t) => s + t.monthlySalary, 0) / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><BookOpen className="w-5 h-5 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Subjects</p><p className="text-xl font-bold">{new Set(teachers.flatMap(t => t.subjects)).size}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><CalendarDays className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Avg Attendance</p><p className="text-xl font-bold">93%</p></div>
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
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add New Teacher</DialogTitle></DialogHeader>
          <div className="space-y-2.5 py-1">
            {/* Personal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="col-span-2"><Label className="text-xs">Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Teacher's full name" className="h-8" /></div>
              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={form.gender} onValueChange={(v: "Male" | "Female") => setForm({...form, gender: v})}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">CNIC</Label><Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} placeholder="42101-XXX-X" className="h-8" /></div>
              <div><Label className="text-xs">Designation</Label><Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="h-8" /></div>
              <div><Label className="text-xs">Qualification</Label><Input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} placeholder="M.Sc, B.Ed" className="h-8" /></div>
              <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+92 3xx" className="h-8" /></div>
              <div><Label className="text-xs">Joining Date</Label><Input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} className="h-8" /></div>
              <div><Label className="text-xs">Monthly Salary (Rs.)</Label><Input type="number" value={form.monthlySalary} onChange={e => setForm({...form, monthlySalary: Number(e.target.value)})} className="h-8" /></div>
            </div>

            {/* Subject assignment — checkbox grid */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
              <p className="text-[10px] font-semibold text-primary uppercase mb-2">Assign Subjects (click to toggle)</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
                {SUBJECTS.map(subj => {
                  const checked = form.subjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setForm({...form, subjects: checked ? form.subjects.filter(s => s !== subj) : [...form.subjects, subj]})}
                      className={cn("px-2 py-1.5 rounded-md text-[11px] font-medium border transition-all text-left",
                        checked ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border/40 hover:border-primary/30")}
                    >
                      <BookOpen className="w-2.5 h-2.5 inline mr-1" />{subj}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Class assignment — checkbox grid */}
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-2.5">
              <p className="text-[10px] font-semibold text-accent uppercase mb-2">Assign Classes (click to toggle)</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
                {CLASSES.map(cls => {
                  const checked = form.classes.includes(cls.name);
                  return (
                    <button
                      key={cls.name}
                      type="button"
                      onClick={() => setForm({...form, classes: checked ? form.classes.filter(c => c !== cls.name) : [...form.classes, cls.name]})}
                      className={cn("px-2 py-1.5 rounded-md text-[11px] font-medium border transition-all text-left",
                        checked ? "bg-accent text-accent-foreground border-accent" : "bg-background border-border/40 hover:border-accent/30")}
                    >
                      <GraduationCap className="w-2.5 h-2.5 inline mr-1" />{cls.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground">
              Selected: {form.subjects.length} subjects • {form.classes.length} classes
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.name}>Add Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTeacher} onOpenChange={(o) => !o && setEditTeacher(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-primary" />Edit Teacher</DialogTitle></DialogHeader>
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
            <Button className="bg-primary hover:bg-primary/90" onClick={() => { if (editTeacher) { updateTeacher(editTeacher.id, editForm); setEditTeacher(null); } }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
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
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteTeacher(deleteConfirm.id); setDeleteConfirm(null); } }}>Delete</Button>
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
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground overflow-hidden">
              <div className="absolute inset-0 opacity-10 pattern-grid" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
              <div className="relative flex items-start gap-5">
                <Avatar className="w-24 h-24 ring-4 ring-white/30 shadow-xl shrink-0">
                  <AvatarFallback className={cn("text-3xl font-bold bg-white/20 text-white")}>
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
            <div className="p-6 space-y-4">
              {/* Personal info */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Personal Information</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/20 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><IdCard className="w-4 h-4 text-muted-foreground" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">CNIC</p><p className="text-sm font-semibold">{selected.cnic}</p></div>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3 bg-primary/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Phone className="w-4 h-4 text-primary" /></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase">Phone</p><p className="text-sm font-semibold">{selected.phone}</p></div>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3 bg-muted/20 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><CalendarDays className="w-4 h-4 text-muted-foreground" /></div>
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
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
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
  const [addOpen, setAddOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Staff | null>(null);
  const [form, setForm] = useState<Staff>(EMPTY_STAFF);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});

  const openAdd = () => {
    setForm({ ...EMPTY_STAFF, id: `ST-${String(staff.length + 1).padStart(3, "0")}` });
    setAddOpen(true);
  };

  return (
    <div className="space-y-4">
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
                      <div className="flex items-center gap-2.5">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add New Staff</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>CNIC</Label><Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} placeholder="42101-XXXXXXX-X" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+92 3xx" /></div>
            <div><Label>Department</Label>
              <Select value={form.department} onValueChange={v => setForm({...form, department: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Administration", "Accounts", "Security", "Transport", "Housekeeping", "IT", "Library", "Lab"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Designation</Label><Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></div>
            <div><Label>Monthly Salary (Rs.)</Label><Input type="number" value={form.monthlySalary} onChange={e => setForm({...form, monthlySalary: Number(e.target.value)})} /></div>
            <div><Label>Joining Date</Label><Input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => { addStaff(form); setAddOpen(false); }} disabled={!form.name}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStaff} onOpenChange={(o) => !o && setEditStaff(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-primary" />Edit Staff</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Name</Label><Input value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
            <div><Label>Department</Label><Input value={editForm.department || ""} onChange={e => setEditForm({...editForm, department: e.target.value})} /></div>
            <div><Label>Designation</Label><Input value={editForm.designation || ""} onChange={e => setEditForm({...editForm, designation: e.target.value})} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
            <div><Label>Monthly Salary</Label><Input type="number" value={editForm.monthlySalary || 0} onChange={e => setEditForm({...editForm, monthlySalary: Number(e.target.value)})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaff(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => { if (editStaff) { updateStaff(editStaff.id, editForm); setEditStaff(null); } }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
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
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteStaff(deleteConfirm.id); setDeleteConfirm(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
