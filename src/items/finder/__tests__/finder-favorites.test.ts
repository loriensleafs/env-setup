import { describe, expect, test } from "bun:test";
import { FAVORITES, SET_FAVORITES_SWIFT } from "../finder-favorites.ts";

describe("finder favorites", () => {
  test("decided order (Applications, Home, Desktop, Documents, Downloads, Dev, .claude)", () => {
    expect(FAVORITES).toEqual([
      "/Applications", "~", "~/Desktop", "~/Documents", "~/Downloads", "~/Dev", "~/.claude",
    ]);
  });
  test("embedded swift uses dlsym LSSharedFileList with OpaquePointer sentinel", () => {
    expect(SET_FAVORITES_SWIFT).toContain("kLSSharedFileListFavoriteItems");
    expect(SET_FAVORITES_SWIFT).toContain("LSSharedFileListInsertItemURL");
    expect(SET_FAVORITES_SWIFT).toContain("OpaquePointer"); // the segfault fix
    expect(SET_FAVORITES_SWIFT).toContain("dlopen");
  });
});
