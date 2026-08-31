#!/usr/bin/env bun
/**
 * Link checker for the docs system: every relative Markdown link in docs/**
 * (and CLAUDE.md / README.md / CONTRIBUTING.md) must resolve to an existing
 * file. Usage (repo root):  bun docs/.claude/skills/run-docs/link-check.ts [subdir]
 * Exit 0 = all links resolve; 1 = broken links listed.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dir, "../../../..");
const sub = process.argv[2] ? resolve(root, process.argv[2]) : resolve(root, "docs");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === ".git") continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

const files = [
  ...walk(sub),
  ...(process.argv[2]
    ? []
    : ["CLAUDE.md", "README.md", "CONTRIBUTING.md"].map((f) => join(root, f))),
];
let links = 0;
const broken: string[] = [];
for (const file of files) {
  const text = await Bun.file(file).text();
  for (const m of text.matchAll(/\]\(([^)\s#]+)(#[^)]*)?\)/g)) {
    const target = m[1];
    if (/^[a-z]+:/.test(target)) continue; // http(s), mailto
    links++;
    const abs = resolve(dirname(file), target);
    if (!existsSync(abs)) broken.push(`${file.replace(`${root}/`, "")} → ${target}`);
  }
}
for (const b of broken) console.log(`broken: ${b}`);
console.log(`${files.length} files, ${links} relative links, ${broken.length} broken`);
process.exit(broken.length === 0 ? 0 : 1);
