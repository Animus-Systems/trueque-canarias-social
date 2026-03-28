---
stepsCompleted: [1, 2]
inputDocuments:
  - name: OBI Product Vision
    type: user-provided-vision
    description: Core product concept, features, legal strategy, revenue model, and target market
    date: 2026-03-27
  - name: Data Model Update
    type: user-provided-update
    description: Hybrid data model with community-sourced valuations + AI fallback, initial seed data from local market sources
    date: 2026-03-27
  - name: Branding Update
    type: user-provided-update
    description: Product renamed to Trueque Canarias Social, part of Canarias Social brand family
    date: 2026-03-27
  - name: First Principles Analysis
    type: elicitation-method
    description: Deep dive into informal economy value dynamics - identified legitimacy engine insight
    date: 2026-03-27
  - name: Critical Challenge
    type: elicitation-method
    description: Devil's advocate analysis finding 6 critical weaknesses in the Pure Calculator concept
    date: 2026-03-27
  - name: Pre-mortem Analysis
    type: elicitation-method
    description: Risk analysis identifying regulatory, GDPR, data corruption, and legal precedent failure scenarios
    date: 2026-03-27
date: 2026-03-27
author: User
projectName: Trueque Canarias Social
productName: Trueque Canarias Social
brand: Canarias Social
productType: Information Utility / Pure Calculator
---

# Product Brief: Trueque Canarias Social

---

## 1. Project Overview

### Product Identity
- **Product Name:** Trueque Canarias Social
- **Brand:** Canarias Social (brand family)
- **Type:** Information Utility / "Pure Calculator" (NOT a marketplace)
- **Core Question:** "What is this worth?"

### Core Concept
Trueque Canarias Social is an information utility designed to democratize value in the Canary Islands' informal economy (~28% of GDP). It provides users with fair market valuations for items and services without facilitating transactions — maintaining strict legal separation from platform operator status.

### How It Works
1. **Input:** User enters item details (e.g., "20kg of Organic Bananas")
2. **Processing:** AI queries local market data (supermarket prices, minimum wage, labor intensity)
3. **Output:** Fair Market Value + list of equivalents (e.g., "= 1.5 Hours of English Tutoring", "= 40kg of Potatoes")
4. **The Firewall:** Provides information ONLY — no messaging, booking, or contact exchange

### Data Model (Hybrid)
1. **Initial Seed Data:** Committed "prices" database from local market sources (Mercatenerife, job boards)
2. **Community Curation:** After MVP, community contributes/updates latest trade valuations
3. **Pure Calculator Fallback:** AI-based calculation when community data is insufficient

### Community Quality Control (Wikipedia-Style)

**The Challenge:** How to get community-curated data WITHOUT user verification

**Solution: Session-Based Reputation**

| Component | Description |
|-----------|-------------|
| **Session Tracking** | Contributions linked to ephemeral session hash (NOT identity) |
| **Confidence Scoring** | Seed data = "Official" (highest), Trusted contributor = "Community Verified", New session = "Community", Flagged = hidden |
| **Anomaly Detection** | Auto-flag: 50 valuations/min, 500% change/24h, obviously fake values |
| **Auto-Remove** | If X users flag as wrong → hide pending review; If Z trusted flag → permanently remove |

**Data Collection Methods (Zero Attribution)**
1. **Search Pattern Analysis:** Track what users search (not WHO) → demand signals
2. **"This Seems Wrong" Button:** Anonymous quality flags
3. **"I Just Traded" Button:** Optional trade reporting (anonymous data point)
4. **Partner Data Feeds:** Municipal cooperatives, Mercatenerife (institutional data)

**Privacy vs. Quality:**
- Session hash ≠ PII under GDPR
- No user accounts = no DAC7 platform operator concerns
- Quality builds over time through contributions, not pre-verification

