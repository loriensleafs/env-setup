import { defineItem } from "../item.ts";

/**
 * Xcode Command Line Tools. Non-interactive install: the on-demand marker file
 * makes `softwareupdate --list` expose the CLT label, which we then install
 * headlessly (no GUI dialog) — the researched technique.
 */
export const xcodeClt = defineItem({
  id: "xcode-clt",
  title: "Xcode Command Line Tools",
  kind: "system",
  required: true,
  detect: async (ctx) => {
    const sel = await ctx.run(["xcode-select", "-p"]);
    if (sel.exitCode !== 0) return { installed: false };
    const info = await ctx.run(["pkgutil", "--pkg-info=com.apple.pkg.CLTools_Executables"]);
    const version = info.stdout.match(/version:\s*(\S+)/)?.[1];
    return { installed: true, version };
  },
  install: async (ctx) => {
    const marker = "/tmp/.com.apple.dt.CommandLineTools.installondemand.in-progress";
    await Bun.write(marker, "");
    try {
      const list = await ctx.run(["softwareupdate", "--list"]);
      const label = list.stdout
        .split("\n")
        .map((l) => l.match(/\*\s*Label:\s*(Command Line Tools for Xcode-.*)/)?.[1])
        .find((l) => l !== undefined);
      if (!label) throw new Error("could not find a Command Line Tools label in softwareupdate --list");
      ctx.log(`installing "${label}" — this takes several minutes`);
      const r = await ctx.run(["softwareupdate", "--install", label, "--verbose"]);
      if (r.exitCode !== 0) throw new Error(`softwareupdate failed: ${r.stderr.trim()}`);
    } finally {
      await ctx.run(["rm", "-f", marker]);
    }
  },
  verify: async (ctx) => (await ctx.run(["xcode-select", "-p"])).exitCode === 0,
});
