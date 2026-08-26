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
}

export interface ItemContext {
  manifest: Manifest;
  log: (message: string) => void;
  run: Runner;
}

/** A ceremony is an attended step (sign-in, permission dialog) surfaced in Stage C. */
export interface Ceremony {
  id: string;
  title: string;
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
  detect(ctx: ItemContext): Promise<DetectResult>;
  install?(ctx: ItemContext): Promise<void>;
  configure?(ctx: ItemContext, config: C): Promise<void>;
  verify?(ctx: ItemContext): Promise<boolean>;
}

/** Identity helper that preserves the config type parameter. */
export function defineItem<C>(item: Item<C>): Item<C> {
  return item;
}
