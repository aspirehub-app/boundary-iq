# Architecture Decision Records (ADRs)

This folder records the **significant architectural decisions** made for
BoundaryIQ - what we decided, why and what it costs us. ADRs are immutable
history: instead of editing an old decision, we add a new one that supersedes it.

> Format inspired by Michael Nygard's
> [original ADR post](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
> and [MADR](https://adr.github.io/madr/).

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-zero-build-static-spa.md) | Zero-build, fully client-side static app (no backend) | Accepted |
| [0003](0003-leaflet-for-mapping.md) | Use Leaflet for map rendering | Accepted |
| [0004](0004-turf-for-geospatial-math.md) | Use Turf.js for geospatial calculations | Accepted |
| [0005](0005-localstorage-no-auth.md) | Persist state in localStorage with no authentication | Accepted |
| [0006](0006-pwa-offline-support.md) | Ship as a PWA with offline service worker | Accepted |
| [0007](0007-geosrbija-inspire-wms-cadastre.md) | Configurable GeoSrbija INSPIRE WMS cadastre overlay | Accepted |
| [0008](0008-geolocation-secure-context.md) | Browser Geolocation API + secure-context strategy | Accepted |
| [0009](0009-inward-buffer-safety-model.md) | Inward-buffer safety model (width/2 + margin) | Accepted |
| [0010](0010-base-map-tile-providers.md) | Free base-map tile providers (OSM / Esri / OpenTopo) | Accepted |

## Statuses

- **Proposed** - under discussion.
- **Accepted** - decided and in effect.
- **Superseded by ADR-XXXX** - replaced by a later decision.
- **Deprecated** - no longer relevant.

## Template

Copy this for a new ADR (`NNNN-short-title.md`):

```markdown
# ADR-NNNN: <short decision title>

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Deciders:** <who>

## Context
What problem/forces are we responding to?

## Decision
What we are doing, stated clearly.

## Consequences
### Positive
### Negative / trade-offs
### Neutral

## Alternatives considered
What else we evaluated and why we rejected it.
```

## When to write an ADR

Write one when a decision is **costly to reverse**, **affects the whole system**,
or **future contributors will ask "why on earth did they do it this way?"**
Routine choices don't need an ADR.
