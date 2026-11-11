# Open questions

Keep answered rows, actual resolution dates, and decision links. Unknown evidence blocks the named gate, not unrelated authorized work.

| ID | Question / blocking gate | Owner | Provisional assumption | Answer / status | Decision / date |
| --- | --- | --- | --- | --- | --- |
| Q1 | Which provider transcribes isiXhosa adequately, with which formats/timings? M1/T1 | Owner + tester; Codex gathers evidence | OpenAI candidate needs testing; Vulavula published sync support omits Xhosa. | Resolved by owner acceptance of M1 evidence and editable/manual transcript fallback; preserve measured ASR limitations. Do not send Xhosa as Zulu. | D05; opened 2026-11-09 |
| Q2 | Which translation provider/model preserves meaning/intent? M1/T1 | Owner + tester | Vulavula lists Xhosa translation; OpenAI configurable candidate. | Resolved: owner reviewed and accepted comparison; OpenAI default and D16 model retained, no general accuracy claim. | D05; opened 2026-11-09 |
| Q3 | Are recordings cleared for provider submission; what spend limit applies? M1 live benchmark | Owner | No live calls/top-ups during docs step. | Resolved: owner permits both samples and reference text to OpenAI/Lelapa; USD 500 OpenAI allowance and 100 free Vulavula calls. First run capped at six requests, no automatic retries. | D06/D13; resolved 2026-11-09 |
| Q4 | Which Supabase demo/test project and accounts; migrations applied? M2/T2 | Owner | Capstone project, tagged fixtures, no reset; secrets local. | Resolved: target verified; owner applied foundation SQL and demo email settings, read-only verified. ACL hardening verified; owner confirms hydration/profile issues resolved after regression repair. M2 accepted and published as 5b9a1a2; see M2_VERIFICATION. | D03; opened 2026-11-09 |
| Q5 | Does tester phone format work or need conversion? M3/T3 | Tester + Codex | Upload fallback; no conversion dependency without evidence. | Resolved: owner confirms both Huawei and Oppo pass sign-in/upload/playback after LAN/auth repair; no conversion needed for tested files. Browser versions/extensions unreported. See M3_VERIFICATION. | D05; opened 2026-11-09 |
| Q6 | When can a bilingual tester review the provided samples and complete rehearsals? M9/T9 | Owner + tester | One informal tester, 10 or 11 November. | Partially resolved: owner says only provided audio (Phrase1/2), D38 on2026-11-11. Owner accepts reviews and5:00/5:15 rehearsals with allowed overrun (D39); unspecified review measurements remain unreported. | D06; opened 2026-11-09 |
| Q7 | Tailwind or CSS modules? | Owner | Retain existing Tailwind. | Resolved: Tailwind and root app structure approved. | D01; resolved 2026-11-09 |
| Q8 | How save post-commit M0 record? | Owner | Separate docs commit. | Resolved: two commits, no amend/push. | D07; resolved 2026-11-09 |
| Q9 | Reminder and approval policy? | Owner | Hourly until deadline; confirm each milestone. | Resolved: end 2026-11-11T23:59:00+02:00; no automatic implementation. | D04/D08; resolved 2026-11-09 |
| Q10 | M5 additive migration applied and manual recovery/privacy/phone checks accepted? M5/T5 | Owner + Codex | Owner applied SQL; schema/permissions verified. | SQL/permissions and117 unit/22 integration/11 browser gates pass. Resolved: owner reports all requested manual tests pass; M5 publication authorized, then M6 only. Follow M5_VERIFICATION for evidence. M4 manual5/6 accepted and fb985ff published. | D29/D30; opened 2026-11-10T23:32:25+02:00 |
| Q11 | Real desktop/Huawei/Oppo M6 audio, local voice availability and navigation accepted? M6/T6 | Owner + testers | English narration is optional when no browser-reported local English voice exists; text/original audio must remain usable. | Resolved: owner confirms all required manual checks pass; no extra hardware/version measurements supplied. Follow M6_VERIFICATION; no M6 commit before owner observations. | D32; opened 2026-11-11 |
| Q12 | M8 actual two-account and Huawei/Oppo discovery acceptance? M8/T8 | Owner | Owner-applied SQL/automation are separate from human acceptance. | Resolved: owner reports all tests pass, accepts M8 and authorizes normal publication;00fbdfb pushed before M9. | D36; opened 2026-11-11 |

On resolution, preserve question/history, add actual answer, evidence, decision ID, and date. Blocked/not-run tests remain so until genuinely verified.

## M10 release answers (2026-11-11T21:26:23+02:00)

- Four accounts: owner supplied storyteller@example.com and verifier@example.com in addition to A/B; exact UUID activation and closed signup verified (M10_VERIFICATION).
- Hosting path: owner approved CLI deployment after GitHub Bad credentials; exact tested artifact promoted successfully. Automatic GitHub deployment repair is deferred by the owner and does not block this release (D40/D41).
- Local versus production URL: owner replaced the single Site URL with production, preserving localhost redirects. Two local-production auth browser tests passed afterward; password login remains local through relative navigation (D41).
- Live verification: the six-slot allowance is closed. New agent provider calls require fresh authorization; existing reference reviews/short recordings do not establish general accuracy.

No required M10 owner handoff remains open. Unreported historical M9 measurements remain unreported rather than invented.
