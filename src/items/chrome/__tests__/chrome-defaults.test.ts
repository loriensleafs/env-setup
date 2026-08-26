import { describe, expect, test } from "bun:test";
import { CHROME_FLAGS, PINNED_ACTIONS, PINNED_EXTENSIONS } from "../chrome-defaults.ts";
import { PWAS } from "../chrome-pwas.ts";

describe("chrome defaults", () => {
  test("captured inventory shape", () => {
    expect(CHROME_FLAGS.length).toBe(81);
    expect(PINNED_ACTIONS.length).toBe(11);
    expect(PINNED_ACTIONS[0]).toBe("kActionShowChromeLabs");
    expect(PINNED_ACTIONS.at(-1)).toBe("kActionDevTools");
    expect(PINNED_EXTENSIONS).toEqual(["fcoeoabgfenejglbffodgkkbkcdhcgfn"]);
  });

  test("the four decided web apps with Dock names", () => {
    expect(PWAS.map((p) => p.name)).toEqual(["Mail", "Calendar", "Drive", "Notes"]);
    expect(PWAS.every((p) => p.url.startsWith("https://"))).toBe(true);
  });
});
