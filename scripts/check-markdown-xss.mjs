#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BAD_PATTERNS = [
  /<\s*script\b/i,
  /\bonerror\s*=\s*["']/i,
  /\bonload\s*=\s*["']/i,
  /\bjavascript\s*:/i,
  /<\s*iframe\b/i,
  /<\s*object\b/i,
  /<\s*embed\b/i,
];

function walk(dir, acc=[]) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) acc = walk(p, acc);
    else if (ent.isFile() && p.toLowerCase().endsWith(".md")) acc.push(p);
  }
  return acc;
}

function main() {
  const mdFiles = walk(ROOT);
  const hits = [];

  for (const file of mdFiles) {
    const txt = fs.readFileSync(file, "utf8");
    for (const re of BAD_PATTERNS) {
      if (re.test(txt)) hits.push({ file: path.relative(ROOT, file), pattern: String(re) });
    }
  }

  if (hits.length) {
    console.error("\n❌ Unsafe HTML/JS patterns detected in Markdown (XSS risk):");
    for (const h of hits) console.error(`- ${h.file} matched ${h.pattern}`);
    console.error("\nFix: remove raw HTML/JS from Markdown or sanitize rendering on the website.\n");
    process.exit(1);
  }

  console.log(`✅ Markdown XSS scan: ${mdFiles.length} files checked`);
}

main();
