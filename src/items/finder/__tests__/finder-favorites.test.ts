import { describe, expect, test } from "bun:test";
import { FAVORITES, SET_FAVORITES_SWIFT } from "../finder-favorites.ts";

describe("finder favorites", () => {
  test("decided order (Applications, Home, Desktop, Documents, Downloads, Dev, .claude)", () => {
    expect(FAVORITES).toEqual([
      "/Applications", "~", "~/Desktop", "~/Documents", "~/Downloads", "~/Dev", "~/.claude",
    ]);
  });
  test("embedded swift uses LSSharedFileList favorites API", () => {
    expect(SET_FAVORITES_SWIFT).toContain("kLSSharedFileListFavoriteItems");
    expect(SET_FAVORITES_SWIFT).toContain("LSSharedFileListInsertItemURL");
  });
});
