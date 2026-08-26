#!/usr/bin/env bun
/**
 * ~/.claude/hooks/subagent-statusline.ts
 *
 * Renders one row per running subagent in the agent panel.
 *
 * Contract (per Claude Code docs):
 *   stdin  -> single JSON object: base hook fields + `columns` + `tasks[]`
 *   stdout -> one JSON line per row you want to override:
 *               {"id": "<task id>", "content": "<row body>"}
 *             Omit a task's id to keep the default row.
 *             Emit an empty content string to hide the row.
 *
 * Row layout:
 *   ● name · status · model · effort · ctx 12% · 2m14s
 *
 * Install:
 *   cp subagent-statusline.ts ~/.claude/hooks/subagent-statusline.ts
 *   chmod +x ~/.claude/hooks/subagent-statusline.ts
 */

type Task = {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  description?: string;
  label?: string;
  startTime?: number | string;
  model?: string;              // resolved model id, v2.1.205+
  effort?: string | number;    // v2.1.214+, absent when inherited
  contextWindowSize?: number;  // v2.1.205+
  tokenCount?: number;
  cwd?: string;
};

type Input = { columns?: number; tasks?: Task[] };

const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const GREY = "\x1b[90m";

/** Status -> glyph + colour. Unknown statuses fall through to a neutral dot. */
function statusMark(status?: string): { glyph: string; color: string; text: string } {
  const s = (status ?? "").toLowerCase();
  if (s.includes("run") || s.includes("active") || s.includes("progress"))
    return { glyph: "●", color: GREEN, text: "running" };
  if (s.includes("pend") || s.includes("queue") || s.includes("wait"))
    return { glyph: "◐", color: YELLOW, text: s || "pending" };
  if (s.includes("done") || s.includes("complete") || s.includes("success"))
    return { glyph: "✓", color: CYAN, text: "done" };
  if (s.includes("fail") || s.includes("error"))
    return { glyph: "✗", color: RED, text: s || "failed" };
  return { glyph: "•", color: GREY, text: s || "—" };
}

/** claude-opus-4-7 -> opus · claude-sonnet-4-6 -> sonnet */
function shortModel(id?: string): string | null {
  if (!id) return null;
  const m = id.match(/(opus|sonnet|haiku|fable)/i);
  return m ? m[1].toLowerCase() : null;
}

function elapsed(start?: number | string): string | null {
  if (start === undefined || start === null) return null;
  const t = typeof start === "string" ? Date.parse(start) : start;
  if (!Number.isFinite(t)) return null;
  // startTime may be seconds or milliseconds; normalise.
  const ms = t < 1e12 ? t * 1000 : t;
  const secs = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m < 60) return `${m}m${String(s).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}m`;
}

/** Visible width, ignoring ANSI escapes. */
const visibleLen = (s: string): number => s.replace(/\x1b\[[0-9;]*m/g, "").length;

/** Truncate to `max` visible chars, preserving a trailing reset. */
function clamp(s: string, max: number): string {
  if (max <= 0 || visibleLen(s) <= max) return s;
  let out = "";
  let seen = 0;
  for (let i = 0; i < s.length; i++) {
    const esc = /^\x1b\[[0-9;]*m/.exec(s.slice(i));
    if (esc) {
      out += esc[0];
      i += esc[0].length - 1;
      continue;
    }
    if (seen >= max - 1) break;
    out += s[i];
    seen++;
  }
  return `${out}…${RESET}`;
}

function renderRow(task: Task, columns: number): string {
  const { glyph, color, text } = statusMark(task.status);
  const name = task.name || task.label || task.type || task.id.slice(0, 8);

  const parts: string[] = [];
  parts.push(`${color}${glyph}${RESET} ${name}`);
  parts.push(`${color}${text}${RESET}`);

  const model = shortModel(task.model);
  if (model) parts.push(`${DIM}${model}${RESET}`);

  if (task.effort !== undefined && task.effort !== null) {
    parts.push(`${DIM}${task.effort}${RESET}`);
  }

  if (task.tokenCount && task.contextWindowSize) {
    const pct = Math.round((task.tokenCount / task.contextWindowSize) * 100);
    const c = pct >= 90 ? RED : pct >= 70 ? YELLOW : DIM;
    parts.push(`${c}ctx ${pct}%${RESET}`);
  } else if (task.tokenCount) {
    parts.push(`${DIM}${(task.tokenCount / 1000).toFixed(1)}k${RESET}`);
  }

  const el = elapsed(task.startTime);
  if (el) parts.push(`${DIM}${el}${RESET}`);

  return clamp(parts.join(`${GREY} · ${RESET}`), columns);
}

// ---------------------------------------------------------------------------
try {
  const raw = await Bun.stdin.text();
  const input: Input = raw.trim() ? JSON.parse(raw) : {};
  const columns = input.columns && input.columns > 10 ? input.columns : 80;

  for (const task of input.tasks ?? []) {
    if (!task?.id) continue;
    console.log(JSON.stringify({ id: task.id, content: renderRow(task, columns) }));
  }
} catch {
  // Emit nothing -> every row keeps its default rendering.
}
