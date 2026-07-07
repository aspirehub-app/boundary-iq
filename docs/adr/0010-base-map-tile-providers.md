# ADR-0010: Free base-map tile providers (OSM / Esri / OpenTopo)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

To trace a field accurately, users need a clear **satellite/aerial** background;
for orientation they benefit from **street** and **topographic** maps. The
product must remain **free** and require **no API key or billing account**
(consistent with [ADR-0002](0002-zero-build-static-spa.md) and
[ADR-0003](0003-leaflet-for-mapping.md)).

## Decision

Offer three switchable base layers, all usable without keys:

| Key | Provider | Layer |
|---|---|---|
| `sat` (default) | **Esri** | World Imagery (satellite/aerial) |
| `osm` | **OpenStreetMap** | Standard street map |
| `topo` | **OpenTopoMap** | Topographic |

Satellite is the default because tracing field edges is the primary task.
Required attributions are shown on the map.

## Consequences

### Positive
- **No API keys, no accounts, no cost.**
- Satellite imagery makes corner-tracing accurate and intuitive.
- Multiple perspectives (imagery/street/terrain) suit different needs.
- Tiles are cached by the service worker for offline reuse of visited areas
  ([ADR-0006](0006-pwa-offline-support.md)).

### Negative / trade-offs
- **Dependence on third-party tile services** and their fair-use terms; heavy or
  commercial use should review each provider's policy and consider self-hosting
  or a paid tile plan.
- Imagery **freshness/resolution** varies by region and is outside our control.
- Public tile endpoints can rate-limit or change; mitigated by offering multiple
  providers and the ability to extend the list.

### Neutral
- The cadastre overlay ([ADR-0007](0007-geosrbija-inspire-wms-cadastre.md)) is a
  separate, optional layer drawn above whichever base map is selected.

## Alternatives considered

- **Google/Mapbox imagery** - higher-quality in places but require API keys and
  billing; rejected on the free/no-account principle.
- **Self-hosted tiles** - full control and no third-party dependency, but
  significant storage/serving cost and complexity; conflicts with the
  zero-backend model. Could be offered as an optional custom source later.
- **Single base layer** - rejected: satellite alone is poor for orientation;
  street/topo add real value.
