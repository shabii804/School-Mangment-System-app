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
  CalendarDays, Briefcase, IdCard, Edit, Trash2, Eye,
  Building2, Award, Users as UsersIcon,
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add New Teacher</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Teacher's full name" /></div>
            <div><Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v: "Male" | "Female") => setForm({...form, gender: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>CNIC</Label><Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} placeholder="42101-XXXXXXX-X" /></div>
            <div><Label>Designation</Label><Input value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></div>
            <div><Label>Qualification</Label><Input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} placeholder="M.Sc, B.Ed" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+92 3xx xxxxxxx" /></div>
            <div><Label>Joining Date</Label><Input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} /></div>
            <div><Label>Monthly Salary (Rs.)</Label><Input type="number" value={form.monthlySalary} onChange={e => setForm({...form, monthlySalary: Number(e.target.value)})} /></div>
            <div className="col-span-2"><Label>Subjects (comma-separated)</Label><Input value={form.subjects.join(", ")} onChange={e => setForm({...form, subjects: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="Mathematics, Physics" /></div>
            <div className="col-span-2"><Label>Classes (comma-separated)</Label><Input value={form.classes.join(", ")} onChange={e => setForm({...form, classes: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="Grade 9, Grade 10" /></div>
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

      {/* Profile Drawer */}
      <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DrawerContent className="max-h-[90vh]">
          {selected && (
            <>
              <DrawerHeader className="border-b border-border/30 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                    <AvatarFallback className={cn("text-lg font-semibold", selected.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                      {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DrawerTitle className="text-xl">{selected.name}</DrawerTitle>
                    <DrawerDescription className="flex items-center gap-2 flex-wrap mt-1.5">
                      <Badge variant="outline">{selected.id}</Badge>
                      <Badge variant="outline">{selected.designation}</Badge>
                      <Badge variant="outline" className="bg-primary/5">{selected.qualification}</Badge>
                    </DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>
              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground uppercase">CNIC</p><p className="text-sm font-medium mt-0.5">{selected.cnic}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground uppercase">Phone</p><p className="text-sm font-medium mt-0.5">{selected.phone}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground uppercase">Joining Date</p><p className="text-sm font-medium mt-0.5">{selected.joiningDate}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground uppercase">Monthly Salary</p><p className="text-sm font-bold text-primary mt-0.5">Rs. {selected.monthlySalary.toLocaleString()}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground uppercase">Subjects</p><p className="text-sm font-medium mt-0.5">{selected.subjects.join(", ")}</p></div>
                  <div className="rounded-lg bg-muted/30 p-3"><p className="text-[10px] text-muted-foreground uppercase">Classes</p><p className="text-sm font-medium mt-0.5">{selected.classes.join(", ")}</p></div>
                </div>
                {/* Attendance summary */}
                <div className="mt-3 rounded-lg border border-border/40 p-3">
                  <p className="text-xs font-semibold mb-2">Attendance Summary (Current Month)</p>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    <div className="rounded bg-emerald-500/10 p-2"><p className="font-bold text-emerald-600">{selected.attendance.present}</p><p className="text-[10px] text-muted-foreground">Present</p></div>
                    <div className="rounded bg-yellow-500/10 p-2"><p className="font-bold text-yellow-600">{selected.attendance.late}</p><p className="text-[10px] text-muted-foreground">Late</p></div>
                    <div className="rounded bg-orange-500/10 p-2"><p className="font-bold text-orange-600">{selected.attendance.halfDay}</p><p className="text-[10px] text-muted-foreground">Half-Day</p></div>
                    <div className="rounded bg-red-500/10 p-2"><p className="font-bold text-red-600">{selected.attendance.absent}</p><p className="text-[10px] text-muted-foreground">Absent</p></div>
                    <div className="rounded bg-muted p-2"><p className="font-bold text-muted-foreground">{selected.attendance.leave}</p><p className="text-[10px] text-muted-foreground">Leave</p></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
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
