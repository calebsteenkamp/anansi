# Approved implementation plan

Approved by the owner on 2026-11-09. This file is a blueprint, not a completion report. Read [scope](docs/PRODUCT_SCOPE.md), [architecture](docs/ARCHITECTURE.md), [tests](docs/TEST_PLAN.md), and [actual milestones](docs/MILESTONES.md).

## Execution rules and common gates

M0-M5 are accepted, committed and pushed. M5 is9872f29; remote hash matched. Owner authorizes M6 only; automated and real desktop/phone listening gates must pass before M6 commit/push. M7 remains unauthorized. M1-M9 require separate confirmation after the preceding milestone passes its T-number gate. M10 deferred. No dependencies/tests/product code for M1-M9 in the documentation step.

Use current Next.js/TypeScript/Tailwind/npm/root app. Implement planned typed interfaces and records in architecture, validating at server and database boundaries. SQL migrations are owner-reviewed/applied. No external services called on read, no overwritten originals, no browser secrets, no claims of exactly-once billing.

Before each milestone, restate criteria/files and resolve its blocking questions. Implement only it. Run lint, build, all applicable existing suites, and its Tn checks. Record commands, exit codes, ISO +02:00 time, failures, manual evidence. Missing infrastructure/credentials/scripts are blocked/not run, never passed. Report evidence and stop for confirmation.

## M0 / T0: documentation and foundation

Tasks: write the 12-file documentation package, retain generated AGENTS block, make documentation stand alone without chat/local sources, label future capabilities honestly. Check links and status/test mapping. Do not install test runners or implement later code.

Acceptance: npm run lint and npm run build exit 0; npm run dev -- --port 3000 serves HTTP 200 at http://localhost:3000. No extra health route is required by the owner's latest M0 definition. Starter UI is acceptable for foundation only.

After all checks: inspect status, allowlist foundation/docs/config/lockfile/safe env example, inspect staged diff, git diff --cached --check, then exact commit message: feat: complete milestone m0 and update documentation. On failure halt; do not repair code silently. After success record first hash/time in milestone log and make second commit: docs: record milestone m0 completion. No push/amend/reset. Verify final status.

After success, inspect existing reminders and update matching Anansi automation rather than duplicate. Hourly read-only heartbeat in this chat through 2026-11-11T23:59:00+02:00. Report completed/current/blocked work and next approved milestone from docs/Git, distinguish evidence/assumptions, do not implement/call providers/migrate/commit. Stop before M1.

## M1 / T1: provider feasibility

Dependency: M0 complete plus owner confirmation; Q1-Q3 evidence/permission/spend addressed before live calls.

Tasks:
- Add Vitest and test:unit; add typed speech/translation adapters with normalized results/errors and deterministic labelled mocks.
- Add explicit benchmark:providers command; never embed live calls in ordinary tests.
- Use Phrase 1 and Phrase 2 MP3s plus isiXhosa/English/intent references. Record format, latency, text, available timings, model/version, errors, usage metadata.
- Compare normalized ASR to reference (word-error counts are descriptive on these tiny samples). Translate reference text separately from ASR text to isolate error propagation.
- Current Vulavula sync docs omit Xhosa: document unsupported candidate, do not label Xhosa as Zulu or spend calls blindly. Recheck current OpenAI parameters/model compatibility. Test supported candidates only.
- Bilingual tester rates fidelity/intent and identifies correction burden. Owner approves provider choice or explicit manual-transcript fallback. Record evidence in DECISIONS; keep raw recordings/results local where appropriate.

Gate: adapter/error/mock unit tests pass; benchmark evidence or documented unsupported/failure outcome and owner-approved fallback exists. No fabricated winner, no inference of narrative accuracy from greetings. Commands: lint, build, test:unit; explicit live benchmark only with prerequisites.

## M2 / T2: database, auth, profiles

Dependency: approved M1 evidence and confirmation; Q4 target and SQL application confirmed.

Tasks:
- Prepare migration via current CLI-supported workflow for architecture records/constraints, RLS/grants, and private Storage policies. Owner reviews/applies; verify schema before tests.
- Pin Supabase JS/SSR packages, update env template, implement cookie clients/Proxy refresh, verified server identity, protected data boundaries with Cache Components/Suspense.
- Sign-up/in/out and display name/bio/language profile; demo-only email confirmation disabled by owner.
- Add integration/Playwright harnesses and test:integration/test:e2e. Use tagged fixtures and dedicated test users; no broad resets.

