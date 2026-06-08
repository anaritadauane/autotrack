# AutoTrack

## What This Is

AutoTrack is a mobile-first web application for vehicle document management, built for the Mozambican market. Users register their vehicles and track the status of three critical documents — insurance, inspection, and road taxes — with visual warnings when documents are about to expire or have already lapsed.

## Core Value

Vehicle owners know at a glance which documents are valid, which are expiring soon, and which have already expired — without spreadsheets or manual reminders.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Web Application (mobile-first) |
| Version | 0.1.0 |
| Status | Prototype — functional shell, needs polish and hardening |
| Last Updated | 2026-06-08 |

**Production URLs:**
- Supabase backend: `https://{projectId}.supabase.co`
- Edge function: `https://{projectId}.supabase.co/functions/v1/make-server-b763bb62`

## Requirements

### Core Features

- **Vehicle registration** — add vehicles with plate, make, model, year, color, VIN
- **Document tracking** — insurance, inspection, and taxes with expiry dates and status (valid / warning / expired)
- **Dashboard** — overview of all vehicles with document health at a glance
- **History** — log of past document updates and events
- **Payments** — track document renewal payments
- **User profile** — account management, avatar, settings
- **Authentication** — email/password login and session persistence via Supabase Auth

### Validated (Shipped)

- Supabase Auth integration with session persistence
- `Vehicle` type model with insurance, inspection, taxes sub-objects
- All screen components scaffolded: Login, Dashboard, History, Payments, UserProfile
- Bottom navigation between screens
- VehicleCard, VehicleForm, VehicleDetails, VehicleDocumentStatus components
- Document status badge logic (valid / warning / expired)
- Radix UI + Tailwind component library wired up
- Vite build pipeline

### Active (In Progress)

None — Phase 1 planning next.

### Planned (Next)

See ROADMAP.md for full phase breakdown.

### Out of Scope (v1)

- Native mobile app (iOS/Android)
- Push notifications (planned post-launch)
- SMS/email reminders
- Multi-user households or fleet management
- OCR / document scanning
- Dark mode
- Offline mode
- Multi-currency or multi-language toggle

## Target Users

**Primary:** Individual vehicle owners in Mozambique
- Own 1–3 vehicles
- Need reminders for annual inspection (INAV), insurance, and road tax (IPVA equivalent)
- Not using any tool currently — rely on memory or WhatsApp reminders

**Secondary:** Small informal fleet operators (taxis, delivery)
- Manage 2–10 vehicles
- Need a simple overview of which vehicles have valid documents

## Constraints

### Technical Constraints

- React 18 + TypeScript + Vite — no Next.js, no SSR
- Supabase for auth, database, and edge functions (Hono backend)
- Mobile-first layout capped at `max-w-md` — not a desktop app
- `@jsr/supabase__supabase-js` used alongside `@supabase/supabase-js` — keep both until consolidated
- No unit tests currently exist

### Business Constraints

- Target: closed beta before public release
- Solo or small team — scope must stay tight
- Portuguese-language UI — all user-facing text in PT
- Mozambique market — document types and naming must match local context (INAV, seguro, imposto)

## Key Decisions

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| React + Vite over Next.js | Simpler deployment, Supabase handles SSR needs | 2026-06-08 | Active |
| Supabase Auth + Edge Functions | Managed backend, no infra to maintain | 2026-06-08 | Active |
| Mobile-first max-w-md | Primary users are on phones | 2026-06-08 | Active |
| Radix UI + Tailwind | Accessible components, fast styling | 2026-06-08 | Active |
| Portuguese UI | Target market is Mozambique | 2026-06-08 | Active |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| App loads without error | 100% | Unknown | Not tested |
| Login → Dashboard flow works | 100% | Unknown | Not tested |
| Vehicle CRUD works end-to-end | 100% | Unknown | Not tested |
| Document status renders correctly | 100% | Unknown | Not tested |
| Beta testers onboarded | 10 | 0 | Not started |

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Language | TypeScript | |
| UI Framework | React 18 | |
| Build | Vite 6 | |
| Styling | Tailwind CSS + Radix UI | shadcn/ui component pattern |
| Animation | Framer Motion | |
| Charts | Recharts | |
| Auth | Supabase Auth | Session persistence via localStorage |
| Database | Supabase (Postgres) | |
| Backend | Supabase Edge Functions (Hono) | `make-server-b763bb62` |
| Deployment | TBD | |

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/anaritadauane/autotrack |

---
*PROJECT.md — Updated when requirements or context change*
*Created: 2026-06-08*
