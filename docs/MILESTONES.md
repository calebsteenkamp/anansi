# Milestones and evidence

Source of actual progress; [PLANS](../PLANS.md) defines tasks and [TEST_PLAN](TEST_PLAN.md) defines proof. Status vocabulary: not started, in progress, blocked, verified/commit pending, complete. Dates are ISO +02:00. Complete requires evidence, not planned tests.

| Milestone | Gate | Dependency | Status | Status timestamp | Evidence / blocker / commit |
| --- | --- | --- | --- | --- | --- |
| M0 Foundation + documentation | T0 | Owner-approved docs step | Complete | 2026-11-09T23:29:10+02:00 | T0 passed; first commit 3287918; recorded in subsequent docs commit. |
| M1 Provider feasibility | T1 | M0 complete + owner confirmation | Complete | 2026-11-10T12:03:52+02:00 | Owner accepted M1; 545e449 committed/pushed and remote verified. Google key later verified nonempty/ignored; no Google calls. |
| M2 Database/auth/profiles | T2 | M1/T1 + owner confirmation | Complete | 2026-11-10T13:50:00+02:00 | 39 unit, 5 integration, 2 browser tests pass; owner confirms reported hydration/sign-in issues fixed. M2 committed/pushed as 5b9a1a2; origin/main hash verified identical. Owner authorizes M3 only. |
| M3 Capture/upload/drafts | T3 | M2/T2 + owner confirmation | Verified / commit pending | 2026-11-10T18:55:00+02:00 | Owner confirms both phones pass sign-in/upload/playback; earlier1/2/3/6 pass retained. Final repeated checks/publication pending. |
| M4 Transcribe/edit/publish | T4 | M3/T3 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Planned only. |
| M5 Linked English translation | T5 | M4/T4 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Planned only. |
| M6 Reading/listening | T6 | M5/T5 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Planned only. |
| M7 Verification/corrections | T7 | M6/T6 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Planned only. |
| M8 Follow/share/discover | T8 | M7/T7 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Planned only. |
| M9 Demo/submission evidence | T9 | M8/T8 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Q6 tester/narrative/rehearsals pending. |

M10 intent-example prompting is deferred, outside the nine upcoming milestones. No other milestone is implicitly authorized by M0.

## Historical planning verification, 9 November 2026

- npm run lint: exit 0.
- First npm run build: exit 1, failed to download Geist and Geist Mono from fonts.googleapis.com in the restricted-network run.
- Authorized network-enabled npm run build retry: exit 0; compiled, TypeScript passed, static / and /_not-found generated.
- npm run dev -- --port 3000: Ready; GET http://localhost:3000 returned HTTP 200, starter content, at 2026-11-09T22:46:45+02:00. Temporary server stopped.
- These historical checks predate the documentation rewrite. They do not substitute for repeated final checks below and do not demonstrate product features.

## Documentation-step final verification

- 2026-11-09T23:26:37+02:00: final verification completed after documentation rewrite.
- T0.1: npm run lint, exit 0 (eslint, no fixes).
- T0.2: npm run build, exit 0. Compiled in 3.7s, TypeScript in 7.3s; / and /_not-found generated. No network retry was needed for this final run; existing font/network dependency remains.
- T0.3: npm run dev -- --port 3000, Ready in 1658ms; GET http://localhost:3000 returned HTTP 200 with expected starter text at the timestamp above. Temporary server stopped after check.
- T0.4: all 12 documentation files nonempty, all local Markdown file links resolved, generated Next.js AGENTS block preserved once, M0-M9/T0-T9 mapped. git diff --check passed; staged inspection follows before commit.
- No application implementation or dependencies changed during this docs step. No test runner is installed; T1-T9 are specifications, not passes.

## Git completion record

- First commit succeeded at 2026-11-09T23:29:10+02:00: 3287918a2255f38d4065747cf466036568ec6284.
- Message: feat: complete milestone m0 and update documentation.
- 27 files committed after explicit allowlisted staging; git diff --cached --check passed; no forbidden local data/generated/secret paths and no credential-pattern matches in staged text.
- This post-commit record is saved in the following docs-only commit, message docs: record milestone m0 completion. Its own hash is available in Git history rather than creating a self-reference.
- At M0 completion M1 was not started. The owner subsequently authorized M1 only; no push or remote migration performed.

## Operating schedule

