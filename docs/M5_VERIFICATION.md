# M5 setup and verification

Initial checkpoint 2026-11-10T23:32:25+02:00. M4 fb985ff5a9e40bb3d4126e1ed334a4f350867cf5 committed/pushed; remote matched. Owner authorizes M5 only. M5 remains uncommitted until SQL, all suites and manual acceptance pass; M6 not authorized.

## Owner SQL handoff

Review supabase/migrations/20261110212329_m5_translation_processing.sql. In Supabase project lizbeiqyrwzkybpentrk (Anansi), open SQL Editor, paste the complete file and Run once. Reply with success or the exact SQL error; do not reset the project or reapply older migrations. A generic destructive-operation warning can be triggered by REVOKE: this file revokes ordinary execution on newly created processing functions. It does not delete rows, tables, schemas, original audio or transcripts. Review before accepting.

The transaction adds stories.translation_consent_at, one unique translated-source segment index and an allowlisted task error constraint. It creates three service-role-only SECURITY INVOKER functions (empty search_path): claim checks author/published original, consent, fingerprint and concurrent processing; finish validates current token/expiry/fingerprint and atomically saves aligned English/result/status; retry resets only failed/expired tasks. Ordinary roles receive no task/result writes or processing EXECUTE grants. Existing RLS keeps partial English author-private and completed English signed-in readable. No privileged SECURITY DEFINER function is added.

After your reply, Codex verifies columns/index/constraint/function privileges/RLS read-only, runs actual Supabase integration and all browser cases, and checks advisors. No SQL is automatically applied. Missing schema or settings is blocked/not run.

## Commands and current evidence

- npm run test:unit:115/115 passed,17 files, exit0,23:28:30+02:00,6.63s. Initial run95 pass/1 failed because a safe generic error message assertion still named M4; updated assertion then all passed.
- npm run lint: exit0.
- Final verified results:117 unit,22 integration,11 browser tests and lint/build pass. Read the final gate below for timestamps/history. Manual acceptance remains pending.
- No new live benchmark or paid provider requests were run for M5. Mock tests establish workflow only.

Run npm run lint, npm run build, npm run test:unit, npm run test:integration, npm run test:e2e, npm ls --depth=0 and git diff --check. Stop manual dev server before build/browser; browser tests start their own mock server. Do not reuse live OpenAI development server. Test fixtures are disposable UUID users/rows; cleanup only those fixtures.

## Manual desktop and phone acceptance (after automated gates pass)

Start npm run dev -- --port 3000. On desktop use http://localhost:3000; on Huawei/Oppo use the exact ANANSI_DEV_HOSTS LAN address on port3000, same Wi-Fi. Keep A/B in different browser sessions and check different Signed in as labels. Do not send passwords, keys or signed audio links.

1. As A, use a permission-cleared audio draft, enter/correct its transcript and title, Save, then check text-translation consent and Publish. This explicitly sends each saved segment to the displayed provider (OpenAI default; paid usage under the existing allowance). Observe progress reaching all segments saved, AI provider/model and Awaiting human verification. Original audio/text must remain unchanged. If permission/budget for the chosen text is uncertain, use mock mode and report that limitation.
2. Refresh the published page. Confirm English text is identical and no translation starts automatically. Click Refresh translation progress: it must say no provider request. No Continue/Retry controls once complete.
3. For a multi-segment story, navigate away while translation is processing, then reopen. An in-flight segment may finish. Saved segments must remain. Click Continue for pending work; if an interrupted claim remains processing, wait at least5min, Refresh then explicitly Retry. Only unfinished segments should progress; previously saved English must not change. Do not intentionally resend completed work.
4. As B, open A's exact published-original URL: read original and completed English, with no translation mutation controls. Before completion B must not see partial English. B cannot open A's draft or edit either original/AI text.
5. On each phone, repeat consent/publish/progress, reload and Continue when applicable. Confirm no typing resets, hydration/runtime errors, or stuck profile/new-story navigation. Existing audio must still play audibly.
6. Report pass/fail per item with provider mode and actual observations. Automated mock tests cover provider failure/Retry. A real quota/outage need not be deliberately incurred; report any natural error and whether saved progress remains.

Limitations: current auto-start is browser-driven, not a background worker. Leaving stops subsequent requests; active server work may still finish. Provider response lost before persistence may require another paid call after explicit retry. No account-wide application spend enforcement or translation-accuracy claim. M6 listening synchronization/device speech and M7 reviews remain planned.

### M5 applied verification checkpoint — 2026-11-10T23:41:45+02:00

Owner confirms migration applied. Read-only verification confirms consent column, unique source alignment index, error-code constraint, task RLS/default denial and all three invoker functions with empty search_path; anon/authenticated EXECUTE false, service_role true. No SQL applied by Codex. No duplicate alignments/conflicting errors found.

Unit117/117 exit0,17 files,23:34:35+02:00,7.05s. Integration22/22 exit0,4 files,23:39:10+02:00,71.59s. Final lint/build exit0 (compile4.2s,TypeScript10.5s); browser11-case suite running. Earlier blocked integration/browser runs retained as blocked, not passes. During development a stale error-message assertion, React memoization dependency mismatch and redundant TypeScript narrowed comparison failed; corrected and repeated checks passed. No new paid provider calls.

Security advisors contain no new M5 finding. Existing intentional default-denial task INFO and guarded m4_save_transcript SECURITY DEFINER warning remain, plus demo leaked-password-protection warning. See M4_VERIFICATION for rationale. M5 manual acceptance remains pending; no M5 commit/push or M6.

Advisor references: [intentional task default denial](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [guarded M4 save capability](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [existing demo password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). M5 adds no SECURITY DEFINER function.

Manual clarification: existing stories published in M4 do not auto-start on page load. For those, review the displayed stored provider, check permission and choose Continue. Use a new draft to test automatic processing after Publish. Use typed/pasted text for this M5 check; the agent's earlier two-request M4 transcription authorization has already been consumed. If all segments finish before navigation, interruption was not exercised; report that observation rather than a recovery pass.

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

Publication complete:9872f29cc17d9891c794786e1ba81c85c90322e6 committed/pushed; remote hash verified before M6 implementation. Owner reports all required manual tests passed. M6 status is separate in M6_VERIFICATION/MILESTONES.
