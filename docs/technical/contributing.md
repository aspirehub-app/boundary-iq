# Contributing & Development

BoundaryIQ is intentionally simple to hack on: **no build, no install, no
tooling required.** Edit a file, refresh the browser.

## Prerequisites

- A modern browser (Chrome, Edge, Firefox, Safari).
- Optionally a static file server for full PWA/HTTPS testing (see
  [Deployment](deployment.md)).
- That's it. No Node, npm, bundler or framework.

## Run locally

```bash
# Easiest
open index.html            # or just double-click it

# With a server (enables service worker)
npx serve .                # or: python -m http.server 8080
```

## Project layout

```
index.html               UI shell & markup
styles.css               styling (CSS variables, mobile-first)
app.js                   all logic (see sections below)
manifest.webmanifest     PWA manifest
sw.js                    service worker (offline shell)
icon.svg                 app icon
vendor/                  pinned Leaflet + Turf.js (do not edit)
docs/                    this documentation
```

## Code organisation (`app.js`)

`app.js` is a single module with clearly delimited sections. Find them by their
banner comments:

| Section | Responsibility |
|---|---|
| State | `DEFAULT_STATE`, `loadState`, `saveState`, `deepMerge` |
| Helpers | `$`, `toast`, formatting, `activeField` |
| Map setup | base layers, `setBase`, cadastre WMS |
| Field layers | `renderField`, `turfToLeaflet`, vertices |
| Field selection | dropdown, new/delete |
| Drawing / Walk / Coordinates | three field-entry methods |
| Equipment calc | width/margin → keep-clear distance |
| Tracking | `watchPosition`, `pushPosition`, `evaluateBorder` |
| Alerts | `beep`, `handleAlerts`, vibration, wake lock |
| Geo math | `haversine`, `bearing` |
| Import / Export | JSON backup |
| UI wiring | `wireEvents`, `hydrateUI` |
| Boot | initialisation, service-worker registration |

## Conventions

- **Vanilla JS, ES2020+.** No transpilation; use only features supported by
  current evergreen browsers.
- **Single source of truth.** Mutate the `state` object, then call `saveState()`
  and the relevant `render...`/`setStatus`. Never store derived values.
- **Coordinate order.** Keep `[lat, lng]` everywhere except inside Turf calls;
  convert only via `fieldToTurf` / `turfToLeaflet`.
- **Metres for distances.** Always pass `{ units: 'meters' }` to Turf.
- **No comments that restate code.** Comment intent and constraints only.
- **Vendored libs are immutable.** Don't edit `vendor/`; to upgrade, replace the
  files and bump the SW cache.

## Adding a feature - checklist

1. If it adds persisted data, extend `DEFAULT_STATE` (additive changes are
   auto-merged on load - no migration needed).
2. Wire UI events in `wireEvents()` and reflect state in `hydrateUI()`.
3. Re-render via `renderField()` / `setStatus()` as appropriate.
4. If you add new shell files, add them to the `SHELL` list in `sw.js` and bump
   the cache name.
5. Update the relevant docs and, for notable design choices, add an
   [ADR](../adr/README.md).

## Testing

There is no automated test suite (kept deliberately tooling-free). Manual
verification:

- **Test mode** (Track tab) simulates positions - exercise ok/warn/danger
  transitions by tapping in, near outside a field.
- Verify on a real device outdoors for GPS behaviour.
- Check offline by loading once, then disabling the network.

> Contributions that add a lightweight, zero-config test harness for the pure
> geo-logic (e.g. `evaluateBorder` decision boundaries) are welcome, provided
> they don't introduce a mandatory build step for running the app.

## Releasing

1. Bump the cache name in `sw.js` (e.g. `BoundaryIQ-v2`).
2. Redeploy the static files (see [Deployment](deployment.md)).

---

*Next: [Glossary →](glossary.md) · [ADRs →](../adr/README.md)*
