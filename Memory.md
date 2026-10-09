# Memory

Updated: 2026-10-09, Asia/Taipei. Current handoff; archived chronology is in [docs/History.md](docs/History.md). Historical entries are not current requirements.

## Current state

Local React/TypeScript/Vite app runs at http://127.0.0.1:5180/. Browser IndexedDB retains records, resource blobs, settings and navigation. Accounts, Convex sync, email sending and deployment are not connected. Never present local persistence as private account security or cross-device sync.

Implemented: semester courses; plain Markdown course notes; deadlines/manual classes; supported one-page MyFCU PDF review/merge/replace; nested resource folders/files; in-app Google school calendar; English/Traditional Chinese and light/dark; skeleton/spinner and recovery; preview legal pages; edge-to-edge shell and unified dropdown rows.

Latest verified foundation: nine domain/parser/folder tests, production type/build check, responsive workflow tests and synthetic screenshots. Latest dropdown slice checked transparent surfaces, all three arrow states, Escape, resource selection and 390px mobile overflow. Unrelated features were not repeated for that cosmetic slice.

## Confirmed constraints

Five users initially, all data private, free operation; GitHub source, Cloudflare Pages frontend, Convex backend. Managed Google/GitHub/email-password accounts with email-code reset and six mandatory student-profile fields. School email need not be verified. All six areas launch together, no deadline. Notes belong to courses. 10 MiB/file, 100 MiB/user; allowed non-macro families and ZIP export as specified in PRD. School-account integration remains outside scope. App name is provisional/editable.

## Email setup evidence

Sender reminder@eljhon.me. User explicitly authorized Namecheap/Resend DNS edits. DKIM/SPF/CNAME/send MX publicly resolved; existing Private Email root MX routes preserved. Last observed Resend state was Pending. No API keys added or delivery test completed. Verify current status before integrating email; never request secrets in chat or place them in frontend variables.

## Tools and authorization

Read workstation RTK.md; prefix shell commands with rtk. User authorized local implementation and dependency/skill setup. No commits/push/publish or unrelated project edits. Keep personal timetable/source/render/extracted data out of Git; browser artifacts are ignored and screenshots use synthetic records.

Requested skills are installed/routed under .agents, with hashes in skill-sources.json. Anthropic frontend-design provenance is recorded. i-have-adhd is on demand and currently inactive. No global hooks. Graphify source-only indexing has auto-refresh disabled; last index 76 nodes/205 edges. SlopMonster separate-model pass was unavailable; do not claim it happened. Gstack discovery started, but no completed planning review is recorded.

## 2026-10-09 — Specification reconciliation and next work

User requested updating the six files and continuing from them. Replaced contradictory discovery sections with current requirements, architecture, design and ordered acceptance slices. Preserved original security-control definitions in Rules.md and archived prior Memory chronology. Application implementation is authorized by subsequent user messages; obsolete planning-only restrictions no longer apply. Continue Phases 1–5 and verify actual behavior; cloud setup and release controls remain prerequisites for launch.

[PRD](PRD.md) · [Architecture](Architecture.md) · [Rules](Rules.md) · [Phases](Phases.md) · [Design](Design.md) · [Memory](Memory.md)
