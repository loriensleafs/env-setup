#!/usr/bin/env bun
/**
 * Former-name checker for the docs system (ANA-010, implication 1): the one
 * judgment-free enforcement of CONTEXT.md's `_Avoid_` lists. Every `_Avoid_`
 * item whose parenthetical starts with "former name" is a retired word — the
 * glossary says so — and must not appear in the live agent-facing prose. The
 * other items restrict a sense ("check (as the noun)") and need a reader.
 *
 * Live prose = CLAUDE.md, README.md, CONTRIBUTING.md, docs/OVERVIEW.md,
 * docs/plan/**, docs/sessions/README.md outside its generated index, and every
 * .md under .claude/ and docs/.claude/. Session files, ADRs and analyses are
 * records of what was said at the time and are not checked. Code spans and
 * fenced blocks are skipped (a path such as `docs/LEDGER.md` is a name).
 *
 * Usage (repo root):  bun docs/.claude/skills/run-docs/avoid-check.ts
 * Exit 0 = no retired word in live prose; 1 = each hit listed.
 */
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "../../../..");

type Retired = { word: string; term: string };
const retired: Retired[] = [];
let term = "";
for (const line of (await Bun.file(`${root}/CONTEXT.md`).text()).split("\n")) {
  const heading = line.match(/^\*\*(.+?)\*\*/);
  if (heading) term = heading[1];
  const avoid = line.match(/^_Avoid_:\s*(.*)$/);
  if (!avoid) continue;
  for (const m of avoid[1].matchAll(/([^,()]+?)\s*\((former name[^)]*)\)/g)) {
    retired.push({ word: m[1].trim(), term });
  }
}

const files = [
  "CLAUDE.md",
  "README.md",
  "CONTRIBUTING.md",
  "docs/OVERVIEW.md",
  "docs/sessions/README.md",
  ...[...new Bun.Glob("docs/plan/*.md").scanSync({ cwd: root })],
  ...[...new Bun.Glob("{.claude,docs/.claude}/**/*.md").scanSync({ cwd: root, dot: true })],
].sort();

const quoteRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hits: string[] = [];
for (const file of files) {
  const text = await Bun.file(`${root}/${file}`).text();
  let fenced = false;
  let index = false;
  text.split("\n").forEach((raw, i) => {
    if (raw.startsWith("```")) fenced = !fenced;
    if (raw.trim() === "<!-- sessions:start -->") index = true;
    if (raw.trim() === "<!-- sessions:end -->") index = false;
    if (fenced || index) return;
    const line = raw.replace(/`[^`]*`/g, "");
    for (const r of retired) {
      if (new RegExp(`\\b${quoteRe(r.word)}\\b`, "i").test(line)) {
        hits.push(`${file}:${i + 1} "${r.word}" → say ${r.term}`);
      }
    }
  });
}
for (const h of hits) console.log(`retired: ${h}`);
console.log(`${files.length} files, ${retired.length} former names, ${hits.length} hits`);
process.exit(hits.length === 0 ? 0 : 1);
