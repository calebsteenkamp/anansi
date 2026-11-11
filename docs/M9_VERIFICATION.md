# M9 verification and manual handoff

M8 is accepted and published as `00fbdfb4006cccaf8de9d052e4e4b33a94d90575`; remote main matched before M9 code. M9 is owner-accepted, publication pending. M10 and hosting are now explicitly authorized. No new migration, remote deployment, new narrative collection, paid benchmark or submission is included.

## Acceptance and files

Repeatable scoped demo preparation; provided-audio two-account journey and failure recovery; fresh install/unit/lint/build; accurate setup/demo/submission documentation; real bilingual feedback and two uninterrupted rehearsals of at most five minutes. Preserve existing audio, published transcripts, AI results, reviews and accounts.

Persistent instructions: `AGENTS.md`. Code: `lib/demo.ts`, `scripts/seed-demo.ts`, `scripts/verify-fresh-setup.ts`, `tests/demo.test.ts`, `tests/integration/demo.test.ts`, `tests/e2e/journey.spec.ts`, `package.json`, `app/page.tsx`, `eslint.config.mjs`, `tsconfig.json`. Documentation: README, PLANS, PROJECT_BRIEF/CONTEXT, ARCHITECTURE, DECISIONS, OPEN_QUESTIONS, TEST_PLAN, MILESTONES, DEMO_SCRIPT, this file and SUBMISSION_CHECKLIST. Ignore local data/snapshot artifacts; never stage credentials.

## Automated evidence

Final command output/timestamps are recorded below. Missing prerequisites are blocked, not passed. Tests use deterministic mock providers and disposable Supabase accounts with exact audio cleanup; they do not establish linguistic quality, device audibility or a human rehearsal.

First targeted seed integration run (2026-11-11T12:41:36+02:00) failed because its new assertion selected `text` instead of the existing `review_edits.corrected_text` column. The assertion was corrected; preserve this failure in history. No production schema change was needed.

## Exact manual checks (required before M9 commit)

1. **Prepare the demonstration:** follow DEMO_SCRIPT preparation. Choose existing Storyteller/Verifier accounts and their UUIDs; set xh and en+bilingual profiles through the UI. Run seed dry-run, inspect its named IDs, then `--apply`. Open the returned backup URL as B and play the supplied audio. Confirm visible synthetic mock English. Run seed again; confirm same URLs, original audio, completed text and any existing review/repost remain. No passwords, keys or signed audio URLs in replies.
2. **Real bilingual session:** use only Phrase 1 (Phrase 2 is the permitted alternate). Have a bilingual person listen and inspect the provided references and actual English output in its explicitly stated mode. Ask what meaning/intent is right or wrong, make any real corrections through the app, and time the correction/review task. Record their actual confidence rating, decision, corrections, intent note, usability feedback and limitations. Use an existing OpenAI translation of the provided Phrase1/2 material where available (stored story or accepted M1 output), and identify it. If none exists, a live demonstration is an explicit owner action using only the cleared sample; the agent does not run a new benchmark. A mock-only review is useful workflow feedback but leaves the real-output meaning/intent gate pending unless the owner explicitly changes that scope. Do not invent a correction or a positive review.
3. **Rehearsal 1:** start a timer and execute the exact DEMO_SCRIPT from beginning to end using only supplied audio. Two separate browser sessions, including actual audible original playback, transcript save/publish, English, review/correction overlay and follow/repost/discovery. Record actual elapsed time, mode and any recovery. At most five minutes and no interruption required for a pass.
4. **Rehearsal 2:** repeat with a fresh draft of the same supplied audio (published originals stay frozen; seed does not reset draft/reviews). Record separate date/time, elapsed duration, mode and outcome. Do not count automated tests as this rehearsal.
5. **Submission review:** inspect SUBMISSION_CHECKLIST. Confirm honest live/mock labels and limitations; check the required capstone submission destination/format yourself. No upload, video, deployment or deadline extension is claimed here.

Reply with actual observations: seed pass/failure; tester sample/mode, time/rating/corrections/intent feedback; rehearsal1 and2 durations/outcomes; any failures. Then M9 may be reviewed for commit/push. Keep M10 deferred.

| Human evidence | Actual observation |
| --- | --- |
| Source restriction | Owner: only the provided audio; Phrase1 primary, Phrase2 alternate. |
| Demo account UUIDs / seeded URL check | Pending owner selection; no production demo accounts changed by agent. |
| Bilingual session date/sample/mode | Not run / not supplied. |
| Correction task duration / actual tester rating / decision | Not supplied. |
| Observed meaning/intent issues and actual corrections | Not supplied; reference text is not new tester evidence. |
| Rehearsal1 date/duration/mode/outcome | Not run. |
| Rehearsal2 date/duration/mode/outcome | Not run. |
| Submission/video artifact | Not produced; owner review pending. |

