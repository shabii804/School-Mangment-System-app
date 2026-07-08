"use client";

import { useState, useRef } from "react";
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
  KeyRound, Download, Upload, Moon, Sun, Building2, Trash2, Image as ImageIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/sms-store";
import { useToast } from "@/hooks/use-toast";
import { exportFeeStructureCSV } from "@/lib/pdf-service";
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
        <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto">
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
  const { isDark, toggleTheme, school, updateSchool, setLogo, feeStructure, updateFeeStructure, setClassFee } = useAppStore();
  const [autoBackup, setAutoBackup] = useState(true);
  const [lateFine, setLateFine] = useState("500");
  const [dueDate, setDueDate] = useState("10");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classFeeDraft, setClassFeeDraft] = useState<Record<string, string>>(feeStructure.classFees);

  // Local form state synced with store
  const [form, setForm] = useState({
    name: school.name,
    tagline: school.tagline,
    address: school.address,
    phone: school.phone,
    email: school.email,
    session: school.session,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file (PNG, JPG, SVG).", variant: "destructive" });
      return;
    }
    if (file.size > 500 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 500KB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
      toast({ title: "Logo Updated ✓", description: "School logo saved and will appear across the app." });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(null);
    toast({ title: "Logo Removed", description: "Reverted to default EduDesk icon." });
  };

  const saveSchoolInfo = () => {
    updateSchool(form);
    toast({ title: "School Information Saved ✓", description: "Changes are now reflected across the app." });
  };

  return (
    <div className="space-y-4 fade-in">
      <Tabs defaultValue="school">
        <TabsList className="grid w-full max-w-2xl grid-cols-7">
          <TabsTrigger value="school">School</TabsTrigger>
          <TabsTrigger value="feestructure">Fee Structure</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* School info — with logo upload */}
        <TabsContent value="school">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" />School Information</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {/* Logo upload section */}
              <div className="rounded-xl border-2 border-dashed border-border/60 p-5 bg-muted/20">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden ring-2 ring-primary/20 shadow-lg shrink-0">
                    {school.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={school.logo} alt="School logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">School Logo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG or SVG • Max 500KB • Square recommended</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Logo
                      </Button>
                      {school.logo && (
                        <Button variant="outline" size="sm" onClick={removeLogo} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />Remove
                        </Button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>School Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div><Label>Tagline</Label><Input value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} /></div>
                <div className="col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Academic Session</Label><Input value={form.session} onChange={e => setForm({...form, session: e.target.value})} /></div>
                <div><Label>Website</Label><Input defaultValue="www.greenwood.edu" /></div>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />Live Preview</p>
                <p className="text-muted-foreground mt-1">
                  Your school name &ldquo;{form.name}&rdquo; and logo appear on the sidebar, dashboard hero, receipts, certificates, and salary slips.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={saveSchoolInfo}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Structure management */}
        <TabsContent value="feestructure">
          <Card className="border-0 shadow-sm glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Fee Structure Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {/* Global fee settings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <Label className="text-[10px] uppercase text-muted-foreground">Hostel Fee (monthly)</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-muted-foreground">Rs.</span>
                    <Input
                      type="number"
                      value={feeStructure.hostelFee}
                      onChange={e => updateFeeStructure({ hostelFee: Number(e.target.value) })}
                      className="h-8 font-bold"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <Label className="text-[10px] uppercase text-muted-foreground">Admission Multiplier</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-muted-foreground">×</span>
                    <Input
                      type="number"
                      value={feeStructure.admissionMultiplier}
                      onChange={e => updateFeeStructure({ admissionMultiplier: Number(e.target.value) })}
                      className="h-8 font-bold"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">× monthly tuition</p>
                </div>
                <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <Label className="text-[10px] uppercase text-muted-foreground">Late Fee</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-muted-foreground">Rs.</span>
                    <Input
                      type="number"
                      value={feeStructure.lateFee}
                      onChange={e => updateFeeStructure({ lateFee: Number(e.target.value) })}
                      className="h-8 font-bold"
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 p-3 bg-muted/20">
                  <Label className="text-[10px] uppercase text-muted-foreground">Due Date (day)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={feeStructure.dueDate}
                    onChange={e => updateFeeStructure({ dueDate: Number(e.target.value) })}
                    className="h-8 font-bold mt-1"
                  />
                </div>
              </div>

              {/* Per-class tuition fees table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Per-Class Tuition Fees</p>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-0">{Object.keys(feeStructure.classFees).length} classes</Badge>
                </div>
                <div className="rounded-lg border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40">
                        <TableHead>Class</TableHead>
                        <TableHead className="text-right">Monthly Tuition (Rs.)</TableHead>
                        <TableHead className="text-right">Admission Fee (Rs.)</TableHead>
                        <TableHead className="text-right">Hosteller Total (Rs.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(feeStructure.classFees).map(([className, fee]) => (
                        <TableRow key={className} className="border-border/30 hover:bg-muted/20">
                          <TableCell className="font-medium text-sm">{className}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={classFeeDraft[className] ?? fee}
                              onChange={e => setClassFeeDraft({ ...classFeeDraft, [className]: e.target.value })}
                              onBlur={e => {
                                const val = Number(e.target.value);
                                if (val > 0) {
                                  setClassFee(className, val);
                                  toast({ title: "Fee Updated", description: `${className}: Rs. ${val.toLocaleString()}/month` });
                                }
                              }}
                              className="h-7 w-28 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">Rs. {(fee * feeStructure.admissionMultiplier).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-sm text-accent">Rs. {(fee + feeStructure.hostelFee).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                <p className="font-medium text-primary">How fees are calculated:</p>
                <p className="text-muted-foreground mt-1">
                  • <strong>Tuition</strong> = per-class amount shown above<br/>
                  • <strong>Hostel</strong> = Rs. {feeStructure.hostelFee.toLocaleString()}/month (only for hostellers)<br/>
                  • <strong>Admission</strong> = Tuition × {feeStructure.admissionMultiplier} (one-time)<br/>
                  • <strong>Late Fee</strong> = Rs. {feeStructure.lateFee.toLocaleString()} (after day {feeStructure.dueDate} of each month)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => toast({ title: "Fee Structure Saved ✓", description: "All fee settings persisted. Fee Collection will use new amounts." })}
                >
                  Save Fee Structure
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    exportFeeStructureCSV(feeStructure.classFees, feeStructure.hostelFee, feeStructure.admissionMultiplier, feeStructure.lateFee, feeStructure.dueDate);
                    toast({ title: "Fee Structure Exported ✓", description: "CSV file downloaded — opens in Excel" });
                  }}
                >
                  <Download className="w-4 h-4 mr-1.5" />Export to Excel
                </Button>
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
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Danger Zone</p>
                <p className="text-xs text-muted-foreground mb-2">Reset all data to original demo state. This will clear all students, teachers, staff, fees, and transactions you've added.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-500/30 hover:bg-red-500/10 h-7 text-xs"
                  onClick={() => {
                    ["students", "teachers", "staff", "feeCollections", "activities", "documents", "commLogs", "transactions"].forEach(k => {
                      try { window.localStorage.removeItem(`edudesk_${k}`); } catch {}
                    });
                    toast({ title: "Data Reset ✓", description: "All data cleared. Reloading with demo data...", variant: "destructive" });
                    setTimeout(() => window.location.reload(), 1500);
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />Reset All Data
                </Button>
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto overflow-hidden ring-2 ring-primary/20 shadow-lg">
                {school.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              <p className="font-bold text-lg mt-3">{school.name}</p>
              <p className="text-sm text-muted-foreground">EduDesk SMS v1.0 • Session {school.session}</p>
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
