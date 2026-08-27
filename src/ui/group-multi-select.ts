/**
 * Enhanced GroupMultiSelect prompt — the Stage A selection screen.
 *
 * A faithful adaptation of
 * ~/Dev/clack/examples/docs/custom/dynamic-group-multiselect.ts (Peter's
 * reference), keeping the example's rendering and listener structure.
 *
 * Deltas from the example, each deliberate:
 * - requirements use ALL-of semantics with cascading disable + multi-missing
 *   reason labels (computeDisabled below)
 * - locked "on" rows (required-missing items): always selected, cursor-skipped
 * - group headers with zero togglable items render as plain headings
 * - viewport windowing for lists taller than the terminal
 */
import { styleText } from "node:util";
import { GroupMultiSelectPrompt } from "@clack/core";
import {
  formatInstructionFooter,
  isCancel,
  MULTISELECT_INSTRUCTIONS,
  S_BAR,
  S_BAR_END,
  S_CHECKBOX_ACTIVE,
  S_CHECKBOX_INACTIVE,
  S_CHECKBOX_SELECTED,
  symbol,
} from "@clack/prompts";

export interface SelectOption {
  id: string;
  label: string;
  hint?: string;
  /** Ids that must ALL be selected for this option to be enabled. */
  requires?: string[];
  initialSelected?: boolean;
}

/** Sections in render order → their options. */
export type SelectGroups = Record<string, SelectOption[]>;

export interface DisableResult {
  /** id → disabled reason label (absent = enabled). */
  disabled: Map<string, string>;
  /** Selection with newly-disabled ids stripped. */
  selection: Set<string>;
}

export function flatten(groups: SelectGroups): SelectOption[] {
  return Object.values(groups).flat();
}

export function initialSelection(groups: SelectGroups): Set<string> {
  const selected = new Set<string>();
  for (const o of flatten(groups)) {
    if (o.initialSelected !== false) selected.add(o.id);
  }
  return selected;
}

function satisfied(o: SelectOption | undefined, selection: Set<string>): boolean {
  if (!o) return false;
  return selection.has(o.id);
}

/**
 * Recompute disabled state from the current selection; strip disabled ids
 * from the selection (repeat until stable so chains cascade).
 */
export function computeDisabled(groups: SelectGroups, selection: Set<string>): DisableResult {
  const all = flatten(groups);
  const byId = new Map(all.map((o) => [o.id, o]));
  const nextSelection = new Set(selection);
  const disabled = new Map<string, string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const o of all) {
      if (!o.requires?.length) continue;
      const missing = o.requires.filter(
        (r) => !satisfied(byId.get(r), nextSelection) || disabled.has(r),
      );
      if (missing.length > 0) {
        if (!disabled.has(o.id)) {
          const labels = missing.map((id) => byId.get(id)?.label ?? id);
          disabled.set(o.id, `needs ${labels.join(" + ")}`);
          changed = true;
        }
        if (nextSelection.delete(o.id)) changed = true;
      }
    }
  }
  return { disabled, selection: nextSelection };
}

/** Final result: selected, enabled options. */
export function selectionResult(groups: SelectGroups, selection: Set<string>): string[] {
  const { disabled, selection: clean } = computeDisabled(groups, selection);
  return flatten(groups)
    .filter((o) => !disabled.has(o.id) && clean.has(o.id))
    .map((o) => o.id);
}

export interface GroupMultiselectOptions {
  message: string;
  groups: SelectGroups;
  /** Prompt input stream (thread promptInput() — see src/ui/terminal.ts). */
  input?: NodeJS.ReadStream;
}

interface CoreOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

type FlatOption = CoreOption & { group: string | boolean };

