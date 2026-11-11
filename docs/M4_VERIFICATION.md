# M4 verification and owner handoff

M3 was accepted on both actual phones, committed/pushed as **ade9f2b9a688def6aadca05138ddb88dc3360a31**, and origin/main matched. Only M4 is now authorized; M5 is not started. M4 remains uncommitted.

## Owner migration application (verified)

Review [20261110165905_m4_transcript_publish.sql](../supabase/migrations/20261110165905_m4_transcript_publish.sql), then run it once in the SQL Editor of existing Anansi project **lizbeiqyrwzkybpentrk**. Reply migration applied or provide the SQL error. Do not reset the project or reapply older SQL.

The additive transaction adds transcript origin, revision, claim token/expiry and sanitized error fields to stories. No tables, accounts, bucket changes or provider calls are introduced.

Functions:
- anansi_private.m4_write_segments: internal validator/transactional segment replacement; only owner/server capability executes it.
- m4_save_transcript: intentional SECURITY DEFINER capability with empty search_path and auth.uid()/ownership/state/revision guards. Authenticated users may save only their own unpublished original; no direct table write grants added. Caller timings are ignored and recalculated.
- m4_claim_transcription / m4_finish_transcription: service-role-only SECURITY INVOKER capabilities. Server verifies user identity/ownership first; database repeats actor/state/claim checks. Five-minute claims, explicit recovery, stale completion rejected.
- m4_publish: service-role-only transactional capability, repeats owner/state/revision checks, creates one pending English story/tasks and freezes original together. No translation provider invoked.
- Story SELECT policy additionally lets the author inspect their own pending English metadata. Other users see only published originals/ready translations. Task writes/read denial stays intact.

Owner reports successful application. Read-only checks confirmed all five columns/constraints, empty function search paths, expected execute ACLs, private helper denial, enabled RLS and denied direct user writes. The actual integration rerun passes all16 cases. SQL Editor application does not populate CLI migration history; do not db push blindly.

## Current operation

Open an owned saved audio draft. Start transcription explicitly only after confirming permission to send to the displayed provider, or paste/type text and choose Use pasted transcript. Enter title, correct segments, put cursor within a segment to Split, or Merge with next. Save explicitly; unsaved app-link/full-reload navigation warns before discarding. Timings update as estimates after text/structure edits. Saved revision conflicts preserve unsaved input and require reload after copying text.

Publication requires saved nonempty content and no unsaved edits. It freezes original transcript/audio and prepares the pending English record/tasks. Generation is outside M4; no translation appears yet. Signed-in account B can open a published original by its direct URL but cannot edit it; drafts stay private.

Transcription state survives refresh, which never restarts providers. Active claims reject duplicates. After an interrupted request, wait until the five-minute claim expires and choose Retry explicitly; manual save after expiry invalidates old completion. Persistence failure does not repeat provider work. A crash after provider success before persistence may still require a paid retry; no exactly-once billing claim.

The current OpenAI adapter returns text JSON without timestamps. Timings therefore display approximate; no model switch or invented alignment. Optional validated provider timings are supported by the domain contract. Mocks are synthetic and visibly labelled.

## Test commands and live boundary

Run npm run test:unit, npm run test:integration, npm run test:e2e, npm run lint and npm run build. Integration/browser suites fail on unapplied M4 SQL rather than passing a skip. Playwright-managed servers force transcription/translation mock; the M4 browser test checks that label before mutation. Do not reuse a live-configured manual server for M4 automated tests.

Owner approved at most two live ASR requests using only cleared Phrase1/2 under the existing USD500 allowance. Both succeeded: 1706ms and1536ms, no retries. Ignored local report: data/benchmark-results/m4-asr-live-check.json. The opt-in verify:m4:live script reserves USD1 per call in the existing local ledger before network and refuses a second run if the report exists. Two USD1 reservations are not measured bills; they do not limit independent app/account usage. Do not rerun/delete the report/ledger to bypass approval. No phone recordings were submitted by Codex.

## Required human acceptance (after automated checks pass)

