"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/lib/sms-store";
import { CLASSES, TEACHERS, STAFF } from "@/lib/sms-data";
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
  const { students, markAttendance } = useAppStore();
  const { toast } = useToast();
  const [classFilter, setClassFilter] = useState("Grade 9");
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});

  const filtered = students.filter(s => s.class === classFilter && s.status === "Active");

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
    markAttendance(marked.map(s => s.id), "Mixed");
    toast({
      title: "Attendance Saved",
      description: `${marked.length} students marked for ${classFilter}.`,
    });
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
              {CLASSES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </Badge>
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
  const people = group === "teachers" ? TEACHERS : STAFF;
  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});

  return (
    <div className="space-y-3">
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
              {people.map(p => {
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
                          <p className="text-[10px] text-muted-foreground">{group === "teachers" ? (p as typeof TEACHERS[0]).designation : (p as typeof STAFF[0]).designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {group === "teachers" ? (p as typeof TEACHERS[0]).subjects.join(", ") : (p as typeof STAFF[0]).department}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(["Present", "Late", "Half-Day", "Leave", "Absent"] as AttStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => setStatuses(prev => ({ ...prev, [p.id]: st }))}
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
          Marked statuses feed directly into Salary & Fine calculation. Each Absent deducts a full day's pay,
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
