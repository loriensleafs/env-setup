import { describe, expect, test } from "bun:test";
import { DependencyCycleError, toposort, UnknownDependencyError } from "../toposort.ts";

describe("toposort", () => {
  test("orders dependencies before dependents, deterministically", () => {
    const order = toposort(
      ["ghostty-config", "jetbrains-font", "homebrew", "xcode-clt"],
      new Map([
        ["ghostty-config", ["jetbrains-font"]],
        ["jetbrains-font", ["homebrew"]],
        ["homebrew", ["xcode-clt"]],
      ]),
    );
    expect(order).toEqual(["xcode-clt", "homebrew", "jetbrains-font", "ghostty-config"]);
  });

  test("independent nodes come out sorted (stable)", () => {
    expect(toposort(["c", "a", "b"], new Map())).toEqual(["a", "b", "c"]);
  });

  test("throws on cycles, naming the stuck nodes", () => {
    expect(() =>
      toposort(
        ["a", "b"],
        new Map([
          ["a", ["b"]],
          ["b", ["a"]],
        ]),
      ),
    ).toThrow(DependencyCycleError);
  });

  test("throws on unknown deps", () => {
    expect(() => toposort(["a"], new Map([["a", ["ghost"]]]))).toThrow(UnknownDependencyError);
  });
});
