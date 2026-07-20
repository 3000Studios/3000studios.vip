#!/usr/bin/env node
const { execSync } = require("node:child_process");
const bad = [
  "[the full updated content]",
  "[full correct Home.tsx code as above]",
  "<<<<<<<",
  ">>>>>>>",
];
let files = [];
try {
  files = execSync("git ls-files", { encoding: "utf8" })
    .split(/\r?\n/)
    .filter((f) => /\.(tsx?|jsx?|css|json|md|html)$/i.test(f));
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
const fs = require("node:fs");
const hits = [];
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const text = fs.readFileSync(f, "utf8");
  for (const b of bad) {
    if (text.includes(b)) hits.push(`${f}: contains ${JSON.stringify(b)}`);
  }
  // single-line placeholder-only files
  if (text.trim().length < 80 && /^\[.*\]$/.test(text.trim())) {
    hits.push(`${f}: looks like placeholder-only content`);
  }
}
if (hits.length) {
  console.error("Placeholder / corrupt file content detected:");
  hits.forEach((h) => console.error(" -", h));
  process.exit(1);
}
console.log(`OK: scanned ${files.length} tracked source files for placeholders`);
