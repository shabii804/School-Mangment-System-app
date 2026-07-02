"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/lib/sms-store";
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
import {
  Search, DollarSign, Receipt, Printer, AlertTriangle, Filter,
  CheckCircle2, Clock, TrendingUp, Wallet, FileDown, Home, BookOpen,
  GraduationCap, IdCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { printFeeReceipt, printDefaulterList, printFeeCollectionReport } from "@/lib/pdf-service";

// Hostel fee constant
const HOSTEL_FEE = 3500;

export function FeesModule() {
  const { students, feeCollections, collectFee, searchQuery, selectedStudentId, school } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof students[0] | null>(null);

  // Breakdown state — combine tuition + hostel in one receipt
  const [includeTuition, setIncludeTuition] = useState(true);
  const [includeHostel, setIncludeHostel] = useState(false);
  const [includeAdmission, setIncludeAdmission] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(""); // manual entry
  const [useCustom, setUseCustom] = useState(false);
  const [mode, setMode] = useState<"Cash" | "Cheque" | "Bank Transfer">("Cash");

  const filtered = useMemo(() => {
    const q = (search || searchQuery).toLowerCase();
    return students.filter(s =>
      s.status === "Active" &&
      (!q || `${s.name} ${s.id} ${s.fatherName} ${s.fatherPhone}`.toLowerCase().includes(q))
    );
  }, [students, search, searchQuery]);

  // Auto-select student from cross-module navigation (defaulters → collect)
  useEffect(() => {
    if (selectedStudentId) {
      const s = students.find(st => st.id === selectedStudentId);
      if (s) {
        setSelected(s);
        setIncludeTuition(true);
        setIncludeHostel(s.isHosteller);
        setIncludeAdmission(false);
      }
    }
  }, [selectedStudentId, students]);

  const openCollect = (s: typeof students[0]) => {
    setSelected(s);
    setIncludeTuition(true);
    setIncludeHostel(s.isHosteller);
    setIncludeAdmission(false);
    setUseCustom(false);
    setCustomAmount("");
  };

  const tuitionAmt = includeTuition ? selected?.monthlyFee || 0 : 0;
  const hostelAmt = includeHostel && selected?.isHosteller ? HOSTEL_FEE : 0;
  const admissionAmt = includeAdmission ? (selected?.monthlyFee || 0) * 3 : 0;
  const checkboxTotal = tuitionAmt + hostelAmt + admissionAmt;
  const customAmt = useCustom && customAmount ? parseInt(customAmount) || 0 : 0;
  const total = useCustom ? customAmt : checkboxTotal;

  const feeTypeLabel = useCustom
    ? "Manual Entry"
    : [
        includeTuition && "Tuition",
        includeHostel && "Hostel",
        includeAdmission && "Admission",
      ].filter(Boolean).join(" + ") || "Tuition";

  const submit = async () => {
    if (!selected) return;
    if (total === 0) {
      toast({ title: "Select a fee type", description: "Please check at least one fee to collect.", variant: "destructive" });
      return;
    }
    collectFee(
      selected.id,
      total,
      mode,
      feeTypeLabel,
      useCustom
        ? undefined // no breakdown for manual entry
        : { tuition: tuitionAmt || undefined, hostel: hostelAmt || undefined, admission: admissionAmt || undefined }
    );

    // Find the just-created collection (most recent)
    const newCollection = {
      id: `FC-${String(feeCollections.length + 1).padStart(4, "0")}`,
      receiptNo: `RCPT-20260702-${String(feeCollections.length + 1).padStart(3, "0")}`,
      studentId: selected.id,
      studentName: selected.name,
      class: selected.class,
      date: new Date().toISOString().split("T")[0],
      amount: total,
      mode,
      tuition: useCustom ? undefined : (tuitionAmt || undefined),
      hostel: useCustom ? undefined : (hostelAmt || undefined),
      admission: useCustom ? undefined : (admissionAmt || undefined),
      feeType: feeTypeLabel,
    };

    toast({
      title: "Fee Collected ✓",
      description: `Rs. ${total.toLocaleString()} from ${selected.name}. Opening print preview...`,
    });

    // Open real PDF receipt in new tab
    try {
      await printFeeReceipt(newCollection, selected, school);
    } catch (e) {
      toast({ title: "Print failed", description: "Could not generate PDF.", variant: "destructive" });
    }

    setSelected(null);
  };

  const reprintReceipt = async (f: typeof feeCollections[0]) => {
    const student = students.find(s => s.id === f.studentId);
    toast({ title: "Opening receipt...", description: f.receiptNo });
    try {
      await printFeeReceipt(f, student, school);
    } catch {
      toast({ title: "Print failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  const todayCollections = feeCollections.filter(f => f.date === new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-4 fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Collected Today</p>
            <p className="text-xl font-bold">Rs. {todayCollections.reduce((s, f) => s + f.amount, 0).toLocaleString()}</p>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2"><Receipt className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Receipts Today</p>
            <p className="text-xl font-bold">{todayCollections.length}</p>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><Wallet className="w-5 h-5 text-accent" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
            <p className="text-xl font-bold">Rs. {students.reduce((s, st) => s + st.outstandingAmount, 0).toLocaleString()}</p>
          </div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
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
                className="flex items-center gap-3 p-3 border-b border-border/20 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => openCollect(s)}
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className={cn("text-xs font-semibold", s.gender === "Male" ? "bg-primary/15 text-primary" : "bg-purple-500/15 text-purple-600")}>
                    {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate flex items-center gap-2">
                    {s.name}
                    {s.isHosteller && (
                      <Badge variant="outline" className="text-[9px] bg-accent/10 text-accent border-0 px-1 py-0">
                        <Home className="w-2.5 h-2.5 mr-0.5" />Hostel
                      </Badge>
                    )}
                  </p>
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
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                toast({ title: "Generating report...", description: "Opening PDF..." });
                printFeeCollectionReport(feeCollections.slice(0, 20), school);
              }}
            >
              <FileDown className="w-3 h-3 mr-1" />Report
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {feeCollections.slice(0, 10).map(f => (
              <div key={f.id} className="p-3 border-b border-border/20 hover:bg-muted/30 group">
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
                <button
                  onClick={() => reprintReceipt(f)}
                  className="mt-1.5 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline"
                >
                  <Printer className="w-2.5 h-2.5" />Reprint Receipt
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Collect dialog with combined fee breakdown */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-600" />Collect Fee</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              {/* Student info */}
              <div className="rounded-lg bg-muted/30 p-3 space-y-1">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs font-semibold bg-primary/15 text-primary">
                      {selected.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      {selected.name}
                      {selected.isHosteller && (
                        <Badge variant="outline" className="text-[9px] bg-accent/10 text-accent border-0 px-1 py-0">
                          <Home className="w-2.5 h-2.5 mr-0.5" />Hosteller
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{selected.id} • {selected.class}-{selected.section}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Monthly Fee:</span> <span className="font-medium">Rs. {selected.monthlyFee.toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Outstanding:</span> <span className="font-medium text-red-600">Rs. {selected.outstandingAmount.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Fee breakdown — checkboxes for combined collection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Select Fees to Collect</label>
                  <button
                    type="button"
                    onClick={() => setUseCustom(!useCustom)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                      useCustom
                        ? "bg-accent/10 text-accent border-accent/30"
                        : "bg-muted text-muted-foreground border-border/40 hover:border-accent/30"
                    )}
                  >
                    {useCustom ? "✓ Manual Entry" : "Manual Entry"}
                  </button>
                </div>

                {!useCustom && (
                  <div className="space-y-1.5">
                    {/* Tuition */}
                    <button
                      type="button"
                      onClick={() => setIncludeTuition(!includeTuition)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                        includeTuition ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/30"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                        includeTuition ? "bg-primary border-primary" : "border-border")}>
                        {includeTuition && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Tuition Fee</p>
                          <p className="text-[10px] text-muted-foreground">Monthly</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">Rs. {selected.monthlyFee.toLocaleString()}</p>
                    </button>

                    {/* Hostel — only if hosteller */}
                    {selected.isHosteller && (
                      <button
                        type="button"
                        onClick={() => setIncludeHostel(!includeHostel)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                          includeHostel ? "border-accent bg-accent/5" : "border-border/40 hover:border-accent/30"
                        )}
                      >
                        <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                          includeHostel ? "bg-accent border-accent" : "border-border")}>
                          {includeHostel && <CheckCircle2 className="w-3.5 h-3.5 text-accent-foreground" />}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <Home className="w-4 h-4 text-accent" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Hostel Fee</p>
                            <p className="text-[10px] text-muted-foreground">Monthly (boarding + meals)</p>
                          </div>
                        </div>
                        <p className="font-bold text-sm">Rs. {HOSTEL_FEE.toLocaleString()}</p>
                      </button>
                    )}

                    {/* Admission */}
                    <button
                      type="button"
                      onClick={() => setIncludeAdmission(!includeAdmission)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                        includeAdmission ? "border-purple-500 bg-purple-500/5" : "border-border/40 hover:border-purple-500/30"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                        includeAdmission ? "bg-purple-500 border-purple-500" : "border-border")}>
                        {includeAdmission && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-500" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Admission Fee</p>
                          <p className="text-[10px] text-muted-foreground">One-time (3 × monthly)</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">Rs. {(selected.monthlyFee * 3).toLocaleString()}</p>
                    </button>
                  </div>
                )}

                {/* Manual amount entry */}
                {useCustom && (
                  <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      <p className="text-sm font-medium text-accent">Manual Amount Entry</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Enter any custom amount (e.g., partial payment, fine, or other charge)</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rs.</span>
                      <Input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="0"
                        className="pl-10 text-lg font-bold h-12"
                        autoFocus
                      />
                    </div>
                    {/* Quick amount buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {[500, 1000, 1500, 2000, 3000, 5000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCustomAmount(String(amt))}
                          className="px-2 py-1 text-[10px] rounded-md border border-border/40 bg-background hover:bg-accent/10 hover:border-accent/30 transition-colors"
                        >
                          {amt.toLocaleString()}
                        </button>
                      ))}
                      {selected.outstandingAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => setCustomAmount(String(selected.outstandingAmount))}
                          className="px-2 py-1 text-[10px] rounded-md border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                        >
                          Full Outstanding ({selected.outstandingAmount.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-primary">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">Rs. {total.toLocaleString()}</p>
                </div>
                <div className="space-y-0.5 text-[10px] text-muted-foreground">
                  {useCustom ? (
                    <div className="flex justify-between"><span>Manual Entry:</span><span>Rs. {customAmt.toLocaleString()}</span></div>
                  ) : (
                    <>
                      {tuitionAmt > 0 && <div className="flex justify-between"><span>Tuition:</span><span>Rs. {tuitionAmt.toLocaleString()}</span></div>}
                      {hostelAmt > 0 && <div className="flex justify-between"><span>Hostel:</span><span>Rs. {hostelAmt.toLocaleString()}</span></div>}
                      {admissionAmt > 0 && <div className="flex justify-between"><span>Admission:</span><span>Rs. {admissionAmt.toLocaleString()}</span></div>}
                    </>
                  )}
                </div>
              </div>

              {/* Payment mode */}
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

              <div className="rounded-lg bg-muted/30 p-2 text-xs flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">
                  Receipt <span className="font-mono font-medium text-foreground">RCPT-20260702-{String(feeCollections.length + 1).padStart(3, "0")}</span> will open in a new tab for printing.
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={submit} className="bg-emerald-600 hover:bg-emerald-700" disabled={total === 0}>
              <Printer className="w-4 h-4 mr-1.5" />Collect & Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DefaultersModule() {
  const { students, setActiveModule, setSelectedStudent, school } = useAppStore();
  const { toast } = useToast();
  const [classFilter, setClassFilter] = useState("all");

  const defaulters = useMemo(() => {
    return students
      .filter(s => s.outstandingAmount > 0 && s.status === "Active")
      .filter(s => classFilter === "all" || s.class === classFilter)
      .sort((a, b) => b.outstandingAmount - a.outstandingAmount);
  }, [students, classFilter]);

  const totalOutstanding = defaulters.reduce((s, d) => s + d.outstandingAmount, 0);
  const classes = Array.from(new Set(students.map(s => s.class)));

  const handlePrint = () => {
    toast({ title: "Generating defaulter list PDF...", description: `${defaulters.length} defaulters • Rs. ${totalOutstanding.toLocaleString()} outstanding` });
    printDefaulterList(defaulters, school, { class: classFilter === "all" ? undefined : classFilter });
  };

  return (
    <div className="space-y-4 fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-red-500/10 p-2"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs text-muted-foreground">Total Defaulters</p><p className="text-xl font-bold">{defaulters.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-2"><Wallet className="w-5 h-5 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold">Rs. {totalOutstanding.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-yellow-500/10 p-2"><Clock className="w-5 h-5 text-yellow-600" /></div>
          <div><p className="text-xs text-muted-foreground">Avg Outstanding</p><p className="text-xl font-bold">Rs. {defaulters.length > 0 ? Math.round(totalOutstanding / defaulters.length).toLocaleString() : 0}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card card-hover"><CardContent className="p-4 flex items-center gap-3">
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
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />Print Defaulter List
          </Button>
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
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          {d.name}
                          {d.isHosteller && <Home className="w-3 h-3 text-accent" />}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">{d.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{d.class}-{d.section}</Badge></TableCell>
                  <TableCell className="text-sm">{d.fatherName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.fatherPhone}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs bg-red-500/5">{Math.ceil(d.outstandingAmount / (d.monthlyFee + (d.isHosteller ? HOSTEL_FEE : 0)))} month(s)</Badge></TableCell>
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
