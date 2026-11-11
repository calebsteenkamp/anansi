# M8 verification and owner handoff

Checkpoint 2026-11-11T11:28:08+02:00. M7 accepted/published as40697425c7a7e4f6692ea89f8342582bf875829e; remote verified. Only M8 authorized. No M8 commit/push until all automation and actual manual acceptance pass; no M9.

## SQL application

Review supabase/migrations/20261111092155_m8_discovery_relationships.sql, then run the complete file once in Anansi SQL Editor (project lizbeiqyrwzkybpentrk). Reply migration applied or the exact SQL error. Do not reset the project or reapply older migrations. Codex does not apply owner SQL.

The transaction creates two functions, no new tables or broad grants: m8_relationship is authenticated SECURITY DEFINER with empty search_path and auth.uid/target/state checks for idempotent own follow/repost insert/delete; m8_feed is authenticated SECURITY INVOKER reading under RLS with explicit published filters and fixed query parameters. PUBLIC/anon execution revoked. A generic destructive warning may refer to REVOKE or deleting only the caller's relationship when explicitly requested; no bulk data deletion or original/AI modification. Advisor may flag the intentionally authenticated definer capability; real-user tests must prove its boundary.

Read-only verification after application: definitions/search paths/function ACLs, RLS/no direct user insert/update/delete, advisors. Ordinary feed queries and relationship assertions use actual user/anonymous sessions; service role only sets up/cleans unique fixtures.

## Automated evidence

Unit154/154 passed,23 files,11:25:20+02:00,5.62s. Initial lint rejected effect-triggered synchronous state updates; initial discovery moved to authenticated SSR, with subsequent filtered reads explicit. Repeat lint/build and all suites; actual later evidence appended below. Missing SQL blocks integration/browser, not passed. No paid provider calls.

## Exact manual checks after automated gates pass

Desktop http://localhost:3000; Huawei/Oppo http://192.168.18.157:3000 same Wi-Fi. Use separate A/B browser sessions, verify Signed in as on profiles. Existing published stories/completed English suffice; no new AI generation required.

1. As B, choose Discover stories. Search A's title, filter isiXhosa/English and combine with Following. Only published originals/completed English should appear, no drafts/pending English (including your own). Clear filters restores newest.
2. Follow A on a card; Following should include A's published versions. Reload: relationship persists. Repost a story and reload: Remove repost shows your saved repost. Story link opens correct original; English card opens Original + English without changing saved profile preference.
3. As A, find B's repost attribution and Follow reposter. Following now includes B's repost of A's story. For a two-account deduplication check, A also reposts A’s own story: B following A must still see it once per language version despite both authored and reposted inclusion. Versions are distinct cards; reposts do not bump creation-time order.
4. B removes their repost; A refreshes Following: repost-only inclusion disappears. A or B unfollows: author-only inclusion disappears. One account's removal must not remove another's relationships/reposts. Repeated clicks should not duplicate records. Self-follow is unavailable/denied.
5. Search a nonexistent title: usable empty state; Clear filters restores results. Try case-insensitive and literal title substrings; at most50 newest matches are shown. Confirm no processing starts from browsing/reload.
6. Repeat follow/repost/filter/English-link/unfollow and profile/story navigation on both phones. Check no input resets, stuck Loading/Rendering, hydration/runtime errors or horizontal overflow. Report pass/fail per item/device without credentials/private playback links.

Known limits: local demo, newest50 bounded results/no pagination, creation-time order (not repost chronology), language versions distinct, no recommendations/external social posting. No M9 work.

M8 applied checkpoint 2026-11-11T11:40:54+02:00: owner confirms migration applied; normalized function bodies match source; empty search paths, no PUBLIC/anon execution, authenticated-only grants. Feed invoker, relationship guarded definer. Both tables retain RLS/no direct authenticated insert/update/delete. Advisor flags intentional authenticated definer alongside prior M4/M7 capabilities; demo password-protection warning unchanged. Unit154/154 exit0 (5.55s); integration29/29 exit0 (85.30s), strengthened own-draft focused3/3 exit0 (14.26s). Initial fixture null timestamp failure repaired. Browser first run15 passed/1 failed on stale pre-filter links; loading-state and test wait repaired, full rerun pending. No paid calls or M9.

Advisor reference for the intentionally guarded relationship capability: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable . No broad table grants were added.

M8 final automated gate 2026-11-11T11:46:24+02:00: unit154/154 exit0 (23 files,5.55s); full integration29/29 exit0 (85.30s), extra own-draft focused3/3 exit0 (14.26s); full browser16/16 exit0 (5.7m); final lint/build exit0 (compile4.0s/TypeScript9.2s). Earlier effect-state lint/test type-inference/fixture timestamp/filter-loading failures repaired; no SQL reapplication required. Dependency/whitespace/docs-link checks pass.0 disposable test accounts remain. SQL source hashes/search paths/ACLs/RLS verified read-only; intentional authenticated definer warning documented. No paid provider calls. Required actual two-account/Huawei/Oppo manual acceptance pending. M8 remains unstaged/uncommitted/unpushed; M9 not started. Next.js feedback pass found no qualifying framework issue; app/test debugging only.

Owner acceptance 2026-11-11T12:30:05+02:00: all M8 manual tests pass. Owner authorizes M8 commit/push then M9 only; M10 deferred. Repeated publication checks pending.

M8 publication recheck 2026-11-11T12:33:50+02:00:154 unit exit0 (3.90s),29 integration exit0 (96.10s),16 browser exit0 (6.8m), lint exit0. Owner manual acceptance recorded; production build repeated before commit. No paid calls.
