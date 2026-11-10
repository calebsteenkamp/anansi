# Architecture blueprint

Approved design, 2026-11-09. M1 provider adapters and CLI benchmark are now implemented; routes/data/UI below remain planned for M2-M9. See [scope](PRODUCT_SCOPE.md), [plan](../PLANS.md), and [actual status](MILESTONES.md).

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

All routes below are **planned**, not existing endpoints. Auth sign-up/in/out uses Supabase Auth through validated UI/server boundaries. Use a consistent typed result: success data or sanitized error code/message with retryability. Distinguish invalid input (400), unauthenticated (401), forbidden (403), missing/inaccessible resource (404), state conflict (409), provider failure (502), and timeout (504). Never return raw secrets/provider payloads.

| Mutation boundary | Input / effect |
| --- | --- |
| POST /api/stories/drafts | Title/metadata, consent, proposed file type; create owner-scoped upload authorization. |
| POST /api/stories/{id}/upload-finalize | Storage reference; probe actual type/duration, validate <=180s, finalize draft or clean failed object. |
| POST /api/stories/{id}/transcribe | Owner draft; claim state, call configured adapter, persist transcript/timings/error. |
| PUT /api/stories/{id}/transcript | Title and ordered edited segments; author-only draft update. |
| POST /api/stories/{id}/publish | Validate and atomically freeze original, create/retrieve translation plus pending tasks. M4 prepares state; M5 wires provider processing. |
| POST /api/stories/{id}/translation/process | Owner original and next unfinished segment; claim/process/persist one task; return durable progress. |
| POST /api/stories/{id}/translation/retry | Explicitly retry failed/expired task after ownership/state checks; completed results reused. |
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

Auth/profile pages, server actions and Supabase clients/Proxy are implemented; authenticated account reads stream under Suspense, profile writes use verified user identity and RLS, and refreshed responses are private/no-store. Migration 20261110105042_m2_foundation.sql creates all eight domain tables/private bucket but remains owner-applied. Ordinary write grants are restricted to profile fields; later workflow writes/uploads are denied. No M3 feature UI. See M2_VERIFICATION for exact setup and test gates.
