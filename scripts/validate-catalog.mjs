#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

const PATCH_SLOTS = new Set(["TRAIT", "MOVES", "POWER"]);
const GEAR_SLOTS = new Set(["BOOTS", "TIGHTS", "TOP", "CAPE"]);
const TYPES = new Set(["PATCH", "OUTFIT"]);
const TIERS = new Set(["COMMON", "RARE", "LEGENDARY", "ANY"]); // ANY used for outfit items

function findCatalogCandidates() {
  const candidates = [
    "data/catalog.v1.json",
    "data/catalog.v1.0.0.json",
    "technical/catalog.v1.json",
    "technical/catalog.v1.0.0.json",
  ].map(p => path.join(ROOT, p));

  const found = candidates.filter(p => fs.existsSync(p));
  if (found.length) return found;

  // fallback: search for catalog.v*.json under data/ or technical/
  const roots = ["data", "technical"].map(d => path.join(ROOT, d)).filter(d => fs.existsSync(d));
  const globbed = [];
  for (const r of roots) {
    for (const file of fs.readdirSync(r)) {
      if (/^catalog\.v[\d.]+\.json$/i.test(file)) globbed.push(path.join(r, file));
    }
  }
  return globbed;
}

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function fail(msg) {
  console.error("\n❌ Catalog validation failed:\n" + msg + "\n");
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function isPlainObject(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

function validateIdRanges(catalog) {
  const ranges = catalog.idRanges ?? {};
  const hasShirt = "outfit_shirt" in ranges;
  const hasTop = "outfit_top" in ranges;

  if (hasShirt && !hasTop) {
    console.warn("⚠️  idRanges includes 'outfit_shirt'. Recommend renaming to 'outfit_top' (slot name is TOP).");
  }
}

function expectedRangeKey(item) {
  if (item.type === "PATCH") {
    const tier = item.tier.toLowerCase();
    const slot = item.slot.toLowerCase();
    return `patch_${tier}_${slot}`;
  }
  if (item.type === "OUTFIT") {
    const slot = item.slot.toLowerCase();
    if (slot === "top") return "outfit_top";
    return `outfit_${slot}`;
  }
  return null;
}

function validateItems(catalogPath, catalog) {
  assert(isPlainObject(catalog), `${catalogPath}: catalog must be a JSON object`);
  assert(Array.isArray(catalog.items), `${catalogPath}: catalog.items must be an array`);

  validateIdRanges(catalog);

  const seen = new Set();
  for (const it of catalog.items) {
    assert(isPlainObject(it), `${catalogPath}: each item must be an object`);
    const id = Number(it.id);
    assert(Number.isInteger(id) && id > 0, `${catalogPath}: item.id must be a positive integer (got ${it.id})`);
    assert(!seen.has(id), `${catalogPath}: duplicate item id found: ${id}`);
    seen.add(id);

    assert(typeof it.type === "string" && TYPES.has(it.type), `${catalogPath}: item ${id} has invalid type ${it.type}`);
    assert(typeof it.tier === "string" && TIERS.has(it.tier), `${catalogPath}: item ${id} has invalid tier ${it.tier}`);
    assert(typeof it.slot === "string", `${catalogPath}: item ${id} missing slot`);
    assert(typeof it.name === "string" && it.name.trim().length > 0, `${catalogPath}: item ${id} missing name`);
    assert(Number.isInteger(Number(it.minLevel)) && Number(it.minLevel) >= 1, `${catalogPath}: item ${id} has invalid minLevel ${it.minLevel}`);

    if (it.type === "PATCH") {
      assert(PATCH_SLOTS.has(it.slot), `${catalogPath}: PATCH item ${id} has invalid slot ${it.slot}`);
      assert(it.tier !== "ANY", `${catalogPath}: PATCH item ${id} tier cannot be ANY`);
    } else if (it.type === "OUTFIT") {
      assert(GEAR_SLOTS.has(it.slot), `${catalogPath}: OUTFIT item ${id} has invalid slot ${it.slot}`);
      assert(TIERS.has(it.tier), `${catalogPath}: OUTFIT item ${id} has invalid tier ${it.tier}`);
    }

    for (const k of ["mods","ability","kit","costs","cooldowns","tradeoffs","counterplay"]) {
      if (it[k] !== undefined) {
        assert(isPlainObject(it[k]), `${catalogPath}: item ${id} field '${k}' must be an object`);
      }
    }

    if (catalog.idRanges && isPlainObject(catalog.idRanges)) {
      const key = expectedRangeKey(it);
      if (key && catalog.idRanges[key]) {
        const [min, max] = catalog.idRanges[key];
        if (!(id >= min && id <= max)) {
          fail(`${catalogPath}: item ${id} expected in range ${key}=[${min},${max}] but got id=${id}`);
        }
      } else if (key === "outfit_top" && catalog.idRanges["outfit_shirt"]) {
        const [min, max] = catalog.idRanges["outfit_shirt"];
        assert(id >= min && id <= max, `${catalogPath}: TOP item ${id} expected in outfit_shirt range [${min},${max}]`);
      }
    }
  }

  console.log(`✅ ${catalogPath}: ${catalog.items.length} items validated`);
}

function verifyHashFile(catalogPath) {
  const hash = sha256File(catalogPath);
  const shaPath = catalogPath.replace(/\.json$/i, ".sha256");

  if (!fs.existsSync(shaPath)) {
    fail(`Missing hash file for ${path.basename(catalogPath)}.\nCreate ${shaPath} containing exactly:\n${hash}\n\nGenerate it with:\nnode scripts/hash-catalog.mjs ${path.relative(ROOT, catalogPath)}\n`);
  }

  const expected = fs.readFileSync(shaPath, "utf8").trim();
  assert(expected === hash, `Hash mismatch for ${catalogPath}\nExpected (from ${shaPath}): ${expected}\nActual: ${hash}\n`);
  console.log(`✅ ${path.relative(ROOT, shaPath)} matches sha256 of ${path.relative(ROOT, catalogPath)}`);
}

function main() {
  const catalogs = findCatalogCandidates();
  if (!catalogs.length) {
    fail("No catalog file found. Expected one of:\n- data/catalog.v1.json\n- technical/catalog.v1.json\n(or any catalog.v*.json under data/ or technical/)");
  }

  for (const catalogPath of catalogs) {
    const raw = fs.readFileSync(catalogPath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      fail(`${catalogPath}: invalid JSON: ${e.message}`);
    }
    validateItems(catalogPath, parsed);
    verifyHashFile(catalogPath);
  }

  console.log("\n✅ Catalog validation + hash verification complete.\n");
}

main();
