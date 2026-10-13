# Design

Landing routing, 2026-10-13: signed-out visitors see the existing hero/sign-in layout directly at /student-dashboard/. Root authentication uses Clerk hash routing so authentication steps stay on the root page; legacy /sign-in links still work. Unknown app paths render a bilingual 404 with the remembered language/theme and a recovery link to home or the workspace. Clerk owns its nested sign-in/sign-up callback routes.

Beta follow-up, 2026-10-13: footer credits Eljhon Satsat / 羅俊豪 and describes possible beta issues in the selected language. Task forms use an explicit email-reminder checkbox plus a days-before input defaulting to 1, with a notice that saving and syncing is required. Capture the workspace first, then show the report form with its retained screenshot preview. Keep removal/review controls and the private-data disclosure.

Timetable import review, 2026-10-13: render the draft as weekday columns with time-positioned class blocks and the 14 FCU period labels. Selecting a block opens a focused editor for course, teacher, room, day and times; edits update the draft immediately. Weekend columns appear when needed. Overlapping meetings use separate lanes, and an expandable full list keeps every meeting accessible. On narrow screens only the timetable scrolls horizontally; form fields stack. Saving still requires valid names/times and an explicit merge/replace selection.

Support email update, 2026-10-10: English and Traditional Chinese contact/report forms disclose sending name, student ID, department, class, school email and mobile number to support. Keep screenshot/log review and independent removal controls.

Support addition, 2026-10-10: a compact Contact support row above the profile opens a readable form using the shared category dropdown. Keep collapsed navigation icon-only. A fixed green circular bug button respects safe-area spacing and hides behind the open mobile drawer. Its keyboard-dismissable, independently scrollable dialog explains the screenshot/privacy boundary, previews the PNG, permits screenshot/log removal, and preserves failed drafts. Use English/Traditional Chinese and semantic dark/light tokens. Exclude nested dialog scrolling from Lenis.

Production preparation, 2026-10-10: preserve the existing hero/account layout and remembered language/theme at /student-dashboard. Navigation, signup, profile completion and logout must stay beneath that prefix. Legal contact is support@eljhon.me, operated by Eljhon Steve (羅俊豪). Keep visible notices accurate about device-local notes/files and unfinished reminders/deletion until those capabilities are completed.

Updated: 2026-10-10, Asia/Taipei. Latest user references and accepted interactions govern this specification.

## Direction

A focused academic productivity app. Use the supplied three reference screenshots and Notion dashboard for relevant workflow structure. Keep neutral surfaces, readable charcoal type, compact course lists, pastel calendar entries and a restrained green accent. Do not introduce mock metrics, collaboration, or copied branding. Notes live under courses; there is no notebooks database. CourseDock is a changeable working name.

## Layout and tokens

Edge-to-edge shell; no enclosing rounded app card. Desktop sidebar is fixed to the viewport and scrolls independently; main content scrolls normally. Collapse is supported. Mobile uses a bounded independently scrolling drawer, 44px compact navigation rows, backdrop, dedicated close button, focus containment, Escape dismissal and stacked content without horizontal document overflow. Respect safe areas and dynamic viewport height; background content is inert while the drawer is open. Individual entries/sections can have soft borders.

Tokens: background #f5f5f6, surface #ffffff, text #293237, muted #62696c, accent #235d54, border #e4e6e6. Pastel course/event accents: lavender #f0eafa, peach #fff0e6, pale green #eef3d9, blue #e5f0fb; dark variants use semantic tokens. Self-hosted Geist with system Chinese fallbacks. Clear heading hierarchy; compact labels and readable note line length. Keep focus rings and 44px touch targets where practical. Full WCAG audit remains pending.

## Navigation

Collapsed desktop navigation hides dropdown chevrons and centers the CourseDock logo and navigation icons. Expanded desktop rows and the mobile drawer retain their dropdown arrows.

The sync notice belongs inside the main content panel, so fixed sidebar widths cannot obscure it. Show the current sync state once, without the older disconnected preview message. Saving navigation/appearance preferences does not trigger the academic-content saving indicator. Expanded profile rows show the student's name beside the circular avatar; collapsed rows show only the avatar. Both retain the account popup.

Overview, Courses & notes, Assignments & exams, Timetable, Resources, School calendar and Settings. Workspace-name menu provides semester/settings. Dropdowns sit on menu buttons, with transparent rows, consistent spacing, no trigger borders/shadows, and a shared soft active highlight. Chevrons flip on open/close. Popup content remains bounded. Close on outside click/Escape, restore focus, and support keyboard access. Language/Appearance use bordered custom form selects.

