# Architecture

Frontend follow-ups, 2026-10-13: normalized BrowserRouter basename handles /student-dashboard with or without a trailing slash. Root SignIn uses hash routing; legacy dedicated auth routes remain. Unknown app routes render local 404. SmoothScroll observes open dialogs to pause Lenis; native nested scrollers use data-lenis-prevent and overscroll containment. SchoolCalendarPdfs lazy-loads existing PDF.js to render bundled public FCU PDF pages; no new third-party viewer or personal-data extraction. ClassNow owns its ticking state independently of workspace persistence, with pure Asia/Taipei current-class matching. Support success dialogs open only after the action resolves and preserve failure drafts.

Reminder implementation, 2026-10-13: convex/reminders.ts maintains owner-scoped jobs and atomic scheduling when academic snapshots or foundation tasks change. Internal actions claim jobs with generation/lease checks, obtain the recipient from the private server profile, and submit plain-text bilingual email through Resend from reminder@eljhon.me. Separate transactional caps: 10 attempts/day and 200/month per owner, 50/day and 1,000/month per deployment. Pending jobs are cancelled on synced removal/completion/opt-out. Stable idempotency keys and frozen recipient/content protect up to three attempts within 23 hours; a watchdog handles crashed actions. Provider failures/limits can stop delivery. Zero-day reminders allow up to 15 minutes of scheduler delay. No new public send endpoint. Existing opted-in snapshots are scheduled on their next save; no retroactive migration sends emails during deployment.

Support email update, 2026-10-10: the internal quota reservation returns only the six allowlisted student-profile fields from the authenticated owner's record. The action composes student details server-side, attaches retained PNG/diagnostics, and includes diagnostics inline. Client-supplied profile fields remain rejected.

Support addition, 2026-10-10: src/Support.tsx provides ContactPage and BugReporter; src/support-data.ts validates bounded submissions and records safe in-memory diagnostic categories. convex/support.ts is the authenticated, profile-gated Resend action, with exact validators, shared write limits, separate transactional daily/monthly supportBudgets and a fixed recipient. RESEND_API_KEY exists only in the Convex server environment. No report content or screenshot is stored in Convex. See docs/Support-setup.md for privacy, retry and sender details.

Latest hosting state, 2026-10-10: Vercel Hobby project coursedock is connected to student-dashboard. The codex/beta-preview branch uses development Clerk/Convex public identifiers in Preview only, with All Deployments authentication protection. Main remains the production tracking branch; no production environment values or backend migration were installed. The verified preview preserves /student-dashboard/ routes. Portfolio proxy routing is still pending; detailed build/login evidence is in docs/Beta-deployment.md.

Updated: 2026-10-10, Asia/Taipei. Current local implementation and intended account architecture are distinguished below.

Beta configuration in progress: production builds use Vite base /student-dashboard/ and React Router uses the matching basename. Clerk redirects include this prefix exactly once; router callbacks reject external or out-of-app redirects. Sign-out returns to the prefixed sign-in page. Development remains at /. Production Clerk instance: ins_3KUL5t6nQ81c6DVQamuN4h3k56i, domain eljhon.me, issuer https://clerk.eljhon.me. Production Convex: cheery-dachshund-214, with AUTH_JWT_ISSUER configured. Functions have passed a deployment dry run but are not yet installed there. Production OAuth credentials, JWT template verification, Vercel project, portfolio path rewrite and live session checks remain pending. Do not replace local development credentials with production configuration.

## Stack and source layout

React 19, TypeScript 5, Vite 8, plain CSS, self-hosted Geist, lucide-react icons, IndexedDB through idb, PDF.js local worker. Node 24 and npm with package-lock.json. Static frontend target: Vercel; source: GitHub. The free Convex development project and Clerk development app are configured. The first reviewed course/planner sync slice is connected; notes/resources/files remain local.

