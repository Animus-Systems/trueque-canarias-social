# Sprint Plan: Trueque Canarias Social - MVP

**Project:** Trueque Canarias Social  
**Phase:** 4 - Implementation  
**Sprint:** MVP Release (Sprint 1)  
**Date:** 2026-03-28  
**Owner:** Bob (Scrum Master)

---

## Sprint Goal

Deliver a functional MVP enabling users to search skill/item equivalents, view confidence scores, submit new equivalents for community review, and provide feedback — all with session-based reputation tracking.

---

## Sprint Backlog

| Story ID | Title | Priority | Points | Dependencies |
|----------|-------|----------|--------|--------------|
| US-01 | Search Equivalents | Must Have | 3 | None |
| US-02 | Display Confidence Scores | Must Have | 2 | US-01 |
| US-03 | Session-Based Reputation | Must Have | 3 | None |
| US-04 | Submit New Equivalents | Must Have | 5 | US-03 |
| US-05 | View Contribution History | Should Have | 2 | US-04 |
| US-06 | Feedback Buttons | Should Have | 2 | US-01, US-02 |

**Total Story Points:** 17  
**Recommended Sprint Duration:** 2 weeks

---

## Story Definitions

---

### US-01: Search Equivalents

**Title:** Search Equivalents by Skill/Item Name

**User Story:**
> "As a **user** of Trueque Canarias,  
> I want to **search for equivalents using a skill or item name**,  
> So that I can **quickly find what other skills or items have comparable value in the community**."

**Acceptance Criteria:**

| AC ID | Criterion | Test Scenario |
|-------|-----------|---------------|
| AC-01 | Search input accepts text strings | User types "guitar lessons" — input is accepted |
| AC-02 | Search returns results within 500ms p95 | 95% of searches return results in <500ms |
| AC-03 | Results display equivalent item pairs | Results show "1 hour guitar lessons ≈ 2 hours gardening" |
| AC-04 | Empty search shows meaningful message | User submits empty search → "Please enter a skill or item to search" |
| AC-05 | No results shows helpful message | Search for "quantum physics" → "No equivalents found. Be the first to add one!" |
| AC-06 | Search is case-insensitive | "Guitar" and "guitar" return identical results |

**Priority:** Must Have  
**Estimated Points:** 3  
**Technical Notes:**  
- Implements FR-01 from PRD
- API: `GET /api/equivalents?search={query}`
- Database: Query `equivalents` table with ILIKE for case-insensitivity
- Index: Full-text search index on `skill_name` and `item_name` columns
- NFR: Must meet <500ms p95 latency requirement (PRD-NFR-01)

---

### US-02: Display Confidence Scores

**Title:** Display Confidence Score for Each Equivalent

**User Story:**
> "As a **user**,  
> I want to **see a confidence score for each equivalent**,  
> So that I can **assess how reliable the exchange value is before using it**."

**Acceptance Criteria:**

| AC ID | Criterion | Test Scenario |
|-------|-----------|---------------|
| AC-01 | Confidence score displays as percentage | Equivalent shows "Confidence: 87%" |
| AC-02 | Score is visible in search results | Search results list includes score for each item |
| AC-03 | Score uses color coding | Green (70%+), Yellow (40-69%), Red (<40%) |
| AC-04 | Score calculation is transparent | Hover/tooltip shows score formula: (votes / (votes + reports)) × 100 |
| AC-05 | New equivalents default to 50% | Newly added equivalent shows "Confidence: 50%" until votes accumulate |

**Priority:** Must Have  
**Estimated Points:** 2  
**Technical Notes:**  
- Implements FR-02 from PRD
- Confidence formula: `(helpful_votes / total_votes) × 100`
- Stored in `equivalents.confidence_score` column, updated after each feedback submission
- UI: Use traffic light color scheme per accessibility guidelines

---

### US-03: Session-Based Reputation

**Title: Session-Based Reputation System

**User Story:**
> "As a **contributor**,  
> I want to **build reputation within my session**,  
> So that **my submitted equivalents gain trust based on my contribution history**."

**Acceptance Criteria:**

| AC ID | Criterion | Test Scenario |
|-------|-----------|---------------|
| AC-01 | Session ID generates on first visit | New user → unique session ID created and stored in cookie |
| AC-02 | Reputation score visible in UI | Header shows "Contributor Score: 12" |
| AC-03 | Score increments on positive feedback | User submits equivalent → receives helpful vote → score +1 |
| AC-04 | Session persists across page reloads | Close browser, reopen → same session ID retained |
| AC-05 | No personal data collected | Verify no PII stored — only session ID and reputation integer |

**Priority:** Must Have  
**Estimated Points:** 3  
**Technical Notes:**  
- Implements FR-03 from PRD
- Session ID: UUID v4 stored in HTTP-only cookie, 30-day expiry
- Reputation stored in `contributions.session_reputation` (integer)
- Zero-attribution design: No user accounts, no PII (per PRD legal requirements)
- Cookie: `tc_session_id` with `Secure; HttpOnly; SameSite=Lax`

---

### US-04: Submit New Equivalents

**Title:** Submit New Equivalents for Community Review

**User Story:**
> "As a **knowledgeable user**,  
> I want to **submit new equivalents for community review**,  
> So that **I can contribute my local knowledge and help others with accurate exchange values**."

**Acceptance Criteria:**

