"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  UserPlus, Shield, Database, Palette, Calendar, DollarSign,
  KeyRound, Download, Upload, Moon, Sun, Building2,
} from "lucide-react";
import { useAppStore } from "@/lib/sms-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const USERS = [
  { id: 1, name: "Mr. Principal Ahmed", username: "admin", role: "Admin", email: "principal@greenwood.edu", status: "Active", lastLogin: "2026-07-02 08:15" },
  { id: 2, name: "Ms. Nargis Bibi", username: "accountant", role: "Accountant", email: "accounts@greenwood.edu", status: "Active", lastLogin: "2026-07-02 09:42" },
  { id: 3, name: "Ms. Sadia Rahman", username: "sadia", role: "Teacher", email: "sadia@greenwood.edu", status: "Active", lastLogin: "2026-07-02 08:50" },
  { id: 4, name: "Mr. Imran Yousuf", username: "imran", role: "Teacher", email: "imran@greenwood.edu", status: "Active", lastLogin: "2026-07-01 16:20" },
  { id: 5, name: "Mr. Tariq Mehmood", username: "tariq", role: "Admin", email: "office@greenwood.edu", status: "Inactive", lastLogin: "2026-06-15 11:00" },
];

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-primary/15 text-primary",
  Accountant: "bg-accent/15 text-accent",
  Teacher: "bg-purple-500/15 text-purple-600",
};

