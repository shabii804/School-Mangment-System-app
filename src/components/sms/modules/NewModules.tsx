"use client";

import { useState } from "react";
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
  Plus, BookOpen, BookMarked, Users, AlertCircle, Bus, MapPin,
  Clock, BedDouble, Home, Package, Wrench, Calendar, ArrowRight,
  TrendingUp, FileText,
} from "lucide-react";
import {
  BOOKS, BOOK_ISSUES, BUS_ROUTES, HOSTEL_ROOMS, INVENTORY_ITEMS,
  SCHOOL_EVENTS, type Book, type BookIssue, type BusRoute, type HostelRoom,
  type InventoryItem, type SchoolEvent,
} from "@/lib/sms-data";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// LIBRARY MODULE
// ═══════════════════════════════════════════════════════════════
export function LibraryModule() {
  const [addOpen, setAddOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>(BOOKS);
  const [issues, setIssues] = useState<BookIssue[]>(BOOK_ISSUES);
  const [form, setForm] = useState({ title: "", author: "", category: "Mathematics", isbn: "", copies: 1, shelf: "" });

  const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0);
  const availableBooks = books.reduce((s, b) => s + b.availableCopies, 0);
  const overdueCount = issues.filter(i => i.status === "Overdue").length;

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage library books, issue/return, and fines.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIssueOpen(true)}><BookMarked className="w-4 h-4 mr-1.5" />Issue Book</Button>
          <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Book</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><BookOpen className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Books</p><p className="text-xl font-bold">{totalBooks}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><BookMarked className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Available</p><p className="text-xl font-bold">{availableBooks}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-purple-500/10 p-1.5"><Users className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">Issued</p><p className="text-xl font-bold">{issues.filter(i => i.status === "Issued").length}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-red-500/10 p-1.5"><AlertCircle className="w-4 h-4 text-red-600" /></div><div><p className="text-xs text-muted-foreground">Overdue</p><p className="text-xl font-bold">{overdueCount}</p></div></CardContent></Card>
      </div>

      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-base">Book Catalog</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="border-border/40">
              <TableHead>Book ID</TableHead><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Category</TableHead><TableHead className="text-center">Available</TableHead><TableHead>Shelf</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {books.map(b => (
                <TableRow key={b.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.id}</TableCell>
                  <TableCell className="font-medium text-sm">{b.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.author}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{b.category}</Badge></TableCell>
                  <TableCell className="text-center">
                    <span className={cn("font-bold text-sm", b.availableCopies > 0 ? "text-emerald-600" : "text-red-600")}>{b.availableCopies}</span>
                    <span className="text-xs text-muted-foreground">/{b.totalCopies}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{b.shelf}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-base">Issue / Return History</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="border-border/40">
              <TableHead>Issue ID</TableHead><TableHead>Book</TableHead><TableHead>Student</TableHead><TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead>Fine</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {issues.map(i => (
                <TableRow key={i.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell className="text-sm font-medium">{i.bookTitle}</TableCell>
                  <TableCell className="text-sm">{i.studentName}<p className="text-[10px] text-muted-foreground">{i.class}</p></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.issueDate}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.dueDate}</TableCell>
                  <TableCell className="text-sm">{i.fine > 0 ? <span className="text-red-600 font-bold">Rs. {i.fine}</span> : "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={cn("text-xs border-0", i.status === "Returned" ? "bg-emerald-500/10 text-emerald-600" : i.status === "Overdue" ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary")}>{i.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add Book Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add New Book</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Book Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Author</Label><Input value={form.author} onChange={e => setForm({...form, author: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({...form, category: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Mathematics", "English", "Science", "Urdu", "Social Studies", "Islamiat", "Computer", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Copies</Label><Input type="number" value={form.copies} onChange={e => setForm({...form, copies: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div><Label>ISBN</Label><Input value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} /></div><div><Label>Shelf Location</Label><Input value={form.shelf} onChange={e => setForm({...form, shelf: e.target.value})} placeholder="A-12" /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => { if (!form.title) return; setBooks([{ id: `BK-${String(books.length + 1).padStart(3, "0")}`, title: form.title, author: form.author, category: form.category, isbn: form.isbn, totalCopies: form.copies, availableCopies: form.copies, shelf: form.shelf || "—" }, ...books]); setAddOpen(false); setForm({ title: "", author: "", category: "Mathematics", isbn: "", copies: 1, shelf: "" }); }}>Add Book</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookMarked className="w-4 h-4 text-primary" />Issue Book</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Select Book</Label><Select defaultValue=""><SelectTrigger><SelectValue placeholder="Choose book..." /></SelectTrigger><SelectContent>{books.filter(b => b.availableCopies > 0).map(b => <SelectItem key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Student ID</Label><Input placeholder="SCH-2026-XXXX" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Issue Date</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div><div><Label>Due Date (14 days)</Label><Input type="date" defaultValue={new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]} /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => setIssueOpen(false)}>Issue Book</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TRANSPORT MODULE
// ═══════════════════════════════════════════════════════════════
export function TransportModule() {
  const [addOpen, setAddOpen] = useState(false);
  const [routes, setRoutes] = useState<BusRoute[]>(BUS_ROUTES);

  const totalCapacity = routes.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = routes.reduce((s, r) => s + r.occupied, 0);

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage bus routes, vehicles, drivers, and student assignments.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Route</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><Bus className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Routes</p><p className="text-xl font-bold">{routes.length}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><Users className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Students</p><p className="text-xl font-bold">{totalOccupied}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-accent/10 p-1.5"><TrendingUp className="w-4 h-4 text-accent" /></div><div><p className="text-xs text-muted-foreground">Capacity</p><p className="text-xl font-bold">{totalCapacity}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-purple-500/10 p-1.5"><MapPin className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">Total Stops</p><p className="text-xl font-bold">{routes.reduce((s, r) => s + r.stops.length, 0)}</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map(r => {
          const pct = Math.round((r.occupied / r.capacity) * 100);
          return (
            <Card key={r.id} className="border-0 shadow-sm glass-card card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center"><Bus className="w-4 h-4 text-primary" /></div>
                    <div><p className="font-bold text-sm">{r.routeName}</p><p className="text-xs text-muted-foreground">{r.vehicleNo}</p></div>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", pct >= 90 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600")}>{r.occupied}/{r.capacity}</Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-3.5 h-3.5" /> Driver: {r.driverName} ({r.driverPhone})</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-3.5 h-3.5" /> Morning: {r.morningTime} • Evening: {r.eveningTime}</div>
                  <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Stops: {r.stops.join(" → ")}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center justify-between mb-1"><p className="text-[10px] text-muted-foreground uppercase">Occupancy</p><p className="text-xs font-bold">{pct}%</p></div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden"><div className={cn("h-full", pct >= 90 ? "bg-red-500" : "bg-emerald-500")} style={{ width: `${pct}%` }} /></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add Bus Route</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Route Name *</Label><Input placeholder="Route F — Clifton" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Vehicle No.</Label><Input placeholder="KHI-XXXX" /></div><div><Label>Capacity</Label><Input type="number" defaultValue={25} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Driver Name</Label><Input /></div><div><Label>Driver Phone</Label><Input placeholder="+92 3xx" /></div></div>
            <div><Label>Stops (comma-separated)</Label><Input placeholder="Stop 1, Stop 2, Stop 3" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(false)}>Add Route</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOSTEL MODULE
// ═══════════════════════════════════════════════════════════════
export function HostelModule() {
  const [rooms, setRooms] = useState<HostelRoom[]>(HOSTEL_ROOMS);
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.occupied, 0);
  const availableBeds = totalCapacity - totalOccupied;

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage hostel rooms, bed allocation, and mess.</p>
        <Button className="bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-1.5" />Allocate Room</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><Home className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Rooms</p><p className="text-xl font-bold">{rooms.length}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-purple-500/10 p-1.5"><BedDouble className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">Total Beds</p><p className="text-xl font-bold">{totalCapacity}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><Users className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Occupied</p><p className="text-xl font-bold">{totalOccupied}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-accent/10 p-1.5"><BedDouble className="w-4 h-4 text-accent" /></div><div><p className="text-xs text-muted-foreground">Available</p><p className="text-xl font-bold">{availableBeds}</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(r => {
          const pct = Math.round((r.occupied / r.capacity) * 100);
          return (
            <Card key={r.id} className={cn("border-0 shadow-sm glass-card card-hover", r.occupied === r.capacity && "ring-1 ring-red-500/20")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", r.occupied === r.capacity ? "bg-red-500/15" : "bg-primary/15")}><BedDouble className={cn("w-5 h-5", r.occupied === r.capacity ? "text-red-600" : "text-primary")} /></div>
                    <div><p className="font-bold text-sm">{r.roomNo}</p><p className="text-xs text-muted-foreground">{r.block} • {r.floor}</p></div>
                  </div>
                  <Badge variant="outline" className="text-xs">{r.type}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-muted/30 p-2"><p className="font-bold">{r.capacity}</p><p className="text-[9px] text-muted-foreground uppercase">Capacity</p></div>
                  <div className="rounded bg-emerald-500/10 p-2"><p className="font-bold text-emerald-600">{r.occupied}</p><p className="text-[9px] text-muted-foreground uppercase">Filled</p></div>
                  <div className="rounded bg-accent/10 p-2"><p className="font-bold text-accent">{r.capacity - r.occupied}</p><p className="text-[9px] text-muted-foreground uppercase">Free</p></div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                  <div><p className="text-[10px] text-muted-foreground uppercase">Monthly Rent</p><p className="font-bold text-sm">Rs. {r.monthlyRent.toLocaleString()}</p></div>
                  <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden"><div className={cn("h-full", pct === 100 ? "bg-red-500" : "bg-primary")} style={{ width: `${pct}%` }} /></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mess info */}
      <Card className="border-0 shadow-sm glass-card">
        <CardHeader><CardTitle className="text-base">Mess & Dining</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground uppercase">Mess Contractor</p><p className="font-medium mt-1">Not configured</p></div>
            <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground uppercase">Monthly Mess Fee</p><p className="font-medium mt-1">Rs. 0/student</p></div>
            <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground uppercase">Meal Times</p><p className="font-medium mt-1">Not set</p></div>
            <div className="rounded-lg bg-muted/30 p-3"><p className="text-xs text-muted-foreground uppercase">Total Mess Students</p><p className="font-medium mt-1">{totalOccupied}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY MODULE
// ═══════════════════════════════════════════════════════════════
export function InventoryModule() {
  const [addOpen, setAddOpen] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);

  const lowStock = items.filter(i => i.quantity <= i.minStock).length;
  const needsRepair = items.filter(i => i.condition === "Needs Repair" || i.condition === "Damaged").length;

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage furniture, electronics, lab equipment, and supplies.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Item</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><Package className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Items</p><p className="text-xl font-bold">{items.length}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-red-500/10 p-1.5"><AlertCircle className="w-4 h-4 text-red-600" /></div><div><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-xl font-bold">{lowStock}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-yellow-500/10 p-1.5"><Wrench className="w-4 h-4 text-yellow-600" /></div><div><p className="text-xs text-muted-foreground">Needs Repair</p><p className="text-xl font-bold">{needsRepair}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><TrendingUp className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Categories</p><p className="text-xl font-bold">{new Set(items.map(i => i.category)).size}</p></div></CardContent></Card>
      </div>

      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow className="border-border/40">
              <TableHead>Item ID</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead className="text-center">Quantity</TableHead><TableHead className="text-center">Min Stock</TableHead><TableHead>Location</TableHead><TableHead>Condition</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map(i => {
                const isLow = i.quantity <= i.minStock;
                return (
                  <TableRow key={i.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{i.id}</TableCell>
                    <TableCell className="font-medium text-sm">{i.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{i.category}</Badge></TableCell>
                    <TableCell className="text-center"><span className={cn("font-bold text-sm", isLow && "text-red-600")}>{i.quantity}</span> <span className="text-xs text-muted-foreground">{i.unit}</span></TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">{i.minStock}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{i.location}</TableCell>
                    <TableCell><Badge variant="outline" className={cn("text-xs border-0", i.condition === "Good" ? "bg-emerald-500/10 text-emerald-600" : i.condition === "Needs Repair" ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-600")}>{i.condition}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add Inventory Item</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Item Name *</Label><Input placeholder="e.g., Lab Beakers" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select defaultValue="Furniture"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Furniture", "Electronics", "Lab Equipment", "Stationery", "Sports", "Medical", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Quantity</Label><Input type="number" defaultValue={1} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Unit</Label><Input defaultValue="pcs" /></div><div><Label>Min Stock</Label><Input type="number" defaultValue={1} /></div></div>
            <div><Label>Location</Label><Input placeholder="e.g., Science Lab" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(false)}>Add Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EVENT CALENDAR MODULE
// ═══════════════════════════════════════════════════════════════
export function EventsModule() {
  const [addOpen, setAddOpen] = useState(false);
  const [events, setEvents] = useState<SchoolEvent[]>(SCHOOL_EVENTS);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? events.sort((a, b) => a.date.localeCompare(b.date)) : events.filter(e => e.type === filter).sort((a, b) => a.date.localeCompare(b.date));

  const typeIcons: Record<string, any> = {
    Exam: FileText, Holiday: Home, PTM: Users, Sports: TrendingUp,
    Cultural: Package, Meeting: Users, Deadline: AlertCircle,
  };

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">School events, holidays, exams, PTMs, and important dates.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Event</Button>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "Exam", "Holiday", "PTM", "Sports", "Cultural", "Meeting", "Deadline"].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === t ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted")}>
            {t === "all" ? "All Events" : t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map((e, i) => {
          const Icon = typeIcons[e.type] || Calendar;
          const eventDate = new Date(e.date);
          const isPast = eventDate < new Date();
          const isToday = e.date === new Date().toISOString().split("T")[0];
          return (
            <Card key={e.id} className={cn("border-0 shadow-sm glass-card card-hover relative overflow-hidden", isToday && "ring-2 ring-accent/40")}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className={cn("rounded-xl p-3 text-center min-w-[60px] shrink-0", e.color)}>
                    <p className="text-[10px] text-white/80 uppercase">{eventDate.toLocaleDateString("en-GB", { month: "short" })}</p>
                    <p className="text-2xl font-bold text-white">{eventDate.getDate()}</p>
                    <p className="text-[10px] text-white/80">{eventDate.toLocaleDateString("en-GB", { weekday: "short" })}</p>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <p className="font-semibold text-sm">{e.title}</p>
                      <Badge variant="outline" className={cn("text-[10px] border-0", e.color.replace("bg-", "bg-").replace("500", "500/10"))}>{e.type}</Badge>
                      {isToday && <Badge className="text-[9px] bg-accent text-accent-foreground border-0 animate-pulse">TODAY</Badge>}
                      {isPast && !isToday && <Badge variant="outline" className="text-[9px] bg-muted text-muted-foreground border-0">Past</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{e.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add Event</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Event Title *</Label><Input placeholder="e.g., Science Exhibition" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select defaultValue="Meeting"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Exam", "Holiday", "PTM", "Sports", "Cultural", "Meeting", "Deadline"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Date *</Label><Input type="date" /></div>
            </div>
            <div><Label>Description</Label><Input placeholder="Brief description..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(false)}>Add Event</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
