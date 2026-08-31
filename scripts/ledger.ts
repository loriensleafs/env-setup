/**
 * `bun run ledger` — append missing entries to docs/LEDGER.md.
 * `bun run ledger --check` — fail if entries are missing or placeholders unfilled.
 *
 * Append-only: every commit on the current branch (merges excluded) that the
 * ledger does not yet mention gets an entry skeleton — Summary / Why
 * placeholders and one line per touched file (any file: code, docs, config,
 * CI, scripts, assets) with its +/− line counts and a placeholder for what
 * changed in it. A "## Since vX.Y.Z" heading is inserted after each tagged
 * (release) commit. Existing entries — and everything written by hand under
 * them — are never rewritten. `docs(ledger): …` commits (the ledger updates
 * themselves) are skipped so the entry-writing commit never chases its own sha.
 */

const LEDGER = new URL("../docs/LEDGER.md", import.meta.url).pathname;
const FILL = "_(fill in)_";
const MAX_FILES = 80;

interface Touched {
  path: string;
  added: number | null;
  deleted: number | null;
}
interface Commit {
  sha: string;
  date: string;
  subject: string;
  files: Touched[];
}

function git(...args: string[]): string {
  const r = Bun.spawnSync(["git", ...args]);
  if (r.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr.toString()}`);
  return r.stdout.toString();
}

function tagsByCommit(): Map<string, string> {
  const out = git(
    "for-each-ref",
    "--format=%(objectname)%09%(*objectname)%09%(refname:short)",
    "refs/tags",
  );
  const map = new Map<string, string>();
  for (const line of out.split("\n")) {
    if (!line) continue;
    const [obj, peeled, tag] = line.split("\t");
    map.set(peeled || obj, tag);
  }
  return map;
}

function commits(): Commit[] {
  const out = git(
    "log",
    "--reverse",
    "--no-merges",
    "--date=short",
    "--format=%x01%H%x09%ad%x09%s",
    "--numstat",
  );
  const result: Commit[] = [];
  for (const block of out.split("\x01")) {
    if (!block.trim()) continue;
    const [head, ...rest] = block.split("\n");
    const [sha, date, subject] = head.split("\t");
    const files: Touched[] = [];
    for (const line of rest) {
      const [a, d, path] = line.split("\t");
      if (!path) continue;
      files.push({
        path,
        added: a === "-" ? null : Number(a),
        deleted: d === "-" ? null : Number(d),
      });
    }
    result.push({ sha, date, subject, files });
  }
  return result;
}

function stat(f: Touched): string {
  return f.added === null || f.deleted === null ? "binary" : `+${f.added}/−${f.deleted}`;
}

function render(c: Commit, tag: string | undefined): string {
  const short = c.sha.slice(0, 7);
  const subject = c.subject.replace(/_/g, "\\_");
  const lines = [
    `### ${c.date} · ${subject} · ${short}`,
    "",
    `- Summary: ${FILL}`,
    `- Why: ${FILL}`,
    "- Files:",
  ];
  for (const f of c.files.slice(0, MAX_FILES)) {
    lines.push(`  - \`${f.path}\` (${stat(f)}) — ${FILL}`);
  }
  if (c.files.length > MAX_FILES) {
    lines.push(`  - … +${c.files.length - MAX_FILES} more (\`git show --stat ${short}\`)`);
  }
  if (c.files.length === 0) lines.push("  - _(no files)_");
  lines.push("");
  if (tag) lines.push(`## Since ${tag} (tagged ${c.date})`, "");
  return lines.join("\n");
}

const check = process.argv.includes("--check");
const text = await Bun.file(LEDGER).text();
const known = [...text.matchAll(/^### .* · ([0-9a-f]{7,40})$/gm)].map((m) => m[1]);
const missing = commits().filter(
  (c) => !c.subject.startsWith("docs(ledger)") && !known.some((k) => c.sha.startsWith(k)),
);

if (check) {
  // Only entry lines count — the header prose quotes the placeholder by name.
  const unfilled = text.split("\n").filter((l) => /^\s*- /.test(l) && l.includes(FILL)).length;
  for (const c of missing) console.log(`missing: ${c.sha.slice(0, 7)} ${c.subject}`);
  if (unfilled > 0) console.log(`unfilled: ${unfilled} placeholder line(s) still say ${FILL}`);
  if (missing.length > 0 || unfilled > 0) {
    console.log("ledger: NOT ready — run `bun run ledger` and fill in the placeholders.");
    process.exit(1);
  }
  console.log("ledger: complete");
  process.exit(0);
}

if (missing.length === 0) {
  console.log("ledger: up to date");
  process.exit(0);
}

const tags = tagsByCommit();
const body = missing.map((c) => render(c, tags.get(c.sha))).join("\n");
const trimmed = text.replace(/\n+$/, "");
await Bun.write(LEDGER, `${trimmed}\n\n${body}`);
for (const c of missing) console.log(`+ ${c.sha.slice(0, 7)} ${c.subject}`);
console.log(
  `ledger: appended ${missing.length} — fill in every ${FILL} (then \`bun run ledger --check\`).`,
);
