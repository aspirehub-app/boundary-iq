# ADR-0009: Inward-buffer safety model (width/2 + margin)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

The phone reports the position of a single point - effectively the equipment
**centre** (wherever the phone is mounted). But what must not cross the
neighbour's border is the **edge of the implement**, which extends to the sides
by half the working width. We also need to absorb GPS error and human reaction
time. The model must be simple to reason about, cheap to compute every GPS tick
and easy for a farmer to understand.

## Decision

Define a single **keep-clear distance**:

```
keepClear = implementWidth / 2 + safetyMargin
```

- The equipment **centre** must stay at least `keepClear` from the boundary.
- Render a **safe working zone** as the field polygon **buffered inward** by
  `keepClear` (`turf.buffer(field, -keepClear, { units: 'meters' })`).
- Classify each position by distance `d` to the nearest edge:
  - `not inside` → **danger** (outside field)
  - `inside && d ≤ width/2` → **danger** (implement edge over the line)
  - `inside && d ≤ keepClear` → **warn** (within keep-clear)
  - else → **ok**

The banner emphasises the **implement-edge clearance** = `d − width/2`.

## Consequences

### Positive
- **Intuitive**: "keep the centre this far from the edge" and "stay inside the
  yellow zone."
- **Cheap**: one point-in-polygon + one point-to-line distance per update.
- **Tunable**: the margin lets each user trade caution against reclaimed area,
  accounting for their GPS quality and speed.
- The visual safe zone makes the abstract distance tangible.

### Negative / trade-offs
- **Assumes the phone is at the implement centre.** Off-centre mounting biases
  the result; documented with a "mount centrally" recommendation.
- **Ignores heading/asymmetry** - treats the implement as a symmetric half-width
  in all directions, which is conservative (safe) but not direction-aware.
- For fields **narrower than `2 × keepClear`**, the safe zone collapses to
  nothing - correctly signalling the implement can't fit without overhang.

### Neutral
- Distances use a geodesic metre via Turf; at field scale this is effectively
  exact.

## Alternatives considered

- **Centre-point only (ignore implement width)** - rejected: would warn too late;
  the implement could already be across the line.
- **Full implement footprint polygon swept along heading** - more precise but
  needs reliable heading, implement offset geometry and more computation;
  deferred as a future enhancement.
- **Fixed safety distance (no width input)** - rejected: ignores the actual
  equipment, the dominant factor.
