"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/sms-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Wand2, TrendingUp, AlertTriangle, Users, Calendar,
  FileText, Brain, Lightbulb, ArrowRight, CheckCircle2, Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  predictDefaulters, analyzeAttendance, generateSmartNotifications,
  type DefaulterRisk, type AttendanceInsight,
} from "@/lib/ai-engine";

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  category: "Schedule" | "Finance" | "Academics" | "Insights";
  run: () => Promise<any>;
  render: (result: any) => React.ReactNode;
}

export function AIAssistantModule() {
  const { students, teachers, staff, feeCollections, attendanceRecords, classes, subjects, moduleData, setModuleData, setActiveModule } = useAppStore();
  const { toast } = useToast();
  const [activeResult, setActiveResult] = useState<{ id: string; data: any } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const runFeature = async (id: string, fn: () => any, render: (data: any) => React.ReactNode) => {
    setLoading(id);
    // Simulate AI thinking time for UX
    await new Promise(r => setTimeout(r, 800));
    try {
      const result = fn();
      setActiveResult({ id, data: result });
      toast({ title: "AI Analysis Complete ✓", description: "Results are shown below." });
    } catch (e) {
      toast({ title: "Analysis failed", description: "Could not complete the analysis.", variant: "destructive" });
    }
    setLoading(null);
  };

  // ─── AI Feature: Defaulter Prediction ───
  const defaulterFeature = {
    id: "predict-defaulters",
    title: "Predict Fee Defaulters",
    description: "AI analyzes payment patterns to flag students at risk of defaulting",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    category: "Finance" as const,
    run: () => predictDefaulters(students, feeCollections),
    render: (risks: DefaulterRisk[]) => (
      <div className="space-y-2">
        {risks.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            No students at risk. All fees are up to date.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {["Critical", "High", "Medium", "Low"].map(level => {
                const count = risks.filter(r => r.riskLevel === level).length;
                const colors: Record<string, string> = {
                  Critical: "bg-red-500/10 text-red-700",
                  High: "bg-orange-500/10 text-orange-700",
                  Medium: "bg-yellow-500/10 text-yellow-700",
                  Low: "bg-emerald-500/10 text-emerald-700",
                };
                return (
                  <div key={level} className={cn("rounded-lg p-2 text-center", colors[level])}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-[10px] uppercase font-semibold">{level}</p>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {risks.slice(0, 20).map(r => (
                <div key={r.studentId} className={cn("rounded-lg border p-3",
                  r.riskLevel === "Critical" ? "border-red-500/30 bg-red-500/5" :
                  r.riskLevel === "High" ? "border-orange-500/30 bg-orange-500/5" :
                  r.riskLevel === "Medium" ? "border-yellow-500/30 bg-yellow-500/5" :
                  "border-emerald-500/30 bg-emerald-500/5"
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{r.studentName}</p>
                      <p className="text-[10px] text-muted-foreground">{r.class} • Risk Score: {r.riskScore}/100</p>
                    </div>
                    <Badge className={cn("text-[9px] shrink-0",
                      r.riskLevel === "Critical" ? "bg-red-500 text-white" :
                      r.riskLevel === "High" ? "bg-orange-500 text-white" :
                      r.riskLevel === "Medium" ? "bg-yellow-500 text-white" :
                      "bg-emerald-500 text-white"
                    )}>{r.riskLevel}</Badge>
                  </div>
                  {r.reasons.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {r.reasons.map((reason, i) => (
                        <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                          <span className="text-amber-500">•</span> {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    ),
  };

  // ─── AI Feature: Attendance Insights ───
  const attendanceFeature = {
    id: "attendance-insights",
    title: "Attendance Pattern Analysis",
    description: "AI detects absence patterns, worst days, and chronically absent students",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    category: "Insights" as const,
    run: () => analyzeAttendance({ records: attendanceRecords, students }),
    render: (insight: AttendanceInsight) => (
      <div className="space-y-3">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-primary/10 p-3 text-center">
            <p className="text-2xl font-bold text-primary">{insight.avgAttendance.toFixed(0)}%</p>
            <p className="text-[10px] uppercase text-muted-foreground">Avg Attendance</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
            <p className="text-sm font-bold text-emerald-600">{insight.bestDay?.day || "—"}</p>
            <p className="text-[10px] uppercase text-muted-foreground">Best Day ({insight.bestDay?.pct.toFixed(0)}%)</p>
          </div>
          <div className="rounded-lg bg-red-500/10 p-3 text-center">
            <p className="text-sm font-bold text-red-600">{insight.worstDay?.day || "—"}</p>
            <p className="text-[10px] uppercase text-muted-foreground">Worst Day ({insight.worstDay?.pct.toFixed(0)}%)</p>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Trend (last 7 days vs previous 7):</span>
          <Badge className={cn(
            insight.trend === "improving" ? "bg-emerald-500/15 text-emerald-700" :
            insight.trend === "declining" ? "bg-red-500/15 text-red-700" :
            "bg-muted text-muted-foreground"
          )}>
            {insight.trend === "improving" ? "📈 Improving" : insight.trend === "declining" ? "📉 Declining" : "➡️ Stable"}
          </Badge>
        </div>

        {/* Chronically absent */}
        {insight.chronicallyAbsent.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Chronically Absent (&lt; 75%)</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {insight.chronicallyAbsent.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span>{s.name}</span>
                  <Badge variant="outline" className="text-red-600 text-[10px]">{s.rate.toFixed(0)}%</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-primary/10 border border-blue-500/20 p-3">
          <p className="text-xs font-semibold text-blue-600 flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5" /> AI Recommendations
          </p>
          <ul className="space-y-1.5">
            {insight.recommendations.map((r, i) => (
              <li key={i} className="text-xs text-foreground leading-relaxed">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  };

  // ─── AI Feature: Smart Notifications ───
  const notificationsFeature = {
    id: "smart-notifications",
    title: "Smart Notifications",
    description: "AI generates contextual alerts based on current system state",
    icon: Sparkles,
    color: "text-accent",
    bgColor: "bg-accent/10",
    category: "Insights" as const,
    run: () => generateSmartNotifications({ students, teachers, staff, feeCollections, attendanceRecords }),
    render: (notifs: any[]) => (
      <div className="space-y-2">
        {notifs.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            All clear! No urgent actions needed.
          </div>
        ) : notifs.map((n, i) => (
          <div key={i} className={cn("rounded-lg border p-3 flex items-start gap-3",
            n.priority === "high" ? "border-red-500/30 bg-red-500/5" :
            n.priority === "medium" ? "border-yellow-500/30 bg-yellow-500/5" :
            "border-border/40 bg-muted/20"
          )}>
            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
              n.priority === "high" ? "bg-red-500" :
              n.priority === "medium" ? "bg-yellow-500" : "bg-muted-foreground"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
            </div>
            <Badge variant="outline" className={cn("text-[9px] capitalize shrink-0",
              n.priority === "high" ? "bg-red-500/10 text-red-600" :
              n.priority === "medium" ? "bg-yellow-500/10 text-yellow-600" :
              "bg-muted text-muted-foreground"
            )}>{n.priority}</Badge>
          </div>
        ))}
      </div>
    ),
  };

  // ─── AI Feature: Timetable Auto-Generate ───
  const timetableFeature = {
    id: "ai-timetable",
    title: "AI Timetable Generator",
    description: "Auto-create a complete weekly timetable with smart teacher assignment",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    category: "Schedule" as const,
    run: () => {
      const count = classes.length;
      const subjectCount = subjects.length;
      const teacherCount = teachers.length;
      return { count, subjectCount, teacherCount, message: "Go to Timetable module → select a class → click 'AI Auto-Generate' to create a smart schedule for any class." };
    },
    render: (data: any) => (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-purple-500/10 p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{data.count}</p>
            <p className="text-[10px] uppercase text-muted-foreground">Classes</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{data.subjectCount}</p>
            <p className="text-[10px] uppercase text-muted-foreground">Subjects</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{data.teacherCount}</p>
            <p className="text-[10px] uppercase text-muted-foreground">Teachers</p>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-3">
          <p className="text-xs leading-relaxed">{data.message}</p>
        </div>
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setActiveModule("timetable")}>
          <Calendar className="w-4 h-4 mr-1.5" />Go to Timetable Module
        </Button>
      </div>
    ),
  };

  const features = [defaulterFeature, attendanceFeature, notificationsFeature, timetableFeature];

  return (
    <div className="space-y-3 fade-in">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-accent p-5 text-primary-foreground shadow-lg">
        <div className="absolute inset-0 opacity-10 pattern-grid" />
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-2 ring-white/30 shadow-lg shrink-0">
            <Brain className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold tracking-tight">AI Assistant</h2>
            <p className="text-sm text-white/75 mt-0.5">Smart algorithms that analyze your school data and generate insights, predictions, and recommendations — automatically.</p>
          </div>
          <Badge className="bg-white/20 text-white border-0 shrink-0">
            <Sparkles className="w-3 h-3 mr-1" /> {features.length} features
          </Badge>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5"><Users className="w-4 h-4 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Students</p><p className="text-xl font-bold">{students.filter(s => s.status === "Active").length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-1.5"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
          <div><p className="text-xs text-muted-foreground">Fee Defaulters</p><p className="text-xl font-bold text-red-600">{students.filter(s => s.outstandingAmount > 0).length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-accent/10 p-1.5"><Calendar className="w-4 h-4 text-accent" /></div>
          <div><p className="text-xs text-muted-foreground">Attendance Records</p><p className="text-xl font-bold">{attendanceRecords.length}</p></div>
        </CardContent></Card>
        <Card className="border-0 shadow-sm glass-card"><CardContent className="p-3 flex items-center gap-2">
          <div className="rounded-lg bg-purple-500/10 p-1.5"><Brain className="w-4 h-4 text-purple-600" /></div>
          <div><p className="text-xs text-muted-foreground">Teachers</p><p className="text-xl font-bold">{teachers.length}</p></div>
        </CardContent></Card>
      </div>

      {/* AI Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map(feature => {
          const Icon = feature.icon;
          const isActive = activeResult?.id === feature.id;
          const isLoading = loading === feature.id;
          return (
            <Card key={feature.id} className="border-0 shadow-sm glass-card overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", feature.bgColor)}>
                    <Icon className={cn("w-5 h-5", feature.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm">{feature.title}</CardTitle>
                      <Badge variant="outline" className="text-[9px] uppercase">{feature.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                  onClick={() => runFeature(feature.id, feature.run, feature.render)}
                >
                  {isLoading ? (
                    <><Sparkles className="w-4 h-4 mr-1.5 animate-pulse" />Analyzing...</>
                  ) : isActive ? (
                    <><Sparkles className="w-4 h-4 mr-1.5" />Re-run Analysis</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-1.5" />Run AI Analysis</>
                  )}
                </Button>
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    {feature.render(activeResult.data)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI capabilities banner */}
      <Card className="border-0 shadow-sm glass-card">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">All AI features work offline — no API calls, no data sent anywhere.</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                The AI engine runs entirely in your browser using smart algorithms. It analyzes your local data (students, fees, attendance, teachers) to generate predictions, insights, and recommendations. Everything stays on your device — perfect for offline school environments.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-0">100% Offline</Badge>
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-0">No API Keys</Badge>
                <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-0">Privacy First</Badge>
                <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-0">Instant Results</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
