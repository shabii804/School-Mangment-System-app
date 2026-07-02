"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { EXAMS, STUDENTS, SUBJECTS } from "@/lib/sms-data";
import {
  FileText, Plus, Printer, Award, BookOpen, GraduationCap, CheckCircle2,
} from "lucide-react";
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

export function ResultsModule() {
  const { toast } = useToast();
  const [selectedExam, setSelectedExam] = useState(EXAMS[0].id);
  const [selectedClass, setSelectedClass] = useState("Grade 9");
  const [marksDialog, setMarksDialog] = useState(false);

  // Mock marks data
  const classStudents = STUDENTS.filter(s => s.class === selectedClass && s.status === "Active").slice(0, 8);
  const marksData = classStudents.map((s, i) => {
    const subjects = SUBJECTS.slice(0, 5).map(sub => {
      const obtained = 60 + ((i * 7 + sub.length * 3) % 40);
      return { subject: sub, obtained, total: 100, pct: obtained };
    });
    const total = subjects.reduce((sum, sub) => sum + sub.obtained, 0);
    const maxTotal = subjects.reduce((sum, sub) => sum + sub.total, 0);
    const pct = Math.round((total / maxTotal) * 100);
    return { student: s, subjects, total, maxTotal, pct, grade: gradeFor(pct) };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger className="w-56 bg-background/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            {EXAMS.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-40 bg-background/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMarksDialog(true)}><Plus className="w-4 h-4 mr-1.5" />Enter Marks</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90"
            onClick={() => toast({ title: "Result Cards Generated", description: `${classStudents.length} cards for ${selectedClass}.` })}
          >
            <Printer className="w-4 h-4 mr-1.5" />Generate Result Cards
          </Button>
        </div>
      </div>

      {/* Top performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marksData.slice(0, 3).map((row, i) => (
          <Card key={row.student.id} className={cn(
            "border-0 shadow-sm glass-card relative overflow-hidden",
            i === 0 && "ring-2 ring-yellow-500/30"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                  i === 0 ? "bg-yellow-500/20 text-yellow-700" : i === 1 ? "bg-muted text-muted-foreground" : "bg-orange-500/20 text-orange-700"
                )}>
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{row.student.name}</p>
                  <p className="text-xs text-muted-foreground">{row.student.class}-{row.student.section} • Roll #{row.student.rollNo}</p>
                </div>
                {i === 0 && <Award className="w-5 h-5 text-yellow-500" />}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge className={cn("text-xs", row.grade.color)}>{row.grade.grade}</Badge>
                <p className="text-lg font-bold">{row.pct}%</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Result table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" />Class Result — {selectedClass}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-12">Pos</TableHead>
                <TableHead>Student</TableHead>
                {SUBJECTS.slice(0, 5).map(s => <TableHead key={s} className="text-center text-xs">{s.slice(0, 4)}</TableHead>)}
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">%</TableHead>
                <TableHead className="text-center">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marksData.map((row, i) => (
                <TableRow key={row.student.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell><Badge variant="outline" className="text-xs">{i + 1}</Badge></TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{row.student.name}</p>
                      <p className="text-[10px] text-muted-foreground">Roll #{row.student.rollNo}</p>
                    </div>
                  </TableCell>
                  {row.subjects.map(sub => (
                    <TableCell key={sub.subject} className="text-center text-xs">
                      <span className={sub.pct >= 50 ? "text-foreground" : "text-red-600 font-medium"}>{sub.obtained}</span>
                      <span className="text-muted-foreground">/{sub.total}</span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-medium text-sm">{row.total}/{row.maxTotal}</TableCell>
                  <TableCell className="text-center font-bold">{row.pct}%</TableCell>
                  <TableCell className="text-center"><Badge className={cn("text-xs", row.grade.color)}>{row.grade.grade}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Marks entry dialog */}
      <Dialog open={marksDialog} onOpenChange={setMarksDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />Enter Marks — {selectedClass} • {EXAMS.find(e => e.id === selectedExam)?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead>Student</TableHead>
                  {SUBJECTS.slice(0, 5).map(s => <TableHead key={s} className="text-center text-xs">{s}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStudents.map((s, i) => (
                  <TableRow key={s.id} className="border-border/30">
                    <TableCell className="text-sm font-medium">{s.name}</TableCell>
                    {SUBJECTS.slice(0, 5).map(sub => (
                      <TableCell key={sub} className="text-center">
                        <input
                          type="number"
                          defaultValue={60 + ((i * 7 + sub.length * 3) % 40)}
                          className="w-16 text-center text-sm bg-muted/30 border border-border/40 rounded px-2 py-1"
                          min={0} max={100}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarksDialog(false)}>Cancel</Button>
            <Button onClick={() => { setMarksDialog(false); toast({ title: "Marks Saved", description: "Draft saved. Click Generate to compute grades." }); }}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />Save Marks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CERTIFICATES MODULE
// ─────────────────────────────────────────────────────────────
const CERT_TYPES = [
  { type: "School Leaving Certificate", icon: GraduationCap, color: "bg-red-500/10 text-red-600", desc: "Issued when a student leaves the school" },
  { type: "Character Certificate", icon: Award, color: "bg-primary/10 text-primary", desc: "Certifies good moral character" },
  { type: "Bonafide Certificate", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600", desc: "Confirms current enrollment" },
  { type: "Fee Paid Certificate", icon: FileText, color: "bg-accent/10 text-accent", desc: "Certifies all fees cleared" },
];

export function CertificatesModule() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<typeof CERT_TYPES[0] | null>(null);
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Generate official school certificates with auto-filled student data and school letterhead.</p>

      {/* Certificate types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CERT_TYPES.map(ct => {
          const Icon = ct.icon;
          return (
            <Card key={ct.type} className="border-0 shadow-sm glass-card hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelected(ct); setSelectedStudent(STUDENTS[0]); }}>
              <CardContent className="p-4 text-center">
                <div className={cn("w-12 h-12 rounded-xl mx-auto flex items-center justify-center", ct.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm mt-3">{ct.type}</p>
                <p className="text-xs text-muted-foreground mt-1">{ct.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent certificates */}
      <Card className="border-0 shadow-sm glass-card">
        <CardHeader><CardTitle className="text-base">Recently Issued Certificates</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40">
                <TableHead>Cert #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { no: "CERT-2026-001", type: "Bonafide", student: "Ayesha Khan", date: "2026-07-01" },
                { no: "CERT-2026-002", type: "Character", student: "Hamza Sheikh", date: "2026-06-28" },
                { no: "CERT-2026-003", type: "Fee Paid", student: "Fatima Ali", date: "2026-06-25" },
                { no: "CERT-2026-004", type: "School Leaving", student: "Bilal Ahmed", date: "2026-06-20" },
              ].map(c => (
                <TableRow key={c.no} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{c.no}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{c.type}</Badge></TableCell>
                  <TableCell className="text-sm">{c.student}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.date}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-7 text-xs"><Printer className="w-3 h-3 mr-1" />Reprint</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" />{selected?.type}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              {/* Certificate preview */}
              <div className="rounded-lg border-2 border-primary/30 p-6 bg-white relative">
                <div className="absolute inset-0 border border-primary/10 m-1.5 rounded pointer-events-none" />
                <div className="text-center relative">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-primary">Greenwood Public School</p>
                      <p className="text-[10px] text-muted-foreground">123 Education Road, Karachi • +92 21 1234567</p>
                    </div>
                  </div>
                  <div className="border-t-2 border-b-2 border-primary/20 py-3 my-3">
                    <p className="text-lg font-bold text-primary uppercase tracking-wide">{selected.type}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Certificate No: <span className="font-mono font-medium text-foreground">CERT-2026-005</span></p>
                  <p className="text-sm leading-relaxed text-foreground">
                    This is to certify that <span className="font-bold underline">{selectedStudent.name}</span>,
                    S/o / D/o <span className="font-bold underline">{selectedStudent.fatherName}</span>,
                    is a bona fide student of this institution, currently studying in class
                    <span className="font-bold underline"> {selectedStudent.class}-{selectedStudent.section}</span>,
                    bearing Roll No. <span className="font-bold underline">{selectedStudent.rollNo}</span>,
                    Student ID <span className="font-mono underline">{selectedStudent.id}</span>.
                  </p>
                  <p className="text-sm leading-relaxed text-foreground mt-3">
                    This certificate is issued on <span className="underline">{new Date().toLocaleDateString("en-GB")}</span> for the purpose of
                    official school records.
                  </p>
                  <div className="flex justify-between items-end mt-8 text-xs">
                    <div className="text-center">
                      <div className="border-t border-foreground/30 w-32 mt-8" />
                      <p className="mt-1 text-muted-foreground">Clerk</p>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-foreground/30 w-32 mt-8" />
                      <p className="mt-1 text-muted-foreground">Principal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90"
              onClick={() => {
                toast({ title: "Certificate Issued", description: `CERT-2026-005 for ${selectedStudent.name}.` });
                setSelected(null);
              }}
            >
              <Printer className="w-4 h-4 mr-1.5" />Issue & Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
