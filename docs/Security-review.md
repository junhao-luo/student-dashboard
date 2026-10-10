# Security evidence — 2026-10-10

Scope: protected Vercel beta, Clerk development authentication, Convex development backend, source and reachable Git history. This is an evidence review of all S01–S24 controls, not a declaration that the public release is safe. No production data migration, private-file service, account deletion or reminder service is implied.

## Trust boundaries and threat model

Assets are student profiles, academic records, private study files and administrator credentials. Untrusted clients must not choose owners, writable privileged fields, linked records, stored file paths or executable content. Browser IndexedDB is accessible to the device owner; account namespaces are convenience separation, not encryption. Clerk authenticates users; Convex verifies issuer/audience and derives tokenIdentifier. Vercel protection restricts the beta, but does not replace backend authorization. Build/deploy credentials are an additional privileged boundary.

## Control evidence

| Control | Checks applied and result | Remaining evidence or implementation |
|---|---|---|
| S01 public configuration only | Static source/build credential patterns: zero findings; frontend has publishable key and deployment URL only | Pattern scan cannot identify every secret format; inspect authenticated production payloads before release |
| S02 env/history | Ignored real env files; eight reachable commits scanned in application/config paths without credential findings; historical tracked env-file names checked | Scope excludes external clones and unrelated skill/tool content; leaked keys, if found, require rotation before history remediation |
| S03 managed auth | Clerk Google development login/profile/refresh/logout previously exercised; hosted existing account refresh passes | Production Google/GitHub/password/reset/linking flows remain untested |
| S04 verified identity | All 13 business actions deny anonymous requests in mock runtime; live profiles:get and academic:get deny anonymous and forged JWT | Real two-user transport and expiry/revocation checks still needed |
| S05 row isolation | Convex ownership checks; negative profile/course/task/meeting/snapshot cross-user tests pass | SQL RLS is not a Convex setting. Real two-user records/bytes tests remain required |
| S06 field tampering | Exact input validators reject owner/schoolEmail injection and foreign relationships | Add equivalent controls for future notes/resources/files/deletion endpoints |
| S07 server input validation | Bounded validators, canonical dates/phones, derived school mail, capped snapshots. Fixed Unicode byte-budget bypass; rejected snapshot leaves cloud unchanged | Future retained upload bytes require server content validation |
| S08 sessions | Application has no localStorage/sessionStorage token writes; static check rejects introduced localStorage writes | SDK cookie/storage flags, durable-token HttpOnly protection, expiry/revocation still require actual inspection; application scan is insufficient |
| S09 passwords | Clerk owns password handling; app schema has no password/hash fields | Provider hashing assurance and real reset flow still need evidence |
| S10 login/bot abuse | Provider components configured; no homegrown login endpoint | Failed login/signup/reset/code budgets and challenges have not been exercised |
| S11 endpoint budgets | All 13 public business endpoints reject exhausted read/write budgets; 25 concurrent writes yield 20 successes. Added atomic per-owner record caps: 100 courses, 1,000 tasks, 1,000 meetings | This does not rate-limit anonymous platform validation failures, Clerk routes, static hosting or future HTTP/files. Provider-wide abuse limits remain to verify |
| S12 administrator MFA | Owner reports 2FA and recovery codes configured on GitHub/Vercel/Clerk/Convex | User attestation, not an automated bypass test. No app administrator role exists |
| S13 webhooks | No application webhook/HTTP routes are present in the current backend inventory | Not applicable to current transport; signatures, replay and idempotency mandatory when delivery/deletion hooks are added |
| S14 upload restrictions | Local file signature/type/size checks and negative PDF/image tests pass; files are not uploaded to Convex | Server type/size/concurrency enforcement remains unimplemented; upload-only local checks do not satisfy release requirement |
| S15 private storage | No public app bucket, getUrl or upload URL handler exists; study bytes remain local | Authenticated owner-private cloud serving and unauthorized byte-retrieval tests remain unimplemented |
| S16 origins/CORS | Exact Clerk/Convex origins listed in CSP; no application HTTP endpoint or wildcard application CORS handler | CSP is not CORS. Verify managed Convex transport behavior and production callback/origin allowlists; future HTTP routes must enforce approved origins independently of ownership |
| S17 HTTPS/headers | Vercel header configuration present; cookie-free hosted request redirects to Vercel SSO over HTTPS, with HSTS/framing protection | Authenticated app response CSP/nosniff/referrer/permissions headers and portfolio proxy preservation still unverified. Inline scripts currently allowed for managed auth; review necessity before production |
| S18 encryption | HTTPS used for frontend/auth/backend; no application secrets persisted with records | Provider encryption-at-rest assurance, encrypted backups and browser sensitive-data retention decisions remain required |
| S19 SQL injection | Convex typed APIs; no raw SQL/database SQL dependency | Not applicable to current stack; parameter binding required if SQL is introduced |
| S20 escaped content | React text escaping, restricted imported links/remote media, safe export paths; negative link/media/signature tests pass; static unsafe HTML/eval checks pass | Full hostile rich-block rendering and real assistive/browser coverage remain pending |
| S21 minimal responses/errors | Explicit returns omit owner/provider records; frontend uses generic recoverable errors | Actual production success/error payload redaction and provider stack behavior need checks |
| S22 dependencies | Current audit: zero vulnerabilities; locked dependency install; CI uses npm ci --ignore-scripts and pinned official GitHub action commits; weekly Dependabot configuration | Remote workflow/branch enforcement requires successful hosted run; build retains library directive/chunk warnings unrelated to known vulnerability audit |
| S23 backup/restore | No database restore has been performed or falsely marked complete | Define encrypted backup/retention; export database plus files, restore into isolated deployment, compare records/relationships/ownership/file bytes. Never restore over current development/production data |
| S24 release gate | 15 frontend + 17 backend/client tests pass, backend type check/build pass, history/static scans pass, live auth-negative checks pass | Public release remains blocked by the applicable gaps above and private data deletion/export completion |

