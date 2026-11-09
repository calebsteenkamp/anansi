# Anansi

Every story, woven across every tongue.

Anansi aims to help isiXhosa storytellers publish audio with an editable transcript and a linked English translation. Bilingual people review meaning, correct wording, and explain intent; listeners retain the original voice.

## Current status

The repository contains a Next.js foundation and an approved implementation/test blueprint. The homepage is still the starter screen. Authentication, recording, providers, database persistence, translation, reviews, and discovery are **not implemented**. See [actual milestone evidence](docs/MILESTONES.md); plans are not completion claims.

## Prerequisites and setup

- Node.js >=20.9, npm, Git, and a modern browser.
- Internet for dependency installation and existing build-time Geist/Geist Mono downloads through next/font/google. Offline/proxy failures are recorded in the milestone log; fonts have not been replaced.
- Supabase and provider credentials are prerequisites for later milestones, not the starter page.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev -- --port 3000
```

Open http://localhost:3000. If .env.local exists, preserve it instead of copying over it. The example contains placeholders and provider defaults of mock; adapters do not exist yet. Never commit secrets.

```powershell
npm run lint
npm run build
npm run start -- --port 3000
```

Stop dev before starting production on the same port. Start requires a successful build.

## Tests

M0 uses lint, production build, and local HTTP verification. There is no automated test runner installed. These commands are **planned and currently unavailable**:

| Introduced | Planned command | Purpose |
| --- | --- | --- |
| M1 | npm run test:unit | Vitest logic/adapter/component checks |
| M1 | npm run benchmark:providers | Explicit live benchmark; sends recordings and may incur usage |
| M2 | npm run test:integration | Real Supabase authorization/persistence checks |
| M2 | npm run test:e2e | Playwright flows with deterministic provider behavior |

See [TEST_PLAN](docs/TEST_PLAN.md) for T0-T9, environments, and fixtures. Missing scripts/skipped checks are never passes.

## Repository layout

| Location | Purpose |
| --- | --- |
| app/ | Current App Router page, layout, global styles, favicon |
| public/ | Current starter assets |
| docs/ | Brief, scope, architecture, decisions, tests, progress, demo |
| PLANS.md | Approved milestone implementation sequence |
| AGENTS.md | Persistent coding-agent instructions |
| .env.example | Safe configuration template |
| data/ | Ignored local source briefs, recordings, reference text |
| lib/, tests/, supabase/migrations/ | Planned future locations; not present at M0 |

## Project documents

- [PROJECT_BRIEF](docs/PROJECT_BRIEF.md) - problem, objectives, capstone alignment, sources.
- [PRODUCT_SCOPE](docs/PRODUCT_SCOPE.md) - authoritative requirements and exclusions.
- [ARCHITECTURE](docs/ARCHITECTURE.md) - planned boundaries, records, processing/security.
- [PLANS](PLANS.md) - tasks, dependencies, acceptance gates.
- [MILESTONES](docs/MILESTONES.md) - actual progress, checks, commits.
- [TEST_PLAN](docs/TEST_PLAN.md) - T0-T9 validation.
- [DECISIONS](docs/DECISIONS.md) - choices and rationale.
- [OPEN_QUESTIONS](docs/OPEN_QUESTIONS.md) - unresolved evidence and owner answers.
- [DEMO_SCRIPT](docs/DEMO_SCRIPT.md) - planned demonstration and rehearsal record.
- [PROJECT_CONTEXT](docs/PROJECT_CONTEXT.md) - optional historical background.

data/ and PDFs are ignored and absent from a normal clone. Committed docs explain the project independently. Live benchmarks need the owner's Phrase 1/Phrase 2 materials or explicit replacements; never substitute fabricated findings. Demo accounts/fixtures arrive in later milestones. Local demonstration is the default; deployment is optional and not configured here.
