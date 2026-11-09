<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Anansi: persistent project instructions

Anansi is an isiXhosa-to-English storytelling prototype. AI drafts; storytellers and bilingual reviewers retain control of meaning. Current source is a foundation, not the product.

## Read before working

1. This file and [product scope](docs/PRODUCT_SCOPE.md).
2. [Milestone status](docs/MILESTONES.md), active [PLANS](PLANS.md) section, and its matching T0-T9 in [TEST_PLAN](docs/TEST_PLAN.md).
3. [Architecture](docs/ARCHITECTURE.md) and [decisions](docs/DECISIONS.md) when relevant. [Brief](docs/PROJECT_BRIEF.md) explains why; [PROJECT_CONTEXT](docs/PROJECT_CONTEXT.md) holds optional background. Earlier chats are not required.

## Scope, stack, and coding

- Implement only the explicitly authorized milestone. Confirm each M1-M9 separately; passing tests does not authorize the next. M10 deferred.
- Do not invent requirements, providers, features, accuracy claims, or test results. Latest explicit owner instruction overrides historical sources; record material changes.
- Put consequential unknowns in [OPEN_QUESTIONS](docs/OPEN_QUESTIONS.md), name the blocked milestone, and ask the owner; continue independent authorized work where possible.
- Before coding, restate criteria and affected files. Afterward report changes, actual checks, limitations, next approval gate.
- Preserve core record/upload -> transcript -> translation -> listen -> verify. Scope cuts require owner agreement.
- Next.js App Router, TypeScript, root app/, Tailwind, npm. No Python backend or migration to src/app/CSS modules.
- Read relevant installed Next.js docs before code changes; preserve the generated instruction block. Keep Cache Components; request-time auth UI uses suitable Suspense boundaries. Never share-cache session responses.
- Use typed validated server mutation boundaries, focused components, accessible labels/keyboard controls, loading/error states, and actionable messages.
- Supabase Auth/Postgres/private Storage. Owner reviews/applies SQL migrations; do not apply automatically.
- Remote speech/translation uses server-only typed adapters; choices provisional until M1 evidence/approval. Device speech is a separate browser capability.
- Never overwrite original audio/published transcript or replace AI text with review edits. Translations are separate linked stories.
- Persist translation results/task claims. GET/page rendering never calls paid providers; retry unfinished work only. Do not promise exactly-once billing across crashes.

## Security and tests

- Secrets only in ignored .env.local. Update safe .env.example as variables change. No service-role/provider secrets in NEXT_PUBLIC_, browser imports, logs, fixtures, or commits.
- Validate identity, ownership, eligibility, and state server-side; RLS on every exposed table and separate Storage policies. Ordinary operations use user sessions; privileged writes require narrow explicit guards.
- Prove RLS using real anonymous/user clients, never service-role bypass. Test cross-user access/ownership reassignment. No broad database resets; only tagged fixtures.
- Run lint, build, all applicable implemented suites before completion. Record exit codes, ISO timestamps with +02:00, evidence, failures. Missing credentials/infrastructure means blocked/not run, never passed.
- Ordinary tests use deterministic mocks, never paid calls. Live benchmarks are explicit. Never claim verified accuracy, learning/training, legal protection, or production readiness without evidence.

## Documentation maintenance

- Update [README](README.md) whenever setup, commands, dependencies, environment variables, capabilities change.
- Update [DECISIONS](docs/DECISIONS.md) for material product/technical choices and rationale.
- Update [MILESTONES](docs/MILESTONES.md) when work starts, blocks, verifies, commits; map M0-M9 to T0-T9.
- Brief defines why; scope what; architecture how; PLANS sequence; TEST_PLAN proof; MILESTONES actual progress. Keep links synchronized and planned commands visibly distinct from installed scripts.
- Use [DEMO_SCRIPT](docs/DEMO_SCRIPT.md) for rehearsal. Preserve ignored source materials; committed docs must stand alone.
