# Contact and beta reports

Reporter details update, 2026-10-10: every contact and bug email includes the authenticated reporter's saved name, student ID, department/program, class, derived school email and mobile number. These fields come from the server profile, never the submitted form. Bug emails attach workspace.png and diagnostics.txt when retained; the diagnostic JSON also appears inline. EN/ZH forms and privacy copy disclose this transfer. The diagnostic log itself still excludes profile values. All 37 tests and hosting build gates pass, including two-user/profile-tampering and exact attachment checks. The earlier live delivery test predates this expanded profile payload; no additional real profile email was sent for this update.

Updated 2026-10-10, Asia/Taipei.

Live email test completed after the user's explicit request: the signed-in local beta submitted a labelled bug report with the blank Contact-page screenshot and bounded diagnostics. The form confirmed submission and cleared the sent draft. Resend email 01a1247f-0137-7b9b-8c86-9528cf2ed189 shows Delivered to support@eljhon.me. Proof: .playwright-cli/support-email-delivered.jpg. This establishes recipient-mail-server acceptance, not that a person opened the message or that every future email will deliver. The earlier approval block below is historical and resolved for this test.

Remote readback: 0837dfc pushed to codex/beta-preview. GitHub security run 38030086443 passed in 24s. Protected Vercel Preview CQstRiyAFRTdtAGzFN7D22fcvLKx Ready in 27s; stable branch alias https://coursedock-git-codex-beta-preview-junhao-luos-projects.vercel.app/student-dashboard/. No public-domain routing or production backend migration.

Signed-in, profile-complete users open Contact support from the sidebar to send a complaint or suggestion. A floating circular bug button captures the current workspace panel and opens a review dialog. Users can remove the PNG screenshot and diagnostic log independently, then submit a description. Both forms send to support@eljhon.me through Resend. Replies use the server-derived school email, never a client-supplied recipient. Provider acceptance is shown as submission, not confirmed inbox delivery.

## Sender setup

1. Resend shows eljhon.me as Verified. The owner created a sending-only API key restricted to this domain and reports saving it in the Convex development deployment as RESEND_API_KEY. The key is never read by the agent or placed in Vite, Git, chat or Vercel frontend variables.
2. The owner confirms support@eljhon.me receives mail. Sending-domain verification does not create this mailbox.
3. Development backend: friendly-reindeer-145. The support action and quotas are installed there. Production remains separate and unconfigured for this feature.
4. Send a labelled synthetic report after explicit approval. Check the support inbox for the description, PNG and diagnostics attachment. Resend acceptance alone is not proof of inbox receipt. This setup does not implement assignment reminders.

## Data handling and limits

- Public action support:submit requires verified identity, the shared write budget and a completed private student profile. Exact input/output validators reject extra fields. It returns no student data or provider error details.
- Plain-text email only. Destination/from are fixed server-side; the reply address comes from the private profile. A SHA-256 owner/request identifier supplies Resend's idempotency key. Reuse the same ID for retrying an unchanged form; edits generate another ID. Provider idempotency has a finite retention window and is not permanent deduplication.
- Subject up to 120 characters; description 10–5,000 characters. Screenshots must be PNG with signature/IHDR/IEND checks, dimensions at most 1,600 per side, and a data URL at most 750,000 characters. No arbitrary upload URL or storage bucket is exposed. PNG checks restrict format but do not fully decode/re-encode hostile images.
- Separate transactional UTC-calendar budgets: 3 reports/day and 20/month per identity; 10/day and 100/month for the whole deployment. Failed provider attempts still reserve capacity; retries also consume a slot. This bounds this feature only, not other email sends or infrastructure billing.
- Logs are an in-memory ring of at most 20 error-category/timestamp entries. Add only workspace section, interface language and viewport size. No raw console message, stack, URL/query, cookie, token, profile or request body is collected. The ring resets on workspace unmount/sign-out. The user-entered description may itself contain private data.
- Screenshot capture excludes form controls, images, iframes, the profile form and marked private elements. Visible course/note text can remain; the preview and removal controls are mandatory. The browser-rendered image is an approximation: embedded calendar/media and fonts may differ. No server or browser-console logs are attached.
- Report content is not retained in Convex; quota counters are. Resend and the support mailbox retain sent copies under their own handling. Automatic support-report deletion and a fixed mailbox retention policy are not implemented. Updated privacy copy explains the new data flow.

## Verification

17 frontend tests and 19 server/client tests pass. Added tests prove anonymous/profile/field/format rejection, concurrent report quota, fixed recipient and derived reply address, idempotency-header shape and generic provider failures. Production build, backend type-check and dependency/static scans pass. Development functions installed at 14:02:18.

Local signed-in UI: contact email/failure feedback, preserved form values, screenshot generation, diagnostic preview and independent removal pass. Exact Chromium 390×600 wheel test advances dialog scroll while page scroll stays zero, without horizontal overflow. The dialog uses data-lenis-prevent and overscroll containment; physical trackpad/Safari behavior is not yet tested. Live email test initially rejected by automatic approval review pending approval of the specific screenshot/log/reply-address payload. No delivery claim is made from mock tests.

References: [Resend API](https://resend.com/docs/api-reference/emails/send-email), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [html-to-image](https://github.com/bubkoo/html-to-image).
