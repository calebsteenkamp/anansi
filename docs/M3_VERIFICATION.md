# M3 verification and manual handoff

M2 is accepted and published as 5b9a1a2e52e1aa32e97551b7a2e2c1cf46b350cf; origin/main was verified identical. M3 only is authorized. M4 is not authorized. M3 remains uncommitted until all required manual checks pass.

## Owner SQL application (verified 2026-11-10)

Review [20261110120937_m3_audio_drafts.sql](../supabase/migrations/20261110120937_m3_audio_drafts.sql). In the existing **Anansi** Supabase project `lizbeiqyrwzkybpentrk`, open SQL Editor, paste this file, and run it once. Report success or the exact SQL error.

This additive transaction adds stories.audio_consent_at, audio_media_type, audio_size_bytes and a consistency/bounds constraint. Existing M2 rows may retain null capture metadata; the M3 server always supplies it. It keeps story-audio private and sets 25,000,000-byte and detected audio MIME restrictions. It creates no functions, accounts or tables; it changes no ordinary-client grants/RLS policies. Browser database and Storage writes remain denied. Never reset or automatically replay M2 SQL; SQL Editor applications are not CLI migration-history entries.

Owner reports successful application; read-only inspection verified all three columns/types, constraint, private bucket/25 MB/audio MIME limits, story RLS and denied ordinary INSERT/UPDATE. Network suites can now run. Do not reapply this migration.

## Implementation and local use

Sign in at http://localhost:3000, open Your profile and drafts -> Record or upload a story. Record (permission required) or choose MP3, AAC M4A/MP4, PCM WAV or Opus/Vorbis WebM. One audio track, no video, 180 seconds maximum, 25 MB maximum. The recorder stops at about 179 seconds to allow its final encoded packet. Exactly 180 seconds is accepted by server inspection; longer files are rejected.

Preview, check the ownership/recording permission statement, then Save private draft. The server verifies session/origin/consent, bounds the multipart body, inspects actual container/codec/packets using pinned Mediabunny, and uploads unchanged bytes into a generated user-ID/draft-ID path. It finalizes a draft only after successful upload. Save failures clean attempted objects; uncertain database responses are reconciled before deletion. Cleanup uncertainty shows the draft ID and requires owner attention.

Signed playback links last 300 seconds. Renew playback obtains a fresh link using current session and RLS. Anyone possessing an unexpired signed link can use it; do not share private links. Signing out blocks new authorized requests but does not revoke an already issued link.

This is encoded-media inspection, not a guarantee that every corrupt codec payload decodes or speech is audible. No conversion, paid provider, transcription, publishing or translation is invoked.

## Required human check (pending)

Owner named device: **Huawei i14** (as supplied; OS/browser not yet confirmed). Record actual browser/version and extension/MIME/duration observed.

1. On desktop, sign in as account A. Record a short cleared isiXhosa clip; preview and listen, consent, save, listen again, refresh and listen again.
2. Deny microphone permission and verify Upload audio remains usable. Upload a phone-created file and repeat preview/save/refresh/listen.
3. In account B's separate browser session, open A's draft URL. Expect not found; it must not reveal A's audio or create a playback link. After sign-out, protected draft/capture pages redirect to sign-in.
4. Try a file over 180 seconds and malformed input. Expect clear errors with no new saved draft. Consent unchecked must prevent save.
5. Confirm the actual phone file plays audibly on the named phone and desktop. Report any distortion, silence or format failure.

A phone's localhost points to the phone, not this PC. For a local-only demo without deployment, record using the phone's recorder, transfer the file to the PC, upload there, and play a privately transferred copy of the original/saved audio on the phone. Phone in-page microphone capture needs an HTTPS origin or a securely configured development connection; do not disable browser security or expose the app publicly just for this check. State explicitly which phone path was tested; a desktop browser emulation does not prove phone microphone capture.

For phone playback through the app, use the development server's Network URL on a trusted private Wi-Fi network and sign in on the phone; HTTP may play/upload but will not enable its in-page microphone. Do not open firewall ports or publish a tunnel automatically. If the phone cannot access the app, record that part as blocked rather than claiming phone browser acceptance from a transferred copy.

Report pass/fail for the above and device/browser/format, without passwords or private signed URLs. Until actual phone and audible playback evidence exists, Q5/T3 manual is pending and M3 must not be committed/pushed.

## Commands and evidence

- npm run test:unit: offline, deterministic; includes original suites and M3 boundaries, actual synthetic WAV parsing, request security and cleanup.
- npm run test:integration: real approved Supabase user-token privacy/Storage checks plus administrative fixture persistence/cleanup checks. Requires owner migration first.
- npm run test:e2e: real local app/browser/Auth/Storage. Synthetic waveform is not linguistic or audible-phone proof.
- npm run lint; npm run build; npm ls --depth=0; git diff --check.
- MILESTONES records actual timestamps/results. No live provider benchmark is needed.

## Recovery limitations

Storage and Postgres do not share a transaction. A hard process crash can leave an object before finalization; an uncertain cleanup response can leave a reconciliation task. Use the returned draft ID and its verified author-owned path: inspect matching story/object, preserve finalized audio, and remove only a confirmed unreferenced object after review. Never sweep unrelated files or reset Storage. Do not promise zero orphan objects across process crashes or exactly-once saves after the browser loses a successful response.

## Latest automated checkpoint

2026-11-10T17:13:20+02:00: applied schema verified; 68 unit,9 integration,5 browser tests passed; lint/build/whitespace passed. Actual phone/audio checklist remains pending; no commit/push. Browser synthetic Opus/WebM saved and reloaded; this does not establish human audibility.

## Owner manual feedback and phone repair

Owner passed desktop recording, consent/persistence, mic denial and privacy checks (1/2/3/6). Phone file and playback checks (4/5) failed before upload because sign-in reset on Huawei i14/HuaweiOS and Oppo17/Android. Neither phone media format nor phone playback is verified.

Captured logs show blocked Next development HMR from the LAN IP and repeated sign-in loads. Allow the exact PC host via ANANSI_DEV_HOSTS, keep controlled auth values, and handle bounded JSON auth responses safely. The generic action-response error did not identify its exact underlying HTTP cause; new auth transport reports errors inline. Captured hydration differences were body data-gr-* extension attributes; do not suppress other hydration errors or assume every warning shares that cause.

Retest both phones on the Network URL after closing old app tabs: type slowly, confirm neither field clears, submit and check Your profile. Then perform checks4/5: native phone recording -> upload -> audible preview/save -> refresh/playback, including app playback on the phone. Record phone OS/browser/version and file extension. HTTP phone microphone capture still requires upload fallback; HTTPS is needed for in-page microphone. Keep M3 uncommitted until these actual checks pass.

## Owner acceptance

2026-11-10T18:55:00+02:00: owner confirms both phones pass sign-in/upload/playback; earlier desktop/privacy passes retained. M3 human gate passed. Versions/extensions unreported. Publication requires repeated checks and remote hash verification.
