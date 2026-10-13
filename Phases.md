# Delivery plan

Approved release evidence, 2026-10-13: PR #6 merged as 487642f6936573bb058ed98911fefe9a57bc4524 after exact user approval. Vercel Production 6Dh3DXkvmBhuxCrf2854iRnyvPaY succeeded with coupled backend install; production anonymous/forged profile/academic checks deny access. Inbox reminder delivery remains unverified. Root hero, 404, scrolling, calendar PDFs, course navigation, clock and success-popup follow-ups are in the next release; final hosted evidence will be appended when installed.

Beta follow-up, 2026-10-13: local implementation adds bilingual creator/beta footer, workspace-first report capture, and scheduled opt-in task email reminders. Offline tests, source/bundle checks and full build pass; hosted installation, actual scheduled email delivery and user onboarding/session checks require separate evidence. Private notes/resources/files, account deletion, complete backup/restore and other security gaps remain unfinished. Do not mark the whole release checklist complete.

Support email update, 2026-10-10: implemented six server-derived reporter details for complaints, suggestions and bugs, plus inline/attached diagnostics and the retained screenshot. All 37 tests and hosting build/security gates pass. New tests verify two distinct profiles, all report types, forged-profile rejection and exact attachment contents. Backend/preview installation evidence follows in Memory.md.

Support slice, 2026-10-10: bilingual Contact support and floating beta report review implemented locally; tested support action installed on development. Sender domain verified and owner reports server key/mailbox setup. Trackpad interception fixed by excluding the modal from Lenis; Chromium wheel verification passes. 36 combined tests pass. Push/update of the protected Vercel preview is now explicitly requested. Actual inbox receipt and production sender configuration remain separate checks; this does not complete reminders or other public-release controls. See docs/Support-setup.md.

Security follow-up, 2026-10-10: all S01–S24 reviewed with evidence in docs/Security-review.md. Record caps/UTF-8 snapshot limit implemented on development, 32 tests pass, audit/static/history/live auth negatives pass. Security CI and Vercel build gates are prepared; guarded coupled Convex/frontend command needs scoped deploy-key setup before activation. One-concurrent-build Hobby and paid Skew Protection restrictions preserve the free requirement. Private files, account deletion, actual session/two-user isolation and encrypted restore still block public release.

Latest beta status, 2026-10-10: protected Vercel Preview is Ready at https://coursedock-rjv1v1ipb-junhao-luos-projects.vercel.app/student-dashboard/sign-in. Git access, project, development Preview configuration and branch deployment are complete. Sign-in/signup rendering, signup refresh and remembered theme pass; anonymous HTTP redirects to Vercel authentication. Hosted authenticated checks await user sign-in. Public portfolio routing and production release remain blocked by unfinished Rules.md controls. See docs/Beta-deployment.md for current evidence; earlier pending-setup entries below are historical.

Updated: 2026-10-10, Asia/Taipei. Local development, production configuration and beta publication at https://eljhon.me/student-dashboard are authorized. All six capability areas must launch together; a preview is not the release.

Current production setup: Clerk production instance created; five approved authentication CNAMEs saved in Namecheap. Google project coursedock-511204 and consent branding created, web-client form prepared. Social provider credential configuration still needs verification. Convex production issuer set and deployment dry run passed. Subpath routing test added; fifteen frontend tests, thirteen backend tests and build pass. Next configure JWT audience, OAuth credentials/testing users, Vercel repository access/project/environment and portfolio rewrite; then perform deployed authentication, reload, isolation, header, secret and remaining release checks before opening the beta.

## Completed local foundation

- React/TypeScript/Vite app, light/dark and English/Traditional Chinese.
- Semester courses, rich course notes with Markdown import, assignments/exams and deadline projections, manual weekly classes.
- Supported MyFCU sample import with correction, merge/replace and safe failure.
- Resource links/files, grouping, date sorting, renaming, nested folders/moves/downloads.
- Refresh-safe IndexedDB records/files and selection/preferences.
- In-app school calendar, loading/recovery states, draft legal documents.
- Edge-to-edge shell, stable sidebar/mobile drawer, unified dropdown rows and state arrows.

Evidence recorded in Memory.md and Browser-review.md. Latest foundation: fourteen application tests and thirteen server/client-sync tests and successful production build. Browser checks have been scoped to each change; they are not a production security audit.

## 1. Notes and portable data

Completed locally: accepted rich blocks, Markdown import, upload-only PDFs, local images, drag controls/keyboard reorder, legacy-note migration and persistence. ZIP export includes records/blocks/Markdown/original files, preserving relationships and refusing missing-file backups. Browser checks passed import/refresh, PDF/image bytes, keyboard reorder, English/light and Traditional Chinese/dark, mobile widths and note/file deletion. Pure ZIP tests verify relationships/bytes/path safety. Drag reorder is provided by the editor but its drag gesture has not been exercised. Large exports and real assistive technology remain release checks. Deadlines and class meetings can now be edited without creating duplicates or resetting completion.

## 2. Managed authentication and private Convex records

Select/configure a free provider supporting Google, GitHub, passwords and email-code reset; complete all signup profiles. Connect Convex using verified identity, strict schemas, ownership checks, bounded responses and endpoint budgets. Migrate local data only through an explicit authenticated import/review; never implicitly share a device's workspace between accounts. Verify two users, forged identity, field and relationship tampering, sessions/revocation and network recovery. Requires configured provider/Convex projects and safe environment setup.

