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
import { EXAMS, CLASSES, SUBJECTS } from "@/lib/sms-data";
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
  const [tab, setTab] = useState("schedule");
  const [addOpen, setAddOpen] = useState(false);
  const [exams, setExams] = useState(EXAMS);
  const [form, setForm] = useState({ name: "", type: "Monthly", startDate: "", endDate: "", classes: "Grade 6, Grade 7, Grade 8, Grade 9, Grade 10" });

  const handleAdd = () => {
    if (!form.name || !form.startDate) return;
    const newExam = {
      id: `E${exams.length + 1}`,
      name: form.name,
      type: form.type as any,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      classes: form.classes.split(",").map(c => c.trim()),
    };
    setExams([...exams, newExam]);
    setAddOpen(false);
    setForm({ name: "", type: "Monthly", startDate: "", endDate: "", classes: "Grade 6, Grade 7, Grade 8, Grade 9, Grade 10" });
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage examinations, schedules, grades, and result compilation.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Create Exam</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2"><FileText className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Exams</p><p className="text-xl font-bold">{exams.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Calendar className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Upcoming</p><p className="text-xl font-bold">{exams.filter(e => new Date(e.startDate) > new Date()).length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><ClipboardList className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-xl font-bold">{exams.filter(e => new Date(e.endDate) < new Date()).length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2"><Award className="w-5 h-5 text-purple-600" /></div>
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
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Printer className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600"><Trash2 className="w-3 h-3" /></Button>
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
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Create New Exam</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Exam Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Monthly Test - August 2026" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Monthly">Monthly</SelectItem><SelectItem value="Mid-Term">Mid-Term</SelectItem><SelectItem value="Final">Final</SelectItem><SelectItem value="Quiz">Quiz</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
            </div>
            <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
            <div><Label>Classes (comma-separated)</Label><Input value={form.classes} onChange={e => setForm({...form, classes: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.name || !form.startDate}>Create Exam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
