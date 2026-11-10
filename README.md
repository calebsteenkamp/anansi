# Anansi

Every story, woven across every tongue.

Anansi aims to help isiXhosa storytellers publish audio with an editable transcript and a linked English translation. Bilingual people review meaning, correct wording, and explain intent; listeners retain the original voice.

## Current status

M1 provider feasibility is accepted and pushed. M2 account/profile code has passing automated checks against the owner-applied schema; the owner confirms the reported hydration/sign-in issues are resolved; permission hardening is verified. M2 changes remain uncommitted. The landing page now links to sign-up, sign-in, and protected profile editing. Recording, story translation/review workflows and discovery remain unimplemented. See [M2 manual setup and verification](docs/M2_VERIFICATION.md) and [actual milestone evidence](docs/MILESTONES.md).

## Prerequisites and setup

- Node.js >=20.9, npm, Git, and a modern browser.
- Internet for dependency installation and existing build-time Geist/Geist Mono downloads through next/font/google. Offline/proxy failures are recorded in the milestone log; fonts have not been replaced.
- Supabase and provider credentials are prerequisites for later milestones, not the starter page.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev -- --port 3000
```

Open http://localhost:3000. If .env.local exists, preserve it instead of copying over it. The example contains placeholders and provider defaults of OpenAI; the M1 adapters are implemented. Never commit secrets.

```powershell
npm run lint
npm run build
npm run start -- --port 3000
```

Stop dev before starting production on the same port. Start requires a successful build.

## Tests

M0 uses lint, production build, and local HTTP verification. M1 adds Vitest and an explicit benchmark command. Integration/browser commands are installed but require the M2 prerequisites:

| Introduced | Command (M1 available; M2 planned) | Purpose |
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
| lib/, tests/, supabase/migrations/ | Implemented providers, auth/profile helpers, tests and owner-reviewed SQL |

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

## M1 provider spike

Server-only entrypoint: lib/providers/index.ts. The pure core accepts an injected transport for offline tests. Defaults are OpenAI; mock mode is explicitly labelled synthetic. OpenAI audio uses multipart JSON output; OpenAI translation uses Responses output messages; Vulavula translation uses xho_Latn -> eng_Latn. Xhosa Vulavula transcription is rejected before network. Model identifiers must be verified; no automatic provider fallback/retries.

Run npm run test:unit for deterministic tests. A live benchmark requires both configured providers non-mock plus explicit acknowledgment:

    npm run benchmark:providers -- --live --permission-confirmed --budget-note="owner-approved allowance" --max-openai-cents=200 --max-vulavula-calls=2

Do not pass these flags without actual permission/budget. The runner now compares OpenAI and Vulavula on the same corrected isiXhosa.txt files, without resending recordings. Four requests maximum, no retries. It saves failed/partial reports and exits nonzero unless 4/4 succeed. Historical audio/ASR comparisons remain in local reports. New reports retain both translations, reference English/intent, latency/provenance, and pending human evaluation. Timings and billed usage are not collected; reconcile provider dashboards. No routes/UI/database are implemented in M1.

### Enforced benchmark limits (M1 update)

OpenAI default translation model: gpt-5.4-mini-2026-03-17. Provider selectors remain environment configuration (no visual picker). Explicit mock remains available. The live comparison pins this model and caps output at 4096 tokens; unreviewed model changes are not accepted by the comparison runner.

Mandatory integer --max-openai-cents and --max-vulavula-calls set run limits. Before each OpenAI request, reserve USD1; before each Vulavula request, reserve one free call. Persistent data/benchmark-results/budget-ledger.json enforces cumulative USD500 reserved and 100 Vulavula calls for this runner. A wx lock rejects concurrent runs; reservations persist before network and are never refunded on failures. Missing ledger starts with historical USD2 conservative ASR reservation and four known Vulavula calls; malformed ledgers fail closed. Do not delete/edit ledger to bypass limits; reconcile stale locks after checking no run remains active.

USD1 per GPT-5.4-mini request exceeds full 400k context at USD0.75/M input plus 4096 output at USD4.50/M (standard text endpoint, no tools; rates checked 10 November 2026). Ledger amounts are conservative reservations, not measured charges. Limits cover this tool only, not other applications/account billing, tax, future pricing changes, or independent use of adapters. Recheck pricing before modifying the pinned model/rates. Actual billed usage remains a provider-dashboard reconciliation.

Zero-budget verification: invoke with both caps 0; expected exit 1, all outcomes blocked, zero requests/reservations. No-budget flags also exit 1 before reading credentials or samples.

## M2 setup and test prerequisites

See [M2_VERIFICATION](docs/M2_VERIFICATION.md) for exact SQL/email/manual steps. Pinning: Supabase JS 2.119.0, SSR 0.12.7, Playwright 1.65.0, CLI 3.1.0. Run npm run test:integration and npm run test:e2e only against the approved Anansi demo project. These suites fail visibly on missing setup; no skip is a pass. Unit discovery excludes the integration/e2e suites and never contacts providers. Every milestone report must state completion, blockers, commands/results and exact manual next steps.

M2 profile forms preserve controlled values across saves and account changes. Browser regression checks all fields before refresh and repeated account switching, not only separate browser sessions. Use M2_REUSE_SERVER=1 explicitly to run E2E against an existing local server; otherwise stop that server so Playwright can manage port 3000.
