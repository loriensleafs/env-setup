import { defineItem, type ItemContext } from "../item.ts";

interface DefaultsSpec {
  domain: string;
  key: string;
  type: "bool" | "string";
  value: string;
}

/** Peter's decided macOS settings (docs/PLAN.md Group 5). */
export const DEFAULTS: DefaultsSpec[] = [
  { domain: "com.apple.finder", key: "AppleShowAllFiles", type: "bool", value: "true" },
  { domain: "NSGlobalDomain", key: "AppleShowAllExtensions", type: "bool", value: "true" },
  { domain: "com.apple.finder", key: "ShowPathbar", type: "bool", value: "true" },
  { domain: "com.apple.finder", key: "ShowStatusBar", type: "bool", value: "true" },
  { domain: "com.apple.finder", key: "_FXSortFoldersFirst", type: "bool", value: "true" },
  { domain: "com.apple.finder", key: "NewWindowTarget", type: "string", value: "PfHm" },
  { domain: "com.apple.finder", key: "FXDefaultSearchScope", type: "string", value: "SCcf" },
  {
    domain: "com.apple.finder",
    key: "FXEnableExtensionChangeWarning",
    type: "bool",
    value: "false",
  },
  { domain: "com.apple.finder", key: "FXPreferredViewStyle", type: "string", value: "clmv" },
  { domain: "NSGlobalDomain", key: "com.apple.swipescrolldirection", type: "bool", value: "false" },
];

async function currentMatches(ctx: ItemContext, spec: DefaultsSpec): Promise<boolean> {
  const r = await ctx.run(["defaults", "read", spec.domain, spec.key]);
  if (r.exitCode !== 0) return false;
  const raw = r.stdout.trim();
  if (spec.type === "bool") return (raw === "1") === (spec.value === "true");
  return raw === spec.value;
}

export const macosDefaults = defineItem({
  id: "macos-defaults",
  title: "macOS settings (Finder, scrolling)",
  kind: "system",
  detect: async (ctx) => {
    for (const spec of DEFAULTS) {
      if (!(await currentMatches(ctx, spec))) return { installed: false };
    }
    // ~/Library visibility is part of the spec too
    const flags = await ctx.run(["ls", "-lOd", `${process.env.HOME}/Library`]);
    if (flags.stdout.includes("hidden")) return { installed: false };
    return { installed: true };
  },
  install: async (ctx) => {
    for (const spec of DEFAULTS) {
      const r = await ctx.run([
        "defaults",
        "write",
        spec.domain,
        spec.key,
        `-${spec.type}`,
        spec.value,
      ]);
      if (r.exitCode !== 0)
        throw new Error(`defaults write ${spec.key} failed: ${r.stderr.trim()}`);
    }
    await ctx.run(["chflags", "nohidden", `${process.env.HOME}/Library`]);
    await ctx.run(["killall", "Finder"]); // apply Finder-visible changes
    ctx.log("Finder restarted to apply settings");
  },
  verify: async (ctx) => {
    for (const spec of DEFAULTS) {
      if (!(await currentMatches(ctx, spec))) return false;
    }
    return true;
  },
});
