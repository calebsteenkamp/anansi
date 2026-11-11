# Architecture blueprint

Approved design, 2026-11-09. M1 provider adapters and M2 auth/profile foundation are accepted/published. M3 capture/drafts and M4 transcript/publication are accepted and published. M5 translation/recovery is accepted/published. M6 reading/listening is implemented pending verification and manual acceptance; M7 onward remains planned. See [scope](PRODUCT_SCOPE.md), [plan](../PLANS.md), and [actual status](MILESTONES.md).

## Boundaries and services

- Existing root app/ contains App Router pages/layouts and Tailwind. Server-rendered reads; client components for microphone, editing, playback, interactive forms. Shared logic/adapters live under planned lib/; tests under tests/.
- Next.js route handlers expose typed mutations. Validate identity, input, ownership, eligibility, and state at every server entrypoint, regardless of UI controls.
- Supabase provides email/password Auth, Postgres, private audio Storage. Owner reviews/applies SQL migrations. Ordinary database operations use caller sessions and RLS.
- @supabase/ssr browser/server clients and Proxy refresh cookies using verified identity, following current Supabase guidance. Session-dependent UI renders at request time under Suspense with Cache Components. No shared caching of session-bearing responses.
- Provider adapters are server-only; browser speech synthesis is separate. Only narrow guarded server operations can persist provider results. Never expose service-role keys or allow client-forged provenance/status.
- Local Next.js demonstration is default. No queue service, Python backend, deployment, or model training is introduced by this blueprint.

## Domain records and invariants

| Record | Minimum fields / constraints |
| --- | --- |
| profiles | Auth user ID, display_name, bio, preferred_language, spoken_languages. User updates own profile; allowed language values only. |
| stories | ID, author_id, language, kind, parent_story_id, title, audio_path, audio_duration_ms, status, provider/model provenance, created_at. Original has no parent; English translation references isiXhosa original and preserves attribution. Unique parent/language translation. |
| segments | Stable ID, story_id, position, text, start_ms/end_ms, timing source, optional source_segment_id for aligned translations. Unique story/position; valid bounded timings and parent alignment. |
| reviews | ID, translation_story_id, reviewer_id, decision, integer rating 1-5, intent_comment, created_at/updated_at. Unique reviewer/translation; translation target only. |
| review_edits | review_id, segment_id, corrected_text. Unique review/segment; segment belongs to reviewed translation. |
| follows | follower_id, following_id; unique pair, no self-follow. |
| shares | user_id, story_id, created_at; unique pair, published story only. |
| translation_tasks | ID, translation_story_id, source_segment_id, source fingerprint, provider/model identity, state, attempts, claim expiry/token, sanitized error, timestamps. Unique translation/source segment. |

Database constraints enforce keys/uniqueness/rating bounds/relationships rather than relying on UI. Immutable published originals avoid unversioned cache invalidation. Corrections remain separate; default view is original AI output. Task source fingerprint includes text, language pair, provider/model configuration; changing it does not silently retranslate published content.

## Access model

- Anonymous: no story/profile/audio access beyond login/static app shell.
- Signed-in: read published stories, their segments/reviews/corrections and necessary profiles. Author alone reads/changes own draft and associated draft audio/segments.
- Uploads: private user-ID-prefixed paths, consent and duration/type validation before draft finalization. Signed playback authorization mirrors story visibility.
- Reviews: server and database check current profile for both languages; only reviewer updates own review/edits. Language declarations are ordinary profile data, never trusted JWT user_metadata authorization.
- Follows/shares: mutate own rows only. Ignore client-supplied actor IDs.
- Translation state/provenance/results: client direct writes denied; server verifies original ownership/state before narrow privileged persistence.
- RLS on all exposed tables; explicit grants and Storage policies. UPDATE needs matching visibility and ownership WITH CHECK. Privileged SQL must be minimized, constrained, and not a general public bypass.
- Cross-user writes, ownership reassignment, forged statuses, and foreign review segment IDs are tested with real user clients in T2-T7.

## Proposed interfaces

M3 POST /api/stories/drafts and GET /api/stories/{id}/audio are implemented. The separate upload-finalize boundary is superseded by D22: validation/upload/finalization happen in one bounded POST. Other story mutations below remain **planned**. Auth sign-up/in/out uses Supabase Auth through validated UI/server boundaries. Use a consistent typed result: success data or sanitized error code/message with retryability. Distinguish invalid input (400), unauthenticated (401), forbidden (403), missing/inaccessible resource (404), state conflict (409), provider failure (502), and timeout (504). Never return raw secrets/provider payloads.

