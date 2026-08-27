import type { Item, ZshContribution } from "../item.ts";

export const MARK_START = "# >>> envsetup managed >>>";
export const MARK_END = "# <<< envsetup managed <<<";

type Bucket = "env" | "completions" | "init" | "aliases";
const BUCKETS: Bucket[] = ["env", "completions", "init", "aliases"];

/**
 * Assemble the single managed ~/.zshrc block from every item's co-located
 * `zsh()` contribution. Owns the fixed skeleton and, crucially, the
 * `compinit` call between the FPATH/completions section and the init hooks —
 * without it none of the completions (brew site-functions, bun's compdef,
 * uv's eval) activate. Lines are deduped across items (first occurrence wins)
 * so several items can safely declare the same PATH entry.
 *
 * The block is derived from the FULL registry, not the current selection, so
 * every line is self-guarded; an unselected tool's line is simply inert.
 */
export function assembleManagedBlock(items: Item[]): string {
  const collected: Record<Bucket, string[]> = { env: [], completions: [], init: [], aliases: [] };
  const seen = new Set<string>();
  for (const item of items) {
    const c: ZshContribution | undefined = item.zsh?.(item.defaultConfig);
    if (!c) continue;
    for (const bucket of BUCKETS) {
      const lines = c[bucket];
      if (!lines?.length) continue;
      const fresh = lines.filter((l) => !seen.has(l));
      if (!fresh.length) continue;
      for (const l of fresh) seen.add(l);
      if (c.comment) collected[bucket].push(`# ${c.comment}`);
      collected[bucket].push(...fresh);
    }
  }

  const section = (title: string, lines: string[]): string[] =>
    lines.length ? [`# ${title}`, ...lines, ""] : [];

  const body = [
    ...section("PATH & environment", collected.env),
    ...section("Completions (FPATH must precede compinit)", collected.completions),
    "# Initialize the completion system (enables everything above).",
    "autoload -Uz compinit && compinit",
    "",
    ...section("Runtime init hooks", collected.init),
    ...section("Aliases", collected.aliases),
  ];
  // Drop a trailing blank line before the end marker.
  while (body.length && body[body.length - 1] === "") body.pop();

  return [MARK_START, ...body, MARK_END].join("\n");
}

/**
 * Per-item validation: which of an item's declared zsh lines are absent from
 * the given ~/.zshrc text. Powers `doctor`'s actionable shell report.
 */
export function zshGaps(item: Item, zshText: string): string[] {
  const c = item.zsh?.(item.defaultConfig);
  if (!c) return [];
  const lines = [
    ...(c.env ?? []),
    ...(c.completions ?? []),
    ...(c.init ?? []),
    ...(c.aliases ?? []),
  ];
  return lines.filter((l) => !zshText.includes(l));
}