- src/main.tsx: workspace state, navigation, forms, course pages and loader.
- src/domain.ts: records and pure domain validation; domain tests alongside source.
- src/storage.ts: version-1 browser workspace and resource blobs, keyed by account and deployment.
- src/LocalWorkspace.tsx: account-bound storage context and reviewed legacy import.
- src/Interface.tsx: shared dropdown/select, upload, loading, error components.
- src/ResourceLibrary.tsx: resource files, links and folder hierarchy.
- src/TaskViews.tsx: projections of the same deadline records.
- src/NoteEditor.tsx and note-content.ts: rich notes, imports and safe local media.
- src/DataExport.tsx and export.ts: complete browser ZIP export.
- src/AccountPanel.tsx: app-wide Clerk/Convex providers, sign-in/sign-up routes, required profile gate, Settings editor and sidebar profile popup.
- convex/: private profile/course/planner schema and actions, offline security tests and issuer configuration.
- src/PdfImport.tsx and pdf-parser.ts: lazy local timetable parsing and review.
- src/Legal.tsx: bilingual preview notices.
- src/interface.css: final interface overrides after existing stylesheets.

## Current persistence

IndexedDB database fcu-study-workspace has workspace and files stores. Account records use [account, deployment URL plus Clerk ID] keys; file keys also include the file ID. Storage methods close over that account so asynchronous uploads/deletions cannot switch to another namespace after logout. This is local separation, not a trusted server identity or encryption. The old current workspace and unscoped files remain intact. Review shows record counts and requires an ownership checkbox before atomic copying of all referenced files and records. Import requires an empty target, rolls back on missing/oversized files or quota failure, and records one transactionally enforced legacy claim. Other accounts cannot claim it afterward. Starting empty leaves the old data untouched; Settings can review it later while unclaimed. Quota counts only the current account and subtracts replaced bytes. Hydrate before rendering/saving, so empty initial state cannot overwrite existing records. Unsupported records show recovery. Save failures remain visible. Do not store tokens in persistent browser storage. Interface language/theme preferences remain device-wide. Simultaneous editing tabs are not coordinated; this preview is not a cloud service.

Semesters group courses. Notes, tasks and meetings reference courses. Resources optionally reference courses/folders; folders have parentId and optional courseId. Folder traversal guards cycles and moves exclude descendants. Current course, folder, course tab, language, theme and sidebar state persist. An interface-preferences record in the workspace store lets unsigned visitors choose language/theme without altering academic records. Hydration applies these preferences before mounting the account UI and merges them into workspace appearance after sign-in. Clerk UI receives stable provider appearance and explicit component appearance; changing the language on an unsigned sign-in/sign-up page first persists preferences, then reloads that account page so the managed UI initializes with the correct locale. Onboarding and signed-in workspace language changes stay within React. Theme changes remain immediate. New metadata must be optional or migrated without losing old data.

For block notes, store canonical block JSON plus a Markdown body for export/legacy compatibility. Preserve old bodies when migrating. Uploaded note PDFs remain attachments. Reuse file validation/quota infrastructure; revoke object URLs and remove orphaned blobs when owners are deleted. ZIP exports preserve record IDs and relationships, include Markdown and attachments, and fail visibly if any expected file is missing.

Implemented with lazy-loaded BlockNote 0.55 and Mantine UI, plus fflate for ZIP. Legacy bodies become editable blocks on open and are preserved until editing. Store serialized blocks, Markdown copies, original imports and optional attachment metadata. Images reference local file IDs; resolve them to revocable blob URLs. Imported remote media is not fetched; unsafe links are stripped. Markdown is UTF-8, capped at 1 MiB; note block JSON at 2 MiB. PDF/image bytes count toward the existing quota. Note/course deletion removes related note files. This preview's record/file deletions are separate transactions; fully retryable deletion remains a backend release requirement.

ZIP includes records.json, manifest.json, note Markdown, original imported Markdown and original file bytes. Deduplicate file IDs, sanitize filenames and remap note image links to ZIP-relative paths. Missing files fail the export. Bounds: 20 MiB record JSON, 200 MiB total processing budget and 10,000 referenced files/notes. ZIP generation currently runs in the browser; larger exports require performance validation before release.

