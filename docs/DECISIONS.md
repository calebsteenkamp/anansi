# Decision log

Owner-approved blueprint recorded 2026-11-09. Approval of a design does not imply implementation. Preserve history with superseding IDs, actual evidence, and dates.

| ID | Status / date | Decision and rationale | Consequences / evidence |
| --- | --- | --- | --- |
| D01 | Approved / 2026-11-09 | Existing Next.js App Router/TypeScript/Tailwind/npm/root app; no Python backend. | Supersedes historical CSS-modules draft; no src/app migration. |
| D02 | Approved / 2026-11-09 | Supabase Auth/Postgres/private Storage, RLS, user sessions; narrow server provider-result writes. Preserve Cache Components with request-time/Suspense auth. | No browser secrets or shared session caching; T2/T3 prove real restrictions. |
| D03 | Approved / 2026-11-09 | Owner reviews/applies prepared SQL migrations. | No automatic remote migration/reset. Dedicated test users, uniquely tagged fixtures. Q4 selects target. |
| D04 | Approved / 2026-11-09 | Confirm each milestone; documentation step authorizes no M1-M9 code. M10 deferred. | Passing Tn authorizes review, not next implementation. |
| D05 | Providers provisional / 2026-11-09 | Separate typed speech/translation adapters, deterministic mocks, evidence-led M1 selection. | Vulavula sync docs omit Xhosa; translation lists xho_Latn. OpenAI model/parameters/timings require current verification. Q1/Q2/Q5 unresolved. |
| D06 | Approved / 2026-11-09 | Consent, original preservation, AI/mock/device labels, honest single-tester evidence. | No accuracy/training/legal claims. Permission/spend unresolved Q3. |
| D07 | Approved / 2026-11-09 | Exact M0 commit after T0; second docs commit records first hash/time. | No push/amend/reset. Failed required check or commit halts before further Git actions. |
| D08 | Approved / 2026-11-09 | Hourly read-only reminder in this chat until 11 November 23:59 SAST. | Update matching automation rather than duplicate. Actual scheduling requires tool confirmation. No implementation/paid calls/migrations/commits. |
| D09 | Approved / 2026-11-09 | Freeze original on publish; one linked English translation; durable segment task claims/results. | No paid GETs, retries only unfinished work. Crash after response before persistence may cause duplicate billing; not exactly-once usage. |
| D10 | Approved / 2026-11-09 | One updatable bilingual review, separate corrections/AI text; latest corrected set by review update time and ID tie-break. | Scope defines confidence precedence; self-review labelled Storyteller. |
| D11 | Approved / 2026-11-09 | Vitest M1; real Supabase integration and Playwright M2; manual device/audio/linguistic checks. | No tests/dependencies in docs step. Missing prerequisites blocked/not run; async server pages tested via browser. |
| D12 | Approved / 2026-11-09 | Local demo first; existing fonts retained absent explicit repair authorization; preserve ignored source materials. | Initial build failed font downloads; network retry passed. No deployment/recording commits. |

## References checked during planning

- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security/).
- [Vulavula transcription](https://docs.lelapa.ai/transcribe/sync), [language support](https://docs.lelapa.ai/overview/language-support), [translation](https://docs.lelapa.ai/translate/translate).
- [OpenAI file transcription](https://developers.openai.com/api/docs/guides/speech-to-text).
- Installed Next.js guides under node_modules/next/dist/docs/, especially authentication-with-cache-components and testing/vitest.

Recheck relevant current documentation before implementation. Append actual M1 benchmark measurements/model choice and later cuts as new dated decisions; do not retroactively invent findings.

## D13 - M1 authorization and benchmark permission (2026-11-09T23:45:03+02:00)

Owner authorized M1 adapters/tests only and subsequently permitted both Phrase recordings/reference text to OpenAI/Lelapa, with USD 500 OpenAI allowance and 100 free Vulavula calls. First spike is at most six requests, no automatic retries; budget note is not monetary enforcement. No top-up, M2, or database work authorized. Local configured translation model davinci-codex is unverified and will not be silently used; first spike uses configured OpenAI speech and documented Vulavula translation. Provider choice still needs results and bilingual review.

## D14 - First live evidence; no provider selection (2026-11-09T23:47:48+02:00)

Report: ignored data/benchmark-results/2026-11-09T21-46-49.571Z.json. Two OpenAI gpt-transcribe requests and four Vulavula translation requests completed; no automatic retries. Phrase 1: 4 word edits / 8 reference words (50%); Phrase 2: 10 / 19 (52.63%). These tiny reference comparisons are descriptive, not an accuracy claim or a judgment about recording quality. Reference-text English outputs were plausible; ASR-text translation for Phrase 2 included 'I hope we will get hurt', unlike reference intent. Human bilingual evaluation and owner selection remain pending. Keep editable transcript/manual fallback; do not select a winner automatically. No word timings or billed-usage metrics collected; reconcile provider dashboard, no top-up performed.

## D15 - Patched compatible test runner (2026-11-09)

Vitest 5 conflicts with current Node-20 type definitions. Vitest 3 passed tests but introduced critical worker advisories. Selected pinned Vitest 4.1.12, which passes all 21 tests and leaves no critical audit findings. Eight moderate existing lint-chain findings remain; no force upgrade/downgrade performed. Native fetch avoids additional provider SDK dependencies; all paid operations explicit, server-only secret entrypoint.

## D16 - Corrected-text comparison and enforced runner limits (2026-11-10)

Owner authorized M1 benchmark error/budget fixes, valid OpenAI model selection, corrected-text provider comparison, OpenAI default; M2 still unauthorized. Select documented gpt-5.4-mini-2026-03-17 (Responses; 400k context, standard input USD0.75/M, output USD4.50/M), with <=4096 output tokens and no tools. Reference: https://developers.openai.com/api/docs/models/gpt-5.4-mini . Older GPT-4.1 mini/GPT-5 mini pages marked deprecated during inspection, so neither selected.

Runner now performs only two corrected-text translations per provider; it does not repeat ASR. Run caps USD2 reserved / two Vulavula calls. Local cumulative caps USD500 reserved / 100 calls; historical baseline USD2 conservative reservation for earlier ASR and four known Vulavula calls, not actual billing. Atomic reservation persistence under exclusive lock precedes each remote request. Failed/uncertain calls remain reserved; invalid ledgers fail closed. No automatic retry. Limits cannot control other apps or prevent owner tampering/deletion; no account-wide billing guarantee. Failed/partial outputs now return exit 1; report-saving success does not mean API success.

Zero-cap CLI run: exit 1, zero reservations, four blocked outcomes. Live run: exit 0, 4/4 succeeded, report data/benchmark-results/corrected-2026-11-10T06-07-33.020Z.json. Two OpenAI and two Vulavula requests; USD2 reserved (not billed). Cumulative ledger USD4 reserved, six Vulavula calls. Both matched reference English exactly for Phrase1; Phrase2 preserved broad reference meaning with phrasing differences, OpenAI 'grow in our work' vs Vulavula 'grow in our activities'. Latencies OpenAI 2792/2954ms, Vulavula 1086/717ms. No accuracy winner or generalization from these two greetings. Bilingual intent review pending; retain OpenAI default by owner preference and budget, Vulavula alternative.

## D17 - M1 accepted, M2 authorized with manual gates (2026-11-10T12:03:52+02:00)

Owner accepted M1 comparison. Retain OpenAI default. Store a future-only GOOGLE_CLOUD_TRANSLATION_API_KEY locally, no Google adapter/calls. Owner enters key; never echo value. Commit/push M1 only after checks; M2 changes stay uncommitted until owner SQL application, demo email configuration and manual acceptance are verified. Do not start M3.

## D18 - M2 foundation and manual gates (2026-11-10T12:58:23+02:00)

M1 accepted/pushed as 545e449. Owner authorized M2 only. Retain existing Anansi project, owner-applied additive SQL, demo-only Confirm email disabled by owner, no M2 commit/push until actual database/browser/human checks pass. Supabase JS 2.119.0/SSR 0.12.7, CLI 3.1.0 and Playwright 1.65.0 pinned. Unit and network suites isolated. Google variable remains absent pending owner local entry; no Google calls or adapter.

Google-key prerequisite refreshed at 2026-11-10T13:01:17+02:00: local variable nonempty, ignored, no key value logged and no Google call. SQL/email gates remain pending.

## D19 - Real M2 verification and request-time auth fix (2026-11-10T13:24:49+02:00)

Owner-applied foundation and demo email setting verified. Real integration/browser tests pass and fixtures removed. Explicit connection() in streamed Account excludes SDK session clock reads from prerender; Cache Components remains enabled. Advisor warning for existing rls_auto_enable() is addressed by owner-reviewed permissions-only follow-up, not removal of automatic RLS. Keep task denial policy intentional. Google Node reference https://docs.cloud.google.com/nodejs/docs/reference/translate/latest retained without adding adapter/API calls. Manual owner acceptance and follow-up ACL verification remain pending; no M2 commit. SQL Editor application does not populate hosted CLI history; reconcile before future db push.

Permissions follow-up verified 2026-11-10T13:26:53+02:00: anon/authenticated execute false; both advisor warnings cleared, intentional task-denial INFO remains. Final browser suite 2/2 passed. Human checklist still pending; no commit/push of M2.

## D20 - Preserve profile state across action reset and auth changes (2026-11-10T13:50:00+02:00)

Manual feedback exposed missing regression coverage. React action-form reset changed preferred-language display after save. Use controlled profile values, return validated profile from server, prevent native form reset, key form by authenticated user, and invalidate the root layout on successful auth transitions. Expanded browser tests compare real stored values and visible fields before refresh and alternate B/A/B in one browser. Clean browser captured no hydration errors; owner confirms hydration and sign-in issues fixed. Do not speculate about extension cause or suppress warnings. M2 repair verified; no M2 publication or M3 action in this step.

## D21 - M2 publication and M3 authorization (2026-11-10T14:04:56+02:00)

Owner authorizes commit/push M2 following passed manual checks, then M3 capture/draft work only. M3 must remain uncommitted until required phone/audio/manual verification passes. No M4 authorization.

## D22 - M3 guarded capture and actual-byte inspection (2026-11-10T16:25:00+02:00)

Owner authorizes M3 only, approves adding the media probe, and names Huawei i14 for manual testing (browser/OS still unknown). Pin Mediabunny 1.65.2; no native binary or conversion. Technical default: combine proposed upload/finalize calls into one bounded authenticated, same-origin POST so ordinary clients cannot bypass duration/consent validation. Retain ordinary story/Storage write denial. Use a narrow server-only service-role capability only after identity/input validation, with generated owner paths, unchanged bytes and explicit failure cleanup/reconciliation. Capture metadata migration remains owner-controlled.

Enforce <=180 seconds against actual encoded packets, not browser duration/container overall-duration claims; 25 MB file cap conservatively bounds local upload/probe memory. Allowed codecs/containers are explicitly limited and codec corruption/audibility remain manual limitations. Recorder auto-stop at ~179s leaves final-packet margin, server accepts exactly180s. Signed playback lasts300s and is transferable until expiry; renew with current session RLS. No direct-upload URLs, conversion, new external service or M4 behavior. Storage/Postgres crash recovery is documented, not promised atomic across systems. M3 stays uncommitted until actual phone/audio gate passes.

## D23 - M3 verification repairs (2026-11-10)

Owner applied M3 SQL; schema/bucket/ordinary write denials verified read-only. Disable capture controls until hydration installs handlers. Browser tests wait for completed sign-out and target timer/feedback separately; queries count only their author fixtures. Real Chromium MediaRecorder exposed zero container durations on Opus packets: derive encoded duration from RFC6716 TOC/frame count instead of rejecting valid packets or trusting client duration. Regression tests cover intrinsic20/60/120ms and invalid counts. Source: https://www.rfc-editor.org/rfc/rfc6716.html#section-3.1 . No conversion/provider calls; phone audibility still manual.

## D24 - Repair phone sign-in and distinguish extension hydration (2026-11-10)

Owner's real Huawei/Oppo checks fail before media upload. Evidence: blocked LAN dev HMR, repeated sign-in GETs, generic unexpected action response, body data-gr-* hydration diff. Configure exact dev host through ignored ANANSI_DEV_HOSTS (safe example blank). Replace sign-in/up Flight transport with small bounded same-origin JSON endpoint and controlled hydration-gated forms; retain credentials on recoverable failures, no browser persistent password storage. Keep sign-out/profile actions, default CSRF and RLS unchanged. Do not claim the generic response's precise cause was proven or globally suppress extension warnings. LAN mobile-sized regression and real owner phone retest are separate evidence.

LAN regression additionally proved internal request.url can be localhost while the actual HTTP Host is the LAN address. Auth and capture use shared same-origin validation against actual Host/protocol, ignoring forwarded-host overrides; foreign origins remain denied. Auth success performs fresh document navigation because JSON cookie changes do not invalidate the private router cache. This is an intentional scoped exception to the relative-location navigation lint preference. Failures preserve fields.

## D25 - M3 accepted and M4 authorized - 2026-11-10T18:55:00+02:00

Both phones now pass actual sign-in/upload/playback. Publish M3 after repeated checks, then implement M4 only. At most two cleared Phrase1/2 OpenAI ASR requests approved under existing USD500 allowance. M4 SQL stays owner-applied; M4 remains uncommitted until required manual verification. No M5.

Later server log captured Failed to find Server Action / HTTP409 from an older page. This supports stale action references as one observed failure path; the accepted JSON sign-in no longer uses that transport.

## D26 - M4 implementation and gated verification - 2026-11-10T19:15:59+02:00

M3 pushed as ade9f2b9a688def6aadca05138ddb88dc3360a31, remote hash matched after all gates. M4 only authorized. Keep gpt-transcribe, text-only JSON, labelled estimates; do not switch to deprecated timing models. Use authenticated guarded save RPC and service-only claim/finish/publish to prevent forged provider/task metadata. SQL remains owner-applied. Pending English creation is M4 preparation; processing is M5. Two approved live calls succeeded1706/1536ms with USD2 conservative reservations, no retry/phone recordings; report ignored/local. Current priceUSD0.0045/min checked against official model page, not billed usage. M4 remains uncommitted awaiting actual SQL/browser/manual gates.

## D27 - M4 applied-schema verification repairs - 2026-11-10T20:01:49+02:00

Owner applied migration; read-only schema, function ACLs, private helper and RLS/grants match. Recovery test now uses an unambiguously past fixture timestamp rather than assuming local/database clocks match. Actual integration16/16 passes. LAN browser exposed unavailable crypto.randomUUID on HTTP; editor creates RFCv4 IDs using crypto.getRandomValues instead. Mock transcription network assertion allows30s for real Supabase round trips. No SQL changes, new paid calls, M4 commit or M5 work.

## D28 - M4 manual access/navigation feedback - 2026-11-10T22:25:46+02:00

Owner reports checks1–4 passed, check5 B editing allowed in a different browser, check6 editing works but protected links remain Rendering. Actual persisted B edit and exact story URL await clarification; do not attribute this report to shared tabs. Existing direct writes remain denied and real integration16/16 passes. Separate-context browser test submits B save and verifies rejection/unchanged published text.

Protected renders now verify getUser each request and show current signed-in email. Published originals use the same plain read-only view for author and other readers. Open draft editors verify current access on mount/focus/visibility/pageshow and close on identity/access change; backend identity/ownership checks remain independent. Shared-tab regression is additional coverage. Native document links for profile/capture/story navigation avoid repeated stalled RSC transitions and obtain fresh session-rendered content; keep Cache Components. Unsaved changes use native beforeunload on those links. No SQL changes or paid calls. Manual retest remains mandatory.

## D29 - M4 accepted, M5 authorized - 2026-11-10T23:10:31+02:00

Owner confirms access/navigation retests5/6 pass. Commit/push M4 after repeated verification; implement M5 only. Owner-applied SQL and required human tests remain gates before M5 commit. No M6.

## D30 — M5 processing boundary (2026-11-10T23:32:25+02:00)

Status: implementation choice within owner-approved M5, verification pending. M4 accepted/published as fb985ff; only M5 authorized. Use one claimed segment per explicit POST, serial parent locking,5min expiry, stored provider/model/fingerprint, completed-result reuse and explicit unfinished-only retry. OpenAI remains default; no new live benchmark. Rationale: durable progress and bounded requests without provider calls from reads. Consequence: leaving the page stops further work; crash-after-provider/before-save can require a paid repeat. M5 SQL stays owner-applied; no M5 commit until actual manual verification passes. M6 remains unauthorized.

## D31 — M5 accepted; M6 authorized (2026-11-11T08:34:02+02:00)

Owner reports all tests pass, authorizes M5 commit/push and M6 only. Record manual acceptance without inventing device/browser versions or accuracy evidence. Repeat required automated gates, publish M5 and verify remote before M6 code. M6 still requires actual desktop/phone listening checks before its commit. M7 remains unauthorized.

## D32 — M6 reader and local narration (2026-11-11T09:28:08+02:00)

Status: technical implementation under owner-approved M6; acceptance pending. M5 published as9872f29. Reuse existing source IDs, profile preference, original audio/timings and RLS; no new SQL or dependencies. Per-page language override does not silently change the saved profile. Original and English share source-segment alignment; estimated timing stays explicitly approximate. Use browser-reported local English voices only, rather than silently sending text to a remote voice. Sequential bounded utterances and a document-scoped playback owner prevent competing playback; cancellation ignores late events. No local voice is a supported fallback condition, not evidence of audible narration. Real desktop/phone checks required before M6 commit; M7 unauthorized.

## D33 — M6 accepted; M7 authorized (2026-11-11T10:07:45+02:00)

Owner confirms all tests pass and authorizes normal M6 commit/push, then M7 only. M7 SQL remains owner-applied and manual verification required before its commit. M8 is unauthorized.

## D34 — M7 guarded review capability (2026-11-11T10:21:10+02:00)

Technical implementation under authorized M7; owner SQL/manual verification pending. Use authenticated narrow SECURITY DEFINER function, with auth.uid/profile/translation/input checks and empty search_path, to save reviews/edits atomically without broad table grants. Preserve AI and original; corrections are version overlays. Recheck current self-declared bilingual eligibility at writes, retain historical reviews after language changes. Technical input bounds5000 intent/500 edits/50000 correction characters; own-review saves last-write-wins. No delete/moderation/ranking features invented. M8 remains unauthorized.

## D35 — M7 accepted; M8 authorized (2026-11-11T11:05:16+02:00)

Owner confirms all tests pass and authorizes normal M7 commit/push then M8 only. M8 SQL remains owner-applied; no M8 commit until required manual verification passes. M9 unauthorized.

## D36 — M8 feed semantics (2026-11-11T11:28:08+02:00)

Technical defaults under authorized M8, owner SQL/manual acceptance pending. Follow/repost use narrow authenticated guarded transaction; feed is invoker/RLS. Original and completed-English language versions are separate cards, deduplicated by story ID across Following paths. Creation-time/UUID ordering is stable; reposts do not bump stories. Bound results to newest50 and literal100-character search; disclose limit instead of inventing pagination/recommendations. Reposter attribution enables following nonauthor repost users. English card opens explicit English view without changing preferences. M9 remains unauthorized.

## D37 — M8 accepted; M9 authorized (2026-11-11T12:30:05+02:00)

Owner reports all tests pass and authorizes M8 publication then M9 only. M9 requires real bilingual observations and two timed rehearsals before commit. M10 stays deferred; no deployment/submission is implicitly authorized.

## D38 — Provided audio only for M9 (2026-11-11)

Owner-approved restriction: use only the provided audio. Phrase1 primary/Phrase2 alternate replace the earlier proposed 20–40second narrative collection. Short samples limit what can be claimed about narrative/cultural quality; they do not waive actual bilingual feedback or two timed rehearsals. M9 agent work adds no live benchmark. Seed English is explicitly synthetic; supplied source reference is not measured ASR output. Technical default: explicit existing demo UUIDs, dry-run then --apply, no account creation or reset. No new SQL/dependency; isolated credential-free source install check. M10 remains deferred.

## D39 — M9 accepted; M10/UI/hosting authorized (2026-11-11T18:41:07+02:00)

Owner reports reviews passed and rehearsals5:00/5:15; expressly permits the slight overrun. Record missing measurements as unreported. Publish M9, then implement M10 opt-in intent examples, warm paper/teal UI, private direct audio upload preserving25MB/180seconds, four permanent demo accounts and Vercel hosting. Six new OpenAI requests total permitted across local/hosted checks using only provided Phrase1/2; ordinary tests remain mocks. Owner creates the additional two accounts and applies reviewed SQL. No paid hosting upgrade or new provider authorized.

## D40 — CLI release while GitHub integration is unavailable (2026-11-11T20:02:10+02:00)

Owner-approved release path: deploy the verified committed source with Vercel CLI; repair automatic GitHub deployment later. Vercel's GitHub connection returned Bad credentials through MCP and CLI, while Vercel account access works. Keep normal Git commit/push verification independently. Inspect the CLI source manifest, exclude local credentials/data/generated artifacts with .vercelignore, stage a production deployment without a domain, test it in Edge, and promote that same artifact. No new credential transfer or paid upgrade is authorized.