Original targets: 9 November M0-M3/start M4; 10 November finish M4-M7; 11 November M8-M9 and demonstration. These are targets, not evidence or permission to bypass gates. Deadline 2026-11-11T23:59:00+02:00. Hourly read-only reminder will be configured after successful M0 commits; do not infer scheduling from this plan.

For every later milestone append start/block/verification/commit events, commands and exit codes, fixture/environment descriptions, manual observations, decision links, and next owner-confirmation gate.

## M1 verification and limitations

- Owner authorized M1 only and confirmed both recording/text permissions, USD 500 OpenAI allowance, 100 free Vulavula calls. No M2 authorization.
- First compatible test install: Vitest 3 passed 21/21 tests but audit identified worker dependency advisories; upgrading to patched compatible Vitest 4 before final verification. Newest Vitest 5 was not forced past incompatible Node-20 type peers.
- Initial sandboxed test startup failed parent-directory access; authorized offline retry passed.
- npm run lint exit 0; npm run build exit 0, compiled 3.4s, TypeScript 12.3s, / and /_not-found generated. Final rechecks after dependency fix follow.
- Live benchmark exit 0; six requests, no retries, local report data/benchmark-results/2026-11-09T21-46-49.571Z.json. See D14 for descriptive findings.
- Not working/unfinished: no provider approved, bilingual fidelity/intent review pending, no timing/usage collection, phone-format validation deferred to M3, OpenAI translation transport only mocked (configured davinci-codex not used). M1 overall gate not complete until evidence is reviewed and provider/fallback approved.

### Final M1 checks - 2026-11-09T23:48:51+02:00

- npm run test:unit: exit 0, Vitest 4.1.12, 2 test files / 21 tests passed, 863ms. Final config vitest.config.mts removes ESM config-loader warning.
- npm run lint: exit 0 (eslint).
- npm run build: exit 0, compiled 2.6s, TypeScript 9.1s, static / and /_not-found generated.
- npm ls --depth=0 and git diff --check: exit 0. Dependencies pinned: Vitest 4.1.12, tsx 4.23.15, server-only 0.0.1, @next/env 16.4.5.
- Audit after patched Vitest installation: 8 moderate findings, 0 critical. Remaining lint-chain findings not force-fixed or framework-downgraded.
- M1 implementation complete for review; overall T1 blocked pending bilingual review/provider or fallback approval. OpenAI translation adapter has offline transport tests only. No timing/usage metrics, no phone format claim, no general accuracy claim.
- No commit, push, M2 implementation, or database changes in this step.

### M1 follow-up verification - 2026-11-10T08:07:57+02:00

- Authorized M1 only. OpenAI default model gpt-5.4-mini-2026-03-17 configured in code, safe example, and ignored local configuration; secret values preserved without output. No M2 work.
- npm run test:unit exit 0: Vitest 4.1.12, 2 files, 29 tests passed, 1.56s.
- npm run lint exit 0.
- npm run build exit 0: compiled 5.0s, TypeScript 9.3s, static / and /_not-found generated.
- Zero-cap benchmark exit 1 as expected, zero requests/reservations; failed/partial report saved at corrected-2026-11-10T06-07-10.356Z.json.
- Capped corrected-text comparison exit 0: 4/4 success, two calls each, no retries; corrected-2026-11-10T06-07-33.020Z.json under ignored data/benchmark-results. USD2 reserved, NOT actual billing. See D16 for outputs/latency/scope.
- git diff --check passed. Changes remain uncommitted.
- Outstanding: bilingual intent/fidelity review and owner acceptance of M1 evidence/fallback. Timings/actual billed usage still unavailable; no general accuracy claim. M2 requires separate confirmation.

### Final regression recheck - 2026-11-10T08:10:38+02:00

- npm run test:unit exit 0: 31/31 tests, two files, 967ms on Vitest 4.1.12. Includes OpenAI default and output-cap/incomplete-response regressions.
- npm run lint exit 0. npm run build exit 0: compiled 2.0s, TypeScript 8.3s, static routes generated.
- git diff --check exit 0. Only M1 code/config/tests/docs modified; changes uncommitted. No M2 actions.
- Provider preference/model decision resolved: OpenAI/gpt-5.4-mini-2026-03-17. Bilingual review of meaning/intent remains the only human M1 acceptance gate; ASR quality still requires correction/manual fallback, not an accuracy claim.

