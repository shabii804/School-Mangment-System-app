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
import { useAppStore } from "@/lib/sms-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// LIBRARY MODULE
// ═══════════════════════════════════════════════════════════════
export function LibraryModule() {
  const [addOpen, setAddOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const { moduleData, addModuleItem, updateModuleItem, students } = useAppStore();
  const books = (moduleData.books || []) as Book[];
  const issues = (moduleData.bookIssues || []) as BookIssue[];
  const [form, setForm] = useState({ title: "", author: "", category: "Mathematics", isbn: "", copies: 1, shelf: "" });
  const [issueForm, setIssueForm] = useState({ bookId: "", studentId: "", issueDate: new Date().toISOString().split("T")[0], dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] });
  const { toast } = useToast();

  const totalBooks = books.reduce((s, b) => s + b.totalCopies, 0);
  const availableBooks = books.reduce((s, b) => s + b.availableCopies, 0);
  const overdueCount = issues.filter(i => i.status === "Overdue").length;

  const handleIssue = () => {
    if (!issueForm.bookId || !issueForm.studentId.trim()) {
      toast({ title: "Missing info", description: "Please select a book and enter Student ID.", variant: "destructive" });
      return;
    }
    // Look up student for name/class
    const student = students.find(s => s.id === issueForm.studentId || s.id.toLowerCase() === issueForm.studentId.toLowerCase());
    const book = books.find(b => b.id === issueForm.bookId);
    if (book && book.availableCopies <= 0) {
      toast({ title: "No copies available", description: "All copies of this book are issued.", variant: "destructive" });
      return;
    }
    const newIssue: BookIssue = {
      id: `ISS-${String(Date.now()).slice(-6)}`,
      bookId: issueForm.bookId,
      bookTitle: book?.title || "Unknown",
      studentId: issueForm.studentId,
      studentName: student?.name || issueForm.studentId,
      class: student?.class || "—",
      issueDate: issueForm.issueDate,
      dueDate: issueForm.dueDate,
      status: "Issued",
    };
    addModuleItem("bookIssues", newIssue);
    // Decrement available copies
    if (book) updateModuleItem("books", book.id, { availableCopies: Math.max(0, book.availableCopies - 1) });
    toast({ title: "Book Issued ✓", description: `${newIssue.bookTitle} issued to ${newIssue.studentName}.` });
    setIssueOpen(false);
    setIssueForm({ bookId: "", studentId: "", issueDate: new Date().toISOString().split("T")[0], dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] });
  };

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
                  <TableCell className="text-sm">{(i.fine ?? 0) > 0 ? <span className="text-red-600 font-bold">Rs. {i.fine}</span> : "—"}</TableCell>
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
            <div><Label>Book Title <span className="text-red-500">*</span></Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Author</Label><Input value={form.author} onChange={e => setForm({...form, author: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({...form, category: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Mathematics", "English", "Science", "Urdu", "Social Studies", "Islamiat", "Computer", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Copies</Label><Input type="number" value={form.copies} onChange={e => setForm({...form, copies: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div><Label>ISBN</Label><Input value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} /></div><div><Label>Shelf Location</Label><Input value={form.shelf} onChange={e => setForm({...form, shelf: e.target.value})} placeholder="A-12" /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => { if (!form.title) return; addModuleItem("books", { id: `BK-${String(Date.now()).slice(-6)}`, title: form.title, author: form.author || "—", category: form.category, isbn: form.isbn || "—", totalCopies: form.copies, availableCopies: form.copies, shelf: form.shelf || "—" }); toast({ title: "Book Added ✓", description: `${form.title} added to catalog.` }); setAddOpen(false); setForm({ title: "", author: "", category: "Mathematics", isbn: "", copies: 1, shelf: "" }); }}>Add Book</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BookMarked className="w-4 h-4 text-primary" />Issue Book</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Select Book <span className="text-red-500">*</span></Label><Select value={issueForm.bookId} onValueChange={v => setIssueForm({...issueForm, bookId: v})}><SelectTrigger><SelectValue placeholder="Choose book..." /></SelectTrigger><SelectContent>{books.filter(b => b.availableCopies > 0).map(b => <SelectItem key={b.id} value={b.id}>{b.title} ({b.availableCopies} available)</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Student ID <span className="text-red-500">*</span></Label><Input value={issueForm.studentId} onChange={e => setIssueForm({...issueForm, studentId: e.target.value})} placeholder={`SCH-${new Date().getFullYear()}-XXXX`} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Issue Date</Label><Input type="date" value={issueForm.issueDate} onChange={e => setIssueForm({...issueForm, issueDate: e.target.value})} /></div><div><Label>Due Date (14 days)</Label><Input type="date" value={issueForm.dueDate} onChange={e => setIssueForm({...issueForm, dueDate: e.target.value})} /></div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleIssue} disabled={!issueForm.bookId || !issueForm.studentId.trim()}>Issue Book</Button></DialogFooter>
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
  const { moduleData, addModuleItem, updateModuleItem } = useAppStore();
  const routes = (moduleData.busRoutes || []) as BusRoute[];
  const [form, setForm] = useState({ routeName: "", vehicleNo: "", capacity: 25, driverName: "", driverPhone: "", stops: "" });
  const { toast } = useToast();

  const totalCapacity = routes.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = routes.reduce((s, r) => s + r.occupied, 0);

  const handleAdd = () => {
    if (!form.routeName.trim()) return;
    const newRoute: BusRoute = {
      id: `RT-${String(Date.now()).slice(-6)}`,
      routeName: form.routeName,
      vehicleNo: form.vehicleNo || "—",
      capacity: Number(form.capacity) || 0,
      occupied: 0,
      driverName: form.driverName || "—",
      driverPhone: form.driverPhone || "—",
      morningTime: "07:00",
      eveningTime: "02:00",
      stops: form.stops.split(",").map(s => s.trim()).filter(Boolean),
    };
    addModuleItem("busRoutes", newRoute);
    toast({ title: "Route Added ✓", description: `${form.routeName} created.` });
    setAddOpen(false);
    setForm({ routeName: "", vehicleNo: "", capacity: 25, driverName: "", driverPhone: "", stops: "" });
  };

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
          const pct = r.capacity > 0 ? Math.round((r.occupied / r.capacity) * 100) : 0;
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
            <div><Label>Route Name <span className="text-red-500">*</span></Label><Input value={form.routeName} onChange={e => setForm({...form, routeName: e.target.value})} placeholder="Route F — Clifton" /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Vehicle No.</Label><Input value={form.vehicleNo} onChange={e => setForm({...form, vehicleNo: e.target.value})} placeholder="KHI-XXXX" /></div><div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Driver Name</Label><Input value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} /></div><div><Label>Driver Phone</Label><Input value={form.driverPhone} onChange={e => setForm({...form, driverPhone: e.target.value})} placeholder="+92 3xx" /></div></div>
            <div><Label>Stops (comma-separated)</Label><Input value={form.stops} onChange={e => setForm({...form, stops: e.target.value})} placeholder="Stop 1, Stop 2, Stop 3" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.routeName.trim()}>Add Route</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOSTEL MODULE
// ═══════════════════════════════════════════════════════════════
export function HostelModule() {
  const { moduleData, addModuleItem, updateModuleItem, updateStudent, students } = useAppStore();
  const rooms = (moduleData.hostelRooms || []) as HostelRoom[];
  const allocations = (moduleData.hostelAllocations || []) as any[];
  const [allocOpen, setAllocOpen] = useState(false);
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [allocForm, setAllocForm] = useState({ roomId: "", studentId: "", studentName: "" });
  const [roomForm, setRoomForm] = useState({ roomNo: "", capacity: 2, type: "Double" as HostelRoom["type"], floor: 1 });
  const { toast } = useToast();
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.occupied, 0);
  const availableBeds = totalCapacity - totalOccupied;

  const handleAddRoom = () => {
    if (!roomForm.roomNo.trim()) {
      toast({ title: "Room number required", description: "Please enter a room number.", variant: "destructive" });
      return;
    }
    addModuleItem("hostelRooms", {
      id: `RM-${String(Date.now()).slice(-6)}`,
      roomNo: roomForm.roomNo,
      capacity: Number(roomForm.capacity) || 1,
      occupied: 0,
      type: roomForm.type,
      floor: Number(roomForm.floor) || 1,
    });
    toast({ title: "Room Added ✓", description: `Room ${roomForm.roomNo} created.` });
    setAddRoomOpen(false);
    setRoomForm({ roomNo: "", capacity: 2, type: "Double", floor: 1 });
  };

  const handleAllocate = () => {
    if (!allocForm.roomId || !allocForm.studentId.trim()) {
      toast({ title: "Missing info", description: "Please select a room and enter Student ID.", variant: "destructive" });
      return;
    }
    const room = rooms.find(r => r.id === allocForm.roomId);
    if (!room || room.occupied >= room.capacity) {
      toast({ title: "Room full", description: "This room has no available beds.", variant: "destructive" });
      return;
    }
    // Look up student
    const student = students.find(s => s.id === allocForm.studentId || s.id.toLowerCase() === allocForm.studentId.toLowerCase());
    const studentName = student?.name || allocForm.studentName || allocForm.studentId;
    // Record allocation
    addModuleItem("hostelAllocations", {
      id: `ALLOC-${String(Date.now()).slice(-6)}`,
      roomId: allocForm.roomId,
      roomNo: room.roomNo,
      studentId: allocForm.studentId,
      studentName,
      date: new Date().toISOString().split("T")[0],
    });
    // Increment room occupancy
    updateModuleItem("hostelRooms", allocForm.roomId, { occupied: room.occupied + 1 });
    // Flip student's isHosteller flag so hostel fee applies
    if (student) updateStudent(student.id, { isHosteller: true });
    toast({ title: "Room Allocated ✓", description: `${studentName} assigned to Room ${room.roomNo}. Hostel fee now applies.` });
    setAllocOpen(false);
    setAllocForm({ roomId: "", studentId: "", studentName: "" });
  };

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">Manage hostel rooms, bed allocation, and mess.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddRoomOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Room</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setAllocOpen(true)}><BedDouble className="w-4 h-4 mr-1.5" />Allocate Room</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-1.5"><Home className="w-4 h-4 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total Rooms</p><p className="text-xl font-bold">{rooms.length}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-purple-500/10 p-1.5"><BedDouble className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-muted-foreground">Total Beds</p><p className="text-xl font-bold">{totalCapacity}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-emerald-500/10 p-1.5"><Users className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-muted-foreground">Occupied</p><p className="text-xl font-bold">{totalOccupied}</p></div></CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2"><div className="rounded-lg bg-accent/10 p-1.5"><BedDouble className="w-4 h-4 text-accent" /></div><div><p className="text-xs text-muted-foreground">Available</p><p className="text-xl font-bold">{availableBeds}</p></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(r => {
          const pct = r.capacity > 0 ? Math.round((r.occupied / r.capacity) * 100) : 0;
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
                  <div><p className="text-[10px] text-muted-foreground uppercase">Monthly Rent</p><p className="font-bold text-sm">Rs. {(r.monthlyRent ?? 0).toLocaleString()}</p></div>
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

      {/* Allocate Room Dialog */}
      <Dialog open={allocOpen} onOpenChange={setAllocOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-primary" />Allocate Room</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Select Room <span className="text-red-500">*</span></Label><Select value={allocForm.roomId} onValueChange={v => setAllocForm({...allocForm, roomId: v})}><SelectTrigger><SelectValue placeholder="Choose room..." /></SelectTrigger><SelectContent>{rooms.filter(r => r.occupied < r.capacity).map(r => <SelectItem key={r.id} value={r.id}>{r.roomNo} ({r.capacity - r.occupied} beds free)</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Student ID <span className="text-red-500">*</span></Label><Input value={allocForm.studentId} onChange={e => setAllocForm({...allocForm, studentId: e.target.value})} placeholder={`SCH-${new Date().getFullYear()}-XXXX`} /></div>
            <div><Label>Student Name</Label><Input value={allocForm.studentName} onChange={e => setAllocForm({...allocForm, studentName: e.target.value})} placeholder="Optional" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAllocOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAllocate} disabled={!allocForm.roomId || !allocForm.studentId.trim()}>Allocate</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={addRoomOpen} onOpenChange={setAddRoomOpen}>
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Home className="w-4 h-4 text-primary" />Add Hostel Room</DialogTitle></DialogHeader>
          <div className="space-y-2 py-1">
            <div><Label>Room Number <span className="text-red-500">*</span></Label><Input value={roomForm.roomNo} onChange={e => setRoomForm({...roomForm, roomNo: e.target.value})} placeholder="e.g., H-101" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Capacity</Label><Input type="number" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: Number(e.target.value)})} /></div>
              <div><Label>Floor</Label><Input type="number" value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: Number(e.target.value)})} /></div>
            </div>
            <div><Label>Room Type</Label><Select value={roomForm.type} onValueChange={v => setRoomForm({...roomForm, type: v as HostelRoom["type"]})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Double">Double</SelectItem><SelectItem value="Triple">Triple</SelectItem><SelectItem value="Dorm">Dorm</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddRoomOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAddRoom} disabled={!roomForm.roomNo.trim()}>Add Room</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY MODULE
// ═══════════════════════════════════════════════════════════════
export function InventoryModule() {
  const [addOpen, setAddOpen] = useState(false);
  const { moduleData, addModuleItem, updateModuleItem } = useAppStore();
  const items = (moduleData.inventoryItems || []) as InventoryItem[];
  const [form, setForm] = useState({ name: "", category: "Furniture", quantity: 1, unit: "pcs", minStock: 1, location: "" });
  const { toast } = useToast();

  const lowStock = items.filter(i => i.quantity <= i.minStock).length;
  const needsRepair = items.filter(i => i.condition === "Needs Repair" || i.condition === "Damaged").length;

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const newItem: InventoryItem = {
      id: `INV-${String(Date.now()).slice(-6)}`,
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity) || 0,
      unit: form.unit || "pcs",
      minStock: Number(form.minStock) || 0,
      location: form.location || "—",
      condition: "Good",
    };
    addModuleItem("inventoryItems", newItem);
    toast({ title: "Item Added ✓", description: `${form.name} added to inventory.` });
    setAddOpen(false);
    setForm({ name: "", category: "Furniture", quantity: 1, unit: "pcs", minStock: 1, location: "" });
  };

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
            <div><Label>Item Name <span className="text-red-500">*</span></Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Lab Beakers" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm({...form, category: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Furniture", "Electronics", "Lab Equipment", "Stationery", "Sports", "Medical", "Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div><div><Label>Min Stock</Label><Input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: Number(e.target.value)})} /></div></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g., Science Lab" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.name.trim()}>Add Item</Button></DialogFooter>
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
  const { moduleData, addModuleItem } = useAppStore();
  const events = (moduleData.schoolEvents || []) as SchoolEvent[];
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({ title: "", type: "Meeting", date: "", description: "" });
  const { toast } = useToast();

  const typeColors: Record<string, string> = {
    Exam: "bg-red-500", Holiday: "bg-emerald-500", PTM: "bg-blue-500", Sports: "bg-orange-500",
    Cultural: "bg-purple-500", Meeting: "bg-primary", Deadline: "bg-yellow-500",
  };
  const filtered = filter === "all"
    ? [...events].sort((a, b) => a.date.localeCompare(b.date))
    : events.filter(e => e.type === filter).sort((a, b) => a.date.localeCompare(b.date));

  const typeIcons: Record<string, any> = {
    Exam: FileText, Holiday: Home, PTM: Users, Sports: TrendingUp,
    Cultural: Package, Meeting: Users, Deadline: AlertCircle,
  };

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) {
      toast({ title: "Missing info", description: "Please enter title and date.", variant: "destructive" });
      return;
    }
    const newEvent: SchoolEvent = {
      id: `EVT-${String(Date.now()).slice(-6)}`,
      title: form.title,
      type: form.type as any,
      date: form.date,
      description: form.description || "—",
      color: typeColors[form.type] || "bg-primary",
    };
    addModuleItem("schoolEvents", newEvent);
    toast({ title: "Event Added ✓", description: `${form.title} scheduled for ${form.date}.` });
    setAddOpen(false);
    setForm({ title: "", type: "Meeting", date: "", description: "" });
  };

  return (
    <div className="space-y-3 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">School events, holidays, exams, PTMs, and important dates.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Event</Button>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter events">
        {["all", "Exam", "Holiday", "PTM", "Sports", "Cultural", "Meeting", "Deadline"].map(t => (
          <button key={t} onClick={() => setFilter(t)} aria-pressed={filter === t} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filter === t ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted")}>
            {t === "all" ? "All Events" : t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No events found. Click "Add Event" to create one.
          </div>
        ) : filtered.map((e, i) => {
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
            <div><Label>Event Title <span className="text-red-500">*</span></Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., Science Exhibition" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm({...form, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Exam", "Holiday", "PTM", "Sports", "Cultural", "Meeting", "Deadline"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Date <span className="text-red-500">*</span></Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90" onClick={handleAdd} disabled={!form.title.trim() || !form.date}>Add Event</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
