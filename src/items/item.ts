import type { z } from "zod";
import type { Runner } from "../exec/run.ts";
import type { Manifest } from "../manifest/schema.ts";

export type ItemKind =
  | "system" // Xcode CLT, macOS defaults, dock, quick-actions
  | "brew-formula"
  | "brew-cask"
  | "installer-script" // bun, uv
  | "font"
  | "repo"
  | "pwa"
  | "config-only"; // items that only configure something installed elsewhere

export interface DetectResult {
  installed: boolean;
  version?: string;
  /** Whether the installed version satisfies the manifest pin/policy. */
  satisfies?: boolean;
  /**
   * Config-drift signal (items with config defaults): the thing IS installed
   * and configuration is PRESENT, but its values differ from our effective
   * defaults. Always paired with `installed: false` so the item re-enters the
   * install list — where bootstrap marks it "installed — settings differ" and
   * leaves it UNCHECKED (selecting it is the user's opt-in to reset). Absent
   * config (never set up) stays a plain `installed: false`.
   */
  differs?: boolean;
}

export interface ItemContext {
  manifest: Manifest;
  log: (message: string) => void;
  run: Runner;
  /**
   * Ask the user a yes/no question mid-step (the run pauses its spinner,
   * prompts, resumes). Absent in headless contexts — items must fall back to
   * failing with a clear message when it's undefined.
   */
  ask?: (message: string) => Promise<boolean>;
}

/** A ceremony is an attended step (sign-in, permission dialog) surfaced in Stage C. */
export interface Ceremony {
  id: string;
  title: string;
}

/**
 * A tool's ~/.zshrc needs, declared co-located with the item that installs it.
 * The dotfiles collector (items/defs/shell-block.ts) assembles all items'
 * contributions into the single managed block, in a fixed, correct order:
 * env → completions (FPATH) → compinit → init hooks → aliases. EVERY line must
 * be self-guarded (`command -v x >/dev/null && …`, `[ -d … ] && …`) because the
 * block is emitted whole regardless of which items were selected.
 */
export interface ZshContribution {
  /** Section label for this item's lines (e.g. "bun", "Go"). */
  comment?: string;
  /** PATH / environment exports — emitted first. */
  env?: string[];
  /** FPATH additions / compdef producers — must precede compinit. */
  completions?: string[];
  /** Hooks & evals needing PATH ready (fnm, uv/bun completions) — after compinit. */
  init?: string[];
  /** Aliases — emitted last. */
  aliases?: string[];
}

export interface Item<C = unknown> {
  id: string;
  title: string;
  kind: ItemKind;
  /** Required items are locked-on in the selection UI. */
  required?: boolean;
  /** Ids of items that must complete before this one runs. */
  deps?: string[];
  ceremonies?: Ceremony[];
  configSchema?: z.ZodType<C>;
  defaultConfig?: C;
  /** Declares this item's ~/.zshrc needs. Pure (no I/O); may read config. */
  zsh?(config?: C): ZshContribution | undefined;
  detect(ctx: ItemContext): Promise<DetectResult>;
  install?(ctx: ItemContext): Promise<void>;
  configure?(ctx: ItemContext, config: C): Promise<void>;
  verify?(ctx: ItemContext): Promise<boolean>;
}

/** Identity helper that preserves the config type parameter. */
export function defineItem<C>(item: Item<C>): Item<C> {
  return item;
}