export function UsersModule() {
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Role-based user accounts with permission control.</p>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setAddOpen(true)}><UserPlus className="w-4 h-4 mr-1.5" />Add User</Button>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { role: "Admin", count: USERS.filter(u => u.role === "Admin").length, color: "bg-primary/10 text-primary", desc: "Full access to all modules" },
          { role: "Accountant", count: USERS.filter(u => u.role === "Accountant").length, color: "bg-accent/10 text-accent", desc: "Fees, salary, and reports" },
          { role: "Teacher", count: USERS.filter(u => u.role === "Teacher").length, color: "bg-purple-500/10 text-purple-600", desc: "Attendance and results only" },
        ].map(r => (
          <Card key={r.role} className="border-0 shadow-sm glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("rounded-xl p-3", r.color)}><Shield className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-2xl">{r.count}</p>
                <p className="text-xs text-muted-foreground">{r.role} • {r.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users table */}
      <Card className="border-0 shadow-sm glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.map(u => (
                <TableRow key={u.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs font-semibold bg-muted">{u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">@{u.username}</TableCell>
                  <TableCell><Badge className={cn("text-xs border-0", ROLE_COLORS[u.role])}>{u.role}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "Active" ? "default" : "secondary"} className={cn("text-xs", u.status === "Active" ? "bg-emerald-500/15 text-emerald-700" : "")}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs"><KeyRound className="w-3 h-3 mr-1" />Reset</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add user dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Full Name</Label><Input placeholder="e.g., Mr. Ali Khan" /></div>
            <div><Label>Username</Label><Input placeholder="e.g., ali.khan" /></div>
            <div><Label>Email</Label><Input type="email" placeholder="user@greenwood.edu" /></div>
            <div><Label>Role</Label>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                <option>Admin</option><option>Accountant</option><option>Teacher</option>
              </select>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
              A temporary password will be generated and the user will be prompted to change it on first login.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => { setAddOpen(false); toast({ title: "User Created", description: "Temporary password sent." }); }}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SettingsModule() {
  const { toast } = useToast();
  const { isDark, toggleTheme } = useAppStore();
  const [autoBackup, setAutoBackup] = useState(true);
  const [lateFine, setLateFine] = useState("500");
  const [dueDate, setDueDate] = useState("10");

  return (
    <div className="space-y-4">
      <Tabs defaultValue="school">
        <TabsList className="grid w-full max-w-2xl grid-cols-6">
          <TabsTrigger value="school">School</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* School info */}
        <TabsContent value="school">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />School Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>School Name</Label><Input defaultValue="Greenwood Public School" /></div>
              <div><Label>Phone</Label><Input defaultValue="+92 21 1234567" /></div>
              <div className="col-span-2"><Label>Address</Label><Input defaultValue="123 Education Road, Karachi, Pakistan" /></div>
              <div><Label>Email</Label><Input defaultValue="info@greenwood.edu" /></div>
              <div><Label>Website</Label><Input defaultValue="www.greenwood.edu" /></div>
              <div><Label>Academic Session Start</Label><Input type="date" defaultValue="2026-04-01" /></div>
              <div><Label>Academic Session End</Label><Input type="date" defaultValue="2027-03-31" /></div>
              <div className="col-span-2">
                <Label>School Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-1.5" />Upload New Logo</Button>
                </div>
              </div>
              <div className="col-span-2">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Settings Saved", description: "School information updated." })}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fine rules */}
        <TabsContent value="fines">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Attendance Fine Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Late Arrival Fine (Rs.)</Label>
                  <Input type="number" value={lateFine} onChange={e => setLateFine(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Fixed deduction per late occurrence</p>
                </div>
                <div>
                  <Label>Half-Day Deduction (%)</Label>
                  <Input type="number" defaultValue="50" />
                  <p className="text-[10px] text-muted-foreground mt-1">Percentage of one day's salary</p>
                </div>
                <div>
                  <Label>Per-Day Salary Basis</Label>
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option>Working Days (recommended)</option>
                    <option>Calendar Days (30)</option>
                  </select>
                </div>
                <div>
                  <Label>Leave Type</Label>
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option>Paid (if balance available)</option>
                    <option>Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary">Example Calculation:</p>
                <p className="text-muted-foreground mt-1">
                  Salary Rs. 50,000 / 26 working days = Rs. 1,923 per day.
                  2 absences = -Rs. 3,846. 1 late = -Rs. 500. Net deduction: Rs. 4,346.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Fine Rules Saved" })}>Save Rules</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee settings */}
        <TabsContent value="fees">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Fee Settings</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monthly Fee Due Date</Label>
                <Input type="number" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Day of month (1-28)</p>
              </div>
              <div>
                <Label>Late Fee Amount (Rs.)</Label>
                <Input type="number" defaultValue="200" />
              </div>
              <div>
                <Label>Receipt Number Prefix</Label>
                <Input defaultValue="RCPT-YYYYMMDD-" />
              </div>
              <div>
                <Label>Receipt Paper Size</Label>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option>A5 (148 × 210 mm)</option>
                  <option>Thermal 80mm</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch defaultChecked />
                <Label>Allow partial fee payments</Label>
              </div>
              <div className="col-span-2">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => toast({ title: "Fee Settings Saved" })}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4 text-primary" />Backup & Restore</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                <div>
                  <p className="font-medium text-sm">Automatic Daily Backup</p>
                  <p className="text-xs text-muted-foreground">Runs at 11:00 PM daily • Keeps last 7 backups</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex-col" onClick={() => toast({ title: "Backup Created", description: "backup-2026-07-02.db • 4.2 MB" })}>
                  <Download className="w-5 h-5 mb-1" />
                  <span>Backup Now</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col" onClick={() => toast({ title: "Restore dialog", description: "Select a .db backup file to restore." })}>
                  <Upload className="w-5 h-5 mb-1" />
                  <span>Restore from File</span>
                </Button>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="font-medium">Last Backup:</p>
                <p className="text-muted-foreground mt-0.5">2026-07-01 23:00 • backup-20260701.db • 4.1 MB</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4 text-primary" />Appearance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-accent" />}
                  <div>
                    <p className="font-medium text-sm">{isDark ? "Dark Theme" : "Light Theme"}</p>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                  </div>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>
              <div>
                <Label>Currency Symbol</Label>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mt-1">
                  <option>Rs. (PKR)</option><option>₹ (INR)</option><option>$ (USD)</option><option>€ (EUR)</option>
                </select>
              </div>
              <div>
                <Label>Date Format</Label>
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mt-1">
                  <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about">
          <Card className="border-0 shadow-sm glass-card">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="font-bold text-lg mt-3">EduDesk</p>
              <p className="text-sm text-muted-foreground">School Management System v1.0</p>
              <p className="text-xs text-muted-foreground mt-1">Built with React + Tauri v2 + Rust + SQLite</p>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Database Size</p>
                  <p className="font-bold text-sm mt-1">4.2 MB</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Records</p>
                  <p className="font-bold text-sm mt-1">2,847</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="font-bold text-sm mt-1">3h 24m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
