// src/catalog/types.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type VersionString = `v${number}.${number}.${number}`;

export enum CatalogItemType {
  PATCH = "PATCH",
  OUTFIT = "OUTFIT",
}

export enum Tier {
  COMMON = "COMMON",
  RARE = "RARE",
  LEGENDARY = "LEGENDARY",
  ANY = "ANY",
}

export enum PatchSlot {
  TRAIT = "TRAIT",
  MOVES = "MOVES",
  POWER = "POWER",
}

export enum OutfitSlot {
  BOOTS = "BOOTS",
  TIGHTS = "TIGHTS",
  SHIRT = "SHIRT",
  CAPE = "CAPE",
}

export type CatalogSlot = PatchSlot | OutfitSlot;

export type JsonObject = Record<string, any>;

export interface CatalogItemBase {
  id: number;
  type: CatalogItemType | string;
  tier: Tier | string;
  slot: CatalogSlot | string;
  name: string;
  minLevel: number;

  mods?: JsonObject;
  ability?: JsonObject;
  kit?: JsonObject;
  costs?: JsonObject;
  cooldowns?: JsonObject;
  tradeoffs?: JsonObject;
  counterplay?: JsonObject;
}

export interface CatalogFile {
  version: VersionString | string;
  idRanges?: Record<string, [number, number]>;
  items: CatalogItemBase[];
}

export interface CatalogIndex {
  version: string;
  items: CatalogItemBase[];
  byId: Map<number, CatalogItemBase>;
  patches: CatalogItemBase[];
  outfits: CatalogItemBase[];
  patchesByTier: Map<string, CatalogItemBase[]>;
  outfitsBySlot: Map<string, CatalogItemBase[]>;
}

export function validateCatalogFile(file: any): asserts file is CatalogFile {
  if (!file || typeof file !== "object") throw new Error("Catalog must be an object");
  if (!("version" in file)) throw new Error("Catalog missing 'version'");
  if (!Array.isArray(file.items)) throw new Error("Catalog 'items' must be an array");

  const seen = new Set<number>();
  for (const it of file.items) {
    if (!it || typeof it !== "object") throw new Error("Item must be an object");
    const id = Number(it.id);
    if (!Number.isFinite(id)) throw new Error(`Invalid item id: ${String(it.id)}`);
    if (seen.has(id)) throw new Error(`Duplicate item id: ${id}`);
    seen.add(id);

    for (const k of ["type", "tier", "slot", "name"] as const) {
      if (!it[k] || typeof it[k] !== "string") {
        throw new Error(`Item ${id} missing/invalid '${k}'`);
      }
    }
    const minLevel = Number(it.minLevel);
    if (!Number.isFinite(minLevel) || minLevel < 1) {
      throw new Error(`Item ${id} has invalid minLevel: ${String(it.minLevel)}`);
    }
  }
}

export function buildCatalogIndex(file: CatalogFile): CatalogIndex {
  validateCatalogFile(file);

  const byId = new Map<number, CatalogItemBase>();
  const patches: CatalogItemBase[] = [];
  const outfits: CatalogItemBase[] = [];
  const patchesByTier = new Map<string, CatalogItemBase[]>();
  const outfitsBySlot = new Map<string, CatalogItemBase[]>();

  for (const it of file.items) {
    byId.set(it.id, it);

    if (it.type === CatalogItemType.PATCH) {
      patches.push(it);
      const key = it.tier;
      patchesByTier.set(key, [...(patchesByTier.get(key) ?? []), it]);
    } else if (it.type === CatalogItemType.OUTFIT) {
      outfits.push(it);
      const key = it.slot;
      outfitsBySlot.set(key, [...(outfitsBySlot.get(key) ?? []), it]);
    }
  }

  return {
    version: String(file.version),
    items: [...file.items].sort((a, b) => a.id - b.id),
    byId,
    patches,
    outfits,
    patchesByTier,
    outfitsBySlot,
  };
}
