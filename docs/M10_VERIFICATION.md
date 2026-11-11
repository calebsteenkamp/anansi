# M10 verification and owner handoffs

M9 published as9fbd552d00f0068afa9b2400b11df87560195b32, remote verified. M10/UI/direct uploads/four-account hosting authorized. Implementation/verification in progress; no M10 completion or deployment claimed.

## Owner SQL application (apply in order)

Target Anansi Supabase project **lizbeiqyrwzkybpentrk**. Review each complete file, then run it once in SQL Editor:

1. `supabase/migrations/20261111164419_m10_intent_examples.sql`: false-by-default review reuse consent, atomic own-review opt-in save, private immutable translation context snapshots, bounded selection of eligible real OpenAI corrections/intent, metadata-only context reads. Existing translations are backfilled with baseline context; originals/results unchanged.
2. `supabase/migrations/20261111164424_hosted_private_uploads.sql`: private staging bucket, private reservations with two-hour expiry/two active reservations per user, guarded server-only claim/finalize/failure capabilities. Finalize atomically creates a validated private draft; no ordinary upload-table writes.
3. `supabase/migrations/20261111164430_demo_membership.sql`: private membership configuration, restrictive database/Storage policies, membership guards on existing privileged capabilities, service-only short-lived tagged test memberships. Membership restriction starts disabled so the owner can finish four-account setup. No accounts or stories are deleted/banned. The owner-only activation function is not a public RPC.

4. `supabase/migrations/20261111170539_hosted_upload_maintenance.sql`: bounded service-only expired-staging enumeration/cleanup markers; no original audio deletion. `npm run cleanup:uploads` is a dry run; `-- --apply` removes only expired private staging objects after the two-hour signed-token lifetime plus ten minutes.

Migration correction history: the owner applied the intent migration. Upload SQL failed on an unparenthesized CASE expression; its transaction rolled back, so membership then failed because audio_uploads did not exist. Corrected the CASE predicate and allowed internal supabase_auth_admin profile bootstrap in the membership trigger. Rerun complete corrected upload and membership files, not the successful first migration. Do not claim either failed file applied.

These migrations introduce narrow SECURITY DEFINER functions where private reads/atomic writes require them; they use empty search_path, explicit grants and actor/ownership checks. Function replacement may trigger SQL Editor's destructive-operation warning even though it does not remove story data. Report any exact SQL error; no automatic reset/rollback/application is authorized.

## Four permanent accounts

A: accounta@example.com /18e02f00-0855-4b78-86a8-ecf0c4e4dd85.
B: accountb@example.com /e7597f44-9cf2-4436-ac49-960759887600.
C: storyteller@example.com /2ecdc03a-7b65-498b-ad94-38b86742d203.
D: verifier@example.com /e8dc3c22-6e54-4c2c-a6c2-67d0829119cb.

These exact four accounts were verified read-only. Owner applied 20261111175548_activate_four_demo_accounts.sql and disabled public signup. Read-only verification confirms restriction=true and exactly those four permanent UUIDs. Auth settings HTTP200 confirms disable_signup=true and mailer_autoconfirm=true. No other users were banned/deleted. Tagged test memberships expire after two hours and are removed with their disposable test accounts.

## Other handoffs and limits

- Six new OpenAI requests maximum across local Edge and hosted smoke checks, provided Phrase1/2 only, no automatic retries; include each segment call. Ordinary suites remain mocked. No live requests have been made for M10 yet.
- Owner applies SQL; agent verifies schema/permissions read-only and runs actual unit/integration/browser/lint/build/fresh-setup checks.
- Vercel project will use the existing connected team, Node26.x and the verified Git commit. Secrets entered securely, no Google/Vulavula key transfer. No paid upgrade/custom domain.
- Browser/Edge visual/functional checks and hosted verification remain pending. Autofill is permitted; saved passwords are never extracted. Owner sign-in handoff may be needed on the new domain.
- No M10 commit/push until required SQL/account setup and local verification pass. No hosting completion until actual ready deployment, Edge smoke and promotion are confirmed.

## Current implementation evidence

M10 unit iteration1 exposed old auth/upload mocks:156 passed,4 failed and one import suite failed. Updated mocks/contracts to exercise membership and staged finalization. Next iterations174 then180 unit tests pass; lint passes. Production build compiled11.3s, TypeScript26.7s,14 pages, exit0. These are intermediate checks, not the final release gate.

Compatible `npm audit fix --ignore-scripts` changed12 packages but exited1 with7 moderate minimatch/TypeScript-ESLint findings still reported; no force/major framework upgrade. Final dependency consistency and audit will be recorded after verification.

