# Student Dashboard agent instructions

Current authorization: the user has explicitly requested local implementation and continued remaining work. The current six root documents supersede older discovery notes below, including external-calendar links and unresolved choices since confirmed. Cloud setup requires configured projects; no push/publish is implied. Read the current root documents for scope and acceptance.

Latest user authorization: local frontend implementation, redesign, browser verification, persistence, timetable PDF import, resources, loading/error states, and legal-preview pages have been explicitly requested. Continue within this scope. No push or public deployment is authorized. Current local data persists in IndexedDB; Convex/auth are unfinished. The school calendar is embedded in the app as requested later in the conversation. User-provided productivity references govern the latest visual direction, and the requested Anthropic frontend-design skill is registered in `.agents/skill-routing.md`.

Latest calendar steering: school calendar must display inside the app. The old external Add to Google Calendar-only requirement below is superseded. Public Google embed currently shows the supplied school calendar; no OAuth or personal-account subscription is needed.

Latest authorization, 2026-10-09: the user explicitly requested development of other functions while sender DNS verification is pending. Local application implementation and verification are now authorized. Cloud provisioning, publishing, and pushing commits remain outside this request. The local preview deliberately uses temporary in-memory data until managed auth and Convex access controls are implemented.

Read `C:\Users\eljho\.codex\RTK.md` on this workstation. Prefix shell commands with `rtk`. Use `rtk proxy` when the underlying tool needs unfiltered output.

## Project context

Read [PRD.md](PRD.md), [Architecture.md](Architecture.md), [Rules.md](Rules.md), [Phases.md](Phases.md), [Design.md](Design.md), and [Memory.md](Memory.md) before changing the project. Discovery is still in progress. Do not treat pending choices as agreed requirements.

The user has selected GitHub source/frontend hosting, Convex for synchronized private data, and Google, GitHub, and email/password sign-in with email-code password reset. Every sign-up requires student-profile completion. All six capability areas launch together, operation must be free, and light/dark modes are required. Auth provider remains pending. Cloudflare Pages is selected for free frontend hosting; GitHub remains the source host. School-account integration is outside initial scope. Timetable PDF import includes review and replace/merge options.

## Required skill use

Reminder sender is `reminder@eljhon.me`. Resend Free is recommended, not provisioned. Verify domain/DNS and delivery before claiming it works; never put sender API credentials in frontend configuration.

Accepted latest recommendations: productive academic-planner design, English/Traditional Chinese settings, listed attachment families, 10 MB per file and 100 MB per user, ZIP export with records/Markdown/attachments. Provider and free email-sender selection remain pending.

Latest steering: every upload is capped at 10 MB; user chooses English/Chinese in settings. Design must be productive, focused, educational; quiet/Notion-inspired appearance was rejected. The school calendar is an external Add to Google Calendar link, not a sync integration. Timetable sample renders correctly but Chinese extraction is garbled; importer reliability is unresolved.

Initial rollout is five users, all data private. Support export/account deletion. Reminder emails go to school email with a customizable offset, default one day before. Use Taiwan academic-year semester labels; no alternating-week classes. Calendar-link purpose remains pending.

Follow [.agents/skill-routing.md](.agents/skill-routing.md). The user explicitly requested these sources be used during creation. Read the relevant project-local `SKILL.md` before each stage, follow its applicable workflow, and record the skill, target, checks, and result in Memory.md. Use exact paths to avoid ambiguity with global skills of the same name.

Use Ponytail's smallest complete solution throughout. Use Addy's skills for the relevant engineering stage and ECC for coding and security checks. Use the design skills and library during design, SlopMonster for user-facing writing, Playwright CLI for browser verification, and Graphify for source relationships when application code exists.

Keep the gstack planning workflow active until the plan is concrete. Resolve overlap by task scope. Avoid running several competing interview or review flows on the same decision. Direct user instructions and runtime instructions take precedence over skill defaults.

## Security and completion

The installed `i-have-adhd` skill is on demand. When the user invokes `$i-have-adhd` or requests ADHD mode, read `.agents/skills/i-have-adhd/SKILL.md` and apply it until normal mode is requested. Installation alone does not activate it. Do not enable global output-style configuration or always-on hooks.

The security requirements in Rules.md and release checks in Phases.md are mandatory. Record implementation evidence. A document or enabled SDK is not evidence that a control works. Test cross-user access, forged identity, field tampering, uploads, sessions, and abuse limits before release.

Some deployment controls remain unresolved. Do not claim GitHub Pages response headers, Convex row isolation, or endpoint throttling are configured before they have been implemented and verified. Keep secrets and private student data out of frontend bundles and Git history. Never persist authentication tokens in localStorage.

## Authorization

Planning, requested skill installation, supporting CLI setup, and security requirements documentation are authorized. Application implementation and deployment have not yet been requested. Do not install global hooks, modify other projects, push commits, or provision cloud services as a side effect of installing these skills.
