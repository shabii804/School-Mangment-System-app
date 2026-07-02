"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Phone, Mail, Wallet, GraduationCap, UserCog,
  CalendarDays, BookOpen, Briefcase, IdCard,
} from "lucide-react";
import { TEACHERS, STAFF } from "@/lib/sms-data";
import { cn } from "@/lib/utils";

export function TeachersModule() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Manage teaching staff, subjects, classes, and salary.</p>
        <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" />Add Teacher</Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><GraduationCap className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Teachers</p><p className="text-xl font-bold">{TEACHERS.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2"><UserCog className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Salary</p><p className="text-xl font-bold">Rs. {(TEACHERS.reduce((s, t) => s + t.monthlySalary, 0) / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><BookOpen className="w-5 h-5 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Subjects</p><p className="text-xl font-bold">{new Set(TEACHERS.flatMap(t => t.subjects)).size}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><CalendarDays className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Avg Attendance</p><p className="text-xl font-bold">93%</p></div>
        </CardContent></Card>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEACHERS.map(t => {
          const totalDays = t.attendance.present + t.attendance.late + t.attendance.halfDay + t.attendance.absent + t.attendance.leave;
          const attPct = Math.round((t.attendance.present + t.attendance.late * 0.75 + t.attendance.halfDay * 0.5) / totalDays * 100);
          return (
            <Card key={t.id} className="border-0 shadow-sm glass-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={cn("font-semibold", t.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                      {t.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.designation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{t.id}</Badge>
                      <Badge variant="outline" className="text-[10px] bg-primary/5">{attPct}% att.</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="truncate">{t.subjects.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span className="truncate">{t.classes.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.phone}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Monthly Salary</p>
                    <p className="font-bold text-sm">Rs. {t.monthlySalary.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs">View Profile</Button>
                </div>

                {/* Attendance mini-bar */}
                <div className="mt-2 flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500" style={{ width: `${(t.attendance.present / totalDays) * 100}%` }} title={`${t.attendance.present} Present`} />
                  <div className="bg-yellow-500" style={{ width: `${(t.attendance.late / totalDays) * 100}%` }} title={`${t.attendance.late} Late`} />
                  <div className="bg-orange-500" style={{ width: `${(t.attendance.halfDay / totalDays) * 100}%` }} title={`${t.attendance.halfDay} Half-Day`} />
                  <div className="bg-red-500" style={{ width: `${(t.attendance.absent / totalDays) * 100}%` }} title={`${t.attendance.absent} Absent`} />
                  <div className="bg-muted-foreground/40" style={{ width: `${(t.attendance.leave / totalDays) * 100}%` }} title={`${t.attendance.leave} Leave`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function StaffModule() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Non-teaching staff: administration, accounts, security, transport, housekeeping.</p>
        <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" />Add Staff</Button>
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
                <TableHead>Attendance (M)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STAFF.map(s => {
                const total = s.attendance.present + s.attendance.late + s.attendance.halfDay + s.attendance.absent + s.attendance.leave;
                const pct = Math.round((s.attendance.present + s.attendance.late * 0.75 + s.attendance.halfDay * 0.5) / total * 100);
                return (
                  <TableRow key={s.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-semibold bg-accent/15 text-accent">
                            {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">Since {s.joiningDate.slice(0, 4)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{s.department}</Badge></TableCell>
                    <TableCell className="text-sm">{s.designation}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.phone}</TableCell>
                    <TableCell className="font-semibold text-sm">Rs. {s.monthlySalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">View</Button>
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
            {Array.from(new Set(STAFF.map(s => s.department))).map(dept => {
              const members = STAFF.filter(s => s.department === dept);
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
    </div>
  );
}