Owner reports inability to create accounts and a hydration diff containing root attributes data-qb-installed/suppresshydrationwarning absent from repository source. That diff suggests browser-extension injection, not proof of an app hydration bug. Independently, missing membership SQL blocks account setup; do not attribute that block to the warning. Clean Browser and native Edge verification remain required.

Local pglast8.7 SQL/PLpgSQL parsing of all four migration files succeeded after the CASE-expression correction. The parser is isolated in ignored data/verification, not an application dependency/backend.

## Verified migration state / final cleanup guard

Read-only inspection confirmed the intent/upload/membership/maintenance objects exist, staging is private, and capability ACLs match intended roles. The maintenance migration was applied before a later stale-worker guard was added; its separate function-only `20261111172411_stale_upload_cleanup_guard.sql` correction is now verified applied. It raises stale_claim when a failed worker no longer owns a live claim, preventing it from cleaning a newer upload attempt. Four-account activation is also verified; do not rerun earlier successful migrations.

## Intermediate verified checks (2026-11-11)

- 19:22:44+02:00:9 integration files/34 tests passed in215.50s, exit0. Explicitly excluded demo-access.test.ts because four-account activation is pending; that gate is NOT passed. Final full suite must include it and the later stale-cleanup assertion.
- Unit suite now184 tests pass; lint passes. Earlier build passed (compile4.2s/TypeScript10.5s). Later build failed with Windows EPERM during generated-output cleanup while dev was running. Final build must run separately; this is not a product test pass.
- Clean Browser at localhost/sign-up: Create account enabled after corrected SQL, visible email remained while typing password, no captured hydration errors, root extension attributes absent. Browser read-only input values are privacy-redacted, so visual observation—not a redacted value comparison—establishes input persistence. No account was created by this inspection.
- Vercel project created without Git connection/deployment:prj_svYmOXQs8Lof2sOYfyxRNdRzBXX8, team_a8sQvu6vpJMua47ZQNGO2P1Q, Node26.x, live=false. Owner reports production variables saved; eight required variable names/types were verified without retrieving values. GitHub integration returned Bad credentials; owner approved CLI source deployment instead (D40).
- Read-only SQL confirms private staging and expected role grants. m10_demo_mode is the only anonymous callable M10 capability and reveals only a Boolean. Function-only stale cleanup patch is verified applied: stored function contains stale_claim. Four-account activation and closed signup remain separate gates.

## Recorder regression investigation

The full browser run failed its real MediaRecorder case: a zero-byte recording was announced as ready. Stop previously released tracks before the queued final data event and overwrote empty-file errors with success. Normal stop now waits for the final data/stop sequence; cancellation/error releases resources, and empty output reports actionable failure. Four lifecycle unit cases cover final-data ordering, empty output, cancellation and errors. At20:00:37+02:00 unit188/188 and lint passed, exit0. Targeted real-recorder browser retest passed (1 test,1.1m), including malformed/over-limit rejection. Final full browser rerun:19/19 passed,10.4m, exit0.

## Final local automated evidence (2026-11-11, +02:00)

- Full integration started20:06:08:10 files/35 tests passed,189.71s, exit0, including active four-account denial, stale cleanup guard, immutable example context and direct5.7MB upload.
- Full browser suite:19/19 passed,10.4m, exit0. Providers mocked throughout; restricted signup,5.7MB direct upload, real recording, two-user journeys/recovery, review consent, LAN/mobile, playback and stale-account regressions passed.
- Production build passed after correcting a test-only ErrorEvent type:compile5.2s, TypeScript12.8s,14 pages, exit0. Earlier test-type build failed and is not counted as a pass.
- Fresh credential-free snapshot fresh-2026-11-11T18-02-30-206Z: npm ci427 packages,188 unit tests, lint and build all exit0; build compile77s/TypeScript32.5s. The corrected test fixture was copied before its checks. Nested lockfile inference warning is expected for this isolated snapshot.
- npm ls --depth=0 exits0. Known configured private-key value scan across198 source/client files found0 matches; no secret values printed. Whitespace check passed.
- CLI dry deployment:179 files/1,019,677 bytes; .env.local/.env.example/.git/.next/data/node_modules/Supabase CLI cache/test-results excluded. This command uploaded nothing and created no deployment.
- Local production server runs on http://localhost:3001 for Edge; full mocked browser suite manages port3000 separately. Owner signed in A; Edge shows the correct profile and capture form. Three local live request slots are reserved, three remain unreserved; actual M10 live provider calls=0. Do not reset these reservations or automatically retry calls.

## Edge verification stopped / remaining exact checks

