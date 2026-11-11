# M6 verification and manual acceptance

Initial checkpoint 2026-11-11T09:28:08+02:00. M5 accepted/published as9872f29cc17d9891c794786e1ba81c85c90322e6; remote verified. M6 only authorized, no M7. M6 remains uncommitted/unpushed until required actual desktop/phone checks pass.

## Implementation / setup

No SQL, new dependency or new credential required. Read profile preference, visible original/English segments and signed audio through existing authenticated/RLS boundaries. Reading language is a page override; use Your profile to persist future defaults. Source IDs align English with original segments. Click/Enter/Space seek original audio and preserve its paused/playing state; labels disclose estimated timing.

English device narration is optional and explicit. Only voices the browser marks local and English are eligible. It is separate from the original recording and app AI providers. Missing voice/API or a speech error retains text/audio. No remote speech fallback, autoplay or paid provider call. Short sequential utterances preserve segment identity; document-scoped ownership and generation tokens stop competition/stale events; pagehide/unmount/language/voice changes cancel speech.

## Automated evidence

Unit132/132,19 files,09:25:39+02:00,2.29s,exit0. Lint/build exit0 (compile4.4s/TypeScript6.9s). Final actual results below:132 unit/22 integration/14 browser plus focused accessibility, lint/build pass. Manual acceptance is still pending. Synthetic audio and speech stubs establish behavior, not real phone compatibility/audibility. No paid provider requests are part of these checks.

Commands: npm run test:unit, npm run test:integration, npm run test:e2e, npm run lint, npm run build, npm ls --depth=0, git diff --check. Stop the manual dev server before browser/build; managed browser server uses mock providers. Disposable UUID fixture audio/accounts are removed, never reset the project.

## Exact owner manual checks (after automated checks pass)

Start npm run dev -- --port 3000. Desktop: http://localhost:3000. Same-Wi-Fi phones: http://192.168.18.157:3000 (current configured LAN host; use current ANANSI_DEV_HOSTS if it changes). Use an existing published story with saved English; opening/reading it must not initiate transcription/translation. No new AI recording submission is needed. Keep A/B in separate sessions and verify Signed in as labels.

1. **Profile/defaults:** save A preferred language isiXhosa, open a published story: original text only. Change Reading language to Original + English: matching English appears beside each source. Refresh: saved profile default returns. Save English preference on Your profile and reopen: both appear initially. B must use B's own preference, not A's.
2. **Original audio:** play/pause/seek using native controls; confirm actual audible original. Highlight should follow the segment interval. Click a segment, then Tab to another and press Enter/Space: audio playhead moves there. Paused audio stays paused; playing audio continues. Approximate labels remain visible; do not expect exact word synchronization from estimates.
3. **Local English voice (if available):** select Original + English, select a listed voice and press Read English with device voice. Confirm audible English, sequential segment highlights, and original audio pauses. Stop must stop immediately. Start again, then play original audio: device speech must stop. Changing language/voice and navigating to Your profile/Record another story must stop narration; returning must not autoplay.
4. **Unavailable voice/failure:** if no local English voice is listed, report device/browser and the unavailable message; original audio/text/seeking must still work. Mark actual narration unsupported on that device, not passed. Automated stubs cover missing/late voices/errors; do not install paid voices or trigger a provider fallback for this test.
5. **Huawei and Oppo:** repeat text/audio/seek/language and available voice/fallback checks on both phones. Verify portrait layout has no horizontal overflow, buttons work, and profile/new-story links finish without stuck Rendering, typing resets, hydration or runtime errors. If a signed audio link expires, Renew playback then explicitly press play.
6. Reply pass/fail per item and per device; identify any unavailable voice separately. Do not send passwords, keys or signed audio links. Actual observations are needed before M6 commit/push. M7 remains unauthorized.

## Known limits

Timing is segment-level and often estimated; English is aligned to original segments, not synthesized voice timecodes. Local voices depend on installed/browser-exposed support; no universal voice availability or production guarantee. Playback arbitration covers the current document, not independent browser tabs/apps. Synthetic browser output does not establish real audibility or language quality.

### M6 final automated verification — 2026-11-11T09:42:56+02:00

- Unit:132 passed(132),19 files,exit0,09:37:42+02:00,5.74s.
- Integration:22 passed(22),4 files,exit0,09:25:43+02:00,63.34s; actual existing Supabase schema/user authorization. No migration needed.
- Full browser:14 passed,exit0,4.6m. Initial full run11 passed/3 failed (5.8m) on exact implicit select-label lookup; explicit aria-labels fixed it. Final native seek/end/accessibility-description case also passed separately (1 test,37.8s). Device speech stubs are confined to tests, not proof of audible output.
- Final lint/build exit0 (compile2.8s/TypeScript7.3s). A test-only dotAll regex flag first failed the existing ES2017 TypeScript target; equivalent [\s\S] expression fixed it without changing application target.
- npm ls --depth=0, whitespace and local documentation links pass. Final production client secret-value scan passes across16 JavaScript assets; no values displayed. .env.local/data remain ignored; M6 remains unstaged.0 disposable test accounts remain.
- No new paid provider calls, schema mutations or dependencies. M5 stays published at9872f29cc17d9891c794786e1ba81c85c90322e6. M6 manual desktop/Huawei/Oppo acceptance remains pending; M6 uncommitted/unpushed, M7 unauthorized.
- Next.js feedback review completed: no qualifying framework issue retained. Label/regex fixes were routine application/test debugging; no feedback sent.

Owner acceptance 2026-11-11T10:07:45+02:00: all requested M6 tests pass; owner authorizes M6 commit/push, then M7 only. No further device/version observations supplied. M8 unauthorized. Repeated publication checks pending.

M6 publication recheck 2026-11-11T10:12:37+02:00:132 unit (4.11s),22 integration (63.70s),14 browser (4.7m), lint passed exit0. Owner manual acceptance recorded. Production build repeated before commit. No paid calls.

M6 published as20bf76146b8d25e4687f364249adb5f6f276c5c2 after owner acceptance/repeated checks; remote matched before M7 code.
