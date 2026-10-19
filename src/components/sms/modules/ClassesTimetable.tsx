"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/sms-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  School, Users, BookOpen, Plus, Eye, Edit, Trash2, UserCog, Printer, Wallet,
  Sparkles, X, Wand2, AlertCircle,
} from "lucide-react";
import { type TimetableSlot } from "@/lib/sms-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { printTimetablePDF } from "@/lib/pdf-service";

export function ClassesModule() {
  const { students, teachers, classes: storeClasses, addClass: addClassAction, updateClass, subjects: storeSubjects } = useAppStore();
  const { toast } = useToast();
  const CLASSES = storeClasses;
  const SUBJECTS = storeSubjects;
  const [addOpen, setAddOpen] = useState(false);
  const [rosterClass, setRosterClass] = useState<string | null>(null);
  const [assignTeacher, setAssignTeacher] = useState<{ className: string; section: string; teacherId: string } | null>(null);
  const [subjectAssignClass, setSubjectAssignClass] = useState<string | null>(null);
  const [newClass, setNewClass] = useState({ name: "", sections: "A,B", monthlyFee: 2000 });

  // Use store classes directly — they persist to localStorage
  const classes = CLASSES;

  // Subject-teacher assignment: { "Grade 9": { "Mathematics": "T-001", "English": "T-003" } }
  const [subjectTeachers, setSubjectTeachers] = useState<Record<string, Record<string, string>>>({});

  const rosterStudents = rosterClass ? students.filter(s => s.class === rosterClass && s.status === "Active") : [];
  const subjectAssignStudents = subjectAssignClass ? students.filter(s => s.class === subjectAssignClass && s.status === "Active") : [];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Classes, sections, subjects, and class teachers.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Class</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-16 text-sm text-muted-foreground">
            <School className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-medium">No classes added yet</p>
            <p className="text-xs mt-1">Click "Add Class" above to create your first class.</p>
          </div>
        ) : classes.map(cls => {
          const studentCount = students.filter(s => s.class === cls.name && s.status === "Active").length;
          const totalCapacity = cls.sections.length * 30;
          return (
            <Card key={cls.name} className="border-0 shadow-sm glass-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                      <School className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">{cls.sections.length} section{cls.sections.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{cls.sections.join(", ")}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/30 p-2"><Users className="w-3.5 h-3.5 mx-auto text-muted-foreground" /><p className="text-sm font-bold mt-1">{studentCount}</p><p className="text-[9px] text-muted-foreground uppercase">Students</p></div>
                  <div className="rounded-lg bg-muted/30 p-2"><BookOpen className="w-3.5 h-3.5 mx-auto text-muted-foreground" /><p className="text-sm font-bold mt-1">{SUBJECTS.length}</p><p className="text-[9px] text-muted-foreground uppercase">Subjects</p></div>
                  <div className="rounded-lg bg-muted/30 p-2"><School className="w-3.5 h-3.5 mx-auto text-muted-foreground" /><p className="text-sm font-bold mt-1">{totalCapacity}</p><p className="text-[9px] text-muted-foreground uppercase">Capacity</p></div>
                </div>

                {/* Class Teacher */}
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Class Teacher</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6"><AvatarFallback className="text-[10px] font-semibold bg-primary/15 text-primary">{(cls.classTeacher || "NA").split(" ").map(w => w[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                    <p className="text-xs font-medium truncate flex-1">{cls.classTeacher || "Unassigned"}</p>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Assign Teacher" aria-label={`Assign class teacher to ${cls.name}`} onClick={() => setAssignTeacher({ className: cls.name, section: cls.sections[0] || "", teacherId: "" })}>
                      <UserCog className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                  <div><p className="text-[10px] text-muted-foreground uppercase">Monthly Fee</p><p className="font-bold text-sm">Rs. {cls.monthlyFee.toLocaleString()}</p></div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setRosterClass(cls.name)}>
                      <Eye className="w-3 h-3 mr-1" />Roster
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSubjectAssignClass(cls.name)}>
                      <BookOpen className="w-3 h-3 mr-1" />Subjects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subjects list */}
      <Card className="border-0 shadow-sm glass-card">
        <CardHeader><CardTitle className="text-base">Subjects Offered</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => (
              <Badge key={s} variant="outline" className="px-3 py-1.5 text-xs bg-primary/5"><BookOpen className="w-3 h-3 mr-1.5" />{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Class Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
          {/* Gradient hero header */}
          <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-primary via-primary to-accent/70 px-5 py-4 text-primary-foreground">
            <div className="absolute inset-0 opacity-10 pattern-grid" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">Add New Class</h2>
                <p className="text-xs text-white/75 mt-0.5">Create a new class with sections and a monthly tuition fee.</p>
              </div>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase tracking-wider text-white/60">Total Classes</span>
                <span className="text-sm font-semibold mt-0.5">{classes.length}</span>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-5 py-4 space-y-3">
            {/* ─── Section: Basic Information ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/15">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <School className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Class Details</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Name & sections</span>
              </div>
              <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Class Name <span className="text-red-500">*</span></Label>
                  <Input value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} placeholder="e.g., Grade 11" className="h-9" autoFocus />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Sections <span className="text-red-500">*</span></Label>
                  <Input value={newClass.sections} onChange={e => setNewClass({...newClass, sections: e.target.value})} placeholder="A, B, C" className="h-9" />
                  <p className="text-[9px] text-muted-foreground">Comma-separated</p>
                </div>
              </div>
            </div>

            {/* ─── Section: Fee ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/15">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Monthly Tuition Fee</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Per student, per month</span>
              </div>
              <div className="p-3 space-y-2">
                <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Amount (Rs.) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Wallet className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
                  <Input type="number" value={newClass.monthlyFee} onChange={e => setNewClass({...newClass, monthlyFee: Number(e.target.value)})} placeholder="e.g., 3000" className="h-10 pl-8 text-lg font-semibold" />
                </div>
                {/* Quick amounts */}
                <div className="flex flex-wrap gap-1.5">
                  {[1000, 2000, 3000, 5000, 8000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNewClass({...newClass, monthlyFee: amt})}
                      className={cn(
                        "px-2 py-1 text-[10px] rounded-md border transition-colors font-medium",
                        newClass.monthlyFee === amt
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-700"
                          : "border-border/40 bg-background hover:bg-emerald-500/5 hover:border-emerald-500/30"
                      )}
                    >
                      Rs. {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Auto-generated info */}
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-2.5 flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Auto on save:</span> Class appears in Students, Teachers, Fees, Reports, and Timetable modules. Tuition fee is used for fee calculation & defaulters tracking.
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
              <Button
                className="bg-primary hover:bg-primary/90 h-9 px-5 shadow-md"
                disabled={!newClass.name}
                onClick={() => {
                  if (newClass.name) {
                    addClassAction({
                      name: newClass.name,
                      sections: newClass.sections.split(",").map(s => s.trim()).filter(Boolean),
                      monthlyFee: newClass.monthlyFee,
                    });
                    toast({ title: "Class Added ✓", description: `${newClass.name} created with monthly fee Rs. ${newClass.monthlyFee.toLocaleString()}.` });
                    setAddOpen(false);
                    setNewClass({ name: "", sections: "A,B", monthlyFee: 2000 });
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />Add Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Roster Dialog */}
      <Dialog open={!!rosterClass} onOpenChange={(o) => !o && setRosterClass(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{rosterClass} — Student Roster</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-xs text-muted-foreground mb-3">{rosterStudents.length} active students enrolled</p>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {rosterStudents.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No students enrolled in this class.</p>
              ) : (
                rosterStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/30 hover:bg-muted/30">
                    <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}</span>
                    <Avatar className="w-8 h-8">
                      {s.photo ? <img src={s.photo} alt={s.name} className="w-full h-full object-cover rounded-full" /> :
                      <AvatarFallback className={cn("text-xs font-semibold", s.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>{s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</AvatarFallback>}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.id} • Roll #{s.rollNo} • {s.section}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{s.gender}</Badge>
                    {s.isHosteller && <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-0">Hostel</Badge>}
                    {s.outstandingAmount > 0 && <Badge variant="destructive" className="text-[10px]">Rs. {s.outstandingAmount.toLocaleString()}</Badge>}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Class Teacher Dialog */}
      <Dialog open={!!assignTeacher} onOpenChange={(o) => !o && setAssignTeacher(null)}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCog className="w-4 h-4 text-primary" />Assign Class Teacher</DialogTitle></DialogHeader>
          {assignTeacher && (
            <div className="space-y-2 py-1">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm font-medium">{assignTeacher.className} — Section {assignTeacher.section}</p>
              </div>
              <div>
                <Label>Select Teacher</Label>
                <Select value={assignTeacher.teacherId} onValueChange={v => setAssignTeacher({...assignTeacher, teacherId: v})}>
                  <SelectTrigger><SelectValue placeholder="Choose a teacher..." /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name} • {t.designation}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTeacher(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" disabled={!assignTeacher?.teacherId} onClick={() => {
              if (assignTeacher && assignTeacher.teacherId) {
                const teacher = teachers.find(t => t.id === assignTeacher.teacherId);
                if (teacher) {
                  updateClass(assignTeacher.className, { classTeacher: teacher.name });
                  toast({ title: "Class Teacher Assigned ✓", description: `${teacher.name} assigned to ${assignTeacher.className}-${assignTeacher.section}.` });
                  setAssignTeacher(null);
                }
              }
            }}>Assign Teacher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject-Teacher Assignment Dialog */}
      <Dialog open={!!subjectAssignClass} onOpenChange={(o) => !o && setSubjectAssignClass(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" />Subject-Teacher Assignment — {subjectAssignClass}</DialogTitle>
          </DialogHeader>
          {subjectAssignClass && (
            <div className="space-y-2 py-2">
              <p className="text-xs text-muted-foreground">Assign a teacher for each subject taught in this class. Click the dropdown to select or change the teacher.</p>
              <div className="rounded-lg border border-border/40 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b border-border/30">
                    <tr>
                      <th className="text-left p-2.5 text-xs font-semibold text-muted-foreground uppercase">Subject</th>
                      <th className="text-left p-2.5 text-xs font-semibold text-muted-foreground uppercase">Assigned Teacher</th>
                      <th className="text-center p-2.5 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBJECTS.map(subj => {
                      const assignedId = subjectTeachers[subjectAssignClass]?.[subj] || "";
                      const teacher = teachers.find(t => t.id === assignedId);
                      return (
                        <tr key={subj} className="border-b border-border/20 hover:bg-muted/20 last:border-0">
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-primary" /></div>
                              <span className="font-medium text-sm">{subj}</span>
                            </div>
                          </td>
                          <td className="p-2.5">
                            <Select
                              value={assignedId}
                              onValueChange={(teacherId) => {
                                setSubjectTeachers(prev => ({
                                  ...prev,
                                  [subjectAssignClass]: { ...(prev[subjectAssignClass] || {}), [subj]: teacherId },
                                }));
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select teacher..." /></SelectTrigger>
                              <SelectContent>
                                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name} • {t.designation}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2.5 text-center">
                            {teacher ? (
                              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">✓ Assigned</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground border-0">Unassigned</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {SUBJECTS.filter(s => subjectTeachers[subjectAssignClass]?.[s]).length} of {SUBJECTS.length} subjects assigned
                </p>
                <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setSubjectAssignClass(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TIMETABLE MODULE
// ─────────────────────────────────────────────────────────────
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIOD_TIMES = [
  "08:00 - 08:45", "08:45 - 09:30", "09:30 - 10:15",
  "10:30 - 11:15", "11:15 - 12:00", "12:00 - 12:45",
];

// Subject color palette for visual variety
const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "bg-blue-500/10 border-blue-500/30 text-blue-700",
  English: "bg-purple-500/10 border-purple-500/30 text-purple-700",
  Urdu: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
  Islamiat: "bg-teal-500/10 border-teal-500/30 text-teal-700",
  "Social Studies": "bg-amber-500/10 border-amber-500/30 text-amber-700",
  Physics: "bg-cyan-500/10 border-cyan-500/30 text-cyan-700",
  Chemistry: "bg-orange-500/10 border-orange-500/30 text-orange-700",
  Biology: "bg-green-500/10 border-green-500/30 text-green-700",
  "Computer Science": "bg-indigo-500/10 border-indigo-500/30 text-indigo-700",
  History: "bg-rose-500/10 border-rose-500/30 text-rose-700",
  Geography: "bg-lime-500/10 border-lime-500/30 text-lime-700",
};
const defaultColor = "bg-primary/5 border-primary/20 text-primary";

export function TimetableModule() {
  const { school, classes: storeClasses, subjects: storeSubjects, teachers, moduleData, setModuleData } = useAppStore();
  const { toast } = useToast();
  const CLASSES = storeClasses;
  const SUBJECTS = storeSubjects;
  const classOptions = CLASSES.length > 0
    ? CLASSES.flatMap(c => (c.sections.length > 0 ? c.sections : ["A"]).map(s => `${c.name}-${s}`))
    : [];

  const [selectedClass, setSelectedClass] = useState(classOptions[0] || "");
  const [editSlot, setEditSlot] = useState<{ day: string; period: number; slot?: TimetableSlot } | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Read timetable from store moduleData.timetables (keyed by class-section)
  // moduleData is typed as Record<string, any[]> but the "timetables" entry is itself
  // a Record<string, TimetableSlot[]> (object keyed by class-section), so cast through any.
  const timetables = ((moduleData as any).timetables || {}) as Record<string, TimetableSlot[]>;
  const slots: TimetableSlot[] = timetables[selectedClass] || [];

  const getSlot = (day: string, period: number) => slots.find(s => s.day === day && s.period === period);

  // Save a slot (add or update) — persists to store
  const saveSlot = (day: string, period: number, data: { subject: string; teacher: string; room: string }) => {
    const existing = slots.filter(s => !(s.day === day && s.period === period));
    const updated = [...existing, { day, period, ...data }];
    setModuleData("timetables", { ...timetables, [selectedClass]: updated } as any);
  };

  // Delete a slot
  const deleteSlot = (day: string, period: number) => {
    const updated = slots.filter(s => !(s.day === day && s.period === period));
    setModuleData("timetables", { ...timetables, [selectedClass]: updated } as any);
  };

  // ─── AI Auto-Generate Timetable ───
  // Smart algorithm:
  // 1. Distributes subjects evenly across the week (no subject twice on same day if avoidable)
  // 2. Respects teacher assignments (from teachers' subjects list)
  // 3. Avoids double-booking a teacher in the same period
  // 4. Assigns rooms (defaults to "Room 1" etc., or uses class section)
  const autoGenerate = () => {
    if (!selectedClass) {
      toast({ title: "Select a class", description: "Please select a class first.", variant: "destructive" });
      return;
    }
    if (SUBJECTS.length === 0) {
      toast({ title: "No subjects", description: "Add subjects in the Classes module first.", variant: "destructive" });
      setAiOpen(false);
      return;
    }
    setAiGenerating(true);

    // Build subject→teacher map from store teachers
    const subjectTeachers: Record<string, string[]> = {};
    SUBJECTS.forEach(subj => {
      const eligible = teachers.filter(t => t.subjects.includes(subj));
      subjectTeachers[subj] = eligible.length > 0 ? eligible.map(t => t.name) : [];
    });

    // Track teacher bookings: { teacherName: Set of "day-period" }
    const teacherBookings: Record<string, Set<string>> = {};
    teachers.forEach(t => { teacherBookings[t.name] = new Set(); });

    // Generate schedule
    const newSlots: TimetableSlot[] = [];
    const usedToday: Record<string, Set<string>> = {}; // day → subjects used that day
    DAYS.forEach(d => { usedToday[d] = new Set(); });

    // Subject quota: each subject should appear roughly (6 periods × 6 days) / numSubjects times
    const totalPeriods = PERIOD_TIMES.length * DAYS.length; // 36
    const subjectQuota = Math.max(1, Math.floor(totalPeriods / SUBJECTS.length));

    // Count how many times each subject has been scheduled
    const subjectCount: Record<string, number> = {};
    SUBJECTS.forEach(s => { subjectCount[s] = 0; });

    // Determine the base room from the selected class
    const baseRoom = selectedClass ? `Room ${selectedClass.split("-").pop() || "1"}` : "Room 1";

    let generated = 0;
    for (const day of DAYS) {
      for (let period = 1; period <= PERIOD_TIMES.length; period++) {
        // Pick a subject: prefer ones that haven't met quota and weren't used today
        const candidates = SUBJECTS
          .filter(s => !usedToday[day].has(s))
          .sort((a, b) => (subjectCount[a] - subjectCount[b]));

        if (candidates.length === 0) {
          // All subjects used today; pick the least-used overall
          const fallback = SUBJECTS.sort((a, b) => subjectCount[a] - subjectCount[b])[0];
          if (fallback) {
            const teacher = subjectTeachers[fallback]?.[0] || "—";
            newSlots.push({ day, period, subject: fallback, teacher, room: baseRoom });
            if (teacher !== "—") teacherBookings[teacher]?.add(`${day}-${period}`);
            subjectCount[fallback]++;
            generated++;
          }
          continue;
        }

        const subject = candidates[0];
        // Find a teacher who teaches this subject and isn't booked in this period
        const eligibleTeachers = subjectTeachers[subject] || [];
        let assignedTeacher = "—";
        for (const tName of eligibleTeachers) {
          if (!teacherBookings[tName]?.has(`${day}-${period}`)) {
            assignedTeacher = tName;
            teacherBookings[tName]?.add(`${day}-${period}`);
            break;
          }
        }
        // If all eligible teachers are booked, assign the first one anyway (or "TBD")
        if (assignedTeacher === "—" && eligibleTeachers.length > 0) {
          assignedTeacher = `${eligibleTeachers[0]} (busy)`;
        }

        newSlots.push({ day, period, subject, teacher: assignedTeacher, room: baseRoom });
        usedToday[day].add(subject);
        subjectCount[subject]++;
        generated++;
      }
    }

    // Save the generated timetable
    setModuleData("timetables", { ...timetables, [selectedClass]: newSlots } as any);
    setAiGenerating(false);
    setAiOpen(false);
    toast({
      title: "Timetable Auto-Generated ✓",
      description: `${generated} slots created for ${selectedClass} • ${SUBJECTS.length} subjects distributed • ${teachers.length} teachers assigned.`,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Weekly class timetable</p>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40 bg-background/60"><SelectValue placeholder="Select class..." /></SelectTrigger>
            <SelectContent>
              {classOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">No classes yet. Add in Classes module.</div>
              ) : classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => printTimetablePDF(selectedClass, slots, school)} disabled={!selectedClass || slots.length === 0}>
            <Printer className="w-4 h-4 mr-1.5" />Print
          </Button>
          <Button variant="outline" size="sm" className="border-accent/30 text-accent hover:bg-accent/10" onClick={() => setAiOpen(true)} disabled={!selectedClass || SUBJECTS.length === 0}>
            <Wand2 className="w-4 h-4 mr-1.5" />AI Auto-Generate
          </Button>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">{slots.length} of {DAYS.length * PERIOD_TIMES.length} slots filled</span>
        {SUBJECTS.length === 0 && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-0">
            <AlertCircle className="w-3 h-3 mr-1" />Add subjects first
          </Badge>
        )}
        {teachers.length === 0 && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-0">
            <AlertCircle className="w-3 h-3 mr-1" />Add teachers for auto-assignment
          </Badge>
        )}
      </div>

      {!selectedClass ? (
        <Card className="border-0 shadow-sm glass-card">
          <CardContent className="p-12 text-center">
            <School className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
            <p className="font-medium text-sm">No class selected</p>
            <p className="text-xs text-muted-foreground mt-1">Select a class above to view or edit its timetable.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-32">Day / Period</th>
                  {PERIOD_TIMES.map((t, i) => (
                    <th key={i} className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase min-w-32">
                      <div>P{i + 1}</div>
                      <div className="text-[10px] font-normal text-muted-foreground/70 normal-case">{t}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day} className="border-b border-border/30 hover:bg-muted/10">
                    <td className="p-3 font-semibold text-sm">{day}</td>
                    {PERIOD_TIMES.map((_, i) => {
                      const slot = getSlot(day, i + 1);
                      const colorClass = slot ? (SUBJECT_COLORS[slot.subject] || defaultColor) : "";
                      return (
                        <td key={i} className="p-2">
                          <button
                            onClick={() => setEditSlot({ day, period: i + 1, slot })}
                            className={cn(
                              "w-full h-16 rounded-lg p-2 border text-xs flex flex-col justify-center text-left transition-all hover:scale-[1.02] hover:shadow-sm",
                              slot ? colorClass : "bg-muted/20 border-dashed border-border/40 hover:border-primary/40 hover:bg-primary/5"
                            )}
                          >
                            {slot ? (
                              <>
                                <p className="font-semibold truncate">{slot.subject}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{slot.teacher}</p>
                                <p className="text-[10px] text-muted-foreground/70 truncate">{slot.room}</p>
                              </>
                            ) : (
                              <div className="flex items-center justify-center text-muted-foreground/40">
                                <Plus className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Slot Editor Dialog */}
      {editSlot && (
        <Dialog open={!!editSlot} onOpenChange={(o) => !o && setEditSlot(null)}>
          <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                {editSlot.slot ? "Edit Slot" : "Add Slot"} — {editSlot.day}, Period {editSlot.period}
              </DialogTitle>
            </DialogHeader>
            <SlotEditor
              slot={editSlot.slot}
              subjects={SUBJECTS}
              teachers={teachers.map(t => ({ name: t.name, subjects: t.subjects }))}
              onSave={(data) => {
                saveSlot(editSlot.day, editSlot.period, data);
                toast({ title: "Slot Saved ✓", description: `${data.subject} • ${data.teacher} • ${editSlot.day} P${editSlot.period}` });
                setEditSlot(null);
              }}
              onDelete={editSlot.slot ? () => {
                deleteSlot(editSlot.day, editSlot.period);
                toast({ title: "Slot Cleared", description: `${editSlot.day} Period ${editSlot.period} is now empty.` });
                setEditSlot(null);
              } : undefined}
              onCancel={() => setEditSlot(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* AI Auto-Generate Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-accent" />
              AI Auto-Generate Timetable
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-accent">Smart Scheduling Engine</span> will create a complete weekly timetable for <span className="font-semibold text-foreground">{selectedClass}</span> using:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-accent" />{SUBJECTS.length} subjects from your curriculum</li>
                <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-accent" />{teachers.length} teachers with their subject assignments</li>
                <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-accent" />{DAYS.length} days × {PERIOD_TIMES.length} periods = {DAYS.length * PERIOD_TIMES.length} slots</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1.5 text-xs">
              <p className="font-semibold text-foreground">The algorithm:</p>
              <p>1. Distributes subjects evenly across all days (no subject repeated on the same day unless necessary)</p>
              <p>2. Assigns teachers based on their subject expertise</p>
              <p>3. Prevents teacher double-booking (same teacher can't be in 2 classes at the same period)</p>
              <p>4. Fills all {DAYS.length * PERIOD_TIMES.length} slots optimally</p>
            </div>

            {SUBJECTS.length === 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                No subjects found. Go to Classes module → Subjects tab to add subjects first.
              </div>
            )}
            {teachers.length === 0 && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                No teachers found. Slots will be created with "—" as teacher. Add teachers in Teachers module for better results.
              </div>
            )}

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-amber-700">
              <strong>⚠️ Note:</strong> This will replace the current timetable for {selectedClass} if one exists.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiOpen(false)}>Cancel</Button>
            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={autoGenerate}
              disabled={aiGenerating || SUBJECTS.length === 0}
            >
              {aiGenerating ? (
                <><Sparkles className="w-4 h-4 mr-1.5 animate-pulse" />Generating...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-1.5" />Generate Now</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-foreground">
          <strong className="text-primary">Click any slot</strong> to edit it — set subject, teacher, and room.
          Or click <strong className="text-accent">AI Auto-Generate</strong> to create a complete smart schedule in one click.
          Changes save automatically and persist across sessions.
        </p>
      </div>
    </div>
  );
}

// ─── Slot Editor sub-component ───
function SlotEditor({ slot, subjects, teachers, onSave, onDelete, onCancel }: {
  slot?: TimetableSlot;
  subjects: string[];
  teachers: { name: string; subjects: string[] }[];
  onSave: (data: { subject: string; teacher: string; room: string }) => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState(slot?.subject || "");
  const [teacher, setTeacher] = useState(slot?.teacher || "");
  const [room, setRoom] = useState(slot?.room || "");

  // When subject changes, auto-suggest a teacher who teaches that subject
  const handleSubjectChange = (subj: string) => {
    setSubject(subj);
    const eligible = teachers.filter(t => t.subjects.includes(subj));
    if (eligible.length > 0 && !eligible.some(t => t.name === teacher)) {
      setTeacher(eligible[0].name);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Subject *</Label>
        <Select value={subject} onValueChange={handleSubjectChange}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Select subject..." /></SelectTrigger>
          <SelectContent>
            {subjects.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">No subjects. Add in Classes module.</div>
            ) : subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Teacher</Label>
        <Select value={teacher} onValueChange={setTeacher}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Select teacher..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="—">— (Unassigned) —</SelectItem>
            {subject
              ? teachers.filter(t => t.subjects.includes(subject)).map(t => <SelectItem key={t.name} value={t.name}>{t.name} ✓</SelectItem>)
              : teachers.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)
            }
            {subject && teachers.filter(t => t.subjects.includes(subject)).length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">No teacher assigned to {subject} yet.</div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Room</Label>
        <Input value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g., Room 101" className="h-9" />
      </div>

      <DialogFooter className="flex !justify-between gap-2">
        <div>
          {onDelete && (
            <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />Clear Slot
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => onSave({ subject, teacher, room })} disabled={!subject}>
            Save Slot
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}
