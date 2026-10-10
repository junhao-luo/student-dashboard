# CourseDock beta deployment

Updated 2026-10-10. Target: https://eljhon.me/student-dashboard. The user explicitly authorized this beta deployment. The root portfolio already runs on Vercel project `junhao-luo`.

## Latest protected preview setup

Vercel project `junhao-luos-projects/coursedock` was created on Hobby and connected to `junhao-luo/student-dashboard`. GitHub repository access to both portfolio and student-dashboard was confirmed saved. Vercel Authentication is saved for All Deployments; project data use for model training is disabled. No bypass link or secret was created. The tested source was committed and pushed as `0e4e2c8` on `codex/beta-preview`, leaving main and the portfolio unchanged.

Only Preview has the public Clerk development publishable key and friendly-reindeer-145 Convex URL. No production account migration or backend installation was performed. The beta branch CSP includes these exact development service origins alongside the prepared production origins; remove development origins before public production release. This is a protected pre-production test, not the public student-data launch. Use synthetic study data; private cloud files, deletion, reminders and remaining security checks are still unfinished.

Source/build and all six locally reachable history commits were scanned for known credential patterns without matches; staged source was checked separately. This is a pattern scan, not an assurance that every possible secret format is detected. Current npm audit has zero vulnerabilities; 15 frontend and 13 backend tests pass. Vercel build/live-route/session results will be recorded after verification.

Verified hosted preview: deployment `4PTK97yTkLfKt46yfxK63W6FipZG`, commit `c88b730`, Ready in 16 seconds, environment Preview. Test URL: https://coursedock-rjv1v1ipb-junhao-luos-projects.vercel.app/student-dashboard/sign-in. The hosted hero and Clerk Google/GitHub/email forms render; sign-up navigation and direct refresh pass. No application error was captured, only the expected Clerk development-key warning. A cookie-free HTTP request returns 302 to Vercel SSO, confirming anonymous protection. That protection response does not establish the application's own CSP/header behavior. Hosted authenticated dashboard/profile/sync checks are pending user sign-in. The portfolio rewrite and public path remain unchanged. Keep All Deployments protection enabled; rollback is to halt beta pushes and restore the prior tested preview through Vercel, without touching portfolio routing or migrating account data.

## Configured and verified

Hosted account check, 2026-10-10: after the user's beta sign-in, the browser reached `/student-dashboard/` Overview. Refresh retained the authenticated workspace and existing profile. The profile popup offers Edit profile and Log out; Edit profile opens Settings and loads the five-field student form with saved values (not recorded). Returned to Overview without changing academic records or profile values. No application errors were captured. This verifies one existing development account; new-account onboarding, real two-user isolation, authenticated sync writes and production-provider login remain unverified. Screenshot: ignored `.playwright-cli/vercel-beta-dashboard.jpg`.

- Clerk production instance: `ins_3KUL5t6nQ81c6DVQamuN4h3k56i`, in the existing CourseDock app.
- Clerk issuer: `https://clerk.eljhon.me`. All five authentication CNAMEs are verified and SSL certificates issued. Existing portfolio and email routing were preserved.
- Google project: `coursedock-511204`. User completed consent branding and supplied credentials directly to Clerk. Both Google and GitHub now show **Used for sign-in**. Actual production login has not been exercised.
- User approved and enabled Clerk's production Convex integration. The enabled switch was read back. Actual JWT audience/transport validation remains a release check.
- Convex production deployment: `cheery-dachshund-214`, URL `https://cheery-dachshund-214.convex.cloud`. `AUTH_JWT_ISSUER` is set. Deployment dry run and server type checks pass; functions have not been deployed there.
- Clerk Home URL and application sign-in/sign-up/sign-out paths were saved under `/student-dashboard`.
- Vite builds and previews use `/student-dashboard/`; local development uses `/`. Browser sign-in/signup links and refresh pass on the nested production preview. A preview-base mismatch initially returned HTML for JavaScript assets; corrected with Vite's `isPreview` flag and rechecked in Chrome.
- 15 frontend tests and 13 backend tests pass. Production build passes. npm audit reports zero vulnerabilities. A known-pattern scan of source/backend/build reports no secret candidates; this is not a complete history scan.
- Support/privacy contact: `support@eljhon.me`, operator Eljhon Steve (羅俊豪). Legal preview now identifies this contact and retains accurate unfinished-deletion/local-storage notices.

## Vercel setup and remaining public routing

Vercel's GitHub installation has saved access to both repositories. The CourseDock project is connected and the beta branch is pushed. The first manually requested preview built successfully in 28 seconds, but Vercel classified it as Production; that build has no production environment values and remains protected. Production branch tracking is confirmed as `main`. A subsequent branch push will be checked for a true Preview build using its development configuration.

After approval and browser recovery, create a separate CourseDock Vercel project, using Vite, `npm run build`, and `dist`. Production frontend environment needs only the production Clerk publishable key and `VITE_CONVEX_URL=https://cheery-dachshund-214.convex.cloud`. Never add Clerk client secrets, Clerk secret API keys, Convex deployment keys or Resend secrets to `VITE_*` variables.

Once the actual CourseDock deployment hostname is known and verified, add an external rewrite to the portfolio project that maps `/student-dashboard/:path*` to the same path on that CourseDock hostname; map the bare `/student-dashboard` route too. Preserve the prefix. CourseDock's own Vercel configuration maps prefixed assets and favicon to static files, with an SPA fallback. Keep portfolio routes and the contact Worker intact. Record a rollback before changing the portfolio routing.

Vercel header configuration includes CSP, HSTS, framing protection, nosniff, referrer and permissions policies. CSP uses the production Clerk and Convex endpoints and documented Clerk bot-protection sources. It remains unverified on a live deployment. Check that the portfolio proxy preserves or applies those headers specifically to the app path. References: [Clerk CSP guidance](https://clerk.com/docs/guides/secure/best-practices/csp-headers), [Vercel rewrites](https://vercel.com/docs/routing/rewrites).

## Launch gates

The beta request does not waive Rules.md. Private cloud notes/resources/files, reminders, account-wide deletion, real two-user access/session checks, free-tier fail-closed controls, admin MFA evidence, secret-history review, deployed headers/origins and backup/restore remain incomplete. Do not announce a full student-data release until applicable controls are implemented and verified. Keep synthetic data for setup checks. Do not silently migrate development accounts or browser workspaces into production.

Browser proof images live in ignored `.playwright-cli/`: `production-oauth-configured.jpg`, `clerk-production-verified.jpg`, `vercel-access-prepared.jpg`. No secrets were copied to chat, source or frontend configuration.
