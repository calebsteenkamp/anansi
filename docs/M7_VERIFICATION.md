# M7 verification and handoff

Initial checkpoint 2026-11-11T10:21:10+02:00. M6 accepted/published as20bf76146b8d25e4687f364249adb5f6f276c5c2; remote verified. M7 only authorized. No M7 commit/push before SQL, automated gates and actual manual acceptance. No M8.

## Owner SQL application

Review supabase/migrations/20261111081510_m7_reviews.sql, then run the complete file once in Anansi SQL Editor (project lizbeiqyrwzkybpentrk). Reply migration applied or the exact SQL error. Do not reset the database or reapply old migrations. Codex does not apply SQL.

The transaction creates public.m7_save_review, a narrow authenticated SECURITY DEFINER function with empty search_path. PUBLIC/anon execution revoked. It requires auth.uid, both languages in the current locked profile and a completed English translation with published original; validates decision, integer rating, intent and own-translation corrections; upserts only caller review and replaces only its edits atomically. No tables/data are dropped, and source/AI segments are never updated. REVOKE may trigger the SQL Editor's generic destructive warning; inspect its scope before accepting. An advisor may flag authenticated SECURITY DEFINER execution: intentional capability, with real-user boundary tests required. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable .

After owner application: inspect function definition/search_path/ACLs/RLS read-only, run all integration/browser suites, check advisors. Current unit144/144 pass (21 files,4.35s); initial build caught nullable query capture, fixed before repeat. Remaining actual command evidence is recorded below/MILESTONES. Missing SQL means blocked/not run. No paid tests.

## Owner manual checks after automation passes

1. Desktop http://localhost:3000; phones http://192.168.18.157:3000 on same Wi-Fi. Use existing published original with completed English; no new paid generation needed.
2. As A, list isiXhosa+English on profile. Use a completed story with no existing reviews if possible. Choose Reading language → Original + English, then compare source/AI side-by-side. Approve/reject, rate1–5, add intent and a correction, Save. Refresh: own entries persist, one review only, correct confidence and Storyteller tag for author.
3. Toggle latest community corrections: reader/device voice uses labelled corrected text. Toggle off/reload: AI returns unchanged. Original transcript/audio must stay unchanged. Updating own review replaces it; blank corrections remove only own prior edits.
4. As bilingual B in another browser, submit/update an independent review; confirm confidence rule (none Awaiting; majority rejection Disputed; otherwise mean<3 Fairly confident; >=3 Confident). Latest review containing edits supplies overlay and reviewer label. No one edits another review.
5. Keep B’s story/review form open. In another tab of the same B browser, remove one spoken language on Your profile and Save. Return to the old form and attempt Save: expect a bilingual-eligibility denial. Reload: no review form; historical review remains. For the stale-account check, sign into A in another tab of that same browser, then submit the old B form: expect Account changed / reload, with neither review overwritten.
6. On Huawei/Oppo repeat correction/rating/save/reload/toggle and profile navigation, no input resets, hydration/runtime errors or horizontal overflow. Report pass/fail per item/device without credentials/private audio URLs.

M7 remains uncommitted until actual manual acceptance. No M8.

M7 checkpoint 2026-11-11T10:22:54+02:00: unit144/144 exit0,21 files,4.35s; lint/build exit0 (compile2.0s/TypeScript5.1s) after correcting nullable query capture. Integration command exit1:22 existing pass,4 M7 cases blocked/skipped at unapplied SQL preflight (62.95s). Browser likewise blocked before cases; not passed. Dependency/whitespace checks pass. Owner SQL and subsequent manual acceptance pending. No M7 commit/push or M8 work.

M7 applied verification 2026-11-11T10:34:18+02:00: owner applied SQL; read-only definition matches migration, empty search_path, anonymous/PUBLIC execute denied, authenticated execute granted. Reviews/review_edits RLS true; anonymous select and direct authenticated insert/update false. Advisor intentionally flags guarded m7_save_review SECURITY DEFINER (alongside prior M4 save and demo password warning); no broad grants added. Unit144/144 exit0 (3.23s), integration26/26 exit0 (77.08s), lint exit0. Browser15-case gate running; manual acceptance pending. No M7 commit/push or M8.

M7 final applied verification 2026-11-11T10:38:39+02:00: unit144/144 exit0 (3.23s); integration26/26 exit0 (77.08s); full browser15/15 exit0 (5.2m); lint/build exit0 (compile2.7s/TypeScript10.8s); dependency/whitespace checks passed.0 disposable test users remain. Schema/function/ACL/RLS verified read-only, including no PUBLIC execution and no direct ordinary review/edit writes. Intentional guarded SECURITY DEFINER advisor warning documented above. No new code repairs or paid provider calls. Required owner manual verification remains pending; M7 uncommitted/unpushed, M8 not started. Next.js feedback review: no qualifying framework issue in this verification pass.

Owner acceptance 2026-11-11T11:05:16+02:00: all manual tests pass; M7 commit/push authorized, then M8 only. No M9 authorization. Repeated publication checks pending.

M7 publication recheck 2026-11-11T11:09:25+02:00: unit144/144 exit0 (3.94s), integration26/26 exit0 (74.42s), full browser15/15 exit0 (5.2m), lint exit0. Owner manual acceptance recorded; production build repeated before commit. No paid calls.

M7 published as40697425c7a7e4f6692ea89f8342582bf875829e after owner acceptance/rechecks. Remote matched before M8 code.
