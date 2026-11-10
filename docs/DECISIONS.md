# Decision log

Owner-approved blueprint recorded 2026-11-09. Approval of a design does not imply implementation. Preserve history with superseding IDs, actual evidence, and dates.

| ID | Status / date | Decision and rationale | Consequences / evidence |
| --- | --- | --- | --- |
| D01 | Approved / 2026-11-09 | Existing Next.js App Router/TypeScript/Tailwind/npm/root app; no Python backend. | Supersedes historical CSS-modules draft; no src/app migration. |
| D02 | Approved / 2026-11-09 | Supabase Auth/Postgres/private Storage, RLS, user sessions; narrow server provider-result writes. Preserve Cache Components with request-time/Suspense auth. | No browser secrets or shared session caching; T2/T3 prove real restrictions. |
| D03 | Approved / 2026-11-09 | Owner reviews/applies prepared SQL migrations. | No automatic remote migration/reset. Dedicated test users, uniquely tagged fixtures. Q4 selects target. |
| D04 | Approved / 2026-11-09 | Confirm each milestone; documentation step authorizes no M1-M9 code. M10 deferred. | Passing Tn authorizes review, not next implementation. |
| D05 | Providers provisional / 2026-11-09 | Separate typed speech/translation adapters, deterministic mocks, evidence-led M1 selection. | Vulavula sync docs omit Xhosa; translation lists xho_Latn. OpenAI model/parameters/timings require current verification. Q1/Q2/Q5 unresolved. |
| D06 | Approved / 2026-11-09 | Consent, original preservation, AI/mock/device labels, honest single-tester evidence. | No accuracy/training/legal claims. Permission/spend unresolved Q3. |
| D07 | Approved / 2026-11-09 | Exact M0 commit after T0; second docs commit records first hash/time. | No push/amend/reset. Failed required check or commit halts before further Git actions. |
| D08 | Approved / 2026-11-09 | Hourly read-only reminder in this chat until 11 November 23:59 SAST. | Update matching automation rather than duplicate. Actual scheduling requires tool confirmation. No implementation/paid calls/migrations/commits. |
| D09 | Approved / 2026-11-09 | Freeze original on publish; one linked English translation; durable segment task claims/results. | No paid GETs, retries only unfinished work. Crash after response before persistence may cause duplicate billing; not exactly-once usage. |
| D10 | Approved / 2026-11-09 | One updatable bilingual review, separate corrections/AI text; latest corrected set by review update time and ID tie-break. | Scope defines confidence precedence; self-review labelled Storyteller. |
| D11 | Approved / 2026-11-09 | Vitest M1; real Supabase integration and Playwright M2; manual device/audio/linguistic checks. | No tests/dependencies in docs step. Missing prerequisites blocked/not run; async server pages tested via browser. |
| D12 | Approved / 2026-11-09 | Local demo first; existing fonts retained absent explicit repair authorization; preserve ignored source materials. | Initial build failed font downloads; network retry passed. No deployment/recording commits. |

## References checked during planning

- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security/).
- [Vulavula transcription](https://docs.lelapa.ai/transcribe/sync), [language support](https://docs.lelapa.ai/overview/language-support), [translation](https://docs.lelapa.ai/translate/translate).
- [OpenAI file transcription](https://developers.openai.com/api/docs/guides/speech-to-text).
- Installed Next.js guides under node_modules/next/dist/docs/, especially authentication-with-cache-components and testing/vitest.

Recheck relevant current documentation before implementation. Append actual M1 benchmark measurements/model choice and later cuts as new dated decisions; do not retroactively invent findings.

## D13 - M1 authorization and benchmark permission (2026-11-09T23:45:03+02:00)

Owner authorized M1 adapters/tests only and subsequently permitted both Phrase recordings/reference text to OpenAI/Lelapa, with USD 500 OpenAI allowance and 100 free Vulavula calls. First spike is at most six requests, no automatic retries; budget note is not monetary enforcement. No top-up, M2, or database work authorized. Local configured translation model davinci-codex is unverified and will not be silently used; first spike uses configured OpenAI speech and documented Vulavula translation. Provider choice still needs results and bilingual review.

## D14 - First live evidence; no provider selection (2026-11-09T23:47:48+02:00)

Report: ignored data/benchmark-results/2026-11-09T21-46-49.571Z.json. Two OpenAI gpt-transcribe requests and four Vulavula translation requests completed; no automatic retries. Phrase 1: 4 word edits / 8 reference words (50%); Phrase 2: 10 / 19 (52.63%). These tiny reference comparisons are descriptive, not an accuracy claim or a judgment about recording quality. Reference-text English outputs were plausible; ASR-text translation for Phrase 2 included 'I hope we will get hurt', unlike reference intent. Human bilingual evaluation and owner selection remain pending. Keep editable transcript/manual fallback; do not select a winner automatically. No word timings or billed-usage metrics collected; reconcile provider dashboard, no top-up performed.

## D15 - Patched compatible test runner (2026-11-09)

Vitest 5 conflicts with current Node-20 type definitions. Vitest 3 passed tests but introduced critical worker advisories. Selected pinned Vitest 4.1.12, which passes all 21 tests and leaves no critical audit findings. Eight moderate existing lint-chain findings remain; no force upgrade/downgrade performed. Native fetch avoids additional provider SDK dependencies; all paid operations explicit, server-only secret entrypoint.

## D16 - Corrected-text comparison and enforced runner limits (2026-11-10)

Owner authorized M1 benchmark error/budget fixes, valid OpenAI model selection, corrected-text provider comparison, OpenAI default; M2 still unauthorized. Select documented gpt-5.4-mini-2026-03-17 (Responses; 400k context, standard input USD0.75/M, output USD4.50/M), with <=4096 output tokens and no tools. Reference: https://developers.openai.com/api/docs/models/gpt-5.4-mini . Older GPT-4.1 mini/GPT-5 mini pages marked deprecated during inspection, so neither selected.

Runner now performs only two corrected-text translations per provider; it does not repeat ASR. Run caps USD2 reserved / two Vulavula calls. Local cumulative caps USD500 reserved / 100 calls; historical baseline USD2 conservative reservation for earlier ASR and four known Vulavula calls, not actual billing. Atomic reservation persistence under exclusive lock precedes each remote request. Failed/uncertain calls remain reserved; invalid ledgers fail closed. No automatic retry. Limits cannot control other apps or prevent owner tampering/deletion; no account-wide billing guarantee. Failed/partial outputs now return exit 1; report-saving success does not mean API success.

Zero-cap CLI run: exit 1, zero reservations, four blocked outcomes. Live run: exit 0, 4/4 succeeded, report data/benchmark-results/corrected-2026-11-10T06-07-33.020Z.json. Two OpenAI and two Vulavula requests; USD2 reserved (not billed). Cumulative ledger USD4 reserved, six Vulavula calls. Both matched reference English exactly for Phrase1; Phrase2 preserved broad reference meaning with phrasing differences, OpenAI 'grow in our work' vs Vulavula 'grow in our activities'. Latencies OpenAI 2792/2954ms, Vulavula 1086/717ms. No accuracy winner or generalization from these two greetings. Bilingual intent review pending; retain OpenAI default by owner preference and budget, Vulavula alternative.

## D17 - M1 accepted, M2 authorized with manual gates (2026-11-10T12:03:52+02:00)

Owner accepted M1 comparison. Retain OpenAI default. Store a future-only GOOGLE_CLOUD_TRANSLATION_API_KEY locally, no Google adapter/calls. Owner enters key; never echo value. Commit/push M1 only after checks; M2 changes stay uncommitted until owner SQL application, demo email configuration and manual acceptance are verified. Do not start M3.

## D18 - M2 foundation and manual gates (2026-11-10T12:58:23+02:00)

M1 accepted/pushed as 545e449. Owner authorized M2 only. Retain existing Anansi project, owner-applied additive SQL, demo-only Confirm email disabled by owner, no M2 commit/push until actual database/browser/human checks pass. Supabase JS 2.119.0/SSR 0.12.7, CLI 3.1.0 and Playwright 1.65.0 pinned. Unit and network suites isolated. Google variable remains absent pending owner local entry; no Google calls or adapter.

Google-key prerequisite refreshed at 2026-11-10T13:01:17+02:00: local variable nonempty, ignored, no key value logged and no Google call. SQL/email gates remain pending.

## D19 - Real M2 verification and request-time auth fix (2026-11-10T13:24:49+02:00)

Owner-applied foundation and demo email setting verified. Real integration/browser tests pass and fixtures removed. Explicit connection() in streamed Account excludes SDK session clock reads from prerender; Cache Components remains enabled. Advisor warning for existing rls_auto_enable() is addressed by owner-reviewed permissions-only follow-up, not removal of automatic RLS. Keep task denial policy intentional. Google Node reference https://docs.cloud.google.com/nodejs/docs/reference/translate/latest retained without adding adapter/API calls. Manual owner acceptance and follow-up ACL verification remain pending; no M2 commit. SQL Editor application does not populate hosted CLI history; reconcile before future db push.

Permissions follow-up verified 2026-11-10T13:26:53+02:00: anon/authenticated execute false; both advisor warnings cleared, intentional task-denial INFO remains. Final browser suite 2/2 passed. Human checklist still pending; no commit/push of M2.

## D20 - Preserve profile state across action reset and auth changes (2026-11-10T13:50:00+02:00)

Manual feedback exposed missing regression coverage. React action-form reset changed preferred-language display after save. Use controlled profile values, return validated profile from server, prevent native form reset, key form by authenticated user, and invalidate the root layout on successful auth transitions. Expanded browser tests compare real stored values and visible fields before refresh and alternate B/A/B in one browser. Clean browser captured no hydration errors; owner confirms hydration and sign-in issues fixed. Do not speculate about extension cause or suppress warnings. M2 repair verified; no M2 publication or M3 action in this step.

## D21 - M2 publication and M3 authorization (2026-11-10T14:04:56+02:00)

Owner authorizes commit/push M2 following passed manual checks, then M3 capture/draft work only. M3 must remain uncommitted until required phone/audio/manual verification passes. No M4 authorization.
