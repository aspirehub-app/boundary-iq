# ADR-0006: Ship as a PWA with an offline service worker

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

Farmers use the app **in the field**, where mobile connectivity is often weak or
absent. The app must keep functioning once loaded, be installable on a phone's
home screen for quick, full-screen access and avoid depending on a live CDN for
its libraries. There is no app store distribution
([ADR-0002](0002-zero-build-static-spa.md)).

## Decision

Package BoundaryIQ as a **Progressive Web App**: a web manifest
(`manifest.webmanifest`) for installability, a **service worker** (`sw.js`) that
precaches the app shell **locally vendored** libraries (Leaflet, Turf) so
nothing critical is fetched from a CDN at runtime.

Caching strategy:
- **App shell** (HTML, CSS, JS, vendored libs, icons): **cache-first** for
  same-origin requests.
- **Map tiles / cadastre** (cross-origin): **network-first with cache fallback**,
  so previously viewed areas remain available offline.

## Consequences

### Positive
- **Works offline** after first load; previously seen map areas stay usable.
- **Installable** ("Add to Home screen") with a full-screen, app-like experience.
- **No CDN dependency** at runtime - resilient and private.
- Versioned cache name enables clean updates.

### Negative / trade-offs
- Service workers require a **secure context** (HTTPS/localhost), so offline
  caching doesn't apply when opening via `file://`
  ([ADR-0008](0008-geolocation-secure-context.md)).
- Cache invalidation requires bumping the cache name on each release
  (documented in [Deployment](../technical/deployment.md)).
- **Map tiles for unseen areas** still need a network - users should pre-load
  their field area while online (documented).

### Neutral
- The app fully functions without the service worker (just online-only); the SW
  is a progressive enhancement.

## Alternatives considered

- **No offline support** - rejected: unacceptable for field use.
- **Bundle/cache map tiles for a region (MBTiles/offline packs)** - powerful but
  heavy and complex; deferred. Tile caching of visited areas covers most needs.
- **Native app for offline** - rejected for the reasons in
  [ADR-0002](0002-zero-build-static-spa.md).
