import { defineItem } from "../item.ts";

const APP = "/Applications/Ghostty.app";
const TERMINAL_ICNS =
  "/System/Applications/Utilities/Terminal.app/Contents/Resources/Terminal.icns";

/**
 * Swap Ghostty's Dock icon for the native Terminal icon, read from the target
 * machine at runtime (docs/plan/PRD-001-envsetup.md Dock spec). Uses NSWorkspace.setIcon via a
 * transient Swift script (the technique validated in-session 2026-08-25);
 * writes the Icon\r resource outside the code-signature scope. Cask upgrades
 * wipe it — detect() notices and sync reapplies.
 */
export const ghosttyIcon = defineItem({
  id: "ghostty-icon",
  title: "Ghostty Terminal-style icon",
  kind: "config-only",
  deps: ["ghostty", "xcode-clt"], // runs `swift` (ships with the CLT)
  detect: async (ctx) => {
    const r = await ctx.run(["ls", `${APP}/Icon\r`]);
    return { installed: r.exitCode === 0 };
  },
  configure: async (ctx) => {
    const script = `
import AppKit
guard let img = NSImage(contentsOfFile: "${TERMINAL_ICNS}") else { fputs("load failed", stderr); exit(1) }
NSWorkspace.shared.setIcon(nil, forFile: "${APP}", options: [])
let ok = NSWorkspace.shared.setIcon(img, forFile: "${APP}", options: [])
exit(ok ? 0 : 1)
`;
    const path = "/tmp/envsetup-ghostty-icon.swift";
    await Bun.write(path, script);
    const r = await ctx.run(["swift", path]);
    await ctx.run(["rm", "-f", path]);
    if (r.exitCode !== 0) throw new Error(`icon swap failed: ${r.stderr.trim()}`);
    await ctx.run(["touch", APP]);
    await ctx.run(["killall", "Dock"]);
    ctx.log("Dock restarted with Terminal-style Ghostty icon");
  },
  verify: async (ctx) => (await ctx.run(["ls", `${APP}/Icon\r`])).exitCode === 0,
});
