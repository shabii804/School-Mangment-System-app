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
- **SQLite** (default, via `better-sqlite3`) — synchronous, fast, transactional
- **File-based JSON store** (`school-data.json`) — automatic fallback if `better-sqlite3` fails to load
- **localStorage cache** — offline-first, instant load on the client
- **Auto-sync** — changes saved to the backend automatically (5-second debounce)
- **Backup & Restore** — download JSON backup, reset all data
- **Health check** — `GET /api/state/health` returns `{backend: "sqlite" | "file", ok, dbPath, responseTimeMs}`
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
This writes seed data directly to `school-data.json` (the file-based fallback store). With SQLite as the active backend, you have two options to load the seed:

**Option A — Auto-import the file-based seed into SQLite** (recommended):
```bash
node scripts/seed-data.js   # writes school-data.json
# Then start the server and POST the JSON to /api/state:
npm run dev
# In another terminal:
node -e "const fs=require('fs'); const state=JSON.parse(fs.readFileSync('school-data.json','utf8')); fetch('http://localhost:3000/api/state', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({state})}).then(r=>r.json()).then(d=>console.log('Seeded SQLite:', d));"
```

**Option B — Inspect/seed SQLite directly**:
```bash
sqlite3 school-data.db < schema.sql   # optional — adapter auto-creates on first run
sqlite3 school-data.db "SELECT key, LENGTH(value) AS bytes FROM app_state;"
```

The seed populates:
- 20 students (4 per class, Grade 6-10)
- 5 teachers with subjects
- 5 classes with sections and fees
- 5 subjects
- School info (Greenwood Public School)
- Dynamic fee structure (8 fee items)

### SQLite Configuration

The app uses SQLite by default — no setup required. The database
file is auto-created at `./school-data.db` on first run.

**Customize the database file location** via env var:
```env
# In .env (absolute or relative to project root)
SQLITE_DB_PATH=/var/lib/school-management/data.db
```

**Verify the backend is active**:
```bash
curl http://localhost:3000/api/state/health
# Expected: {"success":true,"backend":"sqlite","dbPath":"...","responseTimeMs":1}
```

**Inspect the database directly** (the schema is documented in `schema.sql`):
```bash
sqlite3 school-data.db "SELECT key, LENGTH(value) AS bytes, updated_at FROM app_state;"
sqlite3 school-data.db "SELECT * FROM app_meta;"
```

**Why SQLite?**
- Synchronous API (via `better-sqlite3`) matches the existing `db.ts` contract — no async changes needed in API routes
- 3-10x faster than the async `sqlite3` driver
- WAL journal mode enables concurrent reads during writes
- Single-file deployment — no separate database server
- Prebuilt native binaries for Linux/macOS/Windows (no node-gyp required)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| State Management | Zustand + localStorage |
| Database | SQLite (better-sqlite3) with file-based JSON fallback |
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
