# Deploy the Yanagaman preview

Repository: https://github.com/madhushanshaminda304-sketch/yanagaman
Target: a free Render Static Site in the user's confirmed My Workspace.

## Build settings
- Branch: main
- Build command: npm ci && npm run build
- Publish directory: dist
- Node version: 24
- SKIP_INSTALL_DEPS: true
- No start command, API, database, disk, or paid instance.

## Configuration
render.yaml declares the static site, SPA rewrite to /index.html, noindex response headers, and security/cache headers. Those settings apply when imported as a Blueprint. Creating a service directly through the connector does not automatically import the Blueprint's routes or headers: configure these separately in the Dashboard when using direct creation.

The preview's three screens use root query parameters (?view=search, ?view=post, ?view=bookings), so refreshing those URLs works on a static site without path rewrites. HTML robots metadata and robots.txt prevent indexing independently of response headers.

## Deployment checks
Run npm run build, npm test, npm run lint, and npm run test:browser before pushing.
Wait for the specific Render deployment to reach live, then verify the page, images, fonts, noindex metadata, sample search, demo booking, posting, cancellation, session restoration, reset, and mobile navigation. BASE_URL can point the browser test at the live URL.

## Future real bookings
The server and Docker files remain only in the original local project and are excluded from this public repository. Real trips require authentication, authorization, persistent hosted storage, trustworthy verification and safety flows, and a separate readiness review. Local SQLite files do not persist on Render free web services.