## PDF and calendar

Local PDF.js extraction supports the supplied one-page MyFCU grid. The sample yields 13 meetings in 12 courses. Chinese extraction works; earlier garbling was terminal encoding. Source PDF is only used during import and is not retained. Limit 10 MiB, one page, text/pixel counts and processing time. Group adjacent identical cells; use explicit period times. Credits/codes require manual completion. Unsupported layouts/scans fail; no remote OCR/paid service.

Public school calendar ID: pun6cvita92hpjvgekbjukbhnk@group.calendar.google.com. Embed inside the app with Asia/Taipei and selected language. No subscription, OAuth, event ingestion or two-way sync. Google controls availability and its embedded content.

## Development accounts and planned academic synchronization

Convex is authoritative for signed-in users. Resolve identity from verified server auth context; never trust browser userId, ownerId, role or school email. Every public read/write/action and related-record reference must enforce ownership and bounded input/output validators. Convex has no SQL RLS toggle: ownership checks implement row isolation. Direct storage URLs are bearer-accessible; private downloads need authenticated owner-checked serving.

Require student profile completion before opening the workspace and before server academic operations. React Router hosts /sign-in/* and /sign-up/*. Unauthenticated visits redirect to sign-in. After Convex confirms the session, read the private profile; missing profiles redirect to /onboarding. Render no workspace while identity/profile is loading, missing or failed. Only a successful server profile save opens the workspace. Key the profile gate by identity. Successful sign-in and completed onboarding enter /dashboard, select Overview and normalize the URL to /. Ordinary reload retains the saved page. Reload browser records when the workspace remounts, so logging out/in cannot overwrite them with a stale initial snapshot. Managed provider owns passwords, OAuth, reset codes and session recovery. No privileged app role is currently needed. Require MFA on infrastructure/provider administrators, and on privileged app actions if introduced. Provider keys/issuer settings require configured projects; no secrets enter the frontend.

Current backend foundation: convex/schema.ts defines profiles, courses, tasks, meetings and transactional rate buckets. Public actions authenticate then consume shared per-identity read/write budgets (60/20 per minute); business reads/writes are internal and recheck identity/profile/ownership. Exact argument/return validators exclude owner tampering and internal response fields. Tasks/meetings paginate at 1–50 results and check linked courses on reads/writes/deletion. Task dates use canonical UTC; reminder offsets are stored preferences without delivery. Course deletion refuses linked tasks/meetings until complete cascade exists. Courses list is capped at 50 per request without pagination. Automatic create retries are unsafe; idempotent migration remains required. auth.config.ts uses the configured HTTPS Clerk issuer and Convex audience. The development deployment is friendly-reindeer-145; only public identifiers enter the ignored frontend environment file. The app-wide boundary loads ClerkProvider/ConvexProviderWithClerk and waits for Convex authentication before reading the five-input profile with a server-generated school email. Local academic data is never uploaded automatically. Official convex-test mock covers ownership and budgets, not real token verification/transport. See docs/Cloud-setup.md for the endpoint inventory and setup prerequisites.

Inventory all queries, subscriptions, mutations, actions, HTTP/file/auth routes and enforce budgets on each. Resolve read/subscription throttling explicitly; mutation-only limits are insufficient. Lock application-owned CORS to configured origins, with authentication independent of Origin. Serve deployed security headers through Vercel; verify actual responses.

Reminder jobs run on the backend with idempotency, cancellation, bounded retries and school-email destination. Default offset: one day. Recheck ownership and current record status before sending. Sender reminder@eljhon.me via recommended Resend Free; DNS records resolve, but domain approval/delivery have not been verified. API keys stay server-side. Verify introduced webhook signatures and replay behavior.

## Operations still to configure

The development cloud service is connected for accounts/student profiles and opt-in course/planner snapshots; notes/resources/files remain local. No production frontend deployment was performed in this work. Establish free-tier budgets, auth linking/reset behavior, private uploads and concurrency quotas, ZIP export bounds, retryable account deletion, encrypted backups/retention and a restore drill. Production legal operator/contact and final origin remain unspecified. Implementation evidence belongs in Memory.md; release gates are in Rules.md.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)

## Student profile input contract, 2026-10-10

`src/StudentProfileForm.tsx` supplies five inputs. `src/student-profile.ts` shares bounded normalization between form and server; `convex/profiles.ts` always validates again. The exact public input schema excludes schoolEmail and owner. Every successful save stores a derived lowercase school email and canonical Taiwan mobile number atomically, including when studentId changes. Existing profiles are preserved until edited; no bulk rewrite of private records was performed. The stored/returned profile still has six fields. Department names come from the checked static snapshot in `src/fcu-programs.ts`; custom names are accepted under the same server length bounds. See [directory provenance](docs/FCU-programs.md).

## Academic synchronization and Vercel, 2026-10-10

User's portfolio now runs on Vercel Hobby at https://eljhon.me/ (separate project junhao-luo); www redirects to the apex. Intended CourseDock public location is https://eljhon.me/student-dashboard. The current CourseDock build still targets the root path: its Vite asset base, router/auth paths and portfolio proxy rewrite must be configured and tested before publishing there. Portfolio migration is complete; student app release remains pending. See docs/Portfolio-migration.md for verified routing and rollback.

Frontend hosting target is Vercel Hobby, source remains GitHub, backend remains Convex and auth remains Clerk. vercel.json defines Vite build/output, SPA route fallback and baseline headers. Production CSP/origin/HSTS/auth callbacks must still be verified on the actual deployment. No public deployment occurred.

The first academic UI sync uses an owner-private bounded academicWorkspaces snapshot (semesters/courses/tasks/meetings) with original local IDs. It is independent of the older per-record courses/tasks/meetings foundation APIs; those remain isolated but are not authoritative for this UI. Both public academic actions authenticate and share the 60-read/20-write budgets. Internal functions recheck profile/owner; exact schemas, ID uniqueness, linked-course existence, counts and payload bounds are enforced. Limit: 30 semesters, 100 courses, 1000 tasks and 1000 meetings; 400000 JSON characters. Upgrade to paginated per-record synchronization if this personal-use bound is exceeded.

Atomic revision compare-and-swap rejects stale writes. A repeated last request with the same payload/base revision returns the original result; reusing its ID with another payload fails. An older replay after intervening writes fails safely. Serialized client saves skip interface-only changes, keep local drafts and persist pending requests before transport. Failure stops further cloud writes until review; subsequent local edits remain in the local draft. Retry first replays the pending request, then uploads the reviewed latest draft at the returned revision. Newer server revisions refuse overwrite. Reviewed imports require confirmation and preserve a before-cloud local backup; they never upload notes/files. Device-local sync choice is separate metadata. Other devices fetch updates on workspace reopen/reload, not a live subscription. Notes/resources/files still need their own cloud phase.

## Student ID format — 2026-10-13

The shared normalizeStudentProfile validator enforces /^[DMP][0-9]{7}$/ on every server save and in the form; the HTML input mirrors that rule with eight-character bounds. Existing records are not migrated or deleted.

## Empty timetable import — 2026-10-13

If the selected semester has no existing class meetings, skip the merge/replace selector and its explanation. Keep editable review and save; use non-destructive import. When that semester already has meetings, keep both modes. Meetings in other semesters do not trigger the choice. Browser fixture using the supplied PDF verified both paths and mock save modes; no real records were saved. Student-ID native validation and mock save also passed.

## Academic feature handoff — 2026-10-13

Optional course type/task status/description extend private academic schemas with backward compatibility. Local task attachments are excluded from cloud snapshots and restored by ID on reload. Shared local file actions use bounded Office ZIP/XML content previews and blob PDF viewing. See handoff.md for exact implementation and remaining verification.