| Mutation boundary | Input / effect |
| --- | --- |
| POST /api/stories/drafts | Implemented M3: multipart audio + explicit consent; verified identity/origin, actual-byte validation, unchanged upload and draft finalization. No caller-supplied actor/path/status. |
| GET /api/stories/{id}/audio | Implemented M3: current user/RLS-authorized 300-second signed playback link; no provider calls. |
| POST /api/stories/{id}/transcribe | Owner draft; claim state, call configured adapter, persist transcript/timings/error. |
| PUT /api/stories/{id}/transcript | Title and ordered edited segments; author-only draft update. |
| POST /api/stories/{id}/publish | Validate and atomically freeze original, create/retrieve translation plus pending tasks. M4 prepares state; M5 wires provider processing. |
| GET /api/stories/{id}/translation | Persisted visible English/progress only; no provider work. |
| POST /api/stories/{id}/translation | Implemented M5: action continue/retry, consent and expectedProvider permission guard; owner-only claim/process/persist one segment. Retry resets unfinished failures/expired claims first. |
| PUT /api/translations/{id}/review | Decision, rating, intent, corrected segment IDs/text; atomic upsert of caller's review/corrections. |
| PUT/DELETE /api/profiles/{id}/follow | Caller follows/unfollows target, idempotent relationship. |
| PUT/DELETE /api/stories/{id}/share | Caller reposts/removes own repost, published target only. |

GETs/pages read persisted status/content only. Profile edits use validated authenticated server action. Story reads include preferred-language presentation; no provider side effects.

## Provider contracts and processing

Transcription adapter: transcribe(audio, language) -> text, optional normalized timings, provider/model provenance.
Translation adapter: translate(text, sourceLanguage, targetLanguage) -> translated text, provenance.
Mocks implement both contracts with explicit mock flags. Typed provider errors distinguish unsupported input, credentials, quota, timeout, malformed/empty results.

After publish, the author UI automatically starts sequential processing POSTs. Progress survives reload in tasks; interrupted work requires explicit Continue/Retry, never automatic paid GET processing. Each task is atomically claimed with a token/expiry. Persist results only for the current claim; active duplicates return existing progress/conflict. A stale worker must not overwrite a newer result. Completed tasks are reused. Initial implementation uses bounded requests rather than an unconfigured background job service.

A crash after provider success but before persistence can cause another paid call on recovery. Claims prevent normal concurrency duplication; they cannot establish exactly-once provider billing.

## States and recovery

Original: draft -> transcribing -> transcript_ready -> published; transcription_failed permits retry/manual entry. Draft editing remains author-only; publishing freezes segments/audio.
Translation: pending/translating -> awaiting_verification, or translation_failed with partial results preserved. Review confidence is derived from reviews, not a fabricated processing state.
Task: pending -> processing -> complete/failed; expired processing claims require explicit recovery.

Use provider timings if valid; otherwise allocate duration proportionally by text length, ordered and bounded, and mark approximate. Splitting/merging invalidates affected alignment; recompute valid estimates if exact timings cannot be maintained.

No silent fallback to a different paid provider. M1 selects configured providers after evidence; manual transcript and clearly labelled mock mode remain explicit alternatives. Unsupported browser speech hides/disables device narration while retaining text/original audio.

## Provisional decisions and references

