"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAppStore, localDateStr } from "@/lib/sms-store";
import { useNowTick } from "@/lib/use-now-tick";
import {
  ClipboardCheck, Save, CheckCircle2, Clock, AlertCircle, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type AttStatus = "Present" | "Absent" | "Late" | "Leave" | "Half-Day";

const STATUS_STYLES: Record<AttStatus, string> = {
  "Present": "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  "Absent": "bg-red-500/15 text-red-700 border-red-500/30",
  "Late": "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  "Leave": "bg-muted text-muted-foreground border-border",
  "Half-Day": "bg-orange-500/15 text-orange-700 border-orange-500/30",
};

export function AttendanceModule() {
  const [tab, setTab] = useState("students");
  return (
    <div className="space-y-3">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="students"><StudentAttendance /></TabsContent>
        <TabsContent value="teachers"><StaffAttendance group="teachers" /></TabsContent>
        <TabsContent value="staff"><StaffAttendance group="staff" /></TabsContent>
      </Tabs>
    </div>
  );
}

function StudentAttendance() {
  useNowTick(); // Re-render every 60s so attDate stays current
  const { students, saveAttendance, userName, classes: storeClasses } = useAppStore();
  const CLASSES = storeClasses;
  const { toast } = useToast();
  const [classFilter, setClassFilter] = useState(students[0]?.class || "all");
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [attDate, setAttDate] = useState(localDateStr());

  const filtered = classFilter === "all"
    ? students.filter(s => s.status === "Active")
    : students.filter(s => s.class === classFilter && s.status === "Active");

  // Pre-populate all filtered students as "Present" by default
  // so the user doesn't have to click each one just to save
  useEffect(() => {
    setStatuses(prev => {
      const next = { ...prev };
      filtered.forEach(s => {
        if (!next[s.id]) next[s.id] = "Present";
      });
      return next;
    });
  }, [classFilter, students.length]); // re-run when class filter or student count changes

  const setStatus = (id: string, status: AttStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  };

  const markAllPresent = () => {
    const next: Record<string, AttStatus> = {};
    filtered.forEach(s => { next[s.id] = "Present"; });
    setStatuses(next);
  };

  const save = () => {
    const marked = filtered.filter(s => statuses[s.id]);
    if (marked.length === 0) {
      toast({ title: "No students marked", description: "Mark attendance for at least one student first.", variant: "destructive" });
      return;
    }
    // Build per-student attendance records
    const records = marked.map(s => ({
      id: `ATT-${s.id}-${attDate}`,
      studentId: s.id,
      date: attDate,
      status: statuses[s.id],
      markedBy: userName,
      markedAt: new Date().toISOString(),
    }));
    saveAttendance(records);
    const present = marked.filter(s => statuses[s.id] === "Present").length;
    const absent = marked.filter(s => statuses[s.id] === "Absent").length;
    toast({
      title: "Attendance Saved ✓",
      description: `${marked.length} students marked for ${classFilter} on ${attDate}. Present: ${present}, Absent: ${absent}`,
    });
    setStatuses({});
  };

  const counts = {
    Present: filtered.filter(s => statuses[s.id] === "Present").length,
    Absent: filtered.filter(s => statuses[s.id] === "Absent").length,
    Late: filtered.filter(s => statuses[s.id] === "Late").length,
    Leave: filtered.filter(s => statuses[s.id] === "Leave").length,
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40 bg-background/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={attDate}
            onChange={e => setAttDate(e.target.value)}
            className="w-36 h-9 bg-background/60"
            aria-label="Attendance date"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllPresent}>Mark All Present</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={save}>
            <Save className="w-4 h-4 mr-1.5" />Save Attendance
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatPill label="Present" value={counts.Present} color="emerald" icon={CheckCircle2} />
        <StatPill label="Absent" value={counts.Absent} color="red" icon={AlertCircle} />
        <StatPill label="Late" value={counts.Late} color="yellow" icon={Clock} />
        <StatPill label="Leave" value={counts.Leave} color="muted" icon={Calendar} />
      </div>

      {/* Roster */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-12">Roll</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const status = statuses[s.id] || "Present";
                return (
                  <TableRow key={s.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={cn("text-xs font-semibold", s.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                            {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.gender}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(["Present", "Absent", "Late", "Leave"] as AttStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => setStatus(s.id, st)}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all",
                              status === st
                                ? STATUS_STYLES[st]
                                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
                            )}
                          >
                            {st === "Present" ? "P" : st === "Absent" ? "A" : st === "Late" ? "L" : "Lv"}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function StaffAttendance({ group }: { group: "teachers" | "staff" }) {
  const { teachers, staff, saveAttendance, userName } = useAppStore();
  const { toast } = useToast();
  const people = group === "teachers" ? teachers : staff;
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  const [attDate, setAttDate] = useState(localDateStr());

  const save = () => {
    const marked = people.filter(p => statuses[p.id]);
    if (marked.length === 0) {
      toast({ title: "No staff marked", description: "Mark attendance for at least one person first.", variant: "destructive" });
      return;
    }
    // Build per-employee attendance records (using studentId field for employee IDs)
    const records = marked.map(p => ({
      id: `ATT-${p.id}-${attDate}`,
      studentId: p.id, // reusing the same record shape; Salary module reads by employee ID
      date: attDate,
      status: statuses[p.id],
      markedBy: userName,
      markedAt: new Date().toISOString(),
    }));
    saveAttendance(records);
    const present = marked.filter(p => statuses[p.id] === "Present").length;
    const absent = marked.filter(p => statuses[p.id] === "Absent").length;
    toast({
      title: "Staff Attendance Saved ✓",
      description: `${marked.length} ${group} marked for ${attDate}. Present: ${present}, Absent: ${absent}`,
    });
    setStatuses({});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Input
          type="date"
          value={attDate}
          onChange={e => setAttDate(e.target.value)}
          className="w-36 h-9 bg-background/60"
          aria-label="Attendance date"
        />
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={save}>
          <Save className="w-4 h-4 mr-1.5" />Save Staff Attendance
        </Button>
      </div>
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>{group === "teachers" ? "Subjects" : "Department"}</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-sm text-muted-foreground">
                    No {group} found. Add {group} in the {group === "teachers" ? "Teachers" : "Staff"} module first.
                  </TableCell>
                </TableRow>
              ) : people.map(p => {
                const status = statuses[p.id] || "Present";
                return (
                  <TableRow key={p.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-semibold bg-accent/15 text-accent">
                            {p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {group === "teachers" ? (p as any).subjects?.join(", ") || "—" : (p as any).department}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(["Present", "Late", "Half-Day", "Leave", "Absent"] as AttStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => setStatuses(prev => ({ ...prev, [p.id]: st }))}
                            aria-pressed={status === st}
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-medium border transition-all",
                              status === st
                                ? STATUS_STYLES[st]
                                : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
                            )}
                          >
                            {st === "Present" ? "P" : st === "Late" ? "L" : st === "Half-Day" ? "H" : st === "Leave" ? "Lv" : "A"}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs">
        <p className="font-semibold text-accent flex items-center gap-1.5">
          <ClipboardCheck className="w-3.5 h-3.5" /> Salary Impact
        </p>
        <p className="text-muted-foreground mt-1">
          Saved statuses feed into Salary & Fine calculation. Each Absent deducts a full day's pay,
          Late deducts Rs. 500, Half-Day deducts 50% of a day's pay. See Salary module for the breakdown.
        </p>
      </div>
    </div>
  );
}

function StatPill({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    red: "bg-red-500/10 text-red-600",
    yellow: "bg-yellow-500/10 text-yellow-600",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2.5">
      <div className={cn("rounded-lg p-1.5", colorMap[color])}><Icon className="w-4 h-4" /></div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{label}</p>
      </div>
    </CardContent></Card>
  );
}
