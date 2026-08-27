import { defineItem } from "../item.ts";

/**
 * Raycast takes ⌘Space (decided): Spotlight's hotkey is disabled via
 * symbolic-hotkey 64, Raycast's is set via its documented defaults key.
 * Onboarding + extension installs are Stage C ceremonies (deeplinks need
 * the app running and confirmation).
 */
export const raycastConfig = defineItem({
  id: "raycast-config",
  title: "Raycast setup (⌘Space, Spotlight off)",
  kind: "config-only",
  deps: ["raycast"],
  ceremonies: [
    { id: "raycast-onboarding", title: "Finish Raycast onboarding + starter extensions" },
  ],
  detect: async (ctx) => {
    const hotkey = await ctx.run(["defaults", "read", "com.raycast.macos", "raycastGlobalHotkey"]);
    if (hotkey.exitCode !== 0 || !hotkey.stdout.includes("Command-49")) return { installed: false };
    const spotlight = await ctx.run([
      "/usr/libexec/PlistBuddy",
      "-c",
      "Print :AppleSymbolicHotKeys:64:enabled",
      `${process.env.HOME}/Library/Preferences/com.apple.symbolichotkeys.plist`,
    ]);
    return { installed: spotlight.stdout.trim() === "false" };
  },
  configure: async (ctx) => {
    // Disable Spotlight's ⌘Space (symbolic hotkey id 64).
    const plist = `${process.env.HOME}/Library/Preferences/com.apple.symbolichotkeys.plist`;
    const set = await ctx.run([
      "/usr/libexec/PlistBuddy",
      "-c",
      "Set :AppleSymbolicHotKeys:64:enabled false",
      plist,
    ]);
    if (set.exitCode !== 0) {
      const add = await ctx.run([
        "/usr/libexec/PlistBuddy",
        "-c",
        "Add :AppleSymbolicHotKeys:64:enabled bool false",
        plist,
      ]);
      if (add.exitCode !== 0) throw new Error(`symbolic hotkey edit failed: ${add.stderr.trim()}`);
    }
    // Raycast on ⌘Space (key 49 = space).
    const r = await ctx.run([
      "defaults",
      "write",
      "com.raycast.macos",
      "raycastGlobalHotkey",
      "-string",
      "Command-49",
    ]);
    if (r.exitCode !== 0) throw new Error("raycast hotkey write failed");
    // Hotkey daemon reload; full effect after next login at the latest.
    await ctx.run([
      "/System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings",
      "-u",
    ]);
    ctx.log("⌘Space → Raycast (Spotlight hotkey off; log out/in if it doesn't take immediately)");
  },
});
