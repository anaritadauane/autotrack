# Roadmap: AutoTrack

## Overview

Mobile-first web app for vehicle document management in Mozambique. Users track insurance, inspection, and road tax expiry dates across their vehicles. Built on React + Supabase. Target: closed beta with real users.

## Current Milestone

**v0.1 MVP Release** (v0.1.0)
Status: In progress
Phases: 0 of 5 complete

---

## Phases

| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Codebase Audit & Foundation | Not started | - |
| 2 | Vehicle CRUD & Document Status | Not started | - |
| 3 | Notifications & Alerts | Not started | - |
| 4 | Payments & History | Not started | - |
| 5 | Polish & Beta Prep | Not started | - |

---

## Phase Details

### Phase 1 — Codebase Audit & Foundation

**Goal:** App boots, auth works end-to-end, all screens render without errors. No broken imports, no console errors, Supabase connection verified.

**Why first:** Nothing else matters if the app crashes or auth is broken.

| # | Task | Files | Priority |
|---|------|-------|----------|
| 1.1 | Audit all imports, fix broken or missing dependencies | All src files | BLOCKER |
| 1.2 | Verify Supabase auth flow (login → session → dashboard) | LoginScreen.tsx, App.tsx, client.tsx | BLOCKER |
| 1.3 | Verify API endpoint wiring (apiRequest helper hits edge function) | client.tsx, server/index.tsx | High |
| 1.4 | Fix any TypeScript errors | All src files | High |
| 1.5 | Confirm all screens render without crashing | All screen components | High |

**Done when:** Fresh login → dashboard → all screens accessible, zero console errors.

---

### Phase 2 — Vehicle CRUD & Document Status

**Goal:** Users can add, view, edit, and delete vehicles. Document status (valid/warning/expired) renders correctly and persists to Supabase.

**Why second:** The core product loop — add a vehicle, see its document health.

| # | Task | Files | Priority |
|---|------|-------|----------|
| 2.1 | Wire VehicleForm to Supabase (create vehicle) | VehicleForm.tsx, server/index.tsx | BLOCKER |
| 2.2 | Wire DashboardScreen to fetch and display user vehicles | DashboardScreen.tsx | BLOCKER |
| 2.3 | Wire VehicleDetails to fetch single vehicle + edit | VehicleDetails.tsx, VehicleForm.tsx | High |
| 2.4 | Add delete vehicle with confirmation | VehicleDetails.tsx | High |
| 2.5 | Validate document status computation (warn at 30 days, expired at 0) | VehicleDocumentStatus.tsx, vehicle.ts | High |
| 2.6 | Add empty state when user has no vehicles | DashboardScreen.tsx | Medium |

**Done when:** Full vehicle lifecycle works. Dashboard shows real data. Document statuses reflect actual dates.

---

### Phase 3 — Notifications & Alerts

**Goal:** Users are warned about expiring documents. In-app notification center shows upcoming expirations. No silent expiries.

| # | Task | Files | Priority |
|---|------|-------|----------|
| 3.1 | Compute upcoming expirations (next 30 days) on dashboard load | DashboardScreen.tsx | Required |
| 3.2 | Wire NotificationsCenter to show real expiry alerts | NotificationsCenter.tsx | Required |
| 3.3 | Add notification badge count on bottom nav when alerts exist | BottomNavigation.tsx | Required |
| 3.4 | Add per-vehicle warning banner in VehicleDetails when docs expiring | VehicleDetails.tsx | Medium |

**Done when:** A vehicle with a document expiring in < 30 days triggers a visible alert everywhere — dashboard, notifications center, and vehicle detail.

---

### Phase 4 — Payments & History

**Goal:** Payment records for document renewals are functional. History screen shows a real log of past events.

| # | Task | Files | Priority |
|---|------|-------|----------|
| 4.1 | Define payment data model and Supabase table | types/vehicle.ts, server/index.tsx | Required |
| 4.2 | Wire PaymentsScreen to create and list payment records | PaymentsScreen.tsx | Required |
| 4.3 | Wire HistoryScreen to show sorted event log | HistoryScreen.tsx | Required |
| 4.4 | Link payments to vehicle document renewals | PaymentsScreen.tsx, VehicleDetails.tsx | Medium |

**Done when:** User can log a payment for a document renewal. History shows a real timeline of vehicle events.

---

### Phase 5 — Polish & Beta Prep

**Goal:** App is visually complete, performant on mobile, ready for 10 beta testers.

| # | Task | Files | Priority |
|---|------|-------|----------|
| 5.1 | Mobile UX audit — fix tap targets, spacing, scroll issues | All screens | Required |
| 5.2 | Loading states and error feedback on all async operations | All screens | Required |
| 5.3 | User profile — edit name, avatar, account settings | UserProfileScreen.tsx | Required |
| 5.4 | StatsComparison component — wire to real vehicle data | StatsComparison.tsx | Medium |
| 5.5 | Write tester instructions and deploy to staging URL | External | Required |
| 5.6 | Verify app on real mobile device | Device | Required |

**Done when:** 10 testers have the URL, can create an account, add a vehicle, and see document status.

---

## Post-Beta Backlog (v1.1+)

- Push notifications / email reminders for expiring documents
- SMS integration (Mozambique carriers)
- Document scan / photo upload
- Multi-vehicle household management
- Fleet operator view (10+ vehicles)
- Dark mode
- Offline support
- CSV export

---
*Roadmap created: 2026-06-08*
