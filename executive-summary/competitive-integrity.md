# Competitive integrity: fair play, anti-exploit, anti-P2W

Competitive integrity is a design constraint, not a marketing claim.

## Design goals

- **Fair play**: every build has counterplay.
- **Anti-exploit**: prevent “equip → fight → sell” loops.
- **Anti pay-to-win**: bonuses are capped, situational, and tradeoff-based.

## Non-negotiable rules

### Tier locks (mandatory)

- Common accessory ↔ Common mask  
- Rare accessory ↔ Rare mask  
- Legendary accessory ↔ Legendary mask  

### Slot rules (by mask tier)

- **Common**: 1 slot → Trait
- **Rare**: 2 slots → Trait + Moves
- **Legendary**: 3 slots → Trait + Moves + Power  
  ✅ Power exists only for Legendary masks.

### Level gates

- **Common Trait slot** unlocks at **level ≥ 8**
- **Legendary Power** unlocks at **level ≥ 50**

### Equip escrow/lock

Anything that provides build effects can be equipped via escrow:

- Equip = transfer the item to the game contract (locked)
- Unequip = return the item to the player

This prevents the classic “equip → play → sell” exploit while keeping trading possible.

### Global caps (sum of level + accessories + ring gear)

To keep ranked competitive even at very high levels, total bonuses are hard-capped:

- Total damage (effective STR): **max +18%**
- Effective mitigation (DEF): **max +15%**
- Stamina efficiency (costs/regen): **max ±15%**
- Ground mobility (walk/dash): **max +10%**
- Air mobility (air control/air dash): **max +12%**

Frame-data changes are essentially zero by default. Any exception must be tiny and rare.

## Match integrity (server-first)

- **Server-authoritative combat** for hits, cooldowns, stamina, knockback.
- **Match receipts** signed by the server before XP is credited.
- **Loadout hash** (mask + accessories + ring gear) bound to each match.

## Security note

The project will never ask for seed phrases. Always verify official links and contracts.
