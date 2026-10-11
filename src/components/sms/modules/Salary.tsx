"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Wallet, Calculator, Printer, FileDown, CheckCircle2,
  TrendingDown, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAppStore, localDateStr } from "@/lib/sms-store";
import { useNowTick } from "@/lib/use-now-tick";
import { printSalarySlip, printPayrollBatch } from "@/lib/pdf-service";

const WORKING_DAYS = 26; // Configurable in Settings
const LATE_FINE = 500; // Configurable in Settings

interface SalaryRow {
  id: string;
  name: string;
  designation: string;
  monthlySalary: number;
  attendance: { present: number; late: number; halfDay: number; absent: number; leave: number };
  dept?: string;
}

export function SalaryModule() {
  useNowTick(); // Re-render every 60s so month dropdown stays current
  const { toast } = useToast();
  const { school, teachers, staff, attendanceRecords, addTransaction } = useAppStore();
  const [month, setMonth] = useState(new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }));
  const [selected, setSelected] = useState<SalaryRow | null>(null);
  const [deptFilter, setDeptFilter] = useState("all");

  // Build employee list from store — newly added teachers/staff appear here
  // Compute attendance counts from attendanceRecords for the selected month
  const monthKey = (() => {
    // Convert "July 2026" → "2026-07"
    const [mName, yr] = month.split(" ");
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const mIdx = months.indexOf(mName) + 1;
    return `${yr}-${String(mIdx).padStart(2, "0")}`;
  })();

  const computeAttendance = (empId: string) => {
    const recs = attendanceRecords.filter(r => r.studentId === empId && r.date.startsWith(monthKey));
    let present = 0, late = 0, absent = 0, halfDay = 0, leave = 0;
    recs.forEach(r => {
      if (r.status === "Present") present++;
      else if (r.status === "Late") late++;
      else if (r.status === "Absent") absent++;
      else if (r.status === "Leave") leave++;
      else if (r.status === "Half-Day") halfDay++;
    });
    // Fallback: if no records, use the legacy attendance object from the entity
    if (recs.length === 0) {
      const t = teachers.find(t => t.id === empId);
      const s = staff.find(s => s.id === empId);
      const att = t?.attendance || s?.attendance;
      if (att) return att;
    }
    return { present, late, halfDay, absent, leave };
  };

  const allEmployees: SalaryRow[] = [
    ...teachers.map(t => ({ id: t.id, name: t.name, designation: t.designation, monthlySalary: t.monthlySalary, attendance: computeAttendance(t.id), dept: "Teaching" })),
    ...staff.map(s => ({ id: s.id, name: s.name, designation: s.designation, monthlySalary: s.monthlySalary, attendance: computeAttendance(s.id), dept: s.department })),
  ];

  const filteredEmployees = deptFilter === "all" ? allEmployees : allEmployees.filter(e => e.dept === deptFilter);
  const departments = Array.from(new Set(allEmployees.map(e => e.dept).filter((d): d is string => Boolean(d))));

  const calculate = (emp: SalaryRow) => {
    const gross = emp.monthlySalary;
    const perDay = Math.round(gross / WORKING_DAYS);
    const absentDeduction = emp.attendance.absent * perDay;
    const lateDeduction = emp.attendance.late * LATE_FINE;
    const halfDayDeduction = Math.round(emp.attendance.halfDay * perDay * 0.5);
    const totalDeduction = absentDeduction + lateDeduction + halfDayDeduction;
    const net = gross - totalDeduction;
    return { gross, perDay, absentDeduction, lateDeduction, halfDayDeduction, totalDeduction, net };
  };

  return (
    <div className="space-y-3">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5"><Wallet className="w-4 h-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Payroll</p><p className="text-lg font-bold">Rs. {(allEmployees.reduce((s, e) => s + e.monthlySalary, 0) / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-red-500/10 p-1.5"><TrendingDown className="w-4 h-4 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Fines</p><p className="text-lg font-bold">Rs. {allEmployees.reduce((s, e) => s + calculate(e).totalDeduction, 0).toLocaleString()}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Net Payable</p><p className="text-lg font-bold">Rs. {(allEmployees.reduce((s, e) => s + calculate(e).net, 0) / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-accent/10 p-1.5"><AlertCircle className="w-4 h-4 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Employees</p><p className="text-xl font-bold">{allEmployees.length}</p></div>
        </CardContent></Card>
      </div>

      {/* Worked example banner */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-1.5"><Calculator className="w-4 h-4 text-primary" /></div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Auto Fine Calculation — Worked Example</p>
              <p className="text-xs text-muted-foreground mt-1">
                Teacher with <strong>Rs. 50,000</strong> monthly salary, <strong>26 working days</strong> → Per-day = Rs. 1,923.
                With <strong>2 absences</strong> (Rs. 3,846) and <strong>1 late</strong> (Rs. 500) = Total deduction Rs. 4,346.
                <strong className="text-primary"> Net payable: Rs. 45,654.</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40 bg-background/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(() => {
              const now = new Date();
              const months: React.ReactElement[] = [];
              // Show 12 past months + 6 future months so admin can plan ahead
              for (let i = 12; i >= -6; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
                const isFuture = d > now;
                months.push(<SelectItem key={label} value={label}>{label}{isFuture ? " (upcoming)" : ""}</SelectItem>);
              }
              return months;
            })()}
          </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40 bg-background/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"
            onClick={() => {
              toast({ title: "Generating payroll batch PDF...", description: `${filteredEmployees.length} employees • ${month}` });
              printPayrollBatch(filteredEmployees, month, school);
            }}
          >
            <FileDown className="w-4 h-4 mr-1.5" />Payroll Summary PDF
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90"
            onClick={() => {
              if (filteredEmployees.length === 0) {
                toast({ title: "No employees", description: "No employees match the current filter.", variant: "destructive" });
                return;
              }
              const totalNet = filteredEmployees.reduce((s, e) => s + calculate(e).net, 0);
              try {
                printPayrollBatch(filteredEmployees, month, school);
                // Record payroll as an expense transaction in the Ledger
                addTransaction({
                  id: `TX-${String(Date.now()).slice(-6)}`,
                  date: localDateStr(),
                  type: "Expense",
                  category: "Salary",
                  description: `Payroll for ${month} — ${filteredEmployees.length} employees`,
                  amount: totalNet,
                  mode: "Bank",
                });
                toast({ title: "Payroll Finalized ✓", description: `${filteredEmployees.length} slips generated • Rs. ${totalNet.toLocaleString()} recorded in Ledger.` });
              } catch (e) {
                toast({ title: "Generation failed", description: "Could not generate payroll PDF.", variant: "destructive" });
              }
            }}
          >
            <Printer className="w-4 h-4 mr-1.5" />Finalize & Generate Slips
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead>ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-center">Att. Summary</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Payable</TableHead>
                <TableHead className="text-right">Slip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(emp => {
                const calc = calculate(emp);
                const totalDays = emp.attendance.present + emp.attendance.late + emp.attendance.halfDay + emp.attendance.absent + emp.attendance.leave;
                return (
                  <TableRow key={emp.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{emp.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-semibold bg-accent/15 text-accent">
                            {emp.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{emp.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{emp.dept || "—"}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{emp.designation}</TableCell>
                    <TableCell className="text-right font-medium text-sm">Rs. {emp.monthlySalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700">{emp.attendance.present}P</span>
                        {emp.attendance.late > 0 && <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-700">{emp.attendance.late}L</span>}
                        {emp.attendance.absent > 0 && <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-700">{emp.attendance.absent}A</span>}
                        {emp.attendance.halfDay > 0 && <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-700">{emp.attendance.halfDay}H</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {calc.totalDeduction > 0 ? (
                        <span className="text-red-600 font-medium text-sm">-Rs. {calc.totalDeduction.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right"><span className="font-bold text-sm text-emerald-600">Rs. {calc.net.toLocaleString()}</span></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(emp)}>
                        <Printer className="w-3 h-3 mr-1" />View Slip
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Salary slip dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Printer className="w-4 h-4 text-primary" />Salary Slip — {month}</DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const calc = calculate(selected);
            return (
              <div className="space-y-2 py-1">
                {/* Slip header */}
                <div className="rounded-lg bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{school.name}</p>
                      <p className="text-[10px] opacity-80">Salary Slip • {month}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-80">Slip No.</p>
                      <p className="text-xs font-mono">SLIP-{month.replace(/[^a-zA-Z0-9]/g, "")}-{selected.id.slice(-4)}</p>
                    </div>
                  </div>
                </div>

                {/* Employee info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/30 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Employee</p>
                    <p className="font-medium">{selected.name}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Designation</p>
                    <p className="font-medium">{selected.designation}</p>
                  </div>
                </div>

                {/* Breakdown table */}
                <div className="rounded-lg border border-border/40 overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-border/30">
                        <td className="p-2 text-muted-foreground">Gross Monthly Salary</td>
                        <td className="p-2 text-right font-medium">Rs. {calc.gross.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <td className="p-2 text-muted-foreground">Working Days</td>
                        <td className="p-2 text-right">{WORKING_DAYS}</td>
                      </tr>
                      <tr className="border-b border-border/30 bg-muted/20">
                        <td className="p-2 text-muted-foreground">Per-Day Salary</td>
                        <td className="p-2 text-right">Rs. {calc.perDay.toLocaleString()}</td>
                      </tr>
                      {calc.absentDeduction > 0 && (
                        <tr className="border-b border-border/30">
                          <td className="p-2 text-muted-foreground">Absent Deduction ({selected.attendance.absent} × Rs. {calc.perDay.toLocaleString()})</td>
                          <td className="p-2 text-right text-red-600">-Rs. {calc.absentDeduction.toLocaleString()}</td>
                        </tr>
                      )}
                      {calc.lateDeduction > 0 && (
                        <tr className="border-b border-border/30">
                          <td className="p-2 text-muted-foreground">Late Deduction ({selected.attendance.late} × Rs. {LATE_FINE})</td>
                          <td className="p-2 text-right text-red-600">-Rs. {calc.lateDeduction.toLocaleString()}</td>
                        </tr>
                      )}
                      {calc.halfDayDeduction > 0 && (
                        <tr className="border-b border-border/30">
                          <td className="p-2 text-muted-foreground">Half-Day Deduction ({selected.attendance.halfDay} × 50%)</td>
                          <td className="p-2 text-right text-red-600">-Rs. {calc.halfDayDeduction.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="bg-primary/10">
                        <td className="p-2 font-semibold">Net Payable</td>
                        <td className="p-2 text-right font-bold text-primary text-base">Rs. {calc.net.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                  Amount in words: <span className="font-medium italic">Rs. {numberToWords(calc.net)} only</span>
                </p>

                <div className="flex justify-between text-[10px] text-muted-foreground pt-3 border-t border-border/30">
                  <div className="text-center">
                    <div className="h-8" />
                    <p>Employee Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="h-8" />
                    <p>Authorized Signatory</p>
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => {
              if (!selected) return;
              const calc = calculate(selected);
              const slipNo = `SLIP-${month.replace(/[^a-zA-Z0-9]/g, "")}-${String(Date.now()).slice(-6)}`;
              toast({ title: "Opening salary slip PDF...", description: slipNo });
              printSalarySlip(selected, month, calc, slipNo, school);
              // Record salary payment as an expense in the Ledger
              addTransaction({
                id: `TX-${String(Date.now()).slice(-6)}`,
                date: localDateStr(),
                type: "Expense",
                category: "Salary",
                description: `Salary — ${selected.name} (${month})`,
                amount: calc.net,
                mode: "Bank",
              });
            }}>
              <Printer className="w-4 h-4 mr-1.5" />Print Slip (PDF)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  if (num < 0) return "Minus " + numberToWords(Math.abs(num));

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function twoDigits(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }
  function threeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const r = n % 100;
    let s = "";
    if (h > 0) s += ones[h] + " Hundred";
    if (r > 0) s += (h > 0 ? " " : "") + twoDigits(r);
    return s;
  }

  // South Asian numbering: crore (10,000,000) → lakh (100,000) → thousand (1,000) → remainder
  const crores = Math.floor(num / 10000000);
  const afterCrore = num % 10000000;
  const lakhs = Math.floor(afterCrore / 100000);
  const afterLakh = afterCrore % 100000;
  const thousands = Math.floor(afterLakh / 1000);
  const remainder = afterLakh % 1000;

  let result = "";
  if (crores > 0) result += twoDigits(crores) + " Crore";
  if (lakhs > 0) result += (result ? " " : "") + twoDigits(lakhs) + " Lakh";
  if (thousands > 0) result += (result ? " " : "") + twoDigits(thousands) + " Thousand";
  if (remainder > 0) result += (result ? " " : "") + threeDigits(remainder);
  return result.trim();
}
