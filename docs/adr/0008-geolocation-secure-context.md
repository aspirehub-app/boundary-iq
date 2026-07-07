# ADR-0008: Browser Geolocation API + secure-context strategy

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

Live tracking is the app's core. The only positioning hardware we can assume the
user has is the **phone's GPS**, exposed to the web via the **Geolocation API**.
That API (and service workers) only function in a **secure context**: HTTPS,
`http://localhost` or a `file://` page. We also need a way to develop and demo
the logic **without** a live GPS fix.

## Decision

Use the standard **`navigator.geolocation.watchPosition`** with
`enableHighAccuracy: true` for continuous tracking, deriving heading from
successive fixes when the device doesn't supply it. Document and support three
secure-context paths: **HTTPS hosting** (recommended for field use),
**`localhost`** (development) **opening the file directly** (`file://`, for
quick desktop trials). Provide a **Test mode** that simulates positions by
tapping the map, so the full alert pipeline can be exercised without GPS.

## Consequences

### Positive
- Uses ubiquitous, free, native hardware - no extra device or cost.
- High-accuracy mode and a continuous watch suit moving machinery.
- **Test mode** enables development, demos onboarding indoors.
- Graceful heading estimation when the sensor omits it.

### Negative / trade-offs
- **Plain `http://` on a remote server is blocked** - users *must* host over
  HTTPS for field use; this is prominently documented
  ([Deployment](../technical/deployment.md), [Troubleshooting](../user-guide/troubleshooting.md)).
- Consumer GPS accuracy is ~3-10 m, addressed by the safety margin
  ([ADR-0009](0009-inward-buffer-safety-model.md)) and accuracy readout.
- Continuous GPS + awake screen drains battery (documented; Wake Lock is
  optional).

### Neutral
- iOS Safari lacks the Vibration API; alerts degrade to visual + audio.

## Alternatives considered

- **External Bluetooth/RTK GNSS receivers** - far better accuracy but cost and
  pairing complexity conflict with "use the phone you have"; left as a future
  optional enhancement.
- **IP/Wi-Fi geolocation** - far too coarse for boundary work.
- **Mocking only (no real GPS)** - insufficient for the actual product.
