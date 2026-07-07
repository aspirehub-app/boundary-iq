# ADR-0003: Use Leaflet for map rendering

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

The app needs an interactive map to: draw/trace field polygons, display the field
and safe zone, show a live equipment marker, switch base layers (streets/satellite/
topo) overlay a cadastre **WMS**. It must be lightweight, touch-friendly for
phones in the field, work without an API key or account integrate into a
no-build, vanilla-JS app (see [ADR-0002](0002-zero-build-static-spa.md)).

## Decision

Use **Leaflet 1.9.x** for all map rendering, vendored locally in `vendor/`.

## Consequences

### Positive
- **Small and fast**, excellent on mobile and touch.
- **No API key/account** required to use it.
- **First-class WMS support** (`L.tileLayer.wms`) - essential for the cadastre
  overlay ([ADR-0007](0007-geosrbija-inspire-wms-cadastre.md)).
- Simple primitives (`polygon`, `polyline`, `circleMarker`, `divIcon`) cover all
  our drawing needs, including a CSS-rotated equipment heading marker.
- Permissive **BSD-2** licence; aligns with the free/open-source mandate.
- Drops into a `<script>` tag with zero build tooling.

### Negative / trade-offs
- Raster-tile based (not vector tiles) - fine for our use, but high-zoom imagery
  detail depends on the tile provider.
- Advanced styling/3D is limited vs. WebGL engines - not needed here.

### Neutral
- We pin a specific version and vendor it; upgrades are a deliberate file swap +
  service-worker cache bump.

## Alternatives considered

- **MapLibre GL JS** - powerful vector rendering, but heavier, WebGL-dependent 
  and overkill for raster tiles + simple polygons; more complex with no build.
- **OpenLayers** - very capable (and strong WMS support) but larger and more
  complex API than needed.
- **Google Maps JS API** - rejected: requires an API key and billing account,
  conflicting with the free/no-account principle.
- **Hand-rolled canvas map** - rejected: enormous effort to reimplement tiling,
  panning, projections and WMS.
