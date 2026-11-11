# Milestones and evidence

Source of actual progress; [PLANS](../PLANS.md) defines tasks and [TEST_PLAN](TEST_PLAN.md) defines proof. Status vocabulary: not started, in progress, blocked, verified/commit pending, complete. Dates are ISO +02:00. Complete requires evidence, not planned tests.

| Milestone | Gate | Dependency | Status | Status timestamp | Evidence / blocker / commit |
| --- | --- | --- | --- | --- | --- |
| M0 Foundation + documentation | T0 | Owner-approved docs step | Complete | 2026-11-09T23:29:10+02:00 | T0 passed; first commit 3287918; recorded in subsequent docs commit. |
| M1 Provider feasibility | T1 | M0 complete + owner confirmation | Complete | 2026-11-10T12:03:52+02:00 | Owner accepted M1; 545e449 committed/pushed and remote verified. Google key later verified nonempty/ignored; no Google calls. |
| M2 Database/auth/profiles | T2 | M1/T1 + owner confirmation | Complete | 2026-11-10T13:50:00+02:00 | 39 unit, 5 integration, 2 browser tests pass; owner confirms reported hydration/sign-in issues fixed. M2 committed/pushed as 5b9a1a2; origin/main hash verified identical. Owner authorizes M3 only. |
| M3 Capture/upload/drafts | T3 | M2/T2 + owner confirmation | Complete | 2026-11-10T19:15:59+02:00 | Accepted on both phones; repeated74 unit/9 integration/6 browser/lint/build pass; committed/pushed ade9f2b, remote matched. |
| M4 Transcribe/edit/publish | T4 | M3/T3 + owner confirmation | Complete | 2026-11-10T23:32:25+02:00 | Accepted;96 unit/16 integration/9 browser/lint/build pass. fb985ff5a9e40bb3d4126e1ed334a4f350867cf5 committed/pushed; remote matched. |
| M5 Linked English translation | T5 | M4/T4 + owner confirmation | Complete | 2026-11-11T09:28:08+02:00 | Owner accepted all manual checks. Repeated117 unit/22 integration/11 browser/lint/build passed;9872f29cc17d9891c794786e1ba81c85c90322e6 committed/pushed, remote matched. |
| M6 Reading/listening | T6 | M5/T5 + owner confirmation | Complete | 2026-11-11T10:21:10+02:00 | Owner accepted; repeated132 unit/22 integration/14 browser/lint/build passed.20bf76146b8d25e4687f364249adb5f6f276c5c2 committed/pushed; remote matched. |
| M7 Verification/corrections | T7 | M6/T6 + owner confirmation | Complete | 2026-11-11T11:28:08+02:00 | Owner accepted;144 unit/26 integration/15 browser/lint/build passed.40697425c7a7e4f6692ea89f8342582bf875829e committed/pushed; remote matched. |
| M8 Follow/share/discover | T8 | M7/T7 + owner confirmation | Complete | 2026-11-11T12:34:50+02:00 | Owner accepted.154 unit/29 integration/16 browser/lint/build pass;00fbdfb4006cccaf8de9d052e4e4b33a94d90575 committed/pushed; remote matched before M9. |
| M9 Demo/submission evidence | T9 | M8/T8 + owner confirmation | Accepted / commit pending | 2026-11-11T18:41:07+02:00 | 165 unit/30 integration/18 browser/lint/build/fresh setup pass. Owner accepts reviews and5:00/5:15 rehearsals with explicit overrun exception; unspecified measurements unreported. Publication authorized. |

M10 intent-example prompting, UI refresh and hosting are explicitly authorized by D39; owner SQL/account handoffs remain required. No other milestone is implicitly authorized by M0.

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

### M4 implementation checkpoint - 2026-11-10T19:15:59+02:00

- M3 published as ade9f2b9a688def6aadca05138ddb88dc3360a31; origin/main matched. No M4 changes were introduced before publication.
- M4 pure logic/routes/editor/migration/tests implemented. Unit run19:13:25+02:00 exit0:93/93,14 files,2.37s. Build exit0 compile3.4s/TypeScript9.5s.
- Live approved ASR check exit0: exactly2 requests, Phrase1/2 only,1706ms/1536ms; no retries or phone audio. Local report data/benchmark-results/m4-asr-live-check.json; no accuracy claim. USD2 reserved, not billed usage.
- Integration19:13:29+02:00 exit1:9 existing pass,7 T4 cases BLOCKED on unapplied owner SQL (Vitest skipped after failed prerequisite). Not a pass. Browser gate uses the same explicit prerequisite. Owner handoff prepared in M4_VERIFICATION.

