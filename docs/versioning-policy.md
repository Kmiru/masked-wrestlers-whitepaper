# Versioning Policy — Whitepaper & Catalog

## Whitepaper
- Use semantic versioning: `whitepaper vMAJOR.MINOR.PATCH`
- Increment:
  - MAJOR: breaking rule changes (tiers/slots/progression gates)
  - MINOR: new sections/features explained
  - PATCH: typo fixes, clarifications

## Catalog (data/)
- Catalog files are **immutable** once published:
  - `data/catalog.v1.json` must never be edited in place.
- Changes create new files:
  - `data/catalog.v1.0.1.json` for small fixes
  - `data/catalog.v2.json` for new ranges/structures

## Hash pinning
- For each catalog JSON, commit a matching sha256 file:
  - `data/catalog.v1.json` → `data/catalog.v1.sha256`
- CI will compute and verify the hash file matches.

## Naming
- Ring Gear slot name: **TOP** (not shirt). Keep the UI and docs consistent.