Gate: two accounts persist profiles/sessions; real user/anonymous clients prove cross-user isolation, draft privacy, grants/constraints, ownership reassignment denial. Browser login/logout/protected-route checks pass. Published-story policy checks can use explicitly seeded fixtures before recording UI exists. All common checks plus T2 pass.

## M3 / T3: capture and drafts

Dependency: M2/T2 + confirmation; Q5 provider formats known and phone test arranged.

Tasks: supported MediaRecorder MIME selection; preview/re-record/upload fallback; explicit consent; exactly 180 seconds accepted, over-limit rejected. Private user-scoped uploads, authoritative type/duration validation, draft finalization, signed authorized playback after refresh, failed-object cleanup. Add probe/conversion dependency only if M1 evidence requires it; confirm approach before adding.

Gate: unit boundary/consent checks; actual Storage cross-user/anonymous denial, malformed-file/finalization cleanup integration; browser denied microphone/upload/reload; manual actual phone format and audio check. Record evidence; do not rely on client duration alone.

## M4 / T4: transcribe, edit, publish

Dependency: M3/T3 + confirmation.

Tasks: explicit claimed transcription transition and persistence; progress/errors; one/two-sentence segments; edit/merge/split/title; typed/pasted fallback. Validate provider timings, else proportional approximate timing. Save only owner's draft; publish atomically validates/freezes original and prepares linked translation/tasks without making provider calls until M5 wiring.

Gate: unit segmentation/empty/long text/order/timing cases; author/state/atomicity/duplicate-publish integration; browser edit -> publish -> refresh and failed ASR -> manual transcript. Audio unchanged; nonauthor cannot publish; published text immutable.

## M5 / T5: translation

Dependency: M4/T4 + confirmation; M1 provider decision configured.

Tasks: automatically initiate explicit per-segment processing POSTs after publish; durable task claims/expiry and result reuse, one linked English story credited to original. Add progress, explicit Continue/Retry, sanitized errors, partial-result retention, live/mock provenance. GET reload does not process work; claims and uniqueness handle normal concurrency; record crash billing limitation.

Gate: unit keys/normalization/errors/retry selection; integration duplicate/concurrent publish uniqueness, task claims/stale-worker rejection, completed task zero extra provider calls, partial failure/recovery; browser publish -> automatic start, reload/read zero calls, explicit retry and mock labels.

## M6 / T6: reading/listening

Dependency: M5/T5 + confirmation.

Tasks: original audio and isiXhosa; English translation according to preference, aligned segments, active highlighting and click/keyboard seek. Label estimates. Optional browser device English speech, sequential segments and highlights; prevent competing playback, cancel speech/release listeners on navigation, handle missing voice.

Gate: pure/component boundaries and cleanup; browser play/pause/seek/preferences/responsiveness/keyboard; real desktop/phone audio and voice observed manually. A mocked player alone is not proof of audible playback.

## M7 / T7: verification

Dependency: M6/T6 + confirmation.

Tasks: current profile bilingual eligibility enforced server/database; side-by-side review, approve/reject, integer rating 1-5, optional intent, per-segment corrections. Atomic updatable unique review/edits, Storyteller self-review label. Scope confidence precedence; AI default and latest-review corrected overlay toggle.

Gate: unit no-review/mean threshold/fraction/tie/rejection precedence; integration eligibility/foreign segments/uniqueness/update/rollback; browser correct/comment/rate -> persisted badge/toggle and blocked ineligible user. Preserve original and AI versions.

## M8 / T8: follow/share/discover

Dependency: M7/T7 + confirmation.

Tasks: idempotent own follow/unfollow and repost/link, newest-first/Following feeds, title search/language filter. Published accessible stories only; deduplicate followed/reposted entries, stable timestamp+ID ordering. Empty states and in-app links.

Gate: real integration ownership/duplicate/unfollow/feed inclusion/dedupe/search/filter/draft exclusion; browser second user finds/follows/reposts/opens story, empty states usable. No advanced recommendations/external social APIs.

## M9 / T9: demo/submission evidence

Dependency: M8/T8 + confirmation; Q6 permission-cleared narrative and tester session.

