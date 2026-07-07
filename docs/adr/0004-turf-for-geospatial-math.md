# ADR-0004: Use Turf.js for geospatial calculations

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

The safety logic depends on correct geodesic geometry: testing whether a GPS
point is inside the field polygon, measuring the distance from the point to the
nearest boundary edge **in metres**, computing field area/perimeter
generating an **inward buffer** for the safe zone ([ADR-0009](0009-inward-buffer-safety-model.md)).
Implementing these correctly by hand (spherical distance, point-to-segment
projection, polygon offsetting) is error-prone bugs here directly undermine
the product's one job.

## Decision

Use **Turf.js 7.x** (modular, MIT-licensed) for all geospatial math, vendored
locally. Specifically: `booleanPointInPolygon`, `polygonToLine` +
`pointToLineDistance`, `buffer`, `area`, `length` and the `point`/`polygon`
constructors.

## Consequences

### Positive
- **Correct, well-tested** geodesic algorithms - we don't reinvent them.
- Pure JavaScript, no build step, drops in via `<script>`.
- MIT licence fits the open-source mandate.
- Clear, readable call sites keep `evaluateBorder()` easy to audit.

### Negative / trade-offs
- The full `turf.min.js` bundle is the largest asset (~0.5 MB). Acceptable: it's
  cached by the service worker and loaded once. A future optimisation could
  import only the needed functions to shrink this.
- Turf works in WGS84/GeoJSON `[lng, lat]`, requiring disciplined coordinate
  conversion (centralised in `fieldToTurf`/`turfToLeaflet`).

### Neutral
- Distances are computed with explicit `{ units: 'meters' }` throughout.

## Alternatives considered

- **Hand-written haversine + point-in-polygon only** - we *do* keep tiny
  `haversine`/`bearing` helpers for heading, but rejected hand-rolling
  point-to-line distance and polygon buffering due to correctness risk.
- **JSTS / GEOS-based libraries** - more powerful topology, but heavier and more
  complex than required.
- **Server-side geometry** - rejected; conflicts with the no-backend decision
  ([ADR-0002](0002-zero-build-static-spa.md)).
