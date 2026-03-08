#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function walk(dir, acc=[]) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === ".git") continue;
      acc = walk(p, acc);
    } else if (ent.isFile() && p.toLowerCase().endsWith(".md")) {
      acc.push(p);
    }
  }
  return acc;
}

function existsFile(relPath) {
  const p = path.resolve(ROOT, relPath);
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

function isExternal(href) {
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^#/.test(href);
}

function normalizeLink(fromFile, href) {
  const clean = href.split("#")[0].split("?")[0].trim();
  if (!clean) return null;
  if (isExternal(clean)) return null;
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(clean)) return null;

  const dir = path.dirname(fromFile);
  const resolved = path.normalize(path.join(dir, clean));
  const rel = path.relative(ROOT, resolved).replaceAll("\\", "/");
  return rel;
}

function main() {
  const files = walk(ROOT);
  const broken = [];

  const mdLinkRegex = /\[[^\]]*?\]\(([^)]+)\)/g;

  for (const file of files) {
    const txt = fs.readFileSync(file, "utf8");
    let m;
    while ((m = mdLinkRegex.exec(txt)) !== null) {
      const href = m[1].trim().replace(/^<|>$/g, "");
      const rel = normalizeLink(file, href);
      if (!rel) continue;

      const direct = rel;
      const asReadme = rel.endsWith("/") ? rel + "README.md" : rel + "/README.md";

      const ok = existsFile(direct) || existsFile(asReadme);
      if (!ok) broken.push({ from: path.relative(ROOT, file).replaceAll("\\", "/"), href, resolved: direct });
    }
  }

  if (broken.length) {
    console.error("\n❌ Broken internal markdown links found:");
    for (const b of broken.slice(0, 80)) {
      console.error(`- ${b.from} → (${b.href}) resolved as ${b.resolved}`);
    }
    if (broken.length > 80) console.error(`...and ${broken.length - 80} more`);
    console.error("\nFix: update the link target path or add the missing file.\n");
    process.exit(1);
  }

  console.log(`✅ Markdown link check: ${files.length} files checked`);
}

main();