### Legal Strategy (Critical)
- **DAC7 Exemption:** Positioned as Information Society Service, NOT Platform Operator
- **GDPR:** Radical anonymity — no signup, no PII, stateless "Guest Mode"
- **Tax Education:** Traffic Light System
  - 🟢 Green: Food/0% IGIC
  - 🟡 Yellow: Small Trader Exemption
  - 🔴 Red: Professional Services Warning

### Revenue Model
- Ad-funded (no transaction fees)
- Contextual display ads (first-party ONLY)
- Sponsored "Equivalents"
- Local "Green Zone" Sponsors (municipalities/co-ops)

### Technical Stack
- Frontend: Lightweight PWA
- Database: PostgreSQL with pgvector
- No Auth DB, No App DB — only Valuation Database

### Development Phases
- **Phase 1:** Data Ingestion (Weeks 1-4)
- **Phase 2:** MVP Release (Weeks 5-8)
---

## 2. Target Users

### Primary User Segments

#### 1. María, the Community Builder (Primary)

**Profile:**
- Age: 45, lives in La Laguna, Tenerife
- Runs a small organic vegetable garden
- Active in local "trueque" (barter) circles
- Values relationships over money

**Backstory:**
María has been trading surplus vegetables with neighbors for years. She recently wanted to trade 20kg of tomatoes for English tutoring for her daughter, but had no way to know if that was a "fair" deal. She doesn't want money—she wants community connections.

**Problem Experience:**
- Relies on informal social networks to gauge fairness
- Feels awkward negotiating value with friends
- Worries she's getting ripped off but doesn't want to offend
- Frustrated that platforms assume everyone wants to SELL things

**Success Vision:**
- Type "20kg tomatoes" and see "= 3 hours English tutoring" or "= 8 dozen eggs"
- Use this to START a conversation, not end it
- Feel confident proposing trades because she has "data" to back her up

---

#### 2. Carlos, the Skill Trader (Primary)

**Profile:**
- Age: 32, graphic designer in Las Palmas
- Has skills (design, web) but limited budget
- Prefers trading services over cash transactions
- Tech-savvy but privacy-conscious

**Backstory:**
Carlos trades his design skills for things he needs—furniture, car repairs, groceries. He's tired of explaining his hourly rate and wants to know: "If I design a logo, what's that worth in terms of 20kg of bananas?"

**Problem Experience:**
- No easy way to value his services against goods
- Existing platforms require profiles, verification, payment processing
- Can't use platforms without triggering tax reporting concerns
- Just wants a "reference price" to start negotiations

**Success Vision:**
- Enter "logo design for small business" → see "= 80kg potatoes OR = 10 hours gardening"
- Validate his worth without creating a transaction record
- Keep his side work completely private

---

#### 3. Elena, the Conscious Consumer (Primary)

**Profile:**
- Age: 28, sustainability advocate in Santa Cruz
- Actively avoids big-box retail
- Wants to participate in circular economy
- Privacy-focused, no social media

**Backstory:**
Elena buys secondhand and trades regularly. She wants to know if the vintage jacket she's buying is a "good deal" compared to new clothes—without checking 5 different apps.

**Problem Experience:**
- Overwhelmed by options, no single source for value comparison
- Doesn't want another app with accounts, passwords, tracking
- Frustrated that every "utility" wants to become a marketplace

**Success Vision:**
- Quick web search: "vintage jacket worth" → instant answer
- No account, no tracking, just information
- Use the Traffic Light System to understand tax implications

---

### Secondary User Segments

#### 4. Municipality Social Services

- Need tool to assess value of barter exchanges for welfare programs
- Want to support informal economy without enabling tax evasion
- Could be "Green Zone" sponsor

#### 5. Small Business Cooperatives

- Use tool to facilitate internal exchanges between members
- Value legitimacy without formal transaction infrastructure
- Potential B2B revenue opportunity

---

### User Journey: María's Experience

