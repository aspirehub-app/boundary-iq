# ADR-0007: Configurable GeoSrbija INSPIRE WMS cadastre overlay

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

The product must work with **Serbian official cadastre data** (and ideally other
public/official sources). Serbia publishes cadastral parcels through the
**GeoSrbija** geoportal operated by the Republic Geodetic Authority (RGZ).
Investigation found there is **no single public endpoint for all layers**;
services are discovered via a metadata catalogue. However, an INSPIRE-harmonised
**WMS view service** for cadastral parcels exists and is publicly reachable.

We must help users align their drawn field with official boundaries, while
respecting that consumer GPS and a traced outline are **not** legally
authoritative.

## Decision

Integrate the cadastre as a **configurable WMS overlay** rendered by Leaflet,
defaulting to:

- **URL:** `https://inspire.geosrbija.rs/wms/cp`
- **Layer:** `CP.CadastralParcel` (INSPIRE Cadastral Parcels theme)

The overlay is **optional** (off by default), **opacity-adjustable** the URL
and layer name are **user-editable**, with a "Custom WMS..." preset so any other
public WMS (other countries/sources) can be used. We **do not** auto-import
parcel geometry; the user **traces** their parcel using the overlay as a visual
guide.

## Consequences

### Positive
- Uses **authoritative, official, free** public data.
- **Country-agnostic** - any public WMS works via the custom preset.
- Decouples the app from any single provider's quirks/availability.
- Keeps legal responsibility clear: the overlay guides, the user decides.
- No data scraping/redistribution - only standard view-service requests.

### Negative / trade-offs
- WMS endpoints/terms/availability can change; a broken default is mitigated by
  user-editable settings and an in-app tile-error message.
- Leaflet requests tiles in **EPSG:3857**; a source serving only another CRS
  won't display (documented in
  [Cadastre Integration](../technical/cadastre-integration.md)).
- **Manual tracing** is less convenient than automatic import.

### Neutral
- Attribution "Cadastre © RGZ / GeoSrbija" is shown on the map.

## Alternatives considered

- **Automatic parcel import via WFS / GetFeatureInfo** - attractive UX, but
  endpoint availability, layer naming CRS vary and were not reliably
  confirmed; deferred as a future enhancement.
- **Hard-coding one fixed provider/layer** - rejected: brittle and not reusable
  for other regions.
- **Bundling static cadastre data** - rejected: large, quickly stale a
  redistribution/licensing concern.
