import { execSync } from "node:child_process";
import fs from "node:fs";

const bad = [
  "[the full updated content]",
  "[full correct Home.tsx code as above]",
  "<<<<<<<",
  ">>>>>>>",
];

const files = execSync("git ls-files", { encoding: "utf8" })
  .split(/\r?\n/)
  .filter((f) => f && /\.(tsx?|jsx?|css|json|md|html)$/i.test(f));

const hits = [];
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const text = fs.readFileSync(f, "utf8");
  for (const b of bad) {
    if (text.includes(b)) hits.push(`${f}: contains ${JSON.stringify(b)}`);
  }
  const trimmed = text.trim();
  if (trimmed.length < 80 && /^\[.*\]$/.test(trimmed)) {
    hits.push(`${f}: looks like placeholder-only content`);
  }
}

if (hits.length) {
  console.error("Placeholder / corrupt file content detected:");
  for (const h of hits) console.error(" -", h);
  process.exit(1);
}

console.log(`OK: scanned ${files.length} tracked source files for placeholders`);