| AC ID | Criterion | Test Scenario |
|-------|-----------|---------------|
| AC-01 | Submission form accessible from search results | User clicks "Add Equivalent" button → form opens |
| AC-02 | Form requires skill name and item name | Leave both blank → validation error displayed |
| AC-03 | Form requires description/context | Leave description empty → "Please provide context for this equivalent" |
| AC-04 | New submissions enter "pending" state | Submit equivalent → status shows "Pending Review" |
| AC-05 | Submissions increment contributor reputation | Submit → contributor score +1 (pending) → +2 (approved) |
| AC-06 | Duplicate detection triggers warning | Submit "1 hour cooking ≈ 2 hours cleaning" → if exists, warn user |

**Priority:** Must Have  
**Estimated Points:** 5  
**Technical Notes:**  
- Implements FR-04 from PRD
- API: `POST /api/equivalents`
- Database: Insert to `equivalents` table with `status = 'pending'`
- Duplicate check: Fuzzy match on skill_name + item_name using Levenshtein distance < 3
- NFR: Input sanitization to prevent XSS (PRD-NFR-02)

---

### US-05: View Contribution History

**Title:** View Contribution History Within Session

**User Story:**
> "As a **contributor**,  
> I want to **view my contribution history within my session**,  
> So that I can **track my impact on the community and see which equivalents are most helpful**."

**Acceptance Criteria:**

| AC ID | Criterion | Test Scenario |
|-------|-----------|---------------|
| AC-01 | History accessible from user menu | Click username → "My Contributions" link |
| AC-02 | History shows all submitted equivalents | List displays all equivalents submitted by current session |
| AC-03 | Each entry shows status | Entry shows "Approved" / "Pending" / "Rejected" |
| AC-04 | Each entry shows feedback received | Entry shows "12 helpful, 2 not helpful" |
| AC-05 | History is sorted by most recent | Newest submissions appear first |
| AC-06 | History persists in current session | Contributions survive page reload within same session |

**Priority:** Should Have  
**Estimated Points:** 2  
**Technical Notes:**  
- Implements FR-05 from PRD
- API: `GET /api/contributions?session_id={sessionId}`
- Database: Query `contributions` table filtered by session_id
- Pagination: 20 items per page, load more on scroll

---

### US-06: Feedback Buttons

**Title:** Feedback Buttons (Helpful/Not Helpful)

**User Story:**
> "As a **user**,  
> I want to **provide feedback on whether an equivalent was helpful**,  
> So that **the community can curate high-quality equivalents and I can contribute to the trust score**."

**Acceptance Criteria:**

| AC ID | Criterion | Test Scenario |
|-------|-----------|---------------|
| AC-01 | Each equivalent shows thumbs up/down buttons | Search result → equivalent has ✓/✗ buttons |
| AC-02 | Clicking feedback updates confidence score | Click thumbs up → score increases by calculated delta |
| AC-03 | User cannot vote on same equivalent twice | Vote once → buttons become disabled for that equivalent |
| AC-04 | Anonymous feedback allowed | Non-logged-in user can provide feedback |
| AC-05 | Feedback submission is instant | Click → UI updates immediately (optimistic update) |
| AC-06 | Negative feedback prompts optional context | Click thumbs down → "Would you like to explain why?" (optional) |

**Priority:** Should Have  
**Estimated Points:** 2  
**Technical Notes:**  
- Implements FR-06 from PRD
- API: `POST /api/feedback`
- Database: Insert to `feedback` table with equivalent_id, session_id (if exists), vote_type
- Anti-spam: Rate limit 10 votes per session per minute
- Optimistic UI: Update confidence score immediately, rollback on API failure

---

## Definition of Done

All stories must meet:

| DoD Item | Description |
|----------|-------------|
| Code Complete | All functionality implemented per ACs |
| Unit Tests | >80% coverage on core business logic |
| Integration Tests | API endpoints return expected responses |
| UI Tests | Critical user flows work in browser |
| NFR Compliance | Performance <500ms p95, zero-attribution verified |
| Security Scan | No XSS, SQL injection, or CSRF vulnerabilities |
| Documentation | Code comments and API docs updated |

---

## Dependency Map

```
US-01 (Search) ──────┬──► US-02 (Confidence Scores)
                     │
                     └──► US-06 (Feedback Buttons)

US-03 (Reputation) ──► US-04 (Submit Equivalents)
                           │
                           ▼
                     US-05 (Contribution History)
```

**Execution Order:**
1. US-01 — Foundation (all other features depend on search)
2. US-03 — Core infrastructure (needed for US-04)
3. US-02 — Depends on US-01
4. US-04 — Depends on US-03
5. US-05 — Depends on US-04
6. US-06 — Depends on US-01 and US-02

---

## Technical Stack Reference

- **Frontend:** TypeScript
- **Backend:** tRPC with OpenAPI plugin
- **Database:** PostgreSQL
- **API Style:** RESTful via tRPC

**Database Tables:**
- `equivalents` — skill/item pairs with confidence scores
- `contributions` — session-submitted equivalents
- `feedback` — helpful/not helpful votes

**API Endpoints:**
- `GET /api/equivalents` — Search equivalents
- `POST /api/equivalents` — Submit new equivalent
- `GET /api/contributions` — Get contribution history
- `POST /api/feedback` — Submit feedback

---

*Document generated by Bob (Scrum Master) — BMAD Phase 4*