M4 final independent checks 2026-11-10T19:18:53+02:00: lint/build exit0 (compile2.7s/TypeScript7.6s); npm ls and whitespace exit0. Browser command exit1 before cases: M4 migration prerequisite blocked. Read-only schema confirms M4 columns absent and SHA256 available;0 disposable test users remain. M4 not complete, uncommitted; no M5.

### M4 applied verification - 2026-11-10T20:30:15+02:00

- Schema/constraint/function search paths and ACLs verified read-only: authenticated guarded save only; server-only claim/finish/publish; private helper denied to users; RLS/direct-write denial intact. Intentional save SECURITY DEFINER advisor warning documented in M4_VERIFICATION alongside existing Auth warning/task-denial INFO.
- Unit94/94 exit0,4.08s; integration16/16 exit0,38.41s after fixing local-clock-sensitive expiry fixture. HTTP LAN crypto.randomUUID failure fixed with getRandomValues v4 IDs; explicit accessible segment labels added.
- Dedicated M4 browser2/2 exit0,1.3m. Combined browser run6 passed/2 failed (suspension/short network waits); focused reruns: LAN auth passed, final remaining auth/audio case passed29.7s (command exit0,44.8s). All8 cases have passing evidence across runs; no claim of one uninterrupted all-green run. Assertion timeout30s, application processing limits unchanged.
- Final lint/build/whitespace exit0; compile4.4s/TypeScript15.1s. Failed-run fixture cleanup removed only two confirmed disposable accounts and owned fixture audio; no unrelated data touched. No new live calls after approved two-sample check.
- Manual desktop and both-phone checklist remains pending. M4 uncommitted/unpushed; M5 not started.

### M4 access/navigation repair verification - 2026-11-10T22:29:37+02:00

- Owner confirms different browsers; cannot retrieve affected URL while manual server stopped. Exact persisted B edit remains unconfirmed; do not claim shared tabs explain the report. New separate-context test denies B save and checks unchanged content after reload.
- Current identity verified by getUser per protected render, no client privileged key (publishable classification verified), published read-only for all, focus access recheck, native protected navigation. No SQL/paid-provider changes.
- Unit96/96 exit0,4.73s; integration16/16 exit0,49.33s; focused workflow3/3 exit0,2.3m; full browser9/9 exit0,3.5m. Final lint/build/whitespace exit0, compile7.0s/TypeScript12.1s.0 disposable test users remain.
- Manual passes1–4 retained; exact steps5/6 must be retested. M4 uncommitted/unpushed; M5 not started.

M4 owner acceptance 2026-11-10T23:10:31+02:00: owner confirms5/6 pass, authorizes M4 commit/push then M5 only. Retain prior failed results as history; do not infer a proven cause for original reported B persistence. No M6.

M4 publication gate 2026-11-10T23:22:26+02:00: unit96/96 exit0 (6.99s); integration16/16 exit0 (48.81s); isolated mock browser9/9 exit0 (4.3m); lint/build exit0 (compile4.7s/TypeScript13.6s); dependency/whitespace exit0. Initial browser run used a live-configured manual server and safely failed its mock-provider guards (7 pass/2 fail, zero provider calls); corrected managed-server rerun passed all9. Owner manual acceptance complete. Read-only RPC ACLs reverified.

### M5 applied verification checkpoint — 2026-11-10T23:41:45+02:00

Owner confirms migration applied. Read-only verification confirms consent column, unique source alignment index, error-code constraint, task RLS/default denial and all three invoker functions with empty search_path; anon/authenticated EXECUTE false, service_role true. No SQL applied by Codex. No duplicate alignments/conflicting errors found.

Unit117/117 exit0,17 files,23:34:35+02:00,7.05s. Integration22/22 exit0,4 files,23:39:10+02:00,71.59s. Final lint/build exit0 (compile4.2s,TypeScript10.5s); browser11-case suite running. Earlier blocked integration/browser runs retained as blocked, not passes. During development a stale error-message assertion, React memoization dependency mismatch and redundant TypeScript narrowed comparison failed; corrected and repeated checks passed. No new paid provider calls.

Security advisors contain no new M5 finding. Existing intentional default-denial task INFO and guarded m4_save_transcript SECURITY DEFINER warning remain, plus demo leaked-password-protection warning. See M4_VERIFICATION for rationale. M5 manual acceptance remains pending; no M5 commit/push or M6.

### M5 final automated gate — 2026-11-10T23:50:57+02:00

