# ADR-0005: Persist state in localStorage with no authentication

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

The product explicitly requires working **without any authentication** while
**preserving entered data as state**. Users are farmers who should not have to
create accounts or manage passwords. The data involved (field outlines, equipment
settings, preferences) is personal but small and does not need to be shared or
synced server-side for the core use case. There is also no backend
([ADR-0002](0002-zero-build-static-spa.md)) to host accounts or a database.

## Decision

Persist the **entire application state as a single JSON object** in the browser's
`localStorage` under the key `BoundaryIQ.v1`. **No authentication, no accounts,
no server storage.** Provide **Export/Import** to a JSON file for backup and
device migration.

## Consequences

### Positive
- **No login friction** - open and use immediately.
- **Privacy by default** - data never leaves the device
  ([Security & Privacy](../technical/security-privacy.md)).
- **Zero backend cost** and no PII to safeguard.
- Synchronous, simple API; trivial to serialise/restore.
- Versioned key (`.v1`) enables future migrations
  ([Data Model](../technical/data-model.md)).

### Negative / trade-offs
- **Device/browser-bound** - clearing site data or switching devices loses data
  unless exported. Mitigated by Export/Import.
- **No automatic cross-device sync** - out of scope for now.
- **Not encrypted at rest** beyond OS/browser protections - anyone with the
  unlocked device can read it. Acceptable for the data's sensitivity; documented.
- `localStorage` has a size limit (~5 MB) - far beyond our small state.

### Neutral
- Private/incognito sessions discard storage on close (documented in
  Troubleshooting).

## Alternatives considered

- **IndexedDB** - more capacity and async, but more complex API for what is a
  tiny object. Could be revisited if we store large coverage maps/tracks.
- **Accounts + cloud sync** - rejected: violates the no-auth requirement, adds a
  backend, cost privacy obligations.
- **URL-encoded state / file-only** - rejected as the primary store; too fragile
  for everyday use (though Export/Import covers file portability).
