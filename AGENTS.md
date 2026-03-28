# Trueque Canarias Social Delivery Rules and Runbook

These rules are mandatory for work in this repository.

## Core engineering rules
1. Types are the contract
- No `any` in application code.
- No silent casts or type widening to bypass compiler errors.
- Fix type errors at the source instead of weakening boundaries.
- Keep strict TypeScript settings on and move the codebase toward stronger compiler enforcement over time.
- `typecheck`, `check:types`, `test`, and `build` are mandatory quality gates.

2. API-first and generated contracts
- TypeScript + tRPC is the backend contract surface.
- The tRPC OpenAPI plugin is part of the target architecture and should remain a first-class requirement as the API evolves.
- Shared request/response shapes should come from the API contract, not duplicated frontend DTOs.
- If the contract changes, regenerate or realign dependent types in the same change.

3. Clean boundaries
- Backend owns validation, authorization, business logic, and database access.
- Frontend owns presentation, client state, and UX.
- Client-side validation is for UX only, never the final source of truth.

4. Frontend discipline
- React UI should consume typed client data, not ad-hoc JSON parsing in components.
- Avoid mixing server state into local component state unless there is a clear UX reason.
- Handle loading, empty, error, and success states explicitly for any data-driven view.
- Keep accessibility intact: labels, focus states, keyboard access, and semantic structure.

5. Database and schema discipline
- PostgreSQL schema changes must go through migrations.
- Review indexes, constraints, and relationships with every schema change.
- Reflect DB and API changes in shared types before considering the task done.

6. Validation and error handling
- Validate inputs at the API boundary.
- Keep error shapes structured and predictable.
- Never expose raw internal errors to end users.

7. Testing requirements
- Cover happy path, edge cases, failures, permissions, and data integrity where applicable.
- Any bug fix must include a regression test.

8. Documentation and change hygiene
- Update README, docs, changelog, and migration notes for meaningful changes.
- User-facing behavior changes should be documented in a concise, operator-readable way.
- Contract or architecture changes should be explained where future contributors will look first.

9. File size and maintainability
- Prefer small, focused modules over large mixed-responsibility files.
- If a file grows past roughly 800 lines, consider splitting it while context is fresh.
- If a file grows past roughly 1200 lines, decomposition should be part of the task unless there is a clear reason not to.

10. Release and commit discipline
- Use Conventional Commit prefixes for release-worthy changes: `feat:`, `fix:`, `chore:`, `docs:`.
- Keep commit subjects compact and action-oriented.
- Keep changelog entries user-facing rather than engineering-internal.

## Target architecture
- Backend: TypeScript + tRPC + OpenAPI plugin + PostgreSQL.
- Frontend: React.
- Shared contract types must remain aligned end-to-end across API and UI.

## Definition of done
A task is done only when:
- types are correct end-to-end,
- tests exist and pass,
- docs are updated where behavior or contracts changed,
- success, failure, and edge cases are covered,
- and the change does not rely on "just trust it".

## Repository runbook

### Mandatory checks
From repo root:
1. `yarn typecheck`
2. `yarn test`
3. `yarn build`

### Dev run
- `yarn dev`

## Safety constraints
- Do not use destructive git operations unless explicitly requested.
- Do not revert unrelated local changes.
- Prefer focused diffs and explicit file references in summaries.
