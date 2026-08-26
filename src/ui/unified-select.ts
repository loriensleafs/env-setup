import { GroupMultiSelectPrompt } from "@clack/core";
import {
  formatInstructionFooter,
  isCancel,
  MULTISELECT_INSTRUCTIONS,
  S_BAR,
  S_CHECKBOX_ACTIVE,
  S_CHECKBOX_INACTIVE,
  S_CHECKBOX_SELECTED,
  symbol,
} from "@clack/prompts";
import color from "picocolors";
import {
  computeDisabled,
  initialSelection,
  flatOptions as flatten,
  type UnifiedGroups,
  type UnifiedOption,
  selectionResult,
} from "./unified-select-state.ts";

const S_LOCKED_ON = "◉";
const S_INSTALLED = "✓";

export interface UnifiedSelectOptions {
  message: string;
  groups: UnifiedGroups;
}

type FlatOption = UnifiedOption & { group: string | boolean; value?: string };

/**
 * The Stage A selection screen, following clack's dynamic-group-multiselect
 * docs pattern: stock GroupMultiSelectPrompt + listeners layering in
 * disabled-with-reason downstream options, locked rows (required/installed),
 * group-header toggling over unlockable items only, and viewport windowing.
 */
export async function unifiedSelect(opts: UnifiedSelectOptions): Promise<string[] | symbol> {
  const coreGroups: Record<string, { value: string; label: string }[]> = {};
  for (const [section, items] of Object.entries(opts.groups)) {
    coreGroups[section] = items.map((o) => ({ value: o.id, label: o.label }));
  }
  const meta = new Map(flatten(opts.groups).map((o) => [o.id, o]));
  const memory = initialSelection(opts.groups);
  let disabled = computeDisabled(opts.groups, memory).disabled;

  const isLocked = (id: string) => meta.get(id)?.locked !== undefined;
  const isTogglable = (id: string) => !isLocked(id) && !disabled.has(id);

  const prompt = new GroupMultiSelectPrompt<{ value: string; label: string }>({
    options: coreGroups,
    initialValues: [...memory],
    selectableGroups: true,
    render() {
      const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
      const flat = this.options as FlatOption[];
      const value: string[] = (this.value as string[] | undefined) ?? [];

      if (this.state === "submit" || this.state === "cancel") {
        const labels = flat
          .filter((o) => typeof o.group === "string" && value.includes(o.value as string))
          .map((o) => (this.state === "cancel" ? color.strikethrough(color.dim(o.label)) : color.dim(o.label)))
          .join(", ");
        return `${title}${color.gray(S_BAR)}  ${labels || color.dim("none")}`;
      }

      const prefix = `${color.cyan(S_BAR)}  `;
      const lines = flat.map((o, i) => {
        const active = i === this.cursor;
        if (o.group === true) {
          const items = flat.filter(
            (x) => x.group === o.value && isTogglable(x.value as string),
          );
          // A section with nothing togglable is a plain heading — a checkbox
          // that can never fill reads as broken (Peter's Required-section bug).
          if (items.length === 0) {
            return `${color.bold(active ? (o.label as string) : color.dim(o.label as string))}`;
          }
          const allSelected = items.every((x) => value.includes(x.value as string));
          const checkbox = allSelected
            ? color.green(S_CHECKBOX_SELECTED)
            : active
              ? color.cyan(S_CHECKBOX_ACTIVE)
              : color.dim(S_CHECKBOX_INACTIVE);
          return `${checkbox} ${color.bold(active ? (o.label as string) : color.dim(o.label as string))}`;
        }
        const id = o.value as string;
        const m = meta.get(id);
        const next = flat[i + 1];
        const isLast = next === undefined || next.group === true;
        const tree = color.dim(isLast ? "└ " : "│ ");
        const baseHint = m?.hint;
        if (m?.locked === "installed") {
          return `${tree}${color.green(S_INSTALLED)} ${color.dim(o.label)}${baseHint ? ` ${color.dim(baseHint)}` : ""}`;
        }
        if (m?.locked === "on") {
          return `${tree}${color.green(S_LOCKED_ON)} ${active ? o.label : color.dim(o.label)}${baseHint ? ` ${color.dim(baseHint)}` : ""}`;
        }
        const reason = disabled.get(id);
        if (reason !== undefined) {
          return `${tree}${color.gray(S_CHECKBOX_INACTIVE)} ${color.strikethrough(color.gray(o.label))} ${color.dim(`(${reason})`)}`;
        }
        const selected = value.includes(id);
        const checkbox = selected
          ? color.green(S_CHECKBOX_SELECTED)
          : active
            ? color.cyan(S_CHECKBOX_ACTIVE)
            : color.dim(S_CHECKBOX_INACTIVE);
        // Stock clack styling: the label is white only when FOCUSED; selection
        // is communicated by the checkbox alone.
        const label = active ? o.label : color.dim(o.label);
        const hint = active && baseHint ? ` ${color.dim(baseHint)}` : "";
        return `${tree}${checkbox} ${label}${hint}`;
      });

      // Viewport: window to terminal height, following the cursor.
      const maxRows = Math.max(8, (process.stdout.rows ?? 24) - 8);
      let start = 0;
      if (lines.length > maxRows) {
        start = Math.min(Math.max(0, this.cursor - Math.floor(maxRows / 2)), lines.length - maxRows);
      }
      const end = Math.min(lines.length, start + maxRows);
      const windowed = [
        ...(start > 0 ? [color.dim(`↑ ${start} more`)] : []),
        ...lines.slice(start, end),
        ...(end < lines.length ? [color.dim(`↓ ${lines.length - end} more`)] : []),
      ];
      const footer = formatInstructionFooter(MULTISELECT_INSTRUCTIONS, true);
      return `${title}${prefix}${windowed.join(`\n${prefix}`)}\n${footer.join("\n")}\n`;
    },
  });

  const flat = prompt.options as FlatOption[];
  const itemsOf = (group: string) => flat.filter((o) => o.group === group);
  let previousValue: string[] = [...((prompt.value as string[] | undefined) ?? [])];

  const recompute = () => {
    const current = new Set<string>((prompt.value as string[] | undefined) ?? []);
    // Locked-on ids are always in the selection; installed never are.
    for (const o of flatten(opts.groups)) {
      if (o.locked === "on") current.add(o.id);
      if (o.locked === "installed") current.delete(o.id);
    }
    const result = computeDisabled(opts.groups, current);
    disabled = result.disabled;
    prompt.value = [...result.selection];
    // Keep the cursor off locked/disabled/uninteractive rows.
    const cursorRow = flat[prompt.cursor];
    const rowBlocked = (row: FlatOption | undefined) =>
      row !== undefined && row.group !== true && !isTogglable(row.value as string);
    if (rowBlocked(cursorRow)) {
      const total = flat.length;
      for (let i = 1; i < total; i++) {
        const idx = (prompt.cursor + i) % total;
        if (!rowBlocked(flat[idx])) {
          prompt.cursor = idx;
          break;
        }
      }
    }
  };

  prompt.on("cursor", (action) => {
    if (action !== "up" && action !== "down" && action !== "left" && action !== "right") return;
    const direction = action === "up" || action === "left" ? -1 : 1;
    const total = flat.length;
    const blocked = (idx: number) => {
      const row = flat[idx];
      return row !== undefined && row.group !== true && !isTogglable(row.value as string);
    };
    for (let i = 0; i < total && blocked(prompt.cursor); i++) {
      prompt.cursor = (prompt.cursor + direction + total) % total;
    }
  });

  prompt.on("key", (_char, key) => {
    if (key?.name === "space") {
      const current = flat[prompt.cursor];
      if (current?.group === true) {
        // Re-derive group toggle over togglable items only.
        const togglable = itemsOf(current.value as string).filter((o) => isTogglable(o.value as string));
        const values = togglable.map((o) => o.value as string);
        const wasAll = togglable.length > 0 && values.every((v) => previousValue.includes(v));
        const groupIds = new Set(itemsOf(current.value as string).map((o) => o.value as string));
        const rest = previousValue.filter((v) => !groupIds.has(v));
        prompt.value = wasAll ? rest : [...rest, ...values];
      }
    }
    recompute();
    previousValue = [...((prompt.value as string[] | undefined) ?? [])];
  });

  recompute();

  const answer = await prompt.prompt();
  if (isCancel(answer) || answer === undefined) return answer as symbol;
  // Recompute the final result from memory semantics (locked-on included).
  const final = new Set(answer as string[]);
  return selectionResult(opts.groups, final);
}
