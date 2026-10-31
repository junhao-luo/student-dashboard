# CourseDock domain migration — 2026-10-31

## Update, 2026-11-01

Email follow-up: source UI/legal text and backend support recipient/reminder sender changed to support@coursedock.app and reminder@coursedock.app. Not published to production: public DNS has no apex MX, resend._domainkey TXT or send CNAME. Owner will configure receiving independently. Before release, verify Resend domain and save a sending key authorized for coursedock.app in Convex production RESEND_API_KEY. Keep current live delivery until verification. Never request keys in chat.

Production root routing and sign-in render successfully in Obscura/Playwright CLI with zero console errors after owner updated the publishable key. Convex AUTH_JWT_ISSUER changed to the verified https://clerk.coursedock.app and backend deployed without schema/index deletion. Source authentication on eljhon.me is rejected by Clerk after domain change, so a local-only export bridge now replaces that old-origin account screen. The signed-in destination generates a hash link identifying its account namespace; the source page requires ownership confirmation and downloads only that namespace's records/files. It makes no backend calls or uploads. Same original browser/device is required. ZIP restore validates bounded archive contents, relationships and attachment signatures/types, and writes records/files atomically; destinations with existing notes/resources/files are refused. Existing cloud records are untouched and restored state starts in local mode for explicit sync review. Actual private data export/import still requires owner interaction and has not been performed. Commits 2c4fd5a, 697c8da, b54b225, f1474ca pushed to main. Thirty frontend and twenty-eight server tests passed, plus type/build/static security checks. Legacy HTML/assets physically included under student-dashboard to preserve portfolio proxy routing. The source bridge release is awaiting live readback.

User requires preservation of existing browser notes, resources and uploaded files. The earlier “start fresh” answer was corrected. Do not switch production authentication or retire the old origin before a tested transfer and backup are available.

- Target: https://coursedock.app; portfolio stays at eljhon.me.
- Name.com: apex A 216.198.79.1 and five Clerk CNAME records saved. Vercel reports Valid Configuration.
- Branch codex/coursedock-domain-migration, commit 8997989, pushed. Root Vite base, CSP for new Clerk host, root rewrites and reminder link prepared. Production main unchanged.
- Vercel preview Ewj19T8G9NtKabATJcDqTL25TLEi Ready. Hero renders at root; authentication not verified.
- Local build, frontend checks, 28 server tests and server types pass. Tests require TEMP/TMP inside workspace to avoid sandbox temporary-file ENOENT. Separate network-enabled npm audit found zero vulnerabilities.
- Clerk primary domain still eljhon.me. Change-domain confirmation was opened but not submitted. Switching invalidates all sessions and requires new publishable key, Convex AUTH_JWT_ISSUER, OAuth callbacks and coordinated deployment.
- Resend signed in. coursedock.app added, ID c6a3cc4b-7fac-4f60-9300-15b23e1974fb, Tokyo. DNS verification pending: TXT resend._domainkey (public key in Resend UI), CNAME rsend to rsend-apne1.forge.rmta.net, CNAME send to send.forge.rmta.net. Receiving disabled.
- support@coursedock.app mailbox not configured; user will set it up later. Existing support destination and sender remain active until replacements verified.

Next: implement bounded ZIP restore using existing export manifest, records and original attachments; validate archive sizes/relationships and import atomically into the authenticated account. Publish transfer support at the old origin and export before Clerk switch. Keep originals and backup. Then finish Resend DNS, coordinated auth/domain deployment, live login and data verification. Do not expose private data in logs or commits.
