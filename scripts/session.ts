/**
 * Session log tooling — docs/sessions/*.md, one file per work session.
 *
 *   bun run session -- --new <slug>   start SES-<next>-<slug>.md (becomes current)
 *   bun run session                   append entry skeletons for commits no session mentions
 *   bun run session -- --check        fail if commits are missing or placeholders unfilled
 *   … -- --session SES-006            act on THAT session file (append target / check gate)
 *                                      instead of the newest one — the conversation's own file
 *   bun run session -- --current      print the selected session's file, Goal, and every
 *                                      placeholder with its line number (what to fill, where)
 *
 * Append-only: every commit on the current branch (merges excluded) that no
 * session file mentions gets an entry skeleton in the CURRENT session (the
 * newest file by its H1 timestamp) — Summary / Why placeholders and one line
 * per touched file (any file: code, docs, config, CI, scripts, assets) with its
 * +/− line counts and a placeholder for what changed in it. A release marker is
 * inserted after each tagged commit. Existing text is never rewritten.
 * `docs(session): …` commits (the log updates themselves) are skipped so the
 * entry-writing commit never chases its own sha. The index block in
 * docs/sessions/README.md is regenerated on every run.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL("../docs/sessions/", import.meta.url).pathname;
const INDEX = join(DIR, "README.md");
const FILL = "_(fill in)_";
const MAX_FILES = 80;
const SKIP_PREFIXES = ["docs(session)", "docs(ledger)"];

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
interface Session {
  file: string;
  name: string;
  seq: number;
  started: string;
  title: string;
  goal: string;
  text: string;
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
    "--no-renames", // a rename is a delete + an add: plain paths, greppable
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
  if (tag) lines.push(`> **Released ${tag}** — tag on this commit.`, "");
  return lines.join("\n");
}

async function sessions(): Promise<Session[]> {
  const list: Session[] = [];
  for (const name of readdirSync(DIR)) {
    const num = name.match(/^SES-(\d{3})-.+\.md$/);
    if (!num) continue;
    const file = join(DIR, name);
    const text = await Bun.file(file).text();
    const h1 = text.match(/^# (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · (.+)$/m);
    if (!h1) throw new Error(`${name}: first heading must be "# YYYY-MM-DD HH:MM · Title"`);
    const goal = text.match(/^- Goal: (.+)$/m)?.[1] ?? "";
    list.push({ file, name, seq: Number(num[1]), started: h1[1], title: h1[2], goal, text });
  }
  return list.sort((a, b) => a.seq - b.seq);
}

function template(started: string, title: string): string {
  return `# ${started} · ${title}

- Goal: ${FILL}
- Outcome: ${FILL}
- Open at end: ${FILL}

## Narrative

${FILL} — what was asked, decided, tried and abandoned, verified (and how); cite entries by sha.

## Changes (one entry per commit, in order)
`;
}

async function writeIndex(all: Session[]): Promise<void> {
  const rows = [...all]
    .reverse()
    .map(
      (s) =>
        `- [SES-${String(s.seq).padStart(3, "0")} · ${s.started} · ${s.title}](${s.name}) — ${s.goal}`,
    )
    .join("\n");
  const text = await Bun.file(INDEX).text();
  const START = "<!-- sessions:start -->";
  const END = "<!-- sessions:end -->";
  const a = text.indexOf(START);
  const b = text.indexOf(END);
  if (a === -1 || b === -1) throw new Error("README.md is missing the sessions:start/end markers");
  const next = `${text.slice(0, a + START.length)}\n${rows}\n${text.slice(b)}`;
  if (next !== text) await Bun.write(INDEX, next);
}

const argv = process.argv.slice(2);
const all = await sessions();
// --session SES-006 (or "6"): the conversation's own file. Another conversation
// may share this checkout and own the newest file; naming yours keeps appends
// and the gate on the right file.
const sessionArgAt = argv.indexOf("--session");
const sessionArg = sessionArgAt >= 0 ? argv[sessionArgAt + 1] : undefined;
if (sessionArgAt >= 0) argv.splice(sessionArgAt, 2);
function selectSession(): Session | undefined {
  if (!sessionArg) return all.at(-1);
  const want = sessionArg.replace(/\.md$/, "");
  const found = all.find(
    (s) =>
      s.name.replace(/\.md$/, "") === want ||
      String(s.seq) === want ||
      `SES-${String(s.seq).padStart(3, "0")}` === want,
  );
  if (!found) throw new Error(`no session file matches --session ${sessionArg}`);
  return found;
}

if (argv[0] === "--new") {
  const slug = (argv[1] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) throw new Error("usage: bun run session -- --new <slug>");
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const started = `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const seq = (all.at(-1)?.seq ?? 0) + 1;
  const name = `SES-${String(seq).padStart(3, "0")}-${slug}.md`;
  const file = join(DIR, name);
  if (await Bun.file(file).exists()) throw new Error(`${name} already exists`);
  const title = slug.replace(/-/g, " ");
  await Bun.write(file, template(started, title));
  await writeIndex([...all, { file, name, seq, started, title, goal: FILL, text: "" }]);
  console.log(
    `session: started ${name} — set the Goal line and the title; pass \`--session ${name.replace(/\.md$/, "")}\` to later runs.`,
  );
  process.exit(0);
}

const known = all.flatMap((s) =>
  [...s.text.matchAll(/^### .* · ([0-9a-f]{7,40})$/gm)].map((m) => m[1]),
);
const missing = commits().filter(
  (c) =>
    !SKIP_PREFIXES.some((p) => c.subject.startsWith(p)) && !known.some((k) => c.sha.startsWith(k)),
);

if (argv[0] === "--current") {
  // What to fill, where: the selected session, its Goal, and each placeholder
  // line by number — so a caller edits by line instead of hunting.
  const s = selectSession();
  if (!s) throw new Error("no session file — start one: bun run session -- --new <slug>");
  console.log(`session: ${s.name}`);
  console.log(`started: ${s.started} · ${s.title}`);
  console.log(`goal: ${s.goal || "(unset)"}`);
  const lines = s.text.split("\n");
  let count = 0;
  lines.forEach((l, i) => {
    if (l.includes(FILL)) {
      count++;
      console.log(`  ${String(i + 1).padStart(4)}: ${l.trim().slice(0, 110)}`);
    }
  });
  console.log(count === 0 ? "placeholders: none" : `placeholders: ${count}`);
  process.exit(0);
}

if (argv[0] === "--check") {
  // The gate is the CURRENT session (the newest file) plus every commit having an
  // entry. Placeholders left in an OLDER session belong to another conversation
  // (a concurrent checkout, or a session that ended abruptly): they are reported
  // as warnings so the current session never has to edit someone else's file to
  // go green, and never silently rewrites history to do it.
  let unfilled = 0;
  const newest = selectSession();
  for (const s of all) {
    const n = s.text
      .split("\n")
      .filter((l) => /^\s*- |^_\(fill in\)_/.test(l) && l.includes(FILL)).length;
    if (n === 0) continue;
    if (s === newest) {
      console.log(`unfilled: ${s.name} has ${n} placeholder line(s)`);
      unfilled += n;
    } else {
      console.log(
        `warning: ${s.name} has ${n} placeholder line(s) — not the gated session; leave it to its own conversation (pass --session to gate a different file)`,
      );
    }
  }
  for (const c of missing) console.log(`missing: ${c.sha.slice(0, 7)} ${c.subject}`);
  if (missing.length > 0 || unfilled > 0) {
    console.log("session: NOT ready — run `bun run session` and fill in the placeholders.");
    process.exit(1);
  }
  await writeIndex(all);
  console.log("session: complete");
  process.exit(0);
}

await writeIndex(all);
if (missing.length === 0) {
  console.log("session: up to date");
  process.exit(0);
}
const current = selectSession();
if (!current) throw new Error("no session file — start one: bun run session -- --new <slug>");
const tags = tagsByCommit();
const body = missing.map((c) => render(c, tags.get(c.sha))).join("\n");
await Bun.write(current.file, `${current.text.replace(/\n+$/, "")}\n\n${body}`);
for (const c of missing) console.log(`+ ${c.sha.slice(0, 7)} ${c.subject}`);
console.log(
  `session: appended ${missing.length} to ${current.name} — fill in every ${FILL} (then \`bun run session -- --check\`).`,
);
