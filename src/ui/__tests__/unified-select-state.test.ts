import { describe, expect, test } from "bun:test";
import {
  createState,
  isVisible,
  moveCursor,
  result,
  toggleAtCursor,
  visibleRows,
  type UnifiedOption,
} from "../unified-select-state.ts";

const options: UnifiedOption[] = [
  { id: "xcode-clt", label: "Xcode CLT", section: "Required", locked: "on" },
  { id: "homebrew", label: "Homebrew", section: "Required", locked: "installed", hint: "installed 4.6.20" },
  { id: "raycast", label: "Raycast", section: "Apps" },
  { id: "ghostty", label: "Ghostty", section: "Apps" },
  { id: "jetbrains-font", label: "JetBrains Mono NF", section: "Fonts" },
  { id: "ghostty-config", label: "Ghostty config", section: "Apps", requires: ["ghostty", "jetbrains-font"] },
];

describe("createState", () => {
  test("locked-on and default options start selected; cursor lands on first interactive row", () => {
    const s = createState(options);
    expect(s.selected.has("xcode-clt")).toBe(true);
    expect(s.selected.has("raycast")).toBe(true);
    const rows = visibleRows(s);
    const row = rows[s.cursor];
    expect(row?.kind).toBe("option");
    expect(row?.kind === "option" && row.option.id).toBe("raycast");
  });

  test("initialSelected false starts unselected", () => {
    const s = createState([{ id: "a", label: "A", section: "S", initialSelected: false }]);
    expect(s.selected.has("a")).toBe(false);
  });
});

describe("visibility / live dependency filtering", () => {
  test("dependent visible when requirements met (installed and selected both satisfy)", () => {
    const s = createState(options);
    const dep = options[5] as UnifiedOption;
    expect(isVisible(s, dep)).toBe(true);
  });

  test("unselecting a requirement hides the dependent; reselecting restores it", () => {
    const s = createState(options);
    // navigate to ghostty (2nd interactive row) and toggle it off
    moveCursor(s, 1);
    toggleAtCursor(s);
    expect(s.selected.has("ghostty")).toBe(false);
    expect(visibleRows(s).some((r) => r.kind === "option" && r.option.id === "ghostty-config")).toBe(false);
    // toggle back on
    toggleAtCursor(s);
    expect(visibleRows(s).some((r) => r.kind === "option" && r.option.id === "ghostty-config")).toBe(true);
    // memory: dependent came back SELECTED (default state preserved)
    expect(result(s)).toContain("ghostty-config");
  });

  test("hidden dependents drop out of result but keep memory", () => {
    const s = createState(options);
    moveCursor(s, 1); // ghostty
    toggleAtCursor(s); // off → ghostty-config hidden
    expect(result(s)).not.toContain("ghostty-config");
    expect(s.selected.has("ghostty-config")).toBe(true); // memory intact
  });

  test("chained requirements: dependent needs ALL", () => {
    const s = createState(options);
    // unselect the font (3rd interactive: raycast → ghostty → jetbrains-font)
    moveCursor(s, 1);
    moveCursor(s, 1);
    toggleAtCursor(s);
    expect(s.selected.has("jetbrains-font")).toBe(false);
    expect(result(s)).not.toContain("ghostty-config");
  });
});

describe("cursor", () => {
  test("skips headers and locked rows, wraps around", () => {
    const s = createState(options);
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) {
      const row = visibleRows(s)[s.cursor];
      if (row?.kind === "option") ids.push(row.option.id);
      moveCursor(s, 1);
    }
    expect(ids).toEqual(["raycast", "ghostty", "jetbrains-font", "ghostty-config"]);
    const wrapped = visibleRows(s)[s.cursor];
    expect(wrapped?.kind === "option" && wrapped.option.id).toBe("raycast");
  });

  test("cursor lands on a valid row after its own row disappears", () => {
    const s = createState(options);
    // move to ghostty-config (4th interactive), then unselect ghostty via direct memory edit
    for (let i = 0; i < 3; i++) moveCursor(s, 1);
    s.selected.delete("ghostty");
    // simulate a toggle elsewhere forcing recompute: move cursor
    moveCursor(s, 1);
    const row = visibleRows(s)[s.cursor];
    expect(row?.kind).toBe("option");
  });

  test("toggle is a no-op on non-interactive states", () => {
    const s = createState([{ id: "x", label: "X", section: "S", locked: "on" }]);
    toggleAtCursor(s);
    expect(result(s)).toEqual(["x"]);
  });
});

describe("result", () => {
  test("includes locked-on, excludes installed-info rows, respects visibility", () => {
    const s = createState(options);
    const r = result(s);
    expect(r).toContain("xcode-clt");
    expect(r).not.toContain("homebrew"); // installed row is informational
    expect(r).toContain("ghostty-config");
  });
});
