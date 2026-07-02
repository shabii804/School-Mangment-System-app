"use client";

import { useState } from "react";
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
import { TEACHERS, STAFF } from "@/lib/sms-data";
import {
  Wallet, Calculator, Printer, FileDown, CheckCircle2,
  TrendingDown, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const WORKING_DAYS = 26;
const LATE_FINE = 500;

interface SalaryRow {
  id: string;
  name: string;
  designation: string;
  monthlySalary: number;
  attendance: { present: number; late: number; halfDay: number; absent: number; leave: number };
}

export function SalaryModule() {
  const { toast } = useToast();
  const [month, setMonth] = useState("July 2026");
  const [selected, setSelected] = useState<SalaryRow | null>(null);

  const allEmployees: SalaryRow[] = [
    ...TEACHERS.map(t => ({ id: t.id, name: t.name, designation: t.designation, monthlySalary: t.monthlySalary, attendance: t.attendance })),
    ...STAFF.map(s => ({ id: s.id, name: s.name, designation: s.designation, monthlySalary: s.monthlySalary, attendance: s.attendance })),
  ];

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
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Wallet className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total Payroll</p><p className="text-xl font-bold">Rs. {(allEmployees.reduce((s, e) => s + e.monthlySalary, 0) / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2"><TrendingDown className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Fines</p><p className="text-xl font-bold">Rs. {allEmployees.reduce((s, e) => s + calculate(e).totalDeduction, 0).toLocaleString()}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Net Payable</p><p className="text-xl font-bold">Rs. {(allEmployees.reduce((s, e) => s + calculate(e).net, 0) / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><AlertCircle className="w-5 h-5 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Employees</p><p className="text-xl font-bold">{allEmployees.length}</p></div>
        </CardContent></Card>
      </div>

      {/* Worked example banner */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><Calculator className="w-5 h-5 text-primary" /></div>
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
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-44 bg-background/60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="July 2026">July 2026</SelectItem>
            <SelectItem value="June 2026">June 2026</SelectItem>
            <SelectItem value="May 2026">May 2026</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FileDown className="w-4 h-4 mr-1.5" />Export</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90"
            onClick={() => toast({ title: "All Salary Slips Generated", description: `${allEmployees.length} slips for ${month}.` })}
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
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-center">Att. Summary</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Payable</TableHead>
                <TableHead className="text-right">Slip</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allEmployees.map(emp => {
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Printer className="w-5 h-5 text-primary" />Salary Slip — {month}</DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const calc = calculate(selected);
            return (
              <div className="space-y-3 py-2">
                {/* Slip header */}
                <div className="rounded-lg bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Greenwood Public School</p>
                      <p className="text-[10px] opacity-80">Salary Slip • {month}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-80">Slip No.</p>
                      <p className="text-xs font-mono">SLIP-202607-{selected.id.slice(-3)}</p>
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
            <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Sending to printer...", description: "Salary slip queued for A4 PDF print." })}>
              <Printer className="w-4 h-4 mr-1.5" />Print Slip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
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

  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;
  let result = "";
  if (thousands > 0) result += twoDigits(thousands) + " Thousand";
  if (remainder > 0) result += (thousands > 0 ? " " : "") + threeDigits(remainder);
  return result.trim();
}