- npm run test:unit:117 passed(117),17 files, exit0,7.05s.
- npm run test:integration:22 passed(22),4 files, exit0,71.59s.
- npm run test:e2e:11 passed, exit0,5.1m, managed mock providers. Earlier full run9 passed/2 failed due ambiguous legacy Provider/permission selectors; selectors anchored to audio and the complete repeated11-case suite passed. No product authorization bypass or live call was used to repair tests.
- npm run lint: final exit0. npm run build: exit0, compile4.2s/TypeScript10.5s. npm ls --depth=0, documentation-link and whitespace checks exit0. Production client secret-value scan passed across16 JavaScript assets; no values printed.
- Owner-applied schema/index/constraint/function ACLs and task RLS/default denial verified read-only; security advisor findings unchanged from documented baseline.0 disposable test accounts remain.
- Manual server running on localhost:3000 and192.168.18.157:3000, default OpenAI/gpt-5.4-mini-2026-03-17. No new agent live provider calls. Ordinary tests used mocks.
- M5 manual desktop/phone acceptance remains pending. M5 uncommitted/unpushed. M6 not started or authorized. Browser-driven processing, interrupted-response billing risk and lack of account-wide app spend enforcement remain documented limitations.

M5 owner acceptance 2026-11-11T08:34:02+02:00: owner reports all requested tests pass and authorizes commit/push M5 then M6 only. This resolves the manual acceptance gate; no additional device/version or quality measurements were supplied. Final publication checks pending. M7 is unauthorized.

M5 publication gate 2026-11-11T08:38:59+02:00: repeated unit117/117 exit0 (5.53s); integration22/22 exit0 (76.00s); full browser11/11 exit0 (4.9m); lint/build exit0 (compile3.6s/TypeScript10.0s); whitespace exit0. Owner manual acceptance recorded above. No new paid calls.

### M6 implementation checkpoint — 2026-11-11T09:28:08+02:00

M5 published as9872f29cc17d9891c794786e1ba81c85c90322e6; remote verified before M6 code. Automatic approval initially rejected publication despite original instruction; explicit renewed owner approval was accepted, and normal commit/push succeeded. No workaround, force push or M6 commit.

M6 adds profile-aware original/English aligned reading, click/keyboard seeking, current segment highlighting, signed audio renewal, document-scoped audio/voice arbitration, optional browser-reported local English narration and cleanup. No schema, dependencies or paid calls added. Unit132/132 exit0,19 files,09:25:39+02:00,2.29s; lint/build exit0,compile4.4s/TypeScript6.9s. Full integration/browser running. Manual checks in M6_VERIFICATION remain required; M7 unauthorized.

### M6 final automated verification — 2026-11-11T09:42:56+02:00

- Unit:132 passed(132),19 files,exit0,09:37:42+02:00,5.74s.
- Integration:22 passed(22),4 files,exit0,09:25:43+02:00,63.34s; actual existing Supabase schema/user authorization. No migration needed.
- Full browser:14 passed,exit0,4.6m. Initial full run11 passed/3 failed (5.8m) on exact implicit select-label lookup; explicit aria-labels fixed it. Final native seek/end/accessibility-description case also passed separately (1 test,37.8s). Device speech stubs are confined to tests, not proof of audible output.
- Final lint/build exit0 (compile2.8s/TypeScript7.3s). A test-only dotAll regex flag first failed the existing ES2017 TypeScript target; equivalent [\s\S] expression fixed it without changing application target.
- npm ls --depth=0, whitespace and local documentation links pass. Final production client secret-value scan passes across16 JavaScript assets; no values displayed. .env.local/data remain ignored; M6 remains unstaged.0 disposable test accounts remain.
- No new paid provider calls, schema mutations or dependencies. M5 stays published at9872f29cc17d9891c794786e1ba81c85c90322e6. M6 manual desktop/Huawei/Oppo acceptance remains pending; M6 uncommitted/unpushed, M7 unauthorized.
- Next.js feedback review completed: no qualifying framework issue retained. Label/regex fixes were routine application/test debugging; no feedback sent.

Owner acceptance 2026-11-11T10:07:45+02:00: all requested M6 tests pass; owner authorizes M6 commit/push, then M7 only. No further device/version observations supplied. M8 unauthorized. Repeated publication checks pending.

M6 publication recheck 2026-11-11T10:12:37+02:00:132 unit (4.11s),22 integration (63.70s),14 browser (4.7m), lint passed exit0. Owner manual acceptance recorded. Production build repeated before commit. No paid calls.

M7 checkpoint 2026-11-11T10:22:54+02:00: unit144/144 exit0,21 files,4.35s; lint/build exit0 (compile2.0s/TypeScript5.1s) after correcting nullable query capture. Integration command exit1:22 existing pass,4 M7 cases blocked/skipped at unapplied SQL preflight (62.95s). Browser likewise blocked before cases; not passed. Dependency/whitespace checks pass. Owner SQL and subsequent manual acceptance pending. No M7 commit/push or M8 work.

