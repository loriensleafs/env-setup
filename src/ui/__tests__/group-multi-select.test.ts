import { describe, expect, test } from "bun:test";
import {
  computeDisabled,
  initialSelection,
  selectionResult,
  type SelectGroups,
} from "../group-multi-select.ts";

const groups: SelectGroups = {
  Required: [
    { id: "xcode-clt", label: "Xcode CLT" },
    { id: "homebrew", label: "Homebrew", hint: "core" },
  ],
  Apps: [
    { id: "raycast", label: "Raycast" },
    { id: "ghostty", label: "Ghostty" },
    { id: "ghostty-config", label: "Ghostty config", requires: ["ghostty", "jetbrains-font"] },
    { id: "pwa", label: "Web apps", requires: ["ghostty-config"] },
  ],
  Fonts: [{ id: "jetbrains-font", label: "JetBrains Mono NF" }],
};

describe("initialSelection", () => {
  test("defaults selected", () => {
    const s = initialSelection(groups);
    expect(s.has("xcode-clt")).toBe(true);
    expect(s.has("raycast")).toBe(true);
    expect(s.has("homebrew")).toBe(true);
  });

  test("initialSelected false respected", () => {
    const s = initialSelection({ G: [{ id: "a", label: "A", initialSelected: false }] });
    expect(s.has("a")).toBe(false);
  });
});

describe("computeDisabled", () => {
  test("everything enabled when requirements are met", () => {
    const { disabled } = computeDisabled(groups, initialSelection(groups));
    expect(disabled.size).toBe(0);
  });

  test("unselecting a requirement disables the dependent with a labeled hint and strips it", () => {
    const sel = initialSelection(groups);
    sel.delete("jetbrains-font");
    const { disabled, selection } = computeDisabled(groups, sel);
    expect(disabled.get("ghostty-config")).toBe("needs JetBrains Mono NF");
    expect(selection.has("ghostty-config")).toBe(false);
  });

  test("cascades down chains (pwa needs ghostty-config needs ghostty)", () => {
    const sel = initialSelection(groups);
    sel.delete("ghostty");
    const { disabled } = computeDisabled(groups, sel);
    expect(disabled.get("ghostty-config")).toBe("needs Ghostty");
    expect(disabled.get("pwa")).toBe("needs Ghostty config");
  });

  test("selected requirements satisfy", () => {
    const g: SelectGroups = {
      A: [
        { id: "homebrew", label: "Homebrew" },
        { id: "jq", label: "jq", requires: ["homebrew"] },
      ],
    };
    const { disabled } = computeDisabled(g, initialSelection(g));
    expect(disabled.size).toBe(0);
  });

  test("multiple missing requirements listed together", () => {
    const sel = initialSelection(groups);
    sel.delete("ghostty");
    sel.delete("jetbrains-font");
    const { disabled } = computeDisabled(groups, sel);
    expect(disabled.get("ghostty-config")).toBe("needs Ghostty + JetBrains Mono NF");
  });
});

describe("selectionResult", () => {
  test("disabled excluded, selected included", () => {
    const sel = initialSelection(groups);
    sel.delete("jetbrains-font");
    const r = selectionResult(groups, sel);
    expect(r).toContain("xcode-clt");
    expect(r).toContain("homebrew");
    expect(r).not.toContain("ghostty-config");
    expect(r).toContain("raycast");
  });

  test("reselecting a requirement restores the dependent (memory preserved)", () => {
    const sel = initialSelection(groups);
    sel.delete("ghostty"); // ghostty-config disabled + stripped from live view
    expect(selectionResult(groups, sel)).not.toContain("ghostty-config");
    sel.add("ghostty"); // memory in `sel` still has ghostty-config
    expect(selectionResult(groups, sel)).toContain("ghostty-config");
  });
});