## Executable checks

- `npm run verify`: static security lint, frontend tests, server/client tests, backend type check, high/critical dependency gate.
- `npm run build`: frontend type check and production bundle.
- `npm run lint:security`: current source/build scan and public-action args/returns/guard declarations. Syntax checks are not proofs of runtime authorization.
- `npm run check:security-history`: filename-only credential scan of all reachable application/config history plus env-file name review. No matched secret values are printed.
- `VITE_CONVEX_URL=<specific deployment> node scripts/live-auth-check.mjs`: profiles/academic anonymous and intentionally forged-token negatives; network errors are inconclusive, never counted as denial.

Vercel now runs verification before building and scans the resulting bundle afterward. GitHub workflow has read-only permissions, pinned actions, no production secrets, no retained checkout credentials, a time limit and cancellation of superseded checks. This workflow does not itself establish required branch protection or successful remote execution.

## Deployment recommendations

Vercel Hobby allows one concurrent build. Skew Protection is a Pro/Enterprise feature; no paid option was enabled. Vercel Skew Protection also does not automatically version-lock an external Convex backend.

`npm run build:release` is the prepared coupled build: verification first, then Convex deploy using an environment-scoped deploy key and the URL supplied by Convex to build the frontend. It refuses to run without CONVEX_DEPLOY_KEY, avoiding accidental use of a developer CLI login. No key is in VITE variables or source. Vercel's build:hosting wrapper invokes it automatically once the owner generates and enters the scoped key directly in the secret store. Production fails without that key; protected Preview uses its existing development configuration while setup is pending. Use separate Preview/Production keys and configure each deployment's Clerk issuer. Keep backwards-compatible API migrations for existing open clients; a coupled build is not atomic rollback or a guarantee against in-flight older clients.

References: [Vercel queues](https://vercel.com/docs/builds/build-queues), [Skew Protection](https://vercel.com/docs/skew-protection), [Convex/Vercel deployment](https://docs.convex.dev/production/hosting/vercel).

Remote verification: cde8b36 passed GitHub security workflow 38028715110 in 33 seconds and Vercel Preview FTeBDREf9pJpW8JYho4eSR7SuB8r in 27 seconds. Both ran their security gates. The hosted updated sign-in renders. Initial official v4 actions emitted Node 20 deprecation warnings; upgraded pinned actions to official v6 and fixed the runner at ubuntu-24.04. The hosting wrapper now chooses coupled deployment whenever a deploy key is supplied, and refuses Production builds without it; protected Preview retains the existing explicitly configured development backend until key setup. Therefore automatic pairing is ready to activate through secret configuration, not claimed active today.

Follow-up history scan widened credential matching to all tracked text paths (including skill/tool documentation) across nine reachable commits: zero findings. Static sink/action checks remain scoped to application code; untracked new application/check files and generated build output are scanned too. Both missing-key guards were exercised and failed as expected. The complete protected-preview hosting command passed locally. No passwords/tokens/cookie values were copied or inspected through unapproved browser mechanisms.

Final remote readback: 4a7b1d3 passed GitHub workflow 38028941405 (29s) and Vercel Preview BsgNrer5KZFDpAYiXxvUCF81Avci (23s). Updated test URL: https://coursedock-gsjyif3gr-junhao-luos-projects.vercel.app/student-dashboard/. The previously signed-in hosted account still opens Overview after development-backend hardening and refresh, without application errors. No real academic records were edited. All Deployments protection and the portfolio routing remain unchanged. Proof: ignored .playwright-cli/security-vercel-ready.jpg.
