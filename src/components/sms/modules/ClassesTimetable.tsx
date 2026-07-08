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
  School, Users, BookOpen, Plus, Eye, Edit, Trash2, UserCog, Printer,
} from "lucide-react";
import { CLASSES, SUBJECTS, TEACHERS, TIMETABLE } from "@/lib/sms-data";
import { cn } from "@/lib/utils";
import { printTimetablePDF } from "@/lib/pdf-service";

export function ClassesModule() {
  const { students, teachers } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [rosterClass, setRosterClass] = useState<string | null>(null);
  const [assignTeacher, setAssignTeacher] = useState<{ className: string; section: string; teacherId: string } | null>(null);
  const [subjectAssignClass, setSubjectAssignClass] = useState<string | null>(null);
  const [newClass, setNewClass] = useState({ name: "", sections: "A,B", monthlyFee: 2000 });

  // Local classes state
  const [classes, setClasses] = useState(CLASSES.map(c => ({
    ...c,
    classTeacher: teachers[Math.floor(Math.random() * teachers.length)]?.name || "Unassigned",
  })));

  // Subject-teacher assignment: { "Grade 9": { "Mathematics": "T-001", "English": "T-003" } }
  const [subjectTeachers, setSubjectTeachers] = useState<Record<string, Record<string, string>>>({});

  const rosterStudents = rosterClass ? students.filter(s => s.class === rosterClass && s.status === "Active") : [];
  const subjectAssignStudents = subjectAssignClass ? students.filter(s => s.class === subjectAssignClass && s.status === "Active") : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Classes, sections, subjects, and class teachers.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Class</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => {
          const studentCount = students.filter(s => s.class === cls.name && s.status === "Active").length;
          const totalCapacity = cls.sections.length * 30;
          return (
            <Card key={cls.name} className="border-0 shadow-sm glass-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                      <School className="w-5 h-5 text-primary" />
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
                    <Avatar className="w-6 h-6"><AvatarFallback className="text-[10px] font-semibold bg-primary/15 text-primary">{cls.classTeacher.split(" ").map(w => w[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                    <p className="text-xs font-medium truncate flex-1">{cls.classTeacher}</p>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Assign Teacher" onClick={() => setAssignTeacher({ className: cls.name, section: cls.sections[0], teacherId: "" })}>
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
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add New Class</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Class Name *</Label><Input value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} placeholder="e.g., Grade 11" /></div>
            <div><Label>Sections (comma-separated)</Label><Input value={newClass.sections} onChange={e => setNewClass({...newClass, sections: e.target.value})} placeholder="A, B, C" /></div>
            <div><Label>Monthly Fee (Rs.)</Label><Input type="number" value={newClass.monthlyFee} onChange={e => setNewClass({...newClass, monthlyFee: Number(e.target.value)})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              if (newClass.name) {
                setClasses([...classes, {
                  name: newClass.name,
                  sections: newClass.sections.split(",").map(s => s.trim()).filter(Boolean),
                  monthlyFee: newClass.monthlyFee,
                  classTeacher: "Unassigned",
                }]);
                setAddOpen(false);
                setNewClass({ name: "", sections: "A,B", monthlyFee: 2000 });
              }
            }}>Add Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roster Dialog */}
      <Dialog open={!!rosterClass} onOpenChange={(o) => !o && setRosterClass(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{rosterClass} — Student Roster</DialogTitle>
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
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-primary" />Assign Class Teacher</DialogTitle></DialogHeader>
          {assignTeacher && (
            <div className="space-y-3 py-2">
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
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              if (assignTeacher && assignTeacher.teacherId) {
                const teacher = teachers.find(t => t.id === assignTeacher.teacherId);
                if (teacher) {
                  setClasses(classes.map(c => c.name === assignTeacher.className ? {...c, classTeacher: teacher.name} : c));
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
            <DialogTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Subject-Teacher Assignment — {subjectAssignClass}</DialogTitle>
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

export function TimetableModule() {
  const { school } = useAppStore();
  const [selectedClass, setSelectedClass] = useState("Grade 9-A");
  const slots = TIMETABLE["Grade 9-A"] || [];

  const getSlot = (day: string, period: number) => slots.find(s => s.day === day && s.period === period);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Weekly class timetable</p>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40 bg-background/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
              <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
              <SelectItem value="Grade 8-A">Grade 8-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => printTimetablePDF(selectedClass, TIMETABLE[selectedClass] || [], school)}>
            <Printer className="w-4 h-4 mr-1.5" />Print Timetable
          </Button>
          <Button className="bg-primary hover:bg-primary/90" size="sm"><Plus className="w-4 h-4 mr-1.5" />Edit Timetable</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">Conflict-free • Auto-checked:</span>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0">Teacher available</Badge>
        <Badge variant="outline" className="bg-primary/10 text-primary border-0">Room free</Badge>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-0">Subject quota OK</Badge>
      </div>

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
                <tr key={day} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="p-3 font-semibold text-sm">{day}</td>
                  {PERIOD_TIMES.map((_, i) => {
                    const slot = getSlot(day, i + 1);
                    if (!slot) return <td key={i} className="p-2"><div className="h-16 rounded-lg bg-muted/20 border border-dashed border-border/40" /></td>;
                    return (
                      <td key={i} className="p-2">
                        <div className={cn("h-16 rounded-lg p-2 border text-xs flex flex-col justify-center", "bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors")}>
                          <p className="font-semibold text-primary">{slot.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{slot.teacher}</p>
                          <p className="text-[10px] text-muted-foreground/70">{slot.room}</p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-foreground">
          <strong className="text-primary">Conflict Detection:</strong> The timetable engine checks three constraints on every slot save —
          teacher double-booking, room clash, and subject weekly quota. Conflicts are highlighted in red and block save until resolved.
        </p>
      </div>
    </div>
  );
}
