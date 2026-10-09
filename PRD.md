# Product requirements

Updated: 2026-10-09, Asia/Taipei. This is the current specification; it replaces earlier discovery drafts.

## Purpose and scope

A private academic workspace for Feng Chia University students, initially the owner and four other users. Bring semester courses, course notes, assignments/exams, weekly classes, timetable PDF import, and educational resources into one browser app. All six areas must launch together. There is no deadline. CourseDock is an editable working name; the final name is undecided.

Manual entry is the default. No school-account connection, Moodle synchronization, Google Calendar OAuth, or alternating-week schedule is included. The university's public calendar appears inside the app. Desktop, tablet, and phone browsers are supported. Internet is required for the eventual account service; offline support is not a launch requirement.

## Confirmed requirements

- Free operation for five users. GitHub holds source, Cloudflare Pages hosts the frontend, Convex holds synchronized private records. Do not enable paid overages.
- Google, GitHub, and email/password authentication through a managed provider. Password reset uses an emailed verification code. Every signup requires 姓名, 學號, 系所, 班級, school email (student_id@o365.fcu.edu.tw), and contact number. No school-email verification is required. These fields never grant permissions.
- Every user's records and attachments are private. Export records, Markdown notes, and original attachments in a ZIP. Account deletion must remove provider account, records, files, and reminders; backup retention must be disclosed.
- English and Traditional Chinese in Settings; light and dark modes. Productive academic design using the supplied references, with an edge-to-edge workspace and unified sidebar rows.
- Courses include name, code, instructor, credits, classroom, and semester. Use Taiwan semester labels such as 115-1.
- Notes belong directly to courses. Support headings, lists, checkboxes, tables, images, code blocks, block reordering with keyboard alternatives, Markdown import, and PDF attachments. Note PDFs are upload-only, without editing or extraction.
- Assignments and exams have due times in Asia/Taipei, completion state, and optional email reminders to school email. Offset is customizable and defaults to one day before. Sender: reminder@eljhon.me.
- Weekly class meetings can be entered and edited. Timetable PDF import must show editable review before save, with replace or merge choices. Merge skips exact duplicates; replace affects the selected semester only.
- Resources support links, attachments, course grouping, date sorting, file renaming, and nested folders with folder icons and breadcrumbs. Folder moves cannot introduce cycles; deletion of nonempty folders is refused.
- Allowed attachments: PDF, Markdown, PNG/JPEG, DOCX, PPTX, XLSX. No macros/executables. Limit each file to 10 MiB and total storage to 100 MiB per user; interface labels currently say MB. Server must enforce both atomically.
- Loading uses a layout-matched shimmer skeleton before three seconds, then a spinner. Include recovery pages, upload errors, privacy policy, terms, data-privacy notice, and copyright.

## Acceptance scenarios

1. Sign up by any supported method, complete the student profile, create a semester/course, and see the same private records after signing in on another device.
2. Import a supported MyFCU timetable, correct review rows, merge without duplicate meetings, and replace only the active semester. Unsupported/scanned layouts show a clear error; manual entry remains available.
3. Open a course, write/import a block note and attach a PDF, refresh, and recover the content. Export includes original block records and a readable Markdown copy.
4. Create an assignment or exam, choose a reminder, receive it at school email, and prevent delivery after completion/deletion according to the documented cancellation policy.
5. Create nested resource folders, upload/rename/move/download a file, and retain its relationships after refresh and synchronization.
6. Export a complete ZIP; delete the account through an explicit confirmation; prove another user cannot read any record, attachment, or export.

## Current implementation and gaps

The local React preview has courses, plain Markdown notes, deadline views, manual timetable, supported sample PDF import, nested resources, browser persistence, settings, calendar embed, loading/errors, and draft legal pages. Its IndexedDB data stays in this browser. It has no accounts, Convex sync, email sending, or production access protection.

The rich editor, note imports/attachments, export, managed authentication/profile, backend synchronization, reminders, account deletion, security verification, and deployment remain work items in Phases.md. Exact provider configuration, production origin, privacy contact/operator, and backup retention are unresolved. Do not ask again about confirmed choices above.

## References

The user's Easlo and public Notion references inform workflows; their notebooks database is excluded. User screenshots guide visuals. The six-file guide determined this document set, not product features.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)
