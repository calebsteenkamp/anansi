# Anansi

Every story, woven across every tongue.

Anansi aims to help isiXhosa storytellers publish audio with an editable transcript and a linked English translation. Bilingual people review meaning, correct wording, and explain intent; listeners retain the original voice.

## Current status

M0–M5 are accepted, committed and pushed (M5:9872f29). Accounts, private audio capture/playback, editable transcripts, immutable publication and durable linked English translation/recovery are implemented. M6 preference-aware reading, aligned seeking/highlighting and optional local device narration are implemented with passing automated checks, pending manual desktop/phone acceptance; M6 is uncommitted. Review and discovery remain planned. See [M6 verification](docs/M6_VERIFICATION.md), [M5 evidence](docs/M5_VERIFICATION.md) and [milestones](docs/MILESTONES.md).

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

| Introduced | Command (available; network prerequisites required) | Purpose |
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

## M3 capture and private drafts

Apply the owner-reviewed M3 migration after M2; follow [M3_VERIFICATION](docs/M3_VERIFICATION.md). Authenticated /stories/new records or uploads; /account lists the latest 50 private audio drafts; /stories/{id} plays saved audio. Supabase service-role credentials are now required server-side for the narrowly validated capture write/cleanup path, never in browser code. Ordinary clients still cannot insert stories or upload/replace/delete audio directly.

Mediabunny 1.65.2 inspects actual container, codec and encoded packets. One audio track/no video; MP3, AAC M4A/MP4, PCM WAV, Opus/Vorbis WebM; <=180 seconds, <=25,000,000 bytes. No audio conversion or provider calls. Preview remains after save errors. Playback links expire in five minutes; Renew playback reauthorizes through the current session. Desktop synthetic playback does not establish actual phone/audio acceptance. No resumable uploads or production resource guarantees are claimed.

## Phone/LAN development sign-in

Set ANANSI_DEV_HOSTS in ignored .env.local to the PC's exact LAN IP/hostname (no scheme or port; comma-separated if needed), then restart npm run dev -- --port 3000. Open its Network URL on the same trusted Wi-Fi. Update this value if the PC's IP changes. It authorizes development resources only; same-origin mutation checks remain enforced. No wildcard, public tunnel or firewall change is required by this fix.

Sign-in/up now use bounded same-origin POST /api/auth/{sign-in|sign-up} JSON endpoints with Supabase SSR cookies; credentials stay in component memory through rejected/network/non-JSON responses. Inputs are disabled until handlers hydrate, and editing is disabled during a submission. Successful sign-in performs a fresh same-origin document navigation to clear private client caches. Nothing stores passwords in localStorage or logs. Sign-out and profile edits retain server actions.

If the hydration diff specifically shows data-new-gr-c-s-check-loaded/data-gr-ext-installed on body, a browser extension changed the DOM before React hydrated. Disable Grammarly/site modification on the local app or compare with a clean browser profile. Do not globally suppress hydration warnings. Report any different diff separately.

## M4 transcript and publishing setup

Follow [M4_VERIFICATION](docs/M4_VERIFICATION.md): owner reviews/applies the additive M4 SQL before story pages/tests use the new schema. Authors explicitly transcribe or paste text, edit title/segments, split/merge, Save, then Publish. Saved transcripts are revision-checked; published originals are read-only and visible to signed-in users by direct URL. Audio remains unchanged. Publication atomically prepares English metadata/tasks. M5 now starts explicit processing after the Publish event; see its setup and acceptance status below.

The author confirms permission to send audio to the displayed provider. Repeated completed transcription reuses saved text; retry after failure/interruption is explicit. Timings for current text-only ASR are approximate. Manual/provider/provider-edited origin is recorded separately from provider-attempt metadata. Unsaved app links and full reload warn; copy text before resolving a revision conflict.

Playwright-managed servers force mock providers; M4 tests fail closed if the displayed provider is live. Browser setup verifies M5 and prerequisite SQL before starting cases. Stop any manual server before npm run test:e2e. Credentials, actual Supabase test project and ANANSI_DEV_HOSTS remain required.

verify:m4:live is an explicit paid two-cleared-sample check, not part of normal tests. Its existing authorization has been used:2/2 succeeded, no retries. It refuses an existing ignored report and reserves USD1 per call in the shared local benchmark ledger; reservations are not invoices or account-wide/app billing enforcement. Do not rerun/delete local evidence to bypass permission. Current official gpt-transcribe pricing checked2026-11-10: USD0.0045/minute; see https://developers.openai.com/api/docs/models/gpt-transcribe .

M4 manual-feedback hardening: protected pages show the verified current account, published originals contain no editor fields for anyone, and draft editors revalidate access when focus/session changes. Profile/capture/story links request fresh documents rather than cached client transitions. Use distinct accounts in separate browsers for acceptance; browser tabs share a session. Report any actual cross-account persisted edit with its plain story URL.

## M5 translation setup

After prior migrations, review/apply only supabase/migrations/20261110212329_m5_translation_processing.sql in the confirmed Anansi SQL Editor. Do not reset the project or rerun older migrations. Follow [M5_VERIFICATION](docs/M5_VERIFICATION.md). There are no new dependencies or secret variables. Keep OpenAI as configured default; Google is stored only for future use.

After saving a corrected transcript, consent to send its text and publish. Translation begins through explicit POST requests, with one English story per original. Leaving interrupts subsequent requests; refresh shows persisted results without generating more. Continue handles pending work; Retry resets failed/expired work only. Claims last five minutes. Completed segments retain their original provider/model; changing environment configuration does not silently retranslate them. Costs may repeat after a response/persistence crash; app processing does not enforce an account-wide provider spending limit.

For automated browser tests, stop the manual server and run npm run test:e2e normally. Its managed server forces mock providers. Do not reuse a live-configured server; guards deliberately fail before live processing. Mocks prove workflow only. No new live benchmark is included in M5.

## M6 reading and listening

No new migration, dependency or environment variable. The signed-in reader's profile sets initial presentation: isiXhosa original, or original plus English. Reading language changes only the current page; save profile preference on Your profile for future page loads. Published content stays read-only. Activate a segment by click, Enter or Space to seek original audio; seeking preserves paused/playing behavior. Highlight follows the original playhead or device narration. Approximate timing is text-based, not precise word synchronization. Renew playback if the private audio link expires.

When English is displayed and all translation segments are aligned/saved, Device English voice can read them with an available local English voice. It starts only on explicit button press; original audio stops when narration starts and vice versa. Stop, language/voice changes and navigation cancel narration. If no suitable local voice exists or speech fails, text and original audio remain available. No remote speech fallback or new paid API call is introduced. Actual voice availability/audibility depends on the device and must be observed; browser mocks do not prove it. Follow [M6 manual checklist](docs/M6_VERIFICATION.md) before marking M6 accepted.
