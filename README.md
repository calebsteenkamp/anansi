# Anansi

Every story, woven across every tongue.

Anansi aims to help isiXhosa storytellers publish audio with an editable transcript and a linked English translation. Bilingual people review meaning, correct wording, and explain intent; listeners retain the original voice.

## Current status

Post-release maintenance: the seven tooling audit findings are resolved with a scoped minimatch override; GitHub/main deployment configuration is restored. See [maintenance evidence and invitation limits](docs/MAINTENANCE.md). New users still require an approved membership/onboarding change; public signup remains closed.

Live demo: **https://anansi-gray.vercel.app**. M0–M10 implementations are committed/pushed (M9:9fbd552; M10:d4290a9). Release7f05aaf passed local automated/Edge and staged production Edge checks, then the same artifact was promoted. The warm paper/teal UI, opt-in examples, direct private uploads and four-account access are implemented. See [M10 verification](docs/M10_VERIFICATION.md) and [milestones](docs/MILESTONES.md) for evidence and prototype limitations.

## Prerequisites and setup

- Node.js26.x, npm, Git, and a modern browser.
- Internet for dependency installation and existing build-time Geist/Geist Mono downloads through next/font/google. Offline/proxy failures are recorded in the milestone log; fonts have not been replaced.
- Supabase credentials and owner-applied migrations are required for accounts, stories and network tests. Provider credentials are needed for live processing; explicit mock mode does not need provider keys. The public home page needs neither.

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
| app/ | App Router auth/profile, audio capture, transcript/reader/review, discovery and guarded API routes |
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
- [ARCHITECTURE](docs/ARCHITECTURE.md) - implemented boundaries, records, processing/security.
- [PLANS](PLANS.md) - tasks, dependencies, acceptance gates.
- [MILESTONES](docs/MILESTONES.md) - actual progress, checks, commits.
- [TEST_PLAN](docs/TEST_PLAN.md) - T0-T9 validation.
- [DECISIONS](docs/DECISIONS.md) - choices and rationale.
- [OPEN_QUESTIONS](docs/OPEN_QUESTIONS.md) - unresolved evidence and owner answers.
- [DEMO_SCRIPT](docs/DEMO_SCRIPT.md) - exact demonstration, preparation and recovery.
- [PROJECT_CONTEXT](docs/PROJECT_CONTEXT.md) - optional historical background.

data/ and PDFs are ignored and absent from a normal clone. Committed docs explain the project independently. Live benchmarks need the owner's Phrase 1/Phrase 2 materials or explicit replacements; never substitute fabricated findings. Use existing accounts and the M9 scoped seed command below. Local demonstration is the default; deployment is optional and not configured here.

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

## M7 review setup

Review/apply supabase/migrations/20261111081510_m7_reviews.sql once in Anansi SQL Editor; do not reset the project or rerun old migrations. No new dependency or secret. Follow [M7_VERIFICATION](docs/M7_VERIFICATION.md). On a completed translation, profiles listing both isiXhosa/English may approve/reject, rate1–5, comment on intent and enter optional segment corrections. Save updates that user's single review atomically. Blank correction fields remove their prior corrections.

The reader defaults to AI text. Show latest community corrections overlays the most recently updated review with edits; it labels the reviewer and preserves AI/original storage. Device narration follows the displayed version and stops when switching versions. Ratings express human confidence, not measured accuracy. Eligibility is self-declared and rechecked at every save.

## M8 discovery setup

Review/apply supabase/migrations/20261111092155_m8_discovery_relationships.sql once in Anansi SQL Editor; no reset or reapplication of earlier SQL. No new dependencies/credentials. Open Discover stories from Your profile or a story. Apply Feed, Story language and Title search together; Clear filters restores newest. Newest means creation time then ID, limited to50 matching language versions; reposts do not bump order.

Follow author/reposter toggles a personal relationship. Repost in Anansi adds the story to your in-app reposts; Remove repost removes only yours. Following includes followed authors and their reposts, deduplicated per story ID. Original/English versions remain separate cards. English Story link opens the original source page with English explicitly selected, without changing profile preference. Only published originals/completed English are discoverable; no paid work occurs while browsing.


## Demo preparation and clean setup verification (M9)

