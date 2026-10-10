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
      id: `TX-${String(transactions.length + 1).padStart(3, "0")}`,
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
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" onClick={() => deleteTransaction(t.id)}>
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
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-1">
            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setForm({...form, type: "Income", category: incomeCategories[0]})} className={cn("flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                form.type === "Income" ? "border-emerald-500 bg-emerald-500/5" : "border-border/40")}>
                <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">Income</span>
              </button>
              <button onClick={() => setForm({...form, type: "Expense", category: expenseCategories[0]})} className={cn("flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                form.type === "Expense" ? "border-red-500 bg-red-500/5" : "border-border/40")}>
                <ArrowUpCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Expense</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(form.type === "Income" ? incomeCategories : expenseCategories).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="h-8" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g., Monthly tuition fees — July" className="h-8" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Amount (Rs.)</Label>
                <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} className="h-8 font-bold" />
              </div>
              <div>
                <Label className="text-xs">Payment Mode</Label>
                <Select value={form.mode} onValueChange={(v: any) => setForm({...form, mode: v})}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Bank">Bank</SelectItem><SelectItem value="Cheque">Cheque</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.description || form.amount <= 0}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
