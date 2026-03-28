---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
classification:
  projectType: 'Web Application (Information Utility)'
  domain: 'Local Economy / Barter & Exchange'
  complexity: 'Medium'
  projectContext: 'greenfield'
inputDocuments:
  - name: 'product-brief-trueque-canarias-social-2026-03-27.md'
    path: 'docs/planning/product-brief.md'
    type: 'product-brief'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
workflowType: 'prd'
---

# Product Requirements Document - Trueque Canarias Social

**Author:** User
**Date:** 2026-03-27

---

## 1. Executive Summary

Trueque Canarias Social is an **Information Utility** designed for the Canary Islands informal economy. Unlike barter platforms that facilitate transactions, it positions as a "firewall of legitimacy" — validating value without facilitating trade. This strategic positioning provides regulatory relief (DAC7 exemption via Information Society Service) while delivering genuine utility.

### 1.1 What Makes This Special

**The Killer Feature: Equivalents**
Users want to know if they're getting a fair deal. The "Equivalents" feature compares a user's offered skill/item against known equivalents, providing instant value validation — transforming the product from a listing tool into a legitimacy engine.

### 1.2 Project Classification

| Aspect | Value |
|--------|-------|
| **Project Type** | Web Application (Information Utility / "Pure Calculator") |
| **Domain** | Local Economy / Barter & Exchange |
| **Complexity** | Medium — regulatory considerations (DAC7/GDPR) |
| **Context** | Greenfield — new product |

### 1.3 Key Technical Decisions

1. **Session-based reputation** — No user accounts for MVP; reputation tied to session hash
2. **DAC7 exemption** — Positioned as Information Society Service, not marketplace
3. **Hybrid data model** — Seed data + community curation + AI fallback
4. **Zero-attribution** — No tracking of search patterns or user behavior

---

## 2. Success Criteria

### 2.1 User Success

| Metric | Target | Description |
|--------|--------|-------------|
| **Equivalents Usage** | 60%+ of sessions | Users check value equivalents within a session |
| **Time to First Value** | < 2 minutes | New users find a useful equivalent within 2 minutes |
| **Confidence Score** | > 70% average | Community-contributed data has high confidence |

### 2.2 Business Success

| Metric | Target | Description |
|--------|--------|-------------|
| **Monthly Active Sessions** | 1,000 by Month 3 | Growth of unique sessions using the tool |
| **Data Quality Index** | > 80% accuracy | Percentage of equivalents verified as accurate |
| **Community Contributions** | 50+ new equivalents/month | User-generated content growth |

### 2.3 Technical Success

| Metric | Target | Description |
|--------|--------|-------------|
| **Availability** | 99.5% uptime | Service availability excluding maintenance |
| **Response Time** | < 500ms p95 | Page load time for 95th percentile |
| **DAC7 Compliance** | Full exemption maintained | No reporting obligations triggered |

### 2.4 Legal & Compliance

| Metric | Target | Description |
|--------|--------|-------------|
| **GDPR Compliance** | Zero violations | No data protection incidents |
| **DAC7 Exemption** | Active | Maintain Information Society Service status |

---

## 3. Product Scope

### 3.1 MVP - Minimum Viable Product

- Equivalents search and display
- Session-based reputation system
- Basic community contribution (add equivalent)
- Zero-attribution analytics

### 3.2 Growth Features (Post-MVP)

- Advanced search filters
- User reputation dashboards
- Trust/confidence score visualization
- Social sharing of equivalents

### 3.3 Vision (Future)

- Mobile apps (iOS/Android)
- AI-powered equivalent suggestions
- Community governance features
- Multi-island support

---

## 4. User Personas & Journeys

### 4.1 Primary Personas

| Persona | Role | Needs |
|---------|------|-------|
| **María** | Community Builder | Organizes skill-sharing events, needs to validate fair exchange values |
| **Carlos** | Skill Trader | Trades skills regularly, wants credible value comparisons |
| **Elena** | Conscious Consumer | Prefers local/circular economy, seeks fair-value transparency |

### 4.2 User Journeys

**Journey 1: Check Value Equivalents (All Personas)**
1. User enters skill/item they have
2. System displays equivalent values from community-validated data
3. User sees confidence score for each equivalent
4. User gains confidence in fair value

