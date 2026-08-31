#!/usr/bin/env bun
/**
 * Driver for src/items/finder — pure helpers only. finderFavorites.detect()
 * is NOT called: it compiles the Swift helper into ~/.config/envsetup first
 * (a write), and configure() rewrites the Finder sidebar.
 */
import {
  FAVORITES,
  SET_FAVORITES_SWIFT,
  expandedFavorites,
  finderFavorites,
  sameOrder,
} from "../../../finder-favorites.ts";

console.log(`FAVORITES: ${FAVORITES.join(" · ")}`);
const abs = expandedFavorites();
if (abs.some((p) => p.startsWith("~"))) throw new Error("expandedFavorites left a tilde");
console.log(`expandedFavorites → ${abs[1]} … (${abs.length})`);
console.log(
  `sameOrder(same)=${sameOrder(abs, [...abs])} sameOrder(reversed)=${sameOrder(abs, [...abs].reverse())}`,
);
const asset = await Bun.file(
  new URL("../../../assets/set-favorites.swift", import.meta.url),
).text();
console.log(
  asset === SET_FAVORITES_SWIFT
    ? "SET_FAVORITES_SWIFT === assets/set-favorites.swift ✓"
    : "WARNING: assets/set-favorites.swift differs from the embedded SET_FAVORITES_SWIFT (the item compiles the constant)",
);
console.log(
  `item ${finderFavorites.id}: kind=${finderFavorites.kind} deps=${finderFavorites.deps}`,
);
// Typecheck the asset file AND the embedded constant (the item compiles the constant);
// never run either — set-favorites rewrites the Finder sidebar.
const tmp = `${process.env.SCRATCH ?? "/tmp"}/set-favorites.embedded.swift`;
await Bun.write(tmp, SET_FAVORITES_SWIFT);
for (const [label, path] of [
  [
    "assets/set-favorites.swift",
    new URL("../../../assets/set-favorites.swift", import.meta.url).pathname,
  ],
  ["embedded SET_FAVORITES_SWIFT", tmp],
]) {
  const tc = Bun.spawnSync(["xcrun", "swiftc", "-typecheck", path]);
  if (tc.exitCode !== 0)
    throw new Error(`swiftc -typecheck ${label} failed:\n${tc.stderr.toString()}`);
  console.log(`swiftc -typecheck ${label} ✓`);
}
console.log("OK");
