import { describe, expect, test } from "bun:test";
import { INSTALL_SWIFT, PWAS } from "../chrome-pwas.ts";

describe("chrome-pwas", () => {
  test("four decided apps with names + hosts", () => {
    expect(PWAS.map((p) => p.name)).toEqual(["Mail", "Calendar", "Drive", "Notes"]);
    expect(PWAS.every((p) => p.url.startsWith("https://") && p.host.length > 0)).toBe(true);
  });

  test("embedded swift helper carries the proven flow", () => {
    expect(INSTALL_SWIFT).toContain("Cast, Save, and Share");
    expect(INSTALL_SWIFT).toContain("findChromeMenuButtonSpatially");
    expect(INSTALL_SWIFT).toContain("renameInstalledBundle");
    expect(INSTALL_SWIFT).toContain("kAXPressAction");
  });
});