1. Sign in as A on desktop, upload a cleared sample, explicitly transcribe, correct its text/title.
2. Split at a cursor and merge with next; Save, refresh and verify text/title/order persist and timings are labelled approximate.
3. On another draft, use typed/pasted isiXhosa text without successful AI. Save and refresh.
4. Publish each; confirm original audio still plays unchanged, transcript is read-only, and translation is honestly pending M5.
5. As B in another browser session, open published original URL; read/play it, with no edit controls. A's unpublished draft URL must remain inaccessible.
6. On Huawei/Oppo, repeat editor/save/publish. Confirm typing persists and no runtime/hydration errors occur. For a captured data-gr-* body warning, disable Grammarly/site DOM modification and report any different diff.

Record actual observations and failures, without passwords or private playback links. Until owner-applied SQL and real desktop/phone checks pass, M4 is awaiting verification and must not be committed/pushed. Do not begin M5.

## Advisor review

The advisor flags authenticated execution of SECURITY DEFINER m4_save_transcript. This is intentional: it is the narrowly guarded save capability described above, with explicit auth.uid/ownership/state/revision validation, empty search_path and no direct table grants. Real user tests prove cross-user/anonymous rejection and immutable published content. Do not silence the warning by enabling broad table writes. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable . The pre-existing leaked-password-protection warning remains: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Task RLS-without-policy INFO is intentional default denial.

M4 follow-up: HTTP/LAN segment creation now uses crypto.getRandomValues-based UUIDs; segment fields have explicit accessible names. Expiry fixtures use an unambiguously past date. Network-backed browser assertions have a30s bound; application claim expiry remains5min. Unit94 and integration16 pass; dedicated M4 browser workflows both pass. Full runs and focused retries are recorded separately in MILESTONES.

Latest checkpoint 2026-11-10T20:30:15+02:00: schema/ACLs verified; unit94, integration16 and both dedicated M4 browser cases pass. All8 browser cases have passing evidence across combined/focused runs; interrupted failed attempts retained in MILESTONES. Final lint/build pass. Manual acceptance remains required; no M4 commit or M5.

## Current manual feedback / focused retest

Owner passed1–4;5 failed (B editing reported in a separate browser);6 partial (editor passes, profile/new-story navigation stuck Rendering). M4 is not accepted. New focused tests deny B's actual save and preserve A's text. Root cause of the exact reported persistence is unconfirmed pending story URL; do not claim shared tabs caused it.

After the updated server is ready, close old app tabs. Use distinct A/B credentials in separate browsers and verify different Signed in as labels on profile/story pages. Published originals must contain no title/segment edit fields or Save/Publish buttons for either account. In B, open A's exact published story URL and refresh; read/play is allowed, editing is not. An unpublished A draft must return404 to B. Submit any observed persistence failure with the plain story URL and action/refresh result, no passwords/tokens.

On each phone, open a story -> Your profile and stories -> its story link -> Record another story -> Your profile and drafts. Each must finish with the expected heading. Repeat after refresh and sign-in. These protected links request fresh documents. Open draft editors close if their session/access changes; Reload then reauthorizes. M4 stays uncommitted; no M5.

Owner acceptance 2026-11-10T23:10:31+02:00:5/6 now pass;1–4 retained. M4 manual gate passed; publish after repeated checks. M5 only subsequently authorized, no M6.

M4 publication gate 2026-11-10T23:22:26+02:00: unit96/96 exit0 (6.99s); integration16/16 exit0 (48.81s); isolated mock browser9/9 exit0 (4.3m); lint/build exit0 (compile4.7s/TypeScript13.6s); dependency/whitespace exit0. Initial browser run used a live-configured manual server and safely failed its mock-provider guards (7 pass/2 fail, zero provider calls); corrected managed-server rerun passed all9. Owner manual acceptance complete. Read-only RPC ACLs reverified.

Publication record: fb985ff5a9e40bb3d4126e1ed334a4f350867cf5 committed and pushed after repeated checks and owner acceptance; remote matched before any M5 implementation. Subsequent M5 status lives in MILESTONES/M5_VERIFICATION.
