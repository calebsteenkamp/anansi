# Post-release maintenance — 11 November 2026

Owner authorized fixing all seven moderate audit findings and restoring automatic GitHub deployments. No new feature milestone, public registration, membership expansion or paid provider request is included.

## Audit correction

The seven findings originated from minimatch's globparts amplification advisory GHSA-g3hv-75wg-m249 and its TypeScript ESLint dependency chain. Installed typescript-eslint8.72.2 still requested minimatch10. A scoped npm override pins only @typescript-eslint/typescript-estree's minimatch to11.0.8. Other ESLint consumers retain unaffected3.1.5; Next.js is unchanged. The consumer uses the named minimatch function with the existing dot option, supported by the replacement. Keep the override until upstream includes a patched compatible dependency; review it during tooling upgrades.

npm audit reports0 vulnerabilities across all severities. npm ls minimatch confirms the scoped override. Unit188/188, integration35/35, lint and production build passed; browser/fresh-install gates are recorded below when complete. No paid benchmarks or live verification scripts are run.

## Git connection

MCP and CLI initially failed with GitHub credentials errors. Vercel's Authentication page showed GitHub unconnected. Owner completed Connect authorization. Repository search then returned calebsteenkamp/anansi and CLI git connect succeeded. Read-only project configuration verifies provider github, org calebsteenkamp, repo anansi and productionBranch main. Main pushes are configured for automatic production builds; verify the Git-sourced deployment after pushing. No bypass secret, protection change or paid upgrade is needed.

GitHub repository: https://github.com/calebsteenkamp/anansi.

## Inviting application users

Current access is restricted to four permanent Auth UUIDs. Share https://anansi-gray.vercel.app with those account owners, who use their own credentials. Public signup stays closed.

Supabase can send invitations from Authentication → Users → Add user → Send invitation, but an invitation alone does not grant Anansi membership. This app also lacks a dedicated invitation acceptance/password setup screen, so email invitations are not a completed onboarding flow. Adding people requires owner approval to expand the four-account scope, implementing/testing invitation acceptance and password setup, then an owner-reviewed SQL membership change for each verified Auth UUID and a deliberately sent invitation. The existing activate_demo function requires exactly four users; do not reuse it to append a fifth or bypass RLS. No accounts/invitations were created by this maintenance task.

Official invitation API: https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail.

## Completed verification before commit (2026-11-11T21:53:00+02:00)

- npm run test:unit:188/188,28 files,8.68s, exit0 (started21:38:04).
- npm run test:integration:35/35,10 files,192.45s, exit0 (started21:38:18).
- npm run test:e2e:19/19,11.4m, exit0; providers explicitly mocked by the managed test server.
- npm run lint and npm run build:exit0; compile11.2s/TypeScript19.3s/14 pages.
- npm run verify:fresh-setup:exit0; fresh snapshot2026-11-11T19-42-45-901Z, npm ci428 packages/0 vulnerabilities,188 unit tests, lint and build (compile74s/TypeScript24.9s). Expected nested snapshot lockfile warning retained; no application configuration change.
- npm audit:0 vulnerabilities; npm ls dependency consistency and whitespace checks passed.

No paid provider calls or live benchmark scripts were run. GitHub/main binding is verified; the following normal push must be observed as a Git-sourced Vercel deployment before reporting automatic deployment success. No new Next.js feedback candidate arose; routine tooling maintenance only.
