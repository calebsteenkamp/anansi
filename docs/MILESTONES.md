# Milestones and evidence

Source of actual progress; [PLANS](../PLANS.md) defines tasks and [TEST_PLAN](TEST_PLAN.md) defines proof. Status vocabulary: not started, in progress, blocked, verified/commit pending, complete. Dates are ISO +02:00. Complete requires evidence, not planned tests.

| Milestone | Gate | Dependency | Status | Status timestamp | Evidence / blocker / commit |
| --- | --- | --- | --- | --- | --- |
| M0 Foundation + documentation | T0 | Owner-approved docs step | Complete | 2026-11-09T23:29:10+02:00 | T0 passed; first commit 3287918; recorded in subsequent docs commit. |
| M1 Provider feasibility | T1 | M0 complete + owner confirmation | Not started | 2026-11-09T23:15:58+02:00 | Q1-Q3; no code/benchmark authorized yet. |
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
- M1 remains not started and requires explicit owner confirmation. No push or remote migration performed.

## Operating schedule

Original targets: 9 November M0-M3/start M4; 10 November finish M4-M7; 11 November M8-M9 and demonstration. These are targets, not evidence or permission to bypass gates. Deadline 2026-11-11T23:59:00+02:00. Hourly read-only reminder will be configured after successful M0 commits; do not infer scheduling from this plan.

For every later milestone append start/block/verification/commit events, commands and exit codes, fixture/environment descriptions, manual observations, decision links, and next owner-confirmation gate.