Build verification history: the first M9 production build compiled but failed TypeScript in the new parameterized argument test (`it.each` array spreading). The table now wraps each input in an object, so it tests the intended complete argument arrays. Rerun:165 unit tests passed; production build exited0 (compile8.3s, TypeScript24.8s,13 pages). No product behavior was changed to hide the failure.

Integration rerun at2026-11-11T15:19:28+02:00:7 files/30 tests passed,123.83s, exit0, including missing-profile refusal, preservation of an edited demo draft/review/repost/completed attempts and unchanged provided audio.

## Final automated gate — observed 2026-11-11T15:38:27+02:00

| Command/check | Actual output/evidence | Exit/status |
| --- | --- | --- |
| npm run test:unit | 24 files,165 tests passed; start2026-11-11T15:17:27+02:00,19.02s | 0 |
| npm run test:integration | 7 files,30 tests passed; start2026-11-11T15:19:28+02:00,123.83s | 0 |
| Final targeted seed integration rerun | 1 test passed; start2026-11-11T15:32:44+02:00,25.59s; missing audio is read before creating accounts | 0 |
| npm run test:e2e | 18 passed (12.5m); includes both provided-Phrase1 normal/recovery journeys and all earlier regressions | 0 |
| npm run lint | eslint completed with no lint findings; repeated independently in fresh snapshot | 0 |
| npm run build | Compiled8.3s, TypeScript24.8s,13 generated pages; earlier test typing error repaired | 0 |
| npm ls --depth=0 | Installed direct dependencies consistent; no package changes introduced | 0 |
| seed:demo dry run | Printed deterministic named IDs/hash and dry-run label; no service writes; dummy UUIDs were argument-validation fixtures, not existing demo accounts | 0 |
| verify:fresh-setup | npm ci427 packages;165 units passed13.36s; lint0; build compile2.6min, TypeScript42s,13 pages; all subcommands0 | 0 |
| Fresh snapshot isolation | Local ignored data/verification/fresh-2026-11-11T13-19-54-917Z; no .env.local, audio or existing dependencies copied. No provider calls. Final integration test source refreshed before snapshot checks. | Confirmed |
| Known configured server-secret scan | 171 source/production-client files,0 matches; .env.local and provided audio remain Git-ignored | Passed |
| Documentation/whitespace | 63 local Markdown file links resolved; git diff --check0 | Passed |
| Fixture cleanup | Remaining anansi-t2- accounts:0 after suites; test-owned audio removed in finally blocks | Confirmed |
| Manual server HTTP | localhost:3000 and192.168.18.157:3000 returned200 at2026-11-11T15:37:19+02:00 | 0 |
| Publication boundary | HEAD/origin main both00fbdfb4006cccaf8de9d052e4e4b33a94d90575; staged diff empty; M9 uncommitted/unpushed | Confirmed |

### Remaining limitations and findings

- npm audit exited1:7 moderate findings,0 high/critical. All seven affected entries are transitive ESLint/TypeScript-ESLint tooling (including minimatch); dependency updates were not made. The install itself exited0. Do not describe the audit as clean.
- Fresh install warned that pinned eslint9.39.5 is unsupported and esbuild's install script is not covered by npm's allowScripts. Unit/build commands nevertheless succeeded; no script-approval or dependency configuration was silently changed.
- Nested repository-local fresh build warned about multiple lockfiles/inferred workspace root. It built successfully without an environment file, using freshly installed dependencies; this is a source install/build check, not a new cloud-project deployment.
- No new live benchmark or agent provider request. Real translation quality and actual human feedback cannot be inferred from mock tests.
- Production demo seeding awaits owner-selected existing account UUIDs and manual execution; only disposable test accounts were seeded by the agent.
- Human bilingual feedback on real provided-sample output, two timed rehearsals and submission review remain pending. M9 is not complete and must not be committed/pushed yet. M10 deferred.

Next.js feedback review: no qualifying framework issue retained; routine test errors, expected nested-root/environment warnings and install duration were not classified as framework defects.

## Owner acceptance (2026-11-11)

Owner reports all reviews passed and accepts the two rehearsals at **5:00 and5:15**, explicitly allowing a slight overrun. The second run exceeds the original five-minute gate; this is an owner-approved exception, not a claim that it met the old limit. Ratings, correction-task time, detailed linguistic feedback and exact session dates were not supplied and remain unreported. No video/submission artifact is claimed. This acceptance supersedes the historical pending-human gate above and authorizes M9 commit/push. M10 and Vercel deployment are separately authorized by the latest implementation plan.
