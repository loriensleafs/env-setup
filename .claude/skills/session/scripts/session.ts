/**
 * Session log tooling — docs/sessions/*.md, one file per session (ADR-020: a
 * bounded stream of work toward one Goal, open until closed; a conversation
 * joins an open session or opens one before its first commit).
 *
 *   bun run session list                         every session with its status, plan and Goal
 *   bun run session new <slug> [--plan "PLAN-NNN · part"]
 *                                                open SES-<next>-<slug>.md (Status: open)
 *   bun run session [append] [--session SES-NNN] append entry skeletons for commits no session mentions
 *   bun run session check [--session SES-NNN]    exit 1 if commits are missing or placeholders unfilled
 *   bun run session close [--session SES-NNN]    Status: closed — refused while the gate is red
 *   bun run session current [--session SES-NNN]  the session's file, status, Goal, and every
 *                                                placeholder with its line number (what to fill, where)
 *
 * Which session a run acts on: the one named with --session, else the single
 * open session. No open session, or more than one, is an error that says what
 * to do — never a guess into another conversation's file.
 *
 * Append-only: every commit on the current branch (merges excluded) that no
 * session file mentions gets an entry skeleton — Summary / Why placeholders and
 * one line per touched file (any file: code, docs, config, CI, scripts, assets)
 * with its +/− line counts and a placeholder for what changed in it. A release
 * marker is inserted after each tagged commit. Existing text is never
 * rewritten. `docs(session): …` commits (the log updates themselves) are
 * skipped so the entry-writing commit never chases its own sha. The index
 * block in docs/sessions/README.md is regenerated on every run.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  FILL,
  id,
  indexRow,
  parseHeader,
  placeholderCount,
  selectSession,
  type Session,
  slugify,
  template,
  withStatus,
} from "./session-lib";

const DIR = new URL("../../../../docs/sessions/", import.meta.url).pathname;
const INDEX = join(DIR, "README.md");
const MAX_FILES = 80;
const SKIP_PREFIXES = ["docs(session)", "docs(ledger)"];
const COMMANDS = ["list", "new", "append", "check", "close", "current"] as const;
type Command = (typeof COMMANDS)[number];

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
    if (!/^SES-\d{3}-.+\.md$/.test(name)) continue;
    const file = join(DIR, name);
    const text = await Bun.file(file).text();
    list.push({ ...parseHeader(name, text), file, name, text });
  }
  return list.sort((a, b) => a.seq - b.seq);
}

async function writeIndex(all: Session[]): Promise<void> {
  const rows = [...all].reverse().map(indexRow).join("\n");
  const text = await Bun.file(INDEX).text();
  const START = "<!-- sessions:start -->";
  const END = "<!-- sessions:end -->";
  const a = text.indexOf(START);
  const b = text.indexOf(END);
  if (a === -1 || b === -1) throw new Error("README.md is missing the sessions:start/end markers");
  const next = `${text.slice(0, a + START.length)}\n${rows}\n${text.slice(b)}`;
  if (next !== text) await Bun.write(INDEX, next);
}

function option(argv: string[], name: string): string | undefined {
  const at = argv.indexOf(name);
  if (at < 0) return undefined;
  const value = argv[at + 1];
  argv.splice(at, 2);
  return value;
}

/** The subcommand: a bare word; `--word` (the pre-ADR-020 spelling) still works. */
function command(argv: string[]): Command {
  const word = (argv[0] ?? "append").replace(/^--/, "");
  if (!COMMANDS.includes(word as Command)) {
    throw new Error(`unknown command "${argv[0]}" — one of: ${COMMANDS.join(", ")}`);
  }
  if (argv.length > 0) argv.shift();
  return word as Command;
}

