# Implementation Roadmap

This roadmap translates the original planning set into a practical execution plan based on the current repository state.

It assumes the current stack remains:

- TypeScript
- Express + tRPC
- OpenAPI via `trpc-openapi`
- PostgreSQL
- React + Vite frontend

## Current baseline

The repository already has a working foundation:

- PostgreSQL-backed API
- React frontend
- anonymous session cookie flow
- search
- confidence score display
- contribution submission
- contribution history
- feedback voting

The remaining work is mostly about product completeness, moderation, data quality, legal/trust UX, and future data/AI layers.

## Phase 1: MVP alignment

Goal: lock the real MVP scope against the original brief and current code.

Deliverables:

- Decide which planned items are:
  - MVP now
  - post-MVP
  - deferred
- Record any intentional deviations from the original brief
- Freeze API and data model boundaries for the next implementation phase

Key decisions to make:

- Whether moderation is MVP or immediate post-MVP
- Whether tax/legal guidance is MVP
- Whether AI fallback is deferred until data quality controls exist

Definition of done:

- brief, PRD, and current repo direction are reconciled
- one clear backlog exists for implementation work

## Phase 2: Foundation hardening

Goal: make the current stack reliable enough for continued feature delivery.

Deliverables:

- env validation and startup checks
- clearer typed error envelopes
- API integration tests against the real repository layer
- better logging and failure diagnostics
- safer database and migration docs

Focus areas:

- database connectivity handling
- migration repeatability
- API error consistency
- security and input sanitization

Definition of done:

- `yarn typecheck`
- `yarn test`
- `yarn build`
- DB startup and migration flow documented and repeatable

## Phase 3: Complete the real MVP user journeys

Goal: finish the six planned MVP user stories in the actual browser experience.

Stories to complete and polish:

1. Search equivalents
2. Display confidence scores
3. Session-based reputation
4. Submit new equivalents
5. View contribution history
6. Feedback buttons

Missing or weak areas to address:

- clearer search empty states
- visible and understandable reputation display
- better duplicate submission warnings in the UI
- negative feedback reason capture
- stronger optimistic and failure handling in the UI
- accessibility and mobile polish

Definition of done:

- each story works in real UI, not only tests
- success, empty, loading, and failure states are handled intentionally
- browser-level sanity checks completed

## Phase 4: Moderation and community quality controls

Goal: make community data trustworthy enough to grow safely.

Deliverables:

- moderation workflow for `pending`, `approved`, `rejected`, and hidden states
- duplicate review tools
- anomaly detection rules
- anti-spam/rate-limit protections
- contributor trust-tier logic if needed

Initial implementation can be internal/admin-only.

Candidate controls:

- too many submissions per minute
- large ratio swings over short periods
- repeated duplicate submissions
- repeated abusive voting patterns

Definition of done:

- community submissions no longer rely on blind trust
- the app can prevent obvious low-quality or abusive data from surfacing

## Phase 5: Seed-data ingestion pipeline

Goal: replace one-off SQL seed inserts with a repeatable data ingestion process.

Deliverables:

- import pipeline for official or partner seed data
- source attribution in the database
- source confidence distinctions between official and community entries
- docs for how new seed data is added

Potential source categories:

- market pricing sources
- labor-rate proxies
- partner feed imports

Definition of done:

- seed refreshes are reproducible
- source quality is represented in schema and API output

## Phase 6: AI fallback valuation layer

Goal: provide value suggestions when community or seed data is insufficient.

Rules for this phase:

- AI output must be visibly labeled
- AI suggestions must not silently masquerade as community-validated truth
- AI suggestions should be reviewable before becoming trusted records

Deliverables:

- fallback service contract
- source labeling for AI-generated suggestions
- confidence/source presentation in UI
- moderation path for promoting or rejecting AI suggestions

Definition of done:

- AI improves coverage without corrupting trust in the core dataset

## Phase 7: Legal and trust UX

Goal: implement the product framing that makes the platform safe and understandable.

Deliverables:

- Information Utility positioning in UI
- privacy messaging for anonymous sessions
- confidence-score explanation UX
- tax traffic-light guidance
- clear non-marketplace framing

Definition of done:

- users can understand what the app is, what it is not, and how to interpret results

## Phase 8: Growth features

Goal: add the post-MVP roadmap items only after the trust/data model is stable.

Candidate features:

- advanced search filters
- richer reputation dashboard
- social sharing
- category and island segmentation
- PWA behavior and offline caching
- mobile app path
- governance/community tooling
- multi-island support

Definition of done:

- growth features build on a stable trust and moderation model rather than compensating for missing foundations

## Recommended delivery order

1. MVP alignment
2. Foundation hardening
3. Real MVP user journey completion
4. Moderation and quality controls
5. Seed ingestion pipeline
6. AI fallback
7. Legal and trust UX
8. Growth features

## Suggested sprint sequence

### Sprint A

- MVP alignment
- env validation
- API/runtime hardening
- integration testing

### Sprint B

- search and results polish
- reputation visibility
- submission UX polish
- contribution history polish
- feedback UX improvements

### Sprint C

- moderation states
- review workflow
- anomaly detection
- anti-spam/rate-limit protections

### Sprint D

- source-aware seed ingestion
- import tooling
- source metadata in API/UI

### Sprint E

- AI fallback suggestion layer
- AI labeling and moderation

### Sprint F

- legal/trust UX
- tax guidance
- release preparation and documentation pass

## Delivery principles

Every phase should preserve the repository rules:

- end-to-end type safety
- generated/shared contract discipline
- database changes via migrations
- explicit testing for happy path, edge cases, and failure modes
- documentation updated with every meaningful change

## Immediate recommendation

The next highest-value step is not AI.

The next step should be:

1. finish the real MVP browser flows completely
2. add moderation and community quality controls

That moves the app from a technically working demo into a usable and trustworthy product base.
