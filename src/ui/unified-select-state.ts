/**
 * Pure state machine for the unified selection prompt (Stage A centerpiece).
 * The @clack/core Prompt subclass is a thin shell over this — everything here
 * is deterministic and unit-tested.
 */

export interface UnifiedOption {
  id: string;
  label: string;
  /** Section title this option renders under. */
  section: string;
  /** Annotation, e.g. "installed 1.3.1 → will upgrade to 1.4.0". */
  hint?: string;
  /**
   * "installed": already present — informational row, not toggleable.
   * "on": required and missing — locked selected, not toggleable.
   */
  locked?: "installed" | "on";
  /** Ids that must be selected (or locked) for this option to be visible. */
  requires?: string[];
  initialSelected?: boolean;
}

export interface UnifiedState {
  options: UnifiedOption[];
  /** Selection memory for ALL options, hidden ones included. */
  selected: Set<string>;
  /** Cursor index into visibleRows() interactive rows. */
  cursor: number;
}

export type Row =
  | { kind: "header"; section: string }
  | { kind: "option"; option: UnifiedOption; interactive: boolean };

export function createState(options: UnifiedOption[]): UnifiedState {
  const selected = new Set<string>();
  for (const o of options) {
    if (o.locked === "on" || (o.locked === undefined && o.initialSelected !== false)) {
      selected.add(o.id);
    }
  }
  const state: UnifiedState = { options, selected, cursor: 0 };
  state.cursor = firstInteractiveIndex(state);
  return state;
}

/** An option satisfies a requirement if selected, locked-on, or already installed. */
function satisfies(state: UnifiedState, id: string): boolean {
  const opt = state.options.find((o) => o.id === id);
  if (!opt) return false;
  if (opt.locked === "installed" || opt.locked === "on") return true;
  return state.selected.has(id) && isVisible(state, opt);
}

export function isVisible(state: UnifiedState, option: UnifiedOption): boolean {
  if (!option.requires || option.requires.length === 0) return true;
  return option.requires.every((r) => satisfies(state, r));
}

/** Rows to render: section headers + visible options, in input order. */
export function visibleRows(state: UnifiedState): Row[] {
  const rows: Row[] = [];
  let currentSection: string | null = null;
  for (const option of state.options) {
    if (!isVisible(state, option)) continue;
    if (option.section !== currentSection) {
      currentSection = option.section;
      rows.push({ kind: "header", section: currentSection });
    }
    // All visible options are navigable (so long lists can scroll to locked
    // sections); only unlocked ones are toggleable.
    rows.push({ kind: "option", option, interactive: true });
  }
  return rows;
}

function interactiveIndices(state: UnifiedState): number[] {
  return visibleRows(state)
    .map((row, i) => (row.kind === "option" && row.interactive ? i : -1))
    .filter((i) => i >= 0);
}

function firstInteractiveIndex(state: UnifiedState): number {
  return interactiveIndices(state)[0] ?? 0;
}

export function moveCursor(state: UnifiedState, direction: 1 | -1): void {
  const indices = interactiveIndices(state);
  if (indices.length === 0) return;
  const pos = indices.indexOf(state.cursor);
  const next = pos === -1 ? 0 : (pos + direction + indices.length) % indices.length;
  state.cursor = indices[next] as number;
}

/** Toggle the option under the cursor. Hidden dependents keep their memory. */
export function toggleAtCursor(state: UnifiedState): void {
  const row = visibleRows(state)[state.cursor];
  if (!row || row.kind !== "option" || row.option.locked !== undefined) return;
  const id = row.option.id;
  if (state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);
  // Toggling can hide rows (dependents) — keep the cursor on an interactive row.
  const indices = interactiveIndices(state);
  if (!indices.includes(state.cursor)) {
    const fallback = indices.filter((i) => i <= state.cursor).at(-1) ?? indices[0] ?? 0;
    state.cursor = fallback;
  }
}

/** Final result: selected AND visible (hidden memory doesn't count), plus locked-on. */
export function result(state: UnifiedState): string[] {
  return state.options
    .filter((o) => isVisible(state, o))
    .filter((o) => o.locked === "on" || (o.locked === undefined && state.selected.has(o.id)))
    .map((o) => o.id);
}