### M1 owner acceptance - 2026-11-10T12:03:52+02:00

Owner reviewed comparison results and is happy with them, accepting M1 evidence with its documented sample/ASR limitations. OpenAI remains default. Google key will be entered locally by owner; currently absent, not falsely reported stored. M2 authorized after M1 publication; M2 held uncommitted pending manual checks, M3 unauthorized.

## M1 publication / M2 evidence - 2026-11-10T12:58:23+02:00

- M1 accepted by owner. Rechecks: 31 tests, lint and build passed before commit. Commit 545e4499331c0ff2f3e937c18cf21c715b1a250f pushed to origin/main; exact remote hash matched. Google key absent at check; independent local entry pending, never falsely claimed stored.
- M2 added auth/profile UI/server actions, Supabase SSR/Proxy session refresh, schema/bucket migration and test harnesses. Owner SQL/application policy retained; no M3 work.
- Unit: 39/39 tests passed (4 files). Lint exit 0. Initial production build exit 0: compiled 8.2s, TypeScript 21.6s; /account partial-prerendered, /sign-in and /sign-up static, Proxy present. Final recheck after profile revalidation change pending.
- Integration exit 1: BLOCKED owner must apply M2 migration; 4 cases skipped, zero accepted. Initial harness environment-loading bug corrected (Next skips .env.local in test mode).
- Browser exit 1 overall: public rendering/anonymous redirect smoke passed; two-account signup/profile test blocked by missing migration. Chromium installed. No fixture users created at blocked preflight.
- Supabase public schema still empty at inspection. Email confirmation last observed enabled; owner configuration confirmation pending.
- Exact owner steps: [M2_VERIFICATION](M2_VERIFICATION.md). No M2 commit/push while these remain outstanding.

### Final M2 local code checks - 2026-11-10T13:00:28+02:00

- npm run test:unit exit 0: 39 tests/4 files, 3.26s. npm run lint exit 0.
- npm run build exit 0: compiled 6.1s, TypeScript 23.7s; static public/auth pages, streamed protected /account and Proxy.
- npm ls --depth=0 and document-link validation passed. Final static JS scanned against configured private secret values: no matches (no values logged).
- Integration remains exit 1 at missing-migration preflight (4 skipped); browser 1 smoke passed / 1 real-account case blocked. No claim of fully functioning M2 until manual prerequisites and all real-user tests pass.
- Google key remains separately pending unless owner enters it. SQL was not applied, no M2 commit/push, M3 not started.

### Prerequisite refresh - 2026-11-10T13:01:17+02:00

GOOGLE_CLOUD_TRANSLATION_API_KEY now verified nonempty through Next environment loading; .env.local ignored; value never displayed and Google API not called. This resolves the separately pending key-storage prerequisite. Hosted public tables remain empty; Auth settings HTTP 200 with mailer_autoconfirm=false. SQL application and demo email confirmation setting remain pending.

## M2 prerequisites applied and functional verification - 2026-11-10T13:24:49+02:00

- Owner reports foundation SQL applied and email configured. Read-only verification: eight tables present/RLS enabled; story-audio private; intended grants; Auth settings HTTP 200, mailer_autoconfirm=true. Google variable nonempty, ignored, never printed/called. Owner supplied Google Node client documentation, retained in handoff as future reference.
- Integration initial run 4/4 passed. Strengthened real private-object case: final 5/5 passed, 11.28s, ordinary owner/other/anonymous checks plus published access. Fixture cleanup: zero remaining test users/objects.
- Browser: both tests passed. First logged a Cache Components Date.now prerender diagnostic; fixed Account with explicit await connection() before third-party session validation, based on installed guide. Rerun 2/2 passed in 51.3s without that diagnostic. No manual acceptance inferred.
- Final unit 39/39 passed, 1.44s; lint exit 0; build exit 0 compiled 9.1s/TypeScript 15.9s.
- Security advisors found unnecessary public/anon/authenticated EXECUTE permissions on existing event-trigger function public.rls_auto_enable(); local follow-up 20261110111925_m2_restrict_event_trigger_execute.sql prepared for owner, not remotely applied. RLS-no-policy INFO on translation_tasks is intentional deny-by-default.
- Hosted migration history remains empty after editor application; do not automatically db push/reapply foundation. Reconcile history before future automated migration deployment.
- Remaining gates: owner follow-up SQL/application confirmation, advisor recheck, human checklist in M2_VERIFICATION. M2 uncommitted/unpushed; M3 not started.