Implemented foundation only: profiles/courses/tasks/meetings with gated actions, identity-derived owners, profile completion gate, strict validators, bounded responses and read/write budgets. Tasks/meetings paginate and verify linked course ownership. Course deletion refuses child records pending complete cascade. Free Clerk/Convex development projects, Google/GitHub/email-password configuration, separate sign-in/sign-up pages, an app-wide required-profile gate, Settings profile editor and sidebar account popup are connected. Real Google login/profile reload/logout, Overview redirect and landing-page theme carryover have been verified. The circular photo and initials fallback, English/Chinese landing controls and remembered light/dark mode are implemented. These server functions are installed on the development backend. End-to-end account/profile/recovery/session checks, notes/resources/files, notes/resources/files synchronization and full release verification remain work. This phase remains incomplete. Configuration checklist and endpoint inventory: docs/Cloud-setup.md.

Account-local prerequisite completed: records, files and export reads are bound to the signed-in account. Older shared data is preserved behind a reviewed, ownership-confirmed import into an empty account. Atomic import prevents duplicate claims and incomplete copies; local per-account quota writes are transactional. This does not provide server-side private files or cloud synchronization. Browser storage remains accessible to the device owner.

First phase-2 course/planner slice is implemented below. Next: real account/multi-device verification, conflict/backup recovery refinements and notes/resources/private-file synchronization. Do not auto-upload legacy data.

## 3. Private attachments and export/deletion

Move signed-in files to private owner-checked serving. Enforce allowlist and 10 MiB/file, 100 MiB/user under concurrent uploads, processing and failure. Clean orphan files. Keep export complete/bounded. Add retryable account deletion of auth account, files, records and scheduled reminders, with explicit scope/confirmation and backup retention. Local reset is not account deletion. Test unauthorized byte retrieval, incomplete deletion recovery and export relationships.

## 4. Reminders

Verify Resend domain and actual school-mail delivery. Add server-only sender credentials, scheduler, custom offsets/default one day, idempotency/backoff, cancellation, minimal email content, visible delivery state and tested provider webhook signatures where introduced. Keep paid overages disabled. DNS resolution alone is not proof of delivery.

## 5. Release security and operation

Complete every applicable S01–S24 control in Rules.md with executable evidence. Configure free usage budgets, dependency/secret scans, deployed HTTPS/headers/origins, bot/login protections, infrastructure admin MFA, private encrypted backups and an isolated restore test. Replace preview notices with accurate production operator/contact/processors/retention. Verify all six areas with five private accounts, supported devices and keyboards.

## 6. Deployment and handoff

Prepare static Vercel build/routing/headers, GitHub source workflow and Convex environment separation. Test direct navigation/reload, multi-device sync and failure recovery. Push/publish only within explicit authorization. Do not claim production readiness while applicable gates remain unresolved.

## Pending decisions and setup

Final app name; production origin; operator/privacy contact; free-tier fail-closed policy; backup schedule/retention. No deadline, school-email verification, alternating weeks, or school-account connection is required.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)

## Completed profile refinement, 2026-10-10

School email entry removed; backend derives/stores it on save and student-ID changes. Taiwan mobile format is enforced on both sides and normalized. Official FCU undergraduate/graduate dropdown includes search and custom fallback, with existing custom values preserved. Nine server tests, production build and synthetic browser form checks pass; updated functions installed on the authorized Convex development deployment. Real new-account onboarding remains a release check; synthetic form tests do not establish provider signup behavior.

## Academic slice completed and hosting changed, 2026-10-10

Vercel Hobby is the frontend target; GitHub remains source. Local vercel.json build/SPA/header configuration is prepared, without a Vercel project or public deployment. First course/planner sync slice is implemented on the development Convex backend: reviewed import, original IDs/relationships, owner-private bounded snapshot, serialized saves, revision conflict refusal and pending-request recovery. Other devices fetch account academic data on reopening. Notes/resources/files/reminders/deletion and full release checks remain unfinished. The UI snapshot does not use the older per-record foundation tables. Next slice: improve conflict resolution/backup recovery and wire notes/resources with authenticated private files; test real account transport and multiple devices.

## Student ID format — 2026-10-13

Student ID validation tightened in the shared client/server profile path and native form constraints. Regression checks cover all three prefixes, exact length, ASCII digits and failed-write preservation. Requested beta publication pending verification and CI.

## Empty timetable import — 2026-10-13

If the selected semester has no existing class meetings, skip the merge/replace selector and its explanation. Keep editable review and save; use non-destructive import. When that semester already has meetings, keep both modes. Meetings in other semesters do not trigger the choice. Browser fixture using the supplied PDF verified both paths and mock save modes; no real records were saved. Student-ID native validation and mock save also passed.

## Academic feature handoff — 2026-10-13

Feature implementation saved on codex/academic-workspace-features. Earlier build and 55 tests passed before final cleanup; user requested no more tests now. Next priority: remaining persistence/security/mobile/browser checks in handoff.md, then tested release if requested.

## Resumed verification — 2026-10-13

Completed the deferred feature verification. Added a cloud-reload regression preserving matching local task attachments while excluding them from uploads, plus legacy optional-field clearing checks. Fixed custom PowerPoint slide order and namespaced XLSX shared strings. Resource operations lock controls while busy; leaving a view during upload cancels the write/cleans its new blob, and attachment removal uses current task state. Updated privacy copy for local file previews and assignment details. Browser checks passed for credits/status/calendar details, descriptions/attachments, DOCX/PPTX/PDF opening and new tabs, nested folder move/delete, renamed downloads, embedded images, XLSX, safe error fallback, Escape/focus, 320/390/768/1440 and Chinese dark UI. Office previews remain content previews; exact original layout and physical Safari are unverified. No real records or emails changed. Work remains on codex/academic-workspace-features, without a main merge/public release. Final build readback below.
