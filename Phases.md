# Delivery plan

Updated: 2026-10-09, Asia/Taipei. Local development is authorized. All six capability areas must launch together; a preview is not the release.

## Completed local foundation

- React/TypeScript/Vite app, light/dark and English/Traditional Chinese.
- Semester courses, course notes using plain Markdown, assignments/exams and deadline projections, manual weekly classes.
- Supported MyFCU sample import with correction, merge/replace and safe failure.
- Resource links/files, grouping, date sorting, renaming, nested folders/moves/downloads.
- Refresh-safe IndexedDB records/files and selection/preferences.
- In-app school calendar, loading/recovery states, draft legal documents.
- Edge-to-edge shell, stable sidebar/mobile drawer, unified dropdown rows and state arrows.

Evidence recorded in Memory.md and Browser-review.md. Latest foundation: nine focused tests and successful production build. Browser checks have been scoped to each change; they are not a production security audit.

## 1. Notes and portable data — next local slice

Implement accepted rich blocks, Markdown import, upload-only note PDFs, images, accessible reorder, legacy-note migration and persistence. Implement ZIP export of records/blocks/Markdown/original files, preserving relationships and exposing missing-file failures. Verify in a disposable browser, including refresh, both languages/themes, mobile, hostile links/content, and ZIP contents. Do not silently discard original note bodies or attachments.

## 2. Managed authentication and private Convex records

Select/configure a free provider supporting Google, GitHub, passwords and email-code reset; complete all signup profiles. Connect Convex using verified identity, strict schemas, ownership checks, bounded responses and endpoint budgets. Migrate local data only through an explicit authenticated import/review; never implicitly share a device's workspace between accounts. Verify two users, forged identity, field and relationship tampering, sessions/revocation and network recovery. Requires configured provider/Convex projects and safe environment setup.

## 3. Private attachments and export/deletion

Move signed-in files to private owner-checked serving. Enforce allowlist and 10 MiB/file, 100 MiB/user under concurrent uploads, processing and failure. Clean orphan files. Keep export complete/bounded. Add retryable account deletion of auth account, files, records and scheduled reminders, with explicit scope/confirmation and backup retention. Local reset is not account deletion. Test unauthorized byte retrieval, incomplete deletion recovery and export relationships.

## 4. Reminders

Verify Resend domain and actual school-mail delivery. Add server-only sender credentials, scheduler, custom offsets/default one day, idempotency/backoff, cancellation, minimal email content, visible delivery state and tested provider webhook signatures where introduced. Keep paid overages disabled. DNS resolution alone is not proof of delivery.

## 5. Release security and operation

Complete every applicable S01–S24 control in Rules.md with executable evidence. Configure free usage budgets, dependency/secret scans, deployed HTTPS/headers/origins, bot/login protections, infrastructure admin MFA, private encrypted backups and an isolated restore test. Replace preview notices with accurate production operator/contact/processors/retention. Verify all six areas with five private accounts, supported devices and keyboards.

## 6. Deployment and handoff

Prepare static Cloudflare build/routing/headers, GitHub source workflow and Convex environment separation. Test direct navigation/reload, multi-device sync and failure recovery. Push/publish only within explicit authorization. Do not claim production readiness while applicable gates remain unresolved.

## Pending decisions and setup

Final app name; configured auth/Convex projects; production origin; operator/privacy contact; free-tier fail-closed policy; backup schedule/retention. No deadline, school-email verification, alternating weeks, or school-account connection is required.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)
