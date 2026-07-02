"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CLASSES, SUBJECTS, TIMETABLE, STUDENTS } from "@/lib/sms-data";
import { School, Users, BookOpen, Plus, Printer, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIOD_TIMES = [
  "08:00 - 08:45",
  "08:45 - 09:30",
  "09:30 - 10:15",
  "10:30 - 11:15",
  "11:15 - 12:00",
  "12:00 - 12:45",
];

export function ClassesModule() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Classes, sections, subjects, and class teachers.</p>
        <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" />Add Class</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLASSES.map(cls => {
          const studentCount = STUDENTS.filter(s => s.class === cls.name && s.status === "Active").length;
          const totalCapacity = cls.sections.length * 30;
          return (
            <Card key={cls.name} className="border-0 shadow-sm glass-card hover:shadow-md transition-shadow">
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
                  <div className="rounded-lg bg-muted/30 p-2">
                    <Users className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                    <p className="text-sm font-bold mt-1">{studentCount}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Students</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <BookOpen className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                    <p className="text-sm font-bold mt-1">{SUBJECTS.length}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Subjects</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <CalendarDays className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                    <p className="text-sm font-bold mt-1">{totalCapacity}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Capacity</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Monthly Fee</p>
                    <p className="font-bold text-sm">Rs. {cls.monthlyFee.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs">View Roster</Button>
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
              <Badge key={s} variant="outline" className="px-3 py-1.5 text-xs bg-primary/5">
                <BookOpen className="w-3 h-3 mr-1.5" />{s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TimetableModule() {
  const [selectedClass, setSelectedClass] = useState("Grade 9-A");
  const slots = TIMETABLE["Grade 9-A"] || [];

  const getSlot = (day: string, period: number) =>
    slots.find(s => s.day === day && s.period === period);

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
          <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1.5" />Print</Button>
          <Button className="bg-primary hover:bg-primary/90" size="sm"><Plus className="w-4 h-4 mr-1.5" />Edit Timetable</Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">Conflict-free • Auto-checked:</span>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0">Teacher available</Badge>
        <Badge variant="outline" className="bg-primary/10 text-primary border-0">Room free</Badge>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-0">Subject quota OK</Badge>
      </div>

      {/* Timetable grid */}
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
                        <div className={cn(
                          "h-16 rounded-lg p-2 border text-xs flex flex-col justify-center",
                          "bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors"
                        )}>
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

      {/* Info note */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-foreground">
          <strong className="text-primary">Conflict Detection:</strong> The timetable engine checks three constraints on every slot save —
          teacher double-booking, room clash, and subject weekly quota. Conflicts are highlighted in red and block save until resolved.
        </p>
      </div>
    </div>
  );
}
