# ADR-0002: Zero-build, fully client-side static app (no backend)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

The product goal is a **free** boundary assistant for farmers, runnable by anyone
with minimal friction and **zero operating cost**. The core function - "is this
GPS point inside my field polygon how far from the edge?" - is pure local
geometry that needs no server. The target users may have intermittent
connectivity in the field. Additionally, the development environment had **no
Node.js or Python installed**, so a tooling-heavy stack would add friction even
to get started.

## Decision

Build BoundaryIQ as a **fully client-side, static web application with no build
step and no backend.** Plain HTML/CSS/vanilla JavaScript, with third-party
libraries vendored locally. The app is just files a browser opens; "deployment"
is copying those files to any static host.

## Consequences

### Positive
- **€0 to operate** - no servers, no scaling, no maintenance windows.
- **Trivial to run** - open the file or drop the folder on a free static host.
- **Privacy by construction** - with no server, user data can't be centrally
  collected or breached (see [ADR-0005](0005-localstorage-no-auth.md)).
- **Longevity** - no build pipeline to rot; the app keeps working for years.
- **Works offline** as a PWA (see [ADR-0006](0006-pwa-offline-support.md)).

### Negative / trade-offs
- **No server-side cross-device sync** - mitigated with manual Export/Import.
- **No central place to compute/store** - heavy data or share boundaries between
  users (acceptable for the current scope).
- **All logic ships to the client** - fine here; there are no secrets.

### Neutral
- Future server-backed features (community boundaries, accounts) would require a
  new ADR superseding this one.

## Alternatives considered

- **React/Vite SPA** - rejected: requires Node toolchain (not installed), adds
  build complexity and bundle weight for a small UI. (See
  [ADR-0003](0003-leaflet-for-mapping.md) context.)
- **Full-stack app with a backend + database** - rejected: introduces hosting
  cost, accounts, privacy risk and operational burden, none of which the core
  feature needs.
- **Native mobile app** - rejected: app-store friction and per-platform builds
  conflict with "open the link and go"; a PWA is installable anyway.
