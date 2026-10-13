# Knight AI — Personalized Interview Preparation Assistant

> **Your Referral. Your Roadmap. Your Next Opportunity.**
> Turn your career opportunities into structured, personalized preparation plans with AI-driven task scheduling, progress tracking, and adaptive replanning.

---

## 1. Product Overview & Vision

Receiving a job referral or an interview invitation creates an incredible opportunity, but candidates often struggle with:
- Deciding **what** to practice each day across DSA, System Design, Core CS, and Behavioral questions.
- Balancing preparation workloads within their daily study capacity.
- Adapting their schedule when they miss a study day without having their entire timeline derail.

**Knight AI** bridges this gap by transforming target roles and deadlines into an adaptive, day-by-day roadmap. It supports referral candidates, direct applicants, campus placements, and internship conversions.

---

## 2. Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript strict mode).
- **Styling & Design System**: Tailwind CSS v4, Lucide Icons, and accessible custom UI primitives adhering to a SaaS design aesthetic.
- **Charts & Data Visualization**: Recharts for velocity charts and category mastery metrics.
- **Database & Persistence**: PostgreSQL with [Prisma ORM](https://www.prisma.io/). Includes a development memory repository fallback for offline/credential-free testing.
- **Authentication**: Secure password hashing with `bcryptjs`, tamper-proof HTTP-only JWT sessions with `jose`, and server-side route authorization.
- **AI Engine**: Google Gemini API (`@google/genai`) with structured JSON schema outputs and bounded retry validation, backed by an offline deterministic demo provider.
- **Automated Testing**: [Vitest](https://vitest.dev/) for unit and integration testing.

---

## 3. Core Features

### A. Intelligent Onboarding Wizard
- Multi-step flow gathering target company, role seniority, application source (referral, direct, campus, etc.), interview format, programming languages, and areas needing improvement.
- Configurable study capacity (e.g. 1–8 hours/day) and planning horizons (14, 21, 30, 45, or 60 days).
- Never invents an interview date without candidate confirmation.

### B. AI Preparation Plan Generation
- Formulates a phased roadmap (Foundations → Core High-Yield Topics → Mock Interviews & Behavioral Polish).
- Allocates daily tasks with specific duration bounds, completion criteria, and curated search references.
- Bounded daily workloads that never exceed the candidate's stated study hours.
- Automatic fallback to a deterministic engine when `GEMINI_API_KEY` is not provided or demo mode is active.

### C. Authenticated Dashboard & Real-Time Metrics
- Answers key candidate questions at a glance: *What should I work on today? How far have I progressed? What is coming next?*
- Live statistics computed from verified database records: completion percentage, planned study hours, active roadmaps, and overdue counts.
- Interactive checkboxes that update task status in real time and refresh analytics.
- 7-Day completion velocity chart and immediate focus recommendations.

### D. Adaptive Scheduling & Replanning (Core Differentiator)
- When a candidate misses study sessions or deadlines shift, the **Adaptive Replan** evaluates unfinished and overdue work.
- **Preserves all completed tasks 100% intact**.
- Generates a preview diff displaying:
  - Preserved completed tasks count
  - Rescheduled tasks (Current date → Proposed date, with reason)
  - Deferred lower-priority tasks if total workload exceeds remaining capacity
- Requires candidate review and explicit confirmation before persisting changes.

### E. Task Management & Calendar Agenda
- Full task catalog with search and filters by category (`DSA`, `SYSTEM_DESIGN`, `CORE_CS`, `BEHAVIORAL`, `MOCK_INTERVIEW`, etc.), priority, and status.
- Task detail view with completion criteria and candidate learning notes field.
- Interactive monthly calendar with daily task badges and date-specific chronological agendas.

### F. Resume & Job-Description Analysis
- Upload or paste resume credentials and optional target job descriptions.
- Highlights demonstrated technical competencies vs. missing requirements.
- Provides an estimated alignment score and actionable study adjustments.

---

## 4. Getting Started Locally

### Prerequisites
- **Node.js**: v20+ (tested on Node v24).
- **npm**: v10+.
- *(Optional)* **PostgreSQL** or **Docker** for running local PostgreSQL.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your variables:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/knight_ai"

# Auth Session Secret (at least 32 characters)
AUTH_SECRET="knight-ai-dev-secret-key-replace-in-production-at-least-32-chars"

# Google Gemini API Key (Optional — works in Demo Mode if left empty)
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-1.5-flash"

# AI Demo Mode flag ("false" or "true")
AI_DEMO_MODE="false"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Database Setup

#### Option A: Using Docker Compose (Recommended if Docker is installed)
```bash
docker compose up -d
npm run prisma:push
```

#### Option B: Using Local PostgreSQL
Ensure your PostgreSQL server is running, create database `knight_ai`, and run:
```bash
npm run prisma:push
```

#### Option C: In-Memory / Demo Mode (No Database Server Required)
If PostgreSQL credentials are not available, Knight AI's built-in repository will automatically use the high-performance memory store, allowing complete end-to-end functionality, plan creation, task completion, and testing right out of the box!

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Instant Demo Account

For rapid evaluation and testing, you can use the built-in 1-Click Demo Login on `/login`:
- **Email**: `demo@knightai.dev`
- **Password**: `Password123!`

Click **"Sign In as Demo Candidate (1-Click)"** on the login page to immediately load a pre-configured Google L4 interview roadmap with realistic task history, metrics, and scheduled items.

---

## 6. Running Tests

Run the automated Vitest test suite:
```bash
npm test
```

Build the production bundle:
```bash
npm run build
```

---

## 7. Project Architecture

```
knight-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Public landing page
│   │   ├── login/page.tsx               # Sign in page with 1-click demo
│   │   ├── register/page.tsx            # Account registration
│   │   ├── onboarding/page.tsx          # Multi-step roadmap creation wizard
│   │   ├── dashboard/page.tsx           # Real-time dashboard & metrics
│   │   ├── plans/
│   │   │   ├── page.tsx                 # Plans list & management
│   │   │   └── [id]/page.tsx            # Plan overview & adaptive replan modal
│   │   ├── tasks/
│   │   │   ├── page.tsx                 # Searchable & filtered task list
│   │   │   └── [id]/page.tsx            # Task details, notes & status selector
│   │   ├── calendar/page.tsx            # Monthly calendar & day agenda
│   │   ├── progress/page.tsx            # Performance analytics & category charts
│   │   ├── resume-analysis/page.tsx     # Resume skill-gap analyzer
│   │   ├── settings/page.tsx            # Candidate profile & AI engine status
│   │   └── api/                         # Route handlers (auth, plans, tasks, replan, analytics)
│   ├── components/
│   │   ├── layout/                      # Sidebar, AppShell, PublicNavbar
│   │   └── ui/                          # Button, Card, Badge, Dialog, Skeleton
│   └── lib/
│       ├── ai/                          # Gemini client, prompt builders, replanner, demo provider
│       ├── validations/                 # Zod validation schemas
│       ├── auth.ts                      # Secure hashing & JWT cookie sessions
│       ├── db.ts                        # Prisma singleton & fallback store
│       └── repository.ts                # Unified data access layer
├── prisma/
│   ├── schema.prisma                    # PostgreSQL schema definition
│   └── seed.ts                          # Development seed script
├── tests/
│   ├── business-logic.test.ts           # Business rules, replan & auth tests
│   └── smoke.test.ts                    # System smoke tests
└── docker-compose.yml                   # Optional local PostgreSQL container
```

---

## 8. License

MIT License. Designed and built for candidate career preparation.
