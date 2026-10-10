# CourseDock beta deployment

Updated 2026-10-10. Target: https://eljhon.me/student-dashboard. The user explicitly authorized this beta deployment. The root portfolio already runs on Vercel project `junhao-luo`.

## Configured and verified

- Clerk production instance: `ins_3KUL5t6nQ81c6DVQamuN4h3k56i`, in the existing CourseDock app.
- Clerk issuer: `https://clerk.eljhon.me`. All five authentication CNAMEs are verified and SSL certificates issued. Existing portfolio and email routing were preserved.
- Google project: `coursedock-511204`. User completed consent branding and supplied credentials directly to Clerk. Both Google and GitHub now show **Used for sign-in**. Actual production login has not been exercised.
- User approved and enabled Clerk's production Convex integration. The enabled switch was read back. Actual JWT audience/transport validation remains a release check.
- Convex production deployment: `cheery-dachshund-214`, URL `https://cheery-dachshund-214.convex.cloud`. `AUTH_JWT_ISSUER` is set. Deployment dry run and server type checks pass; functions have not been deployed there.
- Clerk Home URL and application sign-in/sign-up/sign-out paths were saved under `/student-dashboard`.
- Vite builds and previews use `/student-dashboard/`; local development uses `/`. Browser sign-in/signup links and refresh pass on the nested production preview. A preview-base mismatch initially returned HTML for JavaScript assets; corrected with Vite's `isPreview` flag and rechecked in Chrome.
- 15 frontend tests and 13 backend tests pass. Production build passes. npm audit reports zero vulnerabilities. A known-pattern scan of source/backend/build reports no secret candidates; this is not a complete history scan.
- Support/privacy contact: `support@eljhon.me`, operator Eljhon Steve (羅俊豪). Legal preview now identifies this contact and retains accurate unfinished-deletion/local-storage notices.

## Vercel setup still pending

Vercel's GitHub installation currently has saved access only to `junhao-luo/junhao-luo`. The permission form is prepared with `junhao-luo/student-dashboard` also selected, but Save has not been clicked: user approval is pending. Chrome automation subsequently reported that its ChatGPT extension needs an update. No CourseDock source push or public frontend deployment has occurred.

After approval and browser recovery, create a separate CourseDock Vercel project, using Vite, `npm run build`, and `dist`. Production frontend environment needs only the production Clerk publishable key and `VITE_CONVEX_URL=https://cheery-dachshund-214.convex.cloud`. Never add Clerk client secrets, Clerk secret API keys, Convex deployment keys or Resend secrets to `VITE_*` variables.

Once the actual CourseDock deployment hostname is known and verified, add an external rewrite to the portfolio project that maps `/student-dashboard/:path*` to the same path on that CourseDock hostname; map the bare `/student-dashboard` route too. Preserve the prefix. CourseDock's own Vercel configuration maps prefixed assets and favicon to static files, with an SPA fallback. Keep portfolio routes and the contact Worker intact. Record a rollback before changing the portfolio routing.

Vercel header configuration includes CSP, HSTS, framing protection, nosniff, referrer and permissions policies. CSP uses the production Clerk and Convex endpoints and documented Clerk bot-protection sources. It remains unverified on a live deployment. Check that the portfolio proxy preserves or applies those headers specifically to the app path. References: [Clerk CSP guidance](https://clerk.com/docs/guides/secure/best-practices/csp-headers), [Vercel rewrites](https://vercel.com/docs/routing/rewrites).

## Launch gates

The beta request does not waive Rules.md. Private cloud notes/resources/files, reminders, account-wide deletion, real two-user access/session checks, free-tier fail-closed controls, admin MFA evidence, secret-history review, deployed headers/origins and backup/restore remain incomplete. Do not announce a full student-data release until applicable controls are implemented and verified. Keep synthetic data for setup checks. Do not silently migrate development accounts or browser workspaces into production.

Browser proof images live in ignored `.playwright-cli/`: `production-oauth-configured.jpg`, `clerk-production-verified.jpg`, `vercel-access-prepared.jpg`. No secrets were copied to chat, source or frontend configuration.