At20:15+02:00, extension file selection failed because Edge's extension lacks file-URL access. The native-picker fallback was then stopped by Computer Use because it could not confidently determine the active browser URL. Do not bypass this safety stop. No M10 commit/push/deployment has occurred. The capture page and account A are verified, but production upload/transcription/translation/review checks remain incomplete.

1. In the existing Edge production tab at http://localhost:3001/stories/new, upload only data/Phrase 1/Phrase 1.mp3, preview it, confirm the previously granted audio permission and save the private draft. Report its plain /stories/UUID URL; do not send a signed playback URL or password. Do not start transcription yet if agent verification is paused.
2. Resume production Edge verification: one explicit Phrase1 transcription, correct the title/source to the supplied two sentences, save exactly two segments, then publish. The three reserved local slots cover one ASR plus two translation requests; no automatic retry or extra segment calls. Verify playback, refresh/reuse and unchanged audio.
3. Using the supplied English/Intent reference as labelled technical test data, save an opted-in approving review/correction; verify false default, persistence, opt-out and existing frozen history. This is workflow evidence, not a new bilingual accuracy measurement. Verify B's read-only published access and draft/edit isolation.
4. After the local gate passes, commit/push M10 normally and deploy that verified source through CLI as approved. Stage production without domain, verify in Edge with at most the three remaining live slots, configure production Supabase URLs while retaining localhost, and promote the same tested deployment.

Rechecked npm audit:7 moderate tooling findings (@typescript-eslint packages/minimatch/typescript-eslint),0 high/critical; exit1. Compatible fixes already applied; no forced framework upgrade. Upload cleanup dry run reports0 expired candidates. Known-source manifest contains179 files and0 excluded-input violations; no source upload/deployment was performed.

Final housekeeping: two exact tagged test accounts from the interrupted earlier run were identified by UUID and creation time and removed through scoped Auth administration (no audio objects attached). Permanent memberships were unchanged. Windows whitespace verification with the actual system Git core.autocrlf=true exits0; a sandbox-only check that could not read that configuration reported CRLF lines as whitespace, not a source-code regression. M9 HEAD/origin both remain9fbd552d00f0068afa9b2400b11df87560195b32.

Next.js feedback reporting instructions were read once. One anonymized build-cleanup workaround candidate was retained; its optional review URL is provided to the owner without submission. Opening a review form is unavailable in this turn after Computer Use stopped; do not bypass that restriction. No report was sent.

## Resumed local Edge verification (2026-11-11, +02:00)

Owner saved draft720e9565-5c66-4f2e-bb66-7a4959afa785; local Edge control resumed. Its104489 audio bytes match provided Phrase1 exactly. The saved draft already contained OpenAI/gpt-transcribe provenance; the owner reports only saving the transcript, with no additional provider attempts reported. Conservatively charge one local slot for this stored transcription; do not claim the agent made a new ASR request or measured transcription quality here.

Corrected the source against the supplied reference, saved exactly two segments at revision3 and verified persistence after reload. Real Edge audio reached readyState4 with advancing currentTime and no media error. Publication froze the original and produced one linked translationedd2569a-0918-4979-ac34-f2a00f4197b3. Two task attempts completed, one per segment, OpenAI/gpt-5.4-mini-2026-03-17, no retry. Baseline context has0 examples.

The review reuse checkbox initially defaulted false. Saved supplied English/Intent reference as labelled technical verification data (approve/rating3, not new human accuracy evidence), opted in and verified persistence after reload. Saved opt-out; read-only SQL confirms reuse=false and the frozen baseline unchanged. Restored opt-in for the hosted example-context check. Original/AI text remain intact. Read-only refresh did not initiate translation work; verify final task attempts remain2.

Live-slot accounting:3 local slots reserved;2 known new translation requests and1 conservatively charged stored-transcription slot. Three slots remain available for hosted verification. No automatic retries or other samples authorized. Local B published/private isolation handoff is pending before commit; deployment remains pending.

At20:37:29+02:00 local Edge gate passed. Owner supplied private draft46ff232a-27ae-4501-a586-8c1bba9c5a6f and signed B in. Edge shows accountb@example.com/Listener, private URL returns404; read-only SQL confirms it is A's actual draft, with0 segments/no provider. B opens the published sample with English preference and0 title fields/0 publishing buttons. B's ineligible profile cannot submit a review or change A's consent. Translation attempts remain2 after reload/read-only refresh; consent restored true. No M10 source changes after the passed automated suites, only evidence/documentation updates. Required local checks passed; authorize the already-requested normal commit/push and staged CLI release, with hosted verification still required before promotion.
