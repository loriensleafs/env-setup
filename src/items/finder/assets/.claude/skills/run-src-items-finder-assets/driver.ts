#!/usr/bin/env bun
/**
 * Driver for src/items/finder/assets — TYPECHECK ONLY. set-favorites.swift
 * REWRITES the Finder sidebar when run, so this driver never executes it.
 */
import { SET_FAVORITES_SWIFT } from "../../../../finder-favorites.ts";

const swift = new URL("../../../set-favorites.swift", import.meta.url).pathname;
const r = Bun.spawnSync(["xcrun", "swiftc", "-typecheck", swift]);
if (r.exitCode !== 0) throw new Error(`typecheck failed:\n${r.stderr.toString()}`);
console.log("swiftc -typecheck set-favorites.swift ✓");
// The item compiles the EMBEDDED constant (finder-favorites.ts), not this file —
// typecheck that too, and report (don't fail on) drift between the two.
const embedded = `${process.env.SCRATCH ?? "/tmp"}/set-favorites.embedded.swift`;
await Bun.write(embedded, SET_FAVORITES_SWIFT);
const r2 = Bun.spawnSync(["xcrun", "swiftc", "-typecheck", embedded]);
if (r2.exitCode !== 0)
  throw new Error(`embedded constant typecheck failed:\n${r2.stderr.toString()}`);
console.log("swiftc -typecheck of the embedded SET_FAVORITES_SWIFT constant ✓");
const same = (await Bun.file(swift).text()) === SET_FAVORITES_SWIFT;
console.log(
  same
    ? "asset file is byte-identical to the embedded constant ✓"
    : "WARNING: assets/set-favorites.swift differs from the embedded SET_FAVORITES_SWIFT (the item ships the constant)",
);
