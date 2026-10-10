# Portfolio migration to Vercel

User authorized moving the public portfolio on 2026-10-10 (Asia/Taipei). Source: https://github.com/junhao-luo/junhao-luo main. Vercel project: junhao-luos-projects/junhao-luo, Hobby. Verified deployment: https://junhao-luo.vercel.app/.

## Website DNS rollback

Namecheap BasicDNS remains authoritative. Prior apex A records, each TTL 30 minutes:
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

Vercel's project domain screen specifies A @ 216.198.79.1. Preserve all MX/TXT/DKIM/SPF and other mail records. Do not change nameservers. To roll back website routing, restore the four prior A records and remove the Vercel apex target. Keep GitHub Pages configured during cutover until Vercel HTTPS and routing are verified.

Portfolio remains at https://eljhon.me/. CourseDock's intended path is /student-dashboard; this migration does not publish the unfinished student app. Its subpath build, routing, production auth/backend and release gates remain to implement.

## Completed migration

The user installed the GitHub integration. Imported only the portfolio repository into Vercel Hobby and deployed the existing main branch without code changes. Apex serves Production directly; www redirects permanently (308) to the apex. Updated Namecheap A @ to 216.198.79.1 and CNAME www to 4c37faccc8f89afe.vercel-dns-017.com. The previous www CNAME was eljhon.me. Both records retain their 30-minute TTL. Email and other TXT/CNAME/MX records were not edited.

Verified live HTTPS responses: apex 200 with Server: Vercel and x-vercel-id; www 308 to https://eljhon.me/; profile.jpg and privacy.html both 200 from Vercel. Both domains display Valid Configuration in Vercel. Browser checks passed English/Traditional Chinese headings and study/contact navigation. No inquiry email was sent, so actual contact delivery was not tested. The Cloudflare Worker URL is unchanged; its canonical eljhon.me origin is unchanged. GitHub Pages configuration is retained for rollback, but current website DNS serves Vercel. DNS caches may temporarily retain the previous provider.
