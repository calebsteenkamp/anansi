# Test plan: T0-T9

T1 now has executable offline tests; T2 now has executable unit/integration/browser checks; T3-T9 remain specifications. Actual results are recorded in MILESTONES. [MILESTONES](MILESTONES.md) owns actual evidence. Each Mn maps to Tn and requires owner confirmation before the next milestone.

## Environments, commands, and evidence

Current commands: npm run lint, npm run build, npm run dev -- --port 3000.
Planned from M1: npm run test:unit (Vitest), npm run benchmark:providers (explicit live only).
Available from M2 (manual prerequisites required): npm run test:integration (real Supabase), npm run test:e2e (Playwright).

Run common lint/build and all implemented applicable suites before completing each milestone. Unit/component tests cover synchronous logic/UI; async server pages use browser tests. Deterministic provider mocks are the ordinary default. Never let normal tests accidentally call paid APIs.

Integration prerequisites: owner-confirmed demo/test project, reviewed/applied migrations, dedicated test users, local secret configuration. Test with anonymous and actual user tokens, never a service-role client as RLS evidence. Administrative fixture setup, if needed, is isolated from authorization assertions. Unique per-run IDs; cleanup only created fixtures/users and objects. Never reset entire database. Missing prerequisites or unavailable scripts = blocked/not run.

Evidence per case: ID, requirement, command/action, environment and provider mode, +02:00 timestamp, expected/actual, exit/status, sanitized output, fixture identifiers, limitations. Manual device/audio/linguistic checks have named observer/date; no invented passes.

## Fixtures and identities

- Local live samples: data/Phrase 1/Phrase 1.mp3 and data/Phrase 2/Phrase 2.mp3, each with isiXhosa.txt, English.txt, Intent.txt. Q3 permission/spend must be resolved before transmission.
- Keep benchmark reference-text translation distinct from ASR-text translation; compare descriptive word-error counts plus human meaning/intent feedback.
- Planned tracked synthetic fixtures: deterministic adapter success/empty/error/timed results, short segmented transcript, translated text, known review corrections. Clearly labelled synthetic/mock, not evidence of language quality.
- Demo personas: Anansi Storyteller (isiXhosa preference), Anansi Verifier (both spoken languages, English preference). Change verifier languages temporarily to test denial; add isolated ineligible user fixture for concurrent automated tests.
- Test durations: empty, invalid, 179.9s, exactly 180s, 180.1s; actual decoded type/duration validation.
- Boundary/auth fixtures: own draft, other's draft, published original/translation, foreign segment/review, duplicates, invalid rating, expired task claim.

## T0: foundation

| ID | Check | Expected |
| --- | --- | --- |
| T0.1 | npm run lint | Exit 0, no auto-fix |
| T0.2 | npm run build | Exit 0, production route output; record network/font failures and authorized retry |
| T0.3 | npm run dev -- --port 3000; GET http://localhost:3000 | Ready log and HTTP 200 with expected starter content; stop only server started for this check |
| T0.4 | Documentation references/status and staged diff inspection | Local links resolve; M0-M9/T0-T9 mapped; future commands labelled; no secrets/generated/local data staged |

T0.1-T0.3 are owner's M0 runtime criteria. T0.4 validates this documentation deliverable. Build artifacts/caches are not product feature implementation. Health endpoint not required.

## T1: provider feasibility

- T1.1 Unit: normalized success/timing/provenance for both adapter contracts; malformed, empty, unsupported, credentials, quota, timeout errors.
- T1.2 Unit: deterministic mocks and explicit mode labels; no accidental network calls.
- T1.3 Unit: reference normalization/word-error comparison handles punctuation, case, empty strings; metrics describe samples only.
- T1.4 Live: two cleared MP3s per supported ASR candidate; capture text/formats/timings/latency/error/model. Vulavula unsupported Xhosa STT recorded without mislabelling language.
- T1.5 Live: translate reference text and ASR output separately; compare English reference and intent with bilingual reviewer. Record approved provider/fallback in decisions, no assumed winner.
- Pass only with unit checks and owner-approved documented provider choice or explicit fallback; absent credentials/evaluation blocks live evidence.

## T2: database/auth/profiles

- T2.1 Integration: schema/foreign keys/unique relationships/rating/language bounds; exposed tables and private bucket protected.
- T2.2 Integration: anonymous denied, signed-in published reads allowed, own draft readable, other's draft denied; relevant read policies tested using seeded data.
- T2.3 Integration: own profile update works; another user's update and ID/ownership reassignment denied even with direct API payload.
- T2.4 Browser: two signups, sign-in/out, profile refresh persistence, protected routes, session refresh.
- T2.5 Browser/integration: no cross-user session response leakage or forged/unverified-cookie authorization; no browser service/provider secrets.
- Pass after actual database assertions and browser auth journey; UI-only disabling is insufficient.

## T3: recording/upload/storage

- T3.1 Unit: consent and authoritative duration/type boundaries including 180 exactly/over cap.
- T3.2 Integration: own user-prefix upload/finalization and authorized signed playback; other's path/object and anonymous denied.
- T3.3 Integration: fake client metadata, malformed file, upload/finalization failure; orphan cleanup scoped safely.
- T3.4 Browser: record/preview/re-record, denied mic -> upload fallback, consent omission blocked, playable persisted clip after refresh.
- T3.5 Manual: actual tester phone container/MIME and audible playback accepted by selected provider or documented supported fallback.

## T4: transcript/publish

- T4.1 Unit: sentence boundaries, whitespace/empty/long input; edits/split/merge stable IDs/order.
- T4.2 Unit: timing coverage/order/nonnegative bounds, invalid-provider timing fallback, estimates sum within duration, approximate labels.
- T4.3 Integration: author-only transcription/save/publish, state transitions, original preservation, atomic publish and repeated publish without duplicate translation records.
- T4.4 Browser: correction/title -> publish -> reload, failed ASR -> typed transcript -> publish, original immutable afterward.

