# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Project maintainers

## Context

BoundaryIQ makes several deliberate, opinionated choices (no backend, no
framework, no auth) that may look surprising without their rationale. As the
project grows and new contributors arrive, the reasoning behind these choices
needs to be discoverable and durable - not buried in chat logs or lost when a
maintainer moves on.

## Decision

We will keep **Architecture Decision Records** in `docs/adr/`, one Markdown file
per decision, numbered sequentially (`NNNN-short-title.md`). Each ADR captures
context, the decision, consequences and alternatives considered. ADRs are
append-only: a decision is changed by adding a new ADR that **supersedes** the
old one, never by rewriting history.

## Consequences

### Positive
- New contributors can understand *why*, not just *what*.
- Decisions are debated and documented deliberately.
- A clear audit trail of how the architecture evolved.

### Negative / trade-offs
- Small ongoing discipline to write and maintain ADRs.

### Neutral
- ADRs live alongside the rest of the documentation and are linked from technical
  docs.

## Alternatives considered

- **No formal record** - rejected; institutional knowledge erodes quickly.
- **A single CHANGELOG/notes file** - rejected; mixes user-facing changes with
  architectural rationale and doesn't scale.
- **Wiki / external tool** - rejected; we want decisions versioned *with the
  code* in the repo.
