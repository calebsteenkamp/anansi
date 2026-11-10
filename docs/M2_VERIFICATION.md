# M2 verification handoff

M1 is accepted and pushed as 545e449. M2 automated functional checks pass. The owner reported a hydration warning/profile mismatch, and subsequently confirmed both reported issues are fixed after the regression repair. M2 remains uncommitted; publication is not part of this repair step. M3 is unauthorized.

## Completed prerequisites

- GOOGLE_CLOUD_TRANSLATION_API_KEY is nonempty in Git-ignored .env.local; value never displayed. No Google API call/validation. [Owner-supplied Node.js reference](https://docs.cloud.google.com/nodejs/docs/reference/translate/latest) is retained for future Google work; no adapter is added in M2.
- Owner applied [M2 foundation](../supabase/migrations/20261110105042_m2_foundation.sql). All eight public tables verified with RLS; private story-audio bucket and intended grants verified. Do not rerun the foundation script.
- Public Auth settings verified: email signup enabled, confirmation disabled for this demo.
- Real-user integration: 5 passed. Browser: 2 passed, including signup/profile persistence/cross-user denial/logout. Unit: 39 passed; lint/build pass.
- Read-only cleanup verification: zero remaining anansi-t2/anansi-e2e test users and zero t2 test objects.

## 1. Permissions-only follow-up completed

Owner applied [follow-up SQL](../supabase/migrations/20261110111925_m2_restrict_event_trigger_execute.sql). Read-only verification confirms anon/authenticated cannot execute public.rls_auto_enable(). Both security warnings cleared. The remaining RLS-with-no-policy INFO on translation_tasks is intentional client denial. Do not rerun the foundation or follow-up unnecessarily.

## 2. Manual feedback verified

Owner reported that redirect worked but sign-in did not reflect the correct profile, together with a hydration warning. The stronger browser regression reproduced a preferred-language display reset after saving. Controlled profile fields, canonical server-returned values, native reset prevention, identity keys and auth-route invalidation now protect profile display across saves and account changes.

The owner then confirmed: hydration warning fixed and sign-in now correct. No cause involving browser extensions was established and no warning was suppressed. Automated tests check immediate saved fields vs database, language preferences/checkboxes, two separate contexts, and repeated B->A->B sign-in in one browser.

For future regression checks: open localhost:3000, save all fields for account A, refresh, use B in another session, then sign out/in as B and A in the same browser. Confirm all fields reflect the authenticated user and logout redirects. Do not send passwords. No repeat of this already resolved check is currently requested.

## 3. Repeatable automated checks

    npm run test:unit
    npm run lint
    npm run build
    npm run test:integration
    npm run test:e2e

Unit tests never contact providers. Integration uses the confirmed Anansi demo project and real anonymous/user sessions; service-role is only for fixture setup/cleanup. Playwright starts/stops its own server on port 3000 and uses two isolated contexts. Stop a separate dev server before running it. No paid provider calls, recordings, broad database resets, or trace/video credential capture.

## Migration-history note

The owner applied SQL through the editor; hosted CLI migration history remains empty. The local files and milestone evidence record application. Do not run an automatic db push against these existing tables; reconcile hosted migration history deliberately before adopting CLI deployment. No history row was fabricated or remote schema automatically modified by the agent.

## Commit gate

The owner has confirmed the reported manual failures are resolved. Keep M2 uncommitted/unpushed in this repair step; do not infer authorization to publish M2 or start M3. All automated checks are real passes, but they do not substitute for the explicit human acceptance gate. Do not start M3.
