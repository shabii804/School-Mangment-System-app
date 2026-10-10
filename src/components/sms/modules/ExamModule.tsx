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
  Plus, Edit, Trash2, FileText, Calendar, ClipboardList, Award,
  GraduationCap, Printer, BookOpen,
} from "lucide-react";
import { type Exam, SUBJECTS, CLASSES, EXAMS } from "@/lib/sms-data";
import { useAppStore } from "@/lib/sms-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const GRADE_BANDS = [
  { min: 90, grade: "A+", color: "bg-emerald-500/15 text-emerald-700" },
  { min: 80, grade: "A", color: "bg-primary/15 text-primary" },
  { min: 70, grade: "B", color: "bg-blue-500/15 text-blue-700" },
  { min: 60, grade: "C", color: "bg-yellow-500/15 text-yellow-700" },
  { min: 50, grade: "D", color: "bg-orange-500/15 text-orange-700" },
  { min: 0, grade: "F", color: "bg-red-500/15 text-red-700" },
];

function gradeFor(pct: number) {
  return GRADE_BANDS.find(b => pct >= b.min) || GRADE_BANDS[GRADE_BANDS.length - 1];
}

export function ExamModule() {
  const { classes: storeClasses } = useAppStore();
  const { toast } = useToast();
  const CLASSES = storeClasses;
  const [tab, setTab] = useState("schedule");
  const [addOpen, setAddOpen] = useState(false);
  const [exams, setExams] = useState(EXAMS);
  const [form, setForm] = useState({ name: "", type: "Monthly", startDate: "", endDate: "", classes: "Grade 6, Grade 7, Grade 8, Grade 9, Grade 10" });
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const toggleClass = (className: string) => {
    setSelectedClasses(prev =>
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const handleAdd = () => {
    if (!form.name || !form.startDate) return;
    const newExam = {
      id: `E-${String(Date.now()).slice(-6)}`,
      name: form.name,
      type: form.type as any,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      classes: selectedClasses.length > 0 ? selectedClasses : form.classes.split(",").map(c => c.trim()),
    };
    setExams([...exams, newExam]);
    toast({ title: "Exam Created ✓", description: `${newExam.name} scheduled from ${newExam.startDate}.` });
    setAddOpen(false);
    setForm({ name: "", type: "Monthly", startDate: "", endDate: "", classes: "Grade 6, Grade 7, Grade 8, Grade 9, Grade 10" });
    setSelectedClasses([]);
  };

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage examinations, schedules, grades, and result compilation.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Create Exam</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-red-500/10 p-1.5"><FileText className="w-4 h-4 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Exams</p><p className="text-xl font-bold">{exams.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5"><Calendar className="w-4 h-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Upcoming</p><p className="text-xl font-bold">{exams.filter(e => new Date(e.startDate) > new Date()).length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5"><ClipboardList className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-xl font-bold">{exams.filter(e => new Date(e.endDate) < new Date()).length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-purple-500/10 p-1.5"><Award className="w-4 h-4 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Grade Bands</p><p className="text-xl font-bold">{GRADE_BANDS.length}</p></div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
          <TabsTrigger value="grades">Grade Config</TabsTrigger>
          <TabsTrigger value="subjects">Subjects & Marks</TabsTrigger>
        </TabsList>

        {/* Exam Schedule */}
        <TabsContent value="schedule" className="space-y-3">
          <Card className="border-0 shadow-sm glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map(e => {
                    const isUpcoming = new Date(e.startDate) > new Date();
                    const isCompleted = new Date(e.endDate) < new Date();
                    const status = isCompleted ? "Completed" : isUpcoming ? "Upcoming" : "Ongoing";
                    const statusColor = isCompleted ? "bg-emerald-500/10 text-emerald-600" : isUpcoming ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-600";
                    return (
                      <TableRow key={e.id} className="border-border/30 hover:bg-muted/30">
                        <TableCell className="font-medium text-sm">{e.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{e.type}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.startDate}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{e.endDate}</TableCell>
                        <TableCell className="text-xs">{e.classes.length} classes</TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-xs border-0", statusColor)}>{status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label={`Print schedule for ${e.name}`} title="Print Schedule" onClick={() => toast({ title: "Opening exam schedule...", description: e.name })}><Printer className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" aria-label={`Delete exam ${e.name}`} title="Delete Exam" onClick={() => { setExams(exams.filter(x => x.id !== e.id)); toast({ title: "Exam Deleted", description: e.name, variant: "destructive" }); }}><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Grade Configuration */}
        <TabsContent value="grades" className="space-y-3">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base">Grading System (Percentage-based)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GRADE_BANDS.map(b => (
                  <div key={b.grade} className={cn("rounded-xl border p-4 text-center", b.color)}>
                    <p className="text-3xl font-bold">{b.grade}</p>
                    <p className="text-xs mt-1">{b.min}%{b.min < 90 ? ` to ${GRADE_BANDS[GRADE_BANDS.indexOf(b) - 1]?.min - 1 || 100}%` : " and above"}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs mt-3">
                <p className="font-medium text-primary">Grading Rules:</p>
                <p className="text-muted-foreground mt-1">• Pass marks: 33% per subject<br/>• Overall pass: Must pass all subjects<br/>• Position calculated by total marks<br/>• Grade shown on result card</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects & Marks Distribution */}
        <TabsContent value="subjects" className="space-y-3">
          <Card className="border-0 shadow-sm glass-card overflow-hidden">
            <CardHeader><CardTitle className="text-base">Subject-wise Marks Distribution</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Full Marks</TableHead>
                    <TableHead className="text-center">Pass Marks</TableHead>
                    <TableHead className="text-center">Theory</TableHead>
                    <TableHead className="text-center">Practical</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SUBJECTS.slice(0, 8).map(subj => {
                    const hasPractical = ["Physics", "Chemistry", "Biology", "Computer"].includes(subj);
                    const theory = hasPractical ? 75 : 100;
                    const practical = hasPractical ? 25 : 0;
                    return (
                      <TableRow key={subj} className="border-border/30 hover:bg-muted/30">
                        <TableCell className="font-medium text-sm flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-primary" />{subj}</TableCell>
                        <TableCell className="text-center font-bold">100</TableCell>
                        <TableCell className="text-center text-red-600">33</TableCell>
                        <TableCell className="text-center">{theory}</TableCell>
                        <TableCell className="text-center">{practical || "—"}</TableCell>
                        <TableCell className="text-center font-bold">{theory + practical}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Exam Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
          {/* Gradient hero header */}
          <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-primary via-purple-600 to-accent/70 px-5 py-4 text-primary-foreground">
            <div className="absolute inset-0 opacity-10 pattern-grid" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">Create New Exam</h2>
                <p className="text-xs text-white/75 mt-0.5">Schedule an exam with date range and participating classes.</p>
              </div>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase tracking-wider text-white/60">Total Exams</span>
                <span className="text-sm font-semibold mt-0.5">{exams.length}</span>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-5 py-4 space-y-3">
            {/* ─── Section 1: Exam Details ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/15">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Exam Details</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Name & type</span>
              </div>
              <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Exam Name <span className="text-red-500">*</span></Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Monthly Test - August 2026" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Type</Label>
                  <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ─── Section 2: Schedule ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/15">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Schedule</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Start & end dates</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Start Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">End Date</Label>
                  <Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="h-9" />
                </div>
              </div>
            </div>

            {/* ─── Section 3: Classes (toggle chips) ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border-b border-accent/15">
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-accent" />
                </div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">Participating Classes</p>
                <span className="ml-auto text-[10px] text-muted-foreground">{selectedClasses.length} selected</span>
              </div>
              <div className="p-3">
                {CLASSES.length === 0 ? (
                  <div className="text-center py-4">
                    <GraduationCap className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground mb-2">No classes added. Go to Classes module to add.</p>
                    <Input value={form.classes} onChange={e => setForm({...form, classes: e.target.value})} placeholder="Grade 6, Grade 7, Grade 8 (comma-separated)" className="h-9 max-w-md mx-auto text-xs" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
                    {CLASSES.map(cls => {
                      const checked = selectedClasses.includes(cls.name);
                      return (
                        <button
                          key={cls.name}
                          type="button"
                          onClick={() => toggleClass(cls.name)}
                          className={cn("px-2 py-1.5 rounded-md text-[11px] font-medium border-2 transition-all text-left flex items-center gap-1",
                            checked ? "bg-accent text-accent-foreground border-accent shadow-sm" : "bg-background border-border/40 hover:border-accent/40 hover:bg-accent/5")}
                        >
                          <GraduationCap className={cn("w-2.5 h-2.5 shrink-0", checked ? "text-accent-foreground" : "text-muted-foreground")} />
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
                <span className="font-semibold text-primary">Auto on save:</span> Exam appears in schedule, grade entry, and result compilation. <span className="font-semibold text-foreground">{selectedClasses.length || "All"}</span> class{selectedClasses.length !== 1 ? "es" : ""} will participate.
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
              <Button className="bg-primary hover:bg-primary/90 h-9 px-5 shadow-md" onClick={handleAdd} disabled={!form.name || !form.startDate}>
                <Plus className="w-4 h-4 mr-1.5" />Create Exam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