1. **Discovery:** Hears about Trueque from neighbor at the farmers market
2. **Onboarding:** Opens PWA, sees "What is this worth?" - no login required
3. **Core Usage:** Types "20kg organic tomatoes" → sees equivalents
4. **Success Moment:** "Oh! So my tomatoes are worth 3 hours of tutoring. I should ask Lucia..."
5. **Long-term:** Returns weekly to check values, builds it into her trading routine

### User Journey: Carlos's Experience

1. **Discovery:** Googles "how much is graphic design worth in trade"
2. **Onboarding:** Lands on site, no friction, immediate value
3. **Core Usage:** Inputs project scope, sees labor-hour equivalents
4. **Success Moment:** "Perfect—I can tell my client this is worth 40kg of potatoes"
5. **Long-term:** Uses daily, refers friends, but never creates account

---

## 8. Success Metrics

### User Engagement Metrics

| Metric | Target (MVP) | Target (6 months) |
|--------|--------------|-------------------|
| Monthly Active Queries | 1,000 | 10,000 |
| Query Completion Rate | 80% | 90% |
| Return User Rate | 20% | 40% |
| Average Queries per Session | 2.5 | 3.0 |

### Data Quality Metrics

| Metric | Target (MVP) | Target (6 months) |
|--------|--------------|-------------------|
| Valuation Coverage | 500 items | 5,000 items |
| Seed Data Accuracy | 95% | 95% |
| Community Flag Rate | <5% | <3% |
| Anomaly Blocks | N/A | 50/day max |

### Community Health Metrics

| Metric | Target (MVP) | Target (6 months) |
|--------|--------------|-------------------|
| Anonymous Contributions | 0 | 100/month |
| "This Seems Wrong" Clicks | N/A | 50/month |
| Partner Data Feeds | 1 (Mercatenerife) | 5 |
| Trusted Contributors | N/A | 20 |

### Business Metrics (If Applicable)

| Metric | Target (MVP) | Target (6 months) |
|--------|--------------|-------------------|
| Ad Revenue | €0 | €500/month |
| Green Zone Sponsors | 0 | 2 |
| Cost per Query | <€0.01 | <€0.005 |

### Legal Compliance Metrics

| Metric | Target |
|--------|--------|
| DAC7 Compliant | ✅ Yes (no transaction infrastructure) |
| GDPR Compliant | ✅ Yes (no PII, stateless) |
| Privacy Audit | Pass |

### Success Indicators (North Star)

1. **User says "This is exactly what I needed"** — Query resolved, user has valuation + equivalents
2. **Zero regulatory incidents** — No warnings, no inquiries, no shutdown threats
3. **Community trust** — Users contribute data, flag errors, improve quality
4. **Sustainable unit economics** — Revenue covers operational costs by Month 9

---

*(Section complete - Target Users + Success Metrics now in Product Brief)*

---

## 9. Next Steps

- Phase 2: Create PRD with detailed functional requirements
- Phase 3: Technical Architecture (focus on stateless design)
- Phase 4: Implementation — MVP target: Week 8
5. **Long-term:** Uses daily, refers friends, but never creates account

*(Section in progress - continuing workflow...)*

---

## 3. Problem Statement

### The Problem

**REVISED: Value in informal economies is socially constructed, not information-dependent.**

The informal economy in the Canary Islands lacks transparent tools for legitimizing fair exchanges. People engaged in barter and informal work ALREADY know the value of what they're exchanging through social networks — the problem isn't ignorance, it's **legitimacy**. They need a neutral third-party to validate that their deal is "fair" without triggering tax reporting.

### Why Existing Solutions Fall Short

- **Traditional marketplaces** (eBay, Wallapop, Facebook Marketplace): Track transactions, report to tax authorities under DAC7, create "tax entrapment" perception
- **Price comparison sites**: Focus on retail prices, not equivalent values across different types of goods/services
- **Barter platforms**: Act as intermediaries, triggering platform operator obligations and creating compliance burden that makes small transactions economically unviable

### First Principles Insights

