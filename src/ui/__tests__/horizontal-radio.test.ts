import { describe, expect, test } from "bun:test";
import { cycle } from "../horizontal-radio.ts";

describe("cycle", () => {
  test("wraps both directions", () => {
    expect(cycle(3, 0, -1)).toBe(2);
    expect(cycle(3, 2, 1)).toBe(0);
    expect(cycle(3, 1, 1)).toBe(2);
    expect(cycle(2, 0, 1)).toBe(1);
  });
});
