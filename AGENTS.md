<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Anansi: persistent project instructions

Anansi is an isiXhosa-to-English storytelling prototype. AI drafts; storytellers and bilingual reviewers retain control of meaning. M0–M9 are accepted/published; M10 is implemented, verified and published, with the hosted demo at https://anansi-gray.vercel.app. See the milestone log for evidence. Further feature work requires owner authorization.

## Read before working

1. This file and [product scope](docs/PRODUCT_SCOPE.md).
2. [Milestone status](docs/MILESTONES.md), active [PLANS](PLANS.md) section, and its matching T0-T10 in [TEST_PLAN](docs/TEST_PLAN.md).
3. [Architecture](docs/ARCHITECTURE.md) and [decisions](docs/DECISIONS.md) when relevant. [Brief](docs/PROJECT_BRIEF.md) explains why; [PROJECT_CONTEXT](docs/PROJECT_CONTEXT.md) holds optional background. Earlier chats are not required.

## Scope, stack, and coding

- Implement only the explicitly authorized milestone. Confirm each milestone separately; passing tests does not authorize another. M10/UI/hosting are explicitly authorized (D39).
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

- M10: example reuse requires explicit opt-in and a frozen bounded context; never describe it as training. Hosted demo has four permanent owner-selected UUIDs. Temporary test memberships must expire and be removed. The six-slot live verification allowance is closed; additional agent provider work requires fresh owner authorization. No automatic retry or new provider. Do not use vercel curl: this installed CLI creates a persistent bypass secret; keep existing Vercel protection and use ordinary owner sign-in for protected browser verification.

GitHub/main is connected to Vercel automatic production deployments. Run all applicable checks before committing/pushing maintenance changes; verify the resulting Git-sourced deployment. See [MAINTENANCE](docs/MAINTENANCE.md) for the audit override and invitation limitations.

## Security and tests

- Secrets only in ignored .env.local. Update safe .env.example as variables change. No service-role/provider secrets in NEXT_PUBLIC_, browser imports, logs, fixtures, or commits.
- Validate identity, ownership, eligibility, and state server-side; RLS on every exposed table and separate Storage policies. Ordinary operations use user sessions; privileged writes require narrow explicit guards.
- Prove RLS using real anonymous/user clients, never service-role bypass. Test cross-user access/ownership reassignment. No broad database resets; only tagged fixtures.
- Run lint, build, all applicable implemented suites before completion. Record exit codes, ISO timestamps with +02:00, evidence, failures. Missing credentials/infrastructure means blocked/not run, never passed.
- Ordinary tests use deterministic mocks, never paid calls. Live benchmarks are explicit. Never claim verified accuracy, learning/training, legal protection, or production readiness without evidence.

## Documentation maintenance

- Update [README](README.md) whenever setup, commands, dependencies, environment variables, capabilities change.
- Update [DECISIONS](docs/DECISIONS.md) for material product/technical choices and rationale.
- Update [MILESTONES](docs/MILESTONES.md) when work starts, blocks, verifies, commits; map M0-M10 to T0-T10.
- Brief defines why; scope what; architecture how; PLANS sequence; TEST_PLAN proof; MILESTONES actual progress. Keep links synchronized and planned commands visibly distinct from installed scripts.
- Use [DEMO_SCRIPT](docs/DEMO_SCRIPT.md) for rehearsal. Preserve ignored source materials; committed docs must stand alone.

- Every milestone report must explain what is complete, what remains, and exact steps for required manual actions/checks. Never commit/push a milestone while its required manual verification remains outstanding.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
