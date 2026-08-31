import { describe, expect, test } from "bun:test";
import {
  declinesEntry,
  FILL,
  indexRow,
  knownShas,
  parseHeader,
  placeholderCount,
  selectSession,
  slugify,
  template,
  withStatus,
} from "../session-lib";
import type { Session } from "../session-lib";

const header = (extra = "") => `# 2026-08-30 18:00 · Docs for rehydration

- Goal: Make a fresh session able to pick up where the last one stopped.
${extra}- Outcome: ${FILL}
- Open at end: ${FILL}

## Narrative

${FILL} — what was asked.

## Changes (one entry per commit, in order)
`;

const session = (seq: number, status: "open" | "closed", title = `s${seq}`): Session => ({
  seq,
  started: "2026-08-30 18:00",
  title,
  goal: "g",
  status,
  plan: "",
  file: `/x/SES-00${seq}-${title}.md`,
  name: `SES-00${seq}-${title}.md`,
  text: "",
});

describe("parseHeader", () => {
  test("reads seq, timestamp, title, goal, status and plan", () => {
    const h = parseHeader(
      "SES-004-docs-rehydration.md",
      header("- Status: closed\n- Plan: PLAN-002 · nested CLAUDE.md\n"),
    );
    expect(h).toEqual({
      seq: 4,
      started: "2026-08-30 18:00",
      title: "Docs for rehydration",
      goal: "Make a fresh session able to pick up where the last one stopped.",
      status: "closed",
      plan: "PLAN-002 · nested CLAUDE.md",
    });
  });

  test("a file without a Status line is open (another conversation's, or pre-ADR-020)", () => {
    expect(parseHeader("SES-005-rehydration.md", header()).status).toBe("open");
  });

  test("an em-dash Plan means unplanned", () => {
    expect(parseHeader("SES-006-x.md", header("- Status: open\n- Plan: —\n")).plan).toBe("");
  });

  test("rejects an unknown status and a bad heading", () => {
    expect(() => parseHeader("SES-006-x.md", header("- Status: paused\n"))).toThrow(
      /Status must be one of open \| closed/,
    );
    expect(() => parseHeader("SES-006-x.md", "# no timestamp\n- Goal: g")).toThrow(/first heading/);
    expect(() => parseHeader("notes.md", header())).toThrow(/not a session file name/);
  });
});

describe("selectSession", () => {
  test("a named session wins whatever is open, by id, number or file name", () => {
    const all = [session(4, "closed", "docs"), session(5, "open", "rehydration")];
    expect(selectSession(all, "SES-004").seq).toBe(4);
    expect(selectSession(all, "4").seq).toBe(4);
    expect(selectSession(all, "SES-004-docs.md").seq).toBe(4);
    expect(() => selectSession(all, "SES-009")).toThrow(/no session file matches/);
  });

  test("with nothing named, the one open session is the target", () => {
    const all = [session(3, "closed"), session(4, "open")];
    expect(selectSession(all, undefined).seq).toBe(4);
  });

  test("no open session says how to join or open one", () => {
    expect(() => selectSession([session(3, "closed")], undefined)).toThrow(
      /no open session — join one with `--session SES-NNN` or open one with `new <slug>`/,
    );
  });

  test("several open sessions refuse to guess and list them", () => {
    const all = [session(4, "open", "docs"), session(5, "open", "rehydration")];
    expect(() => selectSession(all, undefined)).toThrow(
      /2 open sessions — say which with --session: SES-004 \(docs\), SES-005 \(rehydration\)/,
    );
  });
});

describe("withStatus", () => {
  test("replaces an existing Status line in place", () => {
    const text = withStatus(header("- Status: open\n"), "closed");
    expect(text).toContain("- Status: closed");
    expect(text.match(/^- Status:/gm)).toHaveLength(1);
  });

  test("inserts a Status line right after Goal when the file has none", () => {
    const text = withStatus(header(), "closed");
    expect(text).toMatch(/^- Goal: .+\n- Status: closed\n- Outcome:/m);
  });
});

describe("template, placeholders, index", () => {
  test("a new session opens with Status open and its plan, and carries the placeholders", () => {
    const t = template("2026-08-31 09:00", "visual grouping", "PLAN-001 · Phase 1");
    expect(t).toContain("- Status: open\n- Plan: PLAN-001 · Phase 1\n");
    expect(placeholderCount(t)).toBe(2); // Goal + Narrative; Outcome / Open at end wait for close
    expect(placeholderCount(t, true)).toBe(4);
    expect(template("2026-08-31 09:00", "x", "")).toContain("- Plan: —\n");
  });

  test("the index row shows status and plan", () => {
    const s = { ...session(6, "open", "grouping"), plan: "PLAN-001", goal: "Ship it" };
    expect(indexRow(s)).toBe(
      "- [SES-006 · 2026-08-30 18:00 · grouping](SES-006-grouping.md) — open · PLAN-001 — Ship it",
    );
  });

  test("slugify", () => {
    expect(slugify("Fix 2FA — again!")).toBe("fix-2fa-again");
  });
});

describe("what a session accounts for (ADR-021)", () => {
  test("knownShas: entry headings plus the shas parent entries vouch for on Also lines", () => {
    const text = `## Changes

### 2026-08-30 · feat(session): the model · 66b083d

- Summary: …
- Also: 5476479 — its docs(session) fix-up
- Also: a8f44b2 — typo in the ADR
- Files:
  - \`x\` (+1/−0) — a phrase

### 2026-08-30 · eval(session): iteration 3 · 4e7f673
`;
    expect(knownShas(text)).toEqual(["66b083d", "4e7f673", "5476479", "a8f44b2"]);
  });

  test("declinesEntry: only the trailer, anywhere in the body, case-insensitive", () => {
    expect(declinesEntry("Biome reformat after the fixer moved.\n\nSession-entry: none\n")).toBe(
      true,
    );
    expect(declinesEntry("session-entry: NONE")).toBe(true);
    expect(declinesEntry("Mentions Session-entry: none in prose, not as a line")).toBe(false);
    expect(declinesEntry("")).toBe(false);
  });
});
