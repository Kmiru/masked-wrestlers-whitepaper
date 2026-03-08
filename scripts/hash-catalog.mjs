#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

function sha256(buf){ return crypto.createHash("sha256").update(buf).digest("hex"); }

function main(){
  const arg = process.argv[2] || "data/catalog.v1.json";
  const p = path.resolve(ROOT, arg);
  if(!fs.existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
  const h = sha256(fs.readFileSync(p));
  const out = p.replace(/\.json$/i, ".sha256");
  fs.writeFileSync(out, h + "\n", "utf8");
  console.log(`Wrote ${path.relative(ROOT,out)}\n${h}`);
}
main();
