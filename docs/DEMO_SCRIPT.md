# Five-minute demonstration

Status: runnable preparation and automated journey coverage are implemented in M9; human feedback and timed rehearsals are pending. [M9 verification](M9_VERIFICATION.md) records actual evidence. M10 is deferred.

## Prepare once, before starting the timer

1. Use only the owner's existing files: `data/Phrase 1/Phrase 1.mp3`, `isiXhosa.txt`, `English.txt`, `Intent.txt`. Phrase 2 in its corresponding directory is the alternate. These are short greeting/appreciation samples, not a narrative-quality benchmark. They are ignored and must be supplied separately on a fresh checkout. No newly recorded audio is part of this demonstration.
2. Choose two existing accounts: **Anansi Storyteller** (preferred isiXhosa) and **Anansi Verifier** (preferred English, spoken languages isiXhosa and English). Edit their profiles through the app. Use separate browser/private sessions. Keep passwords and tokens out of documentation and screen recordings. Get their user UUIDs from Supabase Authentication → Users; do not copy access tokens.
3. With local Supabase credentials already configured, run the dry-run command below using those UUIDs. Check the printed IDs, then repeat with `--apply`. This creates a named private transcript draft and a published **Anansi Demo - Mock Backup (Phrase 1)** with deterministic mock English. It does not create/change accounts, reset reviews or replace existing content. The backup's isiXhosa transcript comes from the supplied reference, not real ASR. Note the returned backup and draft URLs privately for rehearsal.
4. Start the server, verify both accounts and audible original playback, then open the draft in Storyteller's browser. Have the reference files ready to paste. Start at the home page when the timer starts; preload the draft URL in a separate tab. Do not expose `.env.local` or admin tooling during the presentation.
5. Select the presentation mode explicitly before rehearsal. **Mock:** stop the server, set `TRANSCRIPTION_PROVIDER=mock` and `TRANSLATION_PROVIDER=mock` in that terminal, restart. **Live:** keep the approved OpenAI defaults and existing credentials; live actions may incur costs and need the already-cleared sample/consent. Agent automated tests and seed never make live calls. Do not silently switch modes. Clear temporary terminal variables when returning to normal defaults.
6. A bilingual person must first review actual OpenAI output from the provided Phrase1/2 material (reuse existing accepted/stored output where available) and agree a correction/intent explanation. Record their actual observations in M9_VERIFICATION. Reference English is demonstration input, not new human feedback. Mock-only feedback leaves real-output meaning/intent verification pending. If no correction is needed, say so; do not invent a machine mistake.

```powershell
npm run seed:demo -- --storyteller-id <storyteller-uuid> --verifier-id <verifier-uuid> --sample 1
# After inspecting the dry run:
npm run seed:demo -- --storyteller-id <storyteller-uuid> --verifier-id <verifier-uuid> --sample 1 --apply
npm run dev -- --port 3000
```

Replace the angle-bracket placeholders; they are not literal PowerShell arguments. Seeding requires the existing applied M2–M8 migrations and local server-only credentials. If a backup has been changed, the command stops instead of resetting it. To demonstrate another new publication, upload the same provided sample again; the existing published original remains frozen. The seed's private draft is not reset on repeat execution.

## Timed script (target at most five minutes)

| Time | Exact action | Expected result / spoken explanation |
| --- | --- | --- |
| 0:00–0:30 | Show home page; explain “AI drafts; people check meaning; the original voice stays.” State live OpenAI or synthetic mock mode. | Explain isiXhosa→English, limited sample, and human confidence rather than measured accuracy. |
| 0:30–1:00 | Storyteller opens New story, uploads the provided Phrase 1 MP3, previews it, confirms audio consent, and saves a private draft. | Stored original audio; transcript editor. No new recording. Preseeded draft is a disclosed timing/recovery backup. |
| 1:00–2:00 | Explicitly Transcribe after consent; correct against `isiXhosa.txt` (or paste it using Use pasted transcript), set title **Anansi Demo - Phrase 1**, Save. Confirm text consent and Publish. | Persisted/frozen isiXhosa transcript, linked English and progress. In mock mode explicitly state ASR/English are synthetic and paste the provided source reference. |
| 2:00–2:45 | Verifier opens the published story URL, confirms English view, plays original, activates a segment to seek/highlight. Optionally select a local English voice and Read in English. | Linked source and English; approximate timing label. Missing device voice is disclosed; original audio/text stay usable. |
| 2:45–3:45 | Verifier enters the previously agreed correction (or uses provided reference English explicitly as demonstration text), intent note, Approve and demo rating 4; Save review. Toggle community corrections, then reload. | Confident when sole approve/rating4; correction overlay changes while AI default returns after reload. Rating4 is a demo input, not the tester's measured result. |
| 3:45–4:30 | Open Discover, search **Anansi Demo - Phrase 1**, filter isiXhosa, Follow author, choose Following, Repost in Anansi, and open Story link. | One result per language version; published access and working follow/repost. |
| 4:30–5:00 | Explain limits and actual tester feedback. | Small short-sample evidence; self-declared bilingual status; estimates/device support; provider errors/billing uncertainty; M10 deferred. No general accuracy/production claim. |

## Recovery (announce the change)

- Failed ASR: show the error, paste the provided isiXhosa reference, Save; state that human input replaced failed transcription.
- Interrupted translation: show persisted progress; Continue resumes unfinished work, Retry is for failed/expired work. Reload alone performs no provider request.
- Provider unavailable: open the seeded **Mock Backup** URL, explicitly say synthetic English and reference-seeded source transcript. Never present the backup as a successful live translation.
- Audio/voice unavailable: renew original playback if its URL expired; retain original text and disclose absent device voice. A new paid request is not a playback recovery step.
- Do not reset the database or erase reviews to stage a badge. For another clean rating demo, publish a fresh draft of the same supplied file and use its new URL.

Perform two real uninterrupted rehearsals, each at most five minutes. Record actual dates, elapsed times, chosen mode, recovery used and outcome in [M9_VERIFICATION](M9_VERIFICATION.md). Automated browser duration is not rehearsal evidence. No video or submission has been produced by this step.