M7 applied verification 2026-11-11T10:34:18+02:00: owner applied SQL; read-only definition matches migration, empty search_path, anonymous/PUBLIC execute denied, authenticated execute granted. Reviews/review_edits RLS true; anonymous select and direct authenticated insert/update false. Advisor intentionally flags guarded m7_save_review SECURITY DEFINER (alongside prior M4 save and demo password warning); no broad grants added. Unit144/144 exit0 (3.23s), integration26/26 exit0 (77.08s), lint exit0. Browser15-case gate running; manual acceptance pending. No M7 commit/push or M8.

M7 final applied verification 2026-11-11T10:38:39+02:00: unit144/144 exit0 (3.23s); integration26/26 exit0 (77.08s); full browser15/15 exit0 (5.2m); lint/build exit0 (compile2.7s/TypeScript10.8s); dependency/whitespace checks passed.0 disposable test users remain. Schema/function/ACL/RLS verified read-only, including no PUBLIC execution and no direct ordinary review/edit writes. Intentional guarded SECURITY DEFINER advisor warning documented above. No new code repairs or paid provider calls. Required owner manual verification remains pending; M7 uncommitted/unpushed, M8 not started. Next.js feedback review: no qualifying framework issue in this verification pass.

Owner acceptance 2026-11-11T11:05:16+02:00: all manual tests pass; M7 commit/push authorized, then M8 only. No M9 authorization. Repeated publication checks pending.

M7 publication recheck 2026-11-11T11:09:25+02:00: unit144/144 exit0 (3.94s), integration26/26 exit0 (74.42s), full browser15/15 exit0 (5.2m), lint exit0. Owner manual acceptance recorded; production build repeated before commit. No paid calls.

M8 applied checkpoint 2026-11-11T11:40:54+02:00: owner confirms migration applied; normalized function bodies match source; empty search paths, no PUBLIC/anon execution, authenticated-only grants. Feed invoker, relationship guarded definer. Both tables retain RLS/no direct authenticated insert/update/delete. Advisor flags intentional authenticated definer alongside prior M4/M7 capabilities; demo password-protection warning unchanged. Unit154/154 exit0 (5.55s); integration29/29 exit0 (85.30s), strengthened own-draft focused3/3 exit0 (14.26s). Initial fixture null timestamp failure repaired. Browser first run15 passed/1 failed on stale pre-filter links; loading-state and test wait repaired, full rerun pending. No paid calls or M9.

M8 final automated gate 2026-11-11T11:46:24+02:00: unit154/154 exit0 (23 files,5.55s); full integration29/29 exit0 (85.30s), extra own-draft focused3/3 exit0 (14.26s); full browser16/16 exit0 (5.7m); final lint/build exit0 (compile4.0s/TypeScript9.2s). Earlier effect-state lint/test type-inference/fixture timestamp/filter-loading failures repaired; no SQL reapplication required. Dependency/whitespace/docs-link checks pass.0 disposable test accounts remain. SQL source hashes/search paths/ACLs/RLS verified read-only; intentional authenticated definer warning documented. No paid provider calls. Required actual two-account/Huawei/Oppo manual acceptance pending. M8 remains unstaged/uncommitted/unpushed; M9 not started. Next.js feedback pass found no qualifying framework issue; app/test debugging only.

Owner acceptance 2026-11-11T12:30:05+02:00: all M8 manual tests pass. Owner authorizes M8 commit/push then M9 only; M10 deferred. Repeated publication checks pending.

M8 publication recheck 2026-11-11T12:33:50+02:00:154 unit exit0 (3.90s),29 integration exit0 (96.10s),16 browser exit0 (6.8m), lint exit0. Owner manual acceptance recorded; production build repeated before commit. No paid calls.

## M9 automated verification / manual stop (2026-11-11T15:38:27+02:00)

Only provided Phrase1/2 audio permitted by owner (D38). Implemented scoped dry-run/mock seed, source fresh-install verifier and full two-user normal/recovery journey. All implemented suites passed:165 unit,30 integration,18 browser; lint/build/dependency/whitespace/links/known-secret checks passed. Fresh source npm ci/unit/lint/build passed; no credentials copied. No tagged test accounts remain. npm audit reports7 moderate transitive tooling findings (0 high/critical), unresolved. See M9_VERIFICATION for actual command output, earlier repaired test failures, setup warnings and exact required manual observations.

M8 HEAD/origin remains00fbdfb4006cccaf8de9d052e4e4b33a94d90575. M9 working files remain uncommitted/unstaged. Local dev server is running for human checks. No new agent live provider call, migration, deployment, submission or M10 implementation.
