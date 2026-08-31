/**
 * `bun run ledger` — append missing entries to docs/LEDGER.md.
 *
 * Append-only: every commit on the current branch (merges excluded) that the
 * ledger does not yet mention gets an entry with the files it touched, and a
 * "## Since vX.Y.Z" heading is inserted after each tagged (release) commit.
 * Existing entries — and the hand-written Why/Notes under them — are never
 * rewritten. After running, fill in the Why line of the new entries.
 */
const LEDGER = new URL("../docs/LEDGER.md", import.meta.url).pathname;
const MAX_FILES = 60;

function git(...args: string[]): string {
  const r = Bun.spawnSync(["git", ...args]);
  if (r.exitCode !== 0) throw new Error(`git ${args[0]} failed: ${r.stderr.toString()}`);
  return r.stdout.toString();
}

interface Commit {
  sha: string;
  date: string;
  subject: string;
  files: string[];
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
    "--name-only",
  );
  const result: Commit[] = [];
  for (const block of out.split("\x01")) {
    if (!block.trim()) continue;
    const [head, ...rest] = block.split("\n");
    const [sha, date, subject] = head.split("\t");
    const files = rest.map((l) => l.trim()).filter((l) => l.length > 0);
    result.push({ sha, date, subject, files });
  }
  return result;
}

function render(c: Commit, tag: string | undefined): string {
  const shown = c.files.slice(0, MAX_FILES).map((f) => `\`${f}\``);
  const more =
    c.files.length > MAX_FILES
      ? `, … +${c.files.length - MAX_FILES} more (\`git show --stat ${c.sha.slice(0, 7)}\`)`
      : "";
  const files = shown.length > 0 ? shown.join(", ") + more : "_(no files)_";
  const subject = c.subject.replace(/_/g, "\\_");
  let entry = `### ${c.date} · ${subject} · ${c.sha.slice(0, 7)}\n\n- Files: ${files}\n`;
  if (tag) entry += `\n## Since ${tag} (tagged ${c.date})\n`;
  return entry;
}

const text = await Bun.file(LEDGER).text();
const known = [...text.matchAll(/^### .* · ([0-9a-f]{7,40})$/gm)].map((m) => m[1]);
const tags = tagsByCommit();
// `docs(ledger): …` commits are the ledger updates themselves — self-describing, skipped so
// the entry-writing commit never has to chase its own sha.
const missing = commits().filter(
  (c) => !c.subject.startsWith("docs(ledger)") && !known.some((k) => c.sha.startsWith(k)),
);

if (missing.length === 0) {
  console.log("ledger: up to date");
  process.exit(0);
}

const body = missing.map((c) => render(c, tags.get(c.sha))).join("\n");
const sep = text.endsWith("\n\n") ? "" : text.endsWith("\n") ? "\n" : "\n\n";
await Bun.write(LEDGER, `${text}${sep}${body}`);
for (const c of missing) console.log(`+ ${c.sha.slice(0, 7)} ${c.subject}`);
console.log(`ledger: appended ${missing.length} — now fill in the Why line(s).`);