Course pages have notes, deadlines, schedule and resources sections. Recent notes and quick new note/assignment/exam actions appear on Overview. Deadlines have week/upcoming/calendar/all views and course/status filters. Resources use folder icons, nested breadcrumbs and explicit rename/move; forbid cycles and nonempty-folder deletion.

## Notes and uploads

Rich note canvas stays directly in the course. Provide heading/list/checklist/table/image/code blocks, contextual formatting, slash insertion and drag reorder with keyboard alternatives. Keep title and document primary; avoid a dense permanent toolbar. Preserve legacy Markdown and canonical blocks, with import/export notices for formatting limits. PDF note attachments offer download/preview without conversion.

Implemented block canvas uses the app font/theme, restrained note heading sizes, contextual controls and explicit Move block up/down buttons. Uploaded images render locally; PDF attachments download without conversion or extraction. One styled drop area accepts Markdown/PDF/PNG/JPEG. Settings provides complete browser-workspace ZIP export with a private-data notice. Deadlines/classes use populated editing dialogs and Save changes.

Uploads use styled picker/drop areas with labels, file types and limits before selection. Single-file upload and drag/drop share validation. Limit 10 MiB/file and 100 MiB/user; display actionable failures. Timetable import: upload, processing, editable review/source preview, merge/replace, saved result or clear failure.

## States and accessibility

Skeleton mirrors actual shell/blocks with left-to-right shimmer before three seconds, spinner afterward. Respect reduced motion. Storage/render failures have recovery pages; validation errors preserve entered values. Empty states explain the next action. Use accessible names, visible focus, keyboard alternatives and text/icons alongside status colors.

Sign-in and sign-up are separate pages. Desktop landing pages pair an academic hero/workspace illustration on the left with the account form on the right. On phones the hero is compact above the form and its decorative illustration is hidden. After every sign-up method, require the five-input student profile with a server-generated school email before opening the workspace. Successful login opens Overview. Put a circular profile photo at the sidebar bottom, with initials if no photo is available or loading fails, and an upward popup containing Edit profile and Log out; Edit profile opens Settings. Match account pages to the current language/theme; required fields use readable 16px inputs on phones. Explain that academic records remain local until cloud synchronization is implemented. Language and theme are chosen on the hero landing page or in Settings, remembered after refresh, and carried into the workspace after sign-in. Use English/Traditional Chinese and Asia/Taipei for academic times. Legal documents are readable keyboard-dismissable dialogs linked in the footer, with copyright. Preview notices describe local browser storage and the Google embed accurately; production notices require operator/contact and actual data flows.

## Local workspace import

Before opening a new account workspace, offer a review of the older unowned browser workspace. Show only counts for courses, notes, deadlines, meetings, resources and folders. Require an ownership checkbox before enabling Import into this account. Offer Start with an empty workspace and Log out. Explain that import copies locally, keeps originals and requires an empty target. Settings provides the same review while the legacy copy is unclaimed. Missing files and conflicts show a visible error without saving a partial copy. Use normal form controls, accessible labels and responsive two/three-column counts.

## Required review workflow

Apply project-local frontend-design, Ponytail, relevant frontend engineering, Apple guidance, applicable taste/high-end references, SlopMonster copy review, Vercel web guidelines and Playwright CLI. Source provenance and stage routing live in .agents/skill-routing.md. Skills supplement these product choices; off-domain visual defaults do not replace them. Record actual checks and unresolved findings in Memory.md.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)

## Profile form refinement, 2026-10-10

Five required inputs; school email appears only as an automatic-generation hint below student ID. Mobile helper text shows the accepted Taiwan forms. The department/program control reuses the app dropdown: its search box appears inside the open menu, receives focus on opening, and filters official Chinese names as the user types. Add custom program remains available even without matches; selecting it reveals the custom-name field. Keep existing custom values visible. Long program names wrap inside the menu and trigger; English/Traditional Chinese layouts pass at 320, 390, 768 and 1440 px without horizontal overflow. Escape returns focus to the trigger; arrow keys enter and navigate results. Reopening clears the search without changing the saved selection.

## Academic sync review, 2026-10-10

Before upload, show local/cloud counts, exact synchronized areas and an ownership confirmation. Allow keeping the workspace local. Existing cloud records are adopted explicitly; original local records get a retained backup. Interrupted saves show a stopped-sync notice and review action. Explain that reopened devices fetch updates and that notes/resources/files remain local. Never present this limited academic sync as complete cloud storage.