Tasks: repeatable seed command scoped to named demo records, labelled mock backup, loading/error/accessibility polish, tester observations, final docs. Implement exact DEMO_SCRIPT with two users; rehearse twice. Verify setup from a fresh checkout/environment, not destructive reset of working project.

Gate: full E2E record/upload -> transcript edit -> publish -> translation -> playback -> review -> discovery; provider-failure recovery; lint/build/all suites; two uninterrupted rehearsals. Record actual time/rating/corrections/confusion as one informal observation, not accuracy proof. No video artifact or submission is claimed unless actually produced.

## Scope cuts and stops

Keep local demo first; deployment optional and excluded here. Owner-approved cut order: M10, sharing, search/filters, corrected toggle, device English speech. Keep core capture/transcript/translation/listen/verify. Synchronize scope/tests/demo after approved cut. Halt at failed gate or missing consequential evidence; ask only for the blocking decision, never silently broaden scope.

## M3 implementation history (completed)

D22 combines draft creation/upload finalization into one authenticated multipart POST; audio metadata SQL and private-bucket restrictions await owner application. Mediabunny inspection approved, no conversion. Read [M3_VERIFICATION](docs/M3_VERIFICATION.md) for exact SQL, local workflow, phone/browser handoff and crash limitations. At that checkpoint actual phone evidence was pending; owner later accepted both phones and authorized M4 in D25.

## Completed M4 implementation contract

Explicit owner transcribe, typed/pasted fallback, title/segment edit/split/merge/save, valid labelled timing and atomic immutable publish. No translation calls. Five-minute durable claim/token; stale completions rejected; completed transcripts reused; failed/expired work requires explicit retry. Save compares revision; publish uses trusted server provider/model and creates unique pending English story/tasks transactionally. Limits50,000 characters/500 segments; initial chunks<=300 code points. Owner applies 20261110165905_m4_transcript_publish.sql. Read M4_VERIFICATION before network checks.

Owner permits at most two live OpenAI requests using previously cleared Phrase1/2. Both completed successfully and authorization is consumed; no retry/new phone audio. Unit/E2E providers are mocks, not accuracy evidence. M4 stopped for owner SQL and real desktop/phone acceptance. That gate passed; fb985ff was committed/pushed before M5 began.

## Completed M5 implementation contract

A post-publish event starts sequential explicit POST /api/stories/[id]/translation calls, one segment each. Existing published pages/GETs never start work. TranslationPanel exposes saved partial results, Refresh (read-only), Continue and explicit Retry. Permission to submit text is required; OpenAI remains default; stored task provider/model is authoritative. Provider clients remain server-only.

Owner reviews/applies 20261110212329_m5_translation_processing.sql. Parent English row lock serializes active claims,5min expiry, fingerprint verification, stale-token rejection, completed reuse, unfinished-only reset, transactional aligned result/task/status persistence. Claims/results/retry SQL executable only by service_role with verified actor repeated inside SQL; ordinary tables retain RLS/default-denial. Crash after response before persistence can incur another paid call after explicit recovery. No automatic retry/fallback, background queue, M6 highlighting/device speech, or new live benchmark. Read M5_VERIFICATION for application and acceptance handoff.

## Active M6 implementation contract

Read current user's profile preference through the session client. StoryReader shows original only for xh, original+aligned English for en; page selector overrides presentation for that page only. Translation lookup uses source_segment_id, not array position. Original timing drives click/Enter/Space seek and playhead highlight; labelled estimates remain approximate, not word alignment. Existing M5 progress/actions stay explicit and update the reader after saved results; no read triggers provider work.

DraftAudio accepts a reader ref/time callback, renews private URLs, and stops on unmount/pagehide. Playback arbiter stops the current document's competing audio/voice. DeviceNarrator uses browser-reported local English voices only, sequential short utterances preserving source IDs, stale-event guards, cancel/listener cleanup and unavailable/error fallback. No autoplay or remote speech fallback. Profile/language/voice selection and navigation must not restart provider jobs. No SQL/dependency changes.

Verification: npm run test:unit, test:integration, test:e2e, lint, build, dependency/whitespace/client-secret checks. T6 units cover boundaries, identity alignment, arbitration, chunking, sequencing and cancellation/errors; browser uses actual stored synthetic audio plus deterministic speech stubs. Owner manually verifies real desktop/Huawei/Oppo audibility and voice/fallback, seeking and navigation per M6_VERIFICATION. M6 remains uncommitted until that acceptance; M7 not authorized.
