import { describe, expect, test } from "bun:test";
import { betterDisplaySchema, menuLevels, ALL_MENU_FEATURES } from "../better-display.ts";

describe("better-display", () => {
  test("sensible defaults", () => {
    expect(betterDisplaySchema.parse({})).toEqual({
      menuProfile: "default",
      startAtLogin: true,
      menuBarIcon: true,
      dockVisibility: "never",
      briefDockIconOnStartup: false,
      autoUpdate: true,
      sendUsageInfo: false,
    });
  });

  test("default profile: 9 top / 17 submenu / 7 hidden", () => {
    const m = menuLevels("default");
    const count = (lvl: string) => Object.values(m).filter((v) => v === lvl).length;
    expect(Object.keys(m).length).toBe(33);
    expect(count("less")).toBe(9);
    expect(count("more")).toBe(17);
    expect(count("hide")).toBe(7);
  });

  test("minimal profile keeps only the four essentials on top", () => {
    const m = menuLevels("minimal");
    expect(
      Object.entries(m)
        .filter(([, v]) => v === "less")
        .map(([k]) => k)
        .sort(),
    ).toEqual(["Brightness", "Quit", "Resolution", "Settings"].sort());
  });

  test("everything profile hides only the virtual-screen noise", () => {
    const m = menuLevels("everything");
    expect(Object.values(m).every((v) => v === "less" || v === "hide")).toBe(true);
    expect(m.Brightness).toBe("less");
    expect(m.VirtualScreenConnect).toBe("hide");
  });

  test("every feature is assigned in every profile", () => {
    for (const p of ["default", "minimal", "everything"] as const) {
      const m = menuLevels(p);
      for (const f of ALL_MENU_FEATURES) expect(m[f]).toBeDefined();
    }
  });
});
