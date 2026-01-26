// src/catalog/loadCatalog.ts
import fs from "node:fs";
import path from "node:path";
import { buildCatalogIndex, type CatalogFile, type CatalogIndex, validateCatalogFile } from "./types";

/**
 * Load catalog from:
 * - a file path (Node)
 * - an http(s) URL (browser/Node with fetch)
 * - an already-parsed object
 */
export async function loadCatalog(source: string | URL | CatalogFile): Promise<CatalogIndex> {
  const file = await resolveCatalogFile(source);
  return buildCatalogIndex(file);
}

async function resolveCatalogFile(source: string | URL | CatalogFile): Promise<CatalogFile> {
  if (typeof source === "object" && source && "items" in source) {
    validateCatalogFile(source);
    return source as CatalogFile;
  }

  const src = String(source);

  if (src.startsWith("http://") || src.startsWith("https://")) {
    const res = await fetch(src, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status} ${res.statusText}`);
    const json = (await res.json()) as unknown;
    validateCatalogFile(json);
    return json as CatalogFile;
  }

  const abs = path.isAbsolute(src) ? src : path.resolve(process.cwd(), src);
  if (!fs.existsSync(abs)) throw new Error(`Catalog file not found: ${abs}`);
  const raw = fs.readFileSync(abs, "utf8");
  const json = JSON.parse(raw) as unknown;
  validateCatalogFile(json);
  return json as CatalogFile;
}
