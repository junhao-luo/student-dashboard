# Design

Updated: 2026-10-09, Asia/Taipei. Latest user references and accepted interactions govern this specification.

## Direction

A focused academic productivity app. Use the supplied three reference screenshots and Notion dashboard for relevant workflow structure. Keep neutral surfaces, readable charcoal type, compact course lists, pastel calendar entries and a restrained green accent. Do not introduce mock metrics, collaboration, or copied branding. Notes live under courses; there is no notebooks database. CourseDock is a changeable working name.

## Layout and tokens

Edge-to-edge shell; no enclosing rounded app card. Desktop sidebar is fixed to the viewport and scrolls independently; main content scrolls normally. Collapse is supported. Mobile uses a drawer and stacked content without horizontal document overflow. Individual entries/sections can have soft borders.

Tokens: background #f5f5f6, surface #ffffff, text #293237, muted #62696c, accent #235d54, border #e4e6e6. Pastel course/event accents: lavender #f0eafa, peach #fff0e6, pale green #eef3d9, blue #e5f0fb; dark variants use semantic tokens. Self-hosted Geist with system Chinese fallbacks. Clear heading hierarchy; compact labels and readable note line length. Keep focus rings and 44px touch targets where practical. Full WCAG audit remains pending.

## Navigation

Overview, Courses & notes, Assignments & exams, Timetable, Resources, School calendar and Settings. Workspace-name menu provides semester/settings. Dropdowns sit on menu buttons, with transparent rows, consistent spacing, no trigger borders/shadows, and a shared soft active highlight. Chevrons flip on open/close. Popup content remains bounded. Close on outside click/Escape, restore focus, and support keyboard access. Language/Appearance use bordered custom form selects.

Course pages have notes, deadlines, schedule and resources sections. Recent notes and quick new note/assignment/exam actions appear on Overview. Deadlines have week/upcoming/calendar/all views and course/status filters. Resources use folder icons, nested breadcrumbs and explicit rename/move; forbid cycles and nonempty-folder deletion.

## Notes and uploads

Rich note canvas stays directly in the course. Provide heading/list/checklist/table/image/code blocks, contextual formatting, slash insertion and drag reorder with keyboard alternatives. Keep title and document primary; avoid a dense permanent toolbar. Preserve legacy Markdown and canonical blocks, with import/export notices for formatting limits. PDF note attachments offer download/preview without conversion.

Uploads use styled picker/drop areas with labels, file types and limits before selection. Single-file upload and drag/drop share validation. Limit 10 MiB/file and 100 MiB/user; display actionable failures. Timetable import: upload, processing, editable review/source preview, merge/replace, saved result or clear failure.

## States and accessibility

Skeleton mirrors actual shell/blocks with left-to-right shimmer before three seconds, spinner afterward. Respect reduced motion. Storage/render failures have recovery pages; validation errors preserve entered values. Empty states explain the next action. Use accessible names, visible focus, keyboard alternatives and text/icons alongside status colors.

Language and theme are chosen in Settings. Use English/Traditional Chinese and Asia/Taipei for academic times. Legal documents are readable keyboard-dismissable dialogs linked in the footer, with copyright. Preview notices describe local browser storage and the Google embed accurately; production notices require operator/contact and actual data flows.

## Required review workflow

Apply project-local frontend-design, Ponytail, relevant frontend engineering, Apple guidance, applicable taste/high-end references, SlopMonster copy review, Vercel web guidelines and Playwright CLI. Source provenance and stage routing live in .agents/skill-routing.md. Skills supplement these product choices; off-domain visual defaults do not replace them. Record actual checks and unresolved findings in Memory.md.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)
