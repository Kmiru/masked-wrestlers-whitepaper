# Masked Wrestlers — Technical Notes (v1)

## What this covers
This document summarizes the *implementable* technical rules for:
- Mask tier gating (Common / Rare / Legendary)
- Patch and ring-gear equip rules
- Loadout hashing
- Signed match claims (EIP-712)
- Catalog format (JSON/CSV) + versioning

## Core principles
- **Skill-first, not pay-to-win:** bonuses are small, capped, and come with tradeoffs.
- **Composable builds:** Mask NFT + optional Patches + 4 Ring Gear slots.
- **Anti-exploit:** the server signs match outcomes; on-chain logic verifies the claim matches the player’s current build.

## Progression & unlocks
Recommended milestones:
- **Level 8:** Common Trait patch slot unlocks
- **Level 50:** Legendary Power patch slot unlocks (Legendary masks only)

## Loadout definition
A loadout is defined by:
- `maskTokenId`
- Patch IDs: `traitPatchId`, `movesPatchId`, `powerPatchId` (use 0 for non-applicable)
- Ring Gear IDs: `bootsId`, `tightsId`, `shirtId`, `capeId`

### Loadout hash
Compute and bind claims to a build:

```
loadoutHash = hash(
  profileId, maskTokenId,
  traitPatchId, movesPatchId, powerPatchId,
  bootsId, tightsId, shirtId, capeId
)
```

## Contracts (recommended)
- **MaskNFT (ERC-721):** stores tier per token.
- **PatchToken (ERC-1155):** tradeable patches; locked while equipped.
- **OutfitToken (ERC-1155):** tradeable ring gear; locked while equipped.
- **GameCore:** validates equip rules, escrows equipped ERC-1155 items, and verifies signed match claims.
- (Optional) **PlayerProfile:** stores XP/level.

## Equip validation rules (v1)
### Patch tier & slot rules
- Patch tier must match the equipped mask tier.
- Slot availability depends on mask tier and player level:
  - **COMMON:** Trait only, **Level ≥ 8**
  - **RARE:** Trait + Moves
  - **LEGENDARY:** Trait + Moves; Power only if **Level ≥ 50**

### Ring gear rules
- Slots: Boots / Tights / Shirt / Cape
- Items may enforce `minLevel` (e.g., some capes at Level 50).

### Escrow/lock
When equipping an ERC-1155 item, transfer 1 unit to GameCore (escrow). When unequipping, transfer it back.

## Signed match claims (EIP-712)
### Server flow
1. Read the player’s current loadout + level.
2. Compute `loadoutHash`.
3. Simulate match and determine `xpGained`.
4. Sign an EIP-712 payload with `authorizedSigner`.

Minimum payload:
- `matchId` (unique)
- `player` address
- `xpGained`
- `loadoutHash`
- `chainId`, `verifyingContract`

### On-chain claim verification
`GameCore.claimMatchResult(matchId, xpGained, loadoutHash, signature)`:
- rejects already-claimed `matchId`
- validates signature
- recomputes the current `loadoutHash` and requires it equals the signed `loadoutHash`
- adds XP and recomputes level

## Catalog format (off-chain source of truth)
- `data/catalog.v1.json` and `data/catalog.v1.csv` are **immutable**
- changes go into `v1.0.1` or `v2` files
- optionally store a `catalogVersionHash` in GameCore for client/server consistency

### ID ranges
- Common Trait: 11000–11999
- Rare Trait: 12000–12999
- Rare Moves: 13000–13999
- Legendary Trait: 21000–21999
- Legendary Moves: 22000–22999
- Legendary Powers: 23000–23999
- Outfit Boots: 31000–31999
- Outfit Tights: 32000–32999
- Outfit Shirt: 33000–33999
- Outfit Cape: 34000–34999
