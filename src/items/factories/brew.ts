import { defineItem, type Item, type ItemContext } from "../item.ts";

export const BREW = "/opt/homebrew/bin/brew";

export interface BrewSpec {
  id: string;
  title: string;
  /** brew formula/cask name (defaults to id). */
  name?: string;
  required?: boolean;
  /** Extra deps beyond homebrew itself. */
  deps?: string[];
}

async function brewDetect(
  ctx: ItemContext,
  kind: "formula" | "cask",
  name: string,
): Promise<{ installed: boolean; version?: string }> {
  const args =
    kind === "formula" ? [BREW, "list", "--versions", name] : [BREW, "list", "--cask", "--versions", name];
  const r = await ctx.run(args);
  if (r.exitCode !== 0) return { installed: false };
  const version = r.stdout.trim().split(/\s+/)[1];
  return { installed: true, version };
}

export function brewFormula(spec: BrewSpec): Item {
  const name = spec.name ?? spec.id;
  return defineItem({
    id: spec.id,
    title: spec.title,
    kind: "brew-formula",
    required: spec.required,
    deps: ["homebrew", ...(spec.deps ?? [])],
    detect: (ctx) => brewDetect(ctx, "formula", name),
    install: async (ctx) => {
      const r = await ctx.run([BREW, "install", name]);
      if (r.exitCode !== 0) throw new Error(`brew install ${name} failed: ${r.stderr.trim()}`);
    },
    verify: async (ctx) => (await brewDetect(ctx, "formula", name)).installed,
  });
}

export function brewCask(spec: BrewSpec): Item {
  const name = spec.name ?? spec.id;
  return defineItem({
    id: spec.id,
    title: spec.title,
    kind: "brew-cask",
    required: spec.required,
    deps: ["homebrew", ...(spec.deps ?? [])],
    detect: (ctx) => brewDetect(ctx, "cask", name),
    install: async (ctx) => {
      const r = await ctx.run([BREW, "install", "--cask", name]);
      if (r.exitCode !== 0) throw new Error(`brew install --cask ${name} failed: ${r.stderr.trim()}`);
    },
    verify: async (ctx) => (await brewDetect(ctx, "cask", name)).installed,
  });
}
