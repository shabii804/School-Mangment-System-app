"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/sms-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, ArrowDownCircle,
  ArrowUpCircle, DollarSign, FileDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function LedgerModule() {
  const { transactions, addTransaction, deleteTransaction } = useAppStore();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "Income" | "Expense">("all");
  const [form, setForm] = useState({
    type: "Income" as "Income" | "Expense",
    category: "Fee Collection",
    description: "",
    amount: 0,
    mode: "Cash" as "Cash" | "Bank" | "Cheque",
    date: new Date().toISOString().split("T")[0],
  });

  const filtered = transactions.filter(t => filter === "all" || t.type === filter);
  const totalIncome = transactions.filter(t => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Chart data: group by category
  const categoryData = useMemo(() => {
    const incomeCats: Record<string, number> = {};
    const expenseCats: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === "Income") incomeCats[t.category] = (incomeCats[t.category] || 0) + t.amount;
      else expenseCats[t.category] = (expenseCats[t.category] || 0) + t.amount;
    });
    return {
      income: Object.entries(incomeCats).map(([name, value]) => ({ name, value })),
      expense: Object.entries(expenseCats).map(([name, value]) => ({ name, value })),
    };
  }, [transactions]);

  // Monthly trend
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!months[month]) months[month] = { income: 0, expense: 0 };
      if (t.type === "Income") months[month].income += t.amount;
      else months[month].expense += t.amount;
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, data]) => ({
      month: month.slice(5) + "/" + month.slice(2, 4),
      Income: data.income,
      Expense: data.expense,
      Profit: data.income - data.expense,
    }));
  }, [transactions]);

  const PIE_COLORS = ["#15857A", "#FF6A3B", "#6366F1", "#EAB308", "#EC4899", "#14B8A6", "#8B5CF6", "#F59E0B"];

  const handleAdd = () => {
    if (!form.description || form.amount <= 0) return;
    addTransaction({
      id: `TX-${String(Date.now()).slice(-6)}`,
      ...form,
    });
    setAddOpen(false);
    setForm({ type: "Income", category: "Fee Collection", description: "", amount: 0, mode: "Cash", date: new Date().toISOString().split("T")[0] });
    toast({ title: "Transaction Added ✓", description: `${form.type}: Rs. ${form.amount.toLocaleString()}` });
  };

  const incomeCategories = ["Fee Collection", "Admission Fee", "Hostel Fee", "Transport Fee", "Donation", "Other Income"];
  const expenseCategories = ["Salary", "Utilities", "Maintenance", "Stationery", "Transport", "Rent", "Marketing", "Other Expense"];

  return (
    <div className="space-y-3 fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Income</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">Rs. {totalIncome.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{transactions.filter(t => t.type === "Income").length} transactions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm glass-card card-hover">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Expense</p>
                <p className="text-2xl font-bold text-red-600 mt-1">Rs. {totalExpense.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{transactions.filter(t => t.type === "Expense").length} transactions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn("border-0 shadow-sm glass-card card-hover", balance >= 0 ? "ring-1 ring-emerald-500/20" : "ring-1 ring-red-500/20")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Balance</p>
                <p className={cn("text-2xl font-bold mt-1", balance >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {balance >= 0 ? "+" : "-"}Rs. {Math.abs(balance).toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">{balance >= 0 ? "Profit" : "Loss"}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", balance >= 0 ? "bg-emerald-500/10" : "bg-red-500/10")}>
                <Wallet className={cn("w-6 h-6", balance >= 0 ? "text-emerald-600" : "text-red-600")} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Income vs Expense */}
        <Card className="lg:col-span-2 border-0 shadow-sm glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Income vs Expense Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 95)" vertical={false} />
                <XAxis dataKey="month" stroke="oklch(0.5 0.015 200)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.015 200)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="#15857A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#FF6A3B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense breakdown pie */}
        <Card className="border-0 shadow-sm glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Expense by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData.expense} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                  {categoryData.expense.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 95)", border: "1px solid oklch(0.88 0.015 95)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `Rs. ${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setFilter("all")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted")}>All</button>
          <button onClick={() => setFilter("Income")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === "Income" ? "bg-emerald-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted")}>Income Only</button>
          <button onClick={() => setFilter("Expense")} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === "Expense" ? "bg-red-600 text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted")}>Expense Only</button>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Transaction</Button>
      </div>

      {/* Transactions table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] border-0", t.type === "Income" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                      {t.type === "Income" ? <ArrowDownCircle className="w-2.5 h-2.5 mr-0.5" /> : <ArrowUpCircle className="w-2.5 h-2.5 mr-0.5" />}
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t.category}</Badge></TableCell>
                  <TableCell className="text-sm">{t.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.mode}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-bold text-sm", t.type === "Income" ? "text-emerald-600" : "text-red-600")}>
                      {t.type === "Income" ? "+" : "-"}Rs. {t.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" aria-label={`Delete transaction ${t.description}`} title="Delete" onClick={() => {
                      if (window.confirm(`Delete this transaction?\n\n"${t.description}" — Rs. ${t.amount.toLocaleString()}\n\nThis action cannot be undone.`)) {
                        deleteTransaction(t.id);
                        toast({ title: "Transaction Deleted", description: t.description, variant: "destructive" });
                      }
                    }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">No transactions found.</div>
        )}
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
          {/* Gradient hero header — color depends on type */}
          <div className={cn(
            "relative overflow-hidden rounded-t-xl px-5 py-4 text-white transition-colors",
            form.type === "Income"
              ? "bg-gradient-to-br from-emerald-600 via-emerald-700 to-primary/70"
              : "bg-gradient-to-br from-red-500 via-red-600 to-accent/70"
          )}>
            <div className="absolute inset-0 opacity-10 pattern-grid" />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
                {form.type === "Income" ? <ArrowDownCircle className="w-6 h-6" /> : <ArrowUpCircle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">Add {form.type}</h2>
                <p className="text-xs text-white/75 mt-0.5">Record a new {form.type.toLowerCase()} transaction for the ledger.</p>
              </div>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase tracking-wider text-white/60">Today</span>
                <span className="text-sm font-semibold mt-0.5">{new Date().toISOString().split("T")[0]}</span>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-5 py-4 space-y-3">
            {/* ─── Section 1: Type Toggle ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/30">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Transaction Type</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Income or expense</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setForm({...form, type: "Income", category: incomeCategories[0]})}
                  className={cn("flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                    form.type === "Income" ? "border-emerald-500 bg-emerald-500/5" : "border-border/40 hover:border-emerald-500/40")}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", form.type === "Income" ? "bg-emerald-500/15" : "bg-muted")}>
                    <ArrowDownCircle className={cn("w-5 h-5", form.type === "Income" ? "text-emerald-600" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", form.type === "Income" ? "text-emerald-600" : "text-muted-foreground")}>Income</p>
                    <p className="text-[10px] text-muted-foreground">Money received</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({...form, type: "Expense", category: expenseCategories[0]})}
                  className={cn("flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                    form.type === "Expense" ? "border-red-500 bg-red-500/5" : "border-border/40 hover:border-red-500/40")}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", form.type === "Expense" ? "bg-red-500/15" : "bg-muted")}>
                    <ArrowUpCircle className={cn("w-5 h-5", form.type === "Expense" ? "text-red-600" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", form.type === "Expense" ? "text-red-600" : "text-muted-foreground")}>Expense</p>
                    <p className="text-[10px] text-muted-foreground">Money spent</p>
                  </div>
                </button>
              </div>
            </div>

            {/* ─── Section 2: Details ─── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 border-b",
                form.type === "Income"
                  ? "bg-emerald-500/5 border-emerald-500/15"
                  : "bg-red-500/5 border-red-500/15"
              )}>
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center",
                  form.type === "Income" ? "bg-emerald-500/15" : "bg-red-500/15"
                )}>
                  <DollarSign className={cn("w-3.5 h-3.5", form.type === "Income" ? "text-emerald-600" : "text-red-600")} />
                </div>
                <p className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  form.type === "Income" ? "text-emerald-600" : "text-red-600"
                )}>Transaction Details</p>
                <span className="ml-auto text-[10px] text-muted-foreground">Amount, category & date</span>
              </div>
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(form.type === "Income" ? incomeCategories : expenseCategories).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-9" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Description <span className="text-red-500">*</span></Label>
                  <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g., Monthly tuition fees — July" className="h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Amount (Rs.) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <DollarSign className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5", form.type === "Income" ? "text-emerald-600" : "text-red-600")} />
                    <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} placeholder="0" className="h-10 pl-8 text-lg font-bold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Payment Mode</Label>
                  <Select value={form.mode} onValueChange={(v: any) => setForm({...form, mode: v})}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Summary banner */}
            <div className={cn(
              "rounded-lg border p-2.5 flex items-start gap-2",
              form.type === "Income"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                form.type === "Income" ? "bg-emerald-500/15" : "bg-red-500/15"
              )}>
                {form.type === "Income"
                  ? <TrendingUp className="w-3 h-3 text-emerald-600" />
                  : <TrendingDown className="w-3 h-3 text-red-600" />}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className={cn("font-semibold", form.type === "Income" ? "text-emerald-600" : "text-red-600")}>
                  {form.type === "Income" ? "Income" : "Expense"}:
                </span> {form.amount > 0 ? <>This will <span className="font-semibold text-foreground">{form.type === "Income" ? "add to" : "deduct from"}</span> your cash balance by <span className="font-semibold text-foreground">Rs. {form.amount.toLocaleString()}</span>.</> : "Enter an amount to see the impact."}
              </p>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/60 px-5 py-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="h-9">Cancel</Button>
              <Button
                className={cn("h-9 px-5 shadow-md", form.type === "Income" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700")}
                onClick={handleAdd}
                disabled={!form.description || form.amount <= 0}
              >
                <Plus className="w-4 h-4 mr-1.5" />Add {form.type}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