**Journey 2: Contribute New Equivalent (All Personas)**
1. User discovers value not in database
2. User submits new equivalent with justification
3. Session gains reputation points for contribution
4. Community votes/confidence scoring activates

---

## 5. Functional Requirements

### 5.1 Core Features

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Search equivalents by skill/item name | MVP |
| FR-02 | Display confidence score for each equivalent | MVP |
| FR-03 | Session-based reputation system | MVP |
| FR-04 | Submit new equivalents for community review | MVP |
| FR-05 | View contribution history within session | MVP |
| FR-06 | Feedback buttons (helpful/not helpful) | MVP |
| FR-07 | Advanced filtering (category, confidence, island) | Growth |
| FR-08 | Reputation dashboard | Growth |
| FR-09 | Social sharing of equivalents | Growth |

### 5.2 Data Requirements

**Database Schema:**
- `equivalents`: id, skill_name, category, value_indicator, confidence_score, created_at
- `contributions`: id, session_hash, equivalent_id, vote, timestamp
- `feedback`: id, session_hash, equivalent_id, is_helpful, timestamp

**API Endpoints:**
- `GET /api/equivalents?search={query}` - Search equivalents
- `POST /api/equivalents` - Submit new equivalent
- `POST /api/contributions/vote` - Vote on equivalent
- `POST /api/feedback` - Submit feedback

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target |
|-------------|--------|
| Page load time (p95) | < 500ms |
| API response time | < 200ms |
| Search latency | < 300ms |

### 6.2 Security

| Requirement | Description |
|-------------|-------------|
| Session isolation | No PII, session hash only |
| No tracking | Zero-attribution analytics |
| Input sanitization | Prevent XSS/injection |

### 6.3 Scalability

| Requirement | Target |
|-------------|--------|
| Concurrent users | 500+ |
| Database records | Support 10,000+ equivalents |

### 6.4 Availability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% |
| Maintenance windows | Off-hours only |

---

## 7. UX Requirements

### 7.1 User Flows

**Primary Flow: Search & Compare**
1. Landing page → Search bar prominently displayed
2. Enter skill/item → Instant results display
3. View equivalents → Confidence scores visible
4. Evaluate options → Make informed decision

**Secondary Flow: Contribute**
1. Search yields no results → "Add new" option appears
2. Submit equivalent → Enter details + justification
3. Confirmation → Contribution recorded
4. Community validation → Confidence scoring begins

### 7.2 Interface Requirements

- Clean, minimal design focused on utility
- Clear confidence score visualization
- Mobile-responsive (MVP: responsive web)
- Accessibility: WCAG 2.1 AA compliance

---

## 8. Edge Cases

| Scenario | Handling |
|----------|----------|
| No search results | Show "Add new equivalent" prompt |
| Low confidence score | Display warning, suggest verification |
| Duplicate submission | Prevent duplicates, notify user |
| Session expires | Graceful degradation, reputation maintained in hash |
| Offline usage | Service Worker for basic caching (future) |

---

## 9. Dependencies

### 9.1 External Services

| Service | Purpose | Status |
|---------|---------|--------|
| CDN | Static asset delivery | Required |
| Database | SQLite (MVP), PostgreSQL (Scale) | Required |
| Search Engine | Meilisearch or similar | Required |
| AI Service | Fallback equivalent suggestions | Optional |

### 9.2 Integrations

- None required for MVP
- Future: Analytics (privacy-preserving), Maps (island locations)

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Low data quality | Confidence scoring system, community validation |
| Regulatory change | Modular compliance layer, legal review |
| Low engagement | Seed data with quality equivalents, clear value proposition |

---

## Appendix: Terminology

| Term | Definition |
|------|------------|
| **Equivalents** | Community-validated value comparisons between skills/items |
| **Session Hash** | Anonymous identifier tied to browser session for reputation |
| **Confidence Score** | Weighted metric indicating data reliability (0-100%) |
| **Information Society Service** | EU legal term enabling DAC7 exemption |

---

*PRD Version: 1.0*
*Created: 2026-03-27*
*BMAD Phase 2 Complete*
