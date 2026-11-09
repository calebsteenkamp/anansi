# Product scope

Owner-approved prototype requirements, 2026-11-09. These are planned behaviors; [MILESTONES](MILESTONES.md) records actual implementation.

## Roles and journey

One email/password account supports storyteller, listener, and verifier workflows. Profile: display name, optional bio, preferred language (isiXhosa/English), self-declared spoken languages. No language test. UI is English. Email confirmation may be disabled only in the demo project.

| Stage | Required behavior and acceptance |
| --- | --- |
| Account | Two users sign up/in/out and persist preferences; neither changes another's profile. |
| Capture | Record/upload one isiXhosa clip, at most 180 seconds, preview it, confirm permission/ownership consent. Denied microphone has upload fallback. Persist playable unchanged audio after refresh. |
| Transcript | Explicit transcription with progress/errors; short editable segments, merge/split, title. Typed/pasted fallback. Prefer valid provider timings; label estimates approximate. |
| Publish | Author-only valid draft publication, original transcript frozen and audio preserved. Published stories readable by signed-in users; drafts private. |
| Translate | Automatically start after publish; one English story linked/credited to original, labelled AI translation or mock demo. Persist results, progress, retries. Reload never calls providers. |
| Listen | IsiXhosa preference shows original; English shows original plus translation. Highlight active segment and seek on activation. Optional English device speech, labelled as device voice. |
| Verify | Both languages on profile required. Approve/reject, integer rating 1-5, corrected English segments, optional intent note. One updatable review per person/translation; self-review permitted and tagged Storyteller. |
| Corrections | AI text stays default. Latest corrected view overlays the most recently updated review containing edits onto AI text; review ID breaks timestamp ties. Identify reviewer. Never overwrite AI text. |
| Discover | Newest-first, Following feed, title search, language filter, follow/unfollow, in-app repost/link. Combine followed authors and their reposts; deduplicate story entries. |

## Confidence rule

Rating expresses confidence in preserved meaning/intent, not measured accuracy. Use the unrounded arithmetic mean:

1. No reviews: **Awaiting verification**.
2. Rejections outnumber approvals: **Disputed** regardless of mean.
3. Otherwise mean below 3: **Fairly confident**.
4. Otherwise mean at least 3: **Confident**.

Tied approvals/rejections use mean. Self-declared reviewer opinions are not guarantees.

## Success and failures

Core: record/upload -> corrected transcript -> linked translation -> listening -> correction/review. Real-data journey runs twice, with seeded backup and one limited bilingual session. Mock runs demonstrate plumbing, not real-language quality.

Keep completed work after failures. Retry only unfinished segments; interrupted pending work can be continued explicitly. GETs never initiate/resume paid work. Deny cross-user writes and forged processing results. Original and AI text remain traceable.

## Non-goals and cut policy

No production guarantee, extra language pairs, translated UI, rewards/payments, blockchain, legal ownership protection, media editing, illustrations, recommendation algorithms, reviewer reputation, disagreement escalation, or training.

M10 intent-example prompting is deferred. With owner agreement only, cut: M10, sharing (keep follow), search/filters, corrected-version toggle, device English speech. Never cut core journey. Synchronize scope/plan/tests/demo after a cut; do not label removed tests passed.