Use only the supplied Phrase1/2 recordings and references. `npm run seed:demo -- --storyteller-id <uuid> --verifier-id <uuid> --sample 1` defaults to a dry run; inspect IDs before adding `--apply`. Set existing profiles as directed in [DEMO_SCRIPT](docs/DEMO_SCRIPT.md). The server-only CLI requires local Supabase administration credentials; it writes only its deterministic demo story/audio paths and guarded mock tasks, creates no accounts, and refuses changed backup content. It never calls paid providers or resets human reviews. Mock text is not language-quality evidence.

`npm run verify:fresh-setup` copies Git-visible source (including uncommitted M9 files) into an isolated ignored `data/verification/fresh-*` directory, without credentials/recordings or existing dependencies. It runs npm ci, offline unit tests, lint and production build; internet is still required for packages/fonts. It retains the snapshot for inspection. This verifies source setup, not independent provisioning of a new Supabase project. Local recordings/reports/snapshots are excluded from lint/type-check source discovery. Run integration/browser suites separately with the known demo project's credentials, applied migrations and provided audio; install Chromium with `npx playwright install chromium` if missing. Network tests create/remove only tagged disposable fixtures. Do not run browser suites while a manual dev server occupies port3000.

For a new environment, configure `.env.local` from the safe example, have the owner review/apply `supabase/migrations/` in filename order, and configure demo-only email confirmation per M2_VERIFICATION. Never paste server credentials into public variables. No new migration is needed for M9. Complete the manual evidence in [M9_VERIFICATION](docs/M9_VERIFICATION.md) before claiming demo readiness.

Historical M9 verification reported7 moderate tooling findings; post-release maintenance resolved all seven. The current npm audit result is0 vulnerabilities; see MAINTENANCE for the scoped override and verification.


## M10 / hosted demo

Owner applied the reviewed M10 migrations, cleanup guard and four-UUID activation. Read-only inspection confirms exactly four permanent members, private staging and RLS; Supabase settings confirm public signup is closed and demo email confirmation remains disabled. See M10_VERIFICATION for the complete ordered migration history. Do not automatically db push/reset. Other Auth accounts and content remain intact. Tests use expiring tagged memberships, never permanent membership edits.

Supabase's single Site URL is https://anansi-gray.vercel.app. Keep localhost in additional Redirect URLs for redirect-based local auth flows. Existing email/password sign-in stays local through /account; the two-account browser tests passed on localhost:3001 after the production URL change. The same four-account restriction applies locally. See [Supabase redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls).

Review reuse is opt-in and defaults false. Eligible real OpenAI corrections/intent can be bounded prompt examples for new translations; snapshots preserve retry consistency. Opt-out affects future selection, not earlier requests/history. No model training or accuracy guarantee. Provider defaults/models are unchanged.

Browser uploads now use private signed staging then server-byte finalization, preserving25MB/180seconds on Vercel. `npm run cleanup:uploads` previews expired staging; `-- --apply` removes only exact expired temporary objects after the token lifetime plus10min. It never deletes original story audio. Failed/uncertain finalization retains a draft ID and preview for explicit recovery.

Before an approved live verification operation, `npm run reserve:m10:live -- --calls=3 --phase=local` (or hosted) reserves slots in the existing local budget ledger and the separate six-slot M10 record. No provider request is made by this command. Never reset reservations/locks to bypass limits; reservations are not actual billed usage. This verification guard does not impose an account-wide production spending limit.

Vercel project anansi in Caleb Steenkamp's projects uses Node26. Its verified production URL is https://anansi-gray.vercel.app. The initial M10 release used deployment dpl_4Lny66cukxg4p7Xw79gEZdDy3uzw from release7f05aaf. It was staged/tested/promoted without rebuilding or a paid hosting upgrade. Required public Supabase URL/anon key and Secret Supabase service-role/OpenAI keys were entered directly by the owner, alongside provider/model configuration. Unused Google/Vulavula keys remain local. The initial release used CLI after GitHub credentials failed. Owner reconnected GitHub during maintenance; main is now configured for automatic production builds. The .vercelignore excludes credentials, recordings, dependencies and generated artifacts, including next-env.d.ts. See M10_VERIFICATION for historical release evidence and MAINTENANCE for the resolved audit findings/Git repair.
