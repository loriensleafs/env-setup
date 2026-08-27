#!/usr/bin/env bun
// Claude Code statusline: pill shapes + right-aligned context progress bar.
// Pure-Bun port of the original statusline.sh (no jq, no bash). Reads the
// statusline JSON from stdin; writes one line, no trailing newline.

import { $ } from "bun";

// --- Input ---------------------------------------------------------------
interface StatuslineInput {
  cwd?: string;
  workspace?: { current_dir?: string };
  model?: { display_name?: string };
  context_window?: { used_percentage?: number };
}

const input: StatuslineInput = await Bun.stdin.json().catch(() => ({}));
const cwd = input.workspace?.current_dir ?? input.cwd ?? "";
const model = input.model?.display_name ?? "Claude";
const contextPct = Math.trunc(input.context_window?.used_percentage ?? 0);

// --- Branch detection ----------------------------------------------------
let branch = "";
if (cwd !== "") {
  branch = (await $`git -C ${cwd} branch --show-current`.quiet().nothrow().text()).trim();
}
if (branch === "") branch = "(no branch)";

// --- Glyphs and colors ---------------------------------------------------
const ESC = "\x1b";
const LCAP = "\u{e0b6}"; // left rounded cap
const RCAP = "\u{e0b4}"; // right rounded cap
const DOT = "●";
const BAR_FILL = "━"; // ━
const BAR_EMPTY = "┄"; // ┄

const PILL_BG = `${ESC}[48;2;55;48;75m`;
const PILL_FG = `${ESC}[38;2;200;180;230m`;
const CAP_FG = `${ESC}[38;2;55;48;75m`;
const GREEN = `${ESC}[38;2;120;200;120m`;
const BAR_FG = `${ESC}[38;2;180;160;220m`;
const RESET = `${ESC}[0m`;

function buildPill(text: string, suffix = ""): string {
  return `${CAP_FG}${LCAP}${PILL_BG}${PILL_FG} ${text}${suffix} ${RESET}${CAP_FG}${RCAP}${RESET}`;
}

/** Visible width = 2 caps + 2 spaces + text + suffix's visible cells. */
function pillWidth(text: string, suffixVisible = 0): number {
  return 4 + text.length + suffixVisible;
}

// --- Terminal width ------------------------------------------------------
// Claude Code doesn't pass terminal width, and this process's stdout is a
// pipe. Walk up the process tree to find the controlling TTY and query it.
async function termWidth(): Promise<number | null> {
  let pid = process.ppid;
  for (let hop = 0; hop < 5 && pid > 0; hop++) {
    const tty = (await $`ps -o tty= -p ${pid}`.quiet().nothrow().text()).trim();
    if (tty !== "" && tty !== "?" && tty !== "??") {
      for (const dev of [`/dev/${tty}`, `/dev/${tty.replace(/^tty/, "")}`]) {
        if (await Bun.file(dev).exists()) {
          const size = (await $`sh -c ${`stty size < ${dev}`}`.quiet().nothrow().text()).trim();
          const width = Number(size.split(/\s+/)[1]);
          if (Number.isFinite(width) && width > 0) return width;
        }
      }
    }
    const ppid = Number((await $`ps -o ppid= -p ${pid}`.quiet().nothrow().text()).trim());
    if (!Number.isFinite(ppid)) break;
    pid = ppid;
  }
  return null;
}

let cols = (await termWidth()) ?? Number(process.env.COLUMNS) ?? 120;
if (!Number.isFinite(cols) || cols <= 0) cols = 120;
cols -= 4; // Claude Code reserves ~4 cells of internal padding
if (cols < 20) cols = 20;

// --- Left side -----------------------------------------------------------
const branchPill = buildPill(branch, ` ${GREEN}${DOT}${RESET}`);
const modelPill = buildPill(model);
const left = `${branchPill}  ${modelPill}`;
const leftWidth = pillWidth(branch, 2) + 2 + pillWidth(model);

// --- Right side: progress bar --------------------------------------------
const BAR_WIDTH = 20;
const filled = Math.min(BAR_WIDTH, Math.max(0, Math.trunc((contextPct * BAR_WIDTH) / 100)));
const bar = BAR_FILL.repeat(filled) + BAR_EMPTY.repeat(BAR_WIDTH - filled);
const right = `${BAR_FG}${bar}${RESET} ${contextPct}%`;
const rightWidth = BAR_WIDTH + 1 + String(contextPct).length + 1;

// --- Output --------------------------------------------------------------
const padding = Math.max(1, cols - leftWidth - rightWidth);
process.stdout.write(`${left}${" ".repeat(padding)}${right}`);
