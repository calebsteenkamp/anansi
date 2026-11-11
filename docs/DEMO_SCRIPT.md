# Five-minute demo script

**Planned, not yet executable.** Required product features and seed tooling arrive in M1-M9; no demo account/recording/test result is claimed to exist. [T9](TEST_PLAN.md#t9-complete-demosubmission) owns validation.

## Preparation and named data

- Personas: **Anansi Storyteller**, isiXhosa preference; **Anansi Verifier**, English preference and both spoken languages. Actual login identifiers are assigned locally when accounts are provisioned; no passwords/tokens in docs.
- Story title: **Anansi Demo - isiXhosa Story**. Primary audio: a tester-supplied permission-cleared 20-40 second narrative collected in Q6. Record its actual filename and consent before rehearsal.
- Initial technical backup: local data/Phrase 1/Phrase 1.mp3 with isiXhosa.txt/English.txt/Intent.txt; Phrase 2 equivalent is alternate. Label these as short greeting/appreciation samples, not narrative-quality evidence.
- Seeded fixture title: **Anansi Demo - Mock Backup**. Later seed command must be repeatable and scoped to named fixtures only. Label output mock/demo; no hidden substitution during live run.
- Before rehearsing, record one tester-approved correction and intent explanation for a real translated segment below. Do not invent an isiXhosa proverb, expected translation error, or human feedback.
- Two browser sessions, microphone/upload permission, audio output, network/provider configuration tested. Keep developer credentials/logs hidden. Confirm original recording consent and target-project accounts.
- Start from a known seed/demo state via documented fixture-only preparation, never a whole-database reset. Test complete journey twice before presentation.

## Timed actions and expected results

| Time | Exact presenter action | Expected visible result |
| --- | --- | --- |
| 0:00-0:40 | Explain language/meaning problem; state isiXhosa->English and human verification. | Audience understands intended storyteller/listener/verifier; make no accuracy/scale claims. |
| 0:40-1:30 | As Storyteller choose New story, record prepared short narrative or upload it, preview, confirm consent. | Draft audio persists, correct cap/permission messaging. |
| 1:30-2:15 | Run transcription, edit prepared segment/title, publish. | Original retained; English story linked/credited and processing starts; show progress. |
| 2:15-3:15 | Open story as English-preferring Verifier; play original, activate segment seek, optionally Listen in English. | Original/translation alongside; highlighting; approximate/device labels where applicable. |
| 3:15-4:15 | Open Verify, apply tester-approved English correction, enter actual intent note, Approve with demo rating 4, submit. | One saved review, expected Confident badge when sole approval, Storyteller tag only if self-review, corrected toggle preserves AI version. Rating 4 is demonstration input, not reported tester evidence. |
| 4:15-4:45 | Follow storyteller, repost inside app, find/open story in Following/discovery. | Published linked story accessible, no duplicated entries. |
| 4:45-5:00 | Explain real limits and next steps. | Self-declared bilingual eligibility, approximate timings, provider uncertainty, one tester, mock backup disclosed. |

## Failure recovery

If microphone unavailable, upload prepared cleared clip. If ASR fails, show error and type/paste the approved reference; say transcription failed. If translation partially fails, show saved progress and retry unfinished segment. If provider remains unavailable, switch explicitly to the seeded **Mock Backup** and disclose it; do not claim live translation succeeded. If speech voice unavailable, retain original audio/text. A recovery run does not count as an uninterrupted rehearsal unless it stays within the rehearsed path/time.

## Evidence to fill during M9

| Item | Actual value |
| --- | --- |
| Narrative filename / permission record | Pending Q6 |
| Actual account identifiers (no secrets) | Pending provisioning |
| Segment / tester-approved correction / intent | Pending real translation and tester review |
| Provider/model or explicit mock mode | Pending M1 choice |
| Tester session date / elapsed time / rating | Not run |
| What machine got wrong / correction-flow feedback | Not observed |
| Rehearsal 1 date / duration / outcome | Not run |
| Rehearsal 2 date / duration / outcome | Not run |
| Video/submission artifact if requested | Not produced |

Update actual inputs/outcomes before calling this the final runnable demo. One informal tester is evidence about workflow usability, not general accuracy or cultural validity.

M4 partial-demo note: after SQL/manual verification, capture -> corrected transcript -> frozen publication can be demonstrated. English is only a pending linked record at this milestone; generation/full script still requires later approved milestones. Do not present pending metadata as translated output.

M5 rehearsal addition (unverified until M5 acceptance): after transcript Save, confirm text-submission permission and Publish. Observe segment progress and AI/mock label; reload shows saved text without processing. Demonstrate Refresh, and Continue/Retry only for unfinished work. English remains awaiting human verification; no M6 synchronized playback or M7 review is claimed.
