# Project skill routing

Installed and checked: 2026-10-09. Source commits and prompt hashes are recorded in [skill-sources.json](skill-sources.json).

Project-local copies take priority when this file names an exact path. New skills become discoverable on the next turn. During this session, read their files directly when applying them.

## Required sources and use

| Requested source | Local installation | Use during creation |
| --- | --- | --- |
| [I Have ADHD](https://github.com/ayghri/i-have-adhd) | `skills/i-have-adhd/` | On explicit invocation, apply the canonical response rules for the session. Installation alone does not activate it. Plugin metadata is retained as a reference; no global hooks were enabled. |
| [Ponytail](https://github.com/dietrichgebert/ponytail) | `skills/ponytail/` and five companion skills | Keep scope and code small without cutting security, validation, accessibility, or requested features. Review risky changes and their checks. |
| [SlopMonster](https://github.com/ItsssssJack/SlopMonster) | `skills/slopmonster/` | Review UI copy and project documentation for audience, factual support, and clear wording. Run its checker. Record whether a second model pass actually completed. |
| [Apple design skill](https://github.com/dickwu/apple-design-skill) | `skills/apple-design/` | Review interaction hierarchy, accessibility, typography, and responsive design using the relevant reference pages. Translate principles to the web. Do not impose native-only controls. |
| [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) | `reference-library/voltagent__awesome-design-md/` | Consult design examples before settling this app's visual language. This is a reference library, not a `SKILL.md` package. Do not replace Design.md with an unrelated website's theme. |
| [Taste skill](https://github.com/leonxlnx/taste-skill) | `skills/taste-skill/` plus 12 companion skills | Read the brief and avoid generic visual defaults. The main skill excludes dashboards. Use the companion that fits the approved product design. Keep marketing layouts separate from data-heavy product screens. |
| [Vercel web design guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | `skills/web-design-guidelines/` | Fetch the current guideline source and check relevant UI files before accepting a screen. Record file-specific findings and fixes. |
| [Microsoft Playwright CLI](https://github.com/microsoft/playwright-cli) | `skills/playwright-cli/`. Existing CLI verified at 0.1.22 | Run actual browser checks for core workflows, responsive layouts, keyboard use, PDF-import states, and authentication behavior. Keep browser auth-state files out of Git. |
| [Graphify](https://github.com/Graphify-Labs/graphify) | `skills/graphify/`. CLI updated to 0.9.82 | Once app source exists, build a local code-only graph and use it for dependency and change-impact questions. Exclude vendored skills, secrets, personal imports, and browser sessions. |
| [Addy's agent skills](https://github.com/addyosmani/agent-skills) | 25 skills. Shared references at `references/` | Apply the relevant Define, Plan, Build, Verify, Review, or Ship workflow. Start with source-driven decisions and incremental delivery. Use security-and-hardening for the user's security requirements. |
| [Everything Claude Code, requested fork](https://github.com/worldflowai/everything-claude-code) | 11 skills. Additional Markdown rules/agents/commands in `reference-library/worldflowai__everything-claude-code/` | Use coding-standards, frontend/backend patterns, security-review, meaningful tests, and verification-loop where relevant. Claude-specific hooks and MCP configuration are retained as references, not activated in Codex. |

## Stage routing

- Discovery: gstack office-hours Builder mode. Addy's interview guidance can inform unanswered requirements, without restarting the interview or requiring answers already supplied.
- Architecture: source-driven-development and security-and-hardening, followed by the applicable gstack engineering review. Use Convex's actual APIs and security model rather than copying SQL/Supabase examples.
- Planning: use Phases.md as this project's delivery plan. Read planning-and-task-breakdown for dependency order, vertical slices, and verifiable acceptance criteria.
- UI: frontend-ui-engineering, the approved design reference, relevant taste companion, Apple design review, then web-design-guidelines. Read only the HIG pages needed for the screen under review.
- Implementation: ponytail, coding-standards, incremental-implementation, and relevant frontend/backend patterns. Use test-driven-development or tdd-workflow for meaningful behavior and trust boundaries. Avoid duplicate test workflows.
- Source understanding: graphify after application code exists. Use `rtk proxy graphify extract . --code-only --no-cluster` for local structural indexing, following the skill's applicable steps. Do not index `.agents/` or student data.
- Writing: slopmonster. The intended readers are students for UI copy and contributors for documentation. Keep required technical detail and report justified checker exceptions.
- Verification: playwright-cli for runtime browser evidence, focused automated behavior checks, security-review plus security-and-hardening, and verification-loop.
- Release: code-review-and-quality, ci-cd-and-automation, shipping-and-launch, and the applicable gstack release workflow after release work is requested. Do not infer deploy authorization from a skill's defaults.

## Applying collections

Set `GRAPHIFY_NO_AUTO_REFRESH=1` for subsequent Graphify invocations to prevent changes to unrelated global prompts.

Installed does not mean every skill runs on every task. Off-domain material such as ClickHouse, brand-kit generation, and native mobile design remains available. It should not create infrastructure or features this student dashboard does not need. Conflicting visual styles are alternatives to choose from, not instructions to combine.

No repository setup script, autonomous-learning hook, global browser hook, or external model service was activated as part of the source installation. Supporting references and license files are retained under each source's namespaced reference-library folder.

## Evidence record

For each significant development stage, add a concise Memory.md entry stating the skill used, the files or workflow reviewed, the commands or checks performed, and unresolved findings. Do not record a future planned check as completed.

## Anthropic frontend-design

User-requested installation: `skills/frontend-design` from `anthropics/skills`, recorded in `skill-sources.json`. Read `.agents/skills/frontend-design/SKILL.md` for frontend redesigns. Apply its plan/build/critique workflow together with the existing frontend, taste, Apple, and high-end design skills. User references take priority over stylistic defaults. No hooks were installed.
