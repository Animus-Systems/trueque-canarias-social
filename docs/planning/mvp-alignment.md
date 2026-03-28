# MVP Alignment

Date: 2026-03-28

This document reconciles the original planning documents (product brief, PRD, architecture doc, sprint plan) with the current codebase. It records what is implemented, what deviates from the plan, what is deferred, and freezes the API and data model for the next phase of work.

---

## Implemented MVP stories

All six planned user stories are implemented end-to-end (API + UI + tests):

| Story | Summary | Status |
|-------|---------|--------|
| US-01 | Search equivalents by skill/item name | Done |
| US-02 | Display confidence scores | Done |
| US-03 | Session-based reputation | Done |
| US-04 | Submit new equivalents | Done |
| US-05 | View contribution history | Done |
| US-06 | Feedback buttons (helpful/not helpful) | Done |

---

## Intentional deviations from architecture doc

The architecture doc proposed several components that were simplified or replaced during implementation. These are intentional decisions, not gaps.

| Architecture doc | Actual implementation | Reason |
|------------------|-----------------------|--------|
| Redis for session store and query cache | PostgreSQL-only via `app_sessions` table | One fewer dependency for MVP; PostgreSQL is sufficient at this scale |
| ORM (Prisma or Drizzle) | Raw `pg` queries in `repository.ts` | Lighter footprint; direct control over SQL; sufficient for current query complexity |
| Client-side SHA-256 token generation with server-side hash storage | Server-generated UUID stored as httpOnly cookie | Simpler, achieves the same zero-PII goal; no client-side crypto needed |
| Service Worker / PWA with offline support | Standard React SPA (no service worker) | Deferred; offline support is not MVP-critical |
| Zustand/Jotai state management | React useState hooks | App state is small; no state library needed yet |
| Helmet.js security headers | None yet | Deferred to foundation hardening |
| Rate limiting middleware | None yet | Deferred to moderation phase |
| Full-text search via `to_tsvector` (Spanish) | `pg_trgm` similarity + ILIKE | Trigram search handles the current use case; full-text search can be layered later |
| Cookie name `tc_session_id` | `tcs_session_id` | Minor naming difference; no impact |
| `sessions` table with `session_hash` column | `app_sessions` table with UUID `id` column | Simplified; hash-based session not needed when using httpOnly cookies |
| Separate `contributions` and `feedback` tables | `equivalents` table (with `created_by_session`) + `feedback_votes` table | Flatter schema; contributions are equivalents, not a separate entity |

---

## Frozen API surface

Five tRPC procedures exposed via both `/trpc` and `/api` (OpenAPI):

| Procedure | Method | Path | Purpose |
|-----------|--------|------|---------|
| `session.get` | GET | `/session` | Return current anonymous session |
| `equivalents.search` | GET | `/equivalents/search` | Search approved equivalents |
| `equivalents.submit` | POST | `/equivalents` | Submit new equivalent (pending) |
| `contributions.history` | GET | `/contributions` | Get session contribution history |
| `feedback.vote` | POST | `/feedback` | Submit helpful/not helpful vote |

---

## Frozen data model

Three application tables (plus `schema_migrations`):

| Table | Purpose |
|-------|---------|
| `app_sessions` | Anonymous sessions with UUID id and integer reputation |
| `equivalents` | Skill/item exchange rates with status, votes, and generated confidence score |
| `feedback_votes` | Per-session votes on equivalents (unique per session+equivalent) |

---

## Deferred to post-MVP

| Item | Target phase | Notes |
|------|-------------|-------|
| Moderation workflow (approve/reject pending) | Phase 4 | Admin-only initially |
| Anti-spam and rate limiting | Phase 4 | Rate-limit middleware + anomaly detection |
| Seed data ingestion pipeline | Phase 5 | Repeatable import with source attribution |
| AI fallback valuation | Phase 6 | Must be labeled, reviewable, not auto-trusted |
| Tax traffic-light guidance | Phase 7 | Legal review required first |
| Privacy and non-marketplace framing UX | Phase 7 | Legal positioning |
| Advanced search filters (category, island) | Phase 8 | Growth feature |
| Reputation dashboard | Phase 8 | Growth feature |
| Social sharing | Phase 8 | Growth feature |
| PWA / service worker / offline | Phase 8 | Growth feature |
| Mobile app | Phase 8 | Growth feature |
| Multi-island support | Phase 8 | Growth feature |

---

## Backlog for immediate next work

1. Foundation hardening (env validation, startup checks, error handling, graceful shutdown)
2. MVP user journey polish (accessibility, empty states, form validation UX, feedback reason capture)
3. Moderation and community quality controls