### M2 final automated/permission verification - 2026-11-10T13:26:53+02:00

- Owner applied follow-up SQL. Function privilege checks: anon_execute=false, authenticated_execute=false. Security advisors now report only intentional INFO for translation_tasks RLS/no client policy; previous public execute warnings cleared.
- Final browser rerun after targeted cleanup revision: 2/2 passed, 46.4s; no Date.now prerender diagnostic. Test accounts/objects from preceding verification were confirmed removed.
- Documentation links, git diff --check and final built-client private-secret scan passed; .env.local remains ignored.
- Only owner manual two-account acceptance remains outstanding. M2 stays uncommitted/unpushed; M3 unauthorized.

## M2 manual feedback regression and resolution - 2026-11-10T13:50:00+02:00

- Owner reported hydration warning and sign-in profile mismatch; manual acceptance remained open while investigated. Original E2E only used separate sessions and reloaded before checking saved profile, masking a preferred-language UI reset.
- Expanded E2E reproduced wrong preferred-language display immediately after saving. Fixed profile form with controlled values, canonical validated save result, prevention of native action-form reset, identity-keyed form mount and auth route invalidation after sign-in/up/out. No hydration-warning suppression introduced.
- Expanded E2E passed 2/2 in 25.5s: immediate saved fields vs real DB, profile persistence, both sessions, B->A->B same-browser sign-in transitions, all fields/language checkboxes, logout, and no captured hydration errors in the clean browser.
- Final unit 39/39 passed (1.12s), integration 5/5 passed (9.67s), lint exit 0, production build exit 0 (compiled 3.0s, TypeScript 7.4s).
- Owner subsequently confirmed: hydration error fixed and sign-in now correct. Record this actual report; do not attribute the original warning to extensions without evidence. No repeated manual check requested for the same resolved issue.
- M2 verified but remains uncommitted/unpushed in this repair step; M1 remains published as 545e449. M3 has not started.

## M2 publication authorized - 2026-11-10T14:04:56+02:00

Owner confirms manual checks passed and explicitly requests M2 commit/push, followed by M3 only. Recorded automated checks 39 unit/5 integration/2 browser plus lint/build passed on current code. No manual M2 gate remains. M3 code starts only after remote M2 commit verification.

## M2 publication / M3 start

- M2 commit 5b9a1a2e52e1aa32e97551b7a2e2c1cf46b350cf, message feat: complete milestone m2 authentication and profiles; normal push origin/main succeeded, ls-remote matched exactly. No force push. Owner manual acceptance and publication authorization recorded in D21.
- 2026-11-10T16:19:15+02:00 test:unit exit0, 61 tests; 16:21:02 expanded unit run exit0, 66 tests/9 files. Lint exit0. Production build exit0, compile10.7s/TypeScript14.8s; account/new/draft streamed, two story API endpoints dynamic.
- 2026-11-10T16:23:57+02:00 test:integration exit1: M2 five tests pass; four T3 cases not run because owner M3 migration not yet applied. Vitest reports skipped after failed prerequisite; these are BLOCKED, not passed.
- M3 dependency approved; Mediabunny1.65.2 installed. npm reports seven moderate advisories (existing lint chain); no force upgrades. Actual phone/audio verification pending; no M3 commit/push and no M4. See M3_VERIFICATION for exact owner steps.

### M3 checkpoint - 2026-11-10T16:31:10+02:00

- Final offline unit run at 16:28:09+02:00: exit0; 9 files, **67 tests passed**, 2.30s. Added RIFF envelope regression because demuxer tolerated a truncated WAV payload.
- Local-only sample probe: Phrase1 MP3 6531ms, Phrase2 MP3 15073ms; actual bytes recognized without upload/provider requests.
- Final lint exit0; build exit0: compiled4.3s, TypeScript10.1s, all10 static shell pages generated; private story routes stream, API routes dynamic.
- Full integration exit1: **5 passed / 4 blocked** (Vitest skipped after beforeAll prerequisite failure). Exact blocker: "BLOCKED: owner must review/apply the M3 audio-drafts migration before T3 network tests."
- Full Playwright exit1: **3 passed / 2 blocked**, 1.4m. M2 flows and anonymous story protections passed; both authenticated M3 flows stopped at the same SQL prerequisite. No claim that save/record E2E passed.
- npm ls --depth=0 exit0; git diff --check exit0; source whitespace0, broken local Markdown links0. Private configured values found in generated client JS:0 of15 files; .env.local remains ignored. Read-only check found0 disposable test users remaining.
- Security advisor: intentional translation_tasks default-denial INFO; hosted Auth leaked-password-protection WARN remains (not changed automatically). See https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Seven moderate npm advisories remain; no production-readiness claim.
- M3 code is uncommitted/unpushed. Required next actions: owner applies reviewed M3 SQL; Codex verifies it read-only and reruns network suites; owner performs actual Huawei i14/desktop audio checklist. M4 not authorized.

