# Compliance work — 2026-11-01

Operator confirmed: individual in Taiwan; beta restricted to 18+. This is an implementation review, not a guarantee of legal compliance.

## Required implementation

- Versioned privacy/terms notices, explicit adult/terms acceptance recorded server-side; no bundled marketing consent.
- Cookie preference banner with equally available rejection; Google Calendar blocked until optional external-content consent. Essential authentication remains necessary to provide sign-in.
- Authenticated access/deletion request records with owner isolation; portable local ZIP export remains available. Deletion must include identity, profiles, academic records, reminder jobs and local copies; do not claim completed erasure before provider and backup handling are verified.
- Minimize support emails: remove student ID, mobile, department and class unless needed for a specific support issue. Do not silently erase existing profile fields; offer an explicit removal path.
- Enforced retention for operational counters, completed reminder jobs and request records. Academic records remain until user deletion; disclose provider backups separately with verified limits.
- Audit keyboard/focus/contrast in both themes and mobile; identify and preserve license notices for all shipped dependencies, fonts and bundled university PDFs.

## Applicability

No payment/subscription or marketing system currently exists: no refunds, renewal, cancellation or marketing unsubscribe mechanism is applicable yet. State free beta/no charges; prohibit launching marketing without separate opt-in and working unsubscribe. Transactional reminders remain individually opt-in and can be disabled per task.

No AI inference/training pipeline is implemented. Do not send user data to AI providers for training; disclose any future AI feature before activation. Developer use of AI must not be described as AI generation of private student content. No fake reviews/countdowns/SOC2 or uptime guarantee were identified in the inspected legal/auth/support files; full-source audit remains pending.

Provider agreements require owner review: Clerk https://clerk.com/legal/dpa ; Convex https://www.convex.dev/legal/dpa ; also verify Vercel and Resend DPAs and subprocessor disclosures. Do not accept binding agreements on behalf of the owner without the required handoff. Publish actual processor purposes, data categories, locations and current policy links only after verification.

DMCA: U.S. safe-harbor eligibility can require a designated agent and other conditions; registration is not a blanket requirement for every app. Assess U.S. exposure and hosted-content activity with qualified counsel before claiming safe harbor. Official source: https://copyright.gov/dmca-directory/ . Do not register or claim registration automatically.

## Release state

This checklist is not evidence of completed controls. Email migration remains on a branch until the new mailbox and sender DNS are ready. No legal/compliance release is approved or published merely by this document. Track each implemented control and its verification before deployment.
