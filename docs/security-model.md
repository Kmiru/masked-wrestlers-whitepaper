# Security Model (Draft) — Masked Wrestlers

This document defines the minimum security expectations for the project **before** real users, value, or live services exist.

## Threats we design against
### Web / docs
- XSS via Markdown rendering or injected HTML
- Supply-chain risk via third-party CDNs/scripts
- Link spoofing / phishing via unverified external links

### Gameplay (future)
- Client tampering (speed hacks, packet injection, automation)
- Match result forgery (fake receipts)
- Replay attacks (reusing a match receipt / matchId)

### Economy (future)
- Marketplace abuse loops (equip → benefit → sell)
- Key compromise (admin keys / signer keys)
- Wager collusion (if wagers are introduced)

## Non-negotiable invariants
- A `matchId` must never be claimable twice (anti-replay).
- A match reward must be bound to the **exact loadout** used (loadoutHash).
- Equipped assets must be protected from exploit loops (lock/escrow rules).
- Admin privileges must be multi-party (multi-sig); no single-person hot wallet.
- A pause/kill-switch must exist for emergencies (claims/equip/market hooks).

## Static site rules
- Markdown rendering must be sanitized (no raw script execution).
- Avoid CDN execution in production; if used, require SRI + strict CSP.
- All official links must be listed on the website as "verified sources."
