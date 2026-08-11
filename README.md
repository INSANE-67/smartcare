# SmartCare

**AI-Powered Healthcare Management & Patient Assistance Platform**

SmartCare is an academic software project built as a college demonstration of a modern, full-stack healthcare management system. It is **not** a clinically validated medical device or real emergency-response system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| UI | React 19 + Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Authorization | PostgreSQL Row Level Security (RLS) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| State | Zustand (when genuinely needed) |
| AI | Server-side abstraction layer |
| Deployment | Vercel |

---

## Local Development Setup

### Prerequisites

- Node.js v20 or later
- npm v10 or later
- A Supabase project (when connecting the database)

### 1. Clone the repository

```bash
git clone https://github.com/INSANE-67/smartcare.git
cd smartcare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

> **Never commit `.env.local`.** It is gitignored by default.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Lint

```bash
npm run lint
```

### 6. Build (production check)

```bash
npm run build
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication routes (login, register)
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── globals.css      # Global styles (Tailwind v4)
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing / home page
├── components/
│   └── ui/              # Shared primitive UI components
├── lib/
│   ├── supabase/        # Supabase client setup
│   ├── ai/              # AI abstraction layer (server-only)
│   └── utils.ts         # Shared utilities
├── types/
│   └── index.ts         # Shared TypeScript types
└── hooks/               # Custom React hooks
```

---

## Security & Medical Safety Notes

- Supabase service-role credentials are **never** exposed to the browser.
- All secrets are managed through environment variables.
- Database authorization uses PostgreSQL Row Level Security (RLS).
- Patient medical information is never exposed across users without appropriate authorization.
- AI features assist with healthcare information only — they do **not** diagnose, prescribe, or claim clinical certainty.
- AI-generated content is always clearly distinguishable from original medical records.

---

## Development Workflow

```
PLAN → IMPLEMENT → RUN → BROWSER TEST → FIX → TEST AGAIN → GIT COMMIT
```

- Feature branches are used for all feature development.
- Commits are kept small and meaningful.
- `main` is never modified without team approval.

---

## License

Academic project — not for clinical or commercial use.