## T5: translation/cache/retry

- T5.1 Unit: task fingerprint, provider response validation, error mapping, unfinished-only retry.
- T5.2 Integration: concurrent/repeated publish gives one parent-linked English story and one task per source segment.
- T5.3 Integration: active task claim prevents duplicate normal calls; expired claim retry, stale-worker completion rejected, completed task reused with zero extra calls.
- T5.4 Integration: partial failure preserves successes; retry calls failed work only; no calls on GET/reload.
- T5.5 Browser: automatic start after publish, progress/failure, explicit Continue/Retry after interruption, AI/mock provenance clear.
- Record crash-after-provider-before-save duplicate-billing limitation; do not assert impossible exactly-once remote usage.

## T6: listening/playback

- T6.1 Unit/component: boundary selection, pause/end/seek, translated alignment, speech cancel/cleanup/no competing playback.
- T6.2 Browser: language preference, original plus English, segment click/keyboard seek, highlighting and approximate label; responsive layout.
- T6.3 Manual: real desktop/phone audible original and device English voice; missing voice retains text/audio fallback. Mock audio events alone cannot pass this manual check.

## T7: reviews/corrections

- T7.1 Unit: empty -> Awaiting; mean <3 -> Fairly; >=3 -> Confident; fractional means and tied decisions; majority rejection overrides mean -> Disputed.
- T7.2 Integration: current bilingual profile eligibility; direct ineligible requests denied; rating 0/6/fraction invalid.
- T7.3 Integration: unique review per user/translation; update instead of duplicate; own edits only; foreign translation segment rejected; atomic rollback on bad edit.
- T7.4 Browser: correct/comment/rate -> badge persistence; Storyteller tag; AI default/latest corrected toggle; original/AI unchanged; ineligible user blocked.

## T8: follow/share/discovery

- T8.1 Integration: own relationship mutations; duplicate idempotency, unfollow, no self-follow, share target published.
- T8.2 Integration: Following feed authored/reposted inclusion, dedupe, stable order, combined title/language filtering, no private drafts.
- T8.3 Browser: second user finds/follows/reposts/opens story, valid in-app link and usable empty states.

## T9: complete demo/submission

- T9.1 E2E: two-user capture/upload -> edit -> publish -> English -> playback -> correction/review -> discover; refresh proves persistence.
- T9.2 E2E: provider failure/partial recovery and explicit mock backup; all labels honest.
- T9.3 Integration: repeatable seeds affect named fixtures only; no broad reset/credential exposure.
- T9.4 Manual: bilingual cleared narrative session, elapsed review time, rating, correction clarity, meaning/intent errors; limitations recorded.
- T9.5 Manual: execute exact DEMO_SCRIPT twice, uninterrupted <=5 minutes each, real dates/outcomes.
- T9.6 Fresh setup check, lint, build, all applicable suites; README commands accurately reflect installed scripts. No demo/video/submission completion claim without artifact/evidence.

## M1 implemented coverage

Run npm run test:unit: tests/providers.test.ts covers synthetic deterministic adapters, multipart/OpenAI Responses/Vulavula mappings, response validation, credentials/quota/timeout/network error sanitation, and unsupported Xhosa Vulavula STT. tests/benchmark.test.ts covers permission gates and normalized word-error counts. Live output is local-only; human evaluation is pending. Unit tests use injected transports, not paid APIs.

## M1 follow-up: enforced budgets/error outcomes (10 November 2026)

31 unit tests pass across two files. Tests include missing/duplicate/negative/nonfinite/fractional/oversized caps, per-run and cumulative reservation exhaustion, exact-boundary reservations, invalid ledger, sanitized errors and nonzero failed/incomplete report status. CLI zero-budget integration test exited 1 with zero reservations; four-request corrected-text live comparison exited 0. Persistent exclusive file lock and atomic ledger rename fail closed on errors. No live calls in unit tests. OpenAI default/pinned comparison model is gpt-5.4-mini-2026-03-17. Historical ASR sample results are retained; current runner tests translation separately using corrected reference text. Human bilingual review remains pending.

Additional regression coverage: OpenAI defaults/pinned model, max_output_tokens=4096 in request, oversized output configuration rejected before transport, incomplete Responses output treated as failure.

## M2 implemented cases and latest result

Profile/credential validation and Proxy cookie-refresh/no-shared-cache units pass (39 total with M1). Integration covers real-user profile updates, cross-user/identity denial, draft/published/anonymous visibility, invalid database inputs, denied future writes, private bucket/anonymous signed-URL denial; blocked until migration. Playwright public smoke passed; real two-context signup/edit/reload/logout blocked at migration preflight. See MILESTONES for actual results; no mock or service-role assertion substitutes for RLS evidence. Exact owner prerequisites/manual checklist in M2_VERIFICATION.

M2 applied-environment update: 39 unit / 5 real-user integration / 2 browser tests passed; latest lint/build passed. Private-object case uses a real disposable stored object, not merely a missing-object denial. Signup/profile/logout and cross-user updates tested with isolated accounts; zero fixtures remain. Owner manual check and advisor follow-up remain open. Historical blocked runs remain historical, not current results.

M2 manual-feedback regression: E2E now checks all fields before refresh against stored data, different language/checkbox combinations, repeated same-browser B->A->B sign-in after logout, and hydration console errors. It failed on the pre-fix preferred-language reset, then passed after repair (2 tests, 25.5s). Explicit M2_REUSE_SERVER=1 permits using the owner test server; default still starts an isolated managed server. No screenshot/trace/password retention.
