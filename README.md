# CourseDock

A student planner for Feng Chia University. CourseDock is a working name and can be changed in Settings. This is a local development preview.

The app uses an edge-to-edge workspace with a stable scrolling sidebar. Courses & notes and Resources expand directly from their menu buttons. Course pages contain notes, deadlines, schedule, and resources; there is no notebooks database. The overview provides quick capture and recent notes. Deadlines have week/upcoming/calendar/all views and course/completion filters. Resource folders can contain subfolders, with icons, breadcrumbs, rename/move actions, and uploads into the current folder. Only empty folders can be deleted. Sidebar collapse, current folder, and course tab survive refresh. Use `workspace-check.js` and `workspace-review.js` with Playwright CLI for the latest feature checks in a fresh test browser.

Run `npm.cmd install`, then `npm.cmd run dev`. Open the address printed by the server. The current preview runs at http://127.0.0.1:5180/. Use the same address and browser profile to reopen your saved workspace.

Courses, Markdown notes, deadlines, weekly meetings, resource links and files, language, and appearance survive refresh using browser storage. Resources support course grouping, added-date sorting, renaming, and downloading. Files are limited to 10 MB each and 100 MB total on this device. Clearing site data removes the local workspace and files; retain separate copies of important work. This storage is not cross-device sync or account access protection.

The timetable importer reads the supplied one-page MyFCU grid locally. Review and edit extracted classes, then merge or replace the selected semester’s timetable. Exact duplicates are skipped. Other PDF layouts and scanned pages are unsupported. The source PDF is not saved. Course codes and credits must be completed separately. Both timetable and resource uploads accept drag and drop.

The interface includes English/Traditional Chinese, light/dark themes, styled dropdowns, a left-to-right skeleton for loads under three seconds, a spinner for longer loads, and error recovery pages. Footer links open the privacy policy, terms, and data-privacy notice. These notices describe the preview; operator details and production policies must be completed before public account services launch.

Run `npm.cmd test` for domain/parser checks and `npm.cmd run build` for type checking and a production build. `browser-check.js` is a Playwright CLI run-code script for a fresh test browser with synthetic data. `loading-check.js` verifies delayed loading and injected failures against the Vite preview. Personal PDF test artifacts stay outside Git.

Convex sync, managed authentication and required student profiles, server-side private uploads and security controls, block editing, email reminders, ZIP export, and account deletion remain unfinished. No deployment or release-security claim is made. All six capability areas must be ready before launch. Reminder delivery from `reminder@eljhon.me` remains pending verification.
