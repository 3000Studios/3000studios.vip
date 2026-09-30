import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Safety net against the recurring "truncated push" failure mode:
// an agent's file edit writes a sentinel/placeholder as the ENTIRE file
// content (e.g. `__LOAD_FROM_DISK__`, `PLACEHOLDER_WILL_REPLACE`) and it
// gets committed and deployed, breaking the site. This script runs as a
// `prebuild` step so a placeholder can never reach production.
//
// Root cause history:
//   e81e5af  commerce.ts -> `__LOAD_FROM_DISK__` (committed, site broke)
//   394e451  music.ts    -> `PLACEHOLDER_WILL_REPLACE` (committed, site broke)
// Both were committed with misleading "restore full ..." messages, and this
// check existed but (a) never ran in CI/build ("ghost"), and (b) didn't even
// match the actual sentinels. Both gaps are fixed here.

const bad = [
  "[the full updated content]",
  "[full correct Home.tsx code as above]",
  "__LOAD_FROM_DISK__",
  "PLACEHOLDER_WILL_REPLACE",
  "<<<<<<<",
  ">>>>>>>",
];

// A file whose entire content is one SCREAMING_SNAKE token is never legitimate
// source — it's the signature of a failed agent edit that wrote its sentinel.
const WHOLE_FILE_SENTINEL = /^[A-Z][A-Z0-9_]{3,}$/;

const SOURCE_EXT = /\.(tsx?|jsx?|mts|cts|css|json|md|html)$/i;
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  ".turbo",
  "coverage",
  ".next",
  ".vercel",
]);

function gitTopLevel() {
  try {
    return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function walkFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkFiles(path.join(dir, entry.name), out);
    } else if (entry.isFile() && SOURCE_EXT.test(entry.name)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function listSourceFiles() {
  const top = gitTopLevel();
  if (top) {
    try {
      // Tracked files plus untracked-but-not-ignored files (a new file with
      // placeholder content must also be caught before it gets committed).
      const files = execSync("git ls-files --others --exclude-standard", {
        cwd: top,
        encoding: "utf8",
      })
        .split(/\r?\n/)
        .filter((f) => f && SOURCE_EXT.test(f))
        .map((f) => path.join(top, f));
      const tracked = execSync("git ls-files", { cwd: top, encoding: "utf8" })
        .split(/\r?\n/)
        .filter((f) => f && SOURCE_EXT.test(f))
        .map((f) => path.join(top, f));
      const all = [...new Set([...tracked, ...files])];
      if (all.length) return all;
    } catch {
      /* fall through to walk */
    }
  }
  const start = top || process.cwd();
  return walkFiles(start, []);
}

const files = listSourceFiles();
const hits = [];
for (const f of files) {
  let text;
  try {
    text = fs.readFileSync(f, "utf8");
  } catch {
    continue;
  }
  for (const b of bad) {
    if (text.includes(b)) hits.push(`${f}: contains ${JSON.stringify(b)}`);
  }
  const trimmed = text.trim();
  if (trimmed.length < 80 && /^\[.*\]$/.test(trimmed)) {
    hits.push(`${f}: looks like placeholder-only content`);
  }
  if (WHOLE_FILE_SENTINEL.test(trimmed)) {
    hits.push(`${f}: entire file is a single SCREAMING_SNAKE token (failed edit sentinel?)`);
  }
}

if (hits.length) {
  console.error("Placeholder / corrupt file content detected:");
  for (const h of hits) console.error(" -", h);
  process.exit(1);
}

console.log(`OK: scanned ${files.length} source files for placeholders`);