/** A refusal is a one-line `session: …` message and exit 1, never a stack trace. */
function refuse(error: unknown): never {
  console.error(`session: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv[0] === "--") argv.shift();
const sessionArg = option(argv, "--session");
const planArg = option(argv, "--plan");
let cmd: Command;
try {
  cmd = command(argv);
} catch (error) {
  refuse(error);
}
const all = await sessions().catch(refuse);

/** Commits on this branch that no session records (the log updates themselves excluded). */
function missingCommits(): Commit[] {
  const known = all.flatMap((s) =>
    [...s.text.matchAll(/^### .* · ([0-9a-f]{7,40})$/gm)].map((m) => m[1]),
  );
  return commits().filter(
    (c) =>
      !SKIP_PREFIXES.some((p) => c.subject.startsWith(p)) &&
      !known.some((k) => c.sha.startsWith(k)),
  );
}

/**
 * The gate: the target session filled, and every commit having an entry.
 * Placeholders left in ANOTHER session belong to another conversation (a
 * concurrent checkout, or a session that ended abruptly): they are reported as
 * warnings so this one never has to edit someone else's file to go green, and
 * never silently rewrites history to do it. `closing` also counts the target's
 * Outcome / Open at end lines.
 */
function gate(target: Session, missing: Commit[], closing = false): boolean {
  let unfilled = 0;
  for (const s of all) {
    const n = placeholderCount(s.text, closing && s === target);
    if (n === 0) continue;
    if (s === target) {
      console.log(`unfilled: ${s.name} has ${n} placeholder line(s)`);
      unfilled += n;
    } else {
      console.log(
        `warning: ${s.name} has ${n} placeholder line(s) — not the gated session; leave it to its own conversation (pass --session to gate a different file)`,
      );
    }
  }
  for (const c of missing) console.log(`missing: ${c.sha.slice(0, 7)} ${c.subject}`);
  return missing.length === 0 && unfilled === 0;
}

const openIds = () => all.filter((s) => s.status === "open").map((s) => id(s.seq));

async function list(): Promise<void> {
  for (const s of all) {
    console.log(`${id(s.seq)}  ${s.status.padEnd(6)}  ${s.title}${s.plan ? ` · ${s.plan}` : ""}`);
    console.log(`            ${s.goal || "(no Goal)"}`);
  }
  const open = openIds();
  console.log(open.length ? `open: ${open.join(", ")}` : "open: none");
}

async function open(): Promise<void> {
  const slug = slugify(argv[0] ?? "");
  if (!slug) throw new Error('usage: bun run session new <slug> [--plan "PLAN-NNN · part"]');
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const started = `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const seq = (all.at(-1)?.seq ?? 0) + 1;
  const name = `${id(seq)}-${slug}.md`;
  const file = join(DIR, name);
  if (await Bun.file(file).exists()) throw new Error(`${name} already exists`);
  const title = slug.replace(/-/g, " ");
  const text = template(started, title, planArg ?? "");
  const others = openIds();
  await Bun.write(file, text);
  await writeIndex([...all, { ...parseHeader(name, text), file, name, text }]);
  console.log(
    `session: opened ${name} — set the Goal line and the title; pass \`--session ${id(seq)}\` to later runs.`,
  );
  if (others.length) console.log(`note: also open — ${others.join(", ")}`);
}

async function current(): Promise<void> {
  // What to fill, where: the selected session, its Goal, and each placeholder
  // line by number — so a caller edits by line instead of hunting.
  const s = selectSession(all, sessionArg);
  console.log(`session: ${s.name}`);
  console.log(`started: ${s.started} · ${s.title}`);
  console.log(`status: ${s.status}${s.plan ? ` · plan: ${s.plan}` : ""}`);
  console.log(`goal: ${s.goal || "(unset)"}`);
  let count = 0;
  s.text.split("\n").forEach((l, i) => {
    if (l.includes(FILL)) {
      count++;
      console.log(`  ${String(i + 1).padStart(4)}: ${l.trim().slice(0, 110)}`);
    }
  });
  console.log(count === 0 ? "placeholders: none" : `placeholders: ${count}`);
}

async function check(): Promise<void> {
  const target = selectSession(all, sessionArg);
  if (!gate(target, missingCommits())) {
    console.log(
      `session: NOT ready — run \`bun run session append --session ${id(target.seq)}\` and fill in the placeholders (\`current --session ${id(target.seq)}\` lists them).`,
    );
    process.exit(1);
  }
  await writeIndex(all);
  console.log(`session: complete (${id(target.seq)}, ${target.status})`);
}

async function close(): Promise<void> {
  // Closing is the gate plus the Outcome: a session closes complete or not at all.
  const target = selectSession(all, sessionArg);
  if (target.status === "closed") {
    console.log(`session: ${id(target.seq)} is already closed`);
    return;
  }
  if (!gate(target, missingCommits(), true)) {
    console.log(`session: NOT closed — ${id(target.seq)} is not complete.`);
    process.exit(1);
  }
  target.text = withStatus(target.text, "closed");
  target.status = "closed";
  await Bun.write(target.file, target.text);
  await writeIndex(all);
  const open = openIds();
  console.log(
    `session: closed ${id(target.seq)}${open.length ? ` — still open: ${open.join(", ")}` : ""}`,
  );
}

async function append(): Promise<void> {
  await writeIndex(all);
  const missing = missingCommits();
  if (missing.length === 0) {
    console.log("session: up to date");
    return;
  }
  const target = selectSession(all, sessionArg);
  if (target.status === "closed") {
    throw new Error(
      `${id(target.seq)} is closed — reopen it (edit its Status line) or open a new session with \`new <slug>\``,
    );
  }
  const tags = tagsByCommit();
  const body = missing.map((c) => render(c, tags.get(c.sha))).join("\n");
  await Bun.write(target.file, `${target.text.replace(/\n+$/, "")}\n\n${body}`);
  for (const c of missing) console.log(`+ ${c.sha.slice(0, 7)} ${c.subject}`);
  console.log(
    `session: appended ${missing.length} to ${target.name} — fill in every ${FILL} (then \`bun run session check --session ${id(target.seq)}\`).`,
  );
}

const run: Record<Command, () => Promise<void>> = {
  list,
  new: open,
  append,
  check,
  close,
  current,
};
await run[cmd]().catch(refuse);
