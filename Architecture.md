# Architecture

Updated: 2026-10-09, Asia/Taipei. Current local implementation and intended account architecture are distinguished below.

## Stack and source layout

React 19, TypeScript 5, Vite 8, plain CSS, self-hosted Geist, lucide-react icons, IndexedDB through idb, PDF.js local worker. Node 24 and npm with package-lock.json. Static frontend target: Cloudflare Pages; source: GitHub. Convex is the selected future backend. Managed authentication provider is not yet configured; Clerk is the candidate under review.

- src/main.tsx: workspace state, navigation, forms, course pages and loader.
- src/domain.ts: records and pure domain validation; domain tests alongside source.
- src/storage.ts: version-1 browser workspace and resource blobs.
- src/Interface.tsx: shared dropdown/select, upload, loading, error components.
- src/ResourceLibrary.tsx: resource files, links and folder hierarchy.
- src/TaskViews.tsx: projections of the same deadline records.
- src/PdfImport.tsx and pdf-parser.ts: lazy local timetable parsing and review.
- src/Legal.tsx: bilingual preview notices.
- src/interface.css: final interface overrides after existing stylesheets.

## Current persistence

IndexedDB database fcu-study-workspace has workspace and files stores. Hydrate before rendering/saving, so empty initial state cannot overwrite existing records. Unsupported records show recovery. Save failures remain visible. Do not store tokens in persistent browser storage. Simultaneous editing tabs are not coordinated; this preview is not a cloud service.

Semesters group courses. Notes, tasks and meetings reference courses. Resources optionally reference courses/folders; folders have parentId and optional courseId. Folder traversal guards cycles and moves exclude descendants. Current course, folder, course tab, language, theme and sidebar state persist. New metadata must be optional or migrated without losing old data.

For block notes, store canonical block JSON plus a Markdown body for export/legacy compatibility. Preserve old bodies when migrating. Uploaded note PDFs remain attachments. Reuse file validation/quota infrastructure; revoke object URLs and remove orphaned blobs when owners are deleted. ZIP exports preserve record IDs and relationships, include Markdown and attachments, and fail visibly if any expected file is missing.

## PDF and calendar

Local PDF.js extraction supports the supplied one-page MyFCU grid. The sample yields 13 meetings in 12 courses. Chinese extraction works; earlier garbling was terminal encoding. Source PDF is only used during import and is not retained. Limit 10 MiB, one page, text/pixel counts and processing time. Group adjacent identical cells; use explicit period times. Credits/codes require manual completion. Unsupported layouts/scans fail; no remote OCR/paid service.

Public school calendar ID: pun6cvita92hpjvgekbjukbhnk@group.calendar.google.com. Embed inside the app with Asia/Taipei and selected language. No subscription, OAuth, event ingestion or two-way sync. Google controls availability and its embedded content.

## Planned private backend

Convex is authoritative for signed-in users. Resolve identity from verified server auth context; never trust browser userId, ownerId, role or school email. Every public read/write/action and related-record reference must enforce ownership and bounded input/output validators. Convex has no SQL RLS toggle: ownership checks implement row isolation. Direct storage URLs are bearer-accessible; private downloads need authenticated owner-checked serving.

Require student profile completion before academic operations. Managed provider owns passwords, OAuth, reset codes and session recovery. No privileged app role is currently needed. Require MFA on infrastructure/provider administrators, and on privileged app actions if introduced. Provider keys/issuer settings require configured projects; no secrets enter the frontend.

Inventory all queries, subscriptions, mutations, actions, HTTP/file/auth routes and enforce budgets on each. Resolve read/subscription throttling explicitly; mutation-only limits are insufficient. Lock application-owned CORS to configured origins, with authentication independent of Origin. Serve deployed security headers through Cloudflare Pages; verify actual responses.

Reminder jobs run on the backend with idempotency, cancellation, bounded retries and school-email destination. Default offset: one day. Recheck ownership and current record status before sending. Sender reminder@eljhon.me via recommended Resend Free; DNS records resolve, but domain approval/delivery have not been verified. API keys stay server-side. Verify introduced webhook signatures and replay behavior.

## Operations still to configure

No production deployment or cloud data service is connected. Establish free-tier budgets, auth linking/reset behavior, private uploads and concurrency quotas, ZIP export bounds, retryable account deletion, encrypted backups/retention and a restore drill. Production legal operator/contact and final origin remain unspecified. Implementation evidence belongs in Memory.md; release gates are in Rules.md.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)
