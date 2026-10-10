# Local preview review — 2026-10-09

## Current notes and planner checks

`notes-check.js` passed legacy-note migration, Markdown headings/checklist/table/code import, append behavior, PDF attachment, title/content refresh, keyboard reorder, ZIP download, invalid PDF rejection and 320/768/1440px overflow checks. Inspection of the downloaded ZIP confirmed canonical blocks, original Markdown and original PDF bytes. Pure tests additionally cover image path remapping and sanitized archive paths.

`image-check.js` passed PNG recovery after refresh, Traditional Chinese, dark appearance and matching editor surface tokens. An independent IndexedDB assertion confirmed that note deletion left zero notes and zero attachment blobs in the disposable workspace. `planner-edit-check.js` passed Taiwan-time prefill/edit, ID/completion preservation, class time/room edits and refresh without duplicates. Latest console entries contain no application errors. Editor drag gestures, large exports and screen-reader behavior remain unverified.

Fourteen frontend/domain tests and seven Convex mock-runtime security tests pass. Production build and server type checking pass. The build warns about client-library directives and large lazy chunks. No live account/cloud security claim is made. Existing browser scripts below describe earlier iterations; they were not all repeated for this slice.

## Latest workspace feature checks

The approved Notion-inspired proposal is now applied. Dropdowns sit directly on course/resource menu buttons. The outer card is removed; the sidebar stays at viewport y=0 during page scrolling, in both themes. Workspace tests passed nested folder creation, upload into a subfolder, rename/move, descendant-move exclusion, refresh recovery, sidebar collapse, quick exam type, course notes, deadline calendar, menu note navigation, and course resource links. All seven screens were checked at 320/768/1024/1440 px with no horizontal document overflow. Current screenshots use disposable synthetic data. Nine domain/parser/folder tests pass.

## Latest reference-led revision

The current preview uses the user's three supplied productivity references: gray shell, white surfaces, soft borders, and pastel courses. Anthropic frontend-design was installed and applied with the existing design skills. Current screenshots use synthetic study records.

`browser-check.js` passed course/note/credit/deadline/manual meeting flows, resource drag-and-drop, rename/group/date controls, preserved download extension, refresh recovery, theme/language recovery, keyboard menu dismissal, legal dialogs, and all seven views at 320/768/1024/1440 px. `loading-check.js` passed the skeleton-to-spinner transition at three seconds, storage/render error pages, retry, and preservation of saved courses. Deliberate render errors log details to developer tools, while the user-facing page shows a generic recovery message.

The supplied MyFCU PDF imported 13 meetings across 12 courses. Editable review, merge without exact duplicates, replace, repeated selection, and refresh passed. Chinese text is readable; earlier garbling was terminal encoding. Unsupported PDF layouts and scans remain outside this parser's supported scope. No production accounts, server security, or cloud-sync claim is made.

Earlier review notes below describe previous preview iterations; the latest implementation above supersedes refresh-reset and unimplemented-import findings.

Preview: http://127.0.0.1:5180. Checks use synthetic records in a disposable Playwright browser.

## Checked behavior

Created a course, exam, weekly meeting, note, resource link, and semester. Marked an exam complete. Rejected a JavaScript resource URL. Closed a modal with Escape. Verified navigation and absence of document overflow on all seven screens at 320, 768, 1024, and 1440 pixels, in English/Traditional Chinese and light/dark appearances. No application page errors occurred in this run.

The school calendar is embedded in the app. Its frame displayed 逢甲大學-基礎行事曆 and Taiwan Standard Time. The calendar's current agenda contained no visible upcoming events; this does not prove the university has published current-year entries. Embedded Google controls retain Google's appearance and may include an optional subscription button. Personal records are not sent to the calendar frame.

## Visual changes and findings

Replaced equal metric cards with a compact semester summary. Added a dated daily agenda alongside upcoming deadlines. Navigation, course entries, and document controls retain familiar behavior. Self-hosted Geist handles Latin text; system fallbacks cover Chinese. Mobile navigation wraps instead of hiding sections horizontally. Completed deadlines now receive accurate empty-state text.

Computed token contrast on white: primary text 13.90:1, secondary text 5.94:1, accent 7.83:1. On dark surface #172638: primary text 13.13:1, secondary text 8.21:1, accent 7.83:1. These cover the listed tokens, not every possible state or the third-party iframe. Controls have visible keyboard focus and reduced-motion behavior. A complete WCAG or screen-reader audit is outstanding.

Applied project-local taste-skill contextual redesign guidance, global high-end-visual-design typography/material/motion guidance, and project-local apple-design foundations. The academic utility requires readable, compact views; marketing-page section sizes and cinematic effects were not applied. This is a web app, so native Apple menu-bar and material conventions are not requirements.

SlopMonster editorial review replaced slogans with action-oriented labels in both languages. Its English checker returned 5/5 before and after; human review still found unnecessary wording. No authenticated alternative model-family CLI was available for the second editorial pass.

## Archived limitations from the initial preview

All personal preview records remain in memory and reset on refresh. Authentication, Convex persistence, student profiles, server validation/access/rate limits, private attachments, block editing, PDF extraction, email reminders, ZIP export, and account deletion are unfinished. No production release or security audit is claimed. Course/task/meeting edit flows beyond the current creation/deletion controls remain unfinished. Automated lint and axe checks are not configured.

## 2026-10-10 account/mobile review

- Mobile drawer: compact rows, 320/390/430/768, dropdown use, focus trap/return, Escape/outside, short-screen reachability and desktop resize passed before the account gate. Later real-session checks confirmed rows and overflow behavior.
- Anonymous auth pages: five widths through 1440, separate sign-in/sign-up routes, Google/GitHub buttons, refresh, legal dialog and rejection of unsigned dashboard/onboarding passed.
- Live Google session: private profile read after refresh; Edit profile; popup bounds/Escape; logout; sign back in from a saved Settings page opens Overview. No profile values copied into reports.
- New-account onboarding, password recovery, GitHub login, real two-user transport tests and physical Safari remain pending. Academic records are still browser-local.

## 2026-10-10 — Account-local workspace and reviewed import

Synthetic disposable browser checks passed record/file separation, delayed uploads, quota concurrency/replacement, explicit legacy import with atomic rollback and single claim. Bilingual review component passed at 320/390/768/1440, ownership gating, missing-file error and successful import. Scoped ZIP export produced an archive. Actual signed-in app reload and Settings smoke check passed; no real records were copied. Local namespaces are not server authorization/encryption. Cloud sync and real two-user server verification remain pending.
