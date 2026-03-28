# Trueque Canarias Social

Open-source barter intelligence for the Canary Islands. Search fair exchange values for skills, services, and goods — backed by community data and AI.

## Features

- **Universal barter calculator** — Trade anything: services (hours), goods (kg, liters, units), or mixed
- **Banana reference unit** — Every equivalent shows its value in kg of Canarian bananas (the universal comparator)
- **Bilingual (EN/ES)** — Full Spanish/English UI with URL-based switching (`/es`, `/en`), auto-translated content via OpenRouter
- **AI suggestions** — When no community data exists, AI generates barter suggestions with real price-based math
- **Community moderation** — Rate limiting, flagging with auto-reject, admin approval workflow, audit log
- **Anonymous sessions** — Cookie-based reputation, no accounts, no PII
- **2300+ seed entries** — Pre-loaded bilingual barter data covering services, Canarian goods, and everyday items

## Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | TypeScript, Express, tRPC, OpenAPI |
| **Frontend** | React 18, Vite, React Router |
| **Database** | PostgreSQL 16 (bilingual columns, trigram search) |
| **AI/Translation** | OpenRouter API (configurable model, default gpt-4o-mini) |
| **Deployment** | Netlify (frontend) + Digital Ocean App Platform (backend) |

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/Animus-Systems/trueque-canarias-social.git
cd trueque-canarias-social
yarn install

# 2. Configure
cp .env.example .env
# Edit .env with your ADMIN_TOKEN and OPENROUTER_API_KEY

# 3. Start PostgreSQL
yarn db:start

# 4. Apply migrations and seed data
yarn db:migrate
yarn db:seed

# 5. Start development
yarn dev
```

Open `http://localhost:5173/es` (Spanish) or `http://localhost:5173/en` (English).

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `postgresql://...localhost:5433/...` | PostgreSQL connection string |
| `PORT` | No | `3003` | API server port |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Frontend origin (CORS) |
| `APP_ORIGIN` | No | `http://localhost:$PORT` | Backend origin |
| `COOKIE_DOMAIN` | No | — | Cookie domain for cross-subdomain sessions (e.g., `.canarias.social`) |
| `ADMIN_TOKEN` | No | — | Moderator token (min 32 chars). Enables moderation panel. |
| `OPENROUTER_API_KEY` | No | — | Enables AI suggestions and auto-translation |
| `OPENROUTER_MODEL` | No | `openai/gpt-4o-mini` | Model for translations |
| `OPENROUTER_AI_MODEL` | No | Same as `OPENROUTER_MODEL` | Model for AI barter suggestions |

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start API server + React dev server |
| `yarn build` | Production build (client + server) |
| `yarn start` | Run production server |
| `yarn typecheck` | TypeScript strict mode check |
| `yarn test` | Run all tests (137 tests, 15 files) |
| `yarn db:start` | Start PostgreSQL via Docker |
| `yarn db:stop` | Stop PostgreSQL |
| `yarn db:migrate` | Apply all database migrations |
| `yarn db:seed` | Load seed data (idempotent, skips duplicates) |
| `yarn db:generate-seed` | Regenerate `seed-data.json` from item price lists |

## Database

**8 migrations** manage the schema. The `equivalents` table stores bilingual barter data:

| Column | Description |
|--------|-------------|
| `skill_name_en` / `skill_name_es` | What's being offered (bilingual) |
| `item_name_en` / `item_name_es` | What's received in return (bilingual) |
| `ratio` | Exchange ratio (units of item per 1 unit of skill) |
| `offer_unit` / `receive_unit` | Unit type: `hour`, `kg`, `unit`, `dozen`, `liter` |
| `banana_value` | Value in kg of Canarian bananas (universal reference) |
| `status` | `pending`, `approved`, or `rejected` |
| `confidence_score` | Generated from community vote ratio (0-100) |
| `source_type` | `official`, `community`, or `ai_suggested` |

**Seed data** is generated from 69 curated items (45 services + 24 goods) with real Canary Islands pricing, producing 2300+ bilingual pairings. Edit `database/generate-seed.ts` to add items, then run `yarn db:generate-seed && yarn db:seed`.

## AI features

**AI suggestions** — When a search returns no database matches, AI generates up to 3 barter suggestions via OpenRouter. These are ephemeral (not stored) and displayed with an "AI Suggestion" badge. Users can click "Save for review" to submit them for moderation.

**Natural language queries** — Queries with 6+ words (e.g., "I have 5 kg of peaches and want lemons") are routed directly to AI for interpretation.

**Auto-translation** — New submissions are stored in the user's language. Background translation fills the other language column on the next submission.

## Moderation

Set `ADMIN_TOKEN` in `.env` (min 32 characters). Enter it in the Moderation panel:

- **Pending queue** — Approve or reject submitted equivalents
- **Translate missing** — Trigger translation for untranslated entries
- **Import data** — Bulk import official equivalents from JSON
- **Audit log** — View all moderation actions

Rate limits: 10 submissions/day, 50 votes/hour, 5 flags/hour per session. Auto-reject at 3 community flags.

## Deployment

**Frontend (Netlify):**
- Config: `client/netlify.toml`
- Set env var: `VITE_API_URL=https://api-trueque.yourdomain.com`

**Backend (DO App Platform):**
- Config: `.do/app.yaml`
- Set env vars in DO dashboard (DATABASE_URL, CLIENT_ORIGIN, APP_ORIGIN, COOKIE_DOMAIN, ADMIN_TOKEN, OPENROUTER_API_KEY)
- Managed Postgres addon provides DATABASE_URL

**DNS** (same root domain for cookie sharing):
```
trueque.yourdomain.com       → CNAME → <site>.netlify.app
api-trueque.yourdomain.com   → CNAME → <app>.ondigitalocean.app
```

Set `COOKIE_DOMAIN=.yourdomain.com` so session cookies work across subdomains.

## Project structure

```
client/                  React frontend
  src/
    components/          UI components (SearchPanel, ResultCard, ContributionForm, etc.)
    hooks/               Custom hooks (useSession, useSearch, useFeedback)
    i18n/                Translation system (EN/ES, ~80 keys per language)
  public/                Static assets (logo.webp, favicon)
  netlify.toml           Netlify deploy config
src/
  server/
    db/                  Repository, moderation, import, migrations
    index.ts             Express entry point
    router.ts            tRPC procedures (12 endpoints)
    contracts.ts         Zod schemas (shared types)
    i18n.ts              Server-side translations
    ai-valuation.ts      AI barter suggestion engine
    openrouter.ts        Shared OpenRouter API client
    translate.ts         Auto-translation service
  __tests__/             15 test files (137 tests)
database/
  migrations/            8 SQL migration files
  seed-data.json         2300+ bilingual seed entries
  seed.ts                Seed deploy script
  generate-seed.ts       Seed data generator
docs/planning/           Architecture and roadmap documents
.do/app.yaml             Digital Ocean App Platform spec
```

## Planning docs

Architecture, PRD, sprint plans, and implementation roadmap: [docs/planning](docs/planning).

## License

See [LICENSE](LICENSE).
