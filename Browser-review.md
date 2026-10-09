# Local preview review — 2026-10-09

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

## Remaining limitations

All personal preview records remain in memory and reset on refresh. Authentication, Convex persistence, student profiles, server validation/access/rate limits, private attachments, block editing, PDF extraction, email reminders, ZIP export, and account deletion are unfinished. No production release or security audit is claimed. Course/task/meeting edit flows beyond the current creation/deletion controls remain unfinished. Automated lint and axe checks are not configured.
