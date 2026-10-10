"use client";

import { useEffect } from "react";
import { useAppStore, enableAutoSync } from "@/lib/sms-store";
import { Sidebar } from "@/components/sms/Sidebar";
import { Topbar } from "@/components/sms/Topbar";
import { CommandPalette } from "@/components/sms/CommandPalette";
import { DashboardModule } from "@/components/sms/modules/Dashboard";
import { StudentsModule } from "@/components/sms/modules/Students";
import { TeachersModule, StaffModule } from "@/components/sms/modules/TeachersStaff";
import { ClassesModule, TimetableModule } from "@/components/sms/modules/ClassesTimetable";
import { AttendanceModule } from "@/components/sms/modules/Attendance";
import { FeesModule, DefaultersModule } from "@/components/sms/modules/Fees";
import { SalaryModule } from "@/components/sms/modules/Salary";
import { ResultsModule, CertificatesModule } from "@/components/sms/modules/ResultsCertificates";
import { ReportsModule, AnalyticsModule } from "@/components/sms/modules/ReportsAnalytics";
import { UsersModule, SettingsModule } from "@/components/sms/modules/UsersSettings";
import { LedgerModule } from "@/components/sms/modules/Ledger";
import { ExamModule } from "@/components/sms/modules/ExamModule";
import { LibraryModule, TransportModule, HostelModule, InventoryModule, EventsModule } from "@/components/sms/modules/NewModules";
import { DisciplineModule, AlumniModule, ParentModule } from "@/components/sms/modules/DisciplineAlumni";
import { LeaveModule, ConcessionModule } from "@/components/sms/modules/LeaveConcession";
import { AIAssistantModule } from "@/components/sms/modules/AIAssistant";
import { Settings, Power } from "lucide-react";

export default function Home() {
  const { activeModule, isDark, setCommandOpen, enabledModules, setActiveModule, syncStatus, lastSyncAt, loadFromDatabase, dbStats } = useAppStore();

  // Apply dark class to <html>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark]);

  // ─── On first mount: load from SQLite (source of truth) ───
  // Falls back to localStorage cache if SQLite is unavailable (offline mode)
  useEffect(() => {
    loadFromDatabase().then((ok) => {
      if (ok) {
        console.log("[Sync] Loaded from SQLite — data is fresh");
      } else {
        console.log("[Sync] Using localStorage cache (offline mode)");
      }
      // Enable auto-sync AFTER initial load completes — this prevents the subscribe block
      // from overwriting seeded data with the initial empty state
      setTimeout(() => enableAutoSync(), 100);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Listen for online/offline events ───
  useEffect(() => {
    const handleOnline = () => {
      console.log("[Sync] Back online — syncing to SQLite");
      loadFromDatabase();
    };
    const handleOffline = () => {
      useAppStore.setState({ syncStatus: "offline" });
      console.log("[Sync] Went offline — using localStorage cache");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Global keyboard shortcut: Ctrl/Cmd+K opens command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  // If module is disabled (and not always-on), show fallback
  const isAlwaysOn = activeModule === "dashboard" || activeModule === "settings";
  const isDisabled = !isAlwaysOn && enabledModules[activeModule] === false;

  const renderModule = () => {
    if (isDisabled) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-4 ring-1 ring-border/40 shadow-lg">
              <Power className="w-9 h-9 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Module Disabled</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This module has been turned off in settings. Re-enable it from the Module Control Center to access it again.
            </p>
            <button
              onClick={() => setActiveModule("settings")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md"
            >
              <Settings className="w-4 h-4" />
              Go to Module Settings
            </button>
          </div>
        </div>
      );
    }
    switch (activeModule) {
      case "dashboard": return <DashboardModule />;
      case "students": return <StudentsModule />;
      case "teachers": return <TeachersModule />;
      case "staff": return <StaffModule />;
      case "classes": return <ClassesModule />;
      case "timetable": return <TimetableModule />;
      case "attendance": return <AttendanceModule />;
      case "fees": return <FeesModule />;
      case "defaulters": return <DefaultersModule />;
      case "salary": return <SalaryModule />;
      case "results": return <ResultsModule />;
      case "certificates": return <CertificatesModule />;
      case "reports": return <ReportsModule />;
      case "analytics": return <AnalyticsModule />;
      case "users": return <UsersModule />;
      case "settings": return <SettingsModule />;
      case "ledger": return <LedgerModule />;
      case "exam": return <ExamModule />;
      case "library": return <LibraryModule />;
      case "transport": return <TransportModule />;
      case "hostel": return <HostelModule />;
      case "inventory": return <InventoryModule />;
      case "events": return <EventsModule />;
      case "discipline": return <DisciplineModule />;
      case "alumni": return <AlumniModule />;
      case "parent": return <ParentModule />;
      case "leave": return <LeaveModule />;
      case "concession": return <ConcessionModule />;
      case "ai": return <AIAssistantModule />;
      default: return <DashboardModule />;
    }
  };

  return (
    <div className="app-bg h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4">
          <div key={activeModule} className="fade-in max-w-[1400px] mx-auto">
            {renderModule()}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