export async function groupMultiselect(opts: GroupMultiselectOptions): Promise<string[] | symbol> {
  const meta = new Map(flatten(opts.groups).map((o) => [o.id, o]));
  const memory = initialSelection(opts.groups);

  const coreGroups: Record<string, CoreOption[]> = {};
  for (const [section, items] of Object.entries(opts.groups)) {
    coreGroups[section] = items.map((o) => ({ value: o.id, label: o.label, hint: o.hint }));
  }

  const prompt = new GroupMultiSelectPrompt<CoreOption>({
    input: opts.input,
    options: coreGroups,
    initialValues: [...memory],
    selectableGroups: true,
    render() {
      const title = `${styleText("gray", S_BAR)}\n${symbol(this.state)}  ${opts.message}\n`;
      const value: string[] = (this.value as string[] | undefined) ?? [];
      const flat = this.options as FlatOption[];
      const selectedItems = flat.filter(
        (option) => typeof option.group === "string" && value.includes(option.value),
      );

      switch (this.state) {
        case "submit": {
          const labels =
            selectedItems.map((option) => styleText("dim", option.label)).join(", ") ||
            styleText("dim", "none");
          return `${title}${styleText("gray", S_BAR)}  ${labels}`;
        }
        case "cancel": {
          const labels = selectedItems
            .map((option) => styleText(["strikethrough", "dim"], option.label))
            .join(", ");
          return `${title}${styleText("gray", S_BAR)}  ${labels}`;
        }
        default: {
          const prefix = `${styleText("cyan", S_BAR)}  `;
          const lines = flat.map((option, i) => {
            const active = i === this.cursor;
            if (option.group === true) {
              const items = flat.filter((o) => o.group === option.value && !o.disabled);
              // Zero togglable items → plain heading, no checkbox that can
              // never fill (the Required-section fix).
              if (items.length === 0) {
                return styleText("dim", option.label);
              }
              const allSelected = items.length > 0 && items.every((o) => value.includes(o.value));
              const checkbox = allSelected
                ? styleText("green", S_CHECKBOX_SELECTED)
                : active
                  ? styleText("cyan", S_CHECKBOX_ACTIVE)
                  : styleText("dim", S_CHECKBOX_INACTIVE);
              return `${checkbox} ${active ? option.label : styleText("dim", option.label)}`;
            }
            const next = flat[i + 1];
            const isLast = next === undefined || next.group === true;
            const tree = styleText("dim", isLast ? `${S_BAR_END} ` : `${S_BAR} `);
            if (option.disabled) {
              return `${tree}${styleText("gray", S_CHECKBOX_INACTIVE)} ${styleText(
                ["strikethrough", "gray"],
                option.label,
              )}${option.hint ? ` ${styleText("dim", `(${option.hint})`)}` : ""}`;
            }
            const selected = value.includes(option.value);
            const checkbox = selected
              ? styleText("green", S_CHECKBOX_SELECTED)
              : active
                ? styleText("cyan", S_CHECKBOX_ACTIVE)
                : styleText("dim", S_CHECKBOX_INACTIVE);
            // Stock styling (deviation from the example, per Peter): the label
            // is white only when FOCUSED — otherwise focus is invisible when
            // most options are selected. Selection lives in the checkbox.
            const label = active ? option.label : styleText("dim", option.label);
            const hint = active && option.hint ? ` ${styleText("dim", `(${option.hint})`)}` : "";
            return `${tree}${checkbox} ${label}${hint}`;
          });

          // Viewport windowing (delta from the example: 30+ rows won't fit).
          const maxRows = Math.max(8, (process.stdout.rows ?? 24) - 8);
          let start = 0;
          if (lines.length > maxRows) {
            start = Math.min(
              Math.max(0, this.cursor - Math.floor(maxRows / 2)),
              lines.length - maxRows,
            );
          }
          const end = Math.min(lines.length, start + maxRows);
          const windowed = [
            ...(start > 0 ? [styleText("dim", `↑ ${start} more`)] : []),
            ...lines.slice(start, end),
            ...(end < lines.length ? [styleText("dim", `↓ ${lines.length - end} more`)] : []),
          ];
          const footer = formatInstructionFooter(MULTISELECT_INSTRUCTIONS, true);
          return `${title}${prefix}${windowed.join(`\n${prefix}`)}\n${footer.join("\n")}\n`;
        }
      }
    },
  });

  const flatOptions = prompt.options as FlatOption[];
  const itemsOf = (group: string) => flatOptions.filter((option) => option.group === group);
  const blocked = (option: FlatOption | undefined) =>
    option !== undefined && option.group !== true && option.disabled === true;

  let previousValue: string[] = [...((prompt.value as string[] | undefined) ?? [])];

  const recompute = () => {
    const selected = new Set<string>((prompt.value as string[] | undefined) ?? []);
    const result = computeDisabled(opts.groups, selected);
    let changed = false;
    for (const option of flatOptions) {
      if (option.group === true) continue;
      const reason = result.disabled.get(option.value);
      const wasDisabled = option.disabled === true;
      option.disabled = reason !== undefined;
      if (reason !== undefined) {
        option.hint = reason;
        if (result.selection.has(option.value)) changed = true;
      } else if (wasDisabled) {
        option.hint = meta.get(option.value)?.hint;
      }
    }
    const nextValue = [...result.selection];
    if (changed || nextValue.length !== selected.size) {
      prompt.value = nextValue;
    } else {
      prompt.value = nextValue;
    }
    if (blocked(flatOptions[prompt.cursor])) {
      const total = flatOptions.length;
      for (let i = 1; i < total; i++) {
        const index = (prompt.cursor + i) % total;
        if (!blocked(flatOptions[index])) {
          prompt.cursor = index;
          break;
        }
      }
    }
  };

  prompt.on("cursor", (action) => {
    if (action !== "up" && action !== "down" && action !== "left" && action !== "right") return;
    const direction = action === "up" || action === "left" ? -1 : 1;
    const total = flatOptions.length;
    for (let i = 0; i < total && blocked(flatOptions[prompt.cursor]); i++) {
      prompt.cursor = (prompt.cursor + direction + total) % total;
    }
  });

  prompt.on("key", (_char, key) => {
    if (key?.name === "space") {
      const current = flatOptions[prompt.cursor];
      if (current?.group === true) {
        // Re-derive the group toggle over togglable items only (the built-in
        // toggle counts disabled/locked items and could never deselect).
        const togglable = itemsOf(current.value).filter((o) => !blocked(o));
        const values = togglable.map((o) => o.value);
        const wasAllSelected =
          togglable.length > 0 && values.every((v) => previousValue.includes(v));
        const groupValues = new Set(itemsOf(current.value).map((o) => o.value));
        const rest = previousValue.filter((v) => !groupValues.has(v));
        prompt.value = wasAllSelected ? rest : [...rest, ...values];
      }
    }
    recompute();
    previousValue = [...((prompt.value as string[] | undefined) ?? [])];
  });

  recompute();

  const answer = await prompt.prompt();
  if (isCancel(answer) || answer === undefined) return answer as symbol;
  return selectionResult(opts.groups, new Set(answer as string[]));
}
