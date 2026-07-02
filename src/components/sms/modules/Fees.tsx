"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/sms-store";
import {
  Search, DollarSign, Receipt, Printer, AlertTriangle, Filter,
  CheckCircle2, Clock, TrendingUp, Wallet, FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function FeesModule() {
  const { students, feeCollections, collectFee, searchQuery } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof students[0] | null>(null);
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<"Cash" | "Cheque" | "Bank Transfer">("Cash");
  const [feeType, setFeeType] = useState("Monthly Tuition");

  const filtered = useMemo(() => {
    const q = (search || searchQuery).toLowerCase();
    return students.filter(s =>
      s.status === "Active" &&
      (!q || `${s.name} ${s.id} ${s.fatherName} ${s.fatherPhone}`.toLowerCase().includes(q))
    );
  }, [students, search, searchQuery]);

  const openCollect = (s: typeof students[0]) => {
    setSelected(s);
    setAmount(s.outstandingAmount || s.monthlyFee);
  };

  const submit = () => {
    if (!selected) return;
    collectFee(selected.id, amount, mode, feeType);
    toast({
      title: "Fee Collected ✓",
      description: `Rs. ${amount.toLocaleString()} from ${selected.name}. Receipt printed.`,
    });
    setSelected(null);
  };

  const todayCollections = feeCollections.filter(f => f.date === new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Collected Today</p>
            <p className="text-xl font-bold">Rs. {todayCollections.reduce((s, f) => s + f.amount, 0).toLocaleString()}</p>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Receipt className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Receipts Today</p>
            <p className="text-xl font-bold">{todayCollections.length}</p>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><Wallet className="w-5 h-5 text-accent" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <p className="text-xl font-bold">Rs. {students.reduce((s, st) => s + st.outstandingAmount, 0).toLocaleString()}</p>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Defaulters</p>
            <p className="text-xl font-bold">{students.filter(s => s.outstandingAmount > 0).length}</p>
          </div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Student lookup */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card">
          <div className="p-4 border-b border-border/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search student to collect fee (name, ID, phone)..."
                className="pl-9 bg-background/60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filtered.slice(0, 12).map(s => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 border-b border-border/20 hover:bg-muted/30 cursor-pointer"
                onClick={() => openCollect(s)}
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className={cn("text-xs font-semibold", s.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                    {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.id} • {s.class}-{s.section} • Roll #{s.rollNo}</p>
                </div>
                <div className="text-right">
                  {s.outstandingAmount > 0 ? (
                    <Badge variant="destructive" className="text-[10px]">Rs. {s.outstandingAmount.toLocaleString()}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">Paid</Badge>
                  )}
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs">Collect</Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No students found.</div>
            )}
          </div>
        </Card>

        {/* Recent receipts */}
        <Card className="border-0 shadow-sm glass-card">
          <div className="p-4 border-b border-border/30 flex items-center justify-between">
            <p className="text-sm font-semibold">Recent Receipts</p>
            <Button variant="ghost" size="sm" className="h-7 text-xs"><FileDown className="w-3 h-3 mr-1" />Export</Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {feeCollections.slice(0, 8).map(f => (
              <div key={f.id} className="p-3 border-b border-border/20 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">{f.receiptNo}</p>
                    <p className="text-sm font-medium truncate mt-0.5">{f.studentName}</p>
                    <p className="text-[10px] text-muted-foreground">{f.class} • {f.feeType} • {f.mode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-emerald-600">Rs. {f.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{f.date.slice(5)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Collect dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-600" />Collect Fee</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/30 p-3 space-y-1">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs font-semibold bg-primary/15 text-primary">
                      {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">{selected.id} • {selected.class}-{selected.section}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Monthly Fee:</span> <span className="font-medium">Rs. {selected.monthlyFee.toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Outstanding:</span> <span className="font-medium text-red-600">Rs. {selected.outstandingAmount.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Fee Type</label>
                <Select value={feeType} onValueChange={setFeeType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly Tuition">Monthly Tuition</SelectItem>
                    <SelectItem value="Exam Fee">Exam Fee</SelectItem>
                    <SelectItem value="Admission Fee">Admission Fee</SelectItem>
                    <SelectItem value="Transport Fee">Transport Fee</SelectItem>
                    <SelectItem value="Other Charges">Other Charges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Amount (Rs.)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Payment Mode</label>
                <Select value={mode} onValueChange={(v: "Cash" | "Cheque" | "Bank Transfer") => setMode(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary">Receipt Preview:</p>
                <p className="text-muted-foreground mt-1">
                  RCPT-20260702-{String(feeCollections.length + 1).padStart(3, "0")} • Auto-generated • Printable on A5 / 80mm thermal
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={submit} className="bg-emerald-600 hover:bg-emerald-700">
              <Receipt className="w-4 h-4 mr-1.5" />Collect & Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DefaultersModule() {
  const { students, setActiveModule, setSelectedStudent } = useAppStore();
  const [classFilter, setClassFilter] = useState("all");

  const defaulters = useMemo(() => {
    return students
      .filter(s => s.outstandingAmount > 0 && s.status === "Active")
      .filter(s => classFilter === "all" || s.class === classFilter)
      .sort((a, b) => b.outstandingAmount - a.outstandingAmount);
  }, [students, classFilter]);

  const totalOutstanding = defaulters.reduce((s, d) => s + d.outstandingAmount, 0);
  const classes = Array.from(new Set(students.map(s => s.class)));

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Defaulters</p><p className="text-xl font-bold">{defaulters.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><Wallet className="w-5 h-5 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold">Rs. {totalOutstanding.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-yellow-500/10 p-2"><Clock className="w-5 h-5 text-yellow-600" /></div>
          <div><p className="text-xs text-muted-foreground">Avg Outstanding</p><p className="text-xl font-bold">Rs. {defaulters.length > 0 ? Math.round(totalOutstanding / defaulters.length).toLocaleString() : 0}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Collection Rate</p><p className="text-xl font-bold">{Math.round((1 - defaulters.length / students.length) * 100)}%</p></div>
        </CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-40 bg-background/60"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FileDown className="w-4 h-4 mr-1.5" />Export Excel</Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90"><Printer className="w-4 h-4 mr-1.5" />Print Defaulter List</Button>
        </div>
      </div>

      {/* Defaulter table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Father</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Unpaid Months</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaulters.map((d, i) => (
                <TableRow key={d.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={cn("text-xs font-semibold", d.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                          {d.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{d.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{d.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{d.class}-{d.section}</Badge></TableCell>
                  <TableCell className="text-sm">{d.fatherName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.fatherPhone}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs bg-red-500/5">{Math.ceil(d.outstandingAmount / d.monthlyFee)} month{Math.ceil(d.outstandingAmount / d.monthlyFee) > 1 ? "s" : ""}</Badge></TableCell>
                  <TableCell className="text-right"><span className="font-bold text-red-600">Rs. {d.outstandingAmount.toLocaleString()}</span></TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                      onClick={() => {
                        setSelectedStudent(d.id);
                        setActiveModule("fees");
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />Collect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {defaulters.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <p className="font-semibold text-sm">No defaulters!</p>
            <p className="text-xs text-muted-foreground mt-1">All students have paid their fees.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
