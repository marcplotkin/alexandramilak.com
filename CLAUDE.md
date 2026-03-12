# alexandramilak.com

Cloudflare Workers blog/membership site for Alexandra Milak.

## Stack
- **Runtime:** Cloudflare Workers
- **Database:** D1 (sunday-sauce-db, ID: a8db9b4b-27a8-4ac8-9ff9-dd92872f3def)
- **Storage:** R2 for media
- **Auth:** Magic link (email-based, no passwords)
- **Theme:** Dark burgundy (#1A0609)

## CSP / Asset Debugging
Before adding external domains to Content-Security-Policy headers:
1. Search D1 content for the resource (font, script, image URL)
2. Search source files for the resource
3. Only add to CSP if the resource is actually served by this site
4. Marc uses Comet browser (Perplexity) which injects FKGroteskNeue font — this is NOT a site issue

## Admin
- Admin email: alex.milak@gmail.com
- Test account: marc@marcplotkin.com
- GitHub: marcplotkin/alexandramilak.com