Provider/model, formats/timing support, conversion need, live spend, and target test project remain [open](OPEN_QUESTIONS.md). [DECISIONS](DECISIONS.md) tracks authority and sources. Current references: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security/), [OpenAI transcription](https://developers.openai.com/api/docs/guides/speech-to-text), [Vulavula STT](https://docs.lelapa.ai/transcribe/sync) and [translation](https://docs.lelapa.ai/translate/translate). Read installed Next.js guides before implementing.

## M1 default and bounded comparison update (2026-11-10)

OpenAI is the configured default; translation snapshot gpt-5.4-mini-2026-03-17. Adapters keep explicit mock/Vulavula selection and <=4096 OpenAI output tokens. Paid benchmark compares only corrected text. Its exclusive lock, atomic pre-call conservative reservations, per-run limits, and cumulative local ledger are specified in README/D16. Any failed outcome makes CLI exit nonzero after saving results. These runner controls do not constitute global application billing enforcement. No story routes or database processing implemented yet.

## M2 implementation status

Auth/profile pages, server actions and Supabase clients/Proxy are implemented; authenticated account reads stream under Suspense, profile writes use verified user identity and RLS, and refreshed responses are private/no-store. Migration 20261110105042_m2_foundation.sql creates all eight domain tables/private bucket but remains owner-applied. Ordinary write grants are restricted to profile fields; later workflow writes/uploads are denied. M3 UI is described below. See M2_VERIFICATION for historical setup and test gates.

## M3 implementation (D22)

Capture is one bounded same-origin authenticated multipart POST. It checks verified claims and explicit consent before reading media. Streaming body cap is 25,000,000 bytes +65,536 multipart overhead; the actual file cap is 25,000,000 bytes. Server-side Mediabunny inspects only in-memory allowed containers, one audio track/no video, recognized codec, nonempty packets and their end timestamps; <=180s before millisecond rounding. It does not decode, convert or call providers. Browser file name/MIME/duration/actor/status are untrusted and ignored for persistence.

Only after validation, server-only draftStore uses a privileged capability to upload unchanged bytes with upsert:false to {verified-user}/{generated-draft}/original.{detected-extension}, then inserts original/xh/draft with server consent time, detected type/size/duration. No arbitrary actor/path from browser. M3 SQL adds metadata/constraint and private-bucket limits, retaining all ordinary write denials. Upload/finalization failure removes the attempted object; if insertion response is lost, confirm matching finalized row before cleanup. Uncertain reconciliation or cleanup produces an actionable draft ID. A process crash can still leave an orphan between systems; see M3_VERIFICATION recovery. No distributed transaction or exactly-once save claim.

Private GET playback uses only caller-session RLS, not service-role. Links are bearer capabilities valid 300 seconds; sign-out prevents new links but cannot revoke existing ones. Request-time pages stream under Suspense and Proxy marks account/story/API responses private/no-store. Capture releases microphone tracks/timers and preview URLs on unmount; only event handlers inspect browser APIs, avoiding server/client initial-render divergence.

References: [Mediabunny reading/media packets](https://mediabunny.dev/guide/reading-media-files), [Supabase private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Storage access controls](https://supabase.com/docs/guides/storage/security/access-control). These establish API behavior; actual support is bounded by tests/manual device evidence.

## Auth transport repair during M3

Sign-in/up moved from action Flight responses to same-origin JSON POST /api/auth/[mode]. Verified mode, <=16KiB actual body, validated credentials, Supabase SSR cookie writes, private/no-store and sanitized errors. The controlled form preserves entries through failures and enables only after hydration; success performs a fresh same-origin document navigation to clear private client caches. Sign-out/profile remain validated actions. ANANSI_DEV_HOSTS supplies exact additional development resource hosts; it does not widen action CSRF or capture origin checks.

## M4 implementation (accepted)

GET transcript reads caller-RLS snapshots only. PUT transcript is a bounded same-origin request using verified Auth user plus caller-session m4_save_transcript. Intentional SECURITY DEFINER SQL is narrowly guarded by auth.uid/owner/state/revision, with empty search_path, private segment helper and explicit ACLs; direct table writes remain denied. Caller timings are recomputed server/database-side.

Transcription POST verifies identity/ownership/consent and uses service-role-only claim/finish capabilities with explicit actor. Claims expire after5min; adapter timeout160s; no auto-retry or processing GET. Completed transcripts bypass providers; persistence errors preserve recovery state. Only current unexpired claim can finalize. Manual save after expiry invalidates stale completion. Original provider/model and manual/provider/provider-edited origin are distinct.

Publish POST supplies provider/model from server config, not browser input, and invokes server-only transaction with repeated owner/revision guards. Story lock + unique parent/language + task uniqueness make repeated/concurrent publish idempotent. Freeze original/create linked English/tasks commit together; SHA256 fingerprint covers segment ID/text/language pair/provider/model. Pending English metadata is author-readable; ordinary task access stays denied. M4 originally deferred translation execution; the M5 boundary below now implements it pending verification.

Server pages remain uncached/authenticated under Suspense. Editor owns its title/status/audio view so save/publish is immediately reflected; controlled hydration-ready fields, explicit Save, split/merge IDs and unsaved-navigation warnings. Current ASR JSON supplies no timestamps; pure timing contract supports validated optional provider timings but defaults to proportional estimates. Reference: https://developers.openai.com/api/docs/guides/speech-to-text .

M4 access/navigation hardening (D28): protected page identity uses verified getUser, with a current-account label. Published pages are non-editable views for every account. Draft editor access is revalidated on mount/focus/visibility/pageshow, with backend authorization independently enforced on every mutation. Native protected navigation deliberately avoids reusing a cached RSC transition/session view. No database grants changed.

## M5 implementation, applied SQL / acceptance pending

GET translation verifies the current user and reads the original/English via caller RLS. Only after owner identity matches does a narrow server read aggregate task counts; tokens, fingerprints, attempts and raw provider errors never enter the browser. Other users see completed English only. UI credits the linked original/storyteller and labels AI versus synthetic mock provenance.

POST translation is bounded same-origin JSON, verified getUser, original author/published-state validation and explicit text permission. Continue claims one pending segment; Retry first resets failed/expired tasks. m5_claim_translation/finish_translation/retry_translation are SECURITY INVOKER with empty search_path and service-role-only EXECUTE. Each repeats actor/parent/status checks. Parent row locking prevents concurrent active work across a translation. Claim fingerprints bind ID/text/languages/provider/model. Successful result insert, task completion and parent status commit together; unique translated source alignment prevents duplicate segments. Completed text is immutable through these capabilities; no caller-selected provider/model/result/state.

Adapters use the stored provider/model plus current server credentials. A five-minute claim exceeds the160s provider timeout. Every segment saves before the browser initiates another request. Failed/malformed results store only allowlisted codes; no automatic retry. Missing persistence leaves a recoverable claim. Explicit retry after expiry may repeat billing if a remote success was lost. No exactly-once billing guarantee or global app spending ledger is claimed. Source fingerprints fail closed if privileged out-of-band changes occur.

Auto-start exists only in client memory after a successful explicit Publish event. Rendering/reloading does not set that flag. Unmount stops subsequent client requests; an in-flight server request may still finish. No shared session cache, background queue, translation GET side effects or M6 playback/speech work is introduced.

Consent additionally binds to the displayed provider: new Publish rejects changed server configuration, and Continue/Retry checks expectedProvider against stored English metadata before claiming. That value is a permission guard, not a caller-controlled provider selection. Initial recovery may GET saved progress; it never POSTs automatically on reload. The original page identifies its actual storyteller, and translation links explicitly to the original.

## M6 reading/listening boundary (verification pending)

Server Story reads current-user preferred_language and storyteller identity via the existing session client, alongside signed audio and caller-visible English. TranslationView now exposes saved source-segment IDs/timings, protected by the same RLS; no task tokens, secrets or new grants. StoryReader is an interactive client boundary beneath request-time Suspense. M5 panel keeps workflow state and notifies the reader when saved English changes; rendering itself remains read-only.

Aligned rows use source identity, with ambiguous/missing mappings refused. Original intervals are inclusive-start/exclusive-end; gaps/end have no active segment. Native audio events update the playhead; segment buttons seek without implicit autoplay. Document-scoped playback ownership cancels the previous audio/voice before another starts. Audio refs/URLs/listeners are released on unmount/pagehide; URL renewal stays an authorized read.

Optional DeviceNarrator wraps Web Speech through an injectable engine. It filters English voices with localService=true, loads asynchronous voiceschanged updates, chunks long text into<=240 code points, speaks one chunk at a time and highlights its source segment. Generation guards ignore stale callbacks after cancel/restart. Voice/language changes, competing original playback, Stop and navigation cancel the queue. Unsupported APIs, missing local voice or engine failure retain text/original audio; no paid/remote fallback. No cross-tab audio arbitration or precise translated-word timing is claimed.

Primary API references: [media currentTime](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime), [voice inventory](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService), [speech cancellation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel). These document browser contracts; device behavior still requires manual checks.

## M7 review boundary (owner SQL/verification pending)

Current-user RLS reads expose completed translation reviews/edits and public display names; verified user identity supplies own-review/eligibility metadata. No admin client participates in ordinary review writes/reads. The sole authenticated SECURITY DEFINER capability m7_save_review has empty search_path, auth.uid/current-profile eligibility, completed-translation/published-parent and foreign-segment guards. It upserts only the caller's review and replaces only associated edits transactionally. Direct review/edit writes remain denied. Profile share locking serializes eligibility checks with profile changes. SQL never updates source or AI segments.

Confidence and latest-correction selection are derived from persisted reviews; status remains awaiting_verification at the workflow level. Overlay state is client presentation only, resets to AI on reload, and is passed to the existing aligned reader/local narrator. Version switching cancels narration. Self-reviews carry Storyteller; ratings are not accuracy estimates. Current language removal blocks future saves but does not erase historical reviews. No new paid call, service or schema reset.

## M8 discovery/social boundary (SQL/verification pending)

Verified user SSR and GET /api/discover call user-session m8_feed (SECURITY INVOKER). Caller RLS plus explicit published/completed-parent guards exclude even own drafts/pending English. Fixed SQL parameters support literal case-insensitive title substring and xh/en/all filters. Following inclusion uses EXISTS over authored/followed-reposted paths; each story ID appears once. Timestamp/UUID order is stable, newest50 matching versions. Public reposter attribution supports follow actions.

POST /api/social validates same-origin bounded JSON, target UUID, explicit Boolean/kind and expected session identity. The authenticated m8_relationship SECURITY DEFINER capability repeats auth.uid and target/state checks and mutates only that user's relationship. No direct user table grants, original/AI changes or provider invocation. Proxy private/no-store covers discovery/social paths and preserves SSR cookie refresh. English card links resolve to original parent with explicit reading-language override; saved preference is untouched.
