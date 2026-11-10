# Milestones and evidence

Source of actual progress; [PLANS](../PLANS.md) defines tasks and [TEST_PLAN](TEST_PLAN.md) defines proof. Status vocabulary: not started, in progress, blocked, verified/commit pending, complete. Dates are ISO +02:00. Complete requires evidence, not planned tests.

| Milestone | Gate | Dependency | Status | Status timestamp | Evidence / blocker / commit |
| --- | --- | --- | --- | --- | --- |
| M0 Foundation + documentation | T0 | Owner-approved docs step | Complete | 2026-11-09T23:29:10+02:00 | T0 passed; first commit 3287918; recorded in subsequent docs commit. |
| M1 Provider feasibility | T1 | M0 complete + owner confirmation | Verified/commit pending | 2026-11-10T12:03:52+02:00 | Owner accepted M1 results; final rechecks/publication pending; Google key not yet entered. |
| M2 Database/auth/profiles | T2 | M1/T1 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Q4 project/migrations; no implementation. |
| M3 Capture/upload/drafts | T3 | M2/T2 + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Q5 device/format evidence pending. |
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
