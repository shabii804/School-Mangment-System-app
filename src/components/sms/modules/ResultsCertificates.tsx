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
import { EXAMS, STUDENTS, SUBJECTS, TEACHERS } from "@/lib/sms-data";
import {
  FileText, Plus, Printer, Award, BookOpen, GraduationCap, CheckCircle2,
  Star, Trophy, Medal, User, Users as UsersIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/sms-store";
import { printCertificate, printResultCard, printTeacherCertificate, printStudentAward, printExamSeatingPlan } from "@/lib/pdf-service";
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
  const { school, students } = useAppStore();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [marksDialog, setMarksDialog] = useState(false);

  // Mock marks data — handle "all" classes
  const classStudents = selectedClass === "all"
    ? students.filter(s => s.status === "Active").slice(0, 15)
    : students.filter(s => s.class === selectedClass && s.status === "Active").slice(0, 8);
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
    <div className="space-y-3">
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
            <SelectItem value="all">All Classes</SelectItem>
            {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const examName = EXAMS.find(e => e.id === selectedExam)?.name || "Exam";
            const classStudents = students.filter(s => s.class === selectedClass && s.status === "Active").slice(0, 20).map(s => ({ rollNo: s.rollNo, name: s.name }));
            toast({ title: "Generating seating plan...", description: `${examName} • ${selectedClass}` });
            printExamSeatingPlan(examName, selectedClass, "Examination Hall", classStudents, school);
          }}>
            <Printer className="w-4 h-4 mr-1.5" />Seating Plan
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMarksDialog(true)}><Plus className="w-4 h-4 mr-1.5" />Enter Marks</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90"
            onClick={() => {
              if (marksData.length === 0) return;
              const top = marksData[0];
              const examName = EXAMS.find(e => e.id === selectedExam)?.name || "Exam";
              toast({ title: "Opening result card PDF...", description: `${top.student.name} • ${examName}` });
              printResultCard(
                top.student,
                examName,
                top.subjects,
                top.total,
                top.maxTotal,
                top.pct,
                top.grade.grade,
                1,
                school
              );
            }}
          >
            <Printer className="w-4 h-4 mr-1.5" />Print Top Result Card
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
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Enter Marks — {selectedClass} • {EXAMS.find(e => e.id === selectedExam)?.name}</DialogTitle>
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
// CERTIFICATES MODULE — Students + Teachers
// ─────────────────────────────────────────────────────────────
const STUDENT_CERT_TYPES = [
  { type: "School Leaving Certificate", icon: GraduationCap, color: "bg-red-500/10 text-red-600", desc: "Issued when a student leaves", category: "standard" },
  { type: "Character Certificate", icon: Award, color: "bg-primary/10 text-primary", desc: "Certifies good moral character", category: "standard" },
  { type: "Bonafide Certificate", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600", desc: "Confirms current enrollment", category: "standard" },
  { type: "Fee Paid Certificate", icon: FileText, color: "bg-accent/10 text-accent", desc: "Certifies all fees cleared", category: "standard" },
  { type: "Best Student Award", icon: Medal, color: "bg-yellow-500/10 text-yellow-600", desc: "Outstanding academic performance", category: "award" },
  { type: "Student of the Year", icon: Trophy, color: "bg-purple-500/10 text-purple-600", desc: "Annual excellence recognition", category: "award" },
];

const TEACHER_CERT_TYPES = [
  { type: "Experience Certificate", icon: FileText, color: "bg-primary/10 text-primary", desc: "Employment tenure verification", category: "standard" },
  { type: "Appreciation Certificate", icon: Award, color: "bg-emerald-500/10 text-emerald-600", desc: "Recognizes valuable service", category: "standard" },
  { type: "Best Teacher Award", icon: Medal, color: "bg-yellow-500/10 text-yellow-600", desc: "Outstanding teaching dedication", category: "award" },
  { type: "Teacher of the Year", icon: Trophy, color: "bg-purple-500/10 text-purple-600", desc: "Annual excellence recognition", category: "award" },
];

export function CertificatesModule() {
  const { toast } = useToast();
  const { school, students, teachers } = useAppStore();
  const [recipientType, setRecipientType] = useState<"student" | "teacher">("student");
  const [selectedCert, setSelectedCert] = useState<{ type: string; category: string } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const certTypes = recipientType === "student" ? STUDENT_CERT_TYPES : TEACHER_CERT_TYPES;
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  const openCert = (cert: { type: string; category: string }) => {
    setSelectedCert(cert);
  };

  const issueAndPrint = () => {
    if (!selectedCert) return;
    // Guard: must have a recipient selected
    const recipient = recipientType === "student" ? selectedStudent : selectedTeacher;
    if (!recipient) {
      toast({ title: "Select a recipient", description: `Please choose a ${recipientType} first.`, variant: "destructive" });
      return;
    }
    const certNo = `CERT-2026-${String(Date.now()).slice(-6)}`;
    const recipientName = recipient.name;
    toast({ title: "Certificate Issued ✓", description: `${certNo} for ${recipientName}. Opening PDF...` });

    if (recipientType === "student" && selectedStudent) {
      if (selectedCert.category === "award") {
        printStudentAward(selectedStudent, selectedCert.type, certNo, school);
      } else {
        printCertificate(selectedStudent, selectedCert.type, certNo, school);
      }
    } else if (recipientType === "teacher" && selectedTeacher) {
      printTeacherCertificate(selectedTeacher, selectedCert.type, certNo, school);
    }
    setSelectedCert(null);
  };

  return (
    <div className="space-y-3 fade-in">
      <p className="text-sm text-muted-foreground">Generate official school certificates with auto-filled data, school letterhead, and QR-ready PDF output.</p>

      {/* Recipient type toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRecipientType("student")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            recipientType === "student" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/40 text-muted-foreground hover:bg-muted"
          )}
        >
          <UsersIcon className="w-4 h-4" />Student Certificates
        </button>
        <button
          onClick={() => setRecipientType("teacher")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            recipientType === "teacher" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/40 text-muted-foreground hover:bg-muted"
          )}
        >
          <User className="w-4 h-4" />Teacher Certificates
        </button>
      </div>

      {/* Certificate types grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certTypes.map(ct => {
          const Icon = ct.icon;
          return (
            <Card
              key={ct.type}
              className="border-0 shadow-sm glass-card card-hover cursor-pointer relative overflow-hidden"
              onClick={() => openCert(ct)}
            >
              {ct.category === "award" && (
                <div className="absolute top-0 right-0 bg-accent/10 text-accent text-[9px] px-2 py-0.5 rounded-bl-lg font-semibold">
                  AWARD
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", ct.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{ct.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ct.desc}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
                  <Printer className="w-3 h-3 mr-1" />Generate
                </Button>
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
                <TableHead>Recipient</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {([
                // Placeholder rows — populated when certificate issuance is wired up
              ] as { no: string; type: string; recipient: string; date: string }[]).map(c => (
                <TableRow key={c.no} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{c.no}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{c.type}</Badge></TableCell>
                  <TableCell className="text-sm">{c.recipient}</TableCell>
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

      {/* Generate dialog with recipient selector */}
      <Dialog open={!!selectedCert} onOpenChange={(o) => !o && setSelectedCert(null)}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              {selectedCert?.type}
              {selectedCert?.category === "award" && (
                <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-0 ml-2">AWARD</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <div className="space-y-4 py-2">
              {/* Recipient selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium">
                  Select {recipientType === "student" ? "Student" : "Teacher"}
                </label>
                {recipientType === "student" ? (
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {students.filter(s => s.status === "Active").map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} • {s.class}-{s.section} • {s.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} • {t.designation} • {t.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Preview card */}
              <div className="rounded-lg border-2 border-primary/30 p-4 bg-card relative">
                <div className="absolute inset-0 border border-primary/10 m-1.5 rounded pointer-events-none" />
                <div className="text-center relative">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden">
                      {school.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={school.logo} alt="logo" className="w-full h-full object-cover" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">{school.name}</p>
                      <p className="text-[10px] text-muted-foreground">{school.address}</p>
                    </div>
                  </div>
                  <div className="border-t-2 border-b-2 border-primary/20 py-2 my-2">
                    <p className="text-base font-bold text-primary uppercase tracking-wide">{selectedCert.type}</p>
                  </div>
                  {selectedCert.category === "award" && (
                    <div className="my-2">
                      <Star className="w-6 h-6 mx-auto text-accent fill-accent" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mb-2">Proudly presented to</p>
                  <p className="text-lg font-bold text-foreground underline">
                    {recipientType === "student"
                      ? (selectedStudent?.name ?? "— Select a student —")
                      : (selectedTeacher?.name ?? "— Select a teacher —")}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {recipientType === "student"
                      ? (selectedStudent
                          ? `Class ${selectedStudent.class}-${selectedStudent.section} • Roll #${selectedStudent.rollNo}`
                          : "Student details will appear here")
                      : (selectedTeacher
                          ? `${selectedTeacher.designation} • Since ${selectedTeacher.joiningDate.slice(0, 4)}`
                          : "Teacher details will appear here")}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Certificate No: <span className="font-mono">CERT-2026-XXX</span> • {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCert(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={issueAndPrint}>
              <Printer className="w-4 h-4 mr-1.5" />Issue & Print (PDF)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
