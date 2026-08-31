/**
 * The pure half of the session-log tool (`session.ts` is the CLI around it):
 * parsing a session file's header, choosing which session a run acts on, and
 * the text edits that never touch an entry.
 *
 * A session is a bounded stream of work toward one Goal (ADR-020). It is
 * `open` from `new` until `close` writes `Status: closed`; a conversation
 * joins an open session or opens one before its first commit, and a
 * conversation that changes nothing needs none. A file without a Status line
 * (another conversation's, or one written before ADR-020) is read as open.
 */

export const FILL = "_(fill in)_";
export const STATUSES = ["open", "closed"] as const;
export type Status = (typeof STATUSES)[number];

export interface SessionHeader {
  seq: number;
  started: string;
  title: string;
  goal: string;
  status: Status;
  /** The plan (and part) this session serves, or "" when unplanned. */
  plan: string;
}

export interface Session extends SessionHeader {
  file: string;
  name: string;
  text: string;
}

export function id(seq: number): string {
  return `SES-${String(seq).padStart(3, "0")}`;
}

export function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseHeader(name: string, text: string): SessionHeader {
  const num = name.match(/^SES-(\d{3})-.+\.md$/);
  if (!num) throw new Error(`${name}: not a session file name (SES-NNN-<slug>.md)`);
  const h1 = text.match(/^# (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · (.+)$/m);
  if (!h1) throw new Error(`${name}: first heading must be "# YYYY-MM-DD HH:MM · Title"`);
  const goal = text.match(/^- Goal: (.+)$/m)?.[1] ?? "";
  const rawStatus = text.match(/^- Status: (\S+)/m)?.[1];
  if (rawStatus !== undefined && !STATUSES.includes(rawStatus as Status)) {
    throw new Error(`${name}: Status must be one of ${STATUSES.join(" | ")}, got "${rawStatus}"`);
  }
  const plan = (text.match(/^- Plan: (.+)$/m)?.[1] ?? "").trim();
  return {
    seq: Number(num[1]),
    started: h1[1],
    title: h1[2],
    goal,
    status: (rawStatus as Status | undefined) ?? "open",
    plan: plan === "—" || plan === "-" || plan === "none" ? "" : plan,
  };
}

export function template(started: string, title: string, plan: string): string {
  return `# ${started} · ${title}

- Goal: ${FILL}
- Status: open
- Plan: ${plan || "—"}
- Outcome: ${FILL}
- Open at end: ${FILL}

## Narrative

${FILL} — what was asked, decided, tried and abandoned, verified (and how); cite entries by sha.

## Changes (one entry per commit, in order)
`;
}

/**
 * Placeholder lines the gate counts: entry lines, the Goal and the Narrative
 * placeholder. `Outcome` and `Open at end` are the closing lines — an open
 * session has none yet — so only `--close` (`closing: true`) counts them.
 */
export function placeholderCount(text: string, closing = false): number {
  return text.split("\n").filter((l) => {
    if (!l.includes(FILL)) return false;
    if (!closing && /^- (Outcome|Open at end): /.test(l)) return false;
    return /^\s*- |^_\(fill in\)_/.test(l);
  }).length;
}

/** Rewrite the Status line, inserting one after Goal when the file predates it. */
export function withStatus(text: string, status: Status): string {
  if (/^- Status: .+$/m.test(text)) return text.replace(/^- Status: .+$/m, `- Status: ${status}`);
  if (!/^- Goal: .+$/m.test(text)) throw new Error("no Goal line to insert Status after");
  return text.replace(/^(- Goal: .+)$/m, `$1\n- Status: ${status}`);
}

export function indexRow(s: Session): string {
  const plan = s.plan ? ` · ${s.plan}` : "";
  return `- [${id(s.seq)} · ${s.started} · ${s.title}](${s.name}) — ${s.status}${plan} — ${s.goal}`;
}

/**
 * Which session a run acts on. Named (`--session SES-004`, `4`, or the file
 * name) wins; otherwise the one open session. None open or several open are
 * errors that say what to do, because guessing wrong writes into another
 * conversation's file.
 */
export function selectSession(all: readonly Session[], arg: string | undefined): Session {
  if (arg !== undefined) {
    const want = arg.replace(/\.md$/, "");
    const found = all.find(
      (s) => s.name.replace(/\.md$/, "") === want || String(s.seq) === want || id(s.seq) === want,
    );
    if (!found) throw new Error(`no session file matches --session ${arg}`);
    return found;
  }
  const open = all.filter((s) => s.status === "open");
  if (open.length === 1) return open[0];
  if (open.length === 0) {
    throw new Error(
      "no open session — join one with `--session SES-NNN` or open one with `new <slug>`",
    );
  }
  const list = open.map((s) => `${id(s.seq)} (${s.title})`).join(", ");
  throw new Error(`${open.length} open sessions — say which with --session: ${list}`);
}