1. **People need legitimacy, not just information** — Trueque provides third-party validation without triggering tax reporting
2. **The informal economy persists because formal transaction costs exceed value** — by avoiding transaction infrastructure, Trueque avoids compliance costs entirely
3. **Barter is relationship-building, not poverty-driven** — serves users who value community, not just the unbanked

---

## 4. Value Proposition

### Core Value

**REVISED: Trueque Canarias Social is a "Legitimacy Engine", not just a calculator.**

It answers "What is this worth?" with accurate, localized valuations — WITHOUT facilitating transactions, thus avoiding DAC7 platform operator obligations.

### Killer Feature

**Relative value (equivalents) is more important than absolute value.** The "Equivalents" feature is the core differentiator:
- "20kg Organic Bananas = 1.5 Hours English Tutoring"
- "40kg Potatoes = 2 Hours Gardening"
- Users don't need to know bananas are €3/kg — they need to know if their 20kg is a fair trade for 2 hours of tutoring.

### Key Differentiators (REVISED)

1. **The Firewall is the competitive moat** — Not transacting protects against BOTH regulation AND competition. Competitors who add transaction features become regulated platforms; Trueque wins by NOT doing what others do.
2. **DAC7 Exemption**: Positioned as Information Society Service, NOT Platform Operator
3. **Radical Anonymity**: No signup, no PII, stateless "Guest Mode" under GDPR
4. **Tax Education**: Traffic Light System informs users of potential tax implications
5. **Local Focus**: Canary Islands-specific data (Mercatenerife prices, local minimum wage, island-specific equivalents)

### Target User Insight

Barter is relationship-building, not poverty-driven. Target users who value community (relationship builders), not just the unbanked.

---

## 5. Risk Mitigation (Pre-mortem Insights)

### Identified Failure Scenarios & Mitigations

| Risk | Mitigation |
|------|------------|
| **Regulatory classification** (shutdown as "implicit marketplace") | Monitor usage patterns; explicit terms prohibiting partner-finding; no community features that enable matchmaking |
| **GDPR breach** (data exposure through ads) | No third-party ad networks; truly stateless with no cookies; query data never logged with any identifier |
| **Community data corruption** (manipulated valuations) | Reputation system for contributors; anomaly detection for suspicious patterns; AI fallback when data appears compromised |
| **Legal precedent** (EU expands DAC7 scope) | Seek formal legal opinion pre-MVP; build compliance into product DNA; prepare data destruction exit strategy |

### Critical Design Principles

- **Stay below regulatory radar** — Modest growth, not aggressive expansion; avoid attracting attention

---

## 6. Areas Requiring Validation (Critical Challenges)

| Area | Challenge | Severity |
|------|-----------|----------|
| **Legal Foundation** | No formal DAC7 opinion — interpretation untested by regulators | 🔴 HIGH |
| **User Experience** | "Firewall" frustrates users who want to complete trades | 🔴 HIGH |
| **Revenue Model** | Low CPM + no user accounts = unproven unit economics | 🟠 MEDIUM |
| **Data Quality** | Community curation vs. anonymity contradiction | 🟠 MEDIUM |
| **Equivalents Feature** | Subjective equivalence — hard to calculate accurately | 🟠 MEDIUM |
| **Regulatory Risk** | Success attracts the regulation that kills you | 🔴 HIGH |

### Key Questions to Validate

1. **Legal:** Can you obtain a formal legal opinion on DAC7 exemption before MVP?
2. **UX:** How will you handle user frustration when they realize they can't complete trades?
3. **Revenue:** Have you modeled unit economics with first-party ads only?
4. **Data:** How do you build reputation without breaking anonymity?
5. **Feature:** What's your source for labor-hour valuations?
6. **Strategy:** What's your exit plan if regulation changes?

---
---

## 7. Success Metrics

*(Section in progress - continuing workflow...)*

---

*End of Product Brief — Vision Section Complete*