### M3 applied-schema verification and final rerun - 2026-11-10T17:13:20+02:00

- Owner reports M3 migration applied. Read-only verified three metadata columns/types, full constraint, private bucket25000000-byte/audio MIME limits, RLS and denied ordinary story INSERT/UPDATE; Storage retains authenticated SELECT only.
- Found/fixed capture readiness and missing Opus packet-duration handling; narrowed browser status locators and author fixture queries and awaited sign-out completion. One later account run timed out during an unexplained ~10-minute stall; final complete rerun passed. Failed runs remain historical failures, not passes.
- Final test:unit exit0:68/68, 9 files,2.98s. test:integration exit0:9/9,22.02s. Final full test:e2e exit0:5/5,1.3m (includes all3 T3 flows and existing account regressions). Lint exit0, build exit0 compiled5.0s/TypeScript9.7s, git diff --check exit0.
- Cleanup found two disposable accounts from the timed-out run; verified their IDs/prefix/no stories and removed only those two using Auth Admin. No unreferenced original objects found. No paid provider requests or remote schema writes by Codex.
- Remaining gate: owner actual desktop microphone/audibility and Huawei i14 file/browser playback/privacy checklist in M3_VERIFICATION. M3 remains uncommitted/unpushed; no M4.

### Real-device feedback and auth/LAN repair - 2026-11-10T18:12:27+02:00

- Owner: desktop checks1/2/3 and privacy6 pass. Huawei i14/HuaweiOS and Oppo17/Android never reached phone media checks4/5 because sign-in inputs reset; phone file formats/audio remain unverified.
- Logs: blocked LAN Next dev HMR, repeated sign-in GETs; generic unexpected Server Action response; captured hydration diff only body data-gr-* extension attributes. Do not infer a proven underlying HTTP failure for the generic error.
- Fixes D24: exact ANANSI_DEV_HOSTS, controlled hydration-ready auth form, bounded same-origin JSON auth with sanitized failures, fresh document on auth success, actual Host-based origin checks for auth and uploads. No forwarded-host trust/CSRF relaxation/global hydration suppression.
- First browser run failed account navigation/LAN origin; recorded, then corrected. Final full test:e2e exit0:6/6,1.6m. Targeted final mobile LAN auth+draft upload/reload run exit0:1/1,31.6s. Emulation is not actual Huawei/Oppo acceptance.
- Final test:unit exit0:74/74,2.79s; test:integration exit0:9/9,19.84s; lint exit0 without warnings; build exit0 compiled14.2s/TypeScript39.5s. git diff --check exit0; no staged/committed M3 changes.
- Two disposable accounts left by the earlier timeout were identified by exact IDs/run prefixes and no-story ownership, then removed only those two. No schema/provider changes.
- Remaining: owner closes old phone tabs, disables Grammarly/site DOM modification for the captured hydration warning, retests phone sign-in/file upload/audible saved playback. M3 stays uncommitted; no M4.

### M3 owner acceptance - 2026-11-10T18:55:00+02:00

Owner confirms both Huawei and Oppo now pass sign-in, upload and playback. Together with earlier1/2/3/6 this satisfies manual acceptance. Actual browser versions/file extensions were not supplied; do not invent them. Owner authorizes M3 commit/push then M4 only, including at most two cleared Phrase1/2 OpenAI transcription calls under existing USD500 allowance, no automated retry or new phone recordings.

M3 publication verification 2026-11-10T18:58:29+02:00: unit74/74 exit0; integration9/9 exit0; browser6/6 exit0 (1.2m); lint/build exit0 (compile1.795s, TypeScript5.0s); dependency/whitespace exit0. Owner actual phone acceptance recorded above.
