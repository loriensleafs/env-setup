import { describe, expect, test } from "bun:test";
import { homedir } from "node:os";
import { FAVORITES, expandedFavorites, sameOrder } from "../finder-favorites.ts";

describe("finder-favorites", () => {
  test("expandedFavorites resolves ~ to the home dir, preserving order", () => {
    const out = expandedFavorites();
    expect(out.length).toBe(FAVORITES.length);
    expect(out[0]).toBe("/Applications");
    expect(out[1]).toBe(homedir());
    expect(out).toContain(`${homedir()}/Dev`);
    expect(out.every((p) => !p.startsWith("~"))).toBe(true);
  });

  test("sameOrder is exact and order-sensitive (detect/verify semantics)", () => {
    const want = expandedFavorites();
    expect(sameOrder(want, want)).toBe(true);
    expect(sameOrder([...want].reverse(), want)).toBe(false); // reordered
    expect(sameOrder(want.slice(0, -1), want)).toBe(false); // missing one
    expect(sameOrder([...want, "/extra"], want)).toBe(false); // extra
  });
});
