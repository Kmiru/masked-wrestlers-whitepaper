# Smart contract architecture (optional, ready-to-build)

Masked Wrestlers is a real-time game. Combat simulation runs off-chain; the chain is used for **ownership**, **equip locks**, and **progression claims**.

## Contracts (reference design)

- **MaskNFT (ERC-721)**  
  Stores mask tier per token (Common / Rare / Legendary).

- **PatchToken (ERC-1155)**  
  “Mask Accessories” token. On-chain metadata per accessory id: tier, slotType (Trait/Moves/Power), and effects.

- **GameCore (core)**  
  Holds equipped items via escrow/lock, validates rules (tier/level/slot), and processes signed match results.

- **PlayerProfile (optional)**  
  Stores XP/level per wallet or per profile (wallet storage or soulbound).

- **OutfitToken / GearToken (optional)**  
  If ring gear ever becomes tokenized, it must be ERC-1155 and still obey caps + locks.

## Minimal state in GameCore (example)

- `equippedMask[profileId] = maskTokenId`
- `equippedPatch[profileId][slot] = patchId`
- `equippedOutfit[profileId][gearSlot] = itemId`
- `xp[profileId]`, `level[profileId]`
- `claimedMatch[matchId] = true`
- `authorizedSigner = game server`

## Core functions (example)

- `equipMask(profileId, maskTokenId)`
- `equipPatch(profileId, patchId)` with tier + slot + level validation and escrow transfer
- `equipOutfit(profileId, gearSlot, itemId)` (optional)
- `claimMatchResult(matchId, profileId, xpGained, loadoutHash, signature)`  
  Verifies EIP-712 signature, checks matchId unused, validates current loadout hash, and credits XP.

## Why server-signed claims?

It keeps the chain light and the game secure:

- the server simulates combat and determines results,
- the contract only verifies and updates progression.
