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
