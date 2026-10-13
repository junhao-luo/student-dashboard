# Resume update — 2026-10-13

The deferred checks below have now been performed. Cloud attachment retention, legacy field clearing, nested folder moves/deletion, downloads/renaming, Office slide order/images and XLSX values, error fallback, focus and 320–1440px/Chinese-dark layouts passed. Busy-operation/unmount guards and privacy copy were added. Work stays on the feature branch; public beta is unchanged. Office previews retain the documented content-layout limitation; physical Safari remains unverified. See Memory.md for final build/commit evidence. The earlier handoff below is retained as implementation history.

# CourseDock handoff — 2026-10-13, Asia/Taipei

## Resume instruction

Continue the course/resource/assignment features below. The user is nearly out of usage and requested: stop testing now, save progress, push what is done, and perform remaining tests next time. Do not restart discovery. Read the six root docs, AGENTS.md, and this file. Use `rtk` for shell commands. Preserve unrelated local edits. No new subagents unless explicitly authorized.

## Git and deployment

- Feature branch: `codex/academic-workspace-features`, based on public main `674a1cb7732122792eaab6575517b1ce77bcada0` (PR #13).
- GitHub: `junhao-luo/student-dashboard`. Current work is pushed to this feature branch at wrap-up. It is **not merged into main or deployed to the public beta**.
- Live beta remains https://eljhon.me/student-dashboard. Vercel production deploys main with coupled Convex/frontend builds; do not bypass that pipeline.
- Convex **development** `friendly-reindeer-145` successfully installed the additive schema/functions at 11:54:10 Taipei on October 13. Production `cheery-dachshund-214` was not changed by this feature work.
- Local Vite server was started on http://127.0.0.1:5180 (exec session 64672; check whether still running). Do not start a duplicate server blindly.

## Confirmed user requirements

1. Semester credit calculator includes **all courses**, totals split into **required (必修)** and **elective (選修)**.
2. Each course is its own resource folder; nested subfolders, uploads into the currently open folder, moves, renames and deletion. Open files, including PDF, preview and open in new tab. DOCX/PPTX need a browser preview.
3. Assignments/exams get **description/notes and attachments**.
4. Clicking a calendar assignment opens its detail popup without switching to All assignments.
5. Assignment lists are tables; replace completion checkbox with **Not started / In progress / Complete** dropdowns.

## Implementation saved

### Courses and task records

- `src/domain.ts`: optional `Course.courseType` (`required`/`elective`), optional `Task.status`/`description`/local `attachments`; `taskStatus`, `withTaskStatus`, `semesterCredits` helpers.
- Legacy course types are **unclassified**, rather than guessing required/elective. New course forms default to required; editing can set either type or leave legacy unclassified. Credit summary is on Overview and all-courses page.
- `done` remains for backward compatibility and reminders; new status updates always keep it consistent. Legacy completed tasks read as Complete; others read as Not started.
- `src/academic.ts`, `convex/academicValues.ts`, `convex/schema.ts`, `convex/tasks.ts`, `convex/courses.ts`: optional schema fields with strict allowed enums, description <=10,000 chars, server rejects status/done mismatch. No migration/deletion of old records.
- Task descriptions/status/course types synchronize in academic snapshots. Attachment bytes and metadata remain **device-local**: `academicData` strips attachments, `academic-storage` restores matching local task attachment references when loading cloud tasks.
- Latest cleanup sets optional fields explicitly in foundation mutations so omitted legacy edits clear stale optional fields. This last cleanup still needs final regression checks.

### Assignment UI

- `src/TaskTable.tsx`: semantic table, title opens details, three-state select, edit/delete.
- `src/TaskViews.tsx`: status filters, calendar click calls `onOpen` without changing view/course; table for other views.
- `src/TaskDetail.tsx`: native modal, description editing/save, status control, local attachments with shared upload validation and file actions. Up to 20 attachments per task. Close/Escape/focus restoration; busy upload prevents dismissal. Upload ref guards duplicate uploads and latest-props ref avoids overwriting status/notes changed during upload.
- `src/main.tsx`: course type form, task status/description form, new task opens details after save to add attachments, detail popup state. `removeTask` removes attachment blobs before record deletion; course deletion also removes task/note attachments. Resource folders/files are moved to General when their course is deleted.
- `src/export.ts` and `src/storage.ts`: include assignment attachments in ZIP export and legacy import.

### Resource explorer

- `src/resource-folders.ts`: virtual roots `course:<id>` and `general`; legacy root folders/resources map to their prior course. Moves update descendant course metadata and prevent cycles.
- `src/ResourceLibrary.tsx` rewritten as explorer: course-folder tiles at root, breadcrumbs, nested create/open/rename/move/delete, links/uploads at current location, date sorting, file rename/move/delete/preview/download. Folder deletion confirms and removes contents recursively, using existing atomic `removeFiles` for blobs.
- Resource sidebar uses course roots with subfolder hierarchy. Course page resources opens that course root; old separate resource form buttons removed from the visible flow, inline Add link here uses current folder.
- Latest upload-ref cleanup preserves newer resource list changes while file validation/storage awaits. Check concurrent folder deletion/navigation while upload is active next time.

### Local file preview

- `src/files.ts`: shared allowed file families and 10 MiB limit, signatures, Office archive required main part, refuses macros/path traversal, limits 2,000 entries / 8 MiB entry / 32 MiB expanded archive.
- `src/file-preview.ts`: parses DOCX paragraphs, PPTX slide text and embedded PNG/JPEG images, XLSX sheet cells into safe content pages; no external resource fetching or raw HTML rendering. XML entities/DOCTYPE/parser failures rejected; 100 pages and 400,000 text chars caps. Image URLs cached to avoid repeated image allocation.
- `src/FileActions.tsx`: preview modal, native local PDF iframe, images, Markdown, Office content; download original and open preview in new tab. Generated new-tab HTML escapes content and uses restrictive CSP. Blob URLs revoked after use/timeout.
- **Office previews are content previews, not exact Word/PowerPoint layout or editing.** Unsupported/oversized files show failure and permit original download. No external Office viewer gets private files.
- `vercel.json`: adds `blob:` to `frame-src` specifically for local PDF iframe. Other security headers unchanged.
- `src/interface.css`: credit strip, tables with isolated horizontal scroll, responsive explorer/modals, light/dark tokens.

## Evidence already obtained (before user stopped tests)

- 28 frontend tests +27 server/client tests passed; full `build:hosting` passed, frontend/backend types, audit zero vulnerabilities, static scanner zero findings. That full build occurred **before the last optional-field/upload-ref cleanup**; do not call the final tree fully verified yet.
- Browser fixture passed: credit totals 5/3/2, status In progress, calendar stays selected while popup opens, notes save, DOCX attachment/preview/new-tab, nested folders and upload, PPTX two-slide content preview, file move to another course, PDF local blob iframe, 390px document width without horizontal page overflow.
- Tests added: `src/academic-features.test.ts`, `src/export.test.ts`, `convex/security.test.ts`. They cover legacy totals/status, synchronization bounds/tampering, folder cycles/moves, malicious Office uploads, HTML escaping, and assignment ZIP inclusion.
- No real student profiles, academic records, email sends, or production deployment changed in tests. The supplied PDF was read locally in a disposable fixture, not sent externally.
- Graphify query failed because `graphify-out/graph.json` is absent. Direct source search was used; do not claim a refreshed graph.
- A native label locator in the browser fixture did not resolve the textarea; its visible textbox-role locator worked. No app change was needed for that test locator.

## Remaining next-prompt work

1. Run final typechecks/tests/build on current tree, review diff. Focus on latest optional-field clearing, status/reminder consistency, retaining local attachments through cloud reload, course deletion preserving resource folders, and deleting assignment blobs.
2. Add/verify a regression for `academic-storage` restoring local task attachments after cloud reload. Existing server/client tests are in `convex/academicStorage.test.ts` (not academic-client.test.ts).
3. Browser-check folder moves with nested contents, folder/file deletion, renamed-file download names, embedded Office images, XLSX/shared strings, missing/corrupt file errors, PDF/new-tab and keyboard focus. Verify 320/390/768/1440px plus dark/Chinese states. Physical iPhone/Safari is unverified.
4. Review resources async operations (upload vs delete/navigation) and attachment deletion persistence. Check generated Office previews stay bounded and do not fetch external relationships.
5. Improve Office fidelity only if needed; be honest about current content-preview limitations. PPTX currently orders slide parts numerically, which can differ from a presentation's custom slide order; consider following presentation relationships.
6. Review/update any existing legal/storage copy for task attachment locality and local preview flow.
7. Commit fixes and push the feature branch. If the user asks to publish, create/attach a PR, wait CI/preview, merge exact tested SHA and verify coupled production. Current request is to preserve/push progress, not replace the live beta before deferred tests.

## Local browser fixtures (ignored, present only in this workspace)

- `.playwright-cli/academic-features-preview.html` / `.tsx`: real components under a mocked Convex action client and local namespace `synthetic-academic-feature-check`.
- `.playwright-cli/academic-features-browser.js`: comprehensive browser checks, native labels/roles, mock data.
- `.playwright-cli/make-office-fixtures.cjs`: creates synthetic DOCX/PPTX.
- `.playwright-cli/academic-features-mobile.png`: screenshot proof (contains synthetic course/tasks plus a filename, not PDF contents).
- Playwright CLI session `coursedock-student-id` may still be open. Commands require escalation in this environment. Use the explicitly requested project-local Playwright CLI skill; do not submit credentials or change real records.

## Unrelated edits to preserve

Do not stage/reset/delete: AGENTS.md, docs/Beta-deployment.md, deleted edit-main.mjs/edit-planner.mjs/update-plan.mjs, image-check.js, notes-dark-preview.png, old untracked *-check.js helpers. They predate this feature work. Memory.md includes earlier legitimate deployment readback; preserve it.

## Skills used

Project-local Ponytail, incremental-implementation, frontend-ui-engineering, security-review, Playwright CLI; Graphify attempted but graph absent. Existing design/system controls were reused; no new package added. Official fflate archive documentation reviewed: https://github.com/101arrowz/fflate.
