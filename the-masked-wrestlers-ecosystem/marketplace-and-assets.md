# Marketplace and assets

If assets are tradable, the system must prevent exploit loops.

Key mechanisms:

- **Equip escrow/lock**: tradable items are locked while equipped.
- **Match-bound loadouts**: a match uses a loadout hash (mask + accessories + gear) to prevent swapping mid-match.
- **Signed XP claims**: only server-signed match receipts can credit progression.
