"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/sms-store";
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

export default function Home() {
  const { activeModule, isDark, setCommandOpen } = useAppStore();

  // Apply dark class to <html>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark]);

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

  const renderModule = () => {
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
      default: return <DashboardModule />;
    }
  };

  return (
    <div className="app-bg h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div key={activeModule} className="fade-in max-w-[1600px] mx-auto">
            {renderModule()}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
