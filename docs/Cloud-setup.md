# Account service setup

The academic workspace still stores records/files in this browser. Clerk development accounts and private Convex student profiles are connected through dedicated account pages and the Settings profile editor. Profile/course/planner functions are installed on a free development backend. Full synchronization and production release remain incomplete.

## Configured development services

- Convex team/project: Eljhon's team / CourseDock; development deployment friendly-reindeer-145 in US East (N. Virginia). Dashboard: https://dashboard.convex.dev/t/eljhon/coursedock/friendly-reindeer-145
- Clerk CourseDock development application: app_3KSrFTptTGp76uAwuYTll2MKZs6. Google and GitHub use shared development credentials; email/password and email verification codes are enabled. The school-email profile field is not independently verified.
- Clerk's Convex integration is enabled. AUTH_JWT_ISSUER is set in the Convex server environment to https://devoted-gar-2472.clerk.accounts.dev. Convex validates the issuer and audience convex.
- Ignored .env.local contains only frontend public identifiers plus the CLI deployment selector: VITE_CONVEX_URL, VITE_CLERK_PUBLISHABLE_KEY and VITE_CONVEX_SITE_URL. Secret API keys are not required by this frontend. The user-approved CLI credential is outside the repository in the Convex home configuration; never copy it into source or chat.
- User approved free project setup and the CourseDock-local-development CLI authorization. Functions were installed with convex dev --once against the development cloud deployment. No paid plan, Git push or public frontend deployment was performed.

## Verification and remaining integration

The app-wide boundary loads official ClerkProvider and ConvexProviderWithClerk. React Router hosts separate /sign-in/* and /sign-up/* pages; /onboarding blocks incomplete profiles. Login and successful profile completion open Overview through /dashboard, then normalize to /. Clerk UI is pinned through @clerk/ui because custom presentation depends on its layout. Wait for Convex authentication before profile reads. Every method requires the five-input profile with a server-generated school email before protected academic backend operations. Real Google sign-in, own-profile reads after reload, profile editing navigation, logout and Overview redirect have been exercised. GitHub/password sign-in, password reset, a fresh signup through mandatory onboarding, two real accounts, revocation and cookie/storage checks still need end-to-end verification. Do not put passwords or tokens in localStorage.

Local records/files are partitioned by signed-in account. Reviewed academic synchronization now uploads semesters/courses/tasks/meetings; notes/resources/file bytes remain local. Signing out does not erase them. Add notes/resources/private files and an explicit authenticated import/review with idempotency before enabling cloud workspace migration. Complete deletion/retention and provider production callback configuration before launch. Development OAuth credentials are not production OAuth configuration.

## Current server endpoint inventory

| Public action | Inputs and behavior | Budget per verified identity |
| --- | --- | --- |
| `profiles:get` | Read own profile only; no owner/internal fields in response | Shared read budget, 60/min |
| `profiles:save` | Exact five inputs; bounded strings, strict Taiwan mobile format; server-generated school email | Shared write budget, 20/min |
| `courses:list` | Own semester courses, explicit limit 1–50 | Shared read budget, 60/min |
| `courses:save` | Validated create/update; owner derived server-side | Shared write budget, 20/min |
| `courses:deleteCourse` | Owner checked; refuses courses with tasks or meetings | Shared write budget, 20/min |
| `tasks:list` | Owner-checked course, cursor and limit 1–50; minimal record fields | Shared read budget, 60/min |
| `tasks:save` | Assignment/exam create/update; validates owner, course, UTC timestamp and reminder offset | Shared write budget, 20/min |
| `tasks:deleteTask` | Owner and related course checked before deletion | Shared write budget, 20/min |
| `meetings:list` | Owner-checked course, cursor and limit 1–50 | Shared read budget, 60/min |
| `meetings:save` | Class create/update; validates owner/course, weekday and start/end times | Shared write budget, 20/min |
| `meetings:deleteMeeting` | Owner and related course checked before deletion | Shared write budget, 20/min |

All public functions are actions. Each authenticates and consumes a transactional internal budget before reading/writing. There are no public reactive queries or mutations in this foundation. Internal reads/writes also recheck identity/ownership. Invalid business requests consume budget; rejected argument schemas are handled before the action handler and remain subject to future platform/gateway abuse controls. Anonymous login/bot protection, provider endpoints, token verification and internal visibility over actual transport remain release checks.

Course listing is currently a bounded first page. Pagination is required before integrating workspaces with more than 50 courses per semester. Tasks and meetings paginate using server-owned indexes, with at most 50 results and 100 rows read per request. Updates keep IDs and check both current-record and destination-course ownership. Task times must be canonical UTC ISO strings between 2000 and 2100. Reminder offsets are null or an integer from 0 to 365 days; storing an offset does not schedule or send email.

Course deletion currently refuses any linked task or meeting rather than leaving orphan records. Complete cascade/deletion recovery, notes/resources/folders, private storage, exports, reminders and account deletion remain integration work. There are no HTTP routes or webhooks yet. Mock tests do not prove production rate limiting, CORS, sessions, backups or transport isolation.

Create calls without an ID are unsafe to retry automatically: a repeated successful request creates another record. Updates use an existing server ID. These older per-record APIs are not used by the new academic UI synchronization. The academic snapshot API preserves local IDs and has revision checks and idempotent request handling. Do not mix the two storage models.

## Verification

`npm.cmd run check:server` checks server types; `npm.cmd run test:server` uses the official convex-test mock in an edge-like runtime. Tests cover unauthenticated/profile gates, identity-derived owner fields, cross-user access, field tampering, bounded responses, input rules, budgets and reset behavior. The test-only module-root hint supports offline use without deployment-generated files; it does not replace production code generation.

Sources: [Convex Clerk integration](https://docs.convex.dev/auth/clerk), [verified identity](https://docs.convex.dev/auth/functions-auth), [actions](https://docs.convex.dev/functions/actions), [validators](https://docs.convex.dev/functions/validation), [convex-test](https://docs.convex.dev/testing/convex-test).

## Academic snapshot endpoints

academic:get authenticates and consumes the shared 60/min read budget, returns only this owner's revision and bounded data. academic:save consumes the shared 20/min write budget, accepts exact revision/requestId/data and rechecks identity/profile/validation internally. Stale revisions fail atomically. Retry-safe reviewed import preserves local IDs; the older per-record foundation APIs do not populate this UI store. Notes/resources/files are excluded. Sync choice, draft and pending request are account-scoped local metadata. Latest data is read on reopening; live subscriptions are not implemented.

## Vercel hosting target

React/Vite stays; GitHub remains the source host. vercel.json prepares npm run build, dist output, SPA routes and baseline headers. Configure a free personal Hobby project only when deployment is authorized. Set public VITE_CLERK_PUBLISHABLE_KEY and VITE_CONVEX_URL to the appropriate environment, keep server secrets in Convex, and configure production Clerk domains/callbacks before release. Verify the actual deployed HTTPS/CSP/headers and route reloads. No Vercel project or public deployment was created here. Official references: https://vercel.com/docs/frameworks/frontend/vite and https://vercel.com/docs/plans/hobby.
