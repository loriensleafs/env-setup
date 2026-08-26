/**
 * Pure logic for the unified selection prompt, following the
 * dynamic-group-multiselect pattern from clack's docs examples:
 * downstream options are DISABLED in place (with a "needs X" hint) rather
 * than hidden, and disabled options are cleared from the selection.
 */

export interface UnifiedOption {
  id: string;
  label: string;
  hint?: string;
  /**
   * "installed": already present — shown ✓ dim, not toggleable, satisfies deps.
   * "on": required and missing — always selected, not toggleable, satisfies deps.
   */
  locked?: "installed" | "on";
  /** Ids that must ALL be satisfied for this option to be enabled. */
  requires?: string[];
  initialSelected?: boolean;
}

/** Sections in render order → their options. */
export type UnifiedGroups = Record<string, UnifiedOption[]>;

export interface DisableResult {
  /** id → disabled reason label (absent = enabled). */
  disabled: Map<string, string>;
  /** Selection with newly-disabled ids stripped. */
  selection: Set<string>;
}

export function flatOptions(groups: UnifiedGroups): UnifiedOption[] {
  return Object.values(groups).flat();
}

export function initialSelection(groups: UnifiedGroups): Set<string> {
  const selected = new Set<string>();
  for (const o of flatOptions(groups)) {
    if (o.locked === "on" || (o.locked === undefined && o.initialSelected !== false)) {
      selected.add(o.id);
    }
  }
  return selected;
}

function satisfied(o: UnifiedOption | undefined, selection: Set<string>): boolean {
  if (!o) return false;
  if (o.locked !== undefined) return true;
  return selection.has(o.id);
}

/**
 * Recompute disabled state from the current selection; strip disabled ids
 * from the selection (repeat until stable so chains cascade).
 */
export function computeDisabled(groups: UnifiedGroups, selection: Set<string>): DisableResult {
  const all = flatOptions(groups);
  const byId = new Map(all.map((o) => [o.id, o]));
  const nextSelection = new Set(selection);
  const disabled = new Map<string, string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const o of all) {
      if (o.locked !== undefined || !o.requires?.length) continue;
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

/** Final result: locked-on + selected enabled options (installed rows excluded). */
export function selectionResult(groups: UnifiedGroups, selection: Set<string>): string[] {
  const { disabled, selection: clean } = computeDisabled(groups, selection);
  return flatOptions(groups)
    .filter((o) => !disabled.has(o.id))
    .filter((o) => o.locked === "on" || (o.locked === undefined && clean.has(o.id)))
    .map((o) => o.id);
}
