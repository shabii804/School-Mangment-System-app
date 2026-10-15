# 🏫 School Management System

A comprehensive, offline-first school/college management desktop application built with **Next.js 16**, **React**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**. Designed for offline use with automatic data persistence via file-based JSON database.

## ✨ Features

### 28 Modules
- **Dashboard** — Real-time KPIs, fee collection status, charts
- **Students** — Full CRUD, admission, profile panel, ID cards, document vault
- **Teachers** — Subject assignment, class allocation, salary tracking
- **Staff** — Non-teaching staff management with departments
- **Classes** — Class management, sections, per-class fees
- **Timetable** — Visual grid editor + AI auto-generate
- **Attendance** — Per-student + per-staff, date picker, monthly tracking
- **Fee Collection** — Tuition + Admission + Hostel + Transport, PDF receipts
- **Defaulters** — Outstanding fee tracking, CSV export
- **Salary & Fine** — Payroll calculation, attendance-based deductions, PDF slips
- **Income & Expense** — Ledger with income/expense tracking
- **Concessions** — Fee waivers (percentage/fixed) with auto-apply
- **Results** — Grade entry, report cards, class analytics
- **Examinations** — Exam scheduling, seating plans
- **Certificates** — Bonafide, leaving, character certificates with PDF
- **Reports** — 10 report types with PDF + CSV export
- **Analytics** — Real-time school performance insights
- **Library** — Book catalog, issue/return tracking
- **Transport** — Bus routes, capacity tracking
- **Hostel** — Room allocation, mess management
- **Inventory** — Stock management with low-stock alerts
- **Event Calendar** — School events, holidays, PTMs
- **Discipline** — Incident logging, parent notification
- **Staff Leave** — Leave requests, approvals, balance tracking
- **Alumni** — Graduated students network
- **Parent Portal** — Student info lookup
- **AI Assistant** — Smart predictions, insights, and notifications

### AI Features (100% Offline)
- **Defaulter Prediction** — Risk scoring based on payment patterns
- **Attendance Insights** — Pattern analysis, worst-day detection, trend tracking
- **Smart Notifications** — Auto-generated alerts (defaulters, birthdays, low attendance)
- **Timetable Auto-Generate** — Smart scheduling with teacher conflict prevention
- **Report Comments** — AI-generated personalized student comments

### Dynamic Fee System
- **One-time fees** (Admission, Library Security) — charged once at admission
- **Annual fees** (Registration, Exam) — charged per academic year
- **Monthly fees** (Tuition, Hostel, Transport) — charged every month
- Admin can add/edit/disable any fee type from Settings → Fee Structure
- Flat amounts (not multiplied by tuition) — same fee for all classes

### Data Persistence
- **File-based JSON database** (`school-data.json`) — source of truth
- **localStorage cache** — offline-first, instant load
- **Auto-sync** — changes saved to JSON database automatically (5-second debounce)
- **Backup & Restore** — download JSON backup, reset all data
- Data survives server restarts and page reloads

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or bun

### Installation
```bash
npm install
# or
bun install
```

### Development
```bash
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed Test Data
```bash
node scripts/seed-data.js
```
This populates the database with:
- 20 students (4 per class, Grade 6-10)
- 5 teachers with subjects
- 5 classes with sections and fees
- 5 subjects
- School info (Greenwood Public School)
- Dynamic fee structure (8 fee items)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| State Management | Zustand + localStorage |
| Database | File-based JSON (server-side) |
| PDF Generation | jsPDF |
| Charts | Recharts |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/state/route.ts    # JSON database API
│   ├── page.tsx              # Main app entry
│   └── globals.css           # Global styles
├── components/
│   └── sms/
│       ├── Sidebar.tsx       # Dark navigation sidebar
│       ├── Topbar.tsx        # Top bar with search, notifications
│       ├── CommandPalette.tsx # Ctrl+K command palette
│       ├── KpiCard.tsx       # KPI card component
│       └── modules/          # 28 feature modules
├── lib/
│   ├── sms-store.ts          # Zustand store with persistence
│   ├── sms-data.ts          # TypeScript types & empty data
│   ├── db.ts                # File-based JSON database
│   ├── ai-engine.ts          # 8 AI algorithms
│   ├── pdf-service.ts        # PDF/CSV generation
│   └── use-now-tick.ts       # Timer hook for midnight updates
└── scripts/
    └── seed-data.js          # Seed script
```

## 🔧 Configuration

### Fee Structure
Go to **Settings → Fee Structure** to:
- Add/edit/disable fee types (one-time, annual, monthly)
- Set per-class tuition fees
- Configure hostel fee, late fee, due date

### Module Control
Go to **Settings → Modules** to:
- Enable/disable any of the 28 modules
- Modules toggle instantly in the sidebar

### School Info
Go to **Settings → School** to:
- Set school name, tagline, address, phone, email
- Upload school logo
- Change academic session (with fee reset)

## 📄 License

This project is private and proprietary.

## 👤 Author

**shabii804**
GitHub: [@shabii804](https://github.com/shabii804)
