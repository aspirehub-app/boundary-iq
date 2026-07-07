# Tech Stack

Every dependency is **free and open-source**, with a permissive licence is
**vendored locally** in `vendor/` so the app has no runtime CDN dependency.

## Summary

| Layer | Choice | Licence | Why |
|---|---|---|---|
| Language | Vanilla JavaScript (ES2020+) | - | No build step, no framework overhead, runs everywhere. |
| Mapping | [Leaflet](https://leafletjs.com) 1.9.4 | BSD-2-Clause | Lightweight, mobile-friendly, WMS support built in. |
| Geo-math | [Turf.js](https://turfjs.org) 7.x | MIT | Battle-tested geospatial functions in pure JS. |
| Base imagery | OpenStreetMap · Esri World Imagery · OpenTopoMap | Open / free tiers | Free tiles, no key required. |
| Cadastre | GeoSrbija / RGZ INSPIRE WMS | Public official data | Authoritative Serbian parcels. |
| Packaging | PWA (manifest + service worker) | Web standard | Installable, offline-capable, no app store. |
| Storage | `localStorage` (Web Storage API) | Web standard | Simple, synchronous, device-local persistence. |
| Device sensors | Geolocation, Web Audio, Vibration, Wake Lock APIs | Web standards | Native capabilities, no plugins. |

## Why vanilla JavaScript (no framework)?

- **Zero build.** No Node, npm, bundler or transpiler is required to run or
  ship the app. Open the file and it works. (See
  [ADR-0002](../adr/0002-zero-build-static-spa.md).)
- **Tiny footprint & long life.** No framework churn; the app will keep working
  for years with no dependency upgrades.
- **Right-sized.** The UI is a handful of tabs and a map - a framework would add
  weight without proportional benefit.

## Leaflet

Chosen for mapping because it is small, touch-first has first-class support
for tile layers and **WMS** overlays (needed for the cadastre). We use:

- `L.tileLayer` for OSM/Esri/OpenTopo base maps.
- `L.tileLayer.wms` for the GeoSrbija cadastre overlay.
- `L.polygon` / `L.polyline` / `L.circleMarker` / `L.divIcon` for the field,
  safe zone, vertices the rotating equipment marker.

See [ADR-0003](../adr/0003-leaflet-for-mapping.md).

## Turf.js

All geometry is delegated to Turf so we don't hand-roll error-prone spherical
math. Functions used:

| Turf function | Used for |
|---|---|
| `booleanPointInPolygon` | Am I inside my field? |
| `polygonToLine` + `pointToLineDistance` | Distance to the nearest border edge (in metres). |
| `buffer` (negative) | The inward "safe working zone". |
| `area`, `length` | Field statistics. |
| `point`, `polygon` | Building GeoJSON features. |

See [ADR-0004](../adr/0004-turf-for-geospatial-math.md).

## Map & data providers

| Provider | Layer | Notes |
|---|---|---|
| OpenStreetMap | Streets | Community tiles; attribution required. |
| Esri | World Imagery (satellite) | Default; best for tracing field edges. |
| OpenTopoMap | Topographic | Terrain context. |
| GeoSrbija / RGZ | `CP.CadastralParcel` (INSPIRE WMS) | Optional cadastre overlay, configurable. |

See [ADR-0010](../adr/0010-base-map-tile-providers.md) and
[Cadastre Integration](cadastre-integration.md).

## Browser APIs

| API | Purpose | Fallback |
|---|---|---|
| **Geolocation** (`watchPosition`) | Live tracking | Test mode (tap to simulate). |
| **Web Audio** | Beeps/alarms | Silent - visual banner still works. |
| **Vibration** | Haptic alerts | Ignored where unsupported (e.g. iOS Safari). |
| **Wake Lock** | Keep screen on | Graceful no-op if unavailable. |
| **Service Worker + Cache** | Offline shell | App still runs online without it. |

## What we deliberately avoid

- **No backend / database** - see [ADR-0005](../adr/0005-localstorage-no-auth.md).
- **No accounts / auth** - no PII, no login.
- **No analytics / trackers / ads.**
- **No CDN at runtime** - libraries are vendored for offline reliability.

---

*Next: [Data Model →](data-model.md) · [Deployment →](deployment.md)*
