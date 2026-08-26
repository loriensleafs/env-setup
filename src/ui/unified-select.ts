import { Prompt, isCancel } from "@clack/core";
import color from "picocolors";
import {
  createState,
  moveCursor,
  result,
  toggleAtCursor,
  visibleRows,
  type UnifiedOption,
} from "./unified-select-state.ts";
import {
  S_BAR,
  S_BAR_END,
  S_CHECKBOX_SELECTED,
  S_CHECKBOX_UNSELECTED,
  S_INSTALLED,
  S_LOCKED_ON,
  symbolFor,
} from "./theme.ts";

export interface UnifiedSelectOptions {
  message: string;
  options: UnifiedOption[];
}

/**
 * The Stage A selection screen: sectioned multiselect with locked rows,
 * detection annotations, and LIVE dependency filtering (unselecting an item
 * hides its dependents immediately; reselecting restores them with their
 * previous state). Space toggles, ↑/↓ move, Enter submits.
 */
export async function unifiedSelect(opts: UnifiedSelectOptions): Promise<string[] | symbol> {
  const state = createState(opts.options);

  const prompt = new Prompt<string[]>(
    {
      render() {
        const lines: string[] = [];
        const rows = visibleRows(state);
        // Viewport: window the list to the terminal height so long lists
        // scroll with the cursor instead of overflowing.
        const maxRows = Math.max(8, (process.stdout.rows ?? 24) - 7);
        let start = 0;
        if (rows.length > maxRows) {
          start = Math.min(Math.max(0, state.cursor - Math.floor(maxRows / 2)), rows.length - maxRows);
        }
        const end = Math.min(rows.length, start + maxRows);
        if (start > 0) lines.push(`${color.cyan(S_BAR)}  ${color.dim(`↑ ${start} more`)}`);
        for (let i = start; i < end; i++) {
          const row = rows[i];
          if (!row) continue;
          if (row.kind === "header") {
            lines.push(`${color.cyan(S_BAR)}`);
            lines.push(`${color.cyan(S_BAR)}  ${color.bold(color.underline(row.section))}`);
            continue;
          }
          const o = row.option;
          const active = i === state.cursor;
          const hint = o.hint ? ` ${color.dim(o.hint)}` : "";
          let line: string;
          if (o.locked === "installed") {
            line = `${color.green(S_INSTALLED)} ${color.dim(o.label)}${hint}`;
          } else if (o.locked === "on") {
            line = `${color.green(S_LOCKED_ON)} ${o.label}${hint}`;
          } else {
            const box = state.selected.has(o.id)
              ? color.green(S_CHECKBOX_SELECTED)
              : color.dim(S_CHECKBOX_UNSELECTED);
            const label = active ? color.cyan(o.label) : o.label;
            line = `${box} ${label}${hint}`;
          }
          lines.push(`${color.cyan(S_BAR)}  ${active ? color.cyan("❯") : " "} ${line}`);
        }
        if (end < rows.length) lines.push(`${color.cyan(S_BAR)}  ${color.dim(`↓ ${rows.length - end} more`)}`);
        const header = `${symbolFor(this.state)}  ${opts.message} ${color.dim("(space to toggle, enter to confirm)")}`;
        return `${color.gray(S_BAR)}\n${header}\n${lines.join("\n")}\n${color.cyan(S_BAR_END)}\n`;
      },
    },
    false,
  );

  prompt.value = result(state);
  prompt.on("cursor", (key) => {
    if (key === "up" || key === "left") moveCursor(state, -1);
    if (key === "down" || key === "right") moveCursor(state, 1);
    if (key === "space") toggleAtCursor(state);
    prompt.value = result(state);
  });

  const answer = await prompt.prompt();
  return isCancel(answer) ? answer : (answer as string[]);
}